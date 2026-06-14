'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';
import { useUI } from '../components/ui/Toaster';
import { deleteAllUserData } from '@/lib/services/dataService';
import {
    UserCircleIcon,
    BellIcon,
    ShieldCheckIcon,
    PaintBrushIcon,
    GlobeAltIcon,
    CurrencyDollarIcon,
    ClockIcon,
    DevicePhoneMobileIcon,
    ChartBarIcon,
    TrashIcon,
    ArrowRightOnRectangleIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';

interface SettingsSection {
    id: string;
    title: string;
    icon: any;
    description: string;
}

const sections: SettingsSection[] = [
    {
        id: 'account',
        title: 'Account',
        icon: UserCircleIcon,
        description: 'Manage your profile and preferences',
    },
    {
        id: 'notifications',
        title: 'Notifications',
        icon: BellIcon,
        description: 'Configure alerts and reminders',
    },
    {
        id: 'privacy',
        title: 'Privacy & Security',
        icon: ShieldCheckIcon,
        description: 'Control your data and security',
    },
    {
        id: 'appearance',
        title: 'Appearance',
        icon: PaintBrushIcon,
        description: 'Customize the look and feel',
    },
    {
        id: 'regional',
        title: 'Regional',
        icon: GlobeAltIcon,
        description: 'Language, currency, and timezone',
    },
    {
        id: 'inventory',
        title: 'Inventory',
        icon: ChartBarIcon,
        description: 'Default settings for inventory management',
    },
    {
        id: 'data',
        title: 'Data & Storage',
        icon: DevicePhoneMobileIcon,
        description: 'Manage your data and storage',
    },
];

export default function Settings() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { toast, confirm } = useUI();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [activeSection, setActiveSection] = useState('account');
    const [saved, setSaved] = useState(false);

    // Settings state
    const [settings, setSettings] = useState({
        // Account
        displayName: '',
        email: '',

        // Notifications
        expiryAlerts: true,
        lowStockAlerts: true,
        mealPlanReminders: true,
        shoppingListUpdates: true,
        emailNotifications: true,
        pushNotifications: true,
        expiryDaysBefore: 3,

        // Privacy
        dataSharing: false,
        analytics: true,
        householdVisibility: 'members',

        // Appearance
        theme: 'system',
        compactMode: false,
        defaultViewMode: 'grid',

        // Regional
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',

        // Inventory
        defaultUnit: 'pieces',
        autoCategorization: true,
        expiryPrediction: true,
        wasteTracking: true,

        // Data
        offlineMode: true,
        autoSync: true,
        cacheSize: 'medium',
    });

    useEffect(() => {
        setMounted(true);
        loadSettings();
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin');
        } else if (user) {
            setSettings(prev => ({
                ...prev,
                displayName: user.displayName || '',
                email: user.email || '',
            }));
        }
    }, [user, authLoading, router]);

    const loadSettings = () => {
        // Load from localStorage
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
    };

    const saveSettings = () => {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSignOut = async () => {
        if (await confirm({ title: 'Sign out', message: 'Are you sure you want to sign out?', confirmText: 'Sign out' })) {
            await signOut();
            router.push('/auth/signin');
        }
    };

    const clearAllData = async () => {
        const first = await confirm({
            title: 'Delete all data',
            message: '⚠️ This will delete ALL your data including inventory, shopping lists, and meal plans — locally AND in the cloud (for households you own). This action cannot be undone.',
            confirmText: 'Continue',
            danger: true,
        });
        if (!first) return;

        const second = await confirm({
            title: 'Are you absolutely sure?',
            message: 'Last chance! This will permanently delete everything.',
            confirmText: 'Delete everything',
            danger: true,
        });
        if (!second) return;

        try {
            await deleteAllUserData(user?.uid, user?.email);
            toast('All data has been deleted. Signing you out…', 'success');
        } catch (error) {
            console.error('Delete all data failed:', error);
            toast('Some cloud data could not be deleted, but local data was cleared. Signing out…', 'error');
        } finally {
            await signOut();
            router.push('/auth/signin');
        }
    };

    if (authLoading || !mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200 pb-20">
            {/* Header */}
            <header className="glass sticky top-0 z-50 border-b border-white/20 dark:border-gray-700/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold gradient-text">Settings</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage your app preferences
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            {saved && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg"
                                >
                                    <CheckIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">Saved!</span>
                                </motion.div>
                            )}
                            <button
                                onClick={saveSettings}
                                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card p-4 sticky top-24">
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === section.id
                                                ? 'bg-primary-600 text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <section.icon className="w-5 h-5" />
                                        <span className="font-medium">{section.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Account Section */}
                        {activeSection === 'account' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-6"
                            >
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.displayName}
                                            onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.email}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
                                        >
                                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Notifications Section */}
                        {activeSection === 'notifications' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-6"
                            >
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notification Settings</h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Expiry Alerts</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when items are about to expire</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.expiryAlerts}
                                                onChange={(e) => setSettings({ ...settings, expiryAlerts: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    {settings.expiryAlerts && (
                                        <div className="ml-4 pl-4 border-l-2 border-primary-500">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Alert me when items expire in
                                            </label>
                                            <select
                                                value={settings.expiryDaysBefore}
                                                onChange={(e) => setSettings({ ...settings, expiryDaysBefore: parseInt(e.target.value) })}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="1">1 day</option>
                                                <option value="3">3 days</option>
                                                <option value="5">5 days</option>
                                                <option value="7">7 days</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Low Stock Alerts</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when items are running low</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.lowStockAlerts}
                                                onChange={(e) => setSettings({ ...settings, lowStockAlerts: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Meal Plan Reminders</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Daily reminders for your meal plan</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.mealPlanReminders}
                                                onChange={(e) => setSettings({ ...settings, mealPlanReminders: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications on this device</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.pushNotifications}
                                                onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Privacy Section */}
                        {activeSection === 'privacy' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-6"
                            >
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Privacy & Security</h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Anonymous Analytics</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Help us improve by sharing anonymous usage data</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.analytics}
                                                onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Household Visibility
                                        </label>
                                        <select
                                            value={settings.householdVisibility}
                                            onChange={(e) => setSettings({ ...settings, householdVisibility: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="members">All household members</option>
                                            <option value="admins">Admins only</option>
                                            <option value="private">Private (only me)</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Appearance Section */}
                        {activeSection === 'appearance' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-6"
                            >
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Appearance</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Theme
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['light', 'dark', 'system'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={() => setSettings({ ...settings, theme })}
                                                    className={`p-4 border-2 rounded-lg capitalize transition-all ${settings.theme === theme
                                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                                                        }`}
                                                >
                                                    {theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Default View Mode
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['grid', 'list', 'table'].map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setSettings({ ...settings, defaultViewMode: mode })}
                                                    className={`p-4 border-2 rounded-lg capitalize transition-all ${settings.defaultViewMode === mode
                                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                                                        }`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Compact Mode</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Show more content with smaller spacing</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.compactMode}
                                                onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Regional Section */}
                        {activeSection === 'regional' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-6"
                            >
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Regional Settings</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Language
                                        </label>
                                        <select
                                            value={settings.language}
                                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Currency
                                        </label>
                                        <select
                                            value={settings.currency}
                                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="JPY">JPY (¥)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Timezone
                                        </label>
                                        <select
                                            value={settings.timezone}
                                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="America/New_York">Eastern Time</option>
                                            <option value="America/Chicago">Central Time</option>
                                            <option value="America/Denver">Mountain Time</option>
                                            <option value="America/Los_Angeles">Pacific Time</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Date Format
                                        </label>
                                        <select
                                            value={settings.dateFormat}
                                            onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Inventory Section */}
                        {activeSection === 'inventory' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-6"
                            >
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Inventory Settings</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Default Unit
                                        </label>
                                        <select
                                            value={settings.defaultUnit}
                                            onChange={(e) => setSettings({ ...settings, defaultUnit: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="pieces">Pieces</option>
                                            <option value="kg">Kilograms</option>
                                            <option value="lbs">Pounds</option>
                                            <option value="l">Liters</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Auto-Categorization</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">AI suggests categories for new items</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.autoCategorization}
                                                onChange={(e) => setSettings({ ...settings, autoCategorization: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Expiry Prediction</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">AI predicts expiry dates based on patterns</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.expiryPrediction}
                                                onChange={(e) => setSettings({ ...settings, expiryPrediction: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Waste Tracking</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Track expired items for insights</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.wasteTracking}
                                                onChange={(e) => setSettings({ ...settings, wasteTracking: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Data Section */}
                        {activeSection === 'data' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-6"
                            >
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Data & Storage</h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Offline Mode</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Use the app without internet connection</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.offlineMode}
                                                onChange={(e) => setSettings({ ...settings, offlineMode: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Auto-Sync</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Automatically sync data when online</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.autoSync}
                                                onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-4">Danger Zone</h3>
                                        <button
                                            onClick={clearAllData}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                            Clear All Data
                                        </button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            ⚠️ This action cannot be undone. All your data will be permanently deleted.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
