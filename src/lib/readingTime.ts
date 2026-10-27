const WORDS_PER_MINUTE = 200;

export function getReadingTimeMinutes(content: string): number {
  // A <CodeTabs> block holds the same sample in Python and JS; a reader only
  // reads one, so drop the JS copy before counting.
  const counted = content.replace(/<CodeTabs>[\s\S]*?<\/CodeTabs>/g, (block) =>
    block.replace(/```js\n[\s\S]*?```/g, ''),
  );
  const words = counted.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
