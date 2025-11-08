'use client';

import { useState } from 'react';

interface CopyButtonProps {
  code: string;
}

export function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code snippet', error);
    }
  }

  return (
    <button
      type="button"
      aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
      className="absolute right-3 top-3 rounded-md border border-slate-600 bg-surface-dark/80 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-accent-orange hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-orange"
      onClick={handleCopy}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
