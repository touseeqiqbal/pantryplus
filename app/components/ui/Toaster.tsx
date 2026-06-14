'use client';

/**
 * Global UI feedback system: smooth toasts + a promise-based confirm dialog.
 *
 * Replaces jarring native alert()/confirm() popups with animated, on-brand
 * notifications. Use via the useUI() hook:
 *
 *   const { toast, confirm } = useUI();
 *   toast('Saved!', 'success');
 *   if (await confirm({ message: 'Delete this?', danger: true })) { ... }
 */

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface UIContextValue {
  toast: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const UIContext = createContext<UIContextValue | null>(null);

const toastStyles: Record<ToastType, { ring: string; icon: ReactNode }> = {
  success: {
    ring: 'border-green-200 dark:border-green-800',
    icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  },
  error: {
    ring: 'border-red-200 dark:border-red-800',
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
  },
  info: {
    ring: 'border-blue-200 dark:border-blue-800',
    icon: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
  },
};

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-dismiss after 4s.
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      setConfirmState({ ...options, resolve });
    });
  }, []);

  const closeConfirm = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast stack */}
      <div className="fixed top-4 right-4 z-[2000] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl border ${toastStyles[t.type].ring}`}
            >
              <div className="shrink-0 mt-0.5">{toastStyles[t.type].icon}</div>
              <p className="flex-1 text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Dismiss"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {confirmState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => closeConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              {confirmState.title && (
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {confirmState.title}
                </h3>
              )}
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                {confirmState.message}
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => closeConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {confirmState.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => closeConfirm(true)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-semibold transition-colors ${
                    confirmState.danger
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {confirmState.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </UIContext.Provider>
  );
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) {
    // Fallback to native dialogs if used outside the provider (keeps callers safe).
    return {
      toast: (message: string) => {
        if (typeof window !== 'undefined') window.alert(message);
      },
      confirm: ({ message }: ConfirmOptions) =>
        Promise.resolve(typeof window !== 'undefined' ? window.confirm(message) : false),
    };
  }
  return ctx;
}
