import type { CSSProperties } from "react";

type Segment = {
  label: string;
  bytes?: string;
  grow: number;
  className: string;
  dashed?: boolean;
};

const SEGMENTS: Segment[] = [
  { label: "Ethernet Frame", bytes: "14 bytes", grow: 14, className: "bg-zinc-900/40 text-zinc-500", dashed: true },
  { label: "IP Headers", bytes: "20 bytes", grow: 20, className: "bg-red-950/60 border-red-800 text-red-200" },
  { label: "TCP Headers", bytes: "20 bytes", grow: 20, className: "bg-green-950/60 border-green-800 text-green-200" },
  { label: "Data/Payload", grow: 62, className: "bg-zinc-700/40 border-zinc-600 text-zinc-100" },
];

const MTU_GROW = SEGMENTS.slice(1).reduce((sum, s) => sum + s.grow, 0);
const ETH_GROW = SEGMENTS[0].grow;
const MSS_GROW = SEGMENTS[3].grow;

// flex-basis fixed to 0% so widths are strictly proportional to `grow`,
// independent of each cell's text content, keeping every row's column
// boundaries pixel-aligned with the bar below it.
const cellFlex = (grow: number): CSSProperties => ({ flex: `${grow} 0 0%` });

function Tick({ side }: { side: "left" | "right" }) {
  return (
    <span
      className={`absolute top-0 bottom-0 w-px bg-amber-500 ${side === "left" ? "left-0" : "right-0"}`}
    />
  );
}

export default function MtuMssDiagram() {
  return (
    <div className="my-8 select-none">
      <div className="overflow-x-auto">
        <div className="min-w-[700px] mx-auto px-2">
          {/* MTU bracket */}
          <div className="flex">
            <div style={cellFlex(ETH_GROW)} className="min-w-0" />
            <div style={cellFlex(MTU_GROW)} className="relative min-w-0 pb-2 text-center">
              <span className="relative z-10 inline-block bg-[var(--background)] px-2 text-xs sm:text-sm font-bold leading-tight text-amber-500 tracking-wide">
                MTU (Maximum Transmission Unit)
              </span>
              <span className="absolute left-0 right-0 top-1/2 h-px bg-amber-500" />
              <Tick side="left" />
              <Tick side="right" />
            </div>
          </div>

          {/* Bar */}
          <div className="flex rounded-lg overflow-hidden shadow-lg text-center text-xs sm:text-sm font-bold">
            {SEGMENTS.map((seg) => (
              <div
                key={seg.label}
                style={cellFlex(seg.grow)}
                className={`min-w-0 py-5 px-2 border ${seg.dashed ? "border-dashed" : ""} ${seg.className}`}
              >
                {seg.label}
              </div>
            ))}
          </div>

          {/* byte counts + MSS bracket, same row */}
          <div className="flex mt-2 text-[10px] sm:text-xs text-zinc-500">
            <div style={cellFlex(ETH_GROW)} className="min-w-0 text-center">
              {SEGMENTS[0].bytes}
            </div>
            <div style={cellFlex(SEGMENTS[1].grow)} className="min-w-0 text-center">
              {SEGMENTS[1].bytes}
            </div>
            <div style={cellFlex(SEGMENTS[2].grow)} className="min-w-0 text-center">
              {SEGMENTS[2].bytes}
            </div>
            <div style={cellFlex(MSS_GROW)} className="relative min-w-0 pt-2 text-center">
              <span className="absolute left-0 right-0 top-0 h-px bg-amber-500" />
              <Tick side="left" />
              <Tick side="right" />
              <span className="relative z-10 inline-block bg-[var(--background)] px-2 text-xs sm:text-sm font-bold leading-tight text-amber-500 tracking-wide">
                MSS (Maximum Segment Size)
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mt-3 text-center">
        MTU covers everything except the Ethernet frame; MSS covers only the TCP payload.
      </p>
    </div>
  );
}
