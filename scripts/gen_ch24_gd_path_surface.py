"""Ch.24: gradient descent walking down the log-loss surface.

On the video's gradient-descent.ipynb dataset (class_sep=20), sweep the bias w0
and the first weight w1 (w2 held at its converged value) and record the average
binary cross-entropy at each grid point, giving the loss bowl. Then run the exact
gd() loop from the post, recording (w0, w1) every epoch, and store that descent
path so it can be drawn climbing down the bowl to the minimum.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import make_classification

X, y = make_classification(
    n_samples=100, n_features=2, n_informative=1, n_redundant=0,
    n_classes=2, n_clusters_per_class=1, random_state=41,
    hypercube=False, class_sep=20,
)
Xi = np.insert(X, 0, 1, axis=1)


def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))


def log_loss(w):
    p = sigmoid(Xi @ w)
    eps = 1e-12
    return -np.mean(y * np.log(p + eps) + (1 - y) * np.log(1 - p + eps))


# exact gd() loop from the post, recording the path
weights = np.ones(Xi.shape[1])
lr = 0.5
path = [weights.copy()]
for _ in range(5000):
    y_hat = sigmoid(Xi @ weights)
    weights = weights + lr * (Xi.T @ (y - y_hat)) / Xi.shape[0]
    path.append(weights.copy())
path = np.array(path)
w2_fixed = float(path[-1, 2])

s0 = np.linspace(min(0.0, path[:, 0].min()) - 0.5, path[:, 0].max() + 1.0, 60)
s1 = np.linspace(min(0.0, path[:, 1].min()) - 0.5, path[:, 1].max() + 1.0, 60)
Z = np.empty((len(s1), len(s0)))
for i, w1 in enumerate(s1):
    for j, w0 in enumerate(s0):
        Z[i, j] = log_loss(np.array([w0, w1, w2_fixed]))

# thin the path for plotting (dense early, sparse late)
idx = sorted(set(list(range(0, 60)) + list(range(60, 400, 8)) + list(range(400, 5001, 60))))
path_pts = {
    "w0": [float(path[k, 0]) for k in idx],
    "w1": [float(path[k, 1]) for k in idx],
    "loss": [float(log_loss(np.array([path[k, 0], path[k, 1], w2_fixed]))) for k in idx],
}

out = {
    "w0": [float(v) for v in s0],
    "w1": [float(v) for v in s1],
    "loss": [[float(v) for v in row] for row in Z],
    "w2_fixed": w2_fixed,
    "path": path_pts,
    "final": {"w0": float(path[-1, 0]), "w1": float(path[-1, 1]), "loss": path_pts["loss"][-1]},
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch24-gd-path-surface.json"
dst.write_text(json.dumps(out))
print("final weights", out["final"], "w2 fixed", round(w2_fixed, 3))
print("wrote", dst)
