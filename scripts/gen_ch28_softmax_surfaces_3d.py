"""Ch.28: the three softmax probability sheets over the Iris feature plane.

Same model as the post: multinomial LogisticRegression on Iris using sepal
length and petal length. Over a grid of the two features, softmax outputs three
probabilities per point (one per species) that sum to 1. Written as three
surfaces; whichever sheet is on top at a given (x, y) is the predicted class,
so the 2D decision-region plot is the top-down view of these sheets crossing.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

data = load_iris()
# sepal length (col 0), petal length (col 2)
X = data.data[:, [0, 2]]
y = data.target
names = list(data.target_names)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=2
)
clf = LogisticRegression(max_iter=5000)
clf.fit(X_train, y_train)

pad = 0.4
gx = np.linspace(X[:, 0].min() - pad, X[:, 0].max() + pad, 55)
gy = np.linspace(X[:, 1].min() - pad, X[:, 1].max() + pad, 55)
mx, my = np.meshgrid(gx, gy)
grid = np.column_stack([mx.ravel(), my.ravel()])
proba = clf.predict_proba(grid).reshape(len(gy), len(gx), 3)

out = {
    "classes": names,
    "x": [float(v) for v in gx],
    "y": [float(v) for v in gy],
    "proba": [
        [[float(v) for v in proba[i, j]] for j in range(len(gx))]
        for i in range(len(gy))
    ],
    "points": {
        "x": [float(v) for v in X[:, 0]],
        "y": [float(v) for v in X[:, 1]],
        "label": [int(v) for v in y],
    },
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch28-softmax-surfaces.json"
dst.write_text(json.dumps(out))
print("classes", names, "grid", len(gx), "x", len(gy))
print("wrote", dst)
