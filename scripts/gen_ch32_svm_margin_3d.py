"""Ch.32: the SVM decision function and its margin slab in 3D.

Same make_blobs data and linear SVC as the post's charts. The score
z = w.x + b is a tilted plane over the feature space. The boundary is where it
crosses z = 0; the two margin hyperplanes are z = +1 and z = -1. Every point is
placed at its own score height, so the support vectors are exactly the points
sitting on the z = +/-1 planes.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import make_blobs
from sklearn.svm import SVC

X, y = make_blobs(n_samples=22, centers=[(-3, 2.5), (3, -2.5)], cluster_std=1.3, random_state=3)
clf = SVC(kernel="linear", C=1000).fit(X, y)
w = clf.coef_[0]
b = float(clf.intercept_[0])

pad = 1.2
gx = np.linspace(X[:, 0].min() - pad, X[:, 0].max() + pad, 40)
gy = np.linspace(X[:, 1].min() - pad, X[:, 1].max() + pad, 40)
mx, my = np.meshgrid(gx, gy)
z = w[0] * mx + w[1] * my + b

scores = w[0] * X[:, 0] + w[1] * X[:, 1] + b
support = set(int(i) for i in clf.support_)

out = {
    "x": [float(v) for v in gx],
    "y": [float(v) for v in gy],
    "z": [[float(v) for v in row] for row in z],
    "margin_width": float(2.0 / np.linalg.norm(w)),
    "points": {
        "x": [float(v) for v in X[:, 0]],
        "y": [float(v) for v in X[:, 1]],
        "z": [float(v) for v in scores],
        "label": [int(v) for v in y],
        "support": [1 if i in support else 0 for i in range(len(X))],
    },
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch32-svm-margin-3d.json"
dst.write_text(json.dumps(out))
print("margin width", round(out["margin_width"], 3), "support vectors", sorted(support))
print("wrote", dst)
