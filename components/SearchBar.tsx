'use client';

import { useEffect, useRef, useState } from 'react';
import type Fuse from 'fuse.js';
import type { IFuseOptions, FuseResult } from 'fuse.js';
import Link from 'next/link';

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onResultSelect?: () => void;
}

type SectionEntry = {
  id: string;
  title: string;
  depth: number;
  content: string;
};

type SearchIndexDoc = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  body: string;
  questions?: string[];
  sections?: SectionEntry[];
};

type SearchEntry = {
  type: 'doc' | 'section';
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  body: string;
  questions?: string[];
  sectionId?: string;
  sectionTitle?: string;
  sectionContent?: string;
};

const fuseOptions: IFuseOptions<SearchEntry> = {
  keys: [
    { name: 'title', weight: 0.25 },
    { name: 'sectionTitle', weight: 0.25 },
    { name: 'summary', weight: 0.1 },
    { name: 'tags', weight: 0.1 },
    { name: 'body', weight: 0.15 },
    { name: 'sectionContent', weight: 0.1 },
    { name: 'questions', weight: 0.05 }
  ],
  threshold: 0.3,
  minMatchCharLength: 2,
  includeScore: true
};

function expandEntries(docs: SearchIndexDoc[]): SearchEntry[] {
  const expanded: SearchEntry[] = [];

  docs.forEach((doc) => {
    expanded.push({
      type: 'doc',
      slug: doc.slug,
      title: doc.title,
      summary: doc.summary,
      tags: doc.tags,
      body: doc.body,
      questions: doc.questions
    });

    doc.sections?.forEach((section) => {
      expanded.push({
        type: 'section',
        slug: doc.slug,
        title: doc.title,
        summary: doc.summary,
        tags: doc.tags,
        body: doc.body,
        questions: doc.questions,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionContent: section.content
      });
    });
  });

  return expanded;
}

export function SearchBar({ placeholder = 'Search documentation...', autoFocus, onResultSelect }: SearchBarProps) {
  const fuseRef = useRef<Fuse<SearchEntry> | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FuseResult<SearchEntry>[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadIndex() {
      const res = await fetch('/search_index.json');
      if (!res.ok) return;
      const docs: SearchIndexDoc[] = await res.json();
      const expanded = expandEntries(docs);
      const { default: FuseModule } = await import('fuse.js');
      fuseRef.current = new FuseModule(expanded, fuseOptions);
    }
    loadIndex().catch((error) => console.error('Failed to load search index', error));
  }, []);

  useEffect(() => {
    if (!fuseRef.current || query.trim().length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = window.setTimeout(() => {
      const searchResults = fuseRef.current?.search(query, { limit: 30 }) ?? [];
      setResults(searchResults);
      setLoading(false);
    }, 120);

    return () => window.clearTimeout(handle);
  }, [query]);

  const hasResults = results.length > 0;

  return (
    <div className="relative w-full">
      <label htmlFor="global-search" className="sr-only">
        Search documentation
      </label>
      <input
        id="global-search"
        type="search"
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-800 bg-surface px-4 py-3 text-sm text-muted shadow-soft-card outline-none transition focus-visible:ring-accent-2"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
        autoFocus={autoFocus}
      />
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted">Searching…</div>
      )}
      {hasResults && (
        <ul className="absolute z-20 mt-2 max-h-[65vh] w-full space-y-3 overflow-y-auto rounded-2xl border border-slate-800 bg-surface/95 p-4 shadow-soft-card backdrop-blur">
          {results.map(({ item }) => {
            const href = `/docs/${item.slug}${item.sectionId ? `#${item.sectionId}` : ''}`;
            const isSection = item.type === 'section';
            return (
              <li key={`${item.slug}${item.sectionId ?? ''}`}>
                <Link
                  href={href}
                  className="flex flex-col gap-1 rounded-xl border border-transparent px-3 py-3 transition hover:border-accent-2 hover:bg-slate-800/40 hover:text-white focus-visible:ring-accent-2"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    onResultSelect?.();
                  }}
                >
                  <p className="text-sm font-semibold leading-snug text-white">
                    {isSection ? item.sectionTitle : item.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    {isSection && (
                      <span className="font-medium text-accent-2">{item.title}</span>
                    )}
                    {!isSection && item.summary && (
                      <span className="text-muted">{item.summary}</span>
                    )}
                  </div>
                  {item.sectionTitle && item.sectionContent && (
                    <p className="text-xs leading-relaxed text-muted">{item.sectionContent}</p>
                  )}
                  {item.tags?.length > 0 && (
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-accent-2">
                      {item.tags.join(' · ')}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
