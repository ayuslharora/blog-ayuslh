import {
  Box,
  LaptopIcon,
  PhoneIcon,
  DnsIcon,
  LoadBalancerIcon,
  ServerIcon,
  CacheIcon,
  DbIcon,
  PlainArrow,
  Figure,
} from "./BookFigure";

export default function WebDataCacheTierDesignDiagram() {
  return (
    <Figure width={720} height={800}>
      <DnsIcon cx={665} cy={95} />

      <Box x={110} y={52} w={330} h={115} label="User" />
      <LaptopIcon x={150} y={82} label="Web browser" />
      <PhoneIcon x={305} y={78} label="Mobile app" />

      <PlainArrow x1={440} y1={88} x2={623} y2={88} color="blue" text="www.mysite.com" textPos={{ x: 530, y: 74 }} />
      <PlainArrow x1={623} y1={112} x2={440} y2={122} color="blue" text="IP address" textPos={{ x: 528, y: 140 }} />

      <PlainArrow x1={205} y1={167} x2={262} y2={256} color="blue" text="www.mysite.com" textPos={{ x: 150, y: 228 }} />
      <PlainArrow x1={330} y1={167} x2={288} y2={256} color="blue" text="api.mysite.com" textPos={{ x: 392, y: 228 }} />

      <LoadBalancerIcon x={250} y={262} label="Load balancer" />

      <PlainArrow x1={262} y1={308} x2={210} y2={390} color="blue" />
      <PlainArrow x1={288} y1={308} x2={340} y2={390} color="blue" />

      <Box x={120} y={372} w={300} h={100} dashed />
      <text x={434} y={428} fontSize={14} fill="var(--text-primary)">
        Web tier
      </text>
      <ServerIcon x={195} y={392} label="Server 1" />
      <ServerIcon x={320} y={392} label="Server 2" />

      <PlainArrow x1={250} y1={458} x2={438} y2={524} color="blue" text="Read" textPos={{ x: 300, y: 508 }} />
      <PlainArrow x1={360} y1={458} x2={456} y2={516} color="blue" text="Read" textPos={{ x: 440, y: 486 }} />

      <PlainArrow x1={205} y1={458} x2={165} y2={656} color="blue" text="Write" textPos={{ x: 150, y: 560 }} />
      <PlainArrow x1={320} y1={458} x2={185} y2={658} color="blue" text="Write" textPos={{ x: 252, y: 560 }} />

      <CacheIcon x={430} y={520} />

      <PlainArrow x1={452} y1={574} x2={408} y2={656} color="blue" text="Read on miss" textPos={{ x: 476, y: 620 }} />

      <Box x={95} y={652} w={380} h={105} dashed />
      <text x={488} y={706} fontSize={14} fill="var(--text-primary)">
        Data tier
      </text>
      <DbIcon x={130} y={668} label="Master DB" />
      <DbIcon x={372} y={668} label="Slave DB" />
      <PlainArrow x1={190} y1={692} x2={368} y2={692} color="blue" text="Replicate" textPos={{ x: 280, y: 678 }} />
    </Figure>
  );
}
