"""Generate the Logistic Regression vs Decision Tree confusion matrices for Ch.25.

Reproduces CampusX's day59-classification-metrics/classification-metrics-binary.ipynb
notebook: same heart.csv UCI heart-disease dataset, same train_test_split(test_size=0.2,
random_state=2), same LogisticRegression / DecisionTreeClassifier pair.

heart.csv is the standard 303-row UCI heart-disease dataset (age, sex, cp, ...,
target), the same one Kaggle's "heart-disease-uci" resolves to. Not vendored in
this repo; point HEART_CSV at a local copy before running.

Run: python3 scripts/gen_ch25_confusion_matrices.py /path/to/heart.csv
Writes: public/images/ch25-confusion-matrices.png
"""

import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

heart_csv = sys.argv[1] if len(sys.argv) > 1 else "heart.csv"
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

acc1 = accuracy_score(y_test, y_pred1)
acc2 = accuracy_score(y_test, y_pred2)
cm1 = confusion_matrix(y_test, y_pred1)
cm2 = confusion_matrix(y_test, y_pred2)

print(f"Logistic Regression accuracy: {acc1:.4f}")
print(f"Decision Tree accuracy: {acc2:.4f}")
print(f"Logistic Regression confusion matrix:\n{cm1}")
print(f"Decision Tree confusion matrix:\n{cm2}")

fig, axes = plt.subplots(1, 2, figsize=(11, 5), dpi=300)
titles = [f"Logistic Regression ({acc1*100:.1f}% accuracy)", f"Decision Tree ({acc2*100:.1f}% accuracy)"]

for ax, cm, title in zip(axes, [cm1, cm2], titles):
    im = ax.imshow(cm, cmap="Blues", vmin=0, vmax=max(cm1.max(), cm2.max()))
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(["No Disease (0)", "Disease (1)"])
    ax.set_yticklabels(["No Disease (0)", "Disease (1)"])
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title(title, fontsize=11, fontweight="bold")

    for i in range(2):
        for j in range(2):
            value = cm[i, j]
            color = "white" if value > cm.max() * 0.6 else "#111827"
            ax.text(j, i, str(value), ha="center", va="center", fontsize=15, color=color, fontweight="bold")

plt.tight_layout()
plt.savefig("public/images/ch25-confusion-matrices.png", bbox_inches="tight")
plt.close()

print("Wrote public/images/ch25-confusion-matrices.png")
