"""Datasets for the two in-browser decision-tree explorers.

  - ch39: DecisionTreeHyperparameterExplorer  -> sklearn make_moons, 70/30 split
          (same dataset the Ch.39 charts use), for a 2-D decision boundary.
  - ch40: RegressionTreeExplorer -> a noisy 1-D bump over x in [-5, 5], shaped
          like the Streamlit app shown in the video, 80/20 split.

The tree itself is fitted client-side in TypeScript; this only ships the raw
points so both tools re-fit live as the sliders move.

Run: python3 scripts/gen_ch39_ch40_explorer_data.py
Writes: public/data/ch39-decision-tree.json
        public/data/ch40-regression-tree.json
"""

import json

import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

# --- ch39: 2-D classification -------------------------------------------
X, y = make_moons(n_samples=300, noise=0.25, random_state=42)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=42)

ch39 = {
    "train": {"X": [[round(a, 4), round(b, 4)] for a, b in Xtr], "y": [int(v) for v in ytr]},
    "test": {"X": [[round(a, 4), round(b, 4)] for a, b in Xte], "y": [int(v) for v in yte]},
    "bounds": {
        "xmin": round(float(X[:, 0].min()) - 0.5, 3),
        "xmax": round(float(X[:, 0].max()) + 0.5, 3),
        "ymin": round(float(X[:, 1].min()) - 0.5, 3),
        "ymax": round(float(X[:, 1].max()) + 0.5, 3),
    },
}
with open("public/data/ch39-decision-tree.json", "w") as f:
    json.dump(ch39, f)
print("Wrote public/data/ch39-decision-tree.json", len(ytr), "train /", len(yte), "test")

# --- ch40: 1-D regression --------------------------------------------------
rng = np.random.RandomState(7)
n = 160
x = np.sort(rng.uniform(-5, 5, n))
signal = 1.5 * np.exp(-((x - 1.7) ** 2) / (2 * 1.4 ** 2))
yv = signal + rng.normal(0, 0.11, n)

x_tr, x_te, y_tr, y_te = train_test_split(x, yv, test_size=0.2, random_state=7)
order_tr = np.argsort(x_tr)
order_te = np.argsort(x_te)

ch40 = {
    "train": {
        "x": [round(float(v), 4) for v in x_tr[order_tr]],
        "y": [round(float(v), 4) for v in y_tr[order_tr]],
    },
    "test": {
        "x": [round(float(v), 4) for v in x_te[order_te]],
        "y": [round(float(v), 4) for v in y_te[order_te]],
    },
    "bounds": {"xmin": -5.0, "xmax": 5.0, "ymin": round(float(yv.min()) - 0.2, 3), "ymax": round(float(yv.max()) + 0.2, 3)},
}
with open("public/data/ch40-regression-tree.json", "w") as f:
    json.dump(ch40, f)
print("Wrote public/data/ch40-regression-tree.json", len(y_tr), "train /", len(y_te), "test")
