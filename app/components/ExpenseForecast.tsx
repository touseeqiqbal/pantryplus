'use client';

import { useMemo } from 'react';
import { Expense, Budget } from '@/lib/db/dexie';

interface ExpenseForecastProps {
    expenses: Expense[];
    budgets: Budget[];
}

export default function ExpenseForecast({ expenses, budgets }: ExpenseForecastProps) {
    const forecast = useMemo(() => {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        const daysRemaining = daysInMonth - currentDay;

        // Filter current month expenses
        const currentMonthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
        });

        const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const dailyAverage = currentDay > 0 ? totalSpent / currentDay : 0;
        const projectedTotal = totalSpent + (dailyAverage * daysRemaining);

        // Calculate total monthly budget
        const totalBudget = budgets
            .filter(b => b.period === 'monthly' || b.period === 'weekly') // Simplified: assuming weekly * 4 for monthly
            .reduce((sum, b) => {
                if (b.period === 'monthly') return sum + b.amount;
                if (b.period === 'weekly') return sum + (b.amount * 4);
                return sum;
            }, 0);

        return {
            totalSpent,
            dailyAverage,
            projectedTotal,
            daysRemaining,
            totalBudget,
            status: totalBudget > 0 ? (projectedTotal > totalBudget ? 'danger' : 'safe') : 'neutral'
        };
    }, [expenses, budgets]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔮</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Forecast</h3>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Days Remaining</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{forecast.daysRemaining}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Daily Spend</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        ${forecast.dailyAverage.toFixed(2)}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Projected Total</p>
                    <p className={`text-2xl font-bold ${forecast.status === 'danger' ? 'text-red-500' : 'text-gray-900 dark:text-white'
                        }`}>
                        ${forecast.projectedTotal.toFixed(2)}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${forecast.totalBudget.toFixed(2)}
                    </p>
                </div>
            </div>

            {forecast.status === 'danger' && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    ⚠️ Warning: Based on your current spending, you are projected to exceed your monthly budget by
                    <span className="font-bold ml-1">${(forecast.projectedTotal - forecast.totalBudget).toFixed(2)}</span>.
                </div>
            )}

            {forecast.status === 'safe' && forecast.totalBudget > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
                    ✅ Good job! You are on track to stay within your budget.
                </div>
            )}
        </div>
    );
}
