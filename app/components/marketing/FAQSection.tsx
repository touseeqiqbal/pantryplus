'use client';

/**
 * Accordion FAQ. Client component (expand/collapse).
 * Accepts an optional subset/limit so it can be reused as a homepage preview.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { faqs as allFaqs, type FAQItem } from '@/lib/marketing';

interface FAQSectionProps {
  items?: FAQItem[];
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default function FAQSection({
  items = allFaqs,
  limit,
  title = 'Frequently asked questions',
  subtitle,
}: FAQSectionProps) {
  const list = limit ? items.slice(0, limit) : items;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>}
      </div>

      <div className="mt-12 divide-y divide-gray-200 rounded-2xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {list.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={faq.question}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                <ChevronDownIcon className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
