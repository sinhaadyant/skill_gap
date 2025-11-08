import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.css';
import { getAllDocsMeta } from '@/lib/content';
import { ResponsiveShell } from '@/components/ResponsiveShell';

export const metadata: Metadata = {
  title: 'Interview Knowledge Base',
  description: 'Documentation hub with MDX topics, search, and real-time updates.'
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const docs = await getAllDocsMeta();

  return (
    <html lang="en">
      <body className="bg-bg-default text-slate-100">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ResponsiveShell docs={docs}>{children}</ResponsiveShell>
      </body>
    </html>
  );
}
