"""Generate the polynomial-features decision-boundary comparison for Ch.29.

Reproduces CampusX's day60-logistic-regression-contd/polynomial-logistic-
regression.ipynb notebook: the same ushape.csv toy dataset (2 non-linearly
separable input columns, binary class), PolynomialFeatures + LogisticRegression
at increasing degrees, 10-fold cross-validated accuracy. ushape.csv itself
isn't in that repo (a known missing-file issue there); the exact same 100-row
dataset is vendored in github.com/Adityarajora/Complete-KNN-visualization.

Run: python3 scripts/gen_ch29_polynomial_logistic_regression.py /path/to/ushape.csv
Writes: public/images/ch29-polynomial-logistic-regression.png
"""

import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import PolynomialFeatures

csv_path = sys.argv[1] if len(sys.argv) > 1 else "ushape.csv"
df = pd.read_csv(csv_path, header=None)
X = df.iloc[:, 0:2].values
y = df.iloc[:, -1].values


def fit_and_score(X, y, degree):
    poly = PolynomialFeatures(degree=degree)
    X_trf = poly.fit_transform(X)
    clf = LogisticRegression()
    clf.fit(X_trf, y)
    accuracy = np.mean(cross_val_score(clf, X_trf, y, scoring="accuracy", cv=10))
    return poly, clf, accuracy


degrees = [1, 3, 15]
fig, axes = plt.subplots(1, 3, figsize=(15, 5), dpi=300)

for ax, degree in zip(axes, degrees):
    poly, clf, accuracy = fit_and_score(X, y, degree)
    print(f"degree={degree}: cross-val accuracy={accuracy:.4f}")

    a = np.arange(X[:, 0].min() - 0.5, X[:, 0].max() + 0.5, 0.02)
    b = np.arange(X[:, 1].min() - 0.5, X[:, 1].max() + 0.5, 0.02)
    XX, YY = np.meshgrid(a, b)
    input_array = np.c_[XX.ravel(), YY.ravel()]
    labels = clf.predict(poly.transform(input_array)).reshape(XX.shape)

    ax.contourf(XX, YY, labels, alpha=0.5, cmap="coolwarm")
    ax.scatter(X[:, 0], X[:, 1], c=y, cmap="coolwarm", edgecolors="white", s=35, zorder=3)
    ax.set_title(f"degree = {degree}\naccuracy = {accuracy:.2f}", fontsize=12)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)

plt.tight_layout()
plt.savefig("public/images/ch29-polynomial-logistic-regression.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch29-polynomial-logistic-regression.png")
