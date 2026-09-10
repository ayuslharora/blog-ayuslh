"""Ch.31: KNN's majority vote in 3D.

Three standardized features from the breast cancer dataset. One held-out point is
the query; the training points are ranked by Euclidean distance to it. The
component draws lines from the query to its K nearest and reads off the vote, so
raising K can be seen flipping (or not flipping) the predicted class.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

data = load_breast_cancer()
feat = ["mean radius", "mean texture", "mean concave points"]
idx = [list(data.feature_names).index(f) for f in feat]
X = data.data[:, idx]
y = data.target  # 1 = benign, 0 = malignant

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=2
)
scaler = StandardScaler().fit(X_train)
Xtr = scaler.transform(X_train)
Xte = scaler.transform(X_test)

# pick a query near the class boundary so K genuinely matters: its closest few
# neighbours lean one way, a wider K leans the other.
d_to_half = []
for i in range(len(Xte)):
    dists = np.linalg.norm(Xtr - Xte[i], axis=1)
    order = np.argsort(dists)[:15]
    d_to_half.append(abs(np.mean(y_train[order] == 1) - 0.5))
q = int(np.argmin(d_to_half))

query = Xte[q]
dists = np.linalg.norm(Xtr - query, axis=1)
order = np.argsort(dists)

out = {
    "features": feat,
    "query": {"x": float(query[0]), "y": float(query[1]), "z": float(query[2]),
              "true_label": int(y_test[q])},
    "train": {
        "x": [float(v) for v in Xtr[:, 0]],
        "y": [float(v) for v in Xtr[:, 1]],
        "z": [float(v) for v in Xtr[:, 2]],
        "label": [int(v) for v in y_train],
    },
    "neighbor_order": [int(v) for v in order[:41]],
    "neighbor_dist": [float(dists[i]) for i in order[:41]],
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch31-knn-neighbors.json"
dst.write_text(json.dumps(out))
for k in (3, 7, 15, 41):
    votes = y_train[order[:k]]
    print(f"K={k}: benign {int(np.sum(votes==1))}, malignant {int(np.sum(votes==0))} -> "
          f"{'benign' if np.mean(votes==1) > 0.5 else 'malignant'}")
print("true label:", "benign" if y_test[q] == 1 else "malignant")
print("wrote", dst)
