'use client';

/**
 * Contact form (UI only). Validates with Zod and shows a mock success toast.
 * TODO: POST to a real email/backend service (e.g. /api/contact, Resend,
 * Formspree) — the validated payload is ready to send.
 */
import { useState } from 'react';
import { z } from 'zod';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useUI } from '@/app/components/ui/Toaster';
import { track } from '@/lib/analytics';

export const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  email: z.string().email('Please enter a valid email.'),
  subject: z.string().min(3, 'Please add a subject.'),
  message: z.string().min(10, 'Please write at least 10 characters.'),
});

type ContactValues = z.infer<typeof contactSchema>;
type FieldErrors = Partial<Record<keyof ContactValues, string>>;

const empty: ContactValues = { name: '', email: '', subject: '', message: '' };

export default function ContactForm() {
  const { toast } = useUI();
  const [values, setValues] = useState<ContactValues>(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (k: keyof ContactValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      // TODO: replace with a real request, e.g.
      //   await fetch('/api/contact', { method: 'POST', body: JSON.stringify(parsed.data) })
      await new Promise((r) => setTimeout(r, 700));
      track('contact_submitted', { subject: parsed.data.subject });
      toast('Thanks! Your message has been sent. We’ll get back to you soon.', 'success');
      setValues(empty);
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input id="name" name="name" autoComplete="name" value={values.name} onChange={update('name')} className={inputCls} placeholder="Your name" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={update('email')} className={inputCls} placeholder="you@example.com" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
        <input id="subject" name="subject" value={values.subject} onChange={update('subject')} className={inputCls} placeholder="How can we help?" />
        {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
        <textarea id="message" name="message" rows={5} value={values.message} onChange={update('message')} className={inputCls} placeholder="Tell us a bit more…" />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? 'Sending…' : (<>Send message <PaperAirplaneIcon className="h-4 w-4" /></>)}
      </button>
    </form>
  );
}
