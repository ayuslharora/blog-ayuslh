"use client";

import { useState } from "react";

type Field = {
  label: string;
  start: number;
  span: number;
  className?: string;
  labelClassName?: string;
  interactive?: boolean;
};

const BYTE_HEADERS = [
  { label: "1st Byte (0-7)", start: 0, span: 8 },
  { label: "2nd Byte (8-15)", start: 8, span: 8 },
  { label: "3rd Byte (16-23)", start: 16, span: 8 },
  { label: "4th Byte (24-31)", start: 24, span: 8 },
];

const ROWS: Field[][] = [
  [
    { label: "Length (24 bits)", start: 0, span: 24 },
    { label: "Type (8 bits)", start: 24, span: 8 },
  ],
  [
    { label: "Flags (8 bits)", start: 0, span: 8 },
    {
      label: "",
      start: 8,
      span: 24,
      interactive: false,
      className: "bg-zinc-800/60 text-zinc-600 cursor-default",
    },
  ],
  [
    { label: "R", start: 0, span: 1, className: "text-[10px] sm:text-xs" },
    { label: "Stream Identifier (31 bits)", start: 1, span: 31 },
  ],
  [
    {
      label: "Frame Payload (length in bytes given by the Length field above)",
      start: 0,
      span: 32,
      labelClassName: "text-zinc-300 font-normal text-xs sm:text-sm",
    },
  ],
];

export default function Http2FrameHeaderTable() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const toggle = (field: Field) => {
    if (field.interactive === false || field.label === "") return;
    setActiveLabel((prev) => (prev === field.label ? null : field.label));
  };

  const isFieldActive = (field: Field) => activeLabel === field.label;

  return (
    <div className="overflow-x-auto my-8">
      <table className="w-full min-w-[1000px] table-fixed text-center border-collapse rounded-xl overflow-hidden shadow-lg border border-zinc-800 text-xs sm:text-sm select-none">
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
              <th key={bit} className="p-1 border border-zinc-800 bg-zinc-900 text-zinc-400">
                {bit}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-zinc-900/40 font-semibold text-zinc-100">
          {ROWS.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((field, fieldIdx) => (
                <td
                  key={`${rowIdx}-${fieldIdx}`}
                  colSpan={field.span}
                  onClick={() => toggle(field)}
                  className={`border border-zinc-800 transition-colors duration-150 whitespace-nowrap overflow-hidden ${
                    field.interactive === false ? "" : "cursor-pointer hover:bg-amber-500/20"
                  } ${field.span <= 2 ? "px-0.5 py-4 leading-none" : "p-4"} ${
                    isFieldActive(field) ? "bg-amber-500/30 ring-2 ring-inset ring-amber-500" : ""
                  } ${field.className ?? ""} ${field.labelClassName ?? ""}`}
                >
                  {field.label}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-zinc-500 mt-2">
        Click any field to highlight it. Length, Type, and Flags each occupy one byte; the Reserved bit (R) and
        Stream Identifier share the next 4 bytes; the Frame Payload follows, sized by the Length field.
      </p>
    </div>
  );
}
