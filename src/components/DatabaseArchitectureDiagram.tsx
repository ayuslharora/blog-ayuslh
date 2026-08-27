import { Box, LaptopIcon, PhoneIcon, DnsIcon, ServerIcon, DbIcon, PlainArrow, Figure } from "./BookFigure";

export default function DatabaseArchitectureDiagram() {
  return (
    <Figure width={820} height={640}>
      <Box x={30} y={20} w={350} h={210} label="User" />
      <LaptopIcon x={90} y={80} label="Web browser" />
      <PhoneIcon x={240} y={76} label="Mobile app" />

      <DnsIcon cx={740} cy={95} />

      <PlainArrow x1={380} y1={65} x2={696} y2={80} text="www.mysite.com" textPos={{ x: 530, y: 60 }} />
      <PlainArrow x1={696} y1={112} x2={380} y2={125} text="IP address" textPos={{ x: 540, y: 145 }} />

      <PlainArrow x1={113} y1={232} x2={113} y2={430} text="www.mysite.com" textPos={{ x: 70, y: 330 }} />
      <PlainArrow x1={253} y1={232} x2={253} y2={430} text="api.mysite.com" textPos={{ x: 300, y: 330 }} />

      <Box x={60} y={430} w={280} h={160} dashed />
      <ServerIcon x={180} y={460} label="Web server" />

      <Box x={480} y={430} w={280} h={160} dashed />
      <DbIcon x={590} y={460} label="Database" />

      <PlainArrow x1={340} y1={470} x2={480} y2={470} text="read/write/update" textPos={{ x: 410, y: 460 }} />
      <PlainArrow x1={480} y1={540} x2={340} y2={540} text="return data" textPos={{ x: 410, y: 530 }} />
    </Figure>
  );
}
