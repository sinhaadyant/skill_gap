'use client';

import { useEffect, useState } from 'react';
import { SearchBar } from './SearchBar';

export function SearchDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-surface px-3 py-2 text-sm text-muted shadow-soft-card transition hover:border-accent-1 hover:text-accent-1 focus-visible:ring-accent-2"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m21 21-4.35-4.35" />
          <circle cx="11" cy="11" r="7" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded bg-slate-800 px-1 text-[10px] font-medium text-muted sm:inline">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-16 backdrop-blur">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-surface/95 p-5 shadow-soft-card">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Search Docs</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-muted transition hover:text-accent-1 focus-visible:ring-accent-2"
              >
                Close
              </button>
            </div>
            <div className="mt-4">
              <SearchBar autoFocus onResultSelect={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
