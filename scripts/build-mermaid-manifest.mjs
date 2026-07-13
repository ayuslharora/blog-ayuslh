// Pre-measures every Mermaid diagram's rendered SVG dimensions in a real
// headless Chromium (Puppeteer), so the client-side Mermaid component can
// reserve the correct box size on first paint instead of shifting layout
// once the diagram finishes rendering (fixes CLS on Mermaid-bearing pages).
//
// Runs automatically before `next build` (see package.json "prebuild").
// Re-run manually with `npm run mermaid:manifest` after adding/editing a
// ```mermaid code block so the manifest picks up the new diagram.

import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'posts');
const MANIFEST_PATH = path.join(ROOT, 'src', 'lib', 'mermaid-manifest.json');
const MERMAID_BUNDLE = path.join(ROOT, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');

// Keep in sync with src/lib/mermaidHash.ts
function hashChart(chart) {
  let hash = 0;
  for (let i = 0; i < chart.length; i++) {
    hash = (Math.imul(hash, 31) + chart.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

function findMdxFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findMdxFiles(full));
    else if (entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

function extractCharts(mdxSource) {
  const charts = [];
  const re = /```mermaid\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(mdxSource))) {
    charts.push(m[1].trim());
  }
  return charts;
}

async function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('[mermaid-manifest] No content/posts directory found, skipping.');
    return;
  }

  const charts = new Map(); // hash -> chart source
  for (const file of findMdxFiles(CONTENT_DIR)) {
    for (const chart of extractCharts(fs.readFileSync(file, 'utf8'))) {
      charts.set(hashChart(chart), chart);
    }
  }

  if (charts.size === 0) {
    console.log('[mermaid-manifest] No mermaid diagrams found, writing empty manifest.');
    fs.writeFileSync(MANIFEST_PATH, '{}\n');
    return;
  }

  const existing = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
    : {};
  const manifest = { ...existing };

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addScriptTag({ path: MERMAID_BUNDLE });

    let i = 0;
    for (const [hash, chart] of charts) {
      i += 1;
      const id = `mermaid-manifest-${i}`;
      const dims = await page.evaluate(
        async (chartCode, elId) => {
          // Same theme config as src/components/Mermaid.tsx — keep in sync.
          // eslint-disable-next-line no-undef
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              fontSize: '16px',
              primaryColor: '#fef3c7',
              primaryTextColor: '#050505',
              primaryBorderColor: '#fbbf24',
              lineColor: '#fbbf24',
              secondaryColor: '#f59e0b',
              tertiaryColor: '#d97706',
            },
            flowchart: { htmlLabels: true, padding: 20 },
            securityLevel: 'loose',
          });
          // eslint-disable-next-line no-undef
          const { svg } = await mermaid.render(elId, chartCode);
          const match = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
          return match ? { width: parseFloat(match[1]), height: parseFloat(match[2]) } : null;
        },
        chart,
        id
      );

      if (dims) {
        manifest[hash] = dims;
        console.log(`[mermaid-manifest] ${hash}: ${dims.width}x${dims.height}`);
      } else {
        console.warn(`[mermaid-manifest] Could not measure diagram ${hash}, skipping.`);
      }
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[mermaid-manifest] Wrote ${Object.keys(manifest).length} entries to ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error('[mermaid-manifest] Failed:', err);
  process.exit(1);
});
