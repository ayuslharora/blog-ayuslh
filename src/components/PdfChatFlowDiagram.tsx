import { Figure, PlainArrow } from "./BookFigure";

const INK = "#111827";

function Diamond({ cx, cy, r, label }: { cx: number; cy: number; r: number; label: string }) {
  const [first, second] = label.split(" ");
  return (
    <g>
      <polygon
        points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
        fill="#bbf7d0"
        stroke="#15803d"
        strokeWidth={1.6}
      />
      <text x={cx} y={cy - 3} fontSize={r > 45 ? 15 : 12} fill={INK} textAnchor="middle">
        {first}
      </text>
      <text x={cx} y={cy + (r > 45 ? 15 : 12)} fontSize={r > 45 ? 15 : 12} fill={INK} textAnchor="middle">
        {second}
      </text>
    </g>
  );
}

function CurvedArrow({ d }: { d: string }) {
  return <path d={d} fill="none" stroke="var(--text-primary)" strokeWidth={1.5} markerEnd="url(#book-figure-arrow)" />;
}

export default function PdfChatFlowDiagram() {
  return (
    <Figure width={900} height={330}>
      {/* User query */}
      <Diamond cx={80} cy={200} r={56} label="User Query" />
      <PlainArrow x1={138} y1={200} x2={246} y2={200} />

      {/* Semantic search */}
      <circle cx={300} cy={200} r={52} fill="#bfdbfe" stroke="#2563eb" strokeWidth={1.6} />
      <text x={300} y={197} fontSize={15} fill={INK} textAnchor="middle">
        Semantic
      </text>
      <text x={300} y={215} fontSize={15} fill={INK} textAnchor="middle">
        Search
      </text>
      <PlainArrow x1={300} y1={146} x2={300} y2={134} />

      {/* PDF stored in database */}
      <rect x={255} y={20} width={90} height={112} fill="#fde68a" stroke="#d97706" strokeWidth={1.6} />
      <text x={300} y={60} fontSize={14} fill={INK} textAnchor="middle">
        PDF
      </text>
      <text x={300} y={78} fontSize={14} fill={INK} textAnchor="middle">
        stored in
      </text>
      <text x={300} y={96} fontSize={14} fill={INK} textAnchor="middle">
        Database
      </text>

      {/* Result: retrieved pages flow into the system query */}
      <CurvedArrow d="M347,70 Q445,90 468,168" />
      <text x={430} y={112} fontSize={13} fill="var(--text-primary)" textAnchor="middle">
        Result
      </text>

      {/* Original user query also flows into the system query */}
      <CurvedArrow d="M80,258 C120,330 390,325 468,236" />

      {/* System query = pages + user query */}
      <rect x={470} y={130} width={230} height={140} fill="none" stroke="var(--text-primary)" strokeWidth={1.5} />
      <rect x={525} y={116} width={120} height={28} fill="#ffffff" stroke="var(--text-primary)" strokeWidth={1.5} />
      <text x={585} y={135} fontSize={14} fill={INK} textAnchor="middle">
        System Query
      </text>
      <rect x={490} y={168} width={72} height={72} fill="#ffffff" stroke={INK} strokeWidth={1.4} />
      <text x={526} y={209} fontSize={14} fill={INK} textAnchor="middle">
        Pages
      </text>
      <text x={590} y={211} fontSize={24} fill="var(--text-primary)" textAnchor="middle">
        +
      </text>
      <Diamond cx={648} cy={204} r={40} label="User Query" />

      <PlainArrow x1={702} y1={200} x2={768} y2={200} />

      {/* Brain */}
      <rect x={770} y={150} width={100} height={100} fill="#ddd6fe" stroke="#7c3aed" strokeWidth={1.6} />
      <text x={820} y={205} fontSize={15} fill={INK} textAnchor="middle">
        Brain
      </text>
      <PlainArrow x1={820} y1={148} x2={820} y2={76} />

      {/* Final output */}
      <rect x={760} y={40} width={120} height={34} fill="#ffffff" stroke="var(--text-primary)" strokeWidth={1.5} />
      <text x={820} y={62} fontSize={14} fill={INK} textAnchor="middle">
        Final Output
      </text>
    </Figure>
  );
}
