"""Generate the voting-regressor code charts for Ch.44.

CampusX 100-days-of-ML, video #105: the regression mirror of Ch.43's
voting classifier post. Covers sklearn's VotingRegressor combining
LinearRegression, SVR, and DecisionTreeRegressor, weighted voting as a
hyperparameter, and diversity from the same algorithm at different
hyperparameters instead of different algorithms. No matching notebook
was found in campusx-official/100-days-of-machine-learning (the
ensemble-learning days aren't uploaded there), and the video's own
dataset (`load_boston`) is removed from modern scikit-learn, so this
uses the California housing dataset and computes every number fresh.

Chart 1: individual base models (linear regression, SVR, decision tree)
vs voting regressor, 10-fold CV R2 on California housing.

Chart 2: same algorithm (decision tree), five different max_depth
values, as base learners for a voting regressor, vs the single best
depth found by picking the top scorer.

Run: python3 scripts/gen_ch44_voting_regressor.py
Writes: public/images/ch44-base-vs-voting-r2.png
        public/images/ch44-hyperparam-diversity.png
Also prints the weighted-voting grid-search table used in the post text.
"""

import matplotlib.pyplot as plt
import numpy as np
from itertools import product
from sklearn.datasets import fetch_california_housing
from sklearn.ensemble import VotingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor

RS = 42

data = fetch_california_housing()
Xfull, yfull = data.data, data.target
# Subsample for runtime: SVR's training cost grows steeply with rows, and this
# script fits dozens of SVRs across CV folds and a 27-point weight grid search.
# 3,000 rows keeps every number a real sklearn fit on real data, just faster.
rng = np.random.RandomState(RS)
idx = rng.choice(len(Xfull), size=3000, replace=False)
X, y = Xfull[idx], yfull[idx]
print(f"Dataset: {X.shape[0]} rows (subsampled from {Xfull.shape[0]}), {X.shape[1]} columns", flush=True)

Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=RS)
scaler = StandardScaler().fit(Xtr)
Xtr_s, Xte_s = scaler.transform(Xtr), scaler.transform(Xte)

# --- Chart 1: base models vs voting regressor, 10-fold CV R2 --------------
lr = LinearRegression()
svr = SVR(kernel="rbf", C=5)
tree = DecisionTreeRegressor(max_depth=6, random_state=RS)

estimators = [("lr", lr), ("svr", svr), ("tree", tree)]
vote = VotingRegressor(estimators=estimators)

# scale once, up front, for a fair CV comparison across all four models
X_s = scaler.transform(X)

names = ["Linear\nRegression", "SVR", "Decision\nTree", "Voting\nRegressor"]
models = [lr, svr, tree, vote]
scores = [cross_val_score(m, X_s, y, cv=10, scoring="r2").mean() for m in models]

print("\nChart 1 -- California housing, 10-fold CV R2")
for n, s in zip(names, scores):
    print(f"  {n.replace(chr(10), ' '):18s} {s:.4f}")

colors = ["#9ca3af", "#9ca3af", "#9ca3af", "#2563eb"]
fig, ax = plt.subplots(figsize=(7.5, 5), dpi=300)
bars = ax.bar(names, scores, color=colors, edgecolor="#111827", linewidth=0.5, width=0.6)
for b, s in zip(bars, scores):
    ax.text(b.get_x() + b.get_width() / 2, s + 0.012, f"{s:.3f}", ha="center", fontsize=10)
ax.set_ylim(0, max(scores) + 0.15)
ax.set_ylabel("10-fold CV R2")
ax.set_title("Base models vs voting regressor (California housing)")
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch44-base-vs-voting-r2.png", bbox_inches="tight")
plt.close()

# --- Weighted voting grid search (printed as a table, not a chart) --------
print("\nTable -- weighted voting grid search (California housing, 5-fold CV)")
base_scores = {
    name: cross_val_score(m, X_s, y, cv=5, scoring="r2").mean() for name, m in estimators
}
for name, s in base_scores.items():
    print(f"  base {name:5s} {s:.4f}")

results = []
for w1, w2, w3 in product(range(1, 4), repeat=3):
    vc = VotingRegressor(estimators=estimators, weights=[w1, w2, w3])
    s = cross_val_score(vc, X_s, y, cv=5, scoring="r2").mean()
    results.append(((w1, w2, w3), s))
results.sort(key=lambda r: -r[1])

print("  top 5 weight combos (lr, svr, tree):")
for weights, s in results[:5]:
    print(f"    {weights}  {s:.4f}")
equal = next(s for w, s in results if w == (1, 1, 1))
print(f"  equal weights (1,1,1): {equal:.4f}")

# --- Chart 2: hyperparameter diversity instead of algorithm diversity -----
depths = [2, 4, 6, 8, 12]
tree_estimators = [(f"tree_d{d}", DecisionTreeRegressor(max_depth=d, random_state=RS)) for d in depths]

depth_scores = []
for name, m in tree_estimators:
    m.fit(Xtr_s, ytr)
    depth_scores.append(m.score(Xte_s, yte))

vote_trees = VotingRegressor(estimators=tree_estimators)
vote_trees.fit(Xtr_s, ytr)
vote_depth_score = vote_trees.score(Xte_s, yte)

print("\nChart 2 -- decision tree max_depth diversity (California housing, held-out test)")
for d, s in zip(depths, depth_scores):
    print(f"  max_depth {d}: {s:.4f}")
print(f"  best single depth: {max(depth_scores):.4f}")
print(f"  voting across all 5: {vote_depth_score:.4f}")

bar_labels = [f"depth {d}" for d in depths] + ["Voting\n(all 5)"]
bar_scores = depth_scores + [vote_depth_score]
bar_colors = ["#9ca3af"] * len(depths) + ["#2563eb"]

fig, ax = plt.subplots(figsize=(7.5, 5), dpi=300)
bars = ax.bar(bar_labels, bar_scores, color=bar_colors, edgecolor="#111827", linewidth=0.5, width=0.6)
for b, s in zip(bars, bar_scores):
    ax.text(b.get_x() + b.get_width() / 2, s + 0.012, f"{s:.3f}", ha="center", fontsize=10)
ax.set_ylim(0, max(bar_scores) + 0.15)
ax.set_ylabel("Held-out test R2")
ax.set_title("Same algorithm, different hyperparameters, as base learners")
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch44-hyperparam-diversity.png", bbox_inches="tight")
plt.close()

print("\nDone.")
