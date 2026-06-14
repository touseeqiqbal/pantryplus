'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { motion } from 'framer-motion';

export default function HouseholdSetup() {
    const [householdName, setHouseholdName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, loading: authLoading } = useAuth();
    const { createHousehold, currentHousehold } = useHousehold();
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return; // wait for auth to resolve before redirecting
        if (!user) {
            router.push('/auth/signin');
        } else if (currentHousehold) {
            router.push('/dashboard');
        }
    }, [user, currentHousehold, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await createHousehold(householdName);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create household');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user || currentHousehold) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full"
            >
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome to PantryPlus! 🏠
                        </h1>
                        <p className="text-gray-600">
                            Let's set up your household to get started
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="householdName" className="block text-sm font-medium text-gray-700 mb-2">
                                Household Name
                            </label>
                            <input
                                id="householdName"
                                type="text"
                                value={householdName}
                                onChange={(e) => setHouseholdName(e.target.value)}
                                required
                                placeholder="e.g., Smith Family, Our Home"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                This will be visible to all household members
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {loading ? 'Creating...' : 'Create Household'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an invitation?{' '}
                            <button
                                onClick={() => router.push('/household/join')}
                                className="text-indigo-600 hover:text-indigo-700 font-semibold"
                            >
                                Join a household
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
