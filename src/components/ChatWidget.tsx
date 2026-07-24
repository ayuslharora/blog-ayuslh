'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function ChatWidget({ postContext }: { postContext: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [size, setSize] = useState({ width: 320, height: 448 });
  const isResizing = useRef<'top' | 'left' | 'top-left' | null>(null);
  const startSize = useRef({ width: 320, height: 448 });
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent, type: 'top' | 'left' | 'top-left') => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizing.current = type;
    startSize.current = size;
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isResizing.current) return;
    
    const dx = startPos.current.x - e.clientX;
    const dy = startPos.current.y - e.clientY;

    let newWidth = startSize.current.width;
    let newHeight = startSize.current.height;

    if (isResizing.current === 'left' || isResizing.current === 'top-left') {
      newWidth = Math.min(window.innerWidth - 48, Math.max(280, startSize.current.width + dx));
    }
    if (isResizing.current === 'top' || isResizing.current === 'top-left') {
      newHeight = Math.min(window.innerHeight - 120, Math.max(300, startSize.current.height + dy));
    }

    setSize({ width: newWidth, height: newHeight });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isResizing.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      isResizing.current = null;
    }
  };

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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black text-white dark:bg-white dark:text-black shadow-lg hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center justify-center text-2xl"
      >
        {isOpen ? '×' : '💬'}
      </button>

      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-xl bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden"
          style={{ width: size.width, height: size.height }}
        >
          {/* Top Edge Handle */}
          <div 
            className="absolute top-0 left-6 right-0 h-3 cursor-ns-resize z-20"
            onPointerDown={(e) => handlePointerDown(e, 'top')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
          
          {/* Left Edge Handle */}
          <div 
            className="absolute top-6 left-0 bottom-0 w-3 cursor-ew-resize z-20"
            onPointerDown={(e) => handlePointerDown(e, 'left')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />

          {/* Top-Left Corner Handle */}
          <div 
            className="absolute top-0 left-0 w-8 h-8 cursor-nwse-resize z-30 flex items-start justify-start p-2 text-zinc-300 hover:text-black dark:text-zinc-600 dark:hover:text-white transition-colors"
            onPointerDown={(e) => handlePointerDown(e, 'top-left')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            title="Drag to resize"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 3 3 3 3 9"></polyline>
              <line x1="3" y1="3" x2="10" y2="10"></line>
            </svg>
          </div>
          
          <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 font-semibold text-sm pl-10">
            Ask about this post
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.length === 0 && (
              <p className="text-[var(--text-secondary)]">Ask anything about this post.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span
                  className={
                    m.role === 'user'
                      ? 'inline-block bg-amber-400/20 dark:bg-amber-400/10 rounded-lg px-3 py-1.5'
                      : 'inline-block bg-black/5 dark:bg-white/10 rounded-lg px-3 py-1.5'
                  }
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-ul:my-1 prose-ol:my-1 prose-headings:my-2 prose-a:text-amber-600 dark:prose-a:text-amber-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                </span>
              </div>
            ))}
            {isLoading && <p className="text-zinc-400 dark:text-zinc-500">Thinking...</p>}
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
          </div>
          <div className="flex items-center gap-2 px-3 py-3 border-t border-black/5 dark:border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 text-sm px-3 py-2 rounded-full bg-black/5 dark:bg-white/10 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="px-4 py-2 rounded-full text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
