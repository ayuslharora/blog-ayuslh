"""Ch.34: slack (xi) as how far a point pokes through its margin sheet.

Same overlapping make_blobs data as the post's C=0.05 / C=20 comparison chart.
For each C, fits a soft-margin linear SVC and writes the score plane
w.x + b over the feature grid together with every point at its own score
height. A point's slack is max(0, 1 - y*(score)): zero once it clears its
margin sheet, positive (and visible as poking past the +/-1 sheet) otherwise.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import make_blobs
from sklearn.svm import SVC

X, y = make_blobs(n_samples=40, centers=[(-1.5, 1), (1.5, -1)], cluster_std=2.1, random_state=7)
ys = np.where(y == 1, 1.0, -1.0)

pad = 1.5
gx = np.linspace(X[:, 0].min() - pad, X[:, 0].max() + pad, 45)
gy = np.linspace(X[:, 1].min() - pad, X[:, 1].max() + pad, 45)
mx, my = np.meshgrid(gx, gy)

surfaces = {}
for C in [0.05, 20]:
    clf = SVC(kernel="linear", C=C).fit(X, y)
    w = clf.coef_[0]
    b = float(clf.intercept_[0])
    z = w[0] * mx + w[1] * my + b
    scores = w[0] * X[:, 0] + w[1] * X[:, 1] + b
    slack = np.maximum(0.0, 1.0 - ys * scores)
    surfaces[str(C)] = {
        "z": [[float(v) for v in row] for row in z],
        "point_z": [float(v) for v in scores],
        "slack": [float(v) for v in slack],
        "margin": float(2.0 / np.linalg.norm(w)),
        "n_slack": int(np.sum(slack > 1e-6)),
    }

out = {
    "x": [float(v) for v in gx],
    "y": [float(v) for v in gy],
    "points": {"x": [float(v) for v in X[:, 0]], "y": [float(v) for v in X[:, 1]], "label": [int(v) for v in y]},
    "surfaces": surfaces,
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch34-slack-surface.json"
dst.write_text(json.dumps(out))
for k, v in surfaces.items():
    print(f"C={k}: margin={v['margin']:.2f}, points with slack={v['n_slack']}")
print("wrote", dst)
