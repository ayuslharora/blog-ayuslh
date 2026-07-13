/**
 * Deterministic hash for a Mermaid chart's source text, used as the manifest
 * key in both the build-time dimension-measurement script
 * (scripts/build-mermaid-manifest.mjs) and the Mermaid client component.
 *
 * Kept intentionally dependency-free (no crypto) so it can run identically
 * in a plain Node ESM script and in the browser bundle. If you change this
 * function, update the copy in scripts/build-mermaid-manifest.mjs too.
 */
export function hashChart(chart: string): string {
  let hash = 0;
  for (let i = 0; i < chart.length; i++) {
    hash = (Math.imul(hash, 31) + chart.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}
