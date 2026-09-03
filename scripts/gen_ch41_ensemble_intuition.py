"""Generate the ensemble-intuition charts for Ch.41.

This is the introduction-to-ensemble-learning video (CampusX 100-days-of-ML,
video #101). It has no companion notebook: the visuals in the video are
Google-searched illustrations of "why ensembles work", so this reproduces
that same idea from scratch with scikit-learn.

Chart 1 (classification): unpruned decision trees, each fit on its own
bootstrap sample of a two-moons dataset, draw jagged, disagreeing boundaries
(three shown). A majority vote over 101 of them produces a visibly smoother
boundary than any single tree.

Chart 2 (regression): many unpruned decision-tree regressors, each on its own
fresh noisy sample of the same curve, each draw a wild step function; their
average tracks the true curve far more closely than any individual tree.

Run: python3 scripts/gen_ch41_ensemble_intuition.py
Writes: public/images/ch41-ensemble-classification.png
        public/images/ch41-ensemble-regression.png
"""

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import make_moons
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

rng = np.random.default_rng(11)

# --- Chart 1: three trees vs their majority vote ---------------------------
X, y = make_moons(n_samples=300, noise=0.25, random_state=11)

xx, yy = np.meshgrid(
    np.linspace(X[:, 0].min() - 0.5, X[:, 0].max() + 0.5, 400),
    np.linspace(X[:, 1].min() - 0.5, X[:, 1].max() + 0.5, 400),
)
grid = np.c_[xx.ravel(), yy.ravel()]

# 3 trees are drawn individually; the vote panel pools n_vote of them.
n_show = 3
n_vote = 101
tree_preds = []
for i in range(n_vote):
    idx = rng.integers(0, len(X), len(X))  # bootstrap sample: sample with replacement
    t = DecisionTreeClassifier(random_state=i).fit(X[idx], y[idx])
    tree_preds.append(t.predict(grid).reshape(xx.shape))

vote = (np.mean(tree_preds, axis=0) >= 0.5).astype(int)

cmap_bg = plt.cm.RdBu
fig, axes = plt.subplots(1, 4, figsize=(15, 4), dpi=300)
for i, ax in enumerate(axes[:n_show]):
    ax.contourf(xx, yy, tree_preds[i], alpha=0.35, cmap=cmap_bg, levels=1)
    ax.scatter(X[:, 0], X[:, 1], c=y, cmap=cmap_bg, edgecolors="k", linewidths=0.4, s=18)
    ax.set_title(f"Tree {i + 1} (its own bootstrap sample)", fontsize=11)

axes[3].contourf(xx, yy, vote, alpha=0.35, cmap=cmap_bg, levels=1)
axes[3].scatter(X[:, 0], X[:, 1], c=y, cmap=cmap_bg, edgecolors="k", linewidths=0.4, s=18)
axes[3].set_title(f"Majority vote of {n_vote} such trees", fontsize=11, fontweight="bold")

for ax in axes:
    ax.set_xticks([])
    ax.set_yticks([])

plt.tight_layout()
plt.savefig("public/images/ch41-ensemble-classification.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch41-ensemble-classification.png")

# --- Chart 2: many regression trees vs their average ---------------------
# Each tree gets its OWN sample of the noisy process (60 points), fully grown
# so it overfits its own sample wildly. This is the "different models on
# different data" idea in its cleanest form; bootstrapping one fixed sample is
# just one way to manufacture that difference.
grid_x = np.linspace(0, 1, 60)
line_x = np.linspace(0, 1, 500).reshape(-1, 1)
n_reg_trees = 300
reg_preds = []
for i in range(n_reg_trees):
    yr_i = np.sin(2 * np.pi * grid_x) + rng.normal(0, 0.25, grid_x.shape)
    t = DecisionTreeRegressor(random_state=i).fit(grid_x.reshape(-1, 1), yr_i)
    reg_preds.append(t.predict(line_x))

avg_pred = np.mean(reg_preds, axis=0)

# one sample drawn for the scatter, purely for context
yr_show = np.sin(2 * np.pi * grid_x) + rng.normal(0, 0.25, grid_x.shape)

fig, ax = plt.subplots(figsize=(8, 5.5), dpi=300)
ax.scatter(grid_x, yr_show, color="#9ca3af", s=16, alpha=0.6,
           label="one noisy sample (for context)")
for i, p in enumerate(reg_preds[:40]):
    ax.plot(line_x, p, color="#f59e0b", linewidth=0.6, alpha=0.15,
            label="individual trees" if i == 0 else None)
ax.plot(line_x, np.sin(2 * np.pi * line_x.ravel()), color="#111827",
        linewidth=2, linestyle="--", label="true function")
ax.plot(line_x, avg_pred, color="#2563eb", linewidth=2.5,
        label=f"average of {n_reg_trees} trees")
ax.set_xlabel("x")
ax.set_ylabel("y")
ax.legend(frameon=False, loc="upper right")
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch41-ensemble-regression.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch41-ensemble-regression.png")
