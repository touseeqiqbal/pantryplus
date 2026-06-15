'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    HomeIcon,
    ArchiveBoxIcon,
    ShoppingCartIcon,
    BookOpenIcon,
    Bars3Icon,
    BuildingStorefrontIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    ArchiveBoxIcon as ArchiveBoxIconSolid,
    ShoppingCartIcon as ShoppingCartIconSolid,
    BookOpenIcon as BookOpenIconSolid,
    Bars3Icon as Bars3IconSolid
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAppMode } from '@/lib/hooks/useAppMode';
import { useShopping } from '@/lib/hooks/useShopping';

interface NavItem {
    name: string;
    href: string;
    icon: any;
    iconSolid: any;
    badge?: number;
}

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const { mode, toggleMode, isBusiness } = useAppMode();
    const { items: shoppingList } = useShopping();
    const [showMore, setShowMore] = useState(false);

    // Real count of items still to buy (drives the Shopping tab badge).
    const shoppingToBuy = shoppingList.filter(i => !i.purchased).length;

    // Hide navigation on auth pages or when user is not logged in
    const isAuthPage = pathname?.startsWith('/auth');
    if (isAuthPage || (!loading && !user)) {
        return null;
    }

    const navItems: NavItem[] = [
        {
            name: 'Home',
            href: '/dashboard',
            icon: HomeIcon,
            iconSolid: HomeIconSolid,
        },
        {
            name: 'Inventory',
            href: '/inventory',
            icon: ArchiveBoxIcon,
            iconSolid: ArchiveBoxIconSolid,
        },
        {
            name: 'Shopping',
            href: '/shopping',
            icon: ShoppingCartIcon,
            iconSolid: ShoppingCartIconSolid,
            badge: shoppingToBuy,
        },
        {
            name: 'Recipes',
            href: '/recipes',
            icon: BookOpenIcon,
            iconSolid: BookOpenIconSolid,
        },
        {
            name: 'More',
            href: '#',
            icon: Bars3Icon,
            iconSolid: Bars3IconSolid,
        },
    ];

    const moreItems = [
        { name: 'Autopilot', href: '/autopilot', emoji: '🧭' },
        { name: 'AI Assistant', href: '/assistant', emoji: '🤖' },
        { name: 'Waste Coach', href: '/waste-coach', emoji: '♻️' },
        { name: 'Budget Mode', href: '/budget-planner', emoji: '💸' },
        { name: 'Insights', href: '/insights', emoji: '🏆' },
        { name: 'Scan', href: '/scan', emoji: '🧾' },
        { name: 'Family Taste', href: '/family', emoji: '🧠' },
        { name: 'Health', href: '/health', emoji: '💚' },
        { name: 'Meal Planner', href: '/meals/planner', emoji: '🍽️' },
        { name: 'Tasks', href: '/tasks', emoji: '✓' },
        { name: 'Expenses', href: '/expenses', emoji: '💰' },
        { name: 'Business', href: '/business', emoji: '🏪' },
        { name: 'Integrations', href: '/integrations', emoji: '🔗' },
        { name: 'Household', href: '/household/settings', emoji: '🏠' },
        { name: 'Settings', href: '/settings', emoji: '⚙️' },
    ];

    const handleNavClick = (item: NavItem) => {
        if (item.name === 'More') {
            setShowMore(!showMore);
        } else {
            router.push(item.href);
            setShowMore(false);
        }
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard' || pathname === '/';
        }
        return pathname?.startsWith(href);
    };

    return (
        <>
            {/* More Menu Overlay */}
            {showMore && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-[1300]"
                    onClick={() => setShowMore(false)}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 pb-safe max-h-[78vh] overflow-y-auto">
                            {/* Handle Bar */}
                            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                More Options
                            </h3>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {moreItems.map((item) => (
                                    <button
                                        key={item.href}
                                        onClick={() => {
                                            router.push(item.href);
                                            setShowMore(false);
                                        }}
                                        className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <span className="text-4xl mb-2">{item.emoji}</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {item.name}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Mode Switcher Section */}
                            <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-2xl border border-primary-100 dark:border-primary-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg text-primary-600 dark:text-primary-400">
                                            {isBusiness ? <BuildingStorefrontIcon className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {isBusiness ? 'Business Mode' : 'Personal Mode'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {isBusiness ? 'Managing your cafe inventory' : 'Managing your home pantry'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            toggleMode();
                                            setShowMore(false);
                                            router.push('/dashboard'); // Refresh context on dashboard
                                        }}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-200 dark:shadow-none transition-all active:scale-95"
                                    >
                                        Switch to {isBusiness ? 'Personal' : 'Business'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-[1200] safe-area-bottom">
                <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
                    {navItems.map((item) => {
                        const active = item.name === 'More' ? showMore : isActive(item.href);
                        const Icon = active ? item.iconSolid : item.icon;

                        return (
                            <button
                                key={item.name}
                                onClick={() => handleNavClick(item)}
                                className="relative flex flex-col items-center justify-center w-full h-full group"
                                aria-label={item.name}
                            >
                                {/* Active Indicator */}
                                {active && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-b-full"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}

                                {/* Icon */}
                                <div className="relative">
                                    <Icon
                                        className={`w-6 h-6 transition-colors ${active
                                            ? 'text-primary-600 dark:text-primary-400'
                                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                                            }`}
                                    />

                                    {/* Badge */}
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`text-xs mt-1 font-medium transition-colors ${active
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                                        }`}
                                >
                                    {item.name}
                                </span>

                                {/* Ripple Effect on Tap */}
                                <motion.div
                                    className="absolute inset-0 bg-primary-100 dark:bg-primary-900 rounded-lg opacity-0"
                                    whileTap={{ opacity: 0.3, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                />
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Spacer to prevent content from being hidden behind bottom nav */}
            <div className="h-16 safe-area-bottom" />
        </>
    );
}
