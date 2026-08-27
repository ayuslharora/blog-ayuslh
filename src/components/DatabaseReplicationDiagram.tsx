import { Box, DbIcon, ServerClusterIcon, Wire, PlainArrow, Figure } from "./BookFigure";

export default function DatabaseReplicationDiagram() {
  return (
    <Figure width={700} height={640}>
      <Box x={12} y={8} w={676} h={600} dashed />

      <Box x={252} y={14} w={124} h={126} dashed />
      <ServerClusterIcon x={280} y={24} label="Web servers" />

      <DbIcon x={72} y={430} label="Master DB" />
      <DbIcon x={408} y={326} label="Slave DB1" />
      <DbIcon x={424} y={428} label="Slave DB2" />
      <DbIcon x={424} y={528} label="Slave DB3" />

      {/* writes: web servers -> master */}
      <Wire points="288,140 288,180 100,180" color="blue" />
      <PlainArrow x1={100} y1={180} x2={100} y2={426} color="blue" text="writes" textPos={{ x: 78, y: 320 }} />

      {/* reads: web servers -> slaves */}
      <Wire points="342,140 342,206 642,206 642,552" color="green" />
      <PlainArrow x1={642} y1={352} x2={470} y2={352} color="green" text="reads" textPos={{ x: 560, y: 340 }} />
      <PlainArrow x1={642} y1={452} x2={486} y2={452} color="green" text="reads" textPos={{ x: 600, y: 440 }} />
      <PlainArrow x1={642} y1={548} x2={486} y2={548} color="green" text="reads" textPos={{ x: 600, y: 536 }} />

      {/* replication: master -> slaves */}
      <PlainArrow x1={128} y1={440} x2={404} y2={350} color="blue" text="DB replication" textPos={{ x: 250, y: 352 }} />
      <PlainArrow x1={128} y1={452} x2={420} y2={452} color="blue" text="DB replication" textPos={{ x: 272, y: 442 }} />
      <PlainArrow x1={128} y1={462} x2={420} y2={542} color="blue" text="DB replication" textPos={{ x: 250, y: 524 }} />
    </Figure>
  );
}
