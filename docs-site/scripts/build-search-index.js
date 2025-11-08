#!/usr/bin/env node
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const matter = require('gray-matter');
const { unified } = require('unified');
const remarkParseImport = require('remark-parse');
const remarkParse = remarkParseImport.default || remarkParseImport;
const { visit } = require('unist-util-visit');
const { default: GithubSlugger } = require('github-slugger');
const { toString } = require('mdast-util-to-string');

const CONTENT_DIR = path.join(process.cwd(), 'content');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'search_index.json');
const SUPPORTED_EXT = ['.md', '.mdx'];

const createProcessor = () => unified().use(remarkParse);

function extractSections(markdown) {
  const tree = createProcessor().parse(markdown);
  const children = tree.children ?? [];
  const slugger = new GithubSlugger();
  const sections = [];

  for (let index = 0; index < children.length; index += 1) {
    const node = children[index];
    if (node.type === 'heading' && node.depth <= 4) {
      const title = toString(node).trim();
      if (!title) continue;
      const id = slugger.slug(title);
      const paragraphs = [];
      for (let lookahead = index + 1; lookahead < children.length; lookahead += 1) {
        const sibling = children[lookahead];
        if (sibling.type === 'heading' && sibling.depth <= node.depth) {
          break;
        }
        if (sibling.type === 'paragraph') {
          const text = toString(sibling).trim();
          if (text) {
            paragraphs.push(text);
          }
        }
        if (paragraphs.length >= 3) {
          break;
        }
      }
      sections.push({
        id,
        title,
        depth: node.depth,
        content: paragraphs.join(' ')
      });
    }
  }

  return sections;
}

async function markdownToText(markdown) {
  const tree = createProcessor().parse(markdown);
  const paragraphs = [];
  visit(tree, 'paragraph', (node) => {
    const paragraph = toString(node).replace(/\s+/g, ' ').trim();
    if (paragraph) {
      paragraphs.push(paragraph);
    }
  });
  return paragraphs.join('\n');
}

async function extractQuestions(markdown) {
  const tree = createProcessor().parse(markdown);
  const questions = [];
  visit(tree, 'paragraph', (node) => {
    const text = toString(node).trim();
    if (text.endsWith('?')) {
      questions.push(text);
    }
  });
  return questions;
}

async function buildIndex() {
  try {
    const entries = await fsp.readdir(CONTENT_DIR);
    const files = entries.filter((file) => SUPPORTED_EXT.some((ext) => file.endsWith(ext)));

    const docs = [];

    for (const file of files) {
      const raw = await fsp.readFile(path.join(CONTENT_DIR, file), 'utf8');
      const { data, content } = matter(raw);

      const slug = file.replace(/\.mdx?$/, '');
      const body = await markdownToText(content);
      const questions = await extractQuestions(content);
      const sections = extractSections(content);

      docs.push({
        slug,
        title: data.title ?? slug,
        summary: data.summary ?? '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        order: typeof data.order === 'number' ? data.order : 999,
        body,
        questions,
        sections
      });
    }

    docs.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

    await fsp.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    await fsp.writeFile(OUTPUT_FILE, JSON.stringify(docs, null, 2));
    console.log(`Search index generated with ${docs.length} entries.`);
  } catch (error) {
    console.error('Failed to build search index', error);
    process.exit(1);
  }
}

buildIndex();
