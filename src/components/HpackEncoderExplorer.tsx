"use client";

import { useMemo, useState } from "react";

// RFC 7541 Appendix A: the 61-entry static table (index is position + 1).
const STATIC_TABLE: readonly (readonly [string, string])[] = [
  [":authority", ""],
  [":method", "GET"],
  [":method", "POST"],
  [":path", "/"],
  [":path", "/index.html"],
  [":scheme", "http"],
  [":scheme", "https"],
  [":status", "200"],
  [":status", "204"],
  [":status", "206"],
  [":status", "304"],
  [":status", "400"],
  [":status", "404"],
  [":status", "500"],
  ["accept-charset", ""],
  ["accept-encoding", "gzip, deflate"],
  ["accept-language", ""],
  ["accept-ranges", ""],
  ["accept", ""],
  ["access-control-allow-origin", ""],
  ["age", ""],
  ["allow", ""],
  ["authorization", ""],
  ["cache-control", ""],
  ["content-disposition", ""],
  ["content-encoding", ""],
  ["content-language", ""],
  ["content-length", ""],
  ["content-location", ""],
  ["content-range", ""],
  ["content-type", ""],
  ["cookie", ""],
  ["date", ""],
  ["etag", ""],
  ["expect", ""],
  ["expires", ""],
  ["from", ""],
  ["host", ""],
  ["if-match", ""],
  ["if-modified-since", ""],
  ["if-none-match", ""],
  ["if-range", ""],
  ["if-unmodified-since", ""],
  ["last-modified", ""],
  ["link", ""],
  ["location", ""],
  ["max-forwards", ""],
  ["proxy-authenticate", ""],
  ["proxy-authorization", ""],
  ["range", ""],
  ["referer", ""],
  ["refresh", ""],
  ["retry-after", ""],
  ["server", ""],
  ["set-cookie", ""],
  ["strict-transport-security", ""],
  ["transfer-encoding", ""],
  ["user-agent", ""],
  ["vary", ""],
  ["via", ""],
  ["www-authenticate", ""],
];

// RFC 7541 Appendix B Huffman code: [code (LSB-aligned integer), bit length]
// indexed by octet value; index 256 is EOS.
const HUFFMAN_CODE: readonly (readonly [number, number])[] = [
  [0x1ff8, 13], [0x7fffd8, 23], [0xfffffe2, 28], [0xfffffe3, 28], [0xfffffe4, 28], [0xfffffe5, 28],
  [0xfffffe6, 28], [0xfffffe7, 28], [0xfffffe8, 28], [0xffffea, 24], [0x3ffffffc, 30], [0xfffffe9, 28],
  [0xfffffea, 28], [0x3ffffffd, 30], [0xfffffeb, 28], [0xfffffec, 28], [0xfffffed, 28], [0xfffffee, 28],
  [0xfffffef, 28], [0xffffff0, 28], [0xffffff1, 28], [0xffffff2, 28], [0x3ffffffe, 30], [0xffffff3, 28],
  [0xffffff4, 28], [0xffffff5, 28], [0xffffff6, 28], [0xffffff7, 28], [0xffffff8, 28], [0xffffff9, 28],
  [0xffffffa, 28], [0xffffffb, 28], [0x14, 6], [0x3f8, 10], [0x3f9, 10], [0xffa, 12],
  [0x1ff9, 13], [0x15, 6], [0xf8, 8], [0x7fa, 11], [0x3fa, 10], [0x3fb, 10],
  [0xf9, 8], [0x7fb, 11], [0xfa, 8], [0x16, 6], [0x17, 6], [0x18, 6],
  [0x0, 5], [0x1, 5], [0x2, 5], [0x19, 6], [0x1a, 6], [0x1b, 6],
  [0x1c, 6], [0x1d, 6], [0x1e, 6], [0x1f, 6], [0x5c, 7], [0xfb, 8],
  [0x7ffc, 15], [0x20, 6], [0xffb, 12], [0x3fc, 10], [0x1ffa, 13], [0x21, 6],
  [0x5d, 7], [0x5e, 7], [0x5f, 7], [0x60, 7], [0x61, 7], [0x62, 7],
  [0x63, 7], [0x64, 7], [0x65, 7], [0x66, 7], [0x67, 7], [0x68, 7],
  [0x69, 7], [0x6a, 7], [0x6b, 7], [0x6c, 7], [0x6d, 7], [0x6e, 7],
  [0x6f, 7], [0x70, 7], [0x71, 7], [0x72, 7], [0xfc, 8], [0x73, 7],
  [0xfd, 8], [0x1ffb, 13], [0x7fff0, 19], [0x1ffc, 13], [0x3ffc, 14], [0x22, 6],
  [0x7ffd, 15], [0x3, 5], [0x23, 6], [0x4, 5], [0x24, 6], [0x5, 5],
  [0x25, 6], [0x26, 6], [0x27, 6], [0x6, 5], [0x74, 7], [0x75, 7],
  [0x28, 6], [0x29, 6], [0x2a, 6], [0x7, 5], [0x2b, 6], [0x76, 7],
  [0x2c, 6], [0x8, 5], [0x9, 5], [0x2d, 6], [0x77, 7], [0x78, 7],
  [0x79, 7], [0x7a, 7], [0x7b, 7], [0x7ffe, 15], [0x7fc, 11], [0x3ffd, 14],
  [0x1ffd, 13], [0xffffffc, 28], [0xfffe6, 20], [0x3fffd2, 22], [0xfffe7, 20], [0xfffe8, 20],
  [0x3fffd3, 22], [0x3fffd4, 22], [0x3fffd5, 22], [0x7fffd9, 23], [0x3fffd6, 22], [0x7fffda, 23],
  [0x7fffdb, 23], [0x7fffdc, 23], [0x7fffdd, 23], [0x7fffde, 23], [0xffffeb, 24], [0x7fffdf, 23],
  [0xffffec, 24], [0xffffed, 24], [0x3fffd7, 22], [0x7fffe0, 23], [0xffffee, 24], [0x7fffe1, 23],
  [0x7fffe2, 23], [0x7fffe3, 23], [0x7fffe4, 23], [0x1fffdc, 21], [0x3fffd8, 22], [0x7fffe5, 23],
  [0x3fffd9, 22], [0x7fffe6, 23], [0x7fffe7, 23], [0xffffef, 24], [0x3fffda, 22], [0x1fffdd, 21],
  [0xfffe9, 20], [0x3fffdb, 22], [0x3fffdc, 22], [0x7fffe8, 23], [0x7fffe9, 23], [0x1fffde, 21],
  [0x7fffea, 23], [0x3fffdd, 22], [0x3fffde, 22], [0xfffff0, 24], [0x1fffdf, 21], [0x3fffdf, 22],
  [0x7fffeb, 23], [0x7fffec, 23], [0x1fffe0, 21], [0x1fffe1, 21], [0x3fffe0, 22], [0x1fffe2, 21],
  [0x7fffed, 23], [0x3fffe1, 22], [0x7fffee, 23], [0x7fffef, 23], [0xfffea, 20], [0x3fffe2, 22],
  [0x3fffe3, 22], [0x3fffe4, 22], [0x7ffff0, 23], [0x3fffe5, 22], [0x3fffe6, 22], [0x7ffff1, 23],
  [0x3ffffe0, 26], [0x3ffffe1, 26], [0xfffeb, 20], [0x7fff1, 19], [0x3fffe7, 22], [0x7ffff2, 23],
  [0x3fffe8, 22], [0x1ffffec, 25], [0x3ffffe2, 26], [0x3ffffe3, 26], [0x3ffffe4, 26], [0x7ffffde, 27],
  [0x7ffffdf, 27], [0x3ffffe5, 26], [0xfffff1, 24], [0x1ffffed, 25], [0x7fff2, 19], [0x1fffe3, 21],
  [0x3ffffe6, 26], [0x7ffffe0, 27], [0x7ffffe1, 27], [0x3ffffe7, 26], [0x7ffffe2, 27], [0xfffff2, 24],
  [0x1fffe4, 21], [0x1fffe5, 21], [0x3ffffe8, 26], [0x3ffffe9, 26], [0xffffffd, 28], [0x7ffffe3, 27],
  [0x7ffffe4, 27], [0x7ffffe5, 27], [0xfffec, 20], [0xfffff3, 24], [0xfffed, 20], [0x1fffe6, 21],
  [0x3fffe9, 22], [0x1fffe7, 21], [0x1fffe8, 21], [0x7ffff3, 23], [0x3fffea, 22], [0x3fffeb, 22],
  [0x1ffffee, 25], [0x1ffffef, 25], [0xfffff4, 24], [0xfffff5, 24], [0x3ffffea, 26], [0x7ffff4, 23],
  [0x3ffffeb, 26], [0x7ffffe6, 27], [0x3ffffec, 26], [0x3ffffed, 26], [0x7ffffe7, 27], [0x7ffffe8, 27],
  [0x7ffffe9, 27], [0x7ffffea, 27], [0x7ffffeb, 27], [0xffffffe, 28], [0x7ffffec, 27], [0x7ffffed, 27],
  [0x7ffffee, 27], [0x7ffffef, 27], [0x7fffff0, 27], [0x3ffffee, 26], [0x3fffffff, 30],
];

type Indexing = "incremental" | "without" | "never";

type HeaderInput = { id: number; name: string; value: string; indexing: Indexing };

type StringEncoding = {
  huffmanBytes: number;
  rawBytes: number;
  usedHuffman: boolean;
};

type FieldResult = {
  name: string;
  value: string;
  representation: string;
  section: string;
  pattern: string;
  detail: string;
  bytes: number[];
  fullIndex: number | null;
  nameIndex: number | null;
  addedToDynamic: boolean;
  nameEncoding: StringEncoding | null;
  valueEncoding: StringEncoding | null;
};

type DynEntry = { name: string; value: string; size: number };

const DYNAMIC_TABLE_LIMIT = 4096; // default SETTINGS_HEADER_TABLE_SIZE

// RFC 7541 section 5.1: integer with an N-bit prefix.
function encodeInteger(value: number, n: number): number[] {
  const max = (1 << n) - 1;
  if (value < max) return [value];
  const out = [max];
  let i = value - max;
  while (i >= 128) {
    out.push((i % 128) + 128);
    i = Math.floor(i / 128);
  }
  out.push(i);
  return out;
}

function rawBytes(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i) & 0xff);
  return out;
}

// RFC 7541 section 5.2 + Appendix B: Huffman-encode, padding the final byte
// with the leading bits of the EOS symbol (all 1s).
function huffmanBytes(s: string): number[] {
  const out: number[] = [];
  let acc = 0;
  let bits = 0;
  const pushBit = (bit: number) => {
    acc = ((acc << 1) | bit) & 0xff;
    bits += 1;
    if (bits === 8) {
      out.push(acc);
      acc = 0;
      bits = 0;
    }
  };
  for (let i = 0; i < s.length; i++) {
    const [code, len] = HUFFMAN_CODE[s.charCodeAt(i) & 0xff];
    for (let b = len - 1; b >= 0; b--) pushBit(Math.floor(code / 2 ** b) % 2);
  }
  while (bits > 0) pushBit(1);
  return out;
}

function encodeStringLiteral(s: string, forceHuffman: boolean): { bytes: number[]; enc: StringEncoding } {
  const raw = rawBytes(s);
  const huff = huffmanBytes(s);
  const data = forceHuffman ? huff : raw;
  const prefix = encodeInteger(data.length, 7);
  if (forceHuffman) prefix[0] |= 0x80;
  return {
    bytes: [...prefix, ...data],
    enc: { huffmanBytes: huff.length, rawBytes: raw.length, usedHuffman: forceHuffman },
  };
}

function findFullIndex(name: string, value: string, dyn: DynEntry[]): number | null {
  for (let i = 0; i < STATIC_TABLE.length; i++) {
    if (STATIC_TABLE[i][0] === name && STATIC_TABLE[i][1] === value) return i + 1;
  }
  for (let p = 0; p < dyn.length; p++) {
    if (dyn[p].name === name && dyn[p].value === value) return 62 + p;
  }
  return null;
}

function findNameIndex(name: string, dyn: DynEntry[]): number | null {
  for (let i = 0; i < STATIC_TABLE.length; i++) {
    if (STATIC_TABLE[i][0] === name) return i + 1;
  }
  for (let p = 0; p < dyn.length; p++) {
    if (dyn[p].name === name) return 62 + p;
  }
  return null;
}

function evict(dyn: DynEntry[]): void {
  let total = dyn.reduce((sum, e) => sum + e.size, 0);
  while (total > DYNAMIC_TABLE_LIMIT && dyn.length > 0) {
    total -= dyn[dyn.length - 1].size;
    dyn.pop();
  }
}

function encodeHeader(h: HeaderInput, dyn: DynEntry[], forceHuffman: boolean): FieldResult {
  const full = findFullIndex(h.name, h.value, dyn);
  if (full !== null) {
    const bytes = encodeInteger(full, 7);
    bytes[0] |= 0x80;
    return {
      name: h.name,
      value: h.value,
      representation: "Indexed Header Field",
      section: "RFC 7541 section 6.1",
      pattern: "1_______",
      detail:
        full <= 61
          ? `Name and value both matched static table entry ${full}. The whole header collapses to one index.`
          : `Name and value both matched dynamic table entry ${full} from an earlier request. One index, no string data.`,
      bytes,
      fullIndex: full,
      nameIndex: null,
      addedToDynamic: false,
      nameEncoding: null,
      valueEncoding: null,
    };
  }

  const nameIdx = findNameIndex(h.name, dyn);
  let mask: number;
  let prefixN: number;
  let addToDynamic: boolean;
  let representation: string;
  let section: string;
  let pattern: string;
  if (h.indexing === "incremental") {
    mask = 0x40;
    prefixN = 6;
    addToDynamic = true;
    representation = "Literal Header Field with Incremental Indexing";
    section = "RFC 7541 section 6.2.1";
    pattern = "01______";
  } else if (h.indexing === "without") {
    mask = 0x00;
    prefixN = 4;
    addToDynamic = false;
    representation = "Literal Header Field without Indexing";
    section = "RFC 7541 section 6.2.2";
    pattern = "0000____";
  } else {
    mask = 0x10;
    prefixN = 4;
    addToDynamic = false;
    representation = "Literal Header Field Never Indexed";
    section = "RFC 7541 section 6.2.3";
    pattern = "0001____";
  }

  const bytes: number[] = [];
  let nameEncoding: StringEncoding | null = null;
  if (nameIdx !== null) {
    const ib = encodeInteger(nameIdx, prefixN);
    ib[0] |= mask;
    bytes.push(...ib);
  } else {
    bytes.push(mask); // first byte: pattern + index 0 (new name follows)
    const ne = encodeStringLiteral(h.name, forceHuffman);
    nameEncoding = ne.enc;
    bytes.push(...ne.bytes);
  }
  const ve = encodeStringLiteral(h.value, forceHuffman);
  bytes.push(...ve.bytes);

  if (addToDynamic) {
    dyn.unshift({ name: h.name, value: h.value, size: h.name.length + h.value.length + 32 });
    evict(dyn);
  }

  let detail: string;
  if (nameIdx !== null && addToDynamic) {
    detail = `Name matched index ${nameIdx}; the value is a string literal. This pair is inserted at dynamic index 62, pushing older entries down.`;
  } else if (nameIdx !== null) {
    detail = `Name matched index ${nameIdx}; the value is a string literal. Not added to the dynamic table.`;
  } else if (addToDynamic) {
    detail = `Neither name nor value is in a table. Both are string literals, and the pair is inserted at dynamic index 62.`;
  } else {
    detail = `Neither name nor value is in a table. Both are string literals, and nothing is added to the dynamic table.`;
  }

  return {
    name: h.name,
    value: h.value,
    representation,
    section,
    pattern,
    detail,
    bytes,
    fullIndex: null,
    nameIndex: nameIdx,
    addedToDynamic: addToDynamic,
    nameEncoding,
    valueEncoding: ve.enc,
  };
}

type PassResult = { fields: FieldResult[]; dynamicAfter: DynEntry[] };

function simulate(headers: HeaderInput[], forceHuffman: boolean): [PassResult, PassResult] {
  const dyn: DynEntry[] = [];
  const first = headers.map((h) => encodeHeader(h, dyn, forceHuffman));
  const dynamicAfterFirst = dyn.map((e) => ({ ...e }));
  const second = headers.map((h) => encodeHeader(h, dyn, forceHuffman));
  const dynamicAfterSecond = dyn.map((e) => ({ ...e }));
  return [
    { fields: first, dynamicAfter: dynamicAfterFirst },
    { fields: second, dynamicAfter: dynamicAfterSecond },
  ];
}

function totalBytes(fields: FieldResult[]): number {
  return fields.reduce((sum, f) => sum + f.bytes.length, 0);
}

// Rough HTTP/1.1 wire size of the same headers: "name: value\r\n" per line.
function http1Bytes(headers: HeaderInput[]): number {
  return headers.reduce((sum, h) => sum + h.name.length + 2 + h.value.length + 2, 0);
}

function hex(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

const DEFAULT_HEADERS: HeaderInput[] = [
  { id: 1, name: ":method", value: "GET", indexing: "incremental" },
  { id: 2, name: ":path", value: "/index.html", indexing: "incremental" },
  { id: 3, name: ":authority", value: "ssw.in", indexing: "incremental" },
  { id: 4, name: "x-server", value: "express", indexing: "incremental" },
];

const INDEXING_LABELS: Record<Indexing, string> = {
  incremental: "Incremental indexing (add to dynamic table)",
  without: "Without indexing (do not add)",
  never: "Never indexed (sensitive)",
};

const inputClass =
  "bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500/60";

export default function HpackEncoderExplorer() {
  const [headers, setHeaders] = useState<HeaderInput[]>(DEFAULT_HEADERS);
  const [nextId, setNextId] = useState(5);
  const [huffman, setHuffman] = useState(true);
  const [pass, setPass] = useState<1 | 2>(1);

  const cleanHeaders = useMemo(
    () => headers.filter((h) => h.name.trim().length > 0),
    [headers],
  );

  const [simHuffFirst, simHuffSecond] = useMemo(
    () => simulate(cleanHeaders, true),
    [cleanHeaders],
  );
  const [simRawFirst, simRawSecond] = useMemo(
    () => simulate(cleanHeaders, false),
    [cleanHeaders],
  );

  const activeFirst = huffman ? simHuffFirst : simRawFirst;
  const activeSecond = huffman ? simHuffSecond : simRawSecond;
  const shown = pass === 1 ? activeFirst : activeSecond;

  const baseline = http1Bytes(cleanHeaders);
  const rawFirst = totalBytes(simRawFirst.fields);
  const rawSecond = totalBytes(simRawSecond.fields);
  const huffFirst = totalBytes(simHuffFirst.fields);
  const huffSecond = totalBytes(simHuffSecond.fields);
  const shownTotal = totalBytes(shown.fields);

  const updateHeader = (id: number, patch: Partial<HeaderInput>) => {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };
  const removeHeader = (id: number) => {
    setHeaders((prev) => prev.filter((h) => h.id !== id));
  };
  const addHeader = () => {
    setHeaders((prev) => [
      ...prev,
      { id: nextId, name: "", value: "", indexing: "incremental" },
    ]);
    setNextId((n) => n + 1);
  };
  const reset = () => {
    setHeaders(DEFAULT_HEADERS);
    setNextId(5);
  };

  const pct = (n: number) =>
    baseline > 0 ? `${Math.round((1 - n / baseline) * 100)}%` : "0%";

  return (
    <div className="my-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 text-sm text-zinc-200">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="font-semibold text-zinc-100">HPACK encoder</span>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={huffman}
            onChange={(e) => setHuffman(e.target.checked)}
            className="accent-amber-500"
          />
          Huffman-encode string literals
        </label>
        <div className="inline-flex overflow-hidden rounded border border-zinc-700">
          {([1, 2] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPass(p)}
              className={`px-3 py-1 transition-colors ${
                pass === p
                  ? "bg-amber-500/30 text-amber-200"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Request {p}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={reset}
          className="ml-auto rounded border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-300 hover:bg-zinc-700"
        >
          Reset example
        </button>
      </div>

      <p className="mb-3 text-xs text-zinc-500">
        Request 2 sends the same headers again, reusing the dynamic table that Request 1 built.
        Both sides keep this table in sync, so entries added on Request 1 become single-index
        references on Request 2.
      </p>

      {/* Header editor */}
      <div className="mb-5 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-2 py-1 font-medium">Name</th>
              <th className="px-2 py-1 font-medium">Value</th>
              <th className="px-2 py-1 font-medium">Indexing</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {headers.map((h) => (
              <tr key={h.id} className="align-top">
                <td className="px-2 py-1 w-[26%]">
                  <input
                    className={`${inputClass} font-mono`}
                    value={h.name}
                    onChange={(e) => updateHeader(h.id, { name: e.target.value })}
                    placeholder=":method"
                    spellCheck={false}
                  />
                </td>
                <td className="px-2 py-1 w-[30%]">
                  <input
                    className={`${inputClass} font-mono`}
                    value={h.value}
                    onChange={(e) => updateHeader(h.id, { value: e.target.value })}
                    placeholder="GET"
                    spellCheck={false}
                  />
                </td>
                <td className="px-2 py-1 w-[34%]">
                  <select
                    className={inputClass}
                    value={h.indexing}
                    onChange={(e) =>
                      updateHeader(h.id, { indexing: e.target.value as Indexing })
                    }
                  >
                    {(Object.keys(INDEXING_LABELS) as Indexing[]).map((key) => (
                      <option key={key} value={key}>
                        {INDEXING_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeHeader(h.id)}
                    className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    aria-label="Remove header"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={addHeader}
          className="mt-2 rounded border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
        >
          + Add header
        </button>
      </div>

      {/* Per-field breakdown */}
      <div className="space-y-3">
        {shown.fields.map((f, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3"
          >
            <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-mono text-zinc-100">
                {f.name}: <span className="text-zinc-400">{f.value || " "}</span>
              </span>
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-200">
                {f.representation}
              </span>
              <span className="text-xs text-zinc-500">{f.section}</span>
            </div>
            <p className="mb-2 text-xs text-zinc-400">{f.detail}</p>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-400">
              <span>
                First-byte pattern{" "}
                <code className="text-zinc-200">{f.pattern}</code>
              </span>
              {f.fullIndex !== null && (
                <span>
                  Table index <code className="text-zinc-200">{f.fullIndex}</code>
                </span>
              )}
              {f.nameIndex !== null && (
                <span>
                  Name index <code className="text-zinc-200">{f.nameIndex}</code>
                </span>
              )}
              {f.nameEncoding && (
                <span>
                  Name: Huffman{" "}
                  <code className="text-zinc-200">{f.nameEncoding.huffmanBytes} B</code> vs raw{" "}
                  <code className="text-zinc-200">{f.nameEncoding.rawBytes} B</code>
                </span>
              )}
              {f.valueEncoding && (
                <span>
                  Value: Huffman{" "}
                  <code
                    className={
                      f.valueEncoding.huffmanBytes < f.valueEncoding.rawBytes
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }
                  >
                    {f.valueEncoding.huffmanBytes} B
                  </code>{" "}
                  vs raw <code className="text-zinc-200">{f.valueEncoding.rawBytes} B</code>
                </span>
              )}
            </div>

            <div className="mt-2 font-mono text-xs text-amber-200/90 break-all">
              {hex(f.bytes)}
              <span className="ml-2 text-zinc-500">({f.bytes.length} B)</span>
            </div>
          </div>
        ))}
        {shown.fields.length === 0 && (
          <p className="text-xs text-zinc-500">Add at least one header with a name.</p>
        )}
      </div>

      {/* Dynamic table */}
      <div className="mt-5">
        <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500">
          Dynamic table after Request {pass}
        </div>
        {shown.dynamicAfter.length === 0 ? (
          <p className="text-xs text-zinc-500">Empty.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-xs">
              <thead>
                <tr className="text-zinc-500">
                  <th className="px-2 py-1 font-medium">Index</th>
                  <th className="px-2 py-1 font-medium">Name</th>
                  <th className="px-2 py-1 font-medium">Value</th>
                  <th className="px-2 py-1 font-medium">Size</th>
                </tr>
              </thead>
              <tbody className="font-mono text-zinc-200">
                {shown.dynamicAfter.map((e, p) => (
                  <tr key={p} className="border-t border-zinc-800">
                    <td className="px-2 py-1">{62 + p}</td>
                    <td className="px-2 py-1">{e.name}</td>
                    <td className="px-2 py-1 text-zinc-400">{e.value || " "}</td>
                    <td className="px-2 py-1 text-zinc-500">{e.size} B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-1 text-xs text-zinc-500">
          {shown.dynamicAfter.reduce((s, e) => s + e.size, 0)} B used of {DYNAMIC_TABLE_LIMIT} B
          (entry size = name length + value length + 32).
        </p>
      </div>

      {/* Totals */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse text-left text-xs">
          <thead>
            <tr className="text-zinc-500">
              <th className="px-2 py-1 font-medium">Encoding</th>
              <th className="px-2 py-1 font-medium">Request 1</th>
              <th className="px-2 py-1 font-medium">Request 2</th>
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            <tr className="border-t border-zinc-800">
              <td className="px-2 py-1">HTTP/1.1 header lines</td>
              <td className="px-2 py-1">{baseline} B</td>
              <td className="px-2 py-1">{baseline} B</td>
            </tr>
            <tr className="border-t border-zinc-800">
              <td className="px-2 py-1">HPACK, raw literals</td>
              <td className="px-2 py-1">
                {rawFirst} B <span className="text-zinc-500">({pct(rawFirst)} off)</span>
              </td>
              <td className="px-2 py-1">
                {rawSecond} B <span className="text-zinc-500">({pct(rawSecond)} off)</span>
              </td>
            </tr>
            <tr className="border-t border-zinc-800">
              <td className="px-2 py-1">HPACK, Huffman literals</td>
              <td className="px-2 py-1">
                {huffFirst} B <span className="text-zinc-500">({pct(huffFirst)} off)</span>
              </td>
              <td className="px-2 py-1">
                {huffSecond} B <span className="text-zinc-500">({pct(huffSecond)} off)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Showing Request {pass}, {huffman ? "Huffman" : "raw"} literals:{" "}
        <span className="text-zinc-300">{shownTotal} B</span> total. Huffman is applied only when
        the toggle is on; a value in red is one where Huffman would cost more than the raw bytes.
      </p>
    </div>
  );
}
