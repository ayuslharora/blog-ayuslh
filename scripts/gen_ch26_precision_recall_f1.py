"""Generate the precision/recall/F1 bar chart for Ch.26, plus print the
multi-class numbers used in the post's code listings.

Binary part reproduces CampusX's day59-classification-metrics/classification-
metrics-binary.ipynb (same heart.csv, same LR/DT pair as Ch.25's chart).
Multi-class part reproduces classification-metrics-multi-iris1.ipynb (Iris,
LabelEncoder + LogisticRegression/DecisionTreeClassifier). The MNIST multi-
class notebook needs Kaggle's digit-recognizer/train.csv (not available
locally); sklearn's bundled `load_digits` (10-class handwritten digits) stands
in for it so the classification_report demo stays real and reproducible.

Iris.csv itself isn't vendored (same 150-row UCI Iris dataset Kaggle's copy
resolves to); loaded here via sklearn's bundled `load_iris` instead, which is
numerically identical.

Run: python3 scripts/gen_ch26_precision_recall_f1.py /path/to/heart.csv
Writes: public/images/ch26-precision-recall-f1.png
"""

import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

heart_csv = sys.argv[1] if len(sys.argv) > 1 else "heart.csv"

# --- Binary: heart disease, same split as Ch.25 -----------------------------
df = pd.read_csv(heart_csv)
X_train, X_test, y_train, y_test = train_test_split(
    df.iloc[:, 0:-1], df.iloc[:, -1], test_size=0.2, random_state=2
)

clf1 = LogisticRegression(max_iter=1000)
clf2 = DecisionTreeClassifier(random_state=2)
clf1.fit(X_train, y_train)
clf2.fit(X_train, y_train)
y_pred1 = clf1.predict(X_test)
y_pred2 = clf2.predict(X_test)

scores = {
    "Logistic Regression": [
        precision_score(y_test, y_pred1),
        recall_score(y_test, y_pred1),
        f1_score(y_test, y_pred1),
    ],
    "Decision Tree": [
        precision_score(y_test, y_pred2),
        recall_score(y_test, y_pred2),
        f1_score(y_test, y_pred2),
    ],
}
print("Heart disease (binary):")
for name, (p, r, f1) in scores.items():
    print(f"  {name}: precision={p:.3f}, recall={r:.3f}, f1={f1:.3f}")

fig, ax = plt.subplots(figsize=(7.5, 5), dpi=300)
metrics = ["Precision", "Recall", "F1"]
x_pos = np.arange(len(metrics))
width = 0.32

ax.bar(x_pos - width / 2, scores["Logistic Regression"], width, label="Logistic Regression", color="#2563eb")
ax.bar(x_pos + width / 2, scores["Decision Tree"], width, label="Decision Tree", color="#f59e0b")
ax.set_xticks(x_pos)
ax.set_xticklabels(metrics)
ax.set_ylabel("Score")
ax.set_ylim(0, 1.05)
ax.legend(frameon=False)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
for i, name in enumerate(["Logistic Regression", "Decision Tree"]):
    offset = -width / 2 if i == 0 else width / 2
    for j, val in enumerate(scores[name]):
        ax.text(j + offset, val + 0.02, f"{val:.2f}", ha="center", fontsize=9)

plt.tight_layout()
plt.savefig("public/images/ch26-precision-recall-f1.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch26-precision-recall-f1.png")

# --- Multi-class: Iris -------------------------------------------------------
from sklearn.datasets import load_iris

iris = load_iris()
Xi_train, Xi_test, yi_train, yi_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=1
)
lor_iris = LogisticRegression(max_iter=1000)
lor_iris.fit(Xi_train, yi_train)
yi_pred = lor_iris.predict(Xi_test)

print("\nIris (multi-class), per-class precision/recall:")
print("  precision(average=None):", precision_score(yi_test, yi_pred, average=None))
print("  recall(average=None):", recall_score(yi_test, yi_pred, average=None))
print("  macro precision:", precision_score(yi_test, yi_pred, average="macro"))
print("  weighted precision:", precision_score(yi_test, yi_pred, average="weighted"))

# --- Multi-class: digits (stand-in for the Kaggle MNIST notebook) -----------
from sklearn.datasets import load_digits

digits = load_digits()
Xd_train, Xd_test, yd_train, yd_test = train_test_split(
    digits.data, digits.target, test_size=0.2, random_state=2
)
lor_digits = LogisticRegression(max_iter=5000)
lor_digits.fit(Xd_train, yd_train)
yd_pred = lor_digits.predict(Xd_test)

print("\nDigits (10-class), classification_report:")
print(classification_report(yd_test, yd_pred))
