"""Ch.20 Perceptron trick: the score function W.X as a plane over feature space.

Uses the same dataset as the source notebook (perceptron-trick.ipynb,
make_classification with class_sep=10, random_state=41), runs the perceptron
trick, and writes the trained score plane z = w0 + w1*x1 + w2*x2 together with
every training point placed at its own score height. Where the tilted plane
crosses z = 0 is the decision boundary; points above it are predicted positive.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import make_classification

X, y = make_classification(
    n_samples=100, n_features=2, n_informative=1, n_redundant=0,
    n_classes=2, n_clusters_per_class=1, random_state=41,
    hypercube=False, class_sep=10,
)


def step(z):
    return 1 if z > 0 else 0


def perceptron(X, y, epochs=1000, lr=0.1):
    Xi = np.insert(X, 0, 1, axis=1)
    weights = np.ones(Xi.shape[1])
    rng = np.random.default_rng(41)
    for _ in range(epochs):
        j = rng.integers(0, X.shape[0])
        y_hat = step(np.dot(Xi[j], weights))
        weights = weights + lr * (y[j] - y_hat) * Xi[j]
    return weights


w = perceptron(X, y)
w0, w1, w2 = float(w[0]), float(w[1]), float(w[2])

pad = 1.0
x1 = np.linspace(X[:, 0].min() - pad, X[:, 0].max() + pad, 40)
x2 = np.linspace(X[:, 1].min() - pad, X[:, 1].max() + pad, 40)
gx1, gx2 = np.meshgrid(x1, x2)
gz = w0 + w1 * gx1 + w2 * gx2

scores = w0 + w1 * X[:, 0] + w2 * X[:, 1]

out = {
    "weights": {"w0": w0, "w1": w1, "w2": w2},
    "plane": {
        "x": [float(v) for v in x1],
        "y": [float(v) for v in x2],
        "z": [[float(v) for v in row] for row in gz],
    },
    "points": {
        "x": [float(v) for v in X[:, 0]],
        "y": [float(v) for v in X[:, 1]],
        "z": [float(v) for v in scores],
        "label": [int(v) for v in y],
    },
}

dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch20-perceptron-plane.json"
dst.write_text(json.dumps(out))
print("weights:", out["weights"])
print("misclassified:", int(np.sum((scores > 0).astype(int) != y)))
print("wrote", dst)
