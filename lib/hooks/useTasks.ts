'use client';

import { useState, useEffect } from 'react';
import { db, Task } from '@/lib/db/dexie';
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

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { currentHousehold } = useHousehold();

    // Load tasks from IndexedDB
    useEffect(() => {
        const loadTasks = async () => {
            if (!currentHousehold) {
                setLoading(false);
                return;
            }

            const localTasks = await db.tasks
                .where('householdId')
                .equals(currentHousehold.firebaseId || '')
                .toArray();
            setTasks(localTasks);
            setLoading(false);
        };

        loadTasks();
    }, [currentHousehold]);

    // Sync with Firebase
    useEffect(() => {
        if (!user || !currentHousehold || !firestore) return;

        const q = query(
            collection(firestore, 'tasks'),
            where('householdId', '==', currentHousehold.firebaseId)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // Process all changes sequentially to avoid race conditions
            await Promise.all(snapshot.docChanges().map(async (change) => {
                const data = change.doc.data();
                const task: Task = {
                    firebaseId: change.doc.id,
                    householdId: data.householdId,
                    title: data.title,
                    description: data.description,
                    points: data.points,
                    category: data.category,
                    assignedTo: data.assignedTo,
                    createdBy: data.createdBy,
                    priority: data.priority,
                    dueDate: data.dueDate,
                    recurring: data.recurring,
                    status: data.status,
                    completedAt: data.completedAt,
                    completedBy: data.completedBy,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    syncStatus: 'synced',
                };

                if (change.type === 'added' || change.type === 'modified') {
                    const existing = await db.tasks.where('firebaseId').equals(change.doc.id).first();
                    if (existing && existing.id) {
                        await db.tasks.update(existing.id, task);
                    } else {
                        await db.tasks.add(task);
                    }
                } else if (change.type === 'removed') {
                    await db.tasks.where('firebaseId').equals(change.doc.id).delete();
                }
            }));

            const localTasks = await db.tasks
                .where('householdId')
                .equals(currentHousehold.firebaseId || '')
                .toArray();
            setTasks(localTasks);
        });

        return unsubscribe;
    }, [user, currentHousehold]);

    const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'householdId' | 'firebaseId' | 'createdBy'>) => {
        if (!currentHousehold || !user) throw new Error('No household selected or user not authenticated');

        const now = new Date().toISOString();
        const newTask: Task = {
            ...task,
            householdId: currentHousehold.firebaseId || '',
            createdBy: user.uid,
            createdAt: now,
            updatedAt: now,
            syncStatus: 'pending',
        };

        const id = await db.tasks.add(newTask);

        if (firestore) {
            try {
                const docRef = await addDoc(collection(firestore, 'tasks'), newTask);
                await db.tasks.update(id, { firebaseId: docRef.id, syncStatus: 'synced' });
            } catch (error) {
                console.error('Error syncing task to Firebase:', error);
                await db.tasks.update(id, { syncStatus: 'error' });
            }
        }

        const updatedTasks = await db.tasks
            .where('householdId')
            .equals(currentHousehold.firebaseId || '')
            .toArray();
        setTasks(updatedTasks);
    };

    const updateTask = async (id: number, updates: Partial<Task>) => {
        const task = await db.tasks.get(id);
        if (!task) return;

        const updatedTask = {
            ...updates,
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending' as const,
        };

        await db.tasks.update(id, updatedTask);

        if (task.firebaseId && firestore) {
            try {
                const docRef = doc(firestore, 'tasks', task.firebaseId);
                await updateDoc(docRef, { ...updatedTask, syncStatus: 'synced' });
                await db.tasks.update(id, { syncStatus: 'synced' });
            } catch (error) {
                console.error('Error syncing task to Firebase:', error);
                await db.tasks.update(id, { syncStatus: 'error' });
            }
        }

        const updatedTasks = await db.tasks
            .where('householdId')
            .equals(currentHousehold?.firebaseId || '')
            .toArray();
        setTasks(updatedTasks);
    };

    const completeTask = async (id: number) => {
        if (!user) throw new Error('User not authenticated');

        await updateTask(id, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            completedBy: user.uid,
        });
    };

    const deleteTask = async (id: number) => {
        const task = await db.tasks.get(id);
        if (!task) return;

        await db.tasks.delete(id);

        if (task.firebaseId && firestore) {
            try {
                await deleteDoc(doc(firestore, 'tasks', task.firebaseId));
            } catch (error) {
                console.error('Error deleting task from Firebase:', error);
            }
        }

        const updatedTasks = await db.tasks
            .where('householdId')
            .equals(currentHousehold?.firebaseId || '')
            .toArray();
        setTasks(updatedTasks);
    };

    const getMyTasks = () => {
        if (!user) return [];
        return tasks.filter(task => task.assignedTo === user.uid && task.status !== 'completed');
    };

    const getTasks = (filters?: {
        status?: Task['status'];
        assignedTo?: string;
        category?: Task['category'];
        priority?: Task['priority'];
    }) => {
        let filtered = tasks;

        if (filters?.status) {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        if (filters?.assignedTo) {
            filtered = filtered.filter(task => task.assignedTo === filters.assignedTo);
        }
        if (filters?.category) {
            filtered = filtered.filter(task => task.category === filters.category);
        }
        if (filters?.priority) {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }

        return filtered;
    };

    return {
        tasks,
        loading,
        addTask,
        updateTask,
        completeTask,
        deleteTask,
        getMyTasks,
        getTasks,
    };
}
