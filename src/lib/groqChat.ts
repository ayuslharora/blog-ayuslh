export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT_PREFIX =
  'You are a helpful assistant answering questions about a specific blog post. ' +
  'Always answer the specific question asked first, directly and in as few sentences as it takes, before adding any supporting detail. ' +
  'Use the post content below as your primary source of truth. ' +
  "If the post doesn't cover a detail the question needs (e.g. a default parameter value, a definition), " +
  'you may answer from general knowledge, but say plainly that it\'s not from the post. ' +
  "Don't pad short factual questions with headings or extra structure they don't need; " +
  'reserve headings, bold/italics, and bullet or numbered lists for replies that are actually long enough to need them, ' +
  'and use fenced code blocks with a language tag for any code, commands, or config.\n\n' +
  '--- POST CONTENT ---\n';

export function buildChatRequestBody(postContext: string, messages: ChatMessage[]) {
  return {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_PREFIX + postContext },
      ...messages,
    ],
  };
}

export function extractReply(groqResponse: unknown): string {
  const content = (groqResponse as { choices?: { message?: { content?: unknown } }[] })
    ?.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || content.length === 0) {
    throw new Error('Malformed Groq response: no reply content found');
  }

  return content;
}
