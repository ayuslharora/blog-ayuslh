export type TagMetadata = {
  slug: string;
  name: string;
  description: string;
};

export const STARTER_TAGS: Record<string, TagMetadata> = {
  'system-design': {
    slug: 'system-design',
    name: 'System Design',
    description: 'High-availability architecture, scalability trade-offs, and distributed backend design',
  },
  caching: {
    slug: 'caching',
    name: 'Caching',
    description: 'In-memory caching strategies, TTL management, and cache stampede prevention',
  },
  concurrency: {
    slug: 'concurrency',
    name: 'Concurrency',
    description: 'Race conditions, thread synchronization, locking mechanisms, and parallel requests',
  },
  redis: {
    slug: 'redis',
    name: 'Redis',
    description: 'Redis in-memory key-value store, distributed locking, and caching patterns',
  },
  'distributed-systems': {
    slug: 'distributed-systems',
    name: 'Distributed Systems',
    description: 'Consensus protocols, service resilience, failure recovery, and distributed state',
  },
  pentesting: {
    slug: 'pentesting',
    name: 'Pentesting',
    description: 'Offensive security, vulnerability research, and penetration testing',
  },
  networking: {
    slug: 'networking',
    name: 'Networking',
    description: 'Protocols, packet analysis, IP routing, and network architecture',
  },
  linux: {
    slug: 'linux',
    name: 'Linux',
    description: 'Kernel internals, bash, system administration, and CLI tools',
  },
  ml: {
    slug: 'ml',
    name: 'Machine Learning',
    description: 'Machine learning algorithms, neural networks, and mathematical concepts',
  },
  tools: {
    slug: 'tools',
    name: 'Tools & Workflow',
    description: 'Developer utilities, software tools, and productivity workflows',
  },
  ctf: {
    slug: 'ctf',
    name: 'CTF',
    description: 'Capture The Flag writeups, exploits, and challenge breakdowns',
  },
  misc: {
    slug: 'misc',
    name: 'Misc',
    description: 'General notes, quick tips, and uncategorized learning takeaways',
  },
};

/**
 * Returns metadata for a tag. If the tag is not pre-registered in STARTER_TAGS,
 * it generates dynamic metadata so newly added tags work seamlessly in the future.
 */
export function getTagMeta(tagSlug: string): TagMetadata {
  const normalized = tagSlug.toLowerCase().trim();
  if (STARTER_TAGS[normalized]) {
    return STARTER_TAGS[normalized];
  }
  
  // Format dynamic tag names gracefully (e.g. "web-security" -> "Web Security")
  const formattedName = normalized
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    slug: normalized,
    name: formattedName,
    description: `Notes tagged with ${formattedName}`,
  };
}
