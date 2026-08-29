"""Generate the effect-of-C decision-boundary comparison for Ch.30.

Reproduces the core mechanic of CampusX's day60-logistic-regression-contd/
streamlit-viz-tool.py (a Streamlit app for interactively tuning LogisticRegression
hyperparameters): the same make_blobs(centers=2, random_state=6) binary dataset,
same decision-region meshgrid approach, static here across a few C values
instead of an interactive slider.

Run: python3 scripts/gen_ch30_hyperparameter_c.py
Writes: public/images/ch30-regularization-strength-c.png
"""

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import make_blobs
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

X, y = make_blobs(n_features=2, centers=2, random_state=6)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

a = np.arange(X[:, 0].min() - 1, X[:, 0].max() + 1, 0.02)
b = np.arange(X[:, 1].min() - 1, X[:, 1].max() + 1, 0.02)
XX, YY = np.meshgrid(a, b)
input_array = np.c_[XX.ravel(), YY.ravel()]

c_values = [0.01, 1.0, 100.0]
fig, axes = plt.subplots(1, 3, figsize=(15, 5), dpi=300)

for ax, c in zip(axes, c_values):
    clf = LogisticRegression(C=c, max_iter=1000)
    clf.fit(X_train, y_train)
    acc = accuracy_score(y_test, clf.predict(X_test))
    coef_norm = np.linalg.norm(clf.coef_)
    print(f"C={c}: accuracy={acc:.3f}, ||coef||={coef_norm:.3f}")

    labels = clf.predict(input_array).reshape(XX.shape)
    ax.contourf(XX, YY, labels, alpha=0.5, cmap="coolwarm")
    ax.scatter(X[:, 0], X[:, 1], c=y, cmap="coolwarm", edgecolors="white", s=40, zorder=3)
    ax.set_title(f"C = {c}\n||coef|| = {coef_norm:.2f}, accuracy = {acc:.2f}", fontsize=11)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)

plt.tight_layout()
plt.savefig("public/images/ch30-regularization-strength-c.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch30-regularization-strength-c.png")
