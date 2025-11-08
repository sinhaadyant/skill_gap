import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

export const rewriteLinks: Plugin = () => {
  return (tree: any) => {
    visit(tree, 'link', (node: any) => {
      if (!node.url || typeof node.url !== 'string') return;
      if (node.url.startsWith('./')) {
        const cleaned = node.url
          .replace(/^\.\//, '')
          .replace(/\.mdx?$/, '');
        node.url = `/docs/${cleaned}`;
      }
    });
  };
};
