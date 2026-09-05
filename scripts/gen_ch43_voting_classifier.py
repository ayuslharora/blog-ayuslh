"""Generate the voting-classifier code charts for Ch.43.

CampusX 100-days-of-ML, video #104: the code follow-up to Ch.42's intuition
video. Covers sklearn's VotingClassifier (hard vs soft voting), weighted
voting as a hyperparameter, and using different hyperparameters of the SAME
algorithm as an alternative source of ensemble diversity. No matching
notebook was found in the campusx-official/100-days-of-machine-learning repo
(the ensemble-learning days aren't uploaded there), so all numbers below are
computed fresh with real sklearn runs rather than lifted from the video.

Chart 1: individual base models (logistic regression, KNN, random forest) vs
hard-voting them vs soft-voting them, 10-fold CV accuracy on Iris (all 3
classes, all 4 features).

Chart 2: same algorithm (SVM, polynomial kernel), five different degrees, as
base learners for a voting ensemble, vs the single best degree found by
picking the top scorer.

Run: python3 scripts/gen_ch43_voting_classifier.py
Writes: public/images/ch43-hard-vs-soft-cv.png
        public/images/ch43-hyperparam-diversity.png
Also prints the weighted-voting grid-search table used in the post text.
"""

import matplotlib.pyplot as plt
import numpy as np
from itertools import product
from sklearn.datasets import make_classification, make_moons
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC

RS = 42

# --- Chart 1: hard vs soft voting on a moderately hard synthetic set ------
# (Iris is near-perfectly separable, so voting has no headroom to show any
# effect there -- a noisier, more overlapping dataset is what actually
# demonstrates the hard/soft/individual gap.)
X, y = make_classification(
    n_samples=700, n_features=12, n_informative=5, n_redundant=3,
    n_classes=2, class_sep=0.6, flip_y=0.06, random_state=RS,
)

lr = LogisticRegression(max_iter=1000)
knn = KNeighborsClassifier()
rf = RandomForestClassifier(random_state=RS, n_estimators=100)

estimators = [("lr", lr), ("knn", knn), ("rf", rf)]
hard = VotingClassifier(estimators=estimators, voting="hard")
soft = VotingClassifier(estimators=estimators, voting="soft")

names = ["Logistic\nRegression", "KNN", "Random\nForest", "Hard\nVoting", "Soft\nVoting"]
models = [lr, knn, rf, hard, soft]
scores = [cross_val_score(m, X, y, cv=10, scoring="accuracy").mean() for m in models]

print("Chart 1 -- synthetic classification, 10-fold CV accuracy")
for n, s in zip(names, scores):
    print(f"  {n.replace(chr(10), ' '):18s} {s:.4f}")

colors = ["#9ca3af", "#9ca3af", "#9ca3af", "#2563eb", "#1d4ed8"]
fig, ax = plt.subplots(figsize=(7.5, 5), dpi=300)
bars = ax.bar(names, scores, color=colors, edgecolor="#111827", linewidth=0.5, width=0.6)
for b, s in zip(bars, scores):
    ax.text(b.get_x() + b.get_width() / 2, s + 0.006, f"{s:.3f}", ha="center", fontsize=10)
ax.set_ylim(0.55, 0.9)
ax.set_ylabel("10-fold CV accuracy")
ax.set_title("Individual models vs hard vs soft voting")
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch43-hard-vs-soft-cv.png", bbox_inches="tight")
plt.close()

# --- Weighted voting grid search (printed as a table, not a chart) --------
Xw, yw = make_classification(
    n_samples=1200, n_features=20, n_informative=8, n_redundant=4,
    n_classes=2, class_sep=0.8, random_state=RS,
)
w_lr = LogisticRegression(max_iter=1000)
w_knn = KNeighborsClassifier()
w_rf = RandomForestClassifier(random_state=RS)
w_estimators = [("lr", w_lr), ("knn", w_knn), ("rf", w_rf)]

print("\nChart/Table 2 -- weighted soft voting grid search (make_classification)")
base_scores = {
    name: cross_val_score(m, Xw, yw, cv=5, scoring="accuracy").mean()
    for name, m in w_estimators
}
for name, s in base_scores.items():
    print(f"  base {name:4s} {s:.4f}")

results = []
for w1, w2, w3 in product(range(1, 4), repeat=3):
    vc = VotingClassifier(estimators=w_estimators, voting="soft", weights=[w1, w2, w3])
    s = cross_val_score(vc, Xw, yw, cv=5, scoring="accuracy").mean()
    results.append(((w1, w2, w3), s))
results.sort(key=lambda r: -r[1])

print("  top 5 weight combos (lr, knn, rf):")
for weights, s in results[:5]:
    print(f"    {weights}  {s:.4f}")
equal = next(s for w, s in results if w == (1, 1, 1))
print(f"  equal weights (1,1,1): {equal:.4f}")

# --- Chart 2: hyperparameter diversity instead of algorithm diversity -----
Xd, yd = make_moons(n_samples=600, noise=0.35, random_state=RS)
Xd_train, Xd_test, yd_train, yd_test = train_test_split(
    Xd, yd, test_size=0.3, random_state=RS, stratify=yd
)

degrees = [1, 2, 3, 4, 5]
svm_estimators = [(f"svm_d{d}", SVC(kernel="poly", degree=d, probability=True, random_state=RS)) for d in degrees]

deg_scores = []
for name, m in svm_estimators:
    m.fit(Xd_train, yd_train)
    deg_scores.append(m.score(Xd_test, yd_test))

vote_svm = VotingClassifier(estimators=svm_estimators, voting="soft")
vote_svm.fit(Xd_train, yd_train)
vote_score = vote_svm.score(Xd_test, yd_test)

print("\nChart 2 -- SVM poly degree diversity (moons, held-out test)")
for d, s in zip(degrees, deg_scores):
    print(f"  degree {d}: {s:.4f}")
print(f"  best single degree: {max(deg_scores):.4f}")
print(f"  voting across all 5: {vote_score:.4f}")

bar_labels = [f"degree {d}" for d in degrees] + ["Voting\n(all 5)"]
bar_scores = deg_scores + [vote_score]
bar_colors = ["#9ca3af"] * len(degrees) + ["#2563eb"]

fig, ax = plt.subplots(figsize=(7.5, 5), dpi=300)
bars = ax.bar(bar_labels, bar_scores, color=bar_colors, edgecolor="#111827", linewidth=0.5, width=0.6)
for b, s in zip(bars, bar_scores):
    ax.text(b.get_x() + b.get_width() / 2, s + 0.006, f"{s:.3f}", ha="center", fontsize=10)
ax.set_ylim(0.6, 1.0)
ax.set_ylabel("Held-out test accuracy")
ax.set_title("Same algorithm, different hyperparameters, as base learners")
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch43-hyperparam-diversity.png", bbox_inches="tight")
plt.close()

print("\nDone.")
