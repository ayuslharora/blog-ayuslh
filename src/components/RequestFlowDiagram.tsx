import { Box, LaptopIcon, PhoneIcon, ServerIcon, DnsIcon, Arrow, Figure } from "./BookFigure";

export default function RequestFlowDiagram() {
  return (
    <Figure width={640} height={460}>
      <Box x={30} y={20} w={270} h={210} label="User" />
      <LaptopIcon x={90} y={70} label="Web browser" />
      <PhoneIcon x={210} y={66} label="Mobile app" />

      <DnsIcon cx={565} cy={65} />

      <Arrow
        x1={300}
        y1={50}
        x2={518}
        y2={50}
        number={1}
        numberPos={{ x: 315, y: 34 }}
        text="api.mysite.com"
        textPos={{ x: 410, y: 38 }}
      />
      <Arrow
        x1={518}
        y1={80}
        x2={300}
        y2={80}
        number={2}
        numberPos={{ x: 315, y: 98 }}
        text="15.125.23.214"
        textPos={{ x: 420, y: 102 }}
      />

      <Box x={30} y={300} w={270} h={130} dashed />
      <ServerIcon x={140} y={325} label="Web server" />

      <Arrow
        x1={90}
        y1={232}
        x2={90}
        y2={298}
        number={3}
        numberPos={{ x: 60, y: 250 }}
        text="15.125.23.214"
        textPos={{ x: 60, y: 278 }}
      />
      <Arrow
        x1={230}
        y1={298}
        x2={230}
        y2={232}
        number={4}
        numberPos={{ x: 260, y: 250 }}
        text="HTML page"
        textPos={{ x: 260, y: 278 }}
      />
    </Figure>
  );
}
