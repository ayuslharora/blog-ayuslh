"""Generate the ROC curve charts for Ch.27.

No CampusX companion notebook for this video exists in 100-days-of-machine-
learning (the repo's day-numbered folders jump from day60 to day65, skipping
this one), so this uses the standard scikit-learn `roc_curve` / `roc_auc_score`
workflow directly on the same dataset the video describes: the classic Pima
Indians diabetes dataset (Pregnancies, Glucose, ..., Outcome).

Run: python3 scripts/gen_ch27_roc_auc.py /path/to/pima-indians-diabetes.csv
Writes: public/images/ch27-roc-threshold.png
        public/images/ch27-roc-model-comparison.png
"""

import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, roc_curve
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

columns = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin",
    "BMI", "DiabetesPedigreeFunction", "Age", "Outcome",
]
csv_path = sys.argv[1] if len(sys.argv) > 1 else "diabetes.csv"
df = pd.read_csv(csv_path, header=None, names=columns)

X_train, X_test, y_train, y_test = train_test_split(
    df.iloc[:, 0:-1], df.iloc[:, -1], test_size=0.2, random_state=2
)

# SVM is scale-sensitive (Glucose/Insulin/Age all live on very different
# ranges), so both models are trained on standardized features for a fair
# side-by-side comparison in Chart 2.
scaler = StandardScaler().fit(X_train)
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)

# --- Chart 1: ROC curve + best threshold for one model ----------------------
lor = LogisticRegression(max_iter=1000)
lor.fit(X_train_scaled, y_train)
y_probs = lor.predict_proba(X_test_scaled)[:, 1]

fpr, tpr, thresholds = roc_curve(y_test, y_probs)
distance_to_corner = np.sqrt((1 - tpr) ** 2 + fpr ** 2)
best_idx = np.argmin(distance_to_corner)
print(f"Best threshold: {thresholds[best_idx]:.3f} (TPR={tpr[best_idx]:.3f}, FPR={fpr[best_idx]:.3f})")
print(f"Logistic Regression AUC: {roc_auc_score(y_test, y_probs):.4f}")

fig, ax = plt.subplots(figsize=(6.5, 6), dpi=300)
ax.plot(fpr, tpr, color="#2563eb", linewidth=2.5, label="Logistic Regression ROC")
ax.plot([0, 1], [0, 1], color="#9ca3af", linewidth=1.5, linestyle="--", label="random guess")
ax.scatter([fpr[best_idx]], [tpr[best_idx]], color="#dc2626", s=90, zorder=5,
           label=f"best threshold = {thresholds[best_idx]:.2f}")
ax.set_xlabel("False Positive Rate (FPR)")
ax.set_ylabel("True Positive Rate (TPR)")
ax.set_xlim(-0.02, 1.02)
ax.set_ylim(-0.02, 1.02)
ax.legend(frameon=False, loc="lower right")
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch27-roc-threshold.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch27-roc-threshold.png")

# --- Chart 2: ROC comparison, Logistic Regression vs SVM --------------------
svm = SVC(probability=True, random_state=2)
svm.fit(X_train_scaled, y_train)
y_probs_svm = svm.predict_proba(X_test_scaled)[:, 1]

fpr_svm, tpr_svm, _ = roc_curve(y_test, y_probs_svm)
auc_lor = roc_auc_score(y_test, y_probs)
auc_svm = roc_auc_score(y_test, y_probs_svm)
print(f"SVM AUC: {auc_svm:.4f}")

fig, ax = plt.subplots(figsize=(6.5, 6), dpi=300)
ax.plot(fpr, tpr, color="#2563eb", linewidth=2.5, label=f"Logistic Regression (AUC = {auc_lor:.3f})")
ax.plot(fpr_svm, tpr_svm, color="#f59e0b", linewidth=2.5, label=f"SVM (AUC = {auc_svm:.3f})")
ax.plot([0, 1], [0, 1], color="#9ca3af", linewidth=1.5, linestyle="--", label="random guess")
ax.set_xlabel("False Positive Rate (FPR)")
ax.set_ylabel("True Positive Rate (TPR)")
ax.set_xlim(-0.02, 1.02)
ax.set_ylim(-0.02, 1.02)
ax.legend(frameon=False, loc="lower right")
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch27-roc-model-comparison.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch27-roc-model-comparison.png")
