'use client';

/**
 * First-run onboarding wizard.
 *
 * Flow: Welcome → Region → Household → Get started.
 * Brand-new users land here from sign-up. Returning users (already onboarded, or
 * who already have a household) are bounced straight to the dashboard. The
 * household is created when leaving the Household step so the final "kickstart"
 * step can optionally seed starter data into it.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArchiveBoxIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  UserIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CameraIcon,
  PlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Logo from '@/app/components/Logo';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { useCountry } from '@/lib/hooks/useCountry';
import { useAppMode } from '@/lib/hooks/useAppMode';
import { isOnboarded, markOnboarded } from '@/lib/onboarding';
import { seedSampleInventory, SAMPLE_ITEM_COUNT } from '@/lib/sampleData';

type HouseholdType = 'personal' | 'family' | 'business';
type StartAction = 'sample' | 'manual' | 'scan' | 'explore';

const STEP_LABELS = ['Welcome', 'Region', 'Household', 'Get started'];

const HOUSEHOLD_TYPES: {
  value: HouseholdType;
  title: string;
  blurb: string;
  icon: typeof UserIcon;
}[] = [
  { value: 'personal', title: 'Just me', blurb: 'Personal kitchen & pantry', icon: UserIcon },
  { value: 'family', title: 'My family', blurb: 'Shared with the household', icon: UsersIcon },
  { value: 'business', title: 'My business', blurb: 'Restaurant, café or cloud kitchen', icon: BuildingStorefrontIcon },
];

const WELCOME_FEATURES = [
  { icon: ArchiveBoxIcon, title: 'Smart inventory', desc: 'Track what you have and never buy doubles.' },
  { icon: SparklesIcon, title: 'AI assistant', desc: 'Recipes and meal plans from what’s expiring.' },
  { icon: CurrencyDollarIcon, title: 'Spend & waste', desc: 'See your grocery spend and cut food waste.' },
  { icon: BuildingStorefrontIcon, title: 'Business mode', desc: 'Recipe costing & orders for food businesses.' },
];

function suggestedName(type: HouseholdType, prefix: string) {
  const name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  if (type === 'family') return `The ${name} Family`;
  if (type === 'business') return `${name}'s Kitchen`;
  return `${name}'s Pantry`;
}

export default function Onboarding() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createHousehold, currentHousehold, loading: householdLoading } = useHousehold();
  const { country, countryCode, countries, setCountryCode, formatPrice } = useCountry();
  const { setMode } = useAppMode();

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [householdType, setHouseholdType] = useState<HouseholdType>('personal');
  const [householdName, setHouseholdName] = useState('');
  const [createdHouseholdId, setCreatedHouseholdId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');

  const resolvedRef = useRef(false);

  // Decide exactly once where this visitor belongs, then let the wizard run
  // freely (so creating a household mid-flow doesn't bounce us out).
  useEffect(() => {
    if (resolvedRef.current) return;
    if (authLoading || householdLoading) return;
    resolvedRef.current = true;

    if (!user) {
      router.replace('/auth/signin');
      return;
    }
    if (isOnboarded()) {
      router.replace('/dashboard');
      return;
    }
    if (currentHousehold) {
      // Existing account that predates onboarding — nothing to set up.
      markOnboarded();
      router.replace('/dashboard');
      return;
    }
    setReady(true);
  }, [authLoading, householdLoading, user, currentHousehold, router]);

  // Seed a friendly default household name once we know who the user is.
  useEffect(() => {
    if (ready && !householdName && user) {
      const prefix = user.email?.split('@')[0] || 'My';
      setHouseholdName(suggestedName('personal', prefix));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  const chooseType = (type: HouseholdType) => {
    setHouseholdType(type);
    const prefix = user?.email?.split('@')[0] || 'My';
    setHouseholdName(suggestedName(type, prefix));
  };

  const handleCreateHousehold = async () => {
    setError('');
    setCreating(true);
    try {
      const name = householdName.trim() || 'My Household';
      const id = await createHousehold(name, { currency: country.currency });
      setCreatedHouseholdId(id);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your household. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const finish = async (action: StartAction) => {
    if (action === 'sample') {
      setSeeding(true);
      try {
        const hid = createdHouseholdId || currentHousehold?.firebaseId;
        if (hid) await seedSampleInventory(hid, user?.uid || null, country.units);
      } catch (e) {
        console.error('[onboarding] sample seed failed:', e);
      } finally {
        setSeeding(false);
      }
    }

    setMode(householdType === 'business' ? 'business' : 'personal');
    markOnboarded();

    const dest =
      householdType === 'business'
        ? '/business/dashboard'
        : action === 'manual'
        ? '/inventory'
        : action === 'scan'
        ? '/scan'
        : '/dashboard';
    router.replace(dest);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const progress = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Top bar: logo + progress */}
      <div className="px-4 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <Logo size="md" />
          <span className="text-xs font-semibold text-gray-400">
            Step {step + 1} of {STEP_LABELS.length}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="mt-2 hidden sm:flex justify-between">
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={`text-[11px] font-medium ${
                i <= step ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start sm:items-center justify-center px-4 py-4">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {/* ── STEP 0: WELCOME ───────────────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8"
              >
                <div className="text-4xl mb-3">👋</div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                  Welcome to PantryPlus
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Your smart kitchen, organized. Let’s get you set up in under a minute.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {WELCOME_FEATURES.map((f) => (
                    <div key={f.title} className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                        <f.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{f.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Get started <ArrowRightIcon className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* ── STEP 1: REGION ────────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="region"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8"
              >
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  Where are you cooking? 🌍
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This personalizes your currency, measurement units, and the AI’s local cuisine
                  and price suggestions.
                </p>

                <label htmlFor="ob-country" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <select
                  id="ob-country"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.currencySymbol})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="rounded-2xl bg-gray-50 dark:bg-gray-700/40 p-4 text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Currency</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">{country.currency}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 dark:bg-gray-700/40 p-4 text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Units</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white capitalize">{country.units}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 dark:bg-gray-700/40 p-4 text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Example</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">{formatPrice(12.5)}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(0)}
                    className="px-5 py-4 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold rounded-2xl border border-gray-200 dark:border-gray-600 transition-all hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: HOUSEHOLD ─────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="household"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8"
              >
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  Set up your space 🏠
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Who are you setting this up for?
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {HOUSEHOLD_TYPES.map((t) => {
                    const active = householdType === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => chooseType(t.value)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          active
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <t.icon
                          className={`w-6 h-6 mb-2 ${
                            active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                          }`}
                        />
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{t.title}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                          {t.blurb}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <label htmlFor="ob-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {householdType === 'business' ? 'Business name' : 'Household name'}
                </label>
                <input
                  id="ob-name"
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder="e.g. Smith Family, Our Home"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />

                {error && (
                  <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    disabled={creating}
                    className="px-5 py-4 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold rounded-2xl border border-gray-200 dark:border-gray-600 transition-all hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCreateHousehold}
                    disabled={creating}
                    className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {creating ? 'Creating…' : 'Create & continue'}
                    {!creating && <ArrowRightIcon className="w-5 h-5" />}
                  </button>
                </div>

                <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
                  Have an invitation?{' '}
                  <Link href="/household/join" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Join a household
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 3: GET STARTED ───────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="kickstart"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-7 h-7 text-green-500" />
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">You’re all set!</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  How would you like to begin?
                </p>

                {householdType === 'business' ? (
                  <div className="space-y-3">
                    <KickstartCard
                      icon={BuildingStorefrontIcon}
                      title="Open Business Dashboard"
                      desc="Recipe costing, orders and KPIs for your kitchen."
                      recommended
                      onClick={() => finish('explore')}
                    />
                    <KickstartCard
                      icon={ArchiveBoxIcon}
                      title="Add stock first"
                      desc="Start by adding ingredients to your inventory."
                      onClick={() => finish('manual')}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <KickstartCard
                      icon={Squares2X2Icon}
                      title="Start with sample data"
                      desc={`Add ${SAMPLE_ITEM_COUNT} common pantry items so you can explore right away.`}
                      recommended
                      loading={seeding}
                      onClick={() => finish('sample')}
                    />
                    <KickstartCard
                      icon={CameraIcon}
                      title="Scan a receipt"
                      desc="Snap a grocery receipt and let AI fill your pantry."
                      disabled={seeding}
                      onClick={() => finish('scan')}
                    />
                    <KickstartCard
                      icon={PlusIcon}
                      title="Add my first item"
                      desc="Go to inventory and add items manually."
                      disabled={seeding}
                      onClick={() => finish('manual')}
                    />
                  </div>
                )}

                <button
                  onClick={() => finish('explore')}
                  disabled={seeding}
                  className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium disabled:opacity-50"
                >
                  Skip — I’ll explore on my own
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function KickstartCard({
  icon: Icon,
  title,
  desc,
  onClick,
  recommended,
  loading,
  disabled,
}: {
  icon: typeof ArchiveBoxIcon;
  title: string;
  desc: string;
  onClick: () => void;
  recommended?: boolean;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all active:scale-[0.99] disabled:opacity-50 ${
        recommended
          ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20 hover:bg-primary-50'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div
        className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
          recommended
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
        }`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-gray-900 dark:text-white">{title}</p>
          {recommended && (
            <span className="text-[9px] font-black uppercase tracking-wide bg-primary-600 text-white px-1.5 py-0.5 rounded-full">
              Recommended
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{loading ? 'Adding items…' : desc}</p>
      </div>
      <ArrowRightIcon className="w-5 h-5 text-gray-300 shrink-0" />
    </button>
  );
}
