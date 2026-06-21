'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { db, Business, Branch, Staff } from '@/lib/db/dexie';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/config';
import { useAuth } from './useAuth';

interface BusinessContextType {
  currentBusiness: Business | null;
  currentBranch: Branch | null;
  businesses: Business[];
  branches: Branch[];
  loading: boolean;
  createBusiness: (name: string, type: Business['type']) => Promise<string>;
  switchBusiness: (businessId: string) => Promise<void>;
  switchBranch: (branchId: string) => Promise<void>;
  createBranch: (name: string, address?: string) => Promise<string>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load businesses from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const localBusinesses = await db.businesses.toArray();
      setBusinesses(localBusinesses);

      const savedBusinessId = localStorage.getItem('currentBusinessId');
      if (savedBusinessId) {
        const business = localBusinesses.find(b => b.firebaseId === savedBusinessId);
        if (business) {
          setCurrentBusiness(business);
          // Load branches for this business
          const bList = await db.branches.where('businessId').equals(business.firebaseId || '').toArray();
          setBranches(bList);
          
          const savedBranchId = localStorage.getItem('currentBranchId');
          const branch = bList.find(br => br.firebaseId === savedBranchId);
          if (branch) setCurrentBranch(branch);
          else if (bList.length > 0) setCurrentBranch(bList[0]);
        }
      } else if (localBusinesses.length > 0) {
        setCurrentBusiness(localBusinesses[0]);
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  // Sync businesses where user is owner or staff
  // (Simplified for MVP: Query businesses owned by user)
  useEffect(() => {
    if (!user || !firestore) return;

    const q = query(
      collection(firestore, 'businesses'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      await Promise.all(snapshot.docChanges().map(async (change) => {
        const data = change.doc.data();
        const business: Business = {
          firebaseId: change.doc.id,
          name: data.name,
          type: data.type,
          ownerId: data.ownerId,
          settings: data.settings || {
            currency: 'USD',
            timezone: 'UTC',
            lowStockThreshold: 10,
            defaultTaxRate: 0,
          },
          createdAt: data.createdAt,
          syncStatus: 'synced',
        };

        if (change.type === 'added' || change.type === 'modified') {
          // Reconcile by firebaseId so the realtime echo updates the existing
          // local row instead of inserting a duplicate (put() with no primary
          // key always inserts a new row).
          const existing = await db.businesses.where('firebaseId').equals(change.doc.id).first();
          if (existing?.id != null) {
            await db.businesses.update(existing.id, business);
          } else {
            await db.businesses.add(business);
          }
        } else if (change.type === 'removed') {
          await db.businesses.where('firebaseId').equals(change.doc.id).delete();
        }
      }));

      const localBusinesses = await db.businesses.toArray();
      setBusinesses(localBusinesses);
    });

    return unsubscribe;
  }, [user]);

  const createBusiness = async (name: string, type: Business['type']): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    const business: Omit<Business, 'id' | 'firebaseId'> = {
      name,
      type,
      ownerId: user.uid,
      settings: {
        currency: 'USD',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lowStockThreshold: 10,
        defaultTaxRate: 0,
      },
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    const localId = await db.businesses.add(business as Business);

    if (firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'businesses'), business);
        await db.businesses.update(localId, { firebaseId: docRef.id, syncStatus: 'synced' });
        const updated = await db.businesses.get(localId);
        if (updated) {
          setCurrentBusiness(updated);
          localStorage.setItem('currentBusinessId', docRef.id);
        }
        return docRef.id;
      } catch (error) {
        console.error('Error syncing business to Firebase:', error);
        await db.businesses.update(localId, { syncStatus: 'error' });
      }
    }

    // Offline / no Firestore: still activate the locally-created business.
    const localBusiness = await db.businesses.get(localId);
    if (localBusiness) {
      setCurrentBusiness(localBusiness);
      localStorage.setItem('currentBusinessId', String(localId));
    }
    return localId.toString();
  };

  const switchBusiness = async (businessId: string) => {
    const business = businesses.find(b => b.firebaseId === businessId);
    if (business) {
      setCurrentBusiness(business);
      localStorage.setItem('currentBusinessId', businessId);
      const bList = await db.branches.where('businessId').equals(businessId).toArray();
      setBranches(bList);
      if (bList.length > 0) {
        setCurrentBranch(bList[0]);
        localStorage.setItem('currentBranchId', bList[0].firebaseId || '');
      } else {
        setCurrentBranch(null);
        localStorage.removeItem('currentBranchId');
      }
    }
  };

  const switchBranch = async (branchId: string) => {
    const branch = branches.find(b => b.firebaseId === branchId);
    if (branch) {
      setCurrentBranch(branch);
      localStorage.setItem('currentBranchId', branchId);
    }
  };

  const createBranch = async (name: string, address?: string): Promise<string> => {
    if (!currentBusiness || !user) throw new Error('Context missing');

    const branch: Omit<Branch, 'id' | 'firebaseId'> = {
      businessId: currentBusiness.firebaseId || '',
      name,
      address: address || '',
      managerId: user.uid,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    const localId = await db.branches.add(branch as Branch);
    if (firestore) {
      const docRef = await addDoc(collection(firestore, 'branches'), branch);
      await db.branches.update(localId, { firebaseId: docRef.id, syncStatus: 'synced' });
      const updated = await db.branches.get(localId);
      if (updated) setCurrentBranch(updated);
      return docRef.id;
    }
    return localId.toString();
  };

  return (
    <BusinessContext.Provider
      value={{
        currentBusiness,
        currentBranch,
        businesses,
        branches,
        loading,
        createBusiness,
        switchBusiness,
        switchBranch,
        createBranch,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
