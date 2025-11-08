import Link from 'next/link';
import { getAllDocsMeta } from '@/lib/content';
import { SearchBar } from '@/components/SearchBar';

export const revalidate = 60;

export default async function HomePage() {
  const docs = await getAllDocsMeta();

  return (
    <section className="flex w-full flex-col gap-10">
      <header className="flex w-full flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold text-white sm:text-[2.5rem] sm:leading-tight">Interview Knowledge Base</h1>
        <p className="text-muted text-fluid-base sm:max-w-2xl">
          Explore curated notes, examples, and follow-up questions to prepare for Java, Spring, SQL, and system design interviews.
        </p>
        <div className="flex w-full justify-center">
          <div className="flex w-full max-w-xl flex-col items-center gap-3">
            <SearchBar placeholder="Search topics, tags, and code snippets" />
          </div>
        </div>
      </header>

      <ol className="flex w-full list-none flex-wrap gap-4">
        {docs.map((doc) => (
          <li key={doc.slug} className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-surface/80 p-6 shadow-soft-card transition hover:-translate-y-1 hover:border-accent-1">
            <Link
              href={`/docs/${doc.slug}`}
              className="flex h-full flex-col space-y-3 focus-visible:ring-accent-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wide text-muted">
                    Topic {String(doc.order).padStart(2, '0')}
                  </span>
                  <h2 className="text-lg font-semibold text-white transition group-hover:text-accent-1">
                    {doc.title}
                  </h2>
                </div>
                <span className="hidden rounded-full border border-accent-1 px-3 py-1 text-xs font-semibold uppercase text-accent-1 md:inline-block">
                  Read
                </span>
              </div>
              {doc.summary && <p className="text-sm text-muted">{doc.summary}</p>}
              {doc.tags.length > 0 && (
                <p className="mt-auto text-xs uppercase tracking-wide text-accent-2">{doc.tags.join(' · ')}</p>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
