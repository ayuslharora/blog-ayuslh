# blog-ayuslh

> A personal engineering blog and digital garden. Long-running, chapter-by-chapter
> series on networking, machine learning, and system design, written while learning
> the material rather than after.

Built with Next.js and MDX. Every series is an open notebook: entries are added as
the reading and experimentation happen, and older chapters are revised in place when
a later one shows they were wrong.

Written by [Ayush Arora](https://github.com/ayuslharora), a CS undergrad at BITS
Pilani, on backend systems, networking, and distributed data.

## Series

The blog is organized into ongoing series, each grouped under a broader category:

| Series | Category |
| --- | --- |
| [Networking Fundamentals](content/posts/networking) | Networking |
| [Fundamental Machine Learning](content/posts/machine-learning) | Machine Learning |
| [Machine Learning Algorithms](content/posts/machine-learning-algorithms) | Machine Learning |
| [Designing Data-Intensive Applications](content/posts/ddia) | System Design |
| [System Design Foundation](content/posts/system-design-foundation) | System Design |
| [Today I Learned](content/posts/til) | Misc |

This list is the human-readable view of [`src/data/series.ts`](src/data/series.ts),
which, together with [`src/data/categories.ts`](src/data/categories.ts), is the single
source of truth for titles, descriptions, and category assignment. Chapter counts are
deliberately not tracked here; the folders and the site index are authoritative.

## How it works

- **Next.js (App Router)** with React and TypeScript.
- **MDX content** rendered via `next-mdx-remote`, with `remark-gfm`, `remark-math` /
  `rehype-katex` for math, and `rehype-pretty-code` (Shiki) for syntax highlighting.
- **Mermaid diagrams** rendered natively, with a build-time manifest so diagrams are
  not re-rendered client-side on every page load.
- **Plotly** for interactive charts, alongside statically generated matplotlib PNGs
  for illustrative figures. Any figure in a post is a real image from real data,
  never a hand-drawn mockup.
- **Search, RSS, sitemap, robots.txt, JSON-LD, and OG images** are all produced at
  build time.
- **An `/ask` chat endpoint** ([`src/app/api/chat`](src/app/api/chat)) backed by Groq,
  for questions grounded in the blog's own content.
- **A utility tool** at `/tools/ip-converter` for IP/CIDR conversion.
- **Tailwind CSS** with the typography plugin, with full dark mode support.
- **Vercel Analytics** for traffic.

## Getting started

Node.js `>=20.9 <23` (see [`.nvmrc`](.nvmrc)).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The `/ask` feature needs a `GROQ_API_KEY` in `.env.local`. Everything else runs with
no additional configuration.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest suite |
| `npm run mermaid:manifest` | Regenerate `src/lib/mermaid-manifest.json` from posts' Mermaid blocks |

`scripts/` also holds one-off Python generators for post figures and
`strip_transcript_timestamps.py` for cleaning raw video transcripts used as source
material.

## Project structure

```
content/posts/<series>/chNN-slug.mdx   MDX post content, one folder per series
src/app/                               Routes: posts, series, category, TIL, about, tools, feed, sitemap
src/components/                        Post rendering, layout, and MDX components (charts, callouts, etc.)
src/data/                              Series and category metadata (source of truth)
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
- Charts and figures are real generated images from real data (see `scripts/`), saved
  to `public/images/` and embedded with `<img>`.
- Some machine learning and networking posts are adapted from video transcripts. See
  [`AGENTS.md`](AGENTS.md) for the full content conventions: attribution, tone,
  sourcing code examples, and prose style.

## Testing

`npm run test` runs the Vitest suite under `tests/` (content structure, library
functions, and fixtures). See [`TESTING.md`](TESTING.md) for coverage detail.

## Deployment

Deployed on [Vercel](https://vercel.com). Pushing to `main` triggers a production
deployment.
