"""Generate the margin-comparison and max-margin-hyperplane charts for Ch.32.

No usable transcript/notebook existed for this video (the auto-transcript was
too corrupted to use); the post is instead based on the user's own notes plus
a whiteboard screenshot from the video. This script builds a real, from-first-
principles illustration of the same concept the whiteboard sketch showed: two
arbitrary separating lines with different margins, then the actual maximum-
margin hyperplane found by fitting a linear SVM.

Run: python3 scripts/gen_ch32_svm_margin.py
Writes: public/images/ch32-svm-margin-comparison.png
        public/images/ch32-svm-max-margin.png
"""

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import make_blobs
from sklearn.svm import SVC

X, y = make_blobs(n_samples=22, centers=[(-3, 2.5), (3, -2.5)], cluster_std=1.3, random_state=3)

# --- Chart 1: two candidate separating lines, different margins -------------
fig, ax = plt.subplots(figsize=(7, 6), dpi=300)
ax.scatter(X[y == 0, 0], X[y == 0, 1], marker="x", color="#dc2626", s=90, linewidths=2, label="class 0")
ax.scatter(X[y == 1, 0], X[y == 1, 1], marker="+", color="#16a34a", s=110, linewidths=2, label="class 1")

x_line = np.linspace(X[:, 0].min() - 1, X[:, 0].max() + 1, 100)
# pi_1: hugs close to class 1's nearest points (small margin, still a valid separator)
y_pi1 = -1.0 * x_line + 0.2
# pi_2: sits centered between both clusters (larger margin)
y_pi2 = -1.0 * x_line - 1.2

ax.plot(x_line, y_pi1, color="#111827", linewidth=2, label=r"$\pi_1$ (small margin)")
ax.plot(x_line, y_pi2, color="#2563eb", linewidth=2, label=r"$\pi_2$ (larger margin)")
ax.set_xlim(X[:, 0].min() - 1, X[:, 0].max() + 1)
ax.set_ylim(X[:, 1].min() - 1, X[:, 1].max() + 1)
ax.legend(frameon=False, loc="lower right")
ax.set_xticks([])
ax.set_yticks([])
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch32-svm-margin-comparison.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch32-svm-margin-comparison.png")

# --- Chart 2: the actual maximum-margin hyperplane via linear SVM -----------
clf = SVC(kernel="linear", C=1000)
clf.fit(X, y)

w = clf.coef_[0]
b = clf.intercept_[0]
margin = 1 / np.linalg.norm(w)
print(f"w={w}, b={b}, margin (each side)={margin:.3f}, full margin width={2*margin:.3f}")

x_plot = np.linspace(X[:, 0].min() - 1, X[:, 0].max() + 1, 100)
y_boundary = -(w[0] * x_plot + b) / w[1]
y_margin_pos = -(w[0] * x_plot + b - 1) / w[1]
y_margin_neg = -(w[0] * x_plot + b + 1) / w[1]

fig, ax = plt.subplots(figsize=(7, 6), dpi=300)
ax.scatter(X[y == 0, 0], X[y == 0, 1], marker="x", color="#dc2626", s=90, linewidths=2, label="class 0")
ax.scatter(X[y == 1, 0], X[y == 1, 1], marker="+", color="#16a34a", s=110, linewidths=2, label="class 1")
ax.scatter(
    X[clf.support_, 0], X[clf.support_, 1],
    s=280, facecolors="none", edgecolors="#f59e0b", linewidths=2, label="support vectors", zorder=5,
)
ax.plot(x_plot, y_boundary, color="#2563eb", linewidth=2.5, label="max-margin hyperplane")
ax.plot(x_plot, y_margin_pos, color="#2563eb", linewidth=1.2, linestyle="--")
ax.plot(x_plot, y_margin_neg, color="#2563eb", linewidth=1.2, linestyle="--")
ax.set_xlim(X[:, 0].min() - 1, X[:, 0].max() + 1)
ax.set_ylim(X[:, 1].min() - 1, X[:, 1].max() + 1)
ax.set_title(f"margin width (d) = {2*margin:.2f}", fontsize=12)
ax.legend(frameon=False, loc="lower right")
ax.set_xticks([])
ax.set_yticks([])
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch32-svm-max-margin.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch32-svm-max-margin.png")
