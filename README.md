# blog-ayuslh

A personal engineering blog and digital garden, chapter-by-chapter series on networking, machine learning, and system design, built with Next.js and MDX.

Written by [Ayush Arora](https://github.com/ayuslharora): a CS undergrad at BITS Pilani writing up what he's learning about backend systems, networking, and distributed data, one chapter at a time.

## Series

| Series | Category | Chapters |
| --- | --- | --- |
| [Networking Fundamentals](content/posts/networking) | Networking | 31 |
| [Fundamental Machine Learning](content/posts/machine-learning) | Machine Learning | 40 |
| [Machine Learning Algorithms](content/posts/machine-learning-algorithms) | Machine Learning | 13 |
| [Designing Data-Intensive Applications](content/posts/ddia) | System Design | 1 |
| [Today I Learned](content/posts/til) | Misc | 3 |

Series and category metadata live in [`src/data/series.ts`](src/data/series.ts) and [`src/data/categories.ts`](src/data/categories.ts).

## Features

- **Next.js 16 (App Router)** with React 19 and TypeScript.
- **MDX content** rendered via `next-mdx-remote`, with `remark-gfm`, `remark-math` / `rehype-katex` for math, and `rehype-pretty-code` (Shiki) for syntax highlighting.
- **Mermaid diagrams** rendered natively, with a build-time manifest (`npm run mermaid:manifest`) so diagrams don't re-render client-side on every load.
- **Plotly** for interactive charts, alongside statically generated matplotlib PNGs for illustrative figures.
- **Search, RSS, sitemap, robots.txt, JSON-LD, and OG image generation** all handled at build time.
- **An `/ask` chat endpoint** (`src/app/api/chat`) backed by Groq, for asking questions grounded in the blog's own content.
- **A small utility tool** at `/tools/ip-converter` for IP/CIDR conversion.
- **Tailwind CSS v4** with the typography plugin for post styling, and full dark mode support.
- **Vercel Analytics** integration.

## Getting started

Requires Node.js `>=20.9 <23`.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The `/ask` chat feature requires a `GROQ_API_KEY` in `.env.local`; everything else runs without additional configuration.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest suite |
| `npm run mermaid:manifest` | Regenerate `src/lib/mermaid-manifest.json` from posts' Mermaid blocks |

`scripts/` also holds one-off Python generators for post figures (e.g. `gen_ch7_cost_surface.py`, `gen_ch7_gd_data.py`) and `strip_transcript_timestamps.py` for cleaning raw video transcripts used as source material.

## Project structure

```
content/posts/<series>/chNN-slug.mdx   MDX post content, one folder per series
src/app/                               Routes: posts, series, category, TIL, about, tools, feed, sitemap
src/components/                        Post rendering, layout, and MDX components (charts, callouts, etc.)
src/data/                              Series and category metadata
src/lib/                               Post loading/parsing, search index, reading time, JSON-LD, Mermaid helpers
public/images/                         Generated figures embedded in posts
tests/                                 Vitest unit tests (content, lib, fixtures)
```

## Writing a post

Posts are MDX files at `content/posts/<series>/chNN-slug.mdx` with frontmatter:

```yaml
---
title: "Ch.N: Post Title"
description: "One or two sentences for previews and meta tags."
date: "2026-01-01T00:00:00+05:30"
tags: ["tag1", "tag2"]
subtopic: "Grouping within the series"
draft: false
source:
  title: "Source video title"
  channel: "Channel name"
  url: "https://..."
---
```

Notes:

- Posts sort by the `date` field, not file or commit order.
- Any chart or figure shown in a post is a real generated image from real data (see `scripts/`), saved to `public/images/` and embedded with `<img>`, never a hand-drawn mockup.
- Some machine learning and networking posts are adapted from video transcripts; see [`AGENTS.md`](AGENTS.md) for the full content conventions (attribution, tone, sourcing code examples, etc.).

## Testing

`npm run test` runs the Vitest suite under `tests/` (content structure, library functions, and fixtures). See [`TESTING.md`](TESTING.md) for more detail on what's covered.

## Deployment

Deployed on [Vercel](https://vercel.com). Pushing to `main` triggers a production deployment; see the [Next.js deployment docs](https://nextjs.org/docs/deployment) for the general workflow.
