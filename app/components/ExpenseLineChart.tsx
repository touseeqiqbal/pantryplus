'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { useCountry } from '@/lib/hooks/useCountry';

// Mock data integration point - in real app, pass this via props from useExpenses
interface ExpenseLineChartProps {
    expenses: any[]; // Replace with Expense type
}

export default function ExpenseLineChart({ expenses }: ExpenseLineChartProps) {
    const { theme } = useTheme();
    const { country } = useCountry();
    const isDark = theme === 'dark';

    const hasData = Array.isArray(expenses) && expenses.length > 0;

    // Aggregate real spend over the last 7 days (zeros when there's no data —
    // never fabricated random values).
    const data = useMemo(() => {
        const last7Days = new Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d;
        });

        return last7Days.map(date => {
            const dayStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const total = (expenses || [])
                .filter(e => typeof e.date === 'string' && e.date.startsWith(dayStr))
                .reduce((sum, e) => sum + (e.amount || 0), 0);

            return { name: dayName, amount: total };
        });
    }, [expenses]);

    if (!hasData) {
        return (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                <span className="text-3xl mb-2">📊</span>
                <p className="text-sm">No expense data yet</p>
                <p className="text-xs">Add expenses to see your 7-day spending trend.</p>
            </div>
        );
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis
                        dataKey="name"
                        stroke={isDark ? '#9ca3af' : '#6b7280'}
                        tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                    />
                    <YAxis
                        stroke={isDark ? '#9ca3af' : '#6b7280'}
                        tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                        tickFormatter={(value) => `${country.currencySymbol}${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            borderColor: isDark ? '#374151' : '#e5e7eb',
                            color: isDark ? '#f3f4f6' : '#111827'
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#6366f1' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
