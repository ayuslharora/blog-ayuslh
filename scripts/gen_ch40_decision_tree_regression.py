"""Generate the decision-tree regression charts for Ch.40.

No companion notebook exists for this video in the CampusX 100-days-of-ML
repo (it stops before decision trees). The video builds intuition on a
self-made web app with a 1-D toy dataset, then shows a short code demo on a
tabular regression dataset. This script reproduces both with real fitted
sklearn models, not mockups:

  - a 1-D sine dataset for the "line vs. staircase" and max_depth panels
  - the real greedy split search (weighted SSE over every candidate
    threshold) for the first-split chart
  - load_diabetes + DecisionTreeRegressor.feature_importances_ for the
    feature-importance bar chart

Run: python3 scripts/gen_ch40_decision_tree_regression.py
Writes: public/images/ch40-line-vs-staircase.png
        public/images/ch40-max-depth-steps.png
        public/images/ch40-first-split-search.png
        public/images/ch40-feature-importances.png
"""

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor

RNG = 42

# --- 1-D toy dataset -------------------------------------------------------
rng = np.random.RandomState(RNG)
X = np.sort(5 * rng.rand(80, 1), axis=0)
y = np.sin(X).ravel() + rng.normal(0, 0.12, X.shape[0])
grid = np.linspace(0, 5, 500).reshape(-1, 1)

BLUE = "#2563eb"
RED = "#dc2626"
GREEN = "#16a34a"
GREY = "#94a3b8"


def strip(ax):
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)


# --- Chart 1: linear regression line vs. decision-tree staircase ---------
fig, axes = plt.subplots(1, 2, figsize=(13, 4.8), dpi=300)

lin = LinearRegression().fit(X, y)
axes[0].scatter(X, y, s=20, color=GREY, edgecolor="white", linewidth=0.4)
axes[0].plot(grid, lin.predict(grid), color=BLUE, linewidth=2.5)
axes[0].set_title("Linear regression\none straight line, cannot bend with the data", fontsize=10)

tree = DecisionTreeRegressor(max_depth=3, random_state=RNG).fit(X, y)
axes[1].scatter(X, y, s=20, color=GREY, edgecolor="white", linewidth=0.4)
axes[1].plot(grid, tree.predict(grid), color=RED, linewidth=2.5)
axes[1].set_title("Decision tree regressor (max_depth = 3)\npiecewise-constant: the mean of each region", fontsize=10)

for ax in axes:
    ax.set_xlabel("x")
    ax.set_ylabel("y")
    strip(ax)
plt.tight_layout()
plt.savefig("public/images/ch40-line-vs-staircase.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch40-line-vs-staircase.png")

# --- Chart 2: max_depth, coarse steps -> fine steps -> overfit ----------
depths = [1, 3, None]
labels = [
    "max_depth = 1\none split, two levels",
    "max_depth = 3\nfollows the curve",
    "max_depth = None\na step for almost every point (overfit)",
]
fig, axes = plt.subplots(1, 3, figsize=(15, 4.6), dpi=300)
for ax, depth, label in zip(axes, depths, labels):
    t = DecisionTreeRegressor(max_depth=depth, random_state=RNG).fit(X, y)
    ax.scatter(X, y, s=18, color=GREY, edgecolor="white", linewidth=0.4)
    ax.plot(grid, t.predict(grid), color=RED, linewidth=2.2)
    ax.set_title(f"{label}\ntrain R² {t.score(X, y):.3f}", fontsize=10)
    ax.set_xlabel("x")
    ax.set_ylabel("y")
    strip(ax)
plt.tight_layout()
plt.savefig("public/images/ch40-max-depth-steps.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch40-max-depth-steps.png")

# --- Chart 3: the greedy first-split search -----------------------------
xs = X.ravel()
order = np.argsort(xs)
xs_sorted, ys_sorted = xs[order], y[order]
midpoints = (xs_sorted[:-1] + xs_sorted[1:]) / 2

total_sse = []
for t in midpoints:
    left, right = y[xs < t], y[xs >= t]
    sse = ((left - left.mean()) ** 2).sum() + ((right - right.mean()) ** 2).sum()
    total_sse.append(sse)
total_sse = np.array(total_sse)
best_t = midpoints[total_sse.argmin()]

# sklearn's own first split, for cross-check
stump = DecisionTreeRegressor(max_depth=1, random_state=RNG).fit(X, y)
sklearn_t = stump.tree_.threshold[0]

fig, axes = plt.subplots(1, 2, figsize=(13, 4.8), dpi=300)
axes[0].scatter(X, y, s=20, color=GREY, edgecolor="white", linewidth=0.4)
axes[0].axvline(best_t, color=GREEN, linewidth=2, linestyle="--")
left_mean = y[xs < best_t].mean()
right_mean = y[xs >= best_t].mean()
axes[0].plot([0, best_t], [left_mean, left_mean], color=RED, linewidth=2.5)
axes[0].plot([best_t, 5], [right_mean, right_mean], color=RED, linewidth=2.5)
axes[0].set_title(f"Best first split at x = {best_t:.2f}\npredict {left_mean:.2f} left, {right_mean:.2f} right", fontsize=10)
axes[0].set_xlabel("x")
axes[0].set_ylabel("y")

axes[1].plot(midpoints, total_sse, color=BLUE, linewidth=2)
axes[1].scatter([best_t], [total_sse.min()], color=GREEN, s=60, zorder=5)
axes[1].set_title(f"Weighted squared error for every candidate threshold\nminimum at x = {best_t:.2f} (sklearn: {sklearn_t:.2f})", fontsize=10)
axes[1].set_xlabel("candidate split threshold")
axes[1].set_ylabel("left SSE + right SSE")
for ax in axes:
    strip(ax)
plt.tight_layout()
plt.savefig("public/images/ch40-first-split-search.png", bbox_inches="tight")
plt.close()
print(f"greedy best_t={best_t:.4f}  sklearn threshold={sklearn_t:.4f}")
print("Wrote public/images/ch40-first-split-search.png")

# --- Chart 4: feature importances on load_diabetes ---------------------
data = load_diabetes()
reg = DecisionTreeRegressor(max_depth=5, random_state=RNG).fit(data.data, data.target)
imp = reg.feature_importances_
idx = np.argsort(imp)

fig, ax = plt.subplots(figsize=(8, 5), dpi=300)
ax.barh(np.array(data.feature_names)[idx], imp[idx], color=BLUE)
ax.set_xlabel("feature_importances_  (impurity decrease, normalised to sum to 1)")
ax.set_title("DecisionTreeRegressor(max_depth=5) on load_diabetes", fontsize=10)
strip(ax)
plt.tight_layout()
plt.savefig("public/images/ch40-feature-importances.png", bbox_inches="tight")
plt.close()
print("feature importances:", {n: round(float(v), 3) for n, v in zip(data.feature_names, imp)})
print("Wrote public/images/ch40-feature-importances.png")
