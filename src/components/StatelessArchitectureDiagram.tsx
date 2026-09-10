import { LaptopIcon, ServerClusterIcon, NoSqlIcon, PlainArrow, Figure } from "./BookFigure";

export default function StatelessArchitectureDiagram() {
  return (
    <Figure
      width={680}
      height={600}
      caption="Any web server can handle any request, because session state is read from a shared store instead of local memory."
    >
      <LaptopIcon x={45} y={16} label="User A" />
      <LaptopIcon x={317} y={16} label="User B" />
      <LaptopIcon x={589} y={16} label="User C" />

      <rect
        x={228}
        y={244}
        width={224}
        height={132}
        rx={10}
        fill="none"
        stroke="#38bdf8"
        strokeWidth={1.5}
        strokeDasharray="7 5"
      />
      <ServerClusterIcon x={306} y={258} label="Web servers" />

      <PlainArrow x1={68} y1={62} x2={288} y2={250} color="blue" text="http request" textPos={{ x: 150, y: 150 }} />
      <PlainArrow x1={340} y1={70} x2={340} y2={240} color="blue" text="http request" textPos={{ x: 372, y: 150 }} />
      <PlainArrow x1={612} y1={62} x2={392} y2={250} color="blue" text="http request" textPos={{ x: 532, y: 150 }} />

      <PlainArrow x1={340} y1={376} x2={340} y2={452} color="blue" text="fetch state" textPos={{ x: 388, y: 418 }} />

      <NoSqlIcon x={312} y={456} label="Shared Storage" />
    </Figure>
  );
}
