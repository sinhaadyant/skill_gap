"use client";

import { useState, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { SearchDialog } from "@/components/SearchDialog";
import type { DocMeta } from "@/lib/content";

interface ResponsiveShellProps {
  docs: DocMeta[];
  children: ReactNode;
}

export function ResponsiveShell({ docs, children }: ResponsiveShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar
        docs={docs}
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-surface/90 backdrop-blur">
          <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-surface text-accent-1 transition hover:text-white focus-visible:ring-accent-1 md:hidden"
                aria-label="Toggle topic navigation"
                aria-expanded={isSidebarOpen}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link
                href="/"
                className="text-lg font-semibold text-accent-1 focus-visible:ring-accent-2"
              >
                Interview KB
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Suspense fallback={null}>
                <SearchDialog />
              </Suspense>
            </div>
          </div>
        </header>
        <main
          id="main"
          className="flex w-full flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
