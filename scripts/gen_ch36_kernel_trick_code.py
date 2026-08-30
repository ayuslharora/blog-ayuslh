"""Generate the kernel-trick-in-code diagrams for Ch.36.

The source auto-transcript for this video was too garbled to draft from
directly (see ch36.txt), and unlike ch35/ch33/ch34 there is no matching
notebook in the campusx-official/100-days-of-machine-learning repo either
(the repo has no SVM days at all). This instead runs the real demo the
transcript gestures at, with genuine sklearn output:

1. make_circles data: a linear SVM fails on it (real accuracy, real
   decision boundary).
2. Manually engineering z = x1^2 + x2^2 as a third feature and fitting a
   linear SVM in 3D separates it perfectly, same idea as ch35's picture,
   now backed by an actual classifier.
3. Passing kernel="rbf" straight to SVC on the original 2D features
   reproduces that curved boundary without ever building the z feature by
   hand, this is "the trick".
4. A polynomial-kernel degree sweep on a harder (moons) dataset showing
   that higher degree does not mean better, real accuracy numbers, real
   wiggly boundaries at high degree.

Run: python3 scripts/gen_ch36_kernel_trick_code.py
Writes: public/images/ch36-circles-linear-vs-manual3d.png
        public/images/ch36-circles-linear-vs-rbf.png
        public/images/ch36-poly-degree-sweep.png
"""

import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401
from sklearn.datasets import make_circles, make_moons
from sklearn.svm import SVC

RED = "#dc2626"
GREEN = "#16a34a"
BLUE = "#2563eb"

# --- 1 & 3: circles, linear vs manual-3D vs rbf ---

X, y = make_circles(n_samples=200, noise=0.06, factor=0.4, random_state=7)

linear_clf = SVC(kernel="linear").fit(X, y)
linear_acc = linear_clf.score(X, y)

rbf_clf = SVC(kernel="rbf", gamma="scale").fit(X, y)
rbf_acc = rbf_clf.score(X, y)

xx, yy = np.meshgrid(
    np.linspace(X[:, 0].min() - 0.4, X[:, 0].max() + 0.4, 400),
    np.linspace(X[:, 1].min() - 0.4, X[:, 1].max() + 0.4, 400),
)
grid = np.c_[xx.ravel(), yy.ravel()]

fig, axes = plt.subplots(1, 2, figsize=(12, 6), dpi=300)

for ax, clf, acc, title in [
    (axes[0], linear_clf, linear_acc, "kernel=\"linear\" on (x1, x2)"),
    (axes[1], rbf_clf, rbf_acc, "kernel=\"rbf\" on (x1, x2)"),
]:
    Z = clf.predict(grid).reshape(xx.shape)
    ax.contourf(xx, yy, Z, levels=[-0.5, 0.5, 1.5], colors=["#fee2e2", "#dcfce7"], alpha=0.8)
    ax.scatter(X[y == 0, 0], X[y == 0, 1], marker="x", color=RED, s=45, linewidths=1.8)
    ax.scatter(X[y == 1, 0], X[y == 1, 1], marker="+", color=GREEN, s=55, linewidths=1.8)
    ax.set_title(f"{title}\naccuracy = {acc:.0%}", fontsize=11)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)

plt.tight_layout()
plt.savefig("public/images/ch36-circles-linear-vs-rbf.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch36-circles-linear-vs-rbf.png")

# --- 2: manual z = x1^2 + x2^2 lift, viewed in 3D ---

z = X[:, 0] ** 2 + X[:, 1] ** 2
X3 = np.column_stack([X, z])
manual_clf = SVC(kernel="linear").fit(X3, y)
manual_acc = manual_clf.score(X3, y)

fig = plt.figure(figsize=(7, 7), dpi=300)
ax = fig.add_subplot(111, projection="3d")
ax.scatter(X[y == 0, 0], X[y == 0, 1], z[y == 0], marker="x", color=RED, s=35, linewidths=1.6, label="inner class")
ax.scatter(X[y == 1, 0], X[y == 1, 1], z[y == 1], marker="+", color=GREEN, s=45, linewidths=1.6, label="outer ring")

w = manual_clf.coef_[0]
b = manual_clf.intercept_[0]
gx, gy = np.meshgrid(
    np.linspace(X[:, 0].min() - 0.2, X[:, 0].max() + 0.2, 10),
    np.linspace(X[:, 1].min() - 0.2, X[:, 1].max() + 0.2, 10),
)
gz = -(w[0] * gx + w[1] * gy + b) / w[2]
ax.plot_surface(gx, gy, gz, color=BLUE, alpha=0.3, linewidth=0)

ax.set_xlabel("x1")
ax.set_ylabel("x2")
ax.set_zlabel("z = x1² + x2²")
ax.set_title(f"manually adding z = x1² + x2², then a linear SVM\naccuracy = {manual_acc:.0%}", fontsize=11)
ax.view_init(elev=18, azim=-60)
ax.legend(frameon=False, fontsize=9, loc="upper left")

plt.tight_layout()
plt.savefig("public/images/ch36-circles-linear-vs-manual3d.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch36-circles-linear-vs-manual3d.png")

# --- 4: polynomial kernel degree sweep on moons ---

from sklearn.model_selection import train_test_split

Xm, ym = make_moons(n_samples=120, noise=0.35, random_state=42)
Xm_train, Xm_test, ym_train, ym_test = train_test_split(Xm, ym, test_size=0.5, random_state=0)

degrees = [1, 3, 6, 10]
fig, axes = plt.subplots(1, 4, figsize=(18, 5), dpi=300)

xx_m, yy_m = np.meshgrid(
    np.linspace(Xm[:, 0].min() - 0.6, Xm[:, 0].max() + 0.6, 400),
    np.linspace(Xm[:, 1].min() - 0.6, Xm[:, 1].max() + 0.6, 400),
)
grid_m = np.c_[xx_m.ravel(), yy_m.ravel()]

for ax, degree in zip(axes, degrees):
    clf = SVC(kernel="poly", degree=degree, coef0=1, C=1).fit(Xm_train, ym_train)
    train_acc = clf.score(Xm_train, ym_train)
    test_acc = clf.score(Xm_test, ym_test)
    Z = clf.predict(grid_m).reshape(xx_m.shape)
    ax.contourf(xx_m, yy_m, Z, levels=[-0.5, 0.5, 1.5], colors=["#fee2e2", "#dcfce7"], alpha=0.8)
    ax.scatter(Xm_train[ym_train == 0, 0], Xm_train[ym_train == 0, 1], marker="x", color=RED, s=30, linewidths=1.5)
    ax.scatter(Xm_train[ym_train == 1, 0], Xm_train[ym_train == 1, 1], marker="+", color=GREEN, s=38, linewidths=1.5)
    ax.scatter(Xm_test[:, 0], Xm_test[:, 1], marker="o", facecolors="none", edgecolors="#6b7280", s=45, linewidths=1.2)
    ax.set_title(f"degree={degree}\ntrain={train_acc:.0%}  test={test_acc:.0%}", fontsize=11)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)

plt.tight_layout()
plt.savefig("public/images/ch36-poly-degree-sweep.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch36-poly-degree-sweep.png")

print()
print(f"linear_acc={linear_acc:.3f} rbf_acc={rbf_acc:.3f} manual3d_acc={manual_acc:.3f}")
for degree in degrees:
    clf = SVC(kernel="poly", degree=degree, coef0=1, C=1).fit(Xm_train, ym_train)
    print(f"poly degree={degree}: train={clf.score(Xm_train, ym_train):.3f} test={clf.score(Xm_test, ym_test):.3f}")
