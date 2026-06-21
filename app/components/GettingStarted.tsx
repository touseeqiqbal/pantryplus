'use client';

/**
 * Dashboard "Getting Started" checklist — the post-wizard nudge that guides a
 * fresh account through its first real actions. The first task is data-driven
 * (do you have any inventory?); the rest are marked done when the user taps the
 * shortcut. Dismissable, and auto-hidden once everything is complete.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArchiveBoxIcon,
  ShoppingCartIcon,
  SparklesIcon,
  CameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import {
  dismissChecklist,
  isChecklistDismissed,
  isStepDone,
  markStepDone,
  type GettingStartedStep,
} from '@/lib/onboarding';

interface GettingStartedProps {
  itemCount: number;
}

interface Task {
  key: 'inventory' | GettingStartedStep;
  label: string;
  desc: string;
  href: string;
  icon: typeof ArchiveBoxIcon;
  /** When true, completion is derived from data, not a click flag. */
  dataDriven?: boolean;
}

const TASKS: Task[] = [
  { key: 'inventory', label: 'Add your first item', desc: 'Stock your pantry so the app comes alive.', href: '/inventory', icon: ArchiveBoxIcon, dataDriven: true },
  { key: 'shopping', label: 'Build a shopping list', desc: 'Plan your next grocery run.', href: '/shopping', icon: ShoppingCartIcon },
  { key: 'scan', label: 'Scan a receipt', desc: 'Let AI fill your pantry from a photo.', href: '/scan', icon: CameraIcon },
  { key: 'assistant', label: 'Ask the AI assistant', desc: 'Get recipes from what you already have.', href: '/assistant', icon: SparklesIcon },
];

export default function GettingStarted({ itemCount }: GettingStartedProps) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [stepFlags, setStepFlags] = useState<Record<GettingStartedStep, boolean>>({
    shopping: false,
    scan: false,
    assistant: false,
  });

  useEffect(() => {
    setMounted(true);
    setDismissed(isChecklistDismissed());
    setStepFlags({
      shopping: isStepDone('shopping'),
      scan: isStepDone('scan'),
      assistant: isStepDone('assistant'),
    });
  }, []);

  const isDone = (t: Task) =>
    t.dataDriven ? itemCount > 0 : stepFlags[t.key as GettingStartedStep];

  const completed = TASKS.filter(isDone).length;
  const total = TASKS.length;
  const pct = Math.round((completed / total) * 100);

  const handleDismiss = () => {
    dismissChecklist();
    setDismissed(true);
  };

  const handleTaskClick = (t: Task) => {
    if (!t.dataDriven) {
      markStepDone(t.key as GettingStartedStep);
      setStepFlags((prev) => ({ ...prev, [t.key]: true }));
    }
  };

  // Avoid SSR/client mismatch from localStorage; hide when dismissed or finished.
  if (!mounted || dismissed || completed === total) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="card p-6 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800 border border-primary-100 dark:border-primary-800/50"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🚀 Getting started
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {completed} of {total} done — finish setting up your kitchen.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss checklist"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-primary-100 dark:bg-primary-900/40 overflow-hidden mb-5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {TASKS.map((t) => {
            const done = isDone(t);
            return (
              <Link
                key={t.key}
                href={t.href}
                onClick={() => handleTaskClick(t)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  done
                    ? 'border-green-200 dark:border-green-800/50 bg-green-50/60 dark:bg-green-900/15'
                    : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/50 hover:border-primary-300 hover:shadow-sm'
                }`}
              >
                {done ? (
                  <CheckCircleIcon className="w-7 h-7 text-green-500 shrink-0" />
                ) : (
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <t.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      done
                        ? 'text-gray-400 dark:text-gray-500 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {t.label}
                  </p>
                  {!done && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.desc}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
