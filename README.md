# blog-ayuslh

A personal educational blog and digital garden focused on software engineering and **Networking Fundamentals**. 

This repository houses the source code and content for the blog, which explores complex topics like HTTP requests, CIDR, Subnets, Default Gateways, and MAC addresses. It uses MDX to write rich, interactive articles and leverages Mermaid.js to programmatically generate helpful networking diagrams.

## Features

- **Next.js 16**: Utilizing the App Router and modern React features.
- **MDX Support**: Write content in Markdown with embedded React components using `next-mdx-remote`.
- **Mermaid Diagrams**: Native support for rendering Mermaid diagrams within blog posts.
- **Tailwind CSS v4**: Styling with the latest Tailwind CSS and typography plugin.
- **Analytics**: Integrated with Vercel Analytics.

## Getting Started

First, ensure you have Node.js (>=20.9 <23) installed. 

Install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to catch issues.
- `npm run test`: Runs Vitest for unit tests.
- `npm run mermaid:manifest`: Generates the Mermaid manifest.

## Content Management

Blog posts are written in MDX format and stored in the `content/posts/` directory.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
