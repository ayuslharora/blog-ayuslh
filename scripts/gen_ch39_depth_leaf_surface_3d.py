"""Ch.39: test accuracy over max_depth x min_samples_leaf jointly.

Same make_moons(n_samples=300, noise=0.25, random_state=42) split as the rest
of the post. Every other hyperparameter section sweeps one knob at a time;
this grids two of them together to show how they interact, a shallow tree can
tolerate a small min_samples_leaf, but a deep, unconstrained tree needs a
larger one to avoid the same overfitting max_depth alone was fighting.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = make_moons(n_samples=300, noise=0.25, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

depths = list(range(1, 13))
leaves = [1, 2, 5, 10, 20, 40]

acc = np.zeros((len(leaves), len(depths)))
for i, leaf in enumerate(leaves):
    for j, depth in enumerate(depths):
        clf = DecisionTreeClassifier(max_depth=depth, min_samples_leaf=leaf, random_state=42)
        clf.fit(X_train, y_train)
        acc[i, j] = clf.score(X_test, y_test)

best = np.unravel_index(np.argmax(acc), acc.shape)
out = {
    "depths": depths,
    "leaves": leaves,
    "accuracy": [[float(v) for v in row] for row in acc],
    "best": {"depth": depths[best[1]], "leaf": leaves[best[0]], "accuracy": float(acc[best])},
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch39-depth-leaf-surface.json"
dst.write_text(json.dumps(out))
print("best", out["best"])
print("wrote", dst)
