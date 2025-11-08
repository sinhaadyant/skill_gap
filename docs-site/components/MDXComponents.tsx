import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { CodeBlock } from './CodeBlock';

function Note({ type = 'tip', children }: { type?: 'tip' | 'info' | 'warning'; children: ReactNode }) {
  const colorMap = {
    tip: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100',
    info: 'border-blue-500/60 bg-blue-500/10 text-blue-100',
    warning: 'border-amber-500/60 bg-amber-500/10 text-amber-100'
  } as const;

  return (
    <div className={clsx('my-6 rounded-xl border px-4 py-3 text-sm shadow-soft-card', colorMap[type])}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">{type}</p>
      <div className="mt-2 space-y-2 text-base text-slate-100">{children}</div>
    </div>
  );
}

function Example({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-slate-700 bg-slate-900/60 p-5 shadow-soft-card">
      <p className="text-sm uppercase tracking-wide text-accent-orange">Example</p>
      <div className="mt-3 space-y-2 text-slate-100">{children}</div>
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  Note,
  Example,
  pre: (props) => <CodeBlock {...props} />
};
