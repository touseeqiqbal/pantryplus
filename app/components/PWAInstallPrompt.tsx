'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedDate = new Date(dismissed);
            const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

            // Show again after 7 days
            if (daysSinceDismissed < 7) {
                return;
            }
        }

        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);

            // Show the install prompt after 30 seconds
            setTimeout(() => {
                setShowPrompt(true);
            }, 30000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User response to the install prompt: ${outcome}`);

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-20 left-4 right-4 z-[1500] md:left-auto md:right-4 md:w-96"
            >
                <div className="glass rounded-2xl shadow-2xl p-6 border border-white/20">
                    {/* Close Button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="Dismiss"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    {/* Icon */}
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                            📦
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Install PantryPlus AI
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                Install our app for quick access and offline use. Works just like a native app!
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                                >
                                    Install
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Not Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                <span>Works offline</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                <span>Fast and responsive</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                <span>No app store required</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
