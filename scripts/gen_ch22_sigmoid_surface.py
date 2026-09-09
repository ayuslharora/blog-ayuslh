"""Ch.22: sigmoid turns the hard step cliff into a smooth probability gradient.

Trains the sigmoid version of the perceptron on the video's make_classification
data (class_sep=10, same as Ch.20/Ch.21), then writes two surfaces over the
feature grid: the step prediction (a vertical 0-to-1 cliff at the boundary) and
the sigmoid output sigma(w0 + w1*x1 + w2*x2) (a smooth ramp). The sigmoid value
reads as P(placed); its 0.5 level set is the decision boundary.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import make_classification


def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))


X, y = make_classification(
    n_samples=100, n_features=2, n_informative=1, n_redundant=0,
    n_classes=2, n_clusters_per_class=1, random_state=41,
    hypercube=False, class_sep=10,
)


def fit_sigmoid_perceptron(X, y, epochs=250, lr=0.1, seed=41):
    rng = np.random.default_rng(seed)
    Xi = np.insert(X, 0, 1, axis=1)
    w = np.ones(Xi.shape[1])
    for _ in range(epochs):
        j = rng.integers(0, X.shape[0])
        y_hat = sigmoid(np.dot(Xi[j], w))
        w = w + lr * (y[j] - y_hat) * Xi[j]
    return w


w = fit_sigmoid_perceptron(X, y)
w0, w1, w2 = float(w[0]), float(w[1]), float(w[2])

pad = 1.0
gx = np.linspace(X[:, 0].min() - pad, X[:, 0].max() + pad, 50)
gy = np.linspace(X[:, 1].min() - pad, X[:, 1].max() + pad, 50)
mx, my = np.meshgrid(gx, gy)
z_lin = w0 + w1 * mx + w2 * my
sig = sigmoid(z_lin)
stepz = (z_lin > 0).astype(float)

pt_sig = sigmoid(w0 + w1 * X[:, 0] + w2 * X[:, 1])

out = {
    "weights": {"w0": w0, "w1": w1, "w2": w2},
    "grid": {"x": [float(v) for v in gx], "y": [float(v) for v in gy]},
    "sigmoid": [[float(v) for v in row] for row in sig],
    "step": [[float(v) for v in row] for row in stepz],
    "points": {
        "x": [float(v) for v in X[:, 0]],
        "y": [float(v) for v in X[:, 1]],
        "p": [float(v) for v in pt_sig],
        "label": [int(v) for v in y],
    },
}

dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch22-sigmoid-surface.json"
dst.write_text(json.dumps(out))
print("weights:", out["weights"])
print("wrote", dst)
