"""Ch.37: the decision tree's axis-aligned cuts as 3D hypercuboids.

The video's own suggested exercise: imagine the 2D petal-length/petal-width
splits extended into 3D. Fits a shallow DecisionTreeClassifier on three real
Iris features (sepal length, petal length, petal width), predicts across a
fine 3D grid, and writes the grid + predictions so the post can render the
actual blocky hypercuboid regions a tree carves out, not just describe them.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier

data = load_iris()
X = data.data[:, [0, 2, 3]]  # sepal length, petal length, petal width
y = data.target
names = list(data.target_names)

clf = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X, y)

gx = np.linspace(X[:, 0].min(), X[:, 0].max(), 16)
gy = np.linspace(X[:, 1].min(), X[:, 1].max(), 16)
gz = np.linspace(X[:, 2].min(), X[:, 2].max(), 16)
mx, my, mz = np.meshgrid(gx, gy, gz, indexing="ij")
grid = np.column_stack([mx.ravel(), my.ravel(), mz.ravel()])
pred = clf.predict(grid)

out = {
    "features": ["sepal length (cm)", "petal length (cm)", "petal width (cm)"],
    "classes": names,
    "grid": {
        "x": [float(v) for v in grid[:, 0]],
        "y": [float(v) for v in grid[:, 1]],
        "z": [float(v) for v in grid[:, 2]],
        "label": [int(v) for v in pred],
    },
    "points": {
        "x": [float(v) for v in X[:, 0]],
        "y": [float(v) for v in X[:, 1]],
        "z": [float(v) for v in X[:, 2]],
        "label": [int(v) for v in y],
    },
    "accuracy": float(clf.score(X, y)),
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch37-hypercuboids.json"
dst.write_text(json.dumps(out))
print("train accuracy", round(out["accuracy"], 3), "grid points", len(grid))
print("wrote", dst)
