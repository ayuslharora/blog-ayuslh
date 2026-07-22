export type SeriesInfo = { title: string; description: string; category: string };

export const SERIES: Record<string, SeriesInfo> = {
  ddia: {
    title: "Designing Data-Intensive Applications",
    description:
      "Chapter-by-chapter notes on Martin Kleppmann's Designing Data-Intensive Applications, covering reliability, scalability, and the trade-offs behind real distributed systems.",
    category: "system-design",
  },
  networking: {
    title: "Networking Fundamentals",
    description:
      "A beginner-to-advanced series on how computer networks actually work, from what happens during an HTTP request to DNS, IP addressing, and routing.",
    category: "networking",
  },
  'machine-learning': {
    title: "Machine Learning",
    description:
      "Exploring the foundations of machine learning, from basic algorithms to advanced neural networks.",
    category: "machine-learning",
  },
  til: {
    title: "Today I Learned",
    description:
      "Unstructured notes, technical takeaways, and lightbulb moments from random technical videos and talks.",
    category: "misc",
  },
};
