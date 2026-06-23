'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/app/components/Logo';
import { friendlyAuthError } from '@/lib/utils/authErrors';
import { EnvelopeIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      // Don't reveal whether an account exists — show the same confirmation for
      // "no such user" as for a real send. Surface only actionable errors.
      if ((err as { code?: string })?.code === 'auth/user-not-found') {
        setSent(true);
      } else {
        setError(friendlyAuthError(err, 'Could not send the reset email. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircleIcon className="h-9 w-9 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your inbox</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                If an account exists for <span className="font-semibold text-gray-900 dark:text-white">{email}</span>,
                we&apos;ve sent a link to reset your password. It may take a minute to arrive — remember to
                check your spam folder.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Reset your password
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                Enter your email and we&apos;ll send you a link to set a new password.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
