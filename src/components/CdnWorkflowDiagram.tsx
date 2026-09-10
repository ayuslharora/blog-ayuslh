import { LaptopIcon, ServerIcon, CloudIcon, PlainArrow, Figure } from "./BookFigure";

export default function CdnWorkflowDiagram() {
  return (
    <Figure width={1000} height={380}>
      <LaptopIcon x={40} y={44} label="User A" />
      <LaptopIcon x={40} y={250} label="User B" />

      <CloudIcon x={430} y={150} />

      <ServerIcon x={900} y={168} label="Server" />

      {/* User A: request and response */}
      <PlainArrow x1={96} y1={52} x2={452} y2={150} color="blue" text="1. get image.png" textPos={{ x: 250, y: 78 }} />
      <PlainArrow x1={452} y1={182} x2={96} y2={92} color="blue" text="4. return image.png" textPos={{ x: 250, y: 150 }} />

      {/* CDN miss: fetch from origin, then store */}
      <PlainArrow
        x1={556}
        y1={168}
        x2={894}
        y2={182}
        color="blue"
        dashed
        text="2. if not in CDN, get image.png from server"
        textPos={{ x: 725, y: 150 }}
      />
      <PlainArrow
        x1={894}
        y1={210}
        x2={556}
        y2={200}
        color="blue"
        dashed
        text="3. store image.png in CDN"
        textPos={{ x: 725, y: 232 }}
      />

      {/* User B: served straight from cache */}
      <PlainArrow x1={96} y1={262} x2={452} y2={206} color="blue" text="5. get image.png" textPos={{ x: 250, y: 300 }} />
      <PlainArrow x1={452} y1={224} x2={96} y2={300} color="blue" text="6. return image.png" textPos={{ x: 250, y: 335 }} />
    </Figure>
  );
}
