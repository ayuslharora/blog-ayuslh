'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dbscan, type Point } from '../lib/dbscan';

const SIZE = 480;

const CLUSTER_COLORS = ['#e03131', '#1864ab', '#2f9e44', '#f08c00', '#ae3ec9', '#0c8599', '#e8590c'];
const NOISE_COLOR = '#868e96';
const CORE_RADIUS = 5.5;
const BORDER_RADIUS = 4.5;
const NOISE_RADIUS = 3.5;

type PresetName = 'smiley' | 'moons' | 'blobs' | 'rings' | 'clear';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function makeSmiley(): Point[] {
  const pts: Point[] = [];
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const faceR = 170;
  // face outline
  for (let a = 0; a < 360; a += 6) {
    const rad = (a * Math.PI) / 180;
    pts.push({ x: cx + faceR * Math.cos(rad), y: cy + faceR * Math.sin(rad) });
  }
  // eyes (two dense little blobs)
  const rng = seededRandom(7);
  for (const [ex, ey] of [
    [cx - 65, cy - 60],
    [cx + 65, cy - 60],
  ]) {
    for (let i = 0; i < 14; i++) {
      const r = 16 * Math.sqrt(rng());
      const a = rng() * Math.PI * 2;
      pts.push({ x: ex + r * Math.cos(a), y: ey + r * Math.sin(a) });
    }
  }
  // smile (an arc of points)
  for (let a = 200; a <= 340; a += 7) {
    const rad = (a * Math.PI) / 180;
    pts.push({ x: cx + 95 * Math.cos(rad), y: cy + 20 + 95 * Math.sin(rad) });
  }
  return pts;
}

function makeMoons(): Point[] {
  const pts: Point[] = [];
  const rng = seededRandom(3);
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  for (let a = 0; a <= 180; a += 4) {
    const rad = (a * Math.PI) / 180;
    const jitter = () => (rng() - 0.5) * 14;
    pts.push({ x: cx - 70 + 110 * Math.cos(rad) + jitter(), y: cy - 20 - 110 * Math.sin(rad) + jitter() });
  }
  for (let a = 0; a <= 180; a += 4) {
    const rad = (a * Math.PI) / 180;
    const jitter = () => (rng() - 0.5) * 14;
    pts.push({ x: cx + 70 - 110 * Math.cos(rad) + jitter(), y: cy + 20 + 110 * Math.sin(rad) + jitter() });
  }
  return pts;
}

function makeBlobs(): Point[] {
  const pts: Point[] = [];
  const rng = seededRandom(11);
  const centers = [
    [SIZE * 0.3, SIZE * 0.3],
    [SIZE * 0.7, SIZE * 0.3],
    [SIZE * 0.5, SIZE * 0.72],
  ];
  for (const [cx, cy] of centers) {
    for (let i = 0; i < 28; i++) {
      const r = 42 * Math.sqrt(rng());
      const a = rng() * Math.PI * 2;
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
  }
  // a handful of scattered outliers
  for (let i = 0; i < 10; i++) {
    pts.push({ x: rng() * SIZE, y: rng() * SIZE });
  }
  return pts;
}

function makeRings(): Point[] {
  const pts: Point[] = [];
  const rng = seededRandom(5);
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  for (let a = 0; a < 360; a += 4) {
    const rad = (a * Math.PI) / 180;
    const jitter = () => (rng() - 0.5) * 10;
    pts.push({ x: cx + 170 * Math.cos(rad) + jitter(), y: cy + 170 * Math.sin(rad) + jitter() });
  }
  for (let a = 0; a < 360; a += 7) {
    const rad = (a * Math.PI) / 180;
    const jitter = () => (rng() - 0.5) * 8;
    pts.push({ x: cx + 80 * Math.cos(rad) + jitter(), y: cy + 80 * Math.sin(rad) + jitter() });
  }
  return pts;
}

export default function DbscanExplorer() {
  // Start empty and populate on mount (client-only): trig-generated preset
  // coordinates can differ in their last float digit between the server's
  // and the browser's V8 build, which trips a hydration mismatch if baked
  // into the initial render.
  const [points, setPoints] = useState<Point[]>([]);
  useEffect(() => {
    setPoints(makeSmiley());
  }, []);
  const [eps, setEps] = useState(18);
  const [minPts, setMinPts] = useState(4);
  const [hover, setHover] = useState<Point | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const labels = useMemo(() => dbscan(points, eps, minPts), [points, eps, minPts]);
  const nClusters = useMemo(() => {
    const ids = new Set(labels.filter((l) => l.cluster !== -1).map((l) => l.cluster));
    return ids.size;
  }, [labels]);
  const nNoise = useMemo(() => labels.filter((l) => l.kind === 'noise').length, [labels]);

  const toLocal = useCallback((e: { clientX: number; clientY: number }): Point | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * SIZE;
    return { x, y };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const p = toLocal(e);
      if (!p) return;
      // if clicking near an existing point, remove it instead of adding
      const nearIdx = points.findIndex((q) => Math.hypot(q.x - p.x, q.y - p.y) < 7);
      if (nearIdx !== -1) {
        setPoints((prev) => prev.filter((_, i) => i !== nearIdx));
      } else {
        setPoints((prev) => [...prev, p]);
      }
    },
    [points, toLocal]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      setHover(toLocal(e));
    },
    [toLocal]
  );

  const applyPreset = (name: PresetName) => {
    if (name === 'clear') setPoints([]);
    else if (name === 'smiley') setPoints(makeSmiley());
    else if (name === 'moons') setPoints(makeMoons());
    else if (name === 'blobs') setPoints(makeBlobs());
    else if (name === 'rings') setPoints(makeRings());
  };

  return (
    <div className="not-prose my-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 shrink-0 flex flex-col gap-3">
          <div className="text-sm font-bold">DBSCAN Explorer</div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] tabular-nums">
              ε (epsilon): {eps}px
            </span>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={eps}
              onChange={(e) => setEps(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] tabular-nums">
              MinPts: {minPts}
            </span>
            <input
              type="range"
              min={2}
              max={15}
              step={1}
              value={minPts}
              onChange={(e) => setMinPts(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Dataset</span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  ['smiley', 'Smiley'],
                  ['moons', 'Moons'],
                  ['blobs', 'Blobs'],
                  ['rings', 'Rings'],
                ] as [PresetName, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="rounded-lg border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => applyPreset('clear')}
              className="mt-1 rounded-lg border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="mt-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] p-2.5 text-xs tabular-nums flex flex-col gap-0.5">
            <span>
              Points: <b>{points.length}</b>
            </span>
            <span>
              Clusters found: <b>{nClusters}</b>
            </span>
            <span>
              Noise points: <b>{nNoise}</b>
            </span>
          </div>

          <p className="text-[11px] text-[var(--text-secondary)]">
            Click empty space to add a point, click an existing point to remove it. Drag the sliders and
            watch clusters form and split live.
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            onClick={handleClick}
            onMouseMove={handleMove}
            onMouseLeave={() => setHover(null)}
            className="w-full h-auto rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] cursor-crosshair"
          >
            {hover && (
              <circle
                cx={hover.x}
                cy={hover.y}
                r={eps}
                fill="none"
                stroke="var(--text-secondary)"
                strokeDasharray="4 3"
                strokeWidth={1}
                opacity={0.6}
              />
            )}
            {points.map((p, i) => {
              const l = labels[i];
              const color = l.cluster === -1 ? NOISE_COLOR : CLUSTER_COLORS[l.cluster % CLUSTER_COLORS.length];
              const r = l.kind === 'core' ? CORE_RADIUS : l.kind === 'border' ? BORDER_RADIUS : NOISE_RADIUS;
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={color}
                  fillOpacity={l.kind === 'noise' ? 0.45 : 0.92}
                  stroke={l.kind === 'core' ? color : 'none'}
                  strokeWidth={l.kind === 'core' ? 1.5 : 0}
                  strokeOpacity={0.3}
                />
              );
            })}
          </svg>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: CLUSTER_COLORS[0] }} />
              core / border point (colored by cluster)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full opacity-45" style={{ background: NOISE_COLOR }} />
              noise
            </span>
            <span>dashed circle = ε-neighborhood under your cursor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
