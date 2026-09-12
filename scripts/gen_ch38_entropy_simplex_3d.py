"""Ch.38: entropy and Gini impurity over the 3-class probability simplex.

The post's Section 2/7 curves plot entropy and Gini against a single
probability p for the 2-class case. This generalizes that to 3 classes:
p1, p2 range over the triangle p1 + p2 <= 1, p1, p2 >= 0 (p3 = 1 - p1 - p2),
and both measures are evaluated at every point in that triangle.
"""
import json
from pathlib import Path

import numpy as np

n = 80
p1 = np.linspace(0.001, 0.999, n)
p2 = np.linspace(0.001, 0.999, n)
P1, P2 = np.meshgrid(p1, p2)
P3 = 1 - P1 - P2

valid = P3 > 0.001
entropy = np.full_like(P1, np.nan)
gini = np.full_like(P1, np.nan)

with np.errstate(invalid="ignore"):
    H = -(P1 * np.log2(P1) + P2 * np.log2(P2) + P3 * np.log2(P3))
    G = 1 - (P1 ** 2 + P2 ** 2 + P3 ** 2)

entropy[valid] = H[valid]
gini[valid] = G[valid]

out = {
    "p1": [float(v) for v in p1],
    "p2": [float(v) for v in p2],
    "entropy": [[None if np.isnan(v) else float(v) for v in row] for row in entropy],
    "gini": [[None if np.isnan(v) else float(v) for v in row] for row in gini],
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch38-entropy-simplex.json"
dst.write_text(json.dumps(out))
print("entropy max", np.nanmax(entropy), "gini max", np.nanmax(gini))
print("wrote", dst)
