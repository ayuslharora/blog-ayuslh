import { PlainArrow, Figure } from "./BookFigure";

function LabeledBox({
  x,
  y,
  w,
  h,
  lines,
  dashed,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  dashed?: boolean;
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
        strokeWidth={1.5}
        strokeDasharray={dashed ? "6 4" : undefined}
      />
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

function FoldBox({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={46} height={40} rx={4} fill="none" stroke="var(--text-primary)" strokeWidth={1.3} />
      <text x={x + 23} y={y + 25} fontSize={12} fill="var(--text-primary)" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

export default function StackingDiagram() {
  return (
    <Figure
      width={940}
      height={560}
      caption="Stacking: K-fold CV builds out-of-fold meta-features for every row, then the base models are rebuilt on all of D_train before inference."
    >
      {/* ---- Stage 1: build the meta-training data ---- */}
      <text x={20} y={22} fontSize={13} fontWeight={700} fill="var(--text-primary)">
        Stage 1: train the meta-model
      </text>

      <LabeledBox x={20} y={95} w={100} h={50} lines={["D_train"]} />

      <PlainArrow x1={122} y1={120} x2={150} y2={120} text="K=4" textPos={{ x: 136, y: 100 }} />
      <FoldBox x={150} y={100} label="F1" />
      <FoldBox x={200} y={100} label="F2" />
      <FoldBox x={250} y={100} label="F3" />
      <FoldBox x={300} y={100} label="F4" />

      <PlainArrow x1={350} y1={120} x2={405} y2={120} />
      <LabeledBox
        x={410}
        y={70}
        w={210}
        h={100}
        lines={["K-fold CV", "(per base model: train on 3", "folds, predict the 4th)"]}
      />

      <PlainArrow x1={624} y1={120} x2={650} y2={120} />
      <LabeledBox
        x={650}
        y={60}
        w={260}
        h={120}
        lines={["Out-of-fold meta-features", "RF pred, KNN pred, GBDT pred", "+ actual y", "(all n rows of D_train)"]}
      />

      <PlainArrow x1={780} y1={182} x2={780} y2={225} />
      <LabeledBox x={660} y={228} w={240} h={55} lines={["Meta-model (trained once)", "Logistic Regression"]} />

      {/* ---- divider ---- */}
      <line x1={20} y1={320} x2={920} y2={320} stroke="var(--text-secondary)" strokeWidth={1} strokeDasharray="4 5" />
      <text x={20} y={345} fontSize={13} fontWeight={700} fill="var(--text-primary)">
        Stage 2: rebuild the base models before inference
      </text>

      {/* ---- Stage 2: refit base models on all of D_train ---- */}
      <LabeledBox x={20} y={420} w={110} h={50} lines={["D_train", "(full, no folds)"]} />

      <PlainArrow x1={132} y1={420} x2={195} y2={370} />
      <PlainArrow x1={132} y1={445} x2={195} y2={445} />
      <PlainArrow x1={132} y1={465} x2={195} y2={510} />

      <LabeledBox x={200} y={350} w={150} h={45} lines={["Random Forest (final)"]} />
      <LabeledBox x={200} y={423} w={150} h={45} lines={["KNN (final)"]} />
      <LabeledBox x={200} y={495} w={150} h={45} lines={["Gradient Boosting (final)"]} />

      <PlainArrow x1={352} y1={372} x2={470} y2={420} />
      <PlainArrow x1={352} y1={445} x2={470} y2={445} />
      <PlainArrow x1={352} y1={517} x2={470} y2={470} />

      <PlainArrow x1={780} y1={283} x2={780} y2={400} color="blue" dashed />
      <PlainArrow x1={780} y1={400} x2={625} y2={420} color="blue" dashed text="already-trained meta-model" textPos={{ x: 790, y: 395 }} />

      <LabeledBox x={475} y={415} w={150} h={60} lines={["Final stacking model", "(base models + meta-model)"]} />

      <LabeledBox x={500} y={345} w={100} h={40} lines={["New / test row"]} />
      <PlainArrow x1={550} y1={385} x2={550} y2={413} />

      <PlainArrow x1={627} y1={445} x2={690} y2={445} />
      <text x={695} y={440} fontSize={13} fill="var(--text-primary)">
        Final
      </text>
      <text x={695} y={456} fontSize={13} fill="var(--text-primary)">
        prediction
      </text>
    </Figure>
  );
}
