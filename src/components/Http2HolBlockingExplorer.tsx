"use client";

import { useMemo, useState } from "react";

// One HTTP/2 connection carrying two independent streams:
//   stream 1 : a POST  -> HEADERS frame + DATA frame (request body)
//   stream 5 : a GET   -> HEADERS frame
// TCP has already chunked each frame into 4 segments, so the single
// ordered byte stream is 12 segments with continuous sequence numbers.
type Segment = {
  seq: number;
  stream: 1 | 5;
  frame: "HEADERS" | "DATA";
  part: number;
};

const SEGMENTS: Segment[] = [
  { seq: 1, stream: 1, frame: "HEADERS", part: 1 },
  { seq: 2, stream: 1, frame: "HEADERS", part: 2 },
  { seq: 3, stream: 1, frame: "HEADERS", part: 3 },
  { seq: 4, stream: 1, frame: "HEADERS", part: 4 },
  { seq: 5, stream: 1, frame: "DATA", part: 1 },
  { seq: 6, stream: 1, frame: "DATA", part: 2 },
  { seq: 7, stream: 1, frame: "DATA", part: 3 },
  { seq: 8, stream: 1, frame: "DATA", part: 4 },
  { seq: 9, stream: 5, frame: "HEADERS", part: 1 },
  { seq: 10, stream: 5, frame: "HEADERS", part: 2 },
  { seq: 11, stream: 5, frame: "HEADERS", part: 3 },
  { seq: 12, stream: 5, frame: "HEADERS", part: 4 },
];

type Mode = "tcp" | "quic";

type SegState = "delivered" | "lost" | "buffered";

function segmentState(seg: Segment, droppedSeq: number, mode: Mode): SegState {
  if (seg.seq === droppedSeq) return "lost";
  if (mode === "tcp") {
    // One ordered stream: nothing past the gap is handed to the application.
    return seg.seq < droppedSeq ? "delivered" : "buffered";
  }
  // QUIC: each stream is delivered in its own order. A loss only holds back
  // later data on the SAME stream.
  const dropped = SEGMENTS.find((s) => s.seq === droppedSeq)!;
  if (seg.stream !== dropped.stream) return "delivered";
  return seg.seq < droppedSeq ? "delivered" : "buffered";
}

const STREAM_COLOR: Record<1 | 5, { chip: string; bar: string; text: string }> = {
  1: {
    chip: "bg-sky-500/20 text-sky-200 border-sky-500/40",
    bar: "bg-sky-500/15 border-sky-500/40",
    text: "text-sky-300",
  },
  5: {
    chip: "bg-violet-500/20 text-violet-200 border-violet-500/40",
    bar: "bg-violet-500/15 border-violet-500/40",
    text: "text-violet-300",
  },
};

function frameStatus(
  stream: 1 | 5,
  frame: "HEADERS" | "DATA",
  droppedSeq: number,
  mode: Mode,
): "complete" | "waiting" {
  const parts = SEGMENTS.filter((s) => s.stream === stream && s.frame === frame);
  return parts.every((s) => segmentState(s, droppedSeq, mode) === "delivered")
    ? "complete"
    : "waiting";
}

export default function Http2HolBlockingExplorer() {
  const [mode, setMode] = useState<Mode>("tcp");
  const [droppedSeq, setDroppedSeq] = useState<number>(5);

  const states = useMemo(
    () => SEGMENTS.map((s) => ({ seg: s, state: segmentState(s, droppedSeq, mode) })),
    [droppedSeq, mode],
  );

  const buffered = states.filter((s) => s.state === "buffered").map((s) => s.seg.seq);
  const lostSeg = SEGMENTS.find((s) => s.seq === droppedSeq)!;

  const s1Headers = frameStatus(1, "HEADERS", droppedSeq, mode);
  const s1Data = frameStatus(1, "DATA", droppedSeq, mode);
  const s5Headers = frameStatus(5, "HEADERS", droppedSeq, mode);

  const blockedOtherStream =
    mode === "tcp" &&
    buffered.some((seq) => SEGMENTS.find((s) => s.seq === seq)!.stream !== lostSeg.stream);

  return (
    <div className="my-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 text-sm text-zinc-200">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="font-semibold text-zinc-100">Head-of-line blocking</span>
        <div className="inline-flex overflow-hidden rounded border border-zinc-700">
          {(
            [
              ["tcp", "TCP (HTTP/2)"],
              ["quic", "QUIC (HTTP/3)"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1 transition-colors ${
                mode === m
                  ? "bg-amber-500/30 text-amber-200"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setDroppedSeq(5)}
          className="ml-auto rounded border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-300 hover:bg-zinc-700"
        >
          Reset
        </button>
      </div>

      <p className="mb-4 text-xs text-zinc-500">
        One TCP connection carrying two HTTP/2 streams:{" "}
        <span className="text-sky-300">stream 1</span> is a POST (HEADERS + DATA),{" "}
        <span className="text-violet-300">stream 5</span> is an unrelated GET (HEADERS). TCP has
        split each frame into 4 segments, so the connection is one ordered run of 12 segments.
        Click any segment to drop it in transit.
      </p>

      {/* The wire: one ordered segment stream */}
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
        Segments on the wire (sequence number order)
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {states.map(({ seg, state }) => {
          const c = STREAM_COLOR[seg.stream];
          return (
            <button
              key={seg.seq}
              type="button"
              onClick={() => setDroppedSeq(seg.seq)}
              title={`Segment ${seg.seq}: stream ${seg.stream} ${seg.frame} (part ${seg.part}/4)`}
              className={`relative flex w-[68px] flex-col items-center rounded border px-1 py-1.5 text-center transition-colors ${
                state === "lost"
                  ? "border-rose-500/60 bg-rose-500/10 opacity-60"
                  : `${c.bar} hover:brightness-125`
              }`}
            >
              <span className="font-mono text-[11px] text-zinc-400">seq {seg.seq}</span>
              <span className={`text-[11px] font-medium ${c.text}`}>S{seg.stream}</span>
              <span className="text-[10px] text-zinc-400">
                {seg.frame === "HEADERS" ? "HDR" : "DATA"} {seg.part}/4
              </span>
              {state === "lost" && (
                <span className="absolute -top-2 -right-2 rounded bg-rose-500 px-1 text-[10px] font-bold text-white">
                  lost
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Receiver side */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
          <div className="mb-2 text-xs uppercase tracking-wide text-emerald-400">
            Handed up to HTTP/2
          </div>
          <div className="flex flex-wrap gap-1">
            {states
              .filter((s) => s.state === "delivered")
              .map((s) => (
                <span
                  key={s.seg.seq}
                  className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[11px] text-emerald-200"
                >
                  {s.seg.seq}
                </span>
              ))}
            {states.every((s) => s.state !== "delivered") && (
              <span className="text-xs text-zinc-500">nothing yet</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
          <div className="mb-2 text-xs uppercase tracking-wide text-amber-400">
            Stuck in the receive buffer
          </div>
          <div className="flex flex-wrap gap-1">
            {buffered.map((seq) => {
              const seg = SEGMENTS.find((s) => s.seq === seq)!;
              return (
                <span
                  key={seq}
                  className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${STREAM_COLOR[seg.stream].chip} border`}
                >
                  {seq}
                </span>
              );
            })}
            {buffered.length === 0 && (
              <span className="text-xs text-zinc-500">empty</span>
            )}
          </div>
        </div>
      </div>

      {/* Frame reassembly status */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-xs">
          <thead>
            <tr className="text-zinc-500">
              <th className="px-2 py-1 font-medium">Stream</th>
              <th className="px-2 py-1 font-medium">Frame</th>
              <th className="px-2 py-1 font-medium">Segments</th>
              <th className="px-2 py-1 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            {(
              [
                [1, "HEADERS", "1-4", s1Headers],
                [1, "DATA", "5-8", s1Data],
                [5, "HEADERS", "9-12", s5Headers],
              ] as const
            ).map(([stream, frame, range, status]) => (
              <tr key={`${stream}-${frame}`} className="border-t border-zinc-800">
                <td className={`px-2 py-1 font-medium ${STREAM_COLOR[stream].text}`}>
                  stream {stream}
                </td>
                <td className="px-2 py-1 font-mono">{frame}</td>
                <td className="px-2 py-1 font-mono text-zinc-400">seq {range}</td>
                <td className="px-2 py-1">
                  {status === "complete" ? (
                    <span className="text-emerald-300">reassembled</span>
                  ) : (
                    <span className="text-amber-300">waiting</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verdict */}
      <p className="mt-4 text-xs leading-relaxed text-zinc-400">
        {mode === "tcp" ? (
          <>
            Segment <span className="font-mono text-rose-300">{droppedSeq}</span> (
            <span className={STREAM_COLOR[lostSeg.stream].text}>
              stream {lostSeg.stream} {lostSeg.frame}
            </span>
            ) is lost. TCP guarantees in-order delivery, so it holds every later segment in its
            buffer until segment {droppedSeq} is retransmitted, and hands the application{" "}
            <span className="text-zinc-200">nothing</span> past the gap.{" "}
            {blockedOtherStream ? (
              <>
                Segments {buffered.filter((q) => SEGMENTS.find((s) => s.seq === q)!.stream !== lostSeg.stream).join(", ")} carry{" "}
                <span className="text-violet-300">stream 5</span>, a different request with no loss
                of its own, yet they wait too. That is transport-level head-of-line blocking: one
                lost TCP segment stalls unrelated HTTP/2 streams.
              </>
            ) : (
              <>Try dropping an earlier segment to see it stall stream 5 as well.</>
            )}
          </>
        ) : (
          <>
            Segment <span className="font-mono text-rose-300">{droppedSeq}</span> (
            <span className={STREAM_COLOR[lostSeg.stream].text}>
              stream {lostSeg.stream} {lostSeg.frame}
            </span>
            ) is lost. QUIC tracks delivery per stream, so only later{" "}
            <span className={STREAM_COLOR[lostSeg.stream].text}>stream {lostSeg.stream}</span> data
            waits for the retransmit.{" "}
            <span className="text-violet-300">Stream 5</span> is untouched and its GET completes
            immediately. The head-of-line block is contained to the stream that actually lost data.
          </>
        )}
      </p>
    </div>
  );
}
