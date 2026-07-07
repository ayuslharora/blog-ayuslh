import fs from 'node:fs';
import path from 'node:path';
import { SERIES } from '../data/series';

const DEFAULT_COVERS_DIR = path.join(process.cwd(), 'public', 'covers');

export function getSeriesTitle(slug: string): string {
  return SERIES[slug]?.title ?? slug;
}

export function hasCover(slug: string, coversDir: string = DEFAULT_COVERS_DIR): boolean {
  return fs.existsSync(path.join(coversDir, `${slug}.jpg`));
}
