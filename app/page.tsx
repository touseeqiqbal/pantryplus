'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  SparklesIcon,
  ShoppingCartIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import Logo from '@/app/components/Logo';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <SparklesIcon className="w-8 h-8" />,
      title: 'Smart Inventory',
      description: 'Track your pantry items with barcode scanning and AI-powered categorization.',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: 'Expiry Tracking',
      description: 'Get timely alerts about expiring items and reduce food waste by up to 40%.',
      color: 'from-orange-500 to-red-600',
    },
    {
      icon: <ShoppingCartIcon className="w-8 h-8" />,
      title: 'Shopping Lists',
      description: 'Create smart shopping lists that sync across all your devices in real-time.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: 'Expense Tracking',
      description: 'Monitor household spending and set budgets to achieve your financial goals.',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: <UserGroupIcon className="w-8 h-8" />,
      title: 'Family Collaboration',
      description: 'Share households with family members and coordinate tasks effortlessly.',
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: <BellAlertIcon className="w-8 h-8" />,
      title: 'Meal Planning',
      description: 'Plan weekly meals and get recipe suggestions based on your inventory.',
      color: 'from-yellow-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-6"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Smart Kitchen Management • Offline-First • PWA</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to
            <div className="flex justify-center mt-4 mb-2">
              <Logo size="hero" />
            </div>
          </h1>

          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4 font-medium">
            Your Smart Kitchen Companion
          </p>

          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Manage your pantry inventory, track expiry dates, plan meals, coordinate household tasks,
            and track expenses - all in one powerful offline-first application that works anywhere, anytime.
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Link
              href="/auth/signup"
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 hover:scale-105"
            >
              Get Started Free
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300 font-semibold text-lg hover:scale-105"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-20"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Offline Support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">6+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Core Features</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">∞</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Households</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="group relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
            >
              {/* Icon with gradient background */}
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative gradient border on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-20"
        >
          <div className="inline-block p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Kitchen?
            </h2>
            <p className="text-indigo-100 mb-6 max-w-2xl">
              Join thousands of households managing their kitchen smarter with Pantry
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg hover:scale-105 shadow-lg"
            >
              Start Your Free Journey →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2 flex flex-col items-center gap-2">
              <Logo size="sm" />
              <span className="text-sm">Smart Kitchen Management</span>
            </p>
            <p className="text-sm">
              Built with ❤️ using Next.js, TypeScript, Firebase & Modern Web Technologies
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
