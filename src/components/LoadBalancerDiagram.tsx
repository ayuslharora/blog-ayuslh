import {
  Box,
  LaptopIcon,
  PhoneIcon,
  DnsIcon,
  ServerIcon,
  LoadBalancerIcon,
  LookupTable,
  PlainArrow,
  Figure,
} from "./BookFigure";

export default function LoadBalancerDiagram() {
  return (
    <Figure width={840} height={640}>
      <DnsIcon cx={175} cy={105} />

      <Box x={376} y={25} w={440} h={165} label="User" />
      <LaptopIcon x={440} y={78} label="Web browser" />
      <PhoneIcon x={650} y={72} label="Mobile app" />

      <PlainArrow x1={374} y1={108} x2={220} y2={103} />
      <PlainArrow x1={175} y1={147} x2={175} y2={235} />

      <LookupTable
        x={60}
        y={237}
        w={285}
        rowH={48}
        colSplit={140}
        header={["Domain", "IP Address"]}
        row={["mywebsite.com", "88.88.88.1"]}
      />

      <PlainArrow x1={598} y1={190} x2={598} y2={312} text="Public IP: 88.88.88.1" textPos={{ x: 690, y: 250 }} />

      <LoadBalancerIcon x={573} y={318} label="Load balancer" />

      <PlainArrow x1={588} y1={366} x2={522} y2={466} text="Private IP: 10.0.0.1" textPos={{ x: 470, y: 414 }} />
      <PlainArrow x1={612} y1={366} x2={682} y2={466} text="Private IP: 10.0.0.2" textPos={{ x: 735, y: 414 }} />

      <Box x={448} y={470} w={352} h={142} dashed />
      <ServerIcon x={500} y={500} label="Server1" />
      <ServerIcon x={668} y={500} label="Server2" />
    </Figure>
  );
}
