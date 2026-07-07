'use client';

import { useState } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function ChatWidget({ postContext }: { postContext: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    const question = input.trim();
    if (!question || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postContext, messages: nextMessages }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Something went wrong. Please try again.');
      }

      const { reply } = (await res.json()) as { reply: string };
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close chat' : 'Ask a question about this post'}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black text-white shadow-lg hover:bg-black/80 transition-colors flex items-center justify-center text-2xl"
      >
        {isOpen ? '×' : '💬'}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-h-[28rem] flex flex-col rounded-xl bg-white/90 backdrop-blur-md border border-black/5 shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5 font-semibold text-sm">
            Ask about this post
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.length === 0 && (
              <p className="text-zinc-500">Ask anything about this post.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span
                  className={
                    m.role === 'user'
                      ? 'inline-block bg-amber-400/20 rounded-lg px-3 py-1.5'
                      : 'inline-block bg-black/5 rounded-lg px-3 py-1.5'
                  }
                >
                  {m.content}
                </span>
              </div>
            ))}
            {isLoading && <p className="text-zinc-400">Thinking...</p>}
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <div className="flex items-center gap-2 px-3 py-3 border-t border-black/5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 text-sm px-3 py-2 rounded-full bg-black/5 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="px-4 py-2 rounded-full text-sm font-medium bg-black text-white hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
