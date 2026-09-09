"use client";

import { useMemo, useState } from "react";

// Compares the cost, in network round trips, of getting the first encrypted
// HTTP request onto the wire:
//   tcptls : TCP 3-way handshake (1 RTT) + TLS 1.3 handshake (1 RTT) = 2 RTT
//   quic1  : QUIC folds transport params and the TLS handshake together = 1 RTT
//   quic0  : with a session ticket from a previous connection, the request
//            rides in the very first packet = 0 RTT
type Mode = "tcptls" | "quic1" | "quic0";

type Flight = {
  dir: "c2s" | "s2c";
  label: string;
  note?: string;
  carriesRequest?: boolean;
  carriesResponse?: boolean;
};

type Plan = {
  label: string;
  blurb: string;
  rttBeforeRequest: number;
  flights: Flight[];
  caveat?: string;
};

const PLANS: Record<Mode, Plan> = {
  tcptls: {
    label: "TCP + TLS 1.3",
    blurb:
      "Two separate handshakes stacked on top of each other. TCP has no idea TLS exists, so TLS cannot start until the TCP connection is already open.",
    rttBeforeRequest: 2,
    flights: [
      { dir: "c2s", label: "SYN", note: "open the TCP connection" },
      { dir: "s2c", label: "SYN-ACK" },
      { dir: "c2s", label: "ACK", note: "TCP connection established (1 RTT spent)" },
      { dir: "c2s", label: "TLS ClientHello", note: "now start the TLS handshake" },
      {
        dir: "s2c",
        label: "ServerHello, Certificate, Finished",
      },
      {
        dir: "c2s",
        label: "TLS Finished + HTTP GET",
        note: "TLS ready after a 2nd RTT; first encrypted request goes now",
        carriesRequest: true,
      },
      { dir: "s2c", label: "HTTP response", carriesResponse: true },
    ],
  },
  quic1: {
    label: "QUIC (1-RTT)",
    blurb:
      "QUIC carries its transport parameters and the TLS handshake in the same flight, because TLS is built into the protocol. One handshake, not two.",
    rttBeforeRequest: 1,
    flights: [
      {
        dir: "c2s",
        label: "Initial: transport params + TLS ClientHello",
        note: "connection setup and key exchange in one flight",
      },
      {
        dir: "s2c",
        label: "Initial: TLS ServerHello + Handshake (Certificate, Finished)",
      },
      {
        dir: "c2s",
        label: "Handshake Finished + HTTP GET",
        note: "handshake done after 1 RTT; first encrypted request goes now",
        carriesRequest: true,
      },
      { dir: "s2c", label: "HTTP response", carriesResponse: true },
    ],
  },
  quic0: {
    label: "QUIC (0-RTT)",
    blurb:
      "The client already holds a session ticket from an earlier QUIC connection to this server, so it can encrypt and send the request in its first packet.",
    rttBeforeRequest: 0,
    flights: [
      {
        dir: "c2s",
        label: "Initial + 0-RTT: ClientHello + session ticket + HTTP GET",
        note: "application data in the very first packet",
        carriesRequest: true,
      },
      {
        dir: "s2c",
        label: "Initial + Handshake + HTTP response",
        carriesResponse: true,
      },
    ],
    caveat:
      "Only for safe, idempotent methods (GET, HEAD, OPTIONS). A 0-RTT packet can be replayed by an attacker, so POST and DELETE are not allowed. Needs a prior 1-RTT handshake with this server first.",
  },
};

const ORDER: Mode[] = ["tcptls", "quic1", "quic0"];

export default function QuicHandshakeExplorer() {
  const [mode, setMode] = useState<Mode>("tcptls");
  const plan = PLANS[mode];

  const saved = useMemo(
    () => PLANS.tcptls.rttBeforeRequest - plan.rttBeforeRequest,
    [plan.rttBeforeRequest],
  );

  return (
    <div className="my-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 text-sm text-zinc-200">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="font-semibold text-zinc-100">Round trips to the first HTTP request</span>
        <div className="inline-flex overflow-hidden rounded border border-zinc-700">
          {ORDER.map((m) => (
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
              {PLANS[m].label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-zinc-500">{plan.blurb}</p>

      {/* Timeline */}
      <div className="space-y-1.5">
        {plan.flights.map((f, i) => {
          const highlight = f.carriesRequest || f.carriesResponse;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded border px-3 py-2 ${
                f.carriesRequest
                  ? "border-amber-500/50 bg-amber-500/10"
                  : f.carriesResponse
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-zinc-800 bg-zinc-900/70"
              }`}
            >
              <span
                className={`mt-0.5 font-mono text-xs ${
                  f.dir === "c2s" ? "text-sky-300" : "text-violet-300"
                }`}
                title={f.dir === "c2s" ? "client to server" : "server to client"}
              >
                {f.dir === "c2s" ? "client → server" : "server → client"}
              </span>
              <span className="flex-1">
                <span
                  className={`font-medium ${highlight ? "text-zinc-100" : "text-zinc-300"}`}
                >
                  {f.label}
                </span>
                {f.note && (
                  <span className="mt-0.5 block text-[11px] text-zinc-500">{f.note}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Verdict */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-2xl font-black text-amber-300">
          {plan.rttBeforeRequest} RTT
        </span>
        <span className="text-xs text-zinc-400">
          of waiting before the first encrypted HTTP request leaves the client
          {saved > 0 && (
            <>
              {" "}
              &middot;{" "}
              <span className="text-emerald-300">
                {saved} round trip{saved > 1 ? "s" : ""} saved vs TCP + TLS
              </span>
            </>
          )}
        </span>
      </div>

      {plan.caveat && (
        <p className="mt-3 rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-[11px] leading-relaxed text-zinc-400">
          <span className="font-semibold text-zinc-300">Catch:</span> {plan.caveat}
        </p>
      )}
    </div>
  );
}
