// Server component: full title is in the DOM immediately (SEO/screen readers
// get it as one node via the sr-only span), the per-character reveal is a
// pure CSS stagger on a parallel aria-hidden copy, no client JS needed.
const STEP_MS = 22;

export default function TypingTitle({ text, className }: { text: string; className?: string }) {
  const chars = Array.from(text);

  return (
    <h1 className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.map((ch, i) => (
          <span key={i} className="typing-char" style={{ animationDelay: `${i * STEP_MS}ms` }}>
            {ch}
          </span>
        ))}
        <span
          className="typing-cursor"
          style={{ animationDelay: `${chars.length * STEP_MS}ms` }}
        />
      </span>
    </h1>
  );
}
