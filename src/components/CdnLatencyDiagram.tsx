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
    <Figure width={760} height={350} caption="A client near a CDN node fetches the asset in a fraction of the round trip to the origin.">
      <Box x={40} y={26} w={120} h={44} label="Client" />
      <Box x={40} y={128} w={120} h={44} label="Client" />
      <Box x={515} y={50} w={230} h={200} label="Origin" />
      <Box x={300} y={246} w={150} h={64} label="CDN" />

      {/* shared bus from both clients */}
      <Wire points="160,48 215,48 215,150" />
      <Wire points="160,150 215,150" />

      {/* direct path to the origin, entering at its middle */}
      <PlainArrow x1={215} y1={150} x2={511} y2={150} color="blue" text="120ms" textPos={{ x: 365, y: 136 }} />

      {/* short hop down to the CDN node */}
      <Wire points="215,150 215,278" />
      <PlainArrow x1={215} y1={278} x2={296} y2={278} color="blue" text="40ms" textPos={{ x: 250, y: 264 }} />

      {/* CDN pulls the asset from the origin once, connecting the two IMG markers */}
      <polyline points="433,289 574,289 574,236" fill="none" stroke="#f97316" strokeWidth={1.6} />

      <ImgMarker x={560} y={208} />
      <ImgMarker x={405} y={276} />
    </Figure>
  );
}
