'use client';

import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { InventoryItem } from '@/lib/db/dexie';
import {
    TrashIcon,
    PencilIcon,
    ClockIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import { useUI } from './ui/Toaster';

interface SwipeableItemCardProps {
    item: InventoryItem;
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: number) => void;
}

export default function SwipeableItemCard({ item, onEdit, onDelete }: SwipeableItemCardProps) {
    const [dragX, setDragX] = useState(0);
    const [showActions, setShowActions] = useState(false);
    const { confirm } = useUI();

    const isExpiringSoon = item.expiryDate &&
        Math.floor((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 7;
    const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;

        if (info.offset.x < -threshold) {
            // Swiped left - show delete
            setShowActions(true);
            setDragX(-80);
        } else if (info.offset.x > threshold) {
            // Swiped right - show edit
            setShowActions(true);
            setDragX(80);
        } else {
            // Return to center
            setShowActions(false);
            setDragX(0);
        }
    };

    const handleDelete = async () => {
        if (item.id && (await confirm({
            title: 'Delete item',
            message: `Delete "${item.name}"?`,
            confirmText: 'Delete',
            danger: true,
        }))) {
            onDelete(item.id);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Action Buttons Background */}
            <AnimatePresence>
                {showActions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-between px-4"
                    >
                        {/* Edit Button (Left) */}
                        {dragX > 0 && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                onClick={() => {
                                    onEdit(item);
                                    setShowActions(false);
                                    setDragX(0);
                                }}
                                className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"
                            >
                                <PencilIcon className="w-6 h-6" />
                            </motion.button>
                        )}

                        {/* Delete Button (Right) */}
                        {dragX < 0 && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                onClick={handleDelete}
                                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg ml-auto"
                            >
                                <TrashIcon className="w-6 h-6" />
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card Content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                animate={{ x: dragX }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => {
                    if (showActions) {
                        setShowActions(false);
                        setDragX(0);
                    }
                }}
                className={`card p-4 cursor-grab active:cursor-grabbing ${isExpired ? 'border-2 border-red-300 dark:border-red-700' :
                        isExpiringSoon ? 'border-2 border-orange-300 dark:border-orange-700' : ''
                    }`}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                        <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">
                            {item.category}
                        </span>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => onEdit(item)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <PencilIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">{item.quantity}</span> {item.unit}
                        </span>
                    </div>

                    {/* Expiry Date */}
                    {item.expiryDate && (
                        <div className="flex items-center gap-2">
                            <ClockIcon className={`w-4 h-4 ${isExpired ? 'text-red-600 dark:text-red-400' :
                                    isExpiringSoon ? 'text-orange-600 dark:text-orange-400' :
                                        'text-gray-500'
                                }`} />
                            <span className={`text-sm ${isExpired ? 'text-red-600 dark:text-red-400 font-semibold' :
                                    isExpiringSoon ? 'text-orange-600 dark:text-orange-400 font-semibold' :
                                        'text-gray-700 dark:text-gray-300'
                                }`}>
                                {isExpired ? 'Expired: ' : 'Expires: '}
                                {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    {/* Location */}
                    {item.location && (
                        <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.location}</span>
                        </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                            {item.notes}
                        </p>
                    )}

                    {/* Low Stock Indicator */}
                    {item.minThreshold && item.quantity <= item.minThreshold && (
                        <div className="mt-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded inline-block">
                            ⚠️ Low Stock
                        </div>
                    )}
                </div>

                {/* Mobile Swipe Hint */}
                <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        ← Swipe to edit or delete →
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
