import { EnvelopeIcon, KeyIcon, LaptopIcon, PlainArrow, Figure } from "./BookFigure";

export default function AsymmetricEncryptionDiagram() {
  return (
    <Figure
      width={1000}
      height={400}
      caption="The client encrypts with the server's public key; only the server's private key can decrypt it, no one else."
    >
      <KeyIcon cx={830} cy={20} color="#22c55e" />
      <text x={854} y={24} fontSize={12.5} fill="#22c55e">Server Public Key</text>

      <KeyIcon cx={830} cy={62} color="#f59e0b" />
      <text x={854} y={66} fontSize={12.5} fill="#f59e0b">Server Private Key</text>

      <LaptopIcon x={30} y={100} label="Client" />
      <LaptopIcon x={884} y={100} label="Server" />

      <text x={190} y={185} fontSize={12.5} fill="var(--text-secondary)" textAnchor="middle">Anyone can have this</text>
      <line x1={175} y1={192} x2={122} y2={234} stroke="var(--text-secondary)" strokeWidth={1.2} />

      <EnvelopeIcon x={20} y={230} color="#ef4444" />
      <text x={43} y={280} fontSize={13} fill="#ef4444" textAnchor="middle">Plain text</text>
      <text x={43} y={298} fontSize={13} fill="var(--text-primary)" textAnchor="middle">Rs 10,000</text>

      <PlainArrow x1={66} y1={245} x2={94} y2={245} />
      <KeyIcon cx={110} cy={245} color="#22c55e" />
      <PlainArrow x1={130} y1={245} x2={158} y2={245} />

      <EnvelopeIcon x={174} y={230} color="#22c55e" />
      <text x={197} y={280} fontSize={13} fill="#22c55e" textAnchor="middle">Encrypted</text>
      <text x={197} y={298} fontSize={13} fill="var(--text-primary)" textAnchor="middle">73viuw</text>

      <PlainArrow x1={220} y1={245} x2={740} y2={245} color="green" />
      <text x={480} y={230} fontSize={13} fill="var(--text-secondary)" textAnchor="middle">Send over network</text>

      <EnvelopeIcon x={740} y={230} color="#22c55e" />
      <text x={763} y={280} fontSize={13} fill="#22c55e" textAnchor="middle">Encrypted</text>
      <text x={763} y={298} fontSize={13} fill="var(--text-primary)" textAnchor="middle">73viuw</text>

      <PlainArrow x1={786} y1={245} x2={814} y2={245} />
      <KeyIcon cx={830} cy={245} color="#f59e0b" />
      <PlainArrow x1={850} y1={245} x2={878} y2={245} />

      <EnvelopeIcon x={894} y={230} color="#ef4444" />
      <text x={917} y={280} fontSize={13} fill="#ef4444" textAnchor="middle">Plain text</text>
      <text x={917} y={298} fontSize={13} fill="var(--text-primary)" textAnchor="middle">Rs 10,000</text>
    </Figure>
  );
}
