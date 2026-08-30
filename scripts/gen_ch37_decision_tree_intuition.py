"""Generate the geometric-intuition and tree-diagram charts for Ch.37.

No companion notebook exists for this video in the CampusX 100-days-of-ML repo
(decision trees aren't covered there), so this builds real, from-first-
principles illustrations instead: a shallow decision tree fit on two real
numeric features from the classic Iris dataset, showing the axis-aligned
rectangular splits the video describes, plus the tree itself for terminology
(root / decision node / leaf).

Run: python3 scripts/gen_ch37_decision_tree_intuition.py
Writes: public/images/ch37-decision-boundary.png
        public/images/ch37-tree-diagram.png
"""

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier, plot_tree

data = load_iris()
X = data.data[:, [2, 3]]  # petal length, petal width
y = data.target
feature_names = ["petal length (cm)", "petal width (cm)"]

clf = DecisionTreeClassifier(max_depth=3, random_state=2)
clf.fit(X, y)
print(f"train accuracy: {clf.score(X, y):.4f}")

# --- Chart 1: axis-aligned decision regions ---------------------------------
a = np.arange(X[:, 0].min() - 0.5, X[:, 0].max() + 0.5, 0.02)
b = np.arange(X[:, 1].min() - 0.5, X[:, 1].max() + 0.5, 0.02)
XX, YY = np.meshgrid(a, b)
mesh_points = np.c_[XX.ravel(), YY.ravel()]
labels = clf.predict(mesh_points).reshape(XX.shape)

fig, ax = plt.subplots(figsize=(7, 6), dpi=300)
ax.contourf(XX, YY, labels, alpha=0.35, cmap="viridis")
for cls, marker, color in zip([0, 1, 2], ["o", "s", "^"], ["#dc2626", "#16a34a", "#2563eb"]):
    ax.scatter(
        X[y == cls, 0], X[y == cls, 1],
        marker=marker, color=color, s=50, edgecolors="white", linewidths=0.5,
        label=data.target_names[cls], zorder=3,
    )
ax.set_xlabel(feature_names[0])
ax.set_ylabel(feature_names[1])
ax.legend(frameon=False, loc="upper left")
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch37-decision-boundary.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch37-decision-boundary.png")

# --- Chart 2: the fitted tree itself, for terminology -----------------------
fig, ax = plt.subplots(figsize=(13, 7), dpi=300)
plot_tree(
    clf, feature_names=feature_names, class_names=list(data.target_names),
    filled=True, rounded=True, fontsize=10, ax=ax,
)
plt.tight_layout()
plt.savefig("public/images/ch37-tree-diagram.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch37-tree-diagram.png")
