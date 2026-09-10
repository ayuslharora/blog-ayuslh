"""Ch.30: how C reshapes the probability ramp.

Same make_blobs(centers=2, random_state=6) data as the post's C chart. For three
values of C, fit LogisticRegression and record the predicted probability
sigma(w.x + b) over the feature grid. Small C (strong regularization) shrinks the
weights, so the ramp from 0 to 1 is gentle and wide; large C lets the weights
grow and the ramp sharpens toward a vertical cliff.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import make_blobs
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X, y = make_blobs(n_features=2, centers=2, random_state=6)
X_train, _, y_train, _ = train_test_split(X, y, random_state=42)  # same split as the C chart

pad = 1.5
gx = np.linspace(X[:, 0].min() - pad, X[:, 0].max() + pad, 55)
gy = np.linspace(X[:, 1].min() - pad, X[:, 1].max() + pad, 55)
mx, my = np.meshgrid(gx, gy)
grid = np.column_stack([mx.ravel(), my.ravel()])

surfaces = {}
for c in [0.01, 1.0, 100.0]:
    clf = LogisticRegression(C=c, max_iter=1000).fit(X_train, y_train)
    p = clf.predict_proba(grid)[:, 1].reshape(len(gy), len(gx))
    surfaces[str(c)] = {
        "prob": [[float(v) for v in row] for row in p],
        "coef_norm": float(np.linalg.norm(clf.coef_)),
    }

out = {
    "x": [float(v) for v in gx],
    "y": [float(v) for v in gy],
    "surfaces": surfaces,
    "points": {
        "x": [float(v) for v in X[:, 0]],
        "y": [float(v) for v in X[:, 1]],
        "label": [int(v) for v in y],
    },
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch30-c-probability-surface.json"
dst.write_text(json.dumps(out))
for k, v in surfaces.items():
    print(f"C={k}: ||coef||={v['coef_norm']:.3f}")
print("wrote", dst)
