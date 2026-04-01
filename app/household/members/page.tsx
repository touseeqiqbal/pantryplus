'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function HouseholdMembers() {
    const [mounted, setMounted] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const { user } = useAuth();
    const { currentHousehold, inviteMember, removeMember, leaveHousehold } = useHousehold();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!user && mounted) {
            router.push('/auth/signin');
        }
    }, [user, mounted, router]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await inviteMember(inviteEmail);
            setSuccess(true);
            setInviteEmail('');
            setTimeout(() => {
                setSuccess(false);
                setShowInviteModal(false);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (confirm('Are you sure you want to remove this member?')) {
            try {
                await removeMember(userId);
            } catch (error) {
                console.error('Error removing member:', error);
            }
        }
    };

    const handleLeave = async () => {
        if (confirm('Are you sure you want to leave this household?')) {
            try {
                await leaveHousehold();
                router.push('/household/setup');
            } catch (error) {
                alert(error instanceof Error ? error.message : 'Failed to leave household');
            }
        }
    };

    if (!mounted || !user || !currentHousehold) return null;

    const currentMember = currentHousehold.members.find(m => m.userId === user.uid);
    const canManageMembers = currentMember?.role === 'owner' || currentMember?.role === 'admin';

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

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Household Members
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {currentHousehold.name}
                            </p>
                        </div>
                        {canManageMembers && (
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                            >
                                + Invite Member
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {currentHousehold.members.map((member) => (
                            <motion.div
                                key={member.userId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {member.email}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${member.role === 'owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                                                    member.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {member.role}
                                            </span>
                                            {member.userId === user.uid && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">(You)</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {canManageMembers && member.userId !== user.uid && member.role !== 'owner' && (
                                        <button
                                            onClick={() => handleRemove(member.userId)}
                                            className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors font-semibold"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {currentMember?.role !== 'owner' && (
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleLeave}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                            >
                                Leave Household
                            </button>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowInviteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Invite Member
                            </h3>

                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
                                    Invitation sent successfully!
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        id="inviteEmail"
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                        placeholder="member@example.com"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowInviteModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Sending...' : 'Send Invitation'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
