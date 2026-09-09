"""Ch.23: the log-loss surface logistic regression has to minimize.

On the video's make_classification data (class_sep=10), sweep two of the three
weights (w1, w2) with the bias w0 held at its fitted value, and record the
average binary cross-entropy at each grid point. Log loss is convex in the
weights, so this is a single smooth bowl with one minimum, the point gradient
descent (next chapter) walks down to. No closed form lands on it directly.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression

X, y = make_classification(
    n_samples=100, n_features=2, n_informative=1, n_redundant=0,
    n_classes=2, n_clusters_per_class=1, random_state=41,
    hypercube=False, class_sep=10,
)
Xi = np.insert(X, 0, 1, axis=1)


def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))


def log_loss(w):
    p = sigmoid(Xi @ w)
    eps = 1e-12
    return -np.mean(y * np.log(p + eps) + (1 - y) * np.log(1 - p + eps))


lor = LogisticRegression()  # default C=1.0: keeps weights moderate on separable data
lor.fit(X, y)
w_star = np.array([lor.intercept_[0], lor.coef_[0][0], lor.coef_[0][1]])
b_fixed = float(w_star[0])  # bias held fixed; the sweep is over w1 and w2

span1 = np.linspace(w_star[1] - 7, w_star[1] + 7, 60)
span2 = np.linspace(w_star[2] - 7, w_star[2] + 7, 60)
Z = np.empty((len(span2), len(span1)))
for i, w2 in enumerate(span2):
    for j, w1 in enumerate(span1):
        Z[i, j] = log_loss(np.array([b_fixed, w1, w2]))

best = np.unravel_index(np.argmin(Z), Z.shape)
out = {
    "w1": [float(v) for v in span1],
    "w2": [float(v) for v in span2],
    "loss": [[float(v) for v in row] for row in Z],
    "bias": b_fixed,
    "min": {"w1": float(span1[best[1]]), "w2": float(span2[best[0]]), "loss": float(Z[best])},
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch23-logloss-surface.json"
dst.write_text(json.dumps(out))
print("bias held at", round(b_fixed, 3), "min", out["min"])
print("wrote", dst)
