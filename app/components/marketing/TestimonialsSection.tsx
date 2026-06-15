/**
 * Testimonials / project-impact section. Server component.
 */
import { testimonials } from '@/lib/marketing';

export default function TestimonialsSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Real impact for real kitchens
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Built to help students, families, and small food businesses eat better, waste less, and spend smarter.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <blockquote className="flex-1 text-gray-700 dark:text-gray-300">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-xl dark:bg-primary-900/30">{t.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
