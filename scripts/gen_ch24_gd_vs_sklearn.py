"""Generate the from-scratch-gradient-descent vs sklearn comparison for Ch.24.

Reproduces CampusX's day58-logistic-regression/gradient-descent.ipynb notebook:
same make_classification dataset and seed, same gd() weight-update loop, same
sklearn.LogisticRegression(penalty='none', solver='sag') comparison line.

Run: python3 scripts/gen_ch24_gd_vs_sklearn.py
Writes: public/images/ch24-gd-vs-sklearn.png
"""

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression

X, y = make_classification(
    n_samples=100, n_features=2, n_informative=1, n_redundant=0,
    n_classes=2, n_clusters_per_class=1, random_state=41, hypercube=False, class_sep=20,
)

lor = LogisticRegression(penalty=None, solver="sag")
lor.fit(X, y)

m1 = -(lor.coef_[0][0] / lor.coef_[0][1])
b1 = -(lor.intercept_[0] / lor.coef_[0][1])
x_input = np.linspace(-3, 3, 100)
y_input = m1 * x_input + b1


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def gd(X, y):
    X = np.insert(X, 0, 1, axis=1)
    weights = np.ones(X.shape[1])
    lr = 0.5

    for _ in range(5000):
        y_hat = sigmoid(np.dot(X, weights))
        weights = weights + lr * (np.dot((y - y_hat), X) / X.shape[0])

    return weights[1:], weights[0]


coef_, intercept_ = gd(X, y)
print(f"sklearn: coef={lor.coef_[0]}, intercept={lor.intercept_[0]}")
print(f"from scratch: coef={coef_}, intercept={intercept_}")

m = -(coef_[0] / coef_[1])
b = -(intercept_ / coef_[1])
x_input1 = np.linspace(-3, 3, 100)
y_input1 = m * x_input1 + b

fig, ax = plt.subplots(figsize=(8, 5.5), dpi=300)
ax.scatter(X[:, 0], X[:, 1], c=y, cmap="winter", s=90, zorder=2)
ax.plot(x_input, y_input, color="#dc2626", linewidth=3, label="sklearn LogisticRegression", zorder=3)
ax.plot(x_input1, y_input1, color="#111827", linewidth=3, linestyle="--", label="gradient descent from scratch", zorder=3)
ax.set_ylim(-3, 2)
ax.legend(frameon=False, loc="lower left")
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)

plt.tight_layout()
plt.savefig("public/images/ch24-gd-vs-sklearn.png", bbox_inches="tight")
plt.close()

print("Wrote public/images/ch24-gd-vs-sklearn.png")
