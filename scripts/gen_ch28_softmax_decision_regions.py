"""Generate the softmax-regression decision-region plot for Ch.28.

Reproduces CampusX's day60-logistic-regression-contd/softmax-demo.ipynb
notebook: seaborn's built-in Iris dataset, sepal_length + petal_length as the
two input features, LogisticRegression(multi_class='multinomial'). The
notebook uses mlxtend's plot_decision_regions; this redraws the same kind of
plot with a plain matplotlib contourf mesh instead, to avoid the extra
dependency.

Run: python3 scripts/gen_ch28_softmax_decision_regions.py
Writes: public/images/ch28-softmax-decision-regions.png
"""

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from matplotlib.colors import ListedColormap
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

df = sns.load_dataset("iris")
encoder = LabelEncoder()
df["species"] = encoder.fit_transform(df["species"])
df = df[["sepal_length", "petal_length", "species"]]

X = df.iloc[:, 0:2]
y = df.iloc[:, -1]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=2)

clf = LogisticRegression(multi_class="multinomial")
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)

print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"Confusion matrix:\n{confusion_matrix(y_test, y_pred)}")

query = np.array([[3.4, 2.7]])
print(f"predict_proba([[3.4, 2.7]]) = {clf.predict_proba(query)}")
print(f"predict([[3.4, 2.7]]) = {clf.predict(query)}")

x_min, x_max = X.iloc[:, 0].min() - 0.5, X.iloc[:, 0].max() + 0.5
y_min, y_max = X.iloc[:, 1].min() - 0.5, X.iloc[:, 1].max() + 0.5
xx, yy = np.meshgrid(np.linspace(x_min, x_max, 300), np.linspace(y_min, y_max, 300))
Z = clf.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

region_cmap = ListedColormap(["#dbeafe", "#fef3c7", "#dcfce7"])
point_colors = ["#2563eb", "#f59e0b", "#16a34a"]
labels = encoder.classes_

fig, ax = plt.subplots(figsize=(7.5, 6), dpi=300)
ax.contourf(xx, yy, Z, cmap=region_cmap, alpha=0.9)
for class_idx in range(3):
    mask = y.values == class_idx
    ax.scatter(
        X.iloc[:, 0][mask], X.iloc[:, 1][mask],
        color=point_colors[class_idx], edgecolors="white", s=45,
        label=labels[class_idx], zorder=3,
    )
ax.set_xlabel("sepal length (cm)")
ax.set_ylabel("petal length (cm)")
ax.legend(frameon=False, loc="upper left")
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)

plt.tight_layout()
plt.savefig("public/images/ch28-softmax-decision-regions.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch28-softmax-decision-regions.png")
