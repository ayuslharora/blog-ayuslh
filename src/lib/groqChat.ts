export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT_PREFIX =
  'You are a helpful assistant answering questions about a specific blog post. ' +
  'Use the post content below as your primary source of truth. ' +
  'If a question falls outside what this post covers, say so explicitly instead of guessing.\n\n' +
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
