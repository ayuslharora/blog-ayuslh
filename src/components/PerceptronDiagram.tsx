import { PlainArrow, Figure } from "./BookFigure";

function Node({ cx, cy, r, label, fontSize = 16 }: { cx: number; cy: number; r: number; label: string; fontSize?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--text-primary)" strokeWidth={1.5} />
      <text x={cx} y={cy + fontSize / 3} fontSize={fontSize} fill="var(--text-primary)" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function Note({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} fontSize={12} fill="var(--text-secondary)" textAnchor="middle">
      {text}
    </text>
  );
}

export default function PerceptronDiagram() {
  return (
    <Figure width={760} height={300} caption="A perceptron with two inputs: weighted sum, then activation.">
      {/* inputs */}
      <Node cx={70} cy={60} r={22} label="x₁" />
      <Node cx={70} cy={150} r={22} label="x₂" />
      <Node cx={70} cy={240} r={22} label="1" />
      <Note x={70} y={285} text="inputs" />

      {/* weighted connections into the summation node */}
      <PlainArrow x1={92} y1={67} x2={324} y2={138} text="w₁" textPos={{ x: 205, y: 88 }} />
      <PlainArrow x1={92} y1={150} x2={320} y2={150} text="w₂" textPos={{ x: 205, y: 142 }} />
      <PlainArrow x1={92} y1={233} x2={324} y2={162} text="b" textPos={{ x: 205, y: 220 }} />

      {/* summation */}
      <Node cx={360} cy={150} r={38} label="Σ" fontSize={24} />
      <Note x={360} y={212} text="z = w₁x₁ + w₂x₂ + b" />

      <PlainArrow x1={398} y1={150} x2={476} y2={150} text="z" textPos={{ x: 437, y: 140 }} />

      {/* activation: step function glyph */}
      <rect x={480} y={115} width={100} height={70} rx={6} fill="none" stroke="var(--text-primary)" strokeWidth={1.5} />
      <polyline points="498,165 530,165 530,135 562,135" fill="none" stroke="#2563eb" strokeWidth={2} />
      <Note x={530} y={212} text="activation (step)" />

      <PlainArrow x1={580} y1={150} x2={660} y2={150} />
      <text x={670} y={155} fontSize={15} fill="var(--text-primary)">
        y
      </text>
      <Note x={680} y={180} text="0 or 1" />
    </Figure>
  );
}
