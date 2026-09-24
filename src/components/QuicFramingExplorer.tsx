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
  http3Type: "HEADERS Frame" | "DATA Frame";
  offset: number;
  length: number;
  fin: boolean;
  payload: string;
};

type Packet = {
  id: 1 | 2 | 3;
  frames: QuicFrame[];
};

const PACKETS: Packet[] = [
  {
    id: 1,
    frames: [
      { stream: 2, http3Type: "HEADERS Frame", offset: 0, length: 500, fin: false, payload: "QPACK compressed headers" },
      { stream: 2, http3Type: "DATA Frame", offset: 500, length: 450, fin: true, payload: "data" },
      { stream: 4, http3Type: "HEADERS Frame", offset: 0, length: 200, fin: false, payload: "QPACK compressed headers" },
    ],
  },
  {
    id: 2,
    frames: [
      { stream: 4, http3Type: "DATA Frame", offset: 200, length: 800, fin: true, payload: "data" },
    ],
  },
  {
    id: 3,
    frames: [
      { stream: 6, http3Type: "HEADERS Frame", offset: 0, length: 150, fin: true, payload: "QPACK compressed headers" },
    ],
  },
];

const REQUEST_LABEL: Record<StreamId, string> = {
  2: "POST /signup",
  4: "POST /orders",
  6: "GET /index.html",
};

const STREAM_STYLE: Record<
  StreamId,
  { outer: string; outerText: string; nested: string; nestedText: string; label: string; chip: string }
> = {
  2: {
    outer: "border-red-500/50 bg-red-950/60",
    outerText: "text-red-100",
    nested: "border-emerald-500/50 bg-emerald-900/70",
    nestedText: "text-emerald-100",
    label: "text-red-300",
    chip: "bg-red-500/15 border-red-500/40 text-red-300",
  },
  4: {
    outer: "border-violet-500/50 bg-violet-950/60",
    outerText: "text-violet-100",
    nested: "border-amber-600/50 bg-amber-900/60",
    nestedText: "text-amber-100",
    label: "text-violet-300",
    chip: "bg-violet-500/15 border-violet-500/40 text-violet-300",
  },
  6: {
    outer: "border-sky-500/50 bg-sky-950/60",
    outerText: "text-sky-100",
    nested: "border-lime-600/50 bg-lime-900/60",
    nestedText: "text-lime-100",
    label: "text-sky-300",
    chip: "bg-sky-500/15 border-sky-500/40 text-sky-300",
  },
};

function FrameBox({ frame }: { frame: QuicFrame }) {
  const s = STREAM_STYLE[frame.stream];
  return (
    <div className="flex w-[220px] shrink-0 flex-col overflow-hidden rounded-md border border-zinc-700">
      <div className={`border-b ${s.outer} p-2.5`}>
        <div className={`mb-1.5 text-[11px] font-semibold underline underline-offset-2 ${s.outerText}`}>
          QUIC Frame
        </div>
        <ul className={`space-y-0.5 font-mono text-[10.5px] leading-snug ${s.outerText}`}>
          <li>Type: STREAM Frame (more types)</li>
          <li>Stream ID: {frame.stream}</li>
          <li>Offset: {frame.offset}</li>
          <li>Length: {frame.length} (bytes of QUIC frm data)</li>
          <li>Data: HTTP/3 Frame Bytes</li>
          <li>FIN: {frame.fin ? 1 : 0}</li>
        </ul>
      </div>
      <div className={`${s.nested} p-2.5`}>
        <div className={`mb-1.5 text-[11px] font-semibold underline underline-offset-2 ${s.nestedText}`}>
          HTTP/3 Frame
        </div>
        <ul className={`space-y-0.5 font-mono text-[10.5px] leading-snug ${s.nestedText}`}>
          <li>Type: {frame.http3Type}</li>
          <li>Length: ...</li>
          <li>Payload: {frame.payload}</li>
        </ul>
      </div>
    </div>
  );
}

function PacketBox({ packet, lost }: { packet: Packet; lost: boolean }) {
  return (
    <div
      className={`relative rounded-lg border p-3 transition-opacity ${
        lost ? "border-rose-500/50 bg-rose-950/20 opacity-50" : "border-sky-600/50 bg-sky-950/30"
      }`}
    >
      {lost && (
        <span className="absolute -top-2 -right-2 rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          lost
        </span>
      )}
      <div className="mb-3 border-b border-sky-800/60 pb-2">
        <div className="mb-1 text-xs font-semibold text-sky-200 underline underline-offset-2">
          QUIC Packet
        </div>
        <ul className="space-y-0.5 font-mono text-[11px] leading-snug text-sky-100">
          <li>Packet Number: {packet.id}</li>
          <li>Payload: QUIC Frames</li>
          <li className="italic text-sky-300/80">...other packet headers</li>
        </ul>
        <div className="mt-1 text-[10.5px] text-sky-400/80">
          (carries {packet.frames.length} frame{packet.frames.length > 1 ? "s" : ""})
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {packet.frames.map((f, i) => (
          <FrameBox key={i} frame={f} />
        ))}
      </div>
    </div>
  );
}

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
        Three requests, three QUIC packets. <span className="text-red-300">stream 2</span> (POST
        /signup) and its full body land in packet 1. Packet 1 also carries the{" "}
        <span className="text-violet-300">stream 4</span> (POST /orders) HEADERS frame with{" "}
        <code className="text-zinc-300">FIN: 0</code>, its body arrives separately in packet 2.
        Packet 3 carries <span className="text-sky-300">stream 6</span> (GET /index.html), which
        depends on neither. Each QUIC frame is a self-contained wrapper around an HTTP/3 frame,
        tagged with its own stream ID, offset, and FIN flag. Toggle packet 2 to see who is
        affected.
      </p>

      <div className="mb-4 flex flex-col gap-3">
        {PACKETS.map((packet) => (
          <PacketBox key={packet.id} packet={packet} lost={packet.id === 2 && packet2Lost} />
        ))}
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
                <td className={`px-2 py-1 font-medium ${STREAM_STYLE[stream].label}`}>
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
            <span className="text-sky-300">stream 6</span> straight to the application: nothing
            about it depends on stream 4. <span className="text-red-300">Stream 2</span> was
            already complete from packet 1 alone. Only{" "}
            <span className="text-violet-300">stream 4</span> is stuck, because its HEADERS frame
            arrived with <code className="text-zinc-300">FIN: 0</code>, telling QUIC more data for
            that stream is coming, and the DATA frame that would set{" "}
            <code className="text-zinc-300">FIN: 1</code> never showed up. Arrival order stopped
            mattering the moment each frame carried its own stream ID.
          </>
        ) : (
          <>
            All three packets arrive, so all three <code className="text-zinc-300">FIN</code>{" "}
            flags get set and every request completes. Retransmitting just packet 2, rather than
            replaying the whole connection from the point of loss, is exactly what a stream-aware
            transport buys you over TCP's single ordered byte run.
          </>
        )}
      </p>
    </div>
  );
}
