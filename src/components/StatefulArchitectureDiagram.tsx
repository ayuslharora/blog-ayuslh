import { LaptopIcon, ServerIcon, PlainArrow, Figure } from "./BookFigure";

function Column({ cx, user }: { cx: number; user: string }) {
  const boxX = cx - 105;
  const boxW = 210;
  return (
    <g>
      <LaptopIcon x={cx - 23} y={12} label={`User ${user}`} />

      <PlainArrow x1={cx} y1={92} x2={cx} y2={168} color="blue" />
      <text
        x={cx - 9}
        y={132}
        fontSize={11}
        fill="var(--text-primary)"
        textAnchor="middle"
        transform={`rotate(-90 ${cx - 9} 132)`}
      >
        http request
      </text>

      <rect
        x={boxX}
        y={174}
        width={boxW}
        height={250}
        rx={6}
        fill="none"
        stroke="var(--text-primary)"
        strokeWidth={1.5}
      />
      <text x={cx} y={202} fontSize={15} fontWeight={600} fill="var(--text-primary)" textAnchor="middle">
        Server {user === "A" ? 1 : user === "B" ? 2 : 3}
      </text>
      <line x1={boxX} y1={216} x2={boxX + boxW} y2={216} stroke="var(--text-primary)" strokeWidth={1.2} />

      <ServerIcon x={cx - 18} y={232} />

      <text x={boxX + 16} y={332} fontSize={12} fill="var(--text-primary)">
        &bull; Session data for User {user}
      </text>
      <text x={boxX + 16} y={356} fontSize={12} fill="var(--text-primary)">
        &bull; Profile image for User {user}
      </text>
    </g>
  );
}

export default function StatefulArchitectureDiagram() {
  return (
    <Figure
      width={760}
      height={450}
      caption="Each user's session and files live on one server, so every request from that user must return to the same server."
    >
      <Column cx={130} user="A" />
      <Column cx={380} user="B" />
      <Column cx={630} user="C" />
    </Figure>
  );
}
