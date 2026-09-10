import { ServerIcon, CacheIcon, DbIcon, PlainArrow, Figure } from "./BookFigure";

export default function CacheReadThroughDiagram() {
  return (
    <Figure width={1000} height={190}>
      <ServerIcon x={40} y={72} label="Web server" />

      <CacheIcon x={430} y={58} />

      <DbIcon x={884} y={62} label="Database" />

      {/* cache hit: cache -> web server */}
      <PlainArrow
        x1={430}
        y1={72}
        x2={100}
        y2={72}
        text="1. If data exists in cache, read data from cache"
        textPos={{ x: 265, y: 58 }}
      />

      {/* return to web server */}
      <PlainArrow
        x1={430}
        y1={108}
        x2={100}
        y2={108}
        text="2.2 Return data to the web server"
        textPos={{ x: 265, y: 126 }}
      />

      {/* cache miss: db -> cache */}
      <PlainArrow
        x1={884}
        y1={90}
        x2={540}
        y2={90}
        text="2.1 If data doesn't exist in cache, save data to cache"
        textPos={{ x: 712, y: 76 }}
      />
    </Figure>
  );
}
