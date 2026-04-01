'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ExpenseForecast from '../components/ExpenseForecast';

export default function Expenses() {
    const [mounted, setMounted] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: 0,
        currency: 'USD',
        category: 'groceries' as const,
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    const { user, signOut } = useAuth();
    const { currentHousehold } = useHousehold();
    const { expenses, budgets, addExpense, deleteExpense, checkBudgetStatus } = useExpenses();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!user && mounted) {
            router.push('/auth/signin');
        } else if (!currentHousehold && mounted) {
            router.push('/household/setup');
        }
    }, [user, currentHousehold, mounted, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addExpense(formData);
            setShowAddModal(false);
            setFormData({
                amount: 0,
                currency: 'USD',
                category: 'groceries',
                description: '',
                date: new Date().toISOString().split('T')[0],
            });
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const now = new Date();
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }).reduce((sum, exp) => sum + exp.amount, 0);

    if (!mounted || !user || !currentHousehold) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/dashboard" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            PantryPlus
                        </Link>
                        <button
                            onClick={() => signOut()}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Expense Tracker 💰
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Track household expenses and budgets
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                        >
                            + Add Expense
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Total Expenses
                            </h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                ${totalExpenses.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                This Month
                            </h3>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                ${monthlyExpenses.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Active Budgets
                            </h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {budgets.length}
                            </p>
                        </div>
                    </div>

                    {/* Forecast */}
                    <ExpenseForecast expenses={expenses} budgets={budgets} />

                    {/* Expenses List */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Recent Expenses
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {expenses.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="text-6xl mb-4">💸</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        No Expenses Yet
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Start tracking your household expenses
                                    </p>
                                </div>
                            ) : (
                                expenses.slice(0, 10).map((expense) => (
                                    <motion.div
                                        key={expense.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {expense.description}
                                                    </h4>
                                                    <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 capitalize">
                                                        {expense.category}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        ${expense.amount.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {expense.currency}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => expense.id && deleteExpense(expense.id)}
                                                    className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Add Expense
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        placeholder="e.g., Weekly groceries"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Amount
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Currency
                                        </label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="INR">INR</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="groceries">Groceries</option>
                                        <option value="utilities">Utilities</option>
                                        <option value="household">Household</option>
                                        <option value="dining">Dining</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Add Expense
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
