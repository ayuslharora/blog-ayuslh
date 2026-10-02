import { PlainArrow, Figure } from "./BookFigure";

function LabeledBox({
  x,
  y,
  w,
  h,
  lines,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
}) {
  const lineHeight = 16;
  const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2 + 5;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="none" stroke="var(--text-primary)" strokeWidth={1.5} />
      <text x={x + w / 2} y={startY} fontSize={13} fill="var(--text-primary)" textAnchor="middle">
        {lines.map((line, i) => (
          <tspan key={i} x={x + w / 2} dy={i === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

const CELL_W = 42;
const CELL_H = 32;
const COL_GAP = 7;
const ROW_GAP = 15;
const GRID_X = 230;
const GRID_Y = 95;
const GRID_BOTTOM = GRID_Y + 4 * (CELL_H + ROW_GAP) - ROW_GAP;
const GRID_RIGHT = GRID_X + 4 * (CELL_W + COL_GAP) + 10 + 300;

function FoldRotationGrid() {
  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2, 3];
  return (
    <g>
      {rows.map((row) => {
        const y = GRID_Y + row * (CELL_H + ROW_GAP);
        return (
          <g key={row}>
            {cols.map((col) => {
              const x = GRID_X + col * (CELL_W + COL_GAP);
              const isHeldOut = col === row;
              return (
                <g key={col}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={CELL_H}
                    rx={3}
                    fill={isHeldOut ? "#dbeafe" : "none"}
                    stroke={isHeldOut ? "#2563eb" : "var(--text-primary)"}
                    strokeWidth={1.3}
                  />
                  <text
                    x={x + CELL_W / 2}
                    y={y + CELL_H / 2 + 4}
                    fontSize={11}
                    fill={isHeldOut ? "#1d4ed8" : "var(--text-primary)"}
                    textAnchor="middle"
                  >
                    F{col + 1}
                  </text>
                </g>
              );
            })}
            <text x={GRID_X + 4 * (CELL_W + COL_GAP) + 10} y={y + CELL_H / 2 + 4} fontSize={12.5} fill="var(--text-primary)">
              round {row + 1}: train on the other 3, predict F{row + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function StackingDiagram() {
  return (
    <Figure
      width={1170}
      height={690}
      caption="Stacking: K-fold CV builds out-of-fold meta-features for every row, then the base models are rebuilt on all of D_train before inference."
    >
      {/* ---- Stage 1: build the meta-training data ---- */}
      <text x={20} y={22} fontSize={13} fontWeight={700} fill="var(--text-primary)">
        Stage 1: build the meta-model&apos;s training data
      </text>
      <text x={20} y={42} fontSize={12.5} fontStyle="italic" fill="var(--text-secondary)">
        shown for one base model (Random Forest); the same 4 rounds repeat for KNN and Gradient Boosting
      </text>

      <LabeledBox x={20} y={155} w={100} h={50} lines={["D_train"]} />
      <PlainArrow x1={122} y1={180} x2={225} y2={180} text="K = 4 folds" textPos={{ x: 172, y: 165 }} />

      <FoldRotationGrid />

      <PlainArrow x1={GRID_RIGHT} y1={(GRID_Y + GRID_BOTTOM) / 2} x2={GRID_RIGHT + 40} y2={(GRID_Y + GRID_BOTTOM) / 2} />
      <LabeledBox
        x={GRID_RIGHT + 40}
        y={GRID_Y - 10}
        w={260}
        h={GRID_BOTTOM - GRID_Y + 20}
        lines={[
          "Out-of-fold meta-features",
          "RF pred, KNN pred, GBDT pred",
          "+ actual y",
          "(every row predicted exactly",
          "once, by a model that never",
          "trained on that row)",
        ]}
      />

      <PlainArrow x1={GRID_RIGHT + 170} y1={GRID_BOTTOM + 30} x2={GRID_RIGHT + 170} y2={GRID_BOTTOM + 65} />
      <LabeledBox x={GRID_RIGHT + 50} y={GRID_BOTTOM + 68} w={240} h={55} lines={["Meta-model (trained once)", "Logistic Regression"]} />

      {/* ---- divider ---- */}
      <line x1={20} y1={400} x2={1160} y2={400} stroke="var(--text-secondary)" strokeWidth={1} strokeDasharray="4 5" />
      <text x={20} y={425} fontSize={13} fontWeight={700} fill="var(--text-primary)">
        Stage 2: rebuild the base models before inference
      </text>

      {/* ---- Stage 2: refit base models on all of D_train ---- */}
      <LabeledBox x={20} y={500} w={110} h={50} lines={["D_train", "(full, no folds)"]} />

      <PlainArrow x1={132} y1={500} x2={195} y2={450} />
      <PlainArrow x1={132} y1={525} x2={195} y2={525} />
      <PlainArrow x1={132} y1={545} x2={195} y2={590} />

      <LabeledBox x={200} y={430} w={150} h={45} lines={["Random Forest (final)"]} />
      <LabeledBox x={200} y={503} w={150} h={45} lines={["KNN (final)"]} />
      <LabeledBox x={200} y={575} w={150} h={45} lines={["Gradient Boosting (final)"]} />

      <PlainArrow x1={352} y1={452} x2={470} y2={500} />
      <PlainArrow x1={352} y1={525} x2={470} y2={525} />
      <PlainArrow x1={352} y1={597} x2={470} y2={550} />

      <LabeledBox x={475} y={495} w={150} h={60} lines={["Final stacking model", "(base models + meta-model)"]} />
      <PlainArrow x1={1020} y1={391} x2={1020} y2={480} color="blue" dashed />
      <PlainArrow
        x1={1020}
        y1={480}
        x2={629}
        y2={517}
        color="blue"
        dashed
        text="already-trained meta-model plugs straight in"
        textPos={{ x: 1000, y: 475 }}
      />

      <LabeledBox x={500} y={425} w={100} h={40} lines={["New / test row"]} />
      <PlainArrow x1={550} y1={465} x2={550} y2={493} />

      <PlainArrow x1={627} y1={525} x2={690} y2={525} />
      <text x={695} y={520} fontSize={13} fill="var(--text-primary)">
        Final
      </text>
      <text x={695} y={536} fontSize={13} fill="var(--text-primary)">
        prediction
      </text>
    </Figure>
  );
}
