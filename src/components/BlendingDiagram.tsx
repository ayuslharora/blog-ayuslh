import { PlainArrow, Wire, Figure } from "./BookFigure";

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

export default function BlendingDiagram() {
  return (
    <Figure width={980} height={420} caption="Blending: a single holdout split produces the meta-model's training rows.">
      {/* D_train and its split */}
      <LabeledBox x={20} y={165} w={100} h={55} lines={["D_train"]} />
      <PlainArrow x1={120} y1={178} x2={185} y2={95} text="80%" textPos={{ x: 150, y: 120 }} />
      <PlainArrow x1={120} y1={205} x2={185} y2={290} text="20%" textPos={{ x: 150, y: 260 }} />

      <LabeledBox x={190} y={65} w={120} h={55} lines={["Train set"]} />
      <LabeledBox x={190} y={265} w={120} h={55} lines={["Holdout set"]} />

      {/* base models trained on Train set */}
      <LabeledBox x={395} y={10} w={160} h={50} lines={["M1: Random Forest"]} />
      <LabeledBox x={395} y={90} w={160} h={50} lines={["M2: KNN"]} />
      <LabeledBox x={395} y={170} w={160} h={50} lines={["M3: Gradient Boosting"]} />

      <PlainArrow x1={312} y1={85} x2={393} y2={35} text="train" textPos={{ x: 350, y: 48 }} />
      <PlainArrow x1={312} y1={92} x2={393} y2={115} />
      <PlainArrow x1={312} y1={98} x2={393} y2={195} />

      {/* holdout rows run through the now-trained models (blue, dashed) */}
      <PlainArrow x1={255} y1={265} x2={420} y2={62} color="blue" dashed />
      <PlainArrow x1={280} y1={265} x2={475} y2={142} color="blue" dashed />
      <PlainArrow
        x1={305}
        y1={265}
        x2={475}
        y2={222}
        color="blue"
        dashed
        text="predict on holdout"
        textPos={{ x: 235, y: 245 }}
      />

      {/* outputs feed the meta-feature table */}
      <PlainArrow x1={557} y1={35} x2={635} y2={100} />
      <PlainArrow x1={557} y1={115} x2={635} y2={120} />
      <PlainArrow x1={557} y1={195} x2={635} y2={145} />
      <Wire points="250,320 650,320" color="blue" />
      <PlainArrow x1={650} y1={320} x2={650} y2={182} color="blue" dashed text="actual y" textPos={{ x: 460, y: 335 }} />

      <LabeledBox
        x={640}
        y={70}
        w={180}
        h={110}
        lines={["Meta-features", "RF pred, KNN pred, GBDT pred", "+ actual y (holdout rows only)"]}
      />

      <PlainArrow x1={730} y1={182} x2={730} y2={235} />
      <LabeledBox x={635} y={238} w={190} h={55} lines={["Meta-model", "(e.g. Logistic Regression)"]} />

      <PlainArrow x1={827} y1={265} x2={900} y2={265} />
      <text x={908} y={270} fontSize={13} fill="var(--text-primary)">
        Final
      </text>
      <text x={908} y={286} fontSize={13} fill="var(--text-primary)">
        prediction
      </text>
    </Figure>
  );
}
