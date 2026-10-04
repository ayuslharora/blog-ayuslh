export type SeriesStatus = 'ongoing' | 'completed' | 'on-hold';

export type SeriesInfo = { title: string; description: string; category: string; status: SeriesStatus };

export const SERIES: Record<string, SeriesInfo> = {
  ddia: {
    title: "Designing Data-Intensive Applications",
    description:
      "Chapter-by-chapter notes on Martin Kleppmann's Designing Data-Intensive Applications, covering reliability, scalability, and the trade-offs behind real distributed systems.",
    category: "system-design",
    status: 'on-hold',
  },
  'system-design-foundation': {
    title: "System Design Foundation",
    description: "Building scalable systems, one concept at a time",
    category: "system-design",
    status: 'ongoing',
  },
  networking: {
    title: "Networking Fundamentals",
    description:
      "A beginner-to-advanced series on how computer networks actually work, from what happens during an HTTP request to DNS, IP addressing, and routing.",
    category: "networking",
    status: 'on-hold',
  },
  'machine-learning': {
    title: "Fundamental Machine Learning",
    description:
      "Exploring the foundations of machine learning, from basic algorithms to advanced neural networks.",
    category: "machine-learning",
    status: 'completed',
  },
  'machine-learning-algorithms': {
    title: "Machine Learning Algorithms",
    description:
      "A deep dive into how core machine learning algorithms actually work, from linear regression to ensemble methods.",
    category: "machine-learning",
    status: 'completed',
  },
  'deep-learning': {
    title: "Deep Learning",
    description:
      "How neural networks actually learn, from perceptrons and backpropagation to the architectures behind modern deep learning.",
    category: "machine-learning",
    status: 'on-hold',
  },
  'genai-langchain': {
    title: "Generative AI using LangChain",
    description:
      "Building real generative AI applications with LangChain, from models, prompts, and chains to RAG pipelines, tool calling, and AI agents.",
    category: "machine-learning",
    status: 'ongoing',
  },
  til: {
    title: "Today I Learned",
    description:
      "Unstructured notes, technical takeaways, and lightbulb moments from random technical videos and talks.",
    category: "misc",
    status: 'ongoing',
  },
};
