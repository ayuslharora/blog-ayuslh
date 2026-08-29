"""Generate the K-vs-accuracy and decision-boundary charts for Ch.31.

Uses sklearn's bundled Breast Cancer Wisconsin dataset (569 rows, 30 numeric
features, binary diagnosis), the same dataset the video uses (it loads the
Kaggle CSV version, which is the same underlying data minus an id column and
an empty unnamed column, sklearn's copy is already clean).

Run: python3 scripts/gen_ch31_knn.py
Writes: public/images/ch31-knn-k-vs-accuracy.png
        public/images/ch31-knn-decision-boundary-k.png
"""

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

data = load_breast_cancer()
X, y = data.data, data.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=2)
print(f"train={X_train.shape[0]}, test={X_test.shape[0]}")

scaler = StandardScaler().fit(X_train)
X_train_s = scaler.transform(X_train)
X_test_s = scaler.transform(X_test)

knn5 = KNeighborsClassifier(n_neighbors=5)
knn5.fit(X_train_s, y_train)
print(f"K=5 accuracy: {accuracy_score(y_test, knn5.predict(X_test_s)):.4f}")

# --- Chart 1: K vs cross-validated accuracy, K=1..15 ------------------------
from sklearn.model_selection import cross_val_score

k_values = range(1, 16)
accuracies = []
for k in k_values:
    knn = KNeighborsClassifier(n_neighbors=k)
    accuracies.append(np.mean(cross_val_score(knn, X_train_s, y_train, cv=10, scoring="accuracy")))

best_k = list(k_values)[int(np.argmax(accuracies))]
print(f"Best K: {best_k} (accuracy={max(accuracies):.4f})")

fig, ax = plt.subplots(figsize=(8, 5), dpi=300)
ax.plot(list(k_values), accuracies, color="#2563eb", linewidth=2, marker="o", markersize=5)
ax.scatter([best_k], [max(accuracies)], color="#dc2626", s=100, zorder=5, label=f"best K = {best_k}")
ax.set_xlabel("K (number of neighbors)")
ax.set_ylabel("Test accuracy")
ax.set_xticks(list(k_values))
ax.legend(frameon=False)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch31-knn-k-vs-accuracy.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch31-knn-k-vs-accuracy.png")

# --- Chart 2: decision boundary at small / good / large K -------------------
X2 = X[:, :2]  # mean radius, mean texture, for a 2D visualization
X2_train, X2_test, y2_train, y2_test = train_test_split(X2, y, test_size=0.2, random_state=2)
scaler2 = StandardScaler().fit(X2_train)
X2_train_s = scaler2.transform(X2_train)
X2_test_s = scaler2.transform(X2_test)
X2_all_s = scaler2.transform(X2)

k_panels = [1, 21, 200]
fig, axes = plt.subplots(1, 3, figsize=(15, 5), dpi=300)

a = np.arange(X2_all_s[:, 0].min() - 0.5, X2_all_s[:, 0].max() + 0.5, 0.03)
b = np.arange(X2_all_s[:, 1].min() - 0.5, X2_all_s[:, 1].max() + 0.5, 0.03)
XX, YY = np.meshgrid(a, b)
mesh_points = np.c_[XX.ravel(), YY.ravel()]

for ax, k in zip(axes, k_panels):
    clf = KNeighborsClassifier(n_neighbors=k)
    clf.fit(X2_train_s, y2_train)
    acc = accuracy_score(y2_test, clf.predict(X2_test_s))
    print(f"2-feature K={k}: accuracy={acc:.4f}")

    labels = clf.predict(mesh_points).reshape(XX.shape)
    ax.contourf(XX, YY, labels, alpha=0.5, cmap="coolwarm")
    ax.scatter(X2_all_s[:, 0], X2_all_s[:, 1], c=y, cmap="coolwarm", edgecolors="white", s=25, zorder=3)
    tag = "overfit" if k == 1 else ("underfit" if k == max(k_panels) else "good fit")
    ax.set_title(f"K = {k} ({tag})\naccuracy = {acc:.2f}", fontsize=12)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)

plt.tight_layout()
plt.savefig("public/images/ch31-knn-decision-boundary-k.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch31-knn-decision-boundary-k.png")
