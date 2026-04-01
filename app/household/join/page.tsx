'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function JoinHousehold() {
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    const { invitations, acceptInvitation, declineInvitation } = useHousehold();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!user && mounted) {
            router.push('/auth/signin');
        }
    }, [user, mounted, router]);

    const handleAccept = async (invitationId: string) => {
        try {
            await acceptInvitation(invitationId);
            router.push('/dashboard');
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const handleDecline = async (invitationId: string) => {
        try {
            await declineInvitation(invitationId);
        } catch (error) {
            console.error('Error declining invitation:', error);
        }
    };

    if (!mounted || !user) return null;

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

            <main className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Household Invitations
                    </h2>

                    {invitations.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                            <div className="text-6xl mb-4">📬</div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No Invitations
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                You don't have any pending household invitations
                            </p>
                            <Link
                                href="/household/setup"
                                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                            >
                                Create Your Own Household
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invitations.map((invitation) => (
                                <motion.div
                                    key={invitation.firebaseId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                                                {invitation.householdName}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Invited by {invitation.invitedBy}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAccept(invitation.firebaseId || '')}
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleDecline(invitation.firebaseId || '')}
                                                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
