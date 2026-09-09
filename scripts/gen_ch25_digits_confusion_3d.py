"""Ch.25: a 10-class confusion matrix as a 3D landscape.

The video shows a 10x10 MNIST confusion matrix and reads misclassifications off
it. This reproduces the same shape on sklearn's 8x8 digits (a fast stand-in for
MNIST): train LogisticRegression, take the test-set confusion matrix, and write
the raw counts as a grid z = count over (predicted digit, true digit). The
diagonal is a ridge of correct predictions; the off-diagonal bumps are the
digits the model mixes up.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split

X, y = load_digits(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=2
)
clf = LogisticRegression(max_iter=5000)
clf.fit(X_train, y_train)
pred = clf.predict(X_test)
cm = confusion_matrix(y_test, pred)  # rows = true, cols = predicted

acc = accuracy_score(y_test, pred)
off = cm.copy()
np.fill_diagonal(off, 0)
i, j = np.unravel_index(np.argmax(off), off.shape)

out = {
    "labels": list(range(10)),
    "counts": [[int(v) for v in row] for row in cm],
    "accuracy": float(acc),
    "top_confusion": {"true": int(i), "pred": int(j), "count": int(off[i, j])},
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch25-digits-confusion.json"
dst.write_text(json.dumps(out))
print(f"accuracy {acc:.3f}; most confused: true {i} predicted as {j}, {off[i, j]} times")
print("wrote", dst)
