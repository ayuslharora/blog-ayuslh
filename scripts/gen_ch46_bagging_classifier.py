"""Generate the bagging-classifier code charts for Ch.46.

CampusX 100-days-of-ML, video #107: the code follow-up to Ch.45's intuition
video. Walks the sklearn `BaggingClassifier`, the four variants (bagging,
pasting, random subspaces, random patches), the out-of-bag score, and
hyperparameter tuning with RandomizedSearchCV. No matching notebook exists
in the campusx-official/100-days-of-machine-learning repo (the ensemble days
aren't uploaded there), so every number and chart below is a fresh sklearn
run rather than lifted from the video.

Chart 1 (ch46-single-vs-bagging-boundary.png): one fully-grown decision tree
(jagged, overfit) vs a 500-tree BaggingClassifier on the same noisy 2-D set.

Chart 2 (ch46-oob-vs-test.png): the out-of-bag score tracks the held-out
test accuracy closely as n_estimators grows, which is why oob_score_ works
as a free validation estimate.

Chart 3 (ch46-variants-comparison.png): single tree vs bagging vs pasting vs
random subspaces vs random patches, 10-fold CV accuracy on a 10k-row,
20-feature synthetic classification set.

Run: python3 scripts/gen_ch46_bagging_classifier.py
Writes: public/images/ch46-single-vs-bagging-boundary.png
        public/images/ch46-oob-vs-test.png
        public/images/ch46-variants-comparison.png
Also prints the numbers quoted in the post prose.
"""

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import make_classification, make_moons
from sklearn.ensemble import BaggingClassifier
from sklearn.model_selection import RandomizedSearchCV, cross_val_score, train_test_split
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

RS = 42
BLUE = "#2563eb"
GREY = "#9ca3af"
cmap_bg = plt.cm.RdBu

# ---------------------------------------------------------------------------
# Chart 1: single fully-grown tree vs bagging, decision boundary
# ---------------------------------------------------------------------------
Xm, ym = make_moons(n_samples=500, noise=0.35, random_state=RS)
Xm_tr, Xm_te, ym_tr, ym_te = train_test_split(Xm, ym, test_size=0.3, random_state=RS)

xx, yy = np.meshgrid(
    np.linspace(Xm[:, 0].min() - 0.5, Xm[:, 0].max() + 0.5, 400),
    np.linspace(Xm[:, 1].min() - 0.5, Xm[:, 1].max() + 0.5, 400),
)
grid = np.c_[xx.ravel(), yy.ravel()]

tree = DecisionTreeClassifier(random_state=RS).fit(Xm_tr, ym_tr)
bag = BaggingClassifier(
    estimator=DecisionTreeClassifier(),
    n_estimators=500,
    max_samples=0.25,
    bootstrap=True,
    random_state=RS,
    n_jobs=-1,
).fit(Xm_tr, ym_tr)

fig, axes = plt.subplots(1, 2, figsize=(11, 4.4), dpi=300)
for ax, model, name in [
    (axes[0], tree, "Single decision tree"),
    (axes[1], bag, "BaggingClassifier, 500 trees"),
]:
    zz = model.predict(grid).reshape(xx.shape)
    ax.contourf(xx, yy, zz, alpha=0.35, cmap=cmap_bg, levels=1)
    ax.scatter(Xm_tr[:, 0], Xm_tr[:, 1], c=ym_tr, cmap=cmap_bg,
               edgecolors="k", linewidths=0.4, s=18)
    tr = model.score(Xm_tr, ym_tr)
    te = model.score(Xm_te, ym_te)
    ax.set_title(f"{name}\ntrain {tr:.3f}  /  test {te:.3f}", fontsize=11)
    ax.set_xticks([])
    ax.set_yticks([])
fig.tight_layout()
fig.savefig("public/images/ch46-single-vs-bagging-boundary.png", bbox_inches="tight")
plt.close(fig)
tree_te, bag_te = tree.score(Xm_te, ym_te), bag.score(Xm_te, ym_te)

# ---------------------------------------------------------------------------
# Chart 2: OOB score vs held-out test accuracy across n_estimators
# ---------------------------------------------------------------------------
Xc, yc = make_classification(
    n_samples=10_000, n_features=20, n_informative=8, n_redundant=4,
    n_classes=2, flip_y=0.05, class_sep=0.8, random_state=RS,
)
Xc_tr, Xc_te, yc_tr, yc_te = train_test_split(Xc, yc, test_size=0.2, random_state=RS)

ns = [5, 10, 20, 40, 80, 150, 300, 500]
oob, test = [], []
for n in ns:
    m = BaggingClassifier(
        estimator=DecisionTreeClassifier(),
        n_estimators=n,
        max_samples=0.25,
        bootstrap=True,
        oob_score=True,
        random_state=RS,
        n_jobs=-1,
    ).fit(Xc_tr, yc_tr)
    oob.append(m.oob_score_)
    test.append(m.score(Xc_te, yc_te))

fig, ax = plt.subplots(figsize=(7, 4.4), dpi=300)
ax.plot(ns, oob, "o-", color=BLUE, lw=2, ms=5, label="oob_score_ (never trained on)")
ax.plot(ns, test, "s--", color=GREY, lw=2, ms=5, label="held-out test accuracy")
ax.set_xlabel("n_estimators")
ax.set_ylabel("accuracy")
ax.set_title("The out-of-bag score tracks the test score", fontsize=11, fontweight="bold")
ax.legend(fontsize=9)
ax.grid(alpha=0.25)
fig.tight_layout()
fig.savefig("public/images/ch46-oob-vs-test.png", bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------------------
# Chart 3: the four variants vs a single tree, 10-fold CV
# ---------------------------------------------------------------------------
base = DecisionTreeClassifier(random_state=RS)
variants = {
    "Single tree": base,
    "Bagging": BaggingClassifier(
        estimator=DecisionTreeClassifier(), n_estimators=300,
        max_samples=0.25, bootstrap=True, random_state=RS, n_jobs=-1),
    "Pasting": BaggingClassifier(
        estimator=DecisionTreeClassifier(), n_estimators=300,
        max_samples=0.25, bootstrap=False, random_state=RS, n_jobs=-1),
    "Random\nSubspaces": BaggingClassifier(
        estimator=DecisionTreeClassifier(), n_estimators=300,
        max_samples=1.0, bootstrap=False,
        max_features=0.5, bootstrap_features=True, random_state=RS, n_jobs=-1),
    "Random\nPatches": BaggingClassifier(
        estimator=DecisionTreeClassifier(), n_estimators=300,
        max_samples=0.25, bootstrap=True,
        max_features=0.5, bootstrap_features=True, random_state=RS, n_jobs=-1),
}
scores = {k: cross_val_score(v, Xc, yc, cv=10, scoring="accuracy").mean()
          for k, v in variants.items()}

fig, ax = plt.subplots(figsize=(8, 4.4), dpi=300)
labels = list(scores.keys())
vals = [scores[k] for k in labels]
colors = [GREY] + [BLUE] * 4
bars = ax.bar(labels, vals, color=colors, alpha=0.85, width=0.6)
for b, v in zip(bars, vals):
    ax.text(b.get_x() + b.get_width() / 2, v + 0.003, f"{v:.3f}",
            ha="center", fontsize=9)
ax.set_ylabel("10-fold CV accuracy")
ax.set_ylim(min(vals) - 0.04, max(vals) + 0.03)
ax.set_title("Four ways to sample the subset", fontsize=11, fontweight="bold")
ax.grid(alpha=0.25, axis="y")
fig.tight_layout()
fig.savefig("public/images/ch46-variants-comparison.png", bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------------------
# Printed extras: bagging an SVM, in-bag fraction, RandomizedSearchCV
# ---------------------------------------------------------------------------
svm = SVC(kernel="rbf", C=1).fit(Xc_tr, yc_tr)
bag_svm = BaggingClassifier(
    estimator=SVC(kernel="rbf", C=1), n_estimators=50,
    max_samples=0.25, bootstrap=True, random_state=RS, n_jobs=-1,
).fit(Xc_tr, yc_tr)

bag_for_samples = BaggingClassifier(
    estimator=DecisionTreeClassifier(), n_estimators=10,
    max_samples=1.0, bootstrap=True, random_state=RS,
).fit(Xc_tr, yc_tr)
uniq = np.mean([len(np.unique(s)) / len(Xc_tr) for s in bag_for_samples.estimators_samples_])

param_dist = {
    "n_estimators": [50, 100, 300, 500],
    "max_samples": [0.1, 0.25, 0.4, 0.5, 0.7, 1.0],
    "bootstrap": [True, False],
    "max_features": [0.5, 0.7, 1.0],
    "bootstrap_features": [True, False],
}
search = RandomizedSearchCV(
    BaggingClassifier(estimator=DecisionTreeClassifier(), random_state=RS, n_jobs=-1),
    param_distributions=param_dist, n_iter=25, cv=5,
    scoring="accuracy", random_state=RS, n_jobs=-1,
).fit(Xc_tr, yc_tr)

print("=== Chart 1 (moons, noise=0.35) ===")
print(f"single tree  : train {tree.score(Xm_tr, ym_tr):.3f}  test {tree_te:.3f}")
print(f"bagging 500  : train {bag.score(Xm_tr, ym_tr):.3f}  test {bag_te:.3f}")
print("=== Chart 2 (oob vs test) ===")
for n, o, t in zip(ns, oob, test):
    print(f"  n={n:4d}  oob={o:.4f}  test={t:.4f}")
print("=== Chart 3 (10-fold CV) ===")
for k, v in scores.items():
    print(f"  {k.replace(chr(10), ' '):18s} {v:.4f}")
print("=== extras ===")
print(f"single SVM test        : {svm.score(Xc_te, yc_te):.4f}")
print(f"bagged SVM (50) test   : {bag_svm.score(Xc_te, yc_te):.4f}")
print(f"mean unique rows / tree (bootstrap, max_samples=1.0): {uniq:.3f}")
print(f"RandomizedSearchCV best score : {search.best_score_:.4f}")
print(f"RandomizedSearchCV best params: {search.best_params_}")
print(f"plain bagging test for reference: {bag.score(Xc_te, yc_te) if Xc_te.shape[1]==Xm_te.shape[1] else 'n/a (diff dims)'}")
