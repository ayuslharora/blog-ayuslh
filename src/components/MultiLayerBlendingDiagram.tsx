import { PlainArrow, Figure } from "./BookFigure";

function LabeledBox({
  x,
  y,
  w,
  h,
  lines,
  dashed,
  bold,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  dashed?: boolean;
  bold?: boolean;
}) {
  const lineHeight = 16;
  const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2 + 5;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill="none"
        stroke="var(--text-primary)"
        strokeWidth={bold ? 2.6 : 1.3}
        strokeDasharray={dashed ? "6 4" : undefined}
      />
      <text x={x + w / 2} y={startY} fontSize={13} fill="var(--text-primary)" textAnchor="middle">
        {lines.map((line, i) => (
          <tspan key={i} x={x + w / 2} dy={i === 0 ? 0 : lineHeight} fontWeight={bold && i === 0 ? 700 : undefined}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

// column x positions
const CHUNK_X = 150;
const CHUNK_W = 100;
const L1_X = 300;
const L2_X = 670;
const META_X = 1040;
const MODEL_W = 170;
const META_W = 140;
const TABLE1_X = 505;
const TABLE2_X = 875;
const TABLE_W = 130;

// row geometry
const BOX_H = 60;
const ROW_Y = [70, 200, 330];
const mid = (row: number) => ROW_Y[row] + BOX_H / 2;

const LAYER1 = ["Layer 1", "RF, KNN, GBDT"];
const LAYER2 = ["Layer 2", "SVM, Decision Tree"];

export default function MultiLayerBlendingDiagram() {
  return (
    <Figure
      width={1200}
      height={480}
      caption="Three-layer blending: each chunk of D_train trains exactly one layer, after passing through every layer already trained above it."
    >
      {/* column headers */}
      <text x={CHUNK_X + CHUNK_W / 2} y={35} fontSize={13} fontWeight={700} fill="var(--text-primary)" textAnchor="middle">
        D_train chunk
      </text>
      <text x={L1_X + MODEL_W / 2} y={35} fontSize={13} fontWeight={700} fill="var(--text-primary)" textAnchor="middle">
        Layer 1
      </text>
      <text x={L2_X + MODEL_W / 2} y={35} fontSize={13} fontWeight={700} fill="var(--text-primary)" textAnchor="middle">
        Layer 2
      </text>
      <text x={META_X + META_W / 2} y={35} fontSize={13} fontWeight={700} fill="var(--text-primary)" textAnchor="middle">
        Layer 3
      </text>

      {/* D_train split three ways */}
      <LabeledBox x={20} y={mid(1) - 30} w={90} h={60} lines={["D_train"]} />
      <PlainArrow x1={112} y1={mid(1) - 15} x2={CHUNK_X - 3} y2={mid(0)} />
      <PlainArrow x1={112} y1={mid(1)} x2={CHUNK_X - 3} y2={mid(1)} />
      <PlainArrow x1={112} y1={mid(1) + 15} x2={CHUNK_X - 3} y2={mid(2)} />

      <LabeledBox x={CHUNK_X} y={ROW_Y[0]} w={CHUNK_W} h={BOX_H} lines={["Chunk 1"]} />
      <LabeledBox x={CHUNK_X} y={ROW_Y[1]} w={CHUNK_W} h={BOX_H} lines={["Chunk 2"]} />
      <LabeledBox x={CHUNK_X} y={ROW_Y[2]} w={CHUNK_W} h={BOX_H} lines={["Chunk 3"]} />

      {/* ---- row 1: chunk 1 trains layer 1 ---- */}
      <PlainArrow
        x1={CHUNK_X + CHUNK_W + 2}
        y1={mid(0)}
        x2={L1_X - 3}
        y2={mid(0)}
        text="train"
        textPos={{ x: (CHUNK_X + CHUNK_W + L1_X) / 2, y: mid(0) - 8 }}
      />
      <LabeledBox x={L1_X} y={ROW_Y[0]} w={MODEL_W} h={BOX_H} lines={LAYER1} bold />

      {/* ---- row 2: chunk 2 flows through layer 1, trains layer 2 ---- */}
      <PlainArrow
        x1={CHUNK_X + CHUNK_W + 2}
        y1={mid(1)}
        x2={L1_X - 3}
        y2={mid(1)}
        text="predict"
        textPos={{ x: (CHUNK_X + CHUNK_W + L1_X) / 2, y: mid(1) - 8 }}
      />
      <LabeledBox x={L1_X} y={ROW_Y[1]} w={MODEL_W} h={BOX_H} lines={LAYER1} dashed />
      <PlainArrow x1={L1_X + MODEL_W + 2} y1={mid(1)} x2={TABLE1_X - 3} y2={mid(1)} />
      <LabeledBox x={TABLE1_X} y={ROW_Y[1]} w={TABLE_W} h={BOX_H} lines={["Layer 1 preds", "+ actual y"]} />
      <PlainArrow
        x1={TABLE1_X + TABLE_W + 2}
        y1={mid(1)}
        x2={L2_X - 3}
        y2={mid(1)}
        text="train"
        textPos={{ x: (TABLE1_X + TABLE_W + L2_X) / 2, y: mid(1) - 8 }}
      />
      <LabeledBox x={L2_X} y={ROW_Y[1]} w={MODEL_W} h={BOX_H} lines={LAYER2} bold />

      {/* ---- row 3: chunk 3 flows through layers 1 and 2, trains the meta-model ---- */}
      <PlainArrow
        x1={CHUNK_X + CHUNK_W + 2}
        y1={mid(2)}
        x2={L1_X - 3}
        y2={mid(2)}
        text="predict"
        textPos={{ x: (CHUNK_X + CHUNK_W + L1_X) / 2, y: mid(2) - 8 }}
      />
      <LabeledBox x={L1_X} y={ROW_Y[2]} w={MODEL_W} h={BOX_H} lines={LAYER1} dashed />
      <PlainArrow
        x1={L1_X + MODEL_W + 2}
        y1={mid(2)}
        x2={L2_X - 3}
        y2={mid(2)}
        text="Layer 1 preds"
        textPos={{ x: (L1_X + MODEL_W + L2_X) / 2, y: mid(2) - 8 }}
      />
      <LabeledBox x={L2_X} y={ROW_Y[2]} w={MODEL_W} h={BOX_H} lines={LAYER2} dashed />
      <PlainArrow x1={L2_X + MODEL_W + 2} y1={mid(2)} x2={TABLE2_X - 3} y2={mid(2)} />
      <LabeledBox x={TABLE2_X} y={ROW_Y[2]} w={TABLE_W} h={BOX_H} lines={["Layer 2 preds", "+ actual y"]} />
      <PlainArrow
        x1={TABLE2_X + TABLE_W + 2}
        y1={mid(2)}
        x2={META_X - 3}
        y2={mid(2)}
        text="train"
        textPos={{ x: (TABLE2_X + TABLE_W + META_X) / 2, y: mid(2) - 8 }}
      />
      <LabeledBox x={META_X} y={ROW_Y[2]} w={META_W} h={BOX_H} lines={["Meta-model", "Logistic Regression"]} bold />

      {/* the same trained models get reused further down */}
      <PlainArrow x1={L1_X + MODEL_W / 2} y1={ROW_Y[0] + BOX_H + 2} x2={L1_X + MODEL_W / 2} y2={ROW_Y[1] - 3} color="blue" dashed />
      <PlainArrow x1={L1_X + MODEL_W / 2} y1={ROW_Y[1] + BOX_H + 2} x2={L1_X + MODEL_W / 2} y2={ROW_Y[2] - 3} color="blue" dashed />
      <PlainArrow x1={L2_X + MODEL_W / 2} y1={ROW_Y[1] + BOX_H + 2} x2={L2_X + MODEL_W / 2} y2={ROW_Y[2] - 3} color="blue" dashed />

      {/* legend */}
      <rect x={20} y={430} width={34} height={20} rx={4} fill="none" stroke="var(--text-primary)" strokeWidth={2.6} />
      <text x={64} y={445} fontSize={12.5} fill="var(--text-primary)">
        trained on this row&apos;s chunk
      </text>
      <rect x={270} y={430} width={34} height={20} rx={4} fill="none" stroke="var(--text-primary)" strokeWidth={1.3} strokeDasharray="6 4" />
      <text x={314} y={445} fontSize={12.5} fill="var(--text-primary)">
        already trained, only predicts
      </text>
      <PlainArrow x1={530} y1={440} x2={568} y2={440} color="blue" dashed />
      <text x={578} y={445} fontSize={12.5} fill="var(--text-primary)">
        same trained models, reused
      </text>
    </Figure>
  );
}
