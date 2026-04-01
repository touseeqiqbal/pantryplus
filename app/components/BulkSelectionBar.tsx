'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryItem } from '@/lib/db/dexie';
import {
    CheckIcon,
    XMarkIcon,
    TrashIcon,
    PencilIcon,
    ArchiveBoxArrowDownIcon,
} from '@heroicons/react/24/outline';

interface BulkSelectionBarProps {
    selectedCount: number;
    onDelete: () => void;
    onEdit: () => void;
    onExport: () => void;
    onCancel: () => void;
}

export default function BulkSelectionBar({
    selectedCount,
    onDelete,
    onEdit,
    onExport,
    onCancel,
}: BulkSelectionBarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(selectedCount > 0);
    }, [selectedCount]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[1100]"
                >
                    <div className="glass rounded-2xl shadow-2xl p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                    <CheckIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
                                </span>
                            </div>
                            <button
                                onClick={onCancel}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Cancel"
                            >
                                <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {selectedCount === 1 && (
                                <button
                                    onClick={onEdit}
                                    className="flex flex-col items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    <PencilIcon className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">Edit</span>
                                </button>
                            )}

                            <button
                                onClick={onExport}
                                className="flex flex-col items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            >
                                <ArchiveBoxArrowDownIcon className="w-5 h-5 mb-1" />
                                <span className="text-xs font-medium">Export</span>
                            </button>

                            <button
                                onClick={onDelete}
                                className="flex flex-col items-center justify-center p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                                <TrashIcon className="w-5 h-5 mb-1" />
                                <span className="text-xs font-medium">Delete</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
