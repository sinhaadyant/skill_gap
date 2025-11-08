import Link from 'next/link';
import type { Heading } from '@/lib/content';

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <aside className="sticky top-28 hidden w-64 shrink-0 xl:block">
      <div className="rounded-xl border border-slate-800 bg-surface/80 p-4 shadow-soft-card">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">On this page</h2>
        <nav className="mt-3 space-y-2 text-sm text-muted">
          {headings.map((heading) => (
            <Link
              key={heading.id}
              href={`#${heading.id}`}
              className={`block rounded-md px-2 py-1 transition hover:bg-slate-800/60 hover:text-white focus-visible:ring-accent-2 ${
                heading.depth === 3 ? 'ml-4 text-xs' : ''
              }`}
            >
              {heading.text}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
