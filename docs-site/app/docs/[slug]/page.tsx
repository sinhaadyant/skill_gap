import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getAllDocSlugs, getDocBySlug } from '@/lib/content';
import { TableOfContents } from '@/components/TableOfContents';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const doc = await getDocBySlug(slug);
    return {
      title: `${doc.frontmatter.title} | Interview Knowledge Base`,
      description: doc.frontmatter.summary
    };
  } catch (error) {
    return {
      title: 'Topic not found'
    };
  }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const doc = await getDocBySlug(slug);

    return (
      <div className="flex w-full flex-col gap-8 lg:flex-row">
        <article className="flex min-w-0 flex-1 flex-col space-y-8 rounded-3xl border border-slate-800 bg-surface/80 p-6 shadow-soft-card sm:p-8">
          <header className="space-y-4 border-b border-slate-800 pb-6">
            <p className="text-xs uppercase tracking-wide text-muted">
              Topic {String(doc.frontmatter.order).padStart(2, '0')}
            </p>
            <h1 className="text-fluid-lg font-semibold text-white">{doc.frontmatter.title}</h1>
            {doc.frontmatter.summary && <p className="text-fluid-base text-muted">{doc.frontmatter.summary}</p>}
            {doc.frontmatter.tags?.length > 0 && (
              <p className="text-xs uppercase tracking-wide text-accent-2">
                {doc.frontmatter.tags.join(' · ')}
              </p>
            )}
          </header>
          <div className="prose prose-invert max-w-none prose-pre:rounded-xl prose-pre:bg-transparent">
            {doc.content as ReactNode}
          </div>
        </article>
        <TableOfContents headings={doc.headings} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
