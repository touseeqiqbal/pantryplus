'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineIndicatorProps {
    className?: string;
}

export default function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
    const [isOnline, setIsOnline] = useState(true);
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        // Set initial state
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowIndicator(true);

            // Hide the "back online" message after 3 seconds
            setTimeout(() => {
                setShowIndicator(false);
            }, 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowIndicator(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {showIndicator && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-[1600] ${className}`}
                >
                    <div
                        className={`px-6 py-3 rounded-full shadow-lg backdrop-blur-md flex items-center gap-3 ${isOnline
                                ? 'bg-green-500/90 text-white'
                                : 'bg-orange-500/90 text-white'
                            }`}
                    >
                        {/* Status Indicator */}
                        <div className="relative">
                            <div
                                className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white' : 'bg-white'
                                    }`}
                            />
                            {!isOnline && (
                                <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping" />
                            )}
                        </div>

                        {/* Message */}
                        <span className="font-semibold text-sm">
                            {isOnline ? 'Back Online' : 'Offline Mode'}
                        </span>

                        {/* Icon */}
                        <span className="text-lg">
                            {isOnline ? '✓' : '⚠️'}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
