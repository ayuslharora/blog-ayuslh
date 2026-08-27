import type { ReactNode } from "react";

// Reusable primitives for recreating System Design Interview-style book
// figures as crisp inline SVG (instead of Mermaid, which can't match the
// book's icon-driven layout). Compose a new figure by building a <svg> with
// these pieces; see RequestFlowDiagram.tsx for a full example.

export function Box({
  x,
  y,
  w,
  h,
  label,
  dashed,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  dashed?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill="none"
        stroke="var(--text-primary)"
        strokeWidth={1.5}
        strokeDasharray={dashed ? "6 4" : undefined}
      />
      {label && (
        <text x={x + 18} y={y + 24} fontSize={15} fontWeight={600} fill="var(--text-primary)">
          {label}
        </text>
      )}
    </g>
  );
}

export function LaptopIcon({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={46} height={30} rx={2} fill="none" stroke="var(--text-primary)" strokeWidth={1.6} />
      <rect x={4} y={4} width={38} height={22} fill="none" stroke="var(--text-primary)" strokeWidth={1.2} />
      <path d="M-6,34 L52,34 L46,30 L0,30 Z" fill="var(--text-primary)" />
      {label && (
        <text x={23} y={58} fontSize={13} fill="var(--text-primary)" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export function PhoneIcon({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={26} height={42} rx={4} fill="none" stroke="var(--text-primary)" strokeWidth={1.6} />
      <line x1={8} y1={36} x2={18} y2={36} stroke="var(--text-primary)" strokeWidth={1.6} />
      {label && (
        <text x={13} y={62} fontSize={13} fill="var(--text-primary)" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export function ServerIcon({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={36} height={46} rx={3} fill="#22c55e" />
      <rect x={7} y={8} width={22} height={4} fill="white" />
      <rect x={7} y={17} width={22} height={4} fill="white" />
      <circle cx={10} cy={34} r={2} fill="white" />
      <circle cx={17} cy={34} r={2} fill="white" />
      {label && (
        <text x={18} y={64} fontSize={14} fontWeight={600} fill="var(--text-primary)" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export function LoadBalancerIcon({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M8,0 L42,0 L50,44 L0,44 Z" fill="#2563eb" />
      <g stroke="white" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1={25} y1={9} x2={25} y2={31} />
        <polyline points="19,15 25,7 31,15" />
        <line x1={25} y1={23} x2={12} y2={35} />
        <polyline points="12,28 11,36 19,35" />
        <line x1={25} y1={23} x2={38} y2={35} />
        <polyline points="31,35 39,36 38,28" />
      </g>
      {label && (
        <text x={64} y={30} fontSize={14} fontWeight={600} fill="var(--text-primary)">
          {label}
        </text>
      )}
    </g>
  );
}

export function LookupTable({
  x,
  y,
  w,
  rowH,
  colSplit,
  header,
  row,
}: {
  x: number;
  y: number;
  w: number;
  rowH: number;
  colSplit: number;
  header: [string, string];
  row: [string, string];
}) {
  return (
    <g stroke="var(--text-primary)" strokeWidth={1.2}>
      <rect x={x} y={y} width={w} height={rowH * 2} fill="none" />
      <line x1={x} y1={y + rowH} x2={x + w} y2={y + rowH} />
      <line x1={x + colSplit} y1={y} x2={x + colSplit} y2={y + rowH * 2} />
      <text x={x + 12} y={y + rowH / 2 + 5} fontSize={13} fontWeight={700} fill="var(--text-primary)" stroke="none">
        {header[0]}
      </text>
      <text x={x + colSplit + 12} y={y + rowH / 2 + 5} fontSize={13} fontWeight={700} fill="var(--text-primary)" stroke="none">
        {header[1]}
      </text>
      <text x={x + 12} y={y + rowH + rowH / 2 + 5} fontSize={13} fill="var(--text-primary)" stroke="none">
        {row[0]}
      </text>
      <text x={x + colSplit + 12} y={y + rowH + rowH / 2 + 5} fontSize={13} fill="var(--text-primary)" stroke="none">
        {row[1]}
      </text>
    </g>
  );
}

export function DnsIcon({ cx, cy, label = "DNS" }: { cx: number; cy: number; label?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={40} fill="#dbeafe" stroke="#2563eb" strokeWidth={1.8} />
      <g transform={`translate(${cx},${cy - 10})`} stroke="#1d4ed8" strokeWidth={1.3} fill="none">
        <circle cx={0} cy={0} r={13} />
        <ellipse cx={0} cy={0} rx={6} ry={13} />
        <line x1={-13} y1={0} x2={13} y2={0} />
        <path d="M-11,-6 Q0,-2 11,-6" />
        <path d="M-11,6 Q0,2 11,6" />
      </g>
      <text x={cx} y={cy + 21} fontSize={13} fontWeight={600} fill="#1d4ed8" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

export function DbIcon({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M0,8 A28,8 0 0 1 56,8 V38 A28,8 0 0 1 0,38 Z" fill="#3b82f6" />
      <ellipse cx={28} cy={8} rx={28} ry={8} fill="#60a5fa" />
      <text x={28} y={28} fontSize={15} fontWeight={700} fill="white" textAnchor="middle">
        DB
      </text>
      {label && (
        <text x={28} y={64} fontSize={14} fontWeight={600} fill="var(--text-primary)" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export function PlainArrow({
  x1,
  y1,
  x2,
  y2,
  text,
  textPos,
  dashed,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text?: string;
  textPos?: { x: number; y: number };
  dashed?: boolean;
}) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--text-primary)"
        strokeWidth={1.5}
        strokeDasharray={dashed ? "5 4" : undefined}
        markerEnd="url(#book-figure-arrow)"
      />
      {text && textPos && (
        <text x={textPos.x} y={textPos.y} fontSize={13} fill="var(--text-primary)" textAnchor="middle">
          {text}
        </text>
      )}
    </g>
  );
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  number,
  numberPos,
  text,
  textPos,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  number: number;
  numberPos: { x: number; y: number };
  text: string;
  textPos: { x: number; y: number };
}) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-primary)" strokeWidth={1.5} markerEnd="url(#book-figure-arrow)" />
      <circle cx={numberPos.x} cy={numberPos.y} r={8} fill="none" stroke="var(--text-primary)" strokeWidth={1.2} />
      <text x={numberPos.x} y={numberPos.y + 4} fontSize={10} fill="var(--text-primary)" textAnchor="middle">
        {number}
      </text>
      <text x={textPos.x} y={textPos.y} fontSize={13} fill="var(--text-primary)" textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

export function ArrowMarkerDefs() {
  return (
    <defs>
      <marker id="book-figure-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--text-primary)" />
      </marker>
    </defs>
  );
}

export function Figure({
  width,
  height,
  caption,
  children,
}: {
  width: number;
  height: number;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <div className="my-8">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ maxWidth: width, display: "block", margin: "0 auto" }}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          <ArrowMarkerDefs />
          {children}
        </svg>
      </div>
      {caption && <p className="text-xs mt-2 text-center" style={{ color: "var(--text-secondary)" }}>{caption}</p>}
    </div>
  );
}
