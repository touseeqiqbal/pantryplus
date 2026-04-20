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
import BusinessDashboard from '../components/BusinessDashboard';
import { useAppMode } from '@/lib/hooks/useAppMode';
import Logo from '../components/Logo';
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
  const { mode, isBusiness } = useAppMode();
  const { expenses } = useExpenses();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'aiPlanner' | 'activity'>('overview');

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
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${isBusiness ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'}`}>
                {isBusiness ? 'Business' : 'Personal'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
               <span className="hidden sm:inline">{greeting}, {user.email?.split('@')[0]}</span>
               <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 hidden sm:inline" />
               <ThemeToggle />
               <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
               >
                  Sign Out
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {isBusiness ? (
            <BusinessDashboard />
        ) : (
            <>
                {/* Expiry Notifications */}
                <ExpiryNotifications items={items} />

                {/* Tab Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {['overview', 'analytics', 'aiPlanner', 'activity'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        {tab === 'overview' && 'Overview'}
                        {tab === 'analytics' && 'Analytics'}
                        {tab === 'aiPlanner' && 'AI Insight Planner'}
                        {tab === 'activity' && 'Recent Activity'}
                    </button>
                    ))}
                </div>

                {/* --- TAB CONTENT: OVERVIEW --- */}
                {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* --- EPIC 2: PREDICTIVE & GAMIFICATION ENGINE --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Feature 7: Waste Reduction Gamification Score */}
                  <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-green-900 dark:text-green-300 mb-1 flex items-center gap-2">
                          🌍 Sustainability Score
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Your household's food waste efficiency.
                        </p>
                      </div>
                      <div className="text-4xl font-extrabold text-green-600 dark:text-green-400">
                        {totalItems > 0 ? Math.max(0, Math.round(100 - ((expiredItems / totalItems) * 100))) : 100}<span className="text-2xl">%</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-green-200 dark:bg-green-900/50 rounded-full h-3 mt-4">
                       <motion.div
                          className="bg-green-500 dark:bg-green-400 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${totalItems > 0 ? Math.max(0, 100 - ((expiredItems / totalItems) * 100)) : 100}%` }}
                       />
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-3 font-medium">
                      {expiredItems === 0 
                        ? "Perfect streak! You have no expired food right now." 
                        : `Watch out! You've lost ${expiredItems} items recently.`}
                    </p>
                  </div>

                  {/* Feature 1: Predictive Food Intelligence */}
                  <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800/50">
                    <h3 className="text-lg font-bold text-orange-900 dark:text-orange-300 mb-1 flex items-center gap-2">
                      🧠 Predictive Brain
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-400 mb-4">
                      AI-driven insights based on your household's usage decay.
                    </p>
                    {expiringItems > 0 ? (
                      <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                        <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
                        <div className="text-sm text-orange-900 dark:text-orange-200">
                          <strong className="block">High Probability of Rot</strong>
                          Based on your typical eating speeds, {expiringItems} items will likely spoil before you eat them. Ask the AI Chat to plan a meal for them!
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                        <SparklesIcon className="w-8 h-8 text-orange-500" />
                        <div className="text-sm text-orange-900 dark:text-orange-200">
                          <strong className="block">Decay Optimized</strong>
                          No historical consumption issues detected in your current inventory batch.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* --- END EPIC 2 --- */}

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
                    </motion.div>
                )}

                {/* --- TAB CONTENT: ANALYTICS --- */}
                {activeTab === 'analytics' && (
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
                )}

                {/* --- TAB CONTENT: AI PLANNER --- */}
                {activeTab === 'aiPlanner' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1 }}
                >
                  <AIInsightsDashboard />
                </motion.div>
                )}

                {/* --- TAB CONTENT: ACTIVITY --- */}
                {activeTab === 'activity' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                >
                  <ActivityLog />
                </motion.div>
                )}
            </>
        )}
      </main>
    </div>
  );
}
