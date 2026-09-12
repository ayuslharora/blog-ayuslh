"""Ch.36: JSON data for the interactive manual-3D-lift explorer.

Same make_circles data, z = x1^2 + x2^2 transform, and linear SVM fit as
gen_ch36_kernel_trick_code.py's static ch36-circles-linear-vs-manual3d.png,
exported as JSON so the post can embed a real, rotatable Plotly component.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import make_circles
from sklearn.svm import SVC

X, y = make_circles(n_samples=200, noise=0.06, factor=0.4, random_state=7)
z = X[:, 0] ** 2 + X[:, 1] ** 2
X3 = np.column_stack([X, z])
clf = SVC(kernel="linear").fit(X3, y)
acc = clf.score(X3, y)

w = clf.coef_[0]
b = clf.intercept_[0]
gx = np.linspace(X[:, 0].min() - 0.2, X[:, 0].max() + 0.2, 15)
gy = np.linspace(X[:, 1].min() - 0.2, X[:, 1].max() + 0.2, 15)
mx, my = np.meshgrid(gx, gy)
mz = -(w[0] * mx + w[1] * my + b) / w[2]

out = {
    "accuracy": float(acc),
    "points": {
        "x": [float(v) for v in X[:, 0]],
        "y": [float(v) for v in X[:, 1]],
        "z0": [0.0 for _ in X],
        "z_lift": [float(v) for v in z],
        "label": [int(v) for v in y],
    },
    "plane": {
        "x": [float(v) for v in gx],
        "y": [float(v) for v in gy],
        "z": [[float(v) for v in row] for row in mz],
    },
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch36-manual-lift.json"
dst.write_text(json.dumps(out))
print("accuracy", round(acc, 3))
print("wrote", dst)
