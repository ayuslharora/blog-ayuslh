import { getAllPosts } from './src/lib/posts';
console.log(getAllPosts().map(p => ({ series: p.series, slug: p.slug, date: p.date })));
