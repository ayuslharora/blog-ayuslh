import {
  Box,
  LaptopIcon,
  PhoneIcon,
  DnsIcon,
  CloudIcon,
  LoadBalancerIcon,
  ServerIcon,
  CacheIcon,
  DbIcon,
  CircledNumber,
  PlainArrow,
  Figure,
} from "./BookFigure";

export default function WebDataCdnCacheTierDesignDiagram() {
  return (
    <Figure width={760} height={820}>
      <DnsIcon cx={95} cy={110} />

      <Box x={170} y={52} w={330} h={115} label="User" />
      <LaptopIcon x={210} y={82} label="Web browser" />
      <PhoneIcon x={365} y={78} label="Mobile app" />

      <PlainArrow x1={170} y1={100} x2={140} y2={100} color="blue" />
      <PlainArrow x1={140} y1={124} x2={170} y2={124} color="blue" />

      <CloudIcon x={600} y={64} />
      <CircledNumber cx={636} cy={162} n={1} />

      <PlainArrow x1={500} y1={100} x2={596} y2={100} color="blue" text="static assets" textPos={{ x: 548, y: 86 }} />

      <PlainArrow x1={265} y1={167} x2={322} y2={256} color="blue" text="www.mysite.com" textPos={{ x: 210, y: 228 }} />
      <PlainArrow x1={390} y1={167} x2={348} y2={256} color="blue" text="api.mysite.com" textPos={{ x: 452, y: 228 }} />

      <LoadBalancerIcon x={310} y={262} label="Load balancer" />

      <PlainArrow x1={322} y1={308} x2={270} y2={390} color="blue" />
      <PlainArrow x1={348} y1={308} x2={400} y2={390} color="blue" />

      <Box x={180} y={372} w={300} h={100} dashed />
      <text x={494} y={428} fontSize={14} fill="var(--text-primary)">
        Web tier
      </text>
      <ServerIcon x={255} y={392} label="Server 1" />
      <ServerIcon x={380} y={392} label="Server 2" />

      <PlainArrow x1={310} y1={458} x2={498} y2={524} color="green" text="Read" textPos={{ x: 360, y: 508 }} />
      <PlainArrow x1={420} y1={458} x2={516} y2={516} color="green" text="Read" textPos={{ x: 500, y: 486 }} />

      <PlainArrow x1={265} y1={458} x2={225} y2={656} color="blue" text="Write" textPos={{ x: 210, y: 560 }} />
      <PlainArrow x1={380} y1={458} x2={245} y2={658} color="blue" text="Write" textPos={{ x: 312, y: 560 }} />

      <CacheIcon x={490} y={520} />
      <CircledNumber cx={555} cy={550} n={2} />

      <PlainArrow x1={512} y1={574} x2={468} y2={656} color="green" text="Read on miss" textPos={{ x: 536, y: 620 }} />

      <Box x={155} y={652} w={380} h={105} dashed />
      <text x={548} y={706} fontSize={14} fill="var(--text-primary)">
        Data tier
      </text>
      <DbIcon x={190} y={668} label="Master DB" />
      <DbIcon x={432} y={668} label="Slave DB" />
      <PlainArrow x1={250} y1={692} x2={428} y2={692} color="blue" text="Replicate" textPos={{ x: 340, y: 678 }} />
    </Figure>
  );
}
