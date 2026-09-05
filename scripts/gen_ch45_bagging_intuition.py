"""Generate the bagging-intuition charts for Ch.45.

CampusX 100-days-of-ML, video #106: "Bagging Ensemble | Introduction and
Intuition". First of a three-part bagging sub-block (this = intuition,
#107 = classifier in code, #108 = regressor in code). No companion notebook
exists in the campusx-official/100-days-of-machine-learning repo (the
ensemble-learning days aren't uploaded there), so every number and chart
below comes from running scikit-learn fresh.

Chart 1 (ch45-variance-reduction.png): as the number of bagged trees grows,
held-out accuracy rises then plateaus, and the instability of the ensemble's
predictions (how often a point's predicted label flips across independently
resampled ensembles) collapses toward zero. The bias stays put; only the
variance is being bought down.

Chart 2 (ch45-single-vs-bagging-spread.png): a single fully-grown tree vs a
500-tree bagging ensemble, each retrained on 25 different random train/test
splits of the same data. Bagging lifts the median accuracy AND tightens the
spread, which is the "robustness" claim made concrete.

Run: python3 scripts/gen_ch45_bagging_intuition.py
Writes: public/images/ch45-variance-reduction.png
        public/images/ch45-single-vs-bagging-spread.png
Also prints the numbers quoted in the post prose.
"""

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import make_moons
from sklearn.ensemble import BaggingClassifier
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

BLUE = "#2563eb"
GREY = "#9ca3af"
RED = "#dc2626"

# ---------------------------------------------------------------------------
# Chart 1: accuracy up, prediction instability down, as n_estimators grows
# ---------------------------------------------------------------------------
X, y = make_moons(n_samples=400, noise=0.4, random_state=7)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.5, random_state=7)

ns = [1, 2, 3, 5, 8, 12, 20, 35, 60, 100, 160, 250]
N_ENSEMBLES = 15  # independent bagging ensembles per n, for the instability metric

acc_mean, acc_lo, acc_hi, instability = [], [], [], []
for n in ns:
    accs, te_preds = [], []
    for s in range(N_ENSEMBLES):
        clf = BaggingClassifier(
            estimator=DecisionTreeClassifier(),  # fully grown: low bias, high variance
            n_estimators=n,
            max_samples=1.0,
            bootstrap=True,
            random_state=s,
        ).fit(X_tr, y_tr)
        accs.append(clf.score(X_te, y_te))
        te_preds.append(clf.predict(X_te))
    accs = np.array(accs)
    te_preds = np.array(te_preds)  # (N_ENSEMBLES, n_test)
    # instability: mean over test points of the fraction of ensembles that
    # disagree with the per-point majority label. 0 => every ensemble agrees.
    maj = (te_preds.mean(axis=0) >= 0.5).astype(int)
    flip = (te_preds != maj).mean(axis=0).mean()
    acc_mean.append(accs.mean())
    acc_lo.append(accs.min())
    acc_hi.append(accs.max())
    instability.append(flip)

single_acc = np.mean([
    DecisionTreeClassifier(random_state=s).fit(X_tr, y_tr).score(X_te, y_te)
    for s in range(N_ENSEMBLES)
])

fig, ax = plt.subplots(1, 2, figsize=(12, 4.4), dpi=300)

ax[0].fill_between(ns, acc_lo, acc_hi, color=BLUE, alpha=0.15, linewidth=0)
ax[0].plot(ns, acc_mean, "o-", color=BLUE, lw=2, ms=4, label="bagging ensemble")
ax[0].axhline(single_acc, color=RED, ls="--", lw=1.5, label="single fully-grown tree")
ax[0].set_xscale("log")
ax[0].set_xlabel("number of trees in the ensemble")
ax[0].set_ylabel("held-out accuracy")
ax[0].set_title("Accuracy rises, then plateaus", fontsize=11, fontweight="bold")
ax[0].legend(fontsize=9, loc="lower right")
ax[0].grid(alpha=0.25)

ax[1].plot(ns, instability, "o-", color=BLUE, lw=2, ms=4)
ax[1].set_xscale("log")
ax[1].set_xlabel("number of trees in the ensemble")
ax[1].set_ylabel("prediction instability")
ax[1].set_title("Variance is bought down", fontsize=11, fontweight="bold")
ax[1].grid(alpha=0.25)

fig.tight_layout()
fig.savefig("public/images/ch45-variance-reduction.png", bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------------------
# Chart 2: spread of accuracy across 25 resampled train/test splits
# ---------------------------------------------------------------------------
single_scores, bag_scores = [], []
for s in range(25):
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.4, random_state=s)
    single_scores.append(
        DecisionTreeClassifier(random_state=0).fit(Xtr, ytr).score(Xte, yte)
    )
    bag_scores.append(
        BaggingClassifier(
            estimator=DecisionTreeClassifier(),
            n_estimators=500,
            max_samples=0.5,
            bootstrap=True,
            random_state=0,
            n_jobs=-1,
        ).fit(Xtr, ytr).score(Xte, yte)
    )
single_scores = np.array(single_scores)
bag_scores = np.array(bag_scores)

fig, ax = plt.subplots(figsize=(7, 4.4), dpi=300)
data = [single_scores, bag_scores]
labels = ["single fully-grown tree", "bagging, 500 trees"]
colors = [GREY, BLUE]
bp = ax.boxplot(data, tick_labels=labels, widths=0.5, patch_artist=True,
                medianprops=dict(color="black", lw=1.5))
for patch, c in zip(bp["boxes"], colors):
    patch.set_facecolor(c)
    patch.set_alpha(0.35)
for i, d in enumerate(data):
    jitter = np.random.default_rng(1).normal(0, 0.04, len(d))
    ax.scatter(np.full(len(d), i + 1) + jitter, d, color=colors[i], s=16, zorder=3)
ax.set_ylabel("held-out accuracy")
ax.set_title("Same data, 25 different train/test splits", fontsize=11, fontweight="bold")
ax.grid(alpha=0.25, axis="y")
fig.tight_layout()
fig.savefig("public/images/ch45-single-vs-bagging-spread.png", bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------------------
print("=== Chart 1 ===")
print(f"single fully-grown tree, mean held-out acc: {single_acc:.3f}")
for n, a, ins in zip(ns, acc_mean, instability):
    print(f"  n={n:4d}  acc={a:.3f}  instability={ins:.3f}")
print("=== Chart 2 ===")
print(f"single tree : median={np.median(single_scores):.3f}  "
      f"std={single_scores.std():.3f}  min={single_scores.min():.3f}  max={single_scores.max():.3f}")
print(f"bagging 500 : median={np.median(bag_scores):.3f}  "
      f"std={bag_scores.std():.3f}  min={bag_scores.min():.3f}  max={bag_scores.max():.3f}")
