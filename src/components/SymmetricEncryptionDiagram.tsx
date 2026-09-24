import { EnvelopeIcon, KeyIcon, LaptopIcon, PlainArrow, Figure } from "./BookFigure";

export default function SymmetricEncryptionDiagram() {
  return (
    <Figure width={980} height={300} caption="Both sides hold the same secret key, so whichever side encrypts, the other can decrypt.">
      <LaptopIcon x={30} y={20} label="Client" />
      <LaptopIcon x={904} y={20} label="Server" />

      <EnvelopeIcon x={30} y={150} color="#ef4444" />
      <text x={53} y={200} fontSize={13} fill="#ef4444" textAnchor="middle">Plain text</text>
      <text x={53} y={218} fontSize={13} fill="var(--text-primary)" textAnchor="middle">Rs 10,000</text>

      <PlainArrow x1={76} y1={165} x2={104} y2={165} />
      <KeyIcon cx={120} cy={165} />
      <PlainArrow x1={140} y1={165} x2={168} y2={165} />

      <EnvelopeIcon x={184} y={150} color="#22c55e" />
      <text x={207} y={200} fontSize={13} fill="#22c55e" textAnchor="middle">Encrypted</text>
      <text x={207} y={218} fontSize={13} fill="var(--text-primary)" textAnchor="middle">avd5267</text>

      <PlainArrow x1={230} y1={165} x2={720} y2={165} color="green" />
      <text x={475} y={150} fontSize={13} fill="var(--text-secondary)" textAnchor="middle">Send over network</text>

      <EnvelopeIcon x={720} y={150} color="#22c55e" />
      <text x={743} y={200} fontSize={13} fill="#22c55e" textAnchor="middle">Encrypted</text>
      <text x={743} y={218} fontSize={13} fill="var(--text-primary)" textAnchor="middle">avd5267</text>

      <PlainArrow x1={766} y1={165} x2={794} y2={165} />
      <KeyIcon cx={810} cy={165} />
      <PlainArrow x1={830} y1={165} x2={858} y2={165} />

      <EnvelopeIcon x={874} y={150} color="#ef4444" />
      <text x={897} y={200} fontSize={13} fill="#ef4444" textAnchor="middle">Plain text</text>
      <text x={897} y={218} fontSize={13} fill="var(--text-primary)" textAnchor="middle">Rs 10,000</text>
    </Figure>
  );
}
