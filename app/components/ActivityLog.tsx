'use client';

import { useActivityLog } from '@/lib/hooks/useActivityLog';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActivityLog() {
    const { activities } = useActivityLog();
    const { currentHousehold } = useHousehold();
    const { user } = useAuth();

    if (!currentHousehold) return null;

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create': return '➕';
            case 'update': return '✏️';
            case 'delete': return '🗑️';
            case 'complete': return '✅';
            case 'join': return '👋';
            case 'leave': return '👋';
            default: return '📝';
        }
    };

    // Proper past-tense phrasing (avoids "joind" / "leaved").
    const actionVerb = (action: string) => {
        switch (action) {
            case 'create': return 'added';
            case 'update': return 'updated';
            case 'delete': return 'removed';
            case 'complete': return 'completed';
            case 'join': return 'joined';
            case 'leave': return 'left';
            default: return action;
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000;

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">📜</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>

            <div className="relative">
                <div className="absolute top-0 bottom-0 left-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-6">
                    {activities.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 pl-10">No recent activity.</p>
                    ) : (
                        activities.slice(0, 10).map((activity, index) => {
                            const member = currentHousehold.members.find(m => m.userId === activity.userId);
                            const userName = member?.email?.split('@')[0] || 'Unknown User';
                            const isMe = activity.userId === user?.uid;

                            return (
                                <motion.div
                                    key={activity.id || index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative pl-10"
                                >
                                    <div className="absolute left-0 top-1 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full border-2 border-white dark:border-gray-800 z-10 text-sm">
                                        {getActionIcon(activity.action)}
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium text-sm">
                                            <span className={isMe ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
                                                {isMe ? 'You' : userName}
                                            </span>{' '}
                                            {actionVerb(activity.action)}{' '}
                                            <span className="font-semibold">{activity.entityName}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {formatTime(activity.timestamp)} • {activity.entityType}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
