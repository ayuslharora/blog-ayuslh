import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.datasets import make_moons
from sklearn.metrics import accuracy_score

# ---------------------------------------------------------------------------
# Chart 1: M1 / M2 / M3 — three models of increasing complexity fit to the
# same train/test split, mirroring the whiteboard diagram (circle = train,
# x = test).
# ---------------------------------------------------------------------------
rng = np.random.RandomState(7)


def true_function(x):
    return 0.5 * x**2 - x + 2.0


X = rng.uniform(-3, 3, 16).reshape(-1, 1)
y = true_function(X).ravel() + rng.normal(0, 1.0, size=16)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.4, random_state=7)

degrees = {"M1": 1, "M2": 2, "M3": 6}
x_plot = np.linspace(-3.3, 3.3, 300).reshape(-1, 1)

fig, axes = plt.subplots(1, 3, figsize=(13, 4.2), dpi=300)

for ax, (label, degree) in zip(axes, degrees.items()):
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
    model.fit(X_train, y_train)

    y_plot = model.predict(x_plot)
    ax.plot(x_plot, y_plot, color="#2563eb", linewidth=2, zorder=2)
    ax.scatter(X_train, y_train, facecolors="#2563eb", edgecolors="white", s=70, label="train", zorder=3)
    ax.scatter(X_test, y_test, marker="x", color="#111827", s=70, linewidths=2, label="test", zorder=3)

    ax.set_ylim(-3, 14)
    ax.set_title(label, fontsize=14, fontweight="bold")
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)

axes[0].legend(loc="upper center", frameon=False, fontsize=9, ncol=1)
plt.tight_layout()
plt.savefig("public/images/ch12-m1-m2-m3-fits.png", bbox_inches="tight")
plt.close()

for label, degree in degrees.items():
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
    model.fit(X_train, y_train)
    train_r2 = model.score(X_train, y_train)
    test_r2 = model.score(X_test, y_test)
    print(f"{label} (degree={degree}): train R^2={train_r2:.2f}, test R^2={test_r2:.2f}")

# ---------------------------------------------------------------------------
# Chart 2: train vs test accuracy for KNN classifiers of increasing
# complexity, used to introduce variance.
# ---------------------------------------------------------------------------
Xc, yc = make_moons(n_samples=200, noise=0.35, random_state=42)
Xc_train, Xc_test, yc_train, yc_test = train_test_split(Xc, yc, test_size=0.3, random_state=42)

k_values = {"M1 (k=40)": 40, "M2 (k=9)": 9, "M3 (k=1)": 1}
train_accs, test_accs = [], []

for label, k in k_values.items():
    knn = KNeighborsClassifier(n_neighbors=k)
    knn.fit(Xc_train, yc_train)
    train_acc = accuracy_score(yc_train, knn.predict(Xc_train))
    test_acc = accuracy_score(yc_test, knn.predict(Xc_test))
    train_accs.append(train_acc)
    test_accs.append(test_acc)
    print(f"{label}: train acc={train_acc:.2f}, test acc={test_acc:.2f}")

fig, ax = plt.subplots(figsize=(7, 4.5), dpi=300)
x_pos = np.arange(len(k_values))
width = 0.32

ax.bar(x_pos - width / 2, train_accs, width, label="train accuracy", color="#2563eb")
ax.bar(x_pos + width / 2, test_accs, width, label="test accuracy", color="#f59e0b")

ax.set_xticks(x_pos)
ax.set_xticklabels(list(k_values.keys()))
ax.set_ylabel("Accuracy")
ax.set_ylim(0, 1.05)
ax.legend(frameon=False)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)

for i, (tr, te) in enumerate(zip(train_accs, test_accs)):
    ax.text(i - width / 2, tr + 0.02, f"{tr:.2f}", ha="center", fontsize=9)
    ax.text(i + width / 2, te + 0.02, f"{te:.2f}", ha="center", fontsize=9)

plt.tight_layout()
plt.savefig("public/images/ch12-train-test-accuracy.png", bbox_inches="tight")
plt.close()
