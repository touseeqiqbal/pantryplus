import Link from 'next/link';
import PageHero from '@/app/components/marketing/PageHero';
import SEOJsonLd, { breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';
import { getAllPosts } from '@/lib/blog';

export const metadata = buildMetadata({
  title: 'Blog',
  path: '/blog',
  description: 'The Pantry Plus blog — practical guides on reducing food waste, AI meal planning, grocery budgeting, pantry inventory and offline-first apps.',
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <SEOJsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])} />
      <PageHero
        eyebrow="Blog"
        title="Eat better, waste less, spend smarter"
        subtitle="Practical guides on food waste, meal planning, grocery budgets and smart kitchens."
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="text-3xl">{post.emoji}</span>
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{post.category}</span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">{post.title}</h2>
              <p className="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-400">{post.excerpt}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>·</span>
                <span>{post.readingMinutes} min read</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
