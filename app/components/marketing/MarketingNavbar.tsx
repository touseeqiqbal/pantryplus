'use client';

/**
 * Public marketing navigation bar.
 * Auth-aware: shows "Go to Dashboard" when signed in, otherwise Sign in / Get
 * started. Includes a responsive mobile menu. Used by the (marketing) layout.
 */
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Logo from '@/app/components/Logo';
import { useAuth } from '@/lib/hooks/useAuth';

const links = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Demo', href: '/demo' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'FAQ', href: '/faq' },
];

export default function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-[1100] border-b border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary">
        <Link href="/" aria-label="Pantry Plus home">
          <Logo size="md" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              {l.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-200 dark:border-gray-800 md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {l.name}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
                {user ? (
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-xl bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin" onClick={() => setOpen(false)} className="rounded-xl border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      Sign in
                    </Link>
                    <Link href="/auth/signup" onClick={() => setOpen(false)} className="rounded-xl bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
