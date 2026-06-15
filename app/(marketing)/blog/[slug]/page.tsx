import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import CTASection from '@/app/components/marketing/CTASection';
import SEOJsonLd, { articleSchema, breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';
import { getAllPosts, getPostBySlug } from '@/lib/blog';

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return buildMetadata({ title: 'Post not found', path: `/blog/${params.slug}`, noIndex: true });
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    type: 'article',
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <>
      <SEOJsonLd
        data={[
          articleSchema({ title: post.title, description: post.excerpt, slug: post.slug, date: post.date, author: post.author }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
          <ArrowLeftIcon className="h-4 w-4" /> All posts
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-4xl">{post.emoji}</span>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{post.category}</span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl text-balance">{post.title}</h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <span>{post.author}</span><span>·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time><span>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>

        <div className="mt-8 space-y-6">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{post.excerpt}</p>
          {post.body.map((section, i) => (
            <section key={i}>
              {section.heading && <h2 className="mt-8 text-xl font-bold text-gray-900 dark:text-white">{section.heading}</h2>}
              {section.paragraphs.map((p, j) => (
                <p key={j} className="mt-3 leading-relaxed text-gray-600 dark:text-gray-400">{p}</p>
              ))}
              {section.bullets && (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                      <span className="mt-1 text-accent-500">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>

      <CTASection title="Put these ideas on autopilot" subtitle="Pantry Plus does the planning, scanning and saving for you." />
    </>
  );
}
