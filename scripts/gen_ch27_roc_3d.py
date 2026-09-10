"""Ch.27: the ROC curve as a 3D path parameterized by threshold.

Same Logistic Regression on the Pima diabetes data as the post. roc_curve gives
(FPR, TPR, threshold) at every operating point; plotted with threshold as the
vertical axis, the familiar 2D ROC curve is just the shadow this 3D path casts
on the threshold = 0 floor. The marked point is the threshold closest to the
top-left (FPR 0, TPR 1) corner.
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_curve
from sklearn.model_selection import train_test_split

columns = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin",
    "BMI", "DiabetesPedigreeFunction", "Age", "Outcome",
]
csv_path = sys.argv[1] if len(sys.argv) > 1 else "diabetes.csv"
df = pd.read_csv(csv_path, header=None, names=columns)

X_train, X_test, y_train, y_test = train_test_split(
    df.iloc[:, 0:-1], df.iloc[:, -1], test_size=0.2, random_state=2
)
lor = LogisticRegression(max_iter=5000)
lor.fit(X_train, y_train)
y_probs = lor.predict_proba(X_test)[:, 1]

fpr, tpr, thr = roc_curve(y_test, y_probs)
# roc_curve's first threshold is +inf; clamp it to 1 for plotting
thr = np.clip(thr, 0.0, 1.0)

dist = np.sqrt((1 - tpr) ** 2 + fpr ** 2)
k = int(np.argmin(dist))

out = {
    "fpr": [float(v) for v in fpr],
    "tpr": [float(v) for v in tpr],
    "threshold": [float(v) for v in thr],
    "best": {"fpr": float(fpr[k]), "tpr": float(tpr[k]), "threshold": float(thr[k])},
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch27-roc-3d.json"
dst.write_text(json.dumps(out))
print("points", len(fpr), "best", out["best"])
print("wrote", dst)
