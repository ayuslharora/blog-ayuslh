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
