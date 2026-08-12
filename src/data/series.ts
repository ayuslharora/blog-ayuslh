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
    title: "Fundamental Machine Learning",
    description:
      "Exploring the foundations of machine learning, from basic algorithms to advanced neural networks.",
    category: "machine-learning",
  },
  'machine-learning-algorithms': {
    title: "Machine Learning Algorithms",
    description:
      "A deep dive into how core machine learning algorithms actually work, from linear regression to ensemble methods.",
    category: "machine-learning",
  },
  til: {
    title: "Today I Learned",
    description:
      "Unstructured notes, technical takeaways, and lightbulb moments from random technical videos and talks.",
    category: "misc",
  },
};
