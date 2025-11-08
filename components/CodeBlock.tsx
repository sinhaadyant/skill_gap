import type { ReactElement } from 'react';
import { highlightCode } from '@/lib/shiki';
import { CopyButton } from './CopyButton';

type PreProps = {
  children: ReactElement<{ className?: string; children?: string | string[] }>;
};

export async function CodeBlock({ children }: PreProps) {
  const child = children.props;
  const rawCode = Array.isArray(child.children)
    ? child.children.join('')
    : child.children ?? '';
  const languageClass = child.className ?? '';
  const language = languageClass.replace('language-', '') || 'text';

  const highlighted = await highlightCode(rawCode, language);

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-slate-700 bg-[#0d1c3f] shadow-soft-card">
      <CopyButton code={rawCode} />
      <div
        className="code-block overflow-auto p-4 text-sm"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
