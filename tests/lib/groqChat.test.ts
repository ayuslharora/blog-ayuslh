import { describe, expect, it } from 'vitest';
import { buildChatRequestBody, extractReply } from '../../src/lib/groqChat';

describe('buildChatRequestBody', () => {
  it('uses the llama-3.3-70b-versatile model', () => {
    const body = buildChatRequestBody('post context here', []);
    expect(body.model).toBe('llama-3.3-70b-versatile');
  });

  it('embeds the post context in a leading system message', () => {
    const body = buildChatRequestBody('the post is about caching', []);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[0].content).toContain('the post is about caching');
  });

  it('appends the given conversation after the system message, in order', () => {
    const messages = [
      { role: 'user' as const, content: 'What is OLTP?' },
      { role: 'assistant' as const, content: 'It stands for...' },
    ];
    const body = buildChatRequestBody('context', messages);
    expect(body.messages.slice(1)).toEqual(messages);
  });
});

describe('extractReply', () => {
  it('returns the reply content from a well-formed Groq response', () => {
    const response = { choices: [{ message: { content: 'Here is the answer.' } }] };
    expect(extractReply(response)).toBe('Here is the answer.');
  });

  it('throws on a malformed response with no choices', () => {
    expect(() => extractReply({})).toThrow();
  });
});
