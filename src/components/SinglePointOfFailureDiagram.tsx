import { LaptopIcon, RouterIcon, ServerIcon, Figure } from "./BookFigure";

export default function SinglePointOfFailureDiagram() {
  const wire = { stroke: "var(--text-primary)", strokeWidth: 1.5 } as const;

  return (
    <Figure width={640} height={340}>
      <text x={320} y={40} fontSize={15} fontWeight={700} fill="#ef4444" textAnchor="middle">
        SINGLE POINT OF FAILURE
      </text>

      <LaptopIcon x={40} y={60} />
      <LaptopIcon x={40} y={150} />
      <LaptopIcon x={40} y={240} />

      <line x1={92} y1={90} x2={296} y2={168} {...wire} />
      <line x1={92} y1={180} x2={296} y2={180} {...wire} />
      <line x1={92} y1={270} x2={296} y2={192} {...wire} />

      <circle cx={324} cy={182} r={52} fill="none" stroke="#ef4444" strokeWidth={2} />
      <RouterIcon x={296} y={162} />

      <line x1={352} y1={180} x2={534} y2={180} {...wire} />

      <ServerIcon x={540} y={158} label="Application Server" />
    </Figure>
  );
}
