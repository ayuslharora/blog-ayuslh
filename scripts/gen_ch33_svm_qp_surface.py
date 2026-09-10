"""Ch.33: hard-margin SVM as a constrained convex quadratic program.

Same blob data and linear SVC as Ch.32/33. Hold b at its fitted value and sweep
(w1, w2). The objective is the paraboloid z = 0.5*(w1^2 + w2^2); each training
point contributes a linear constraint y_i*(w.x_i + b) >= 1. Their intersection
is the feasible region. The unconstrained minimum is w = 0, but the constraints
forbid it, so the solution sits on the feasible boundary, where a support-vector
constraint is exactly active.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import make_blobs
from sklearn.svm import SVC

X, y = make_blobs(n_samples=22, centers=[(-3, 2.5), (3, -2.5)], cluster_std=1.3, random_state=3)
ys = np.where(y == 1, 1.0, -1.0)
clf = SVC(kernel="linear", C=1000).fit(X, y)
w_star = clf.coef_[0]
b = float(clf.intercept_[0])

lim = 1.4
g = np.linspace(-lim, lim, 90)
w1, w2 = np.meshgrid(g, g)
obj = 0.5 * (w1 ** 2 + w2 ** 2)

# feasible where every constraint y_i (w1 x_i1 + w2 x_i2 + b) >= 1 holds
feasible = np.ones_like(w1, dtype=bool)
for i in range(len(X)):
    feasible &= (ys[i] * (w1 * X[i, 0] + w2 * X[i, 1] + b) >= 1.0)

obj_feasible = np.where(feasible, obj, np.nan)

out = {
    "w1": [float(v) for v in g],
    "w2": [float(v) for v in g],
    "objective": [[float(v) for v in row] for row in obj],
    "objective_feasible": [[None if np.isnan(v) else float(v) for v in row] for row in obj_feasible],
    "optimum": {"w1": float(w_star[0]), "w2": float(w_star[1]),
                "obj": float(0.5 * np.dot(w_star, w_star))},
    "b": b,
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch33-svm-qp-surface.json"
dst.write_text(json.dumps(out))
print("optimum", out["optimum"], "feasible cells", int(feasible.sum()))
print("wrote", dst)
