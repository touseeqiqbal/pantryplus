'use client';

import { InventoryItem } from '@/lib/db/dexie';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ExpiryNotificationsProps {
    items: InventoryItem[];
}

export default function ExpiryNotifications({ items }: ExpiryNotificationsProps) {
    const expiringItems = items.filter(item => {
        if (!item.expiryDate) return false;
        const daysUntilExpiry = Math.floor(
            (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    });

    const expiredItems = items.filter(item => {
        if (!item.expiryDate) return false;
        return new Date(item.expiryDate) < new Date();
    });

    if (expiringItems.length === 0 && expiredItems.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-4"
        >
            <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>

            <AnimatePresence>
                {expiredItems.map(item => (
                    <motion.div
                        key={`expired-${item.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center"
                    >
                        <div>
                            <p className="font-semibold text-red-700">Expired: {item.name}</p>
                            <p className="text-sm text-red-600">
                                Expired on {new Date(item.expiryDate!).toLocaleDateString()}
                            </p>
                        </div>
                        <Link
                            href="/inventory"
                            className="text-sm font-medium text-red-700 hover:text-red-800 underline"
                        >
                            View
                        </Link>
                    </motion.div>
                ))}

                {expiringItems.map(item => (
                    <motion.div
                        key={`expiring-${item.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex justify-between items-center"
                    >
                        <div>
                            <p className="font-semibold text-orange-700">Expiring Soon: {item.name}</p>
                            <p className="text-sm text-orange-600">
                                Expires in {Math.ceil((new Date(item.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                            </p>
                        </div>
                        <Link
                            href="/inventory"
                            className="text-sm font-medium text-orange-700 hover:text-orange-800 underline"
                        >
                            View
                        </Link>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
