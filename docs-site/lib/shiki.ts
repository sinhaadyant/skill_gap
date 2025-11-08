import { createHighlighter, type Highlighter } from 'shiki';

const globalForShiki = globalThis as unknown as {
  __shikiHighlighter?: Highlighter;
  __shikiPromise?: Promise<Highlighter>;
};

async function getSingletonHighlighter() {
  if (globalForShiki.__shikiHighlighter) {
    return globalForShiki.__shikiHighlighter;
  }

  if (!globalForShiki.__shikiPromise) {
    globalForShiki.__shikiPromise = createHighlighter({
      themes: ['github-dark'],
      langs: ['typescript', 'tsx', 'jsx', 'javascript', 'json', 'bash', 'sql', 'java', 'markdown']
    }).then((instance) => {
      globalForShiki.__shikiHighlighter = instance;
      return instance;
    });
  }

  return globalForShiki.__shikiPromise;
}

export async function highlightCode(code: string, lang: string) {
  const highlighter = await getSingletonHighlighter();
  let language = lang.toLowerCase();
  if (!highlighter.getLoadedLanguages().includes(language)) {
    language = 'text';
  }
  return highlighter.codeToHtml(code, {
    lang: language,
    theme: 'github-dark'
  });
}
