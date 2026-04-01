'use client';

import { useState, useEffect } from 'react';
import { db, Expense, Budget } from '@/lib/db/dexie';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
} from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/config';
import { useAuth } from './useAuth';
import { useHousehold } from './useHousehold';

export function useExpenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { currentHousehold } = useHousehold();

    // Load expenses from IndexedDB
    useEffect(() => {
        const loadExpenses = async () => {
            if (!currentHousehold) {
                setLoading(false);
                return;
            }

            const localExpenses = await db.expenses
                .where('householdId')
                .equals(currentHousehold.firebaseId || '')
                .toArray();
            setExpenses(localExpenses);

            const localBudgets = await db.budgets
                .where('householdId')
                .equals(currentHousehold.firebaseId || '')
                .toArray();
            setBudgets(localBudgets);

            setLoading(false);
        };

        loadExpenses();
    }, [currentHousehold]);

    // Sync expenses with Firebase
    useEffect(() => {
        if (!user || !currentHousehold || !firestore) return;

        const q = query(
            collection(firestore, 'expenses'),
            where('householdId', '==', currentHousehold.firebaseId)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // Process all changes sequentially to avoid race conditions
            await Promise.all(snapshot.docChanges().map(async (change) => {
                const data = change.doc.data();
                const expense: Expense = {
                    firebaseId: change.doc.id,
                    householdId: data.householdId,
                    amount: data.amount,
                    currency: data.currency,
                    category: data.category,
                    description: data.description,
                    date: data.date,
                    paidBy: data.paidBy,
                    splitWith: data.splitWith,
                    receiptUrl: data.receiptUrl,
                    recurring: data.recurring,
                    tags: data.tags,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    syncStatus: 'synced',
                };

                if (change.type === 'added' || change.type === 'modified') {
                    const existing = await db.expenses.where('firebaseId').equals(change.doc.id).first();
                    if (existing && existing.id) {
                        await db.expenses.update(existing.id, expense);
                    } else {
                        await db.expenses.add(expense);
                    }
                } else if (change.type === 'removed') {
                    await db.expenses.where('firebaseId').equals(change.doc.id).delete();
                }
            }));

            const localExpenses = await db.expenses
                .where('householdId')
                .equals(currentHousehold.firebaseId || '')
                .toArray();
            setExpenses(localExpenses);
        });

        return unsubscribe;
    }, [user, currentHousehold]);

    // Sync budgets with Firebase
    useEffect(() => {
        if (!user || !currentHousehold || !firestore) return;

        const q = query(
            collection(firestore, 'budgets'),
            where('householdId', '==', currentHousehold.firebaseId)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // Process all changes sequentially to avoid race conditions
            await Promise.all(snapshot.docChanges().map(async (change) => {
                const data = change.doc.data();
                const budget: Budget = {
                    firebaseId: change.doc.id,
                    householdId: data.householdId,
                    category: data.category,
                    amount: data.amount,
                    period: data.period,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    alerts: data.alerts,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    syncStatus: 'synced',
                };

                if (change.type === 'added' || change.type === 'modified') {
                    const existing = await db.budgets.where('firebaseId').equals(change.doc.id).first();
                    if (existing && existing.id) {
                        await db.budgets.update(existing.id, budget);
                    } else {
                        await db.budgets.add(budget);
                    }
                } else if (change.type === 'removed') {
                    await db.budgets.where('firebaseId').equals(change.doc.id).delete();
                }
            }));

            const localBudgets = await db.budgets
                .where('householdId')
                .equals(currentHousehold.firebaseId || '')
                .toArray();
            setBudgets(localBudgets);
        });

        return unsubscribe;
    }, [user, currentHousehold]);

    const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'householdId' | 'firebaseId' | 'paidBy'>) => {
        if (!currentHousehold || !user) throw new Error('No household selected or user not authenticated');

        const now = new Date().toISOString();
        const newExpense: Expense = {
            ...expense,
            householdId: currentHousehold.firebaseId || '',
            paidBy: user.uid,
            createdAt: now,
            updatedAt: now,
            syncStatus: 'pending',
        };

        const id = await db.expenses.add(newExpense);

        if (firestore) {
            try {
                const docRef = await addDoc(collection(firestore, 'expenses'), newExpense);
                await db.expenses.update(id, { firebaseId: docRef.id, syncStatus: 'synced' });
            } catch (error) {
                console.error('Error syncing expense to Firebase:', error);
                await db.expenses.update(id, { syncStatus: 'error' });
            }
        }

        const updatedExpenses = await db.expenses
            .where('householdId')
            .equals(currentHousehold.firebaseId || '')
            .toArray();
        setExpenses(updatedExpenses);
    };

    const updateExpense = async (id: number, updates: Partial<Expense>) => {
        const expense = await db.expenses.get(id);
        if (!expense) return;

        const updatedExpense = {
            ...updates,
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending' as const,
        };

        await db.expenses.update(id, updatedExpense);

        if (expense.firebaseId && firestore) {
            try {
                const docRef = doc(firestore, 'expenses', expense.firebaseId);
                await updateDoc(docRef, { ...updatedExpense, syncStatus: 'synced' });
                await db.expenses.update(id, { syncStatus: 'synced' });
            } catch (error) {
                console.error('Error syncing expense to Firebase:', error);
                await db.expenses.update(id, { syncStatus: 'error' });
            }
        }

        const updatedExpenses = await db.expenses
            .where('householdId')
            .equals(currentHousehold?.firebaseId || '')
            .toArray();
        setExpenses(updatedExpenses);
    };

    const deleteExpense = async (id: number) => {
        const expense = await db.expenses.get(id);
        if (!expense) return;

        await db.expenses.delete(id);

        if (expense.firebaseId && firestore) {
            try {
                await deleteDoc(doc(firestore, 'expenses', expense.firebaseId));
            } catch (error) {
                console.error('Error deleting expense from Firebase:', error);
            }
        }

        const updatedExpenses = await db.expenses
            .where('householdId')
            .equals(currentHousehold?.firebaseId || '')
            .toArray();
        setExpenses(updatedExpenses);
    };

    const addBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'householdId' | 'firebaseId'>) => {
        if (!currentHousehold) throw new Error('No household selected');

        const now = new Date().toISOString();
        const newBudget: Budget = {
            ...budget,
            householdId: currentHousehold.firebaseId || '',
            createdAt: now,
            updatedAt: now,
            syncStatus: 'pending',
        };

        const id = await db.budgets.add(newBudget);

        if (firestore) {
            try {
                const docRef = await addDoc(collection(firestore, 'budgets'), newBudget);
                await db.budgets.update(id, { firebaseId: docRef.id, syncStatus: 'synced' });
            } catch (error) {
                console.error('Error syncing budget to Firebase:', error);
                await db.budgets.update(id, { syncStatus: 'error' });
            }
        }

        const updatedBudgets = await db.budgets
            .where('householdId')
            .equals(currentHousehold.firebaseId || '')
            .toArray();
        setBudgets(updatedBudgets);
    };

    const updateBudget = async (id: number, updates: Partial<Budget>) => {
        const budget = await db.budgets.get(id);
        if (!budget) return;

        const updatedBudget = {
            ...updates,
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending' as const,
        };

        await db.budgets.update(id, updatedBudget);

        if (budget.firebaseId && firestore) {
            try {
                const docRef = doc(firestore, 'budgets', budget.firebaseId);
                await updateDoc(docRef, { ...updatedBudget, syncStatus: 'synced' });
                await db.budgets.update(id, { syncStatus: 'synced' });
            } catch (error) {
                console.error('Error syncing budget to Firebase:', error);
                await db.budgets.update(id, { syncStatus: 'error' });
            }
        }

        const updatedBudgets = await db.budgets
            .where('householdId')
            .equals(currentHousehold?.firebaseId || '')
            .toArray();
        setBudgets(updatedBudgets);
    };

    const deleteBudget = async (id: number) => {
        const budget = await db.budgets.get(id);
        if (!budget) return;

        await db.budgets.delete(id);

        if (budget.firebaseId && firestore) {
            try {
                await deleteDoc(doc(firestore, 'budgets', budget.firebaseId));
            } catch (error) {
                console.error('Error deleting budget from Firebase:', error);
            }
        }

        const updatedBudgets = await db.budgets
            .where('householdId')
            .equals(currentHousehold?.firebaseId || '')
            .toArray();
        setBudgets(updatedBudgets);
    };

    const getExpenses = (filters?: {
        category?: Expense['category'];
        startDate?: string;
        endDate?: string;
        paidBy?: string;
    }) => {
        let filtered = expenses;

        if (filters?.category) {
            filtered = filtered.filter(expense => expense.category === filters.category);
        }
        if (filters?.startDate) {
            filtered = filtered.filter(expense => expense.date >= filters.startDate!);
        }
        if (filters?.endDate) {
            filtered = filtered.filter(expense => expense.date <= filters.endDate!);
        }
        if (filters?.paidBy) {
            filtered = filtered.filter(expense => expense.paidBy === filters.paidBy);
        }

        return filtered;
    };

    const checkBudgetStatus = (category: string, period: Budget['period']) => {
        const budget = budgets.find(b => b.category === category && b.period === period);
        if (!budget) return null;

        const categoryExpenses = expenses.filter(e => e.category === category);
        const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
        const percentage = (totalSpent / budget.amount) * 100;

        return {
            budget,
            totalSpent,
            remaining: budget.amount - totalSpent,
            percentage,
            isOverBudget: totalSpent > budget.amount,
            shouldAlert: budget.alerts.enabled && percentage >= budget.alerts.threshold,
        };
    };

    return {
        expenses,
        budgets,
        loading,
        addExpense,
        updateExpense,
        deleteExpense,
        addBudget,
        updateBudget,
        deleteBudget,
        getExpenses,
        checkBudgetStatus,
    };
}
