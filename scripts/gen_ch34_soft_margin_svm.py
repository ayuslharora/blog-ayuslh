"""Generate the soft-margin SVM diagram for Ch.34.

The source auto-transcript for this video was too corrupted to use directly
(same issue as ch33); this instead illustrates the math derived in the post:
overlapping classes that hard margin cannot separate, slack variables letting
points sit inside the margin or cross it, and the C tradeoff between margin
width and how many violations get tolerated.

Run: python3 scripts/gen_ch34_soft_margin_svm.py
Writes: public/images/ch34-soft-margin-svm.png
"""

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import make_blobs
from sklearn.svm import SVC

X, y = make_blobs(n_samples=40, centers=[(-1.5, 1), (1.5, -1)], cluster_std=2.1, random_state=7)

fig, axes = plt.subplots(1, 2, figsize=(12, 6), dpi=300, sharex=True, sharey=True)

for ax, C in zip(axes, [0.05, 20]):
    clf = SVC(kernel="linear", C=C)
    clf.fit(X, y)

    w = clf.coef_[0]
    b = clf.intercept_[0]
    margin = 2 / np.linalg.norm(w)

    decision = clf.decision_function(X)
    violations = np.abs(decision) < 1 - 1e-6
    correct_side = (decision > 0) == (y == 1)
    slack_points = violations | ~correct_side

    x_plot = np.linspace(X[:, 0].min() - 1, X[:, 0].max() + 1, 100)
    y_boundary = -(w[0] * x_plot + b) / w[1]
    y_pos = -(w[0] * x_plot + b - 1) / w[1]
    y_neg = -(w[0] * x_plot + b + 1) / w[1]

    ax.scatter(X[(y == 0) & ~slack_points, 0], X[(y == 0) & ~slack_points, 1], marker="x", color="#dc2626", s=80, linewidths=2)
    ax.scatter(X[(y == 1) & ~slack_points, 0], X[(y == 1) & ~slack_points, 1], marker="+", color="#16a34a", s=100, linewidths=2)
    ax.scatter(X[(y == 0) & slack_points, 0], X[(y == 0) & slack_points, 1], marker="x", color="#dc2626", s=80, linewidths=2)
    ax.scatter(X[(y == 1) & slack_points, 0], X[(y == 1) & slack_points, 1], marker="+", color="#16a34a", s=100, linewidths=2)
    ax.scatter(
        X[slack_points, 0], X[slack_points, 1],
        s=260, facecolors="none", edgecolors="#f59e0b", linewidths=2, zorder=5,
        label=r"$\xi_i > 0$ (inside margin or misclassified)",
    )

    ax.plot(x_plot, y_boundary, color="#2563eb", linewidth=2.5, label=r"$w \cdot x + b = 0$")
    ax.plot(x_plot, y_pos, color="#111827", linewidth=1.5, linestyle="--")
    ax.plot(x_plot, y_neg, color="#111827", linewidth=1.5, linestyle="--")

    ax.set_title(f"C = {C}  →  margin = {margin:.2f}, {slack_points.sum()} points with slack", fontsize=10)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)

axes[0].legend(frameon=False, loc="lower left", fontsize=8)
axes[0].set_ylabel("small C: wider margin, more violations tolerated", fontsize=9)
axes[1].set_ylabel("large C: narrower margin, violations punished harder", fontsize=9)
axes[1].yaxis.set_label_position("right")

plt.tight_layout()
plt.savefig("public/images/ch34-soft-margin-svm.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch34-soft-margin-svm.png")
