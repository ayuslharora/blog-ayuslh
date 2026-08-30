"""Generate the decision-tree hyperparameter charts for Ch.39.

No companion notebook exists for this video in the CampusX 100-days-of-ML
repo (it doesn't cover decision trees at all). The video demos its points on
a self-built web app using a two-class, non-linearly-separable "moons"
toy dataset, so this reproduces the same idea with sklearn's real
make_moons + DecisionTreeClassifier and a real fitted tree, not a mockup.

Run: python3 scripts/gen_ch39_decision_tree_hyperparameters.py
Writes: public/images/ch39-max-depth-under-over-fit.png
        public/images/ch39-min-samples-leaf.png
        public/images/ch39-criterion-gini-vs-entropy.png
        public/images/ch39-max-leaf-nodes.png
"""

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import ListedColormap
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

RNG = 42
X, y = make_moons(n_samples=300, noise=0.25, random_state=RNG)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=RNG)

CMAP_BG = ListedColormap(["#dbeafe", "#fee2e2"])
CMAP_PTS = ListedColormap(["#2563eb", "#dc2626"])

xx, yy = np.meshgrid(
    np.linspace(X[:, 0].min() - 0.5, X[:, 0].max() + 0.5, 300),
    np.linspace(X[:, 1].min() - 0.5, X[:, 1].max() + 0.5, 300),
)


def plot_boundary(ax, clf, title):
    Z = clf.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    ax.contourf(xx, yy, Z, cmap=CMAP_BG, alpha=0.8)
    ax.scatter(X_train[:, 0], X_train[:, 1], c=y_train, cmap=CMAP_PTS,
               s=18, edgecolor="white", linewidth=0.4)
    train_acc = clf.score(X_train, y_train)
    test_acc = clf.score(X_test, y_test)
    ax.set_title(f"{title}\ntrain acc {train_acc:.2f}  |  test acc {test_acc:.2f}", fontsize=10)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)


# --- Chart 1: max_depth, underfit -> balanced -> overfit --------------------
depths = [1, 4, None]
labels = ["max_depth = 1\n(underfit)", "max_depth = 4\n(balanced)", "max_depth = None\n(overfit)"]

fig, axes = plt.subplots(1, 3, figsize=(13, 4.5), dpi=300)
for ax, depth, label in zip(axes, depths, labels):
    clf = DecisionTreeClassifier(max_depth=depth, random_state=RNG).fit(X_train, y_train)
    plot_boundary(ax, clf, label)
plt.tight_layout()
plt.savefig("public/images/ch39-max-depth-under-over-fit.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch39-max-depth-under-over-fit.png")

# --- Chart 2: min_samples_leaf sweep -----------------------------------------
leaf_values = [1, 5, 20]
fig, axes = plt.subplots(1, 3, figsize=(13, 4.5), dpi=300)
for ax, leaf in zip(axes, leaf_values):
    clf = DecisionTreeClassifier(min_samples_leaf=leaf, random_state=RNG).fit(X_train, y_train)
    plot_boundary(ax, clf, f"min_samples_leaf = {leaf}")
plt.tight_layout()
plt.savefig("public/images/ch39-min-samples-leaf.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch39-min-samples-leaf.png")

# --- Chart 3: gini vs entropy, test accuracy across depths ------------------
depth_range = range(1, 11)
gini_scores, entropy_scores = [], []
for d in depth_range:
    gini_scores.append(DecisionTreeClassifier(criterion="gini", max_depth=d, random_state=RNG)
                        .fit(X_train, y_train).score(X_test, y_test))
    entropy_scores.append(DecisionTreeClassifier(criterion="entropy", max_depth=d, random_state=RNG)
                           .fit(X_train, y_train).score(X_test, y_test))

fig, ax = plt.subplots(figsize=(7.5, 5), dpi=300)
ax.plot(list(depth_range), gini_scores, color="#2563eb", linewidth=2, marker="o", markersize=5, label="gini")
ax.plot(list(depth_range), entropy_scores, color="#16a34a", linewidth=2, marker="o", markersize=5, label="entropy")
ax.set_xlabel("max_depth")
ax.set_ylabel("test accuracy")
ax.legend(frameon=False)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch39-criterion-gini-vs-entropy.png", bbox_inches="tight")
plt.close()
print(f"gini scores: {[round(s, 3) for s in gini_scores]}")
print(f"entropy scores: {[round(s, 3) for s in entropy_scores]}")
print("Wrote public/images/ch39-criterion-gini-vs-entropy.png")

# --- Chart 4: max_leaf_nodes sweep -------------------------------------------
leaf_node_values = [2, 4, 8, None]
node_labels = ["max_leaf_nodes = 2", "max_leaf_nodes = 4", "max_leaf_nodes = 8", "max_leaf_nodes = None"]
fig, axes = plt.subplots(1, 4, figsize=(16, 4.2), dpi=300)
for ax, val, label in zip(axes, leaf_node_values, node_labels):
    clf = DecisionTreeClassifier(max_leaf_nodes=val, random_state=RNG).fit(X_train, y_train)
    plot_boundary(ax, clf, label)
plt.tight_layout()
plt.savefig("public/images/ch39-max-leaf-nodes.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch39-max-leaf-nodes.png")
