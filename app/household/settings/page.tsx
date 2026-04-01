'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HouseholdSettings() {
    const [mounted, setMounted] = useState(false);
    const [currency, setCurrency] = useState('USD');
    const [timezone, setTimezone] = useState('UTC');
    const [notifications, setNotifications] = useState(true);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { user } = useAuth();
    const { currentHousehold, updateHouseholdSettings } = useHousehold();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!user && mounted) {
            router.push('/auth/signin');
        }
    }, [user, mounted, router]);

    useEffect(() => {
        if (currentHousehold) {
            setCurrency(currentHousehold.settings.currency);
            setTimezone(currentHousehold.settings.timezone);
            setNotifications(currentHousehold.settings.notifications);
        }
    }, [currentHousehold]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            await updateHouseholdSettings({
                currency,
                timezone,
                notifications,
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating settings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted || !user || !currentHousehold) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/dashboard" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            PantryPlus
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Household Settings
                        </h2>
                        <Link
                            href="/household/members"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                        >
                            Manage Members
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            {currentHousehold.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {currentHousehold.members.length} member{currentHousehold.members.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
                            Settings updated successfully!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Currency
                            </label>
                            <select
                                id="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="JPY">JPY (¥)</option>
                                <option value="CAD">CAD ($)</option>
                                <option value="AUD">AUD ($)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Timezone
                            </label>
                            <select
                                id="timezone"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time</option>
                                <option value="America/Chicago">Central Time</option>
                                <option value="America/Denver">Mountain Time</option>
                                <option value="America/Los_Angeles">Pacific Time</option>
                                <option value="Europe/London">London</option>
                                <option value="Europe/Paris">Paris</option>
                                <option value="Asia/Tokyo">Tokyo</option>
                                <option value="Asia/Kolkata">India</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label htmlFor="notifications" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Notifications
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Receive alerts for expiring items, tasks, and budgets
                                </p>
                            </div>
                            <input
                                id="notifications"
                                type="checkbox"
                                checked={notifications}
                                onChange={(e) => setNotifications(e.target.checked)}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
