'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useInventory } from '@/lib/hooks/useInventory';
import { useExpenses } from '@/lib/hooks/useExpenses';
import ExpiryNotifications from '../components/ExpiryNotifications';
import ThemeToggle from '../components/ThemeToggle';
import InventoryPieChart from '../components/InventoryPieChart';
import ExpenseLineChart from '../components/ExpenseLineChart';
import ActivityLog from '../components/ActivityLog';
import AIInsightsDashboard from '../components/AIInsightsDashboard';
import {
  ArchiveBoxIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { items } = useInventory();
  const { expenses } = useExpenses();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setMounted(true);

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Calculate statistics
  const totalItems = items.length;
  const expiringItems = items.filter(item => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  }).length;

  const expiredItems = items.filter(item => {
    if (!item.expiryDate) return false;
    return new Date(item.expiryDate) < new Date();
  }).length;

  const lowStockItems = items.filter(item =>
    item.minThreshold && item.quantity <= item.minThreshold
  ).length;

  // Quick actions with icons
  const quickActions = [
    {
      name: 'Inventory',
      href: '/inventory',
      icon: ArchiveBoxIcon,
      gradient: 'from-blue-500 to-blue-600',
      description: 'Manage items',
      badge: totalItems,
    },
    {
      name: 'Shopping',
      href: '/shopping',
      icon: ShoppingCartIcon,
      gradient: 'from-green-500 to-green-600',
      description: 'Your lists',
      badge: lowStockItems,
    },
    {
      name: 'Recipes',
      href: '/recipes',
      icon: SparklesIcon,
      gradient: 'from-purple-500 to-purple-600',
      description: 'Find recipes',
    },
    {
      name: 'Meal Plan',
      href: '/meals/planner',
      icon: ClockIcon,
      gradient: 'from-orange-500 to-orange-600',
      description: 'Plan meals',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200 pb-20">
      {/* Modern Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold gradient-text">PantryPlus</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{greeting}, {user.email?.split('@')[0]}</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-105"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Expiry Notifications */}
        <ExpiryNotifications items={items} />

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card p-4 hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ArchiveBoxIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-2xl"
              >
                📦
              </motion.div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-1">Total Items</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card p-4 hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                className="text-2xl"
              >
                ⚠️
              </motion.div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-1">Expiring Soon</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{expiringItems}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card p-4 hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-2xl"
              >
                🚫
              </motion.div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-1">Expired</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{expiredItems}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card p-4 hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShoppingCartIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl">🛒</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-1">Low Stock</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{lowStockItems}</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="card p-6 text-center relative overflow-hidden"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${action.gradient} p-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <action.icon className="w-full h-full text-white" />
                  </div>

                  {/* Badge */}
                  {action.badge !== undefined && action.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      {action.badge}
                    </motion.div>
                  )}

                  {/* Text */}
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{action.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-primary-600" />
            Household Analytics
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Inventory Distribution</h4>
              <InventoryPieChart items={items} />
            </div>
            <div className="card p-6">
              <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Expense Trends (7 Days)</h4>
              <ExpenseLineChart expenses={expenses} />
            </div>
          </div>
        </motion.div>

        {/* AI Insights Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1 }}
        >
          <AIInsightsDashboard />
        </motion.div>

        {/* Activity Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        >
          <ActivityLog />
        </motion.div>
      </main>
    </div>
  );
}
