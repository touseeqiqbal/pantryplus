'use client';

import { useTasks } from '@/lib/hooks/useTasks';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
    const { tasks } = useTasks();
    const { currentHousehold } = useHousehold();
    const { user } = useAuth();

    const scores = useMemo(() => {
        if (!currentHousehold || !tasks.length) return [];

        const memberScores: Record<string, number> = {};

        // Initialize scores for all members
        currentHousehold.members.forEach(member => {
            memberScores[member.userId] = 0;
        });

        // Calculate scores from completed tasks
        tasks.forEach(task => {
            if (task.status === 'completed' && task.completedBy && task.points) {
                memberScores[task.completedBy] = (memberScores[task.completedBy] || 0) + task.points;
            }
        });

        // Convert to array and sort
        return Object.entries(memberScores)
            .map(([userId, score]) => {
                const member = currentHousehold.members.find(m => m.userId === userId);
                return {
                    userId,
                    email: member?.email || 'Unknown',
                    score
                };
            })
            .sort((a, b) => b.score - a.score);
    }, [tasks, currentHousehold]);

    if (!currentHousehold) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🏆</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</h3>
            </div>

            <div className="space-y-4">
                {scores.map((scorer, index) => (
                    <motion.div
                        key={scorer.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-lg border ${index === 0
                                ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'
                                : 'bg-gray-50 border-gray-100 dark:bg-gray-700/50 dark:border-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                    index === 1 ? 'bg-gray-300 text-gray-800' :
                                        index === 2 ? 'bg-amber-600 text-white' :
                                            'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                }`}>
                                {index + 1}
                            </div>
                            <span className={`font-medium ${scorer.userId === user?.uid ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-200'
                                }`}>
                                {scorer.userId === user?.uid ? 'You' : scorer.email.split('@')[0]}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{scorer.score}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">XP</span>
                        </div>
                    </motion.div>
                ))}

                {scores.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No completed tasks with points yet.
                    </p>
                )}
            </div>
        </div>
    );
}
