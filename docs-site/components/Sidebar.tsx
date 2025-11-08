'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { DocMeta } from '@/lib/content';

interface SidebarProps {
  docs: DocMeta[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function Sidebar({ docs, isOpen, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isActivePath = (slug: string) => pathname?.startsWith(`/docs/${slug}`);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur md:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
      <nav
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-800 bg-surface/95 text-slate-100 transition-transform duration-200 md:static md:z-0 md:translate-x-0 md:bg-surface/80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Documentation topics"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 md:hidden">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent-1">Topics</h2>
          <button
            type="button"
            onClick={onToggle}
            data-testid="sidebar-toggle"
            aria-expanded={isOpen}
            aria-controls="sidebar-topics"
            className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-100 focus-visible:ring-accent-1"
          >
            Close
          </button>
        </div>
        <ul id="sidebar-topics" className="flex h-full flex-col gap-4 overflow-y-auto px-6 py-6 sidebar-scroll">
          {docs.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/docs/${doc.slug}`}
                onClick={onClose}
                className={`flex flex-col gap-2 rounded-xl border px-4 py-3 text-sm transition focus-visible:ring-accent-2 ${
                  isActivePath(doc.slug)
                    ? 'border-accent-1 bg-accent-1/10 text-white'
                    : 'border-transparent bg-transparent text-muted hover:border-accent-2 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-xs uppercase tracking-wide text-muted">
                  Topic {String(doc.order).padStart(2, '0')}
                </span>
                <span className="text-left text-base font-medium text-white">{doc.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
