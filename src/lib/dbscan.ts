export type Point = { x: number; y: number };

export type PointLabel = {
  cluster: number; // -1 = noise, 0..n-1 = cluster index
  kind: 'core' | 'border' | 'noise';
};

function dist(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function regionQuery(points: Point[], idx: number, eps: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < points.length; i++) {
    if (dist(points[idx], points[i]) <= eps) out.push(i);
  }
  return out;
}

/**
 * Textbook DBSCAN: classify every point as core/border/noise from its
 * epsilon-neighborhood size, then grow clusters outward from each
 * unvisited core point via density-connectivity (BFS through neighbors
 * that are themselves core points).
 */
export function dbscan(points: Point[], eps: number, minPts: number): PointLabel[] {
  const n = points.length;
  const labels: PointLabel[] = new Array(n).fill(null).map(() => ({ cluster: -1, kind: 'noise' as const }));
  if (n === 0) return labels;

  const neighbors = points.map((_, i) => regionQuery(points, i, eps));
  const isCore = neighbors.map((nb) => nb.length >= minPts);

  for (let i = 0; i < n; i++) {
    labels[i].kind = isCore[i] ? 'core' : 'noise';
  }

  let clusterId = 0;
  const visited = new Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    if (visited[i] || !isCore[i]) continue;
    // start a new cluster from this unvisited core point
    const queue = [i];
    visited[i] = true;
    labels[i].cluster = clusterId;

    while (queue.length) {
      const cur = queue.shift()!;
      if (!isCore[cur]) continue;
      for (const nb of neighbors[cur]) {
        if (labels[nb].cluster === -1) {
          labels[nb].cluster = clusterId;
          if (labels[nb].kind === 'noise' && !isCore[nb]) {
            // reached via a core point but not core itself -> border
            labels[nb].kind = 'border';
          }
        }
        if (!visited[nb]) {
          visited[nb] = true;
          if (isCore[nb]) queue.push(nb);
        }
      }
    }
    clusterId++;
  }

  return labels;
}

export type StepFrame = {
  /** index of the point just visited/queried in this frame */
  visiting: number;
  /** that point's epsilon-neighborhood, found in this frame */
  neighbors: number[];
  /** true once a point has been dequeued and classified */
  visited: boolean[];
  /** label snapshot as of this frame */
  labels: PointLabel[];
};

/**
 * Same algorithm as dbscan(), but expressed as the classic single-pass
 * visit-queue walk (process points in order, expand a growing queue for
 * each new cluster) and instrumented to emit one frame per point visited,
 * so a UI can animate the walk: point by point, each cluster growing
 * outward from wherever it first takes root.
 */
export function dbscanSteps(points: Point[], eps: number, minPts: number): StepFrame[] {
  const n = points.length;
  const frames: StepFrame[] = [];
  if (n === 0) return frames;

  const visited = new Array(n).fill(false);
  const labels: PointLabel[] = new Array(n).fill(null).map(() => ({ cluster: -1, kind: 'noise' as const }));
  let clusterId = 0;

  const snapshot = (visiting: number, neighbors: number[]) =>
    frames.push({
      visiting,
      neighbors: [...neighbors],
      visited: [...visited],
      labels: labels.map((l) => ({ ...l })),
    });

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    visited[i] = true;
    const nb = regionQuery(points, i, eps);

    if (nb.length < minPts) {
      labels[i] = { cluster: -1, kind: 'noise' };
      snapshot(i, nb);
      continue;
    }

    labels[i] = { cluster: clusterId, kind: 'core' };
    snapshot(i, nb);

    const queue = [...nb];
    while (queue.length) {
      const j = queue.shift()!;
      // a point only ever changes state the first time it's dequeued;
      // later requeues (pushed by more than one core neighbor) are no-ops,
      // so skip them rather than emitting an empty frame for each one
      if (visited[j]) continue;
      visited[j] = true;
      const jNeighbors = regionQuery(points, j, eps);
      if (jNeighbors.length >= minPts) {
        labels[j].kind = 'core';
        queue.push(...jNeighbors);
      }
      labels[j].cluster = clusterId;
      if (labels[j].kind !== 'core') labels[j].kind = 'border';
      snapshot(j, jNeighbors);
    }
    clusterId++;
  }

  return frames;
}
