"""Ch.19 Elastic Net: test R2 as a surface over the (alpha, l1_ratio) grid.

Fits sklearn ElasticNet on the diabetes dataset (same split as day57 notebook)
across a log-spaced alpha grid and a linear l1_ratio grid, records the test-set
R2 at every point, and writes it as a Plotly-ready surface JSON.
"""
import json
import warnings
from pathlib import Path

import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.exceptions import ConvergenceWarning
from sklearn.linear_model import ElasticNet
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split

warnings.filterwarnings("ignore", category=ConvergenceWarning)

X, y = load_diabetes(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=2
)

alphas = np.logspace(-3, 0, 40)          # 0.001 .. 1
l1_ratios = np.linspace(0.01, 1.0, 40)   # ~pure L2 .. pure L1

z = np.empty((len(l1_ratios), len(alphas)))
for i, r in enumerate(l1_ratios):
    for j, a in enumerate(alphas):
        m = ElasticNet(alpha=a, l1_ratio=r, max_iter=10000)
        m.fit(X_train, y_train)
        z[i, j] = r2_score(y_test, m.predict(X_test))

best = np.unravel_index(np.argmax(z), z.shape)
best_point = {
    "alpha": float(alphas[best[1]]),
    "l1_ratio": float(l1_ratios[best[0]]),
    "r2": float(z[best]),
}
print("best:", best_point)

out = {
    "alpha": [float(a) for a in alphas],
    "l1_ratio": [float(r) for r in l1_ratios],
    "r2": [[float(v) for v in row] for row in z],
    "best": best_point,
}

dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch19-elasticnet-r2-surface.json"
dst.write_text(json.dumps(out))
print("wrote", dst)
