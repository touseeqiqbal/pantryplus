'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { db, Household, HouseholdMember, Invitation } from '@/lib/db/dexie';
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

interface HouseholdContextType {
    currentHousehold: Household | null;
    households: Household[];
    invitations: Invitation[];
    loading: boolean;
    createHousehold: (name: string, settings?: Partial<Household['settings']>) => Promise<string>;
    switchHousehold: (householdId: string) => Promise<void>;
    inviteMember: (email: string) => Promise<void>;
    removeMember: (userId: string) => Promise<void>;
    updateHouseholdSettings: (settings: Partial<Household['settings']>) => Promise<void>;
    acceptInvitation: (invitationId: string) => Promise<void>;
    declineInvitation: (invitationId: string) => Promise<void>;
    leaveHousehold: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export function HouseholdProvider({ children }: { children: ReactNode }) {
    const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
    const [households, setHouseholds] = useState<Household[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Load households from IndexedDB on mount
    useEffect(() => {
        const loadHouseholds = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            const localHouseholds = await db.households.toArray();
            setHouseholds(localHouseholds);

            // Get current household from localStorage or use first household
            const savedHouseholdId = localStorage.getItem('currentHouseholdId');
            if (savedHouseholdId) {
                const household = localHouseholds.find(h => h.firebaseId === savedHouseholdId);
                if (household) {
                    setCurrentHousehold(household);
                } else if (localHouseholds.length > 0) {
                    setCurrentHousehold(localHouseholds[0]);
                    localStorage.setItem('currentHouseholdId', localHouseholds[0].firebaseId || '');
                }
            } else if (localHouseholds.length > 0) {
                setCurrentHousehold(localHouseholds[0]);
                localStorage.setItem('currentHouseholdId', localHouseholds[0].firebaseId || '');
            }

            setLoading(false);
        };

        loadHouseholds();
    }, [user]);

    // Sync households from Firebase
    useEffect(() => {
        if (!user || !firestore) return;

        // Query households where the user is a member
        // We need to query by a memberIds array field instead of array-contains with objects
        const q = query(
            collection(firestore, 'households'),
            where('memberIds', 'array-contains', user.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // Process all changes sequentially to avoid race conditions
            await Promise.all(snapshot.docChanges().map(async (change) => {
                const data = change.doc.data();
                const household: Household = {
                    firebaseId: change.doc.id,
                    name: data.name,
                    createdBy: data.createdBy,
                    createdAt: data.createdAt,
                    members: data.members,
                    settings: data.settings || {
                        currency: 'USD',
                        timezone: 'UTC',
                        notifications: true,
                    },
                    syncStatus: 'synced',
                };

                if (change.type === 'added' || change.type === 'modified') {
                    const existingHousehold = await db.households
                        .where('firebaseId')
                        .equals(change.doc.id)
                        .first();

                    if (existingHousehold && existingHousehold.id) {
                        await db.households.update(existingHousehold.id, {
                            name: household.name,
                            createdBy: household.createdBy,
                            createdAt: household.createdAt,
                            members: household.members,
                            settings: household.settings,
                            syncStatus: household.syncStatus,
                        });
                    } else {
                        await db.households.add(household);
                    }
                } else if (change.type === 'removed') {
                    await db.households.where('firebaseId').equals(change.doc.id).delete();
                }
            }));

            const localHouseholds = await db.households.toArray();
            setHouseholds(localHouseholds);
        });

        return unsubscribe;
    }, [user]);

    // Sync invitations from Firebase
    useEffect(() => {
        if (!user || !firestore) return;

        const q = query(
            collection(firestore, 'invitations'),
            where('invitedEmail', '==', user.email),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const invites: Invitation[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                invites.push({
                    firebaseId: doc.id,
                    householdId: data.householdId,
                    householdName: data.householdName,
                    invitedBy: data.invitedBy,
                    invitedEmail: data.invitedEmail,
                    status: data.status,
                    createdAt: data.createdAt,
                    expiresAt: data.expiresAt,
                    syncStatus: 'synced',
                });
            });

            setInvitations(invites);

            // Also save to IndexedDB
            for (const invite of invites) {
                const existing = await db.invitations
                    .where('firebaseId')
                    .equals(invite.firebaseId || '')
                    .first();

                if (existing && existing.id) {
                    await db.invitations.update(existing.id, invite);
                } else {
                    await db.invitations.add(invite);
                }
            }
        });

        return unsubscribe;
    }, [user]);

    const createHousehold = async (
        name: string,
        settings?: Partial<Household['settings']>
    ): Promise<string> => {
        if (!user) throw new Error('User not authenticated');

        const now = new Date().toISOString();
        const newHousehold: Omit<Household, 'id' | 'firebaseId'> = {
            name,
            createdBy: user.uid,
            createdAt: now,
            members: [
                {
                    userId: user.uid,
                    email: user.email || '',
                    role: 'owner',
                    joinedAt: now,
                },
            ],
            settings: {
                currency: settings?.currency || 'USD',
                timezone: settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                notifications: settings?.notifications ?? true,
            },
            syncStatus: 'pending',
        };

        // Add to IndexedDB
        const localId = await db.households.add(newHousehold as Household);

        // Sync to Firebase
        if (firestore) {
            try {
                const docRef = await addDoc(collection(firestore, 'households'), {
                    ...newHousehold,
                    userId: user.uid,
                    memberIds: [user.uid], // Add memberIds array for querying
                });

                // Update local with Firebase ID
                await db.households.update(localId, {
                    firebaseId: docRef.id,
                    syncStatus: 'synced',
                });

                // Set as current household
                const updatedHousehold = await db.households.get(localId);
                if (updatedHousehold) {
                    setCurrentHousehold(updatedHousehold);
                    localStorage.setItem('currentHouseholdId', docRef.id);
                }

                return docRef.id;
            } catch (error) {
                console.error('Error syncing household to Firebase:', error);
                await db.households.update(localId, { syncStatus: 'error' });
                throw error;
            }
        }

        return localId.toString();
    };

    const switchHousehold = async (householdId: string) => {
        const household = households.find((h) => h.firebaseId === householdId);
        if (household) {
            setCurrentHousehold(household);
            localStorage.setItem('currentHouseholdId', householdId);
        }
    };

    const inviteMember = async (email: string) => {
        if (!user || !currentHousehold || !firestore) {
            throw new Error('Cannot invite member');
        }

        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

        const invitation: Omit<Invitation, 'id' | 'firebaseId'> = {
            householdId: currentHousehold.firebaseId || '',
            householdName: currentHousehold.name,
            invitedBy: user.uid,
            invitedEmail: email,
            status: 'pending',
            createdAt: now,
            expiresAt,
            syncStatus: 'pending',
        };

        await addDoc(collection(firestore, 'invitations'), invitation);
    };

    const removeMember = async (userId: string) => {
        if (!user || !currentHousehold || !firestore) {
            throw new Error('Cannot remove member');
        }

        // Check if user is owner or admin
        const currentMember = currentHousehold.members.find((m) => m.userId === user.uid);
        if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
            throw new Error('Insufficient permissions');
        }

        const updatedMembers = currentHousehold.members.filter((m) => m.userId !== userId);
        const updatedMemberIds = updatedMembers.map(m => m.userId);

        const docRef = doc(firestore, 'households', currentHousehold.firebaseId || '');
        await updateDoc(docRef, {
            members: updatedMembers,
            memberIds: updatedMemberIds
        });
    };

    const updateHouseholdSettings = async (settings: Partial<Household['settings']>) => {
        if (!currentHousehold || !firestore) {
            throw new Error('No current household');
        }

        const updatedSettings = {
            ...currentHousehold.settings,
            ...settings,
        };

        const docRef = doc(firestore, 'households', currentHousehold.firebaseId || '');
        await updateDoc(docRef, { settings: updatedSettings });
    };

    const acceptInvitation = async (invitationId: string) => {
        if (!user || !firestore) throw new Error('User not authenticated');

        const invitation = invitations.find((inv) => inv.firebaseId === invitationId);
        if (!invitation) throw new Error('Invitation not found');

        // Add user to household members
        const householdRef = doc(firestore, 'households', invitation.householdId);
        const householdDoc = await getDocs(query(collection(firestore, 'households'), where('__name__', '==', invitation.householdId)));

        if (!householdDoc.empty) {
            const householdData = householdDoc.docs[0].data();
            const newMember = {
                userId: user.uid,
                email: user.email || '',
                role: 'member' as const,
                joinedAt: new Date().toISOString(),
            };
            const updatedMembers = [...householdData.members, newMember];
            const updatedMemberIds = updatedMembers.map(m => m.userId);

            await updateDoc(householdRef, {
                members: updatedMembers,
                memberIds: updatedMemberIds
            });
        }

        // Update invitation status
        const invitationRef = doc(firestore, 'invitations', invitationId);
        await updateDoc(invitationRef, { status: 'accepted' });
    };

    const declineInvitation = async (invitationId: string) => {
        if (!firestore) throw new Error('Firebase not initialized');

        const invitationRef = doc(firestore, 'invitations', invitationId);
        await updateDoc(invitationRef, { status: 'declined' });
    };

    const leaveHousehold = async () => {
        if (!user || !currentHousehold || !firestore) {
            throw new Error('Cannot leave household');
        }

        const currentMember = currentHousehold.members.find((m) => m.userId === user.uid);
        if (currentMember?.role === 'owner') {
            throw new Error('Owner cannot leave household. Transfer ownership first.');
        }

        const updatedMembers = currentHousehold.members.filter((m) => m.userId !== user.uid);
        const updatedMemberIds = updatedMembers.map(m => m.userId);

        const docRef = doc(firestore, 'households', currentHousehold.firebaseId || '');
        await updateDoc(docRef, {
            members: updatedMembers,
            memberIds: updatedMemberIds
        });

        // Remove from local storage
        if (currentHousehold.id) {
            await db.households.delete(currentHousehold.id);
        }

        // Switch to another household if available
        const remainingHouseholds = households.filter(
            (h) => h.firebaseId !== currentHousehold.firebaseId
        );
        if (remainingHouseholds.length > 0) {
            await switchHousehold(remainingHouseholds[0].firebaseId || '');
        } else {
            setCurrentHousehold(null);
            localStorage.removeItem('currentHouseholdId');
        }
    };

    return (
        <HouseholdContext.Provider
            value={{
                currentHousehold,
                households,
                invitations,
                loading,
                createHousehold,
                switchHousehold,
                inviteMember,
                removeMember,
                updateHouseholdSettings,
                acceptInvitation,
                declineInvitation,
                leaveHousehold,
            }}
        >
            {children}
        </HouseholdContext.Provider>
    );
}

export function useHousehold() {
    const context = useContext(HouseholdContext);
    if (context === undefined) {
        throw new Error('useHousehold must be used within a HouseholdProvider');
    }
    return context;
}
