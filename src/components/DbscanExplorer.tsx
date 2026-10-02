'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dbscan, dbscanSteps, type Point, type StepFrame } from '../lib/dbscan';

const UNVISITED_COLOR = '#adb5bd';
const FRAME_MS = 120;

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

  // Animation: when non-null, we're replaying dbscanSteps() frame by frame
  // instead of showing the final static result, the same "watch clusters
  // grow ring by ring" walk the reference visualization uses.
  const [animFrames, setAnimFrames] = useState<StepFrame[] | null>(null);
  const [animIndex, setAnimIndex] = useState(0);
  const isAnimating = animFrames !== null;

  useEffect(() => {
    if (!isAnimating) return;
    if (animIndex >= animFrames!.length - 1) {
      // hold on the final frame briefly, then hand back to the normal
      // interactive (static-result) view with the "Run" button re-armed
      const t = setTimeout(() => {
        setAnimFrames(null);
        setAnimIndex(0);
      }, FRAME_MS * 4);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setAnimIndex((i) => i + 1), FRAME_MS);
    return () => clearTimeout(t);
  }, [isAnimating, animIndex, animFrames]);

  const staticLabels = useMemo(() => dbscan(points, eps, minPts), [points, eps, minPts]);
  const frame = isAnimating ? animFrames![Math.min(animIndex, animFrames!.length - 1)] : null;
  const labels = frame ? frame.labels : staticLabels;
  const visitedMask = frame ? frame.visited : null;

  const nClusters = useMemo(() => {
    const ids = new Set(labels.filter((l) => l.cluster !== -1).map((l) => l.cluster));
    return ids.size;
  }, [labels]);
  const nNoise = useMemo(() => labels.filter((l) => l.kind === 'noise').length, [labels]);

  const runAnimation = useCallback(() => {
    const frames = dbscanSteps(points, eps, minPts);
    if (frames.length === 0) return;
    setAnimFrames(frames);
    setAnimIndex(0);
  }, [points, eps, minPts]);

  const stopAnimation = useCallback(() => {
    setAnimFrames(null);
    setAnimIndex(0);
  }, []);

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
      if (isAnimating) return;
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
    [points, toLocal, isAnimating]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      setHover(toLocal(e));
    },
    [toLocal]
  );

  const applyPreset = (name: PresetName) => {
    stopAnimation();
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
              onChange={(e) => {
                stopAnimation();
                setEps(Number(e.target.value));
              }}
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
              onChange={(e) => {
                stopAnimation();
                setMinPts(Number(e.target.value));
              }}
            />
          </div>

          <button
            onClick={() => (isAnimating ? stopAnimation() : runAnimation())}
            disabled={points.length === 0}
            className="rounded-lg px-2 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAnimating ? '■ Stop' : '▶ Run DBSCAN'}
          </button>
          {isAnimating && (
            <div className="h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-[width] duration-100"
                style={{ width: `${(100 * (animIndex + 1)) / animFrames!.length}%` }}
              />
            </div>
          )}

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
            {isAnimating
              ? 'Watching DBSCAN walk the points one at a time, growing each cluster outward as it goes.'
              : 'Click empty space to add a point, click an existing point to remove it. Hit Run to watch the walk, or drag the sliders for an instant live result.'}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            onClick={handleClick}
            onMouseMove={handleMove}
            onMouseLeave={() => setHover(null)}
            className={`w-full h-auto rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] ${isAnimating ? '' : 'cursor-crosshair'}`}
          >
            {!isAnimating && hover && (
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
            {frame && (
              <circle
                cx={points[frame.visiting].x}
                cy={points[frame.visiting].y}
                r={eps}
                fill="none"
                stroke="#f08c00"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                opacity={0.85}
              />
            )}
            {frame &&
              frame.neighbors.map((nbIdx) => (
                <line
                  key={`ray-${nbIdx}`}
                  x1={points[frame.visiting].x}
                  y1={points[frame.visiting].y}
                  x2={points[nbIdx].x}
                  y2={points[nbIdx].y}
                  stroke="#f08c00"
                  strokeWidth={0.75}
                  opacity={0.35}
                />
              ))}
            {points.map((p, i) => {
              const unvisited = visitedMask !== null && !visitedMask[i];
              const l = labels[i];
              const color = unvisited
                ? UNVISITED_COLOR
                : l.cluster === -1
                  ? NOISE_COLOR
                  : CLUSTER_COLORS[l.cluster % CLUSTER_COLORS.length];
              const r = unvisited
                ? NOISE_RADIUS
                : l.kind === 'core'
                  ? CORE_RADIUS
                  : l.kind === 'border'
                    ? BORDER_RADIUS
                    : NOISE_RADIUS;
              const isActive = frame && frame.visiting === i;
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? r + 2.5 : r}
                  fill={color}
                  fillOpacity={unvisited ? 0.5 : l.kind === 'noise' ? 0.45 : 0.92}
                  stroke={isActive ? '#f08c00' : l.kind === 'core' ? color : 'none'}
                  strokeWidth={isActive ? 2 : l.kind === 'core' ? 1.5 : 0}
                  strokeOpacity={isActive ? 0.9 : 0.3}
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
            {isAnimating ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full opacity-50" style={{ background: UNVISITED_COLOR }} />
                not yet visited · orange ring = ε around the point being checked right now
              </span>
            ) : (
              <span>dashed circle = ε-neighborhood under your cursor</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
