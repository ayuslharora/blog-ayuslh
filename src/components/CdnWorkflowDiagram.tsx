import { LaptopIcon, ServerIcon, CloudIcon, PlainArrow, Figure } from "./BookFigure";

export default function CdnWorkflowDiagram() {
  return (
    <Figure width={1000} height={380}>
      <LaptopIcon x={40} y={40} label="User A" />
      <LaptopIcon x={40} y={278} label="User B" />

      <CloudIcon x={440} y={150} />

      <ServerIcon x={900} y={158} label="Server" />

      {/* User A: request and response */}
      <PlainArrow x1={92} y1={50} x2={462} y2={164} color="blue" text="1. get image.png" textPos={{ x: 262, y: 86 }} />
      <PlainArrow x1={462} y1={186} x2={92} y2={78} color="blue" text="4. return image.png" textPos={{ x: 262, y: 150 }} />

      {/* CDN miss: fetch from origin, then store */}
      <PlainArrow
        x1={556}
        y1={172}
        x2={894}
        y2={174}
        color="blue"
        dashed
        text="2. if not in CDN, get image.png from server"
        textPos={{ x: 725, y: 152 }}
      />
      <PlainArrow
        x1={894}
        y1={198}
        x2={556}
        y2={198}
        color="blue"
        dashed
        text="3. store image.png in CDN"
        textPos={{ x: 725, y: 222 }}
      />

      {/* User B: served straight from cache */}
      <PlainArrow x1={92} y1={298} x2={462} y2={206} color="blue" text="5. get image.png" textPos={{ x: 262, y: 286 }} />
      <PlainArrow x1={462} y1={224} x2={92} y2={324} color="blue" text="6. return image.png" textPos={{ x: 262, y: 312 }} />
    </Figure>
  );
}
