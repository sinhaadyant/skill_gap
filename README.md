# Interview Knowledge Base

A Next.js (App Router) documentation experience that renders MD/MDX topics, supports on-demand ISR, and exposes fuzzy search across all content. The default theme is a dark deep-blue surface with orange accents.

## Features

- File-based MD/MDX topics with frontmatter (`title`, `order`, `summary`, `tags`).
- Static generation via `generateStaticParams()` plus on-demand revalidation (`/api/revalidate`).
- Fuse.js client-side search powered by a build-time JSON index.
- Responsive navigation with collapsible sidebar and automatic table of contents per article.
- MDX shortcodes `<Note>` and `<Example>` plus Shiki-backed code highlighting with copy buttons.
- TailwindCSS styling with accessible focus states and semantic markup.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Navigate to `http://localhost:3000` to browse the docs. The sidebar and topic order are driven by the files in `content/`.

### Production Build

```bash
npm run build
npm run start
```

The `prebuild` script runs automatically to refresh `public/search_index.json` before the build.

## Adding or Updating Topics

1. Create a new MDX file in `content/` using the naming convention `NN-slug.mdx` (padded two-digit order).
2. Include frontmatter:

```md
---
title: "My Topic Title"
order: 17
summary: "Short description for landing page and search."
tags: ["java", "spring"]
---
```

3. Author the content in Markdown/MDX. Use `<Note type="tip">...</Note>` or `<Example>...</Example>` for callouts.
4. Commit the file. A GitHub Action (see below) can regenerate the search index and ping the ISR webhook.

## On-Demand ISR Webhook

- API route: `POST /api/revalidate`
- Headers/body:
  - `x-revalidate-secret`: must match `process.env.REVALIDATE_SECRET`.
  - Optional JSON body `{ "slugs": ["03-springboot-setup", "04-profiles-env-config"] }`.
- If no `slugs` provided, `/` (home) is revalidated.

### Local Testing

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: your-secret" \
  -d '{"slugs": ["03-springboot-setup"]}'
```

Set `REVALIDATE_SECRET` in `.env.local` during development.

## GitHub Action & Webhook Setup

- Workflow: `.github/workflows/revalidate.yml`
- Required secrets:
  - `REVALIDATE_URL`: Public URL to `/api/revalidate` (e.g., from Vercel/Netlify).
  - `REVALIDATE_SECRET`: Same token configured in hosting env.
- The workflow installs dependencies, runs `npm run prebuild`, and calls the webhook after content changes.

## Search Index Refresh

- Script: `scripts/build-search-index.js`
- Reads every file in `content/`, parses frontmatter/body, and writes `public/search_index.json`.
- Automatically executed during `npm run build` via the `prebuild` script.
- Force-refresh manually with `npm run prebuild`.

## Folder Structure (Highlights)

```
/app
  /docs/[slug]/page.tsx       # MDX rendering + TOC
  /api/revalidate/route.ts    # ISR webhook
/components                  # Sidebar, SearchBar, MDX components
/content                     # MDX topics
/lib                          # Content utilities, remark plugins
/scripts/build-search-index.js
```

## Accessibility

- Semantic headings with generated anchor links.
- Keyboard-friendly sidebar toggle and link focus states.
- Search input labeled for screen readers (`sr-only`).

## Dev Notes

- MDX is rendered via `next-mdx-remote/rsc` so server components can inject dynamic UI elements.
- Shiki handles code highlighting with a GitHub Dark theme; copy buttons run client-side.
- The table of contents is derived from Markdown headings using `remark-parse` and `github-slugger` to match `rehype-slug` IDs.
- Placeholders exist for topics 4–16—replace them with the full canvas document content when ready.

Happy prepping!
