import fs from 'node:fs';
import path from 'node:path';
import { SERIES } from '../data/series';
import { CATEGORIES } from '../data/categories';
import { getAllSeries } from './posts';

const DEFAULT_COVERS_DIR = path.join(process.cwd(), 'public', 'covers');

export function getSeriesTitle(slug: string): string {
  return SERIES[slug]?.title ?? slug;
}

export function getSeriesDescription(slug: string): string {
  return SERIES[slug]?.description ?? `All posts in the "${slug}" series.`;
}

export function getSeriesCategory(slug: string): string | undefined {
  return SERIES[slug]?.category;
}

export function hasCover(slug: string, coversDir: string = DEFAULT_COVERS_DIR): boolean {
  return fs.existsSync(path.join(coversDir, `${slug}.jpg`));
}

export function getAllCategories(seriesSlugs: string[] = getAllSeries()): string[] {
  const present = new Set(
    seriesSlugs
      .map((slug) => SERIES[slug]?.category)
      .filter((category): category is string => Boolean(category))
  );
  return Object.keys(CATEGORIES).filter((category) => present.has(category));
}

export function getSeriesByCategory(
  categorySlug: string,
  seriesSlugs: string[] = getAllSeries()
): string[] {
  return seriesSlugs.filter((slug) => SERIES[slug]?.category === categorySlug);
}

export function getCategoryTitle(slug: string): string {
  return CATEGORIES[slug]?.title ?? slug;
}

export function getCategoryDescription(slug: string): string {
  return CATEGORIES[slug]?.description ?? `All series in the "${slug}" category.`;
}
