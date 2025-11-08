import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import { mdxComponents } from '@/components/MDXComponents';
import { rewriteLinks } from './remark-rewrite-links';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const SUPPORTED_EXTENSIONS = ['.md', '.mdx'];

export type DocFrontmatter = {
  title: string;
  order: number;
  summary: string;
  tags: string[];
};

export type DocMeta = DocFrontmatter & {
  slug: string;
};

export type Heading = {
  id: string;
  text: string;
  depth: number;
};

function slugFromFilename(filename: string): string {
  const ext = SUPPORTED_EXTENSIONS.find((extension) => filename.endsWith(extension));
  const name = ext ? filename.slice(0, -ext.length) : filename;
  return name;
}

async function readContentFiles(): Promise<string[]> {
  const entries = await fs.readdir(CONTENT_DIR);
  return entries.filter((entry) => SUPPORTED_EXTENSIONS.some((ext) => entry.endsWith(ext)));
}

export async function getAllDocsMeta(): Promise<DocMeta[]> {
  const filenames = await readContentFiles();
  const metas: DocMeta[] = [];

  for (const filename of filenames) {
    const filePath = path.join(CONTENT_DIR, filename);
    const raw = await fs.readFile(filePath, 'utf8');
    const { data } = matter(raw);
    const frontmatter = data as Partial<DocFrontmatter>;

    if (!frontmatter.title || typeof frontmatter.title !== 'string') {
      throw new Error(`Missing required frontmatter "title" in ${filename}`);
    }
    if (typeof frontmatter.order !== 'number') {
      throw new Error(`Missing required numeric frontmatter "order" in ${filename}`);
    }

    metas.push({
      title: frontmatter.title,
      order: frontmatter.order,
      summary: frontmatter.summary ?? '',
      tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
      slug: slugFromFilename(filename)
    });
  }

  return metas.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export async function getDocBySlug(slug: string) {
  const filename = SUPPORTED_EXTENSIONS.map((ext) => `${slug}${ext}`).find(async (candidate) => {
    try {
      await fs.access(path.join(CONTENT_DIR, candidate));
      return true;
    } catch (error) {
      return false;
    }
  });

  let resolvedFilename: string | null = null;
  for (const ext of SUPPORTED_EXTENSIONS) {
    const candidate = `${slug}${ext}`;
    try {
      await fs.access(path.join(CONTENT_DIR, candidate));
      resolvedFilename = candidate;
      break;
    } catch {
      // continue searching
    }
  }

  if (!resolvedFilename) {
    throw new Error(`Document not found for slug ${slug}`);
  }

  const fullPath = path.join(CONTENT_DIR, resolvedFilename);
  const source = await fs.readFile(fullPath, 'utf8');

  const headings = extractHeadings(source);

  const { content, frontmatter } = await compileMDX<DocFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm, rewriteLinks],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'append',
              properties: {
                className: ['heading-anchor'],
                ariaHidden: 'true'
              }
            }
          ]
        ]
      }
    },
    components: mdxComponents
  });

  return {
    content,
    frontmatter,
    slug,
    headings
  };
}

export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];

  const tree = unified().use(remarkParse).parse(markdown);

  visit(tree, 'heading', (node: any) => {
    const depth = node.depth;
    if (depth < 2 || depth > 3) return;

    let text = '';
    visit(node, 'text', (textNode: any) => {
      text += textNode.value;
    });

    if (text.trim().length === 0) return;

    const id = slugger.slug(text);
    headings.push({ id, text, depth });
  });

  return headings;
}

export async function getAllDocSlugs(): Promise<string[]> {
  const metas = await getAllDocsMeta();
  return metas.map((meta) => meta.slug);
}
