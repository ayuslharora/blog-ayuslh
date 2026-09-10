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
  NoSqlIcon,
  CircledNumber,
  PlainArrow,
  Figure,
} from "./BookFigure";

export default function WebDataStatelessTierDesignDiagram() {
  return (
    <Figure width={780} height={860}>
      <DnsIcon cx={80} cy={110} />

      <Box x={190} y={52} w={330} h={115} label="User" />
      <LaptopIcon x={235} y={82} label="Web browser" />
      <PhoneIcon x={390} y={78} label="Mobile app" />

      <PlainArrow x1={190} y1={100} x2={124} y2={100} color="blue" />
      <PlainArrow x1={520} y1={100} x2={616} y2={100} color="blue" />

      <CloudIcon x={620} y={64} />

      <PlainArrow x1={285} y1={167} x2={342} y2={256} color="blue" text="www.mysite.com" textPos={{ x: 228, y: 226 }} />
      <PlainArrow x1={410} y1={167} x2={368} y2={256} color="blue" text="api.mysite.com" textPos={{ x: 470, y: 226 }} />

      <LoadBalancerIcon x={330} y={262} label="Load balancer" />

      <PlainArrow x1={342} y1={308} x2={255} y2={392} color="blue" />
      <PlainArrow x1={368} y1={308} x2={470} y2={392} color="blue" />

      <Box x={150} y={378} w={440} h={112} dashed />
      <CircledNumber cx={612} cy={430} n={1} />
      <text x={628} y={435} fontSize={14} fill="var(--text-primary)">
        Auto scale
      </text>
      <ServerIcon x={186} y={398} label="Server 1" />
      <ServerIcon x={292} y={398} label="Server 2" />
      <ServerIcon x={398} y={398} label="Server 3" />
      <ServerIcon x={504} y={398} label="Server 4" />

      <PlainArrow x1={300} y1={472} x2={150} y2={694} color="blue" dashed />
      <PlainArrow x1={340} y1={472} x2={268} y2={694} color="blue" text="Write" textPos={{ x: 292, y: 588 }} />
      <PlainArrow x1={392} y1={472} x2={404} y2={694} color="blue" dashed text="Read" textPos={{ x: 372, y: 588 }} />

      <PlainArrow x1={444} y1={472} x2={558} y2={704} color="green" />
      <PlainArrow x1={474} y1={472} x2={694} y2={712} color="purple" />

      <Box x={95} y={690} w={402} h={118} dashed />
      <DbIcon x={112} y={706} label="Slave DB" />
      <DbIcon x={240} y={706} label="Master DB" />
      <DbIcon x={368} y={706} label="Slave DB" />
      <PlainArrow x1={236} y1={730} x2={172} y2={730} color="blue" startArrow text="Replicate" textPos={{ x: 204, y: 716 }} />
      <PlainArrow x1={300} y1={730} x2={364} y2={730} color="blue" startArrow text="Replicate" textPos={{ x: 332, y: 716 }} />

      <CacheIcon x={512} y={706} />
      <NoSqlIcon x={666} y={710} label="NoSQL" />
    </Figure>
  );
}
