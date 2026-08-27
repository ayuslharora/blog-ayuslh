import {
  Box,
  LaptopIcon,
  PhoneIcon,
  DnsIcon,
  LoadBalancerIcon,
  ServerIcon,
  DbIcon,
  PlainArrow,
  Figure,
} from "./BookFigure";

export default function WebDataTierDesignDiagram() {
  return (
    <Figure width={720} height={740}>
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

      <PlainArrow x1={205} y1={458} x2={168} y2={596} color="blue" text="Write" textPos={{ x: 150, y: 552 }} />
      <PlainArrow x1={330} y1={458} x2={182} y2={596} color="blue" text="Write" textPos={{ x: 228, y: 552 }} />
      <PlainArrow x1={225} y1={458} x2={392} y2={596} color="blue" text="Read" textPos={{ x: 318, y: 552 }} />
      <PlainArrow x1={348} y1={458} x2={408} y2={596} color="blue" text="Read" textPos={{ x: 398, y: 552 }} />

      <Box x={95} y={596} w={380} h={105} dashed />
      <text x={488} y={650} fontSize={14} fill="var(--text-primary)">
        Data tier
      </text>
      <DbIcon x={130} y={612} label="Master DB" />
      <DbIcon x={372} y={612} label="Slave DB" />
      <PlainArrow x1={190} y1={636} x2={368} y2={636} color="blue" text="Replicate" textPos={{ x: 280, y: 622 }} />
    </Figure>
  );
}
