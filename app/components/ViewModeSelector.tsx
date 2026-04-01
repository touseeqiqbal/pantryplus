'use client';

import { motion } from 'framer-motion';
import {
    Squares2X2Icon,
    ListBulletIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';

export type ViewMode = 'grid' | 'list' | 'table';

interface ViewModeSelectorProps {
    currentMode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export default function ViewModeSelector({ currentMode, onChange }: ViewModeSelectorProps) {
    const modes: { value: ViewMode; icon: any; label: string }[] = [
        { value: 'grid', icon: Squares2X2Icon, label: 'Grid' },
        { value: 'list', icon: ListBulletIcon, label: 'List' },
        { value: 'table', icon: TableCellsIcon, label: 'Table' },
    ];

    return (
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = currentMode === mode.value;

                return (
                    <button
                        key={mode.value}
                        onClick={() => onChange(mode.value)}
                        className="relative px-4 py-2 rounded-md transition-colors"
                        title={mode.label}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeViewMode"
                                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-md shadow-sm"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                        <Icon
                            className={`w-5 h-5 relative z-10 transition-colors ${isActive
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}
