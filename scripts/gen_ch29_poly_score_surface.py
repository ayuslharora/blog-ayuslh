"""Ch.29: why the polynomial decision boundary is curved.

Fits degree-3 PolynomialFeatures + LogisticRegression on the ushape toy dataset
(same as the post's chart) and writes the model's raw score
z = wᵀ·φ(x1, x2) over a grid. In the expanded polynomial space z is a flat cut,
but as a function of the original x1, x2 it is a curved surface, so where it
crosses zero (its intersection with the flat z = 0 sheet) is a curved boundary.
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

csv_path = sys.argv[1] if len(sys.argv) > 1 else "ushape.csv"
df = pd.read_csv(csv_path, header=None)
X = df.iloc[:, :2].values.astype(float)
y = df.iloc[:, 2].values.astype(int)

model = make_pipeline(PolynomialFeatures(degree=3), LogisticRegression(max_iter=5000))
model.fit(X, y)

pad = 0.6
gx = np.linspace(X[:, 0].min() - pad, X[:, 0].max() + pad, 60)
gy = np.linspace(X[:, 1].min() - pad, X[:, 1].max() + pad, 60)
mx, my = np.meshgrid(gx, gy)
grid = np.column_stack([mx.ravel(), my.ravel()])
z = model.decision_function(grid).reshape(len(gy), len(gx))
pt_z = model.decision_function(X)

out = {
    "x": [float(v) for v in gx],
    "y": [float(v) for v in gy],
    "z": [[float(v) for v in row] for row in z],
    "points": {
        "x": [float(v) for v in X[:, 0]],
        "y": [float(v) for v in X[:, 1]],
        "z": [float(v) for v in pt_z],
        "label": [int(v) for v in y],
    },
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch29-poly-score-surface.json"
dst.write_text(json.dumps(out))
print("z range", round(float(z.min()), 2), round(float(z.max()), 2))
print("wrote", dst)
