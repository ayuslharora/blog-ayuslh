import { Box, PlainArrow, Wire, Figure } from "./BookFigure";

function ImgMarker({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M14,0 L28,26 L0,26 Z" fill="#f97316" />
      <text x={14} y={22} fontSize={8} fontWeight={700} fill="white" textAnchor="middle">
        IMG
      </text>
    </g>
  );
}

export default function CdnLatencyDiagram() {
  return (
    <Figure width={760} height={330} caption="A client near a CDN node fetches the asset in a fraction of the round trip to the origin.">
      <Box x={40} y={22} w={120} h={46} label="Client" />
      <Box x={40} y={150} w={120} h={46} label="Client" />
      <Box x={520} y={38} w={230} h={180} label="Origin" />
      <Box x={300} y={236} w={150} h={60} label="CDN" />

      {/* shared bus from both clients */}
      <Wire points="160,45 210,45 210,266" />
      <Wire points="160,173 210,173" />

      {/* direct path to origin */}
      <PlainArrow x1={210} y1={173} x2={516} y2={173} color="blue" text="120ms" textPos={{ x: 370, y: 160 }} />

      {/* short hop to the CDN node */}
      <PlainArrow x1={210} y1={266} x2={296} y2={266} color="blue" text="40ms" textPos={{ x: 240, y: 252 }} />

      {/* CDN pulls the asset from the origin once */}
      <polyline points="450,272 606,272 606,220" fill="none" stroke="#f97316" strokeWidth={1.6} />

      <ImgMarker x={602} y={194} />
      <ImgMarker x={360} y={272} />
    </Figure>
  );
}
