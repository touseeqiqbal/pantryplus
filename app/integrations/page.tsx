'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';
import {
    getIntegrationStatuses,
    IntegrationStatus,
    syncMealPlanToCalendar,
    sendToAlexaShoppingList,
    sendToGoogleHomeShoppingList,
    createInstacartCart,
    createAmazonFreshCart,
    comparePrices,
    PriceComparison,
} from '@/lib/services/integrationService';
import {
    CalendarIcon,
    ShoppingCartIcon,
    HomeIcon,
    HeartIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    LinkIcon,
} from '@heroicons/react/24/outline';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    category: 'calendar' | 'smart_home' | 'delivery' | 'fitness';
    setupUrl?: string;
}

const integrations: Integration[] = [
    {
        id: 'google_calendar',
        name: 'Google Calendar',
        description: 'Sync meal plans to your calendar automatically',
        icon: CalendarIcon,
        color: 'blue',
        category: 'calendar',
        setupUrl: '/integrations/google-calendar',
    },
    {
        id: 'alexa',
        name: 'Amazon Alexa',
        description: 'Send shopping lists and get expiry alerts',
        icon: HomeIcon,
        color: 'cyan',
        category: 'smart_home',
        setupUrl: '/integrations/alexa',
    },
    {
        id: 'google_home',
        name: 'Google Home',
        description: 'Voice control for shopping lists and reminders',
        icon: HomeIcon,
        color: 'green',
        category: 'smart_home',
        setupUrl: '/integrations/google-home',
    },
    {
        id: 'instacart',
        name: 'Instacart',
        description: 'One-click grocery delivery from your shopping list',
        icon: ShoppingCartIcon,
        color: 'orange',
        category: 'delivery',
        setupUrl: '/integrations/instacart',
    },
    {
        id: 'amazon_fresh',
        name: 'Amazon Fresh',
        description: 'Fast grocery delivery with Amazon Prime',
        icon: ShoppingCartIcon,
        color: 'yellow',
        category: 'delivery',
        setupUrl: '/integrations/amazon-fresh',
    },
    {
        id: 'myfitnesspal',
        name: 'MyFitnessPal',
        description: 'Track nutrition and sync meal plans',
        icon: HeartIcon,
        color: 'red',
        category: 'fitness',
        setupUrl: '/integrations/myfitnesspal',
    },
];

export default function Integrations() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [statuses, setStatuses] = useState<IntegrationStatus[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showPriceComparison, setShowPriceComparison] = useState(false);
    const [priceComparison, setPriceComparison] = useState<PriceComparison[]>([]);

    useEffect(() => {
        setMounted(true);
        loadStatuses();
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin');
        }
    }, [user, authLoading, router]);

    const loadStatuses = () => {
        const currentStatuses = getIntegrationStatuses();
        setStatuses(currentStatuses);
    };

    const handleConnect = (integrationId: string) => {
        // In a real app, this would initiate OAuth flow or API connection
        alert(`Connecting to ${integrationId}...\n\nThis would open the OAuth flow or API setup page.`);
    };

    const handleDisconnect = (integrationId: string) => {
        if (confirm(`Disconnect from ${integrationId}?`)) {
            // Update status
            setStatuses(prev => prev.map(s =>
                s.service.toLowerCase().replace(' ', '_') === integrationId
                    ? { ...s, connected: false }
                    : s
            ));
        }
    };

    const handleTestIntegration = async (integrationId: string) => {
        alert(`Testing ${integrationId} connection...\n\nThis would verify the API credentials and connection.`);
    };

    const loadPriceComparison = async () => {
        setShowPriceComparison(true);
        // Mock shopping items for demo
        const mockItems = [
            { name: 'Milk', quantity: 1, unit: 'gallon', price: 4.99 },
            { name: 'Bread', quantity: 2, unit: 'loaves', price: 3.49 },
            { name: 'Eggs', quantity: 1, unit: 'dozen', price: 5.99 },
        ];
        const comparison = await comparePrices(mockItems as any);
        setPriceComparison(comparison);
    };

    if (authLoading || !mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const filteredIntegrations = selectedCategory === 'all'
        ? integrations
        : integrations.filter(i => i.category === selectedCategory);

    const categories = [
        { id: 'all', name: 'All', icon: LinkIcon },
        { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
        { id: 'smart_home', name: 'Smart Home', icon: HomeIcon },
        { id: 'delivery', name: 'Delivery', icon: ShoppingCartIcon },
        { id: 'fitness', name: 'Fitness', icon: HeartIcon },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200 pb-20">
            {/* Header */}
            <header className="glass sticky top-0 z-50 border-b border-white/20 dark:border-gray-700/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold gradient-text">Integrations</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Connect your favorite apps and services
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <button
                                onClick={loadStatuses}
                                className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all"
                                title="Refresh"
                            >
                                <ArrowPathIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${selectedCategory === category.id
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <category.icon className="w-4 h-4" />
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {/* Price Comparison Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 mb-6 bg-gradient-to-r from-green-500 to-green-600 text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-2">💰 Compare Grocery Prices</h3>
                            <p className="text-green-100">Find the best deals across delivery services</p>
                        </div>
                        <button
                            onClick={loadPriceComparison}
                            className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all"
                        >
                            Compare Now
                        </button>
                    </div>
                </motion.div>

                {/* Integrations Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIntegrations.map((integration, index) => {
                        const status = statuses.find(s =>
                            s.service.toLowerCase().replace(' ', '_') === integration.id
                        );
                        const isConnected = status?.connected || false;

                        return (
                            <motion.div
                                key={integration.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="card p-6 hover:shadow-xl transition-all"
                            >
                                {/* Icon & Status */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 bg-${integration.color}-100 dark:bg-${integration.color}-900/30 rounded-xl`}>
                                        <integration.icon className={`w-8 h-8 text-${integration.color}-600 dark:text-${integration.color}-400`} />
                                    </div>
                                    {isConnected ? (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Connected
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                                            <XCircleIcon className="w-4 h-4" />
                                            Not Connected
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {integration.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {integration.description}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {isConnected ? (
                                        <>
                                            <button
                                                onClick={() => handleTestIntegration(integration.id)}
                                                className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                                            >
                                                Test
                                            </button>
                                            <button
                                                onClick={() => handleDisconnect(integration.id)}
                                                className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                                            >
                                                Disconnect
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(integration.id)}
                                            className="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                                        >
                                            Connect
                                        </button>
                                    )}
                                </div>

                                {status?.lastSync && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                        Last synced: {new Date(status.lastSync).toLocaleString()}
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Price Comparison Modal */}
                {showPriceComparison && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1400]"
                        onClick={() => setShowPriceComparison(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="card max-w-2xl w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                💰 Price Comparison
                            </h3>

                            <div className="space-y-4">
                                {priceComparison.map((comparison, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg ${index === 0
                                                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                                                : 'bg-gray-50 dark:bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {comparison.service}
                                                </h4>
                                                {index === 0 && (
                                                    <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                                                        BEST DEAL
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {comparison.deliveryTime}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">Items</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    ${comparison.totalPrice.toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">Delivery</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    ${comparison.deliveryFee.toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">Total</p>
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                    ${comparison.estimatedTotal.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowPriceComparison(false)}
                                className="w-full mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
