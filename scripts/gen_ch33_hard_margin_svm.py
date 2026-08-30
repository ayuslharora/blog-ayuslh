"""Generate the hard-margin SVM diagram for Ch.33.

No usable transcript/notebook existed for this video either (auto-transcript
too corrupted); this illustrates the math derived in the post directly: the
decision hyperplane w.x+b=0, the two supporting hyperplanes w.x+b=+-1, the
support vectors sitting exactly on them, and the margin width 2/||w||.

Run: python3 scripts/gen_ch33_hard_margin_svm.py
Writes: public/images/ch33-hard-margin-svm.png
"""

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import make_blobs
from sklearn.svm import SVC

X, y = make_blobs(n_samples=22, centers=[(-3, 2.5), (3, -2.5)], cluster_std=1.3, random_state=3)

clf = SVC(kernel="linear", C=1000)
clf.fit(X, y)

w = clf.coef_[0]
b = clf.intercept_[0]
margin = 1 / np.linalg.norm(w)
print(f"w={w}, b={b}, ||w||={np.linalg.norm(w):.3f}, margin width 2/||w||={2*margin:.3f}")

x_plot = np.linspace(X[:, 0].min() - 1, X[:, 0].max() + 1, 100)
y_boundary = -(w[0] * x_plot + b) / w[1]
y_pos = -(w[0] * x_plot + b - 1) / w[1]
y_neg = -(w[0] * x_plot + b + 1) / w[1]

fig, ax = plt.subplots(figsize=(7, 6), dpi=300)
ax.scatter(X[y == 0, 0], X[y == 0, 1], marker="x", color="#dc2626", s=90, linewidths=2, label="class $y=-1$")
ax.scatter(X[y == 1, 0], X[y == 1, 1], marker="+", color="#16a34a", s=110, linewidths=2, label="class $y=+1$")
ax.scatter(
    X[clf.support_, 0], X[clf.support_, 1],
    s=280, facecolors="none", edgecolors="#f59e0b", linewidths=2, label="support vectors", zorder=5,
)

ax.plot(x_plot, y_boundary, color="#2563eb", linewidth=2.5, label=r"$w \cdot x + b = 0$")
ax.plot(x_plot, y_pos, color="#111827", linewidth=1.5, linestyle="--", label=r"$w \cdot x + b = +1$")
ax.plot(x_plot, y_neg, color="#111827", linewidth=1.5, linestyle="--", label=r"$w \cdot x + b = -1$")

ax.set_xlim(X[:, 0].min() - 1, X[:, 0].max() + 1)
ax.set_ylim(X[:, 1].min() - 1, X[:, 1].max() + 1)
ax.set_title(f"margin width = 2/||w|| = {2*margin:.2f}", fontsize=12)
ax.legend(frameon=False, loc="lower right", fontsize=9)
ax.set_xticks([])
ax.set_yticks([])
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch33-hard-margin-svm.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch33-hard-margin-svm.png")
