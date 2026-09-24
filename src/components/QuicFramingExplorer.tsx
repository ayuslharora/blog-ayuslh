"use client";

import { useMemo, useState } from "react";

// Three HTTP/3 requests riding one QUIC connection:
//   stream 2 : POST /signup  -> HEADERS + DATA (fin on the DATA frame)
//   stream 4 : POST /orders  -> HEADERS + DATA (fin on the DATA frame)
//   stream 6 : GET /index.html -> HEADERS only (fin on the HEADERS frame)
// Three QUIC packets carry them:
//   packet 1 : stream2 HEADERS, stream2 DATA (fin), stream4 HEADERS (no fin)
//   packet 2 : stream4 DATA (fin)  <- this is the one we drop
//   packet 3 : stream6 HEADERS (fin)
type StreamId = 2 | 4 | 6;

type QuicFrame = {
  stream: StreamId;
  frame: "HEADERS" | "DATA";
  fin: boolean;
};

type Packet = {
  id: 1 | 2 | 3;
  frames: QuicFrame[];
};

const PACKETS: Packet[] = [
  {
    id: 1,
    frames: [
      { stream: 2, frame: "HEADERS", fin: false },
      { stream: 2, frame: "DATA", fin: true },
      { stream: 4, frame: "HEADERS", fin: false },
    ],
  },
  {
    id: 2,
    frames: [{ stream: 4, frame: "DATA", fin: true }],
  },
  {
    id: 3,
    frames: [{ stream: 6, frame: "HEADERS", fin: true }],
  },
];

const REQUEST_LABEL: Record<StreamId, string> = {
  2: "POST /signup",
  4: "POST /orders",
  6: "GET /index.html",
};

const STREAM_COLOR: Record<StreamId, { chip: string; text: string }> = {
  2: { chip: "bg-sky-500/15 border-sky-500/40", text: "text-sky-300" },
  4: { chip: "bg-violet-500/15 border-violet-500/40", text: "text-violet-300" },
  6: { chip: "bg-amber-500/15 border-amber-500/40", text: "text-amber-300" },
};

export default function QuicFramingExplorer() {
  const [packet2Lost, setPacket2Lost] = useState(true);

  const deliveredPackets = useMemo(
    () => PACKETS.filter((p) => !(p.id === 2 && packet2Lost)),
    [packet2Lost],
  );

  const streamStatus = useMemo(() => {
    const status: Record<StreamId, "complete" | "waiting"> = {
      2: "waiting",
      4: "waiting",
      6: "waiting",
    };
    (Object.keys(REQUEST_LABEL).map(Number) as StreamId[]).forEach((stream) => {
      const finFrame = deliveredPackets
        .flatMap((p) => p.frames)
        .find((f) => f.stream === stream && f.fin);
      status[stream] = finFrame ? "complete" : "waiting";
    });
    return status;
  }, [deliveredPackets]);

  return (
    <div className="my-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 text-sm text-zinc-200">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="font-semibold text-zinc-100">QUIC packet 2 in transit</span>
        <button
          type="button"
          onClick={() => setPacket2Lost((v) => !v)}
          className={`ml-auto rounded border px-3 py-1 transition-colors ${
            packet2Lost
              ? "border-rose-500/60 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
              : "border-emerald-500/60 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
          }`}
        >
          {packet2Lost ? "Packet 2: lost" : "Packet 2: delivered"}
        </button>
      </div>

      <p className="mb-4 text-xs text-zinc-500">
        Three requests, three QUIC packets. <span className="text-sky-300">stream 2</span> (POST
        /signup) and its full body land in packet 1. Packet 1 also carries the{" "}
        <span className="text-violet-300">stream 4</span> (POST /orders) HEADERS frame with{" "}
        <code className="text-zinc-300">fin=0</code>, its body arrives separately in packet 2.
        Packet 3 carries <span className="text-amber-300">stream 6</span> (GET /index.html), which
        depends on neither. Toggle packet 2 to see who is affected.
      </p>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {PACKETS.map((packet) => {
          const lost = packet.id === 2 && packet2Lost;
          return (
            <div
              key={packet.id}
              className={`relative rounded-lg border p-2.5 ${
                lost
                  ? "border-rose-500/50 bg-rose-500/5 opacity-60"
                  : "border-zinc-700 bg-zinc-900/70"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-wide text-zinc-500">
                <span>QUIC packet {packet.id}</span>
                {lost && (
                  <span className="rounded bg-rose-500 px-1 text-[10px] font-bold text-white">
                    lost
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {packet.frames.map((f, i) => (
                  <span
                    key={i}
                    className={`rounded border px-1.5 py-0.5 font-mono text-[11px] ${STREAM_COLOR[f.stream].chip} ${STREAM_COLOR[f.stream].text}`}
                  >
                    stream {f.stream} {f.frame} fin={f.fin ? 1 : 0}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-xs">
          <thead>
            <tr className="text-zinc-500">
              <th className="px-2 py-1 font-medium">Stream</th>
              <th className="px-2 py-1 font-medium">Request</th>
              <th className="px-2 py-1 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(REQUEST_LABEL).map(Number) as StreamId[]).map((stream) => (
              <tr key={stream} className="border-t border-zinc-800">
                <td className={`px-2 py-1 font-medium ${STREAM_COLOR[stream].text}`}>
                  stream {stream}
                </td>
                <td className="px-2 py-1 font-mono text-zinc-300">{REQUEST_LABEL[stream]}</td>
                <td className="px-2 py-1">
                  {streamStatus[stream] === "complete" ? (
                    <span className="text-emerald-300">delivered to application</span>
                  ) : (
                    <span className="text-amber-300">waiting on fin</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-zinc-400">
        {packet2Lost ? (
          <>
            Packet 3 arrives even though it was sent after the now-lost packet 2, and QUIC hands{" "}
            <span className="text-amber-300">stream 6</span> straight to the application: nothing
            about it depends on stream 4. <span className="text-sky-300">Stream 2</span> was
            already complete from packet 1 alone. Only{" "}
            <span className="text-violet-300">stream 4</span> is stuck, because its HEADERS frame
            arrived with <code className="text-zinc-300">fin=0</code>, telling QUIC more data for
            that stream is coming, and the DATA frame that would set{" "}
            <code className="text-zinc-300">fin=1</code> never showed up. Arrival order stopped
            mattering the moment each frame carried its own stream ID.
          </>
        ) : (
          <>
            All three packets arrive, so all three <code className="text-zinc-300">fin</code>{" "}
            flags get set and every request completes. Retransmitting just packet 2, rather than
            replaying the whole connection from the point of loss, is exactly what a stream-aware
            transport buys you over TCP's single ordered byte run.
          </>
        )}
      </p>
    </div>
  );
}
