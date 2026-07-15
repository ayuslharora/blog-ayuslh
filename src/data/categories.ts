export type CategoryInfo = { title: string; description: string };

export const CATEGORIES: Record<string, CategoryInfo> = {
  networking: {
    title: 'Networking',
    description:
      'How computer networks actually work: HTTP requests, DNS resolution, IP addressing, and routing.',
  },
  'system-design': {
    title: 'System Design',
    description:
      'Trade-offs behind reliable, scalable, and maintainable systems, from distributed data stores to book notes on Designing Data-Intensive Applications.',
  },
  'machine-learning': {
    title: 'Machine Learning',
    description:
      'A deep dive into machine learning concepts, algorithms, and practical applications.',
  },
};
