export type SeriesInfo = { title: string; description: string };

export const SERIES: Record<string, SeriesInfo> = {
  ddia: {
    title: "Designing Data-Intensive Applications",
    description:
      "Chapter-by-chapter notes on Martin Kleppmann's Designing Data-Intensive Applications, covering reliability, scalability, and the trade-offs behind real distributed systems.",
  },
  networking: {
    title: "Networking Fundamentals",
    description:
      "A beginner-to-advanced series on how computer networks actually work, from what happens during an HTTP request to DNS, IP addressing, and routing.",
  },
};
