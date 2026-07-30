"use client";

import { useState } from "react";

type Field = {
  label: string;
  start: number;
  span: number;
  className?: string;
  labelClassName?: string;
};

const BYTE_HEADERS = [
  { label: "1st Byte (0-7)", start: 0, span: 8 },
  { label: "2nd Byte (8-15)", start: 8, span: 8 },
  { label: "3rd Byte (16-23)", start: 16, span: 8 },
  { label: "4th Byte (24-31)", start: 24, span: 8 },
];

const ROWS: Field[][] = [
  [
    { label: "Source Port", start: 0, span: 16 },
    { label: "Destination Port", start: 16, span: 16 },
  ],
  [{ label: "Sequence Number", start: 0, span: 32 }],
  [{ label: "Acknowledgment Number", start: 0, span: 32 }],
  [
    { label: "Data Offset", start: 0, span: 4 },
    { label: "Reserved", start: 4, span: 4 },
    { label: "CWR", start: 8, span: 1, className: "text-[10px] sm:text-xs" },
    { label: "ECE", start: 9, span: 1, className: "text-[10px] sm:text-xs" },
    { label: "URG", start: 10, span: 1, className: "text-[10px] sm:text-xs" },
    { label: "ACK", start: 11, span: 1, className: "text-[10px] sm:text-xs" },
    { label: "PSH", start: 12, span: 1, className: "text-[10px] sm:text-xs" },
    { label: "RST", start: 13, span: 1, className: "text-[10px] sm:text-xs" },
    { label: "SYN", start: 14, span: 1, className: "text-[10px] sm:text-xs" },
    { label: "FIN", start: 15, span: 1, className: "text-[10px] sm:text-xs" },
    { label: "Window Size", start: 16, span: 16 },
  ],
  [
    { label: "Checksum", start: 0, span: 16 },
    { label: "Urgent Pointer", start: 16, span: 16 },
  ],
  [
    {
      label: "Options (Optional, if data offset > 5, padding (0s) is added at the end if required)",
      start: 0,
      span: 32,
      labelClassName: "text-xs sm:text-sm font-normal",
    },
  ],
  [{ label: "Data", start: 0, span: 32, labelClassName: "text-zinc-300 font-normal" }],
];

export default function TcpHeaderTable() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const activeField = ROWS.flat().find((f) => f.label === activeLabel) ?? null;

  const isBitActive = (bit: number) =>
    activeField !== null && bit >= activeField.start && bit < activeField.start + activeField.span;

  const toggle = (field: Field) => {
    setActiveLabel((prev) => (prev === field.label ? null : field.label));
  };

  const isFieldActive = (field: Field) => activeLabel === field.label;

  return (
    <div className="overflow-x-auto my-8">
      <table className="w-full min-w-[1152px] table-fixed text-center border-collapse rounded-xl overflow-hidden shadow-lg border border-zinc-800 text-xs sm:text-sm select-none">
        <colgroup>
          {Array.from({ length: 32 }).map((_, i) => (
            <col key={i} className="w-[3.125%]" />
          ))}
        </colgroup>
        <thead>
          <tr className="text-zinc-200 font-bold">
            {BYTE_HEADERS.map((h) => (
              <th key={h.label} colSpan={h.span} className="p-2 border border-zinc-800 bg-zinc-800">
                {h.label}
              </th>
            ))}
          </tr>
          <tr>
            {Array.from({ length: 32 }).map((_, bit) => (
              <th
                key={bit}
                className={`p-1 border border-zinc-800 transition-colors duration-150 ${
                  isBitActive(bit) ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400"
                }`}
              >
                {bit}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-zinc-900/40 font-semibold text-zinc-100">
          {ROWS.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((field) => (
                <td
                  key={field.label}
                  colSpan={field.span}
                  onClick={() => toggle(field)}
                  className={`border border-zinc-800 cursor-pointer transition-colors duration-150 hover:bg-amber-500/20 whitespace-nowrap overflow-hidden ${
                    field.span <= 2 ? "px-0.5 py-4 leading-none" : "p-4"
                  } ${isFieldActive(field) ? "bg-amber-500/30 ring-2 ring-inset ring-amber-500" : ""} ${field.className ?? ""} ${field.labelClassName ?? ""}`}
                >
                  {field.label}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-zinc-500 mt-2">Click any field to highlight the exact bits it occupies in the header.</p>
    </div>
  );
}
