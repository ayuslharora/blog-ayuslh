"""
Script to:
1. Run SGDRegressor from scratch on the diabetes dataset
2. Measure wall-clock time vs batch GD
3. Generate the convergence chart
4. Print all real numbers needed for the blog post
"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split
import time
import os

# --- Data ---
X, y = load_diabetes(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=2)

print(f"X_train shape: {X_train.shape}")
print(f"y_train shape: {y_train.shape}")

# --- Batch GDRegressor (from ch8) ---
class GDRegressor:
    def __init__(self, learning_rate=0.5, epochs=1000):
        self.lr = learning_rate
        self.epochs = epochs
        self.coef_ = None
        self.intercept_ = None

    def fit(self, X_train, y_train):
        self.intercept_ = 0
        self.coef_ = np.ones(X_train.shape[1])
        for _ in range(self.epochs):
            y_hat = X_train @ self.coef_ + self.intercept_
            intercept_der = -2 * np.mean(y_train - y_hat)
            self.intercept_ -= self.lr * intercept_der
            coef_der = -2 * np.dot((y_train - y_hat), X_train) / X_train.shape[0]
            self.coef_ -= self.lr * coef_der

    def predict(self, X):
        return X @ self.coef_ + self.intercept_

# --- SGDRegressor from scratch ---
class SGDRegressor:
    def __init__(self, learning_rate=0.01, epochs=1000):
        self.lr = learning_rate
        self.epochs = epochs
        self.coef_ = None
        self.intercept_ = None

    def fit(self, X_train, y_train):
        self.intercept_ = 0
        self.coef_ = np.ones(X_train.shape[1])

        for i in range(self.epochs):
            for j in range(X_train.shape[0]):
                idx = np.random.randint(0, X_train.shape[0])
                y_hat = np.dot(X_train[idx], self.coef_) + self.intercept_

                # intercept derivative: -2 * (y_i - y_hat_i), no mean since single sample
                intercept_der = -2 * (y_train[idx] - y_hat)
                self.intercept_ -= self.lr * intercept_der

                # coefficient derivative: -2 * (y_i - y_hat_i) * x_i, no division since single sample
                coef_der = -2 * (y_train[idx] - y_hat) * X_train[idx]
                self.coef_ -= self.lr * coef_der

    def predict(self, X):
        return X @ self.coef_ + self.intercept_

# --- OLS benchmark ---
reg = LinearRegression()
reg.fit(X_train, y_train)
y_pred_ols = reg.predict(X_test)
ols_r2 = r2_score(y_test, y_pred_ols)
print(f"\nOLS R2: {ols_r2:.4f}")
print(f"OLS intercept: {reg.intercept_:.5f}")
print(f"OLS coef: {reg.coef_}")

# --- Batch GD timing ---
EPOCHS = 1000
start = time.time()
gd = GDRegressor(learning_rate=0.5, epochs=EPOCHS)
gd.fit(X_train, y_train)
batch_time = time.time() - start
y_pred_gd = gd.predict(X_test)
batch_r2 = r2_score(y_test, y_pred_gd)
print(f"\nBatch GD R2: {batch_r2:.4f}")
print(f"Batch GD time ({EPOCHS} epochs): {batch_time:.4f}s")

# --- SGD timing ---
start = time.time()
np.random.seed(42)
sgd = SGDRegressor(learning_rate=0.01, epochs=EPOCHS)
sgd.fit(X_train, y_train)
sgd_time = time.time() - start
y_pred_sgd = sgd.predict(X_test)
sgd_r2 = r2_score(y_test, y_pred_sgd)
print(f"\nSGD R2: {sgd_r2:.4f}")
print(f"SGD intercept: {sgd.intercept_:.5f}")
print(f"SGD coef: {sgd.coef_}")
print(f"SGD time ({EPOCHS} epochs): {sgd_time:.4f}s")

# --- SGD convergence (R2 per epoch) ---
np.random.seed(42)
sgd2 = SGDRegressor(learning_rate=0.01, epochs=EPOCHS)
sgd2.intercept_ = 0
sgd2.coef_ = np.ones(X_train.shape[1])

sgd_r2_history = []
for i in range(EPOCHS):
    for j in range(X_train.shape[0]):
        idx = np.random.randint(0, X_train.shape[0])
        y_hat_row = np.dot(X_train[idx], sgd2.coef_) + sgd2.intercept_
        intercept_der = -2 * (y_train[idx] - y_hat_row)
        sgd2.intercept_ -= 0.01 * intercept_der
        coef_der = -2 * (y_train[idx] - y_hat_row) * X_train[idx]
        sgd2.coef_ -= 0.01 * coef_der
    # record R2 on train after each epoch
    y_hat_train = X_train @ sgd2.coef_ + sgd2.intercept_
    epoch_r2 = r2_score(y_train, y_hat_train)
    sgd_r2_history.append(epoch_r2)

# --- Batch GD convergence ---
gd2 = GDRegressor(learning_rate=0.5, epochs=EPOCHS)
gd2.intercept_ = 0
gd2.coef_ = np.ones(X_train.shape[1])
batch_r2_history = []
for i in range(EPOCHS):
    y_hat = X_train @ gd2.coef_ + gd2.intercept_
    epoch_r2 = r2_score(y_train, y_hat)
    batch_r2_history.append(epoch_r2)
    intercept_der = -2 * np.mean(y_train - y_hat)
    gd2.intercept_ -= 0.5 * intercept_der
    coef_der = -2 * np.dot((y_train - y_hat), X_train) / X_train.shape[0]
    gd2.coef_ -= 0.5 * coef_der

print(f"\nFinal SGD train R2: {sgd_r2_history[-1]:.4f}")
print(f"Final Batch train R2: {batch_r2_history[-1]:.4f}")

# --- Chart ---
fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))

# common y range: show both from a bit below SGD min up to ~0.65 to focus on the interesting zone
y_min = min(min(sgd_r2_history[:50]), 0) - 0.05  # first 50 epochs may dip
y_max = max(max(sgd_r2_history), batch_r2_history[-1]) + 0.05

# SGD (noisy)
axes[0].plot(range(1, EPOCHS+1), sgd_r2_history, color='#e05c2a', linewidth=0.55, alpha=0.9)
axes[0].set_title('SGD: Training R² per Epoch', fontsize=13, fontweight='bold')
axes[0].set_xlabel('Epoch', fontsize=11)
axes[0].set_ylabel('R² (training)', fontsize=11)
axes[0].set_xlim(1, EPOCHS)
axes[0].set_ylim(-0.05, 0.70)
axes[0].axhline(sgd_r2_history[-1], color='gray', linestyle='--', linewidth=0.8, alpha=0.7)
axes[0].text(EPOCHS * 0.55, sgd_r2_history[-1] + 0.02,
             f'Final ≈ {sgd_r2_history[-1]:.3f}', color='gray', fontsize=9)
axes[0].grid(True, alpha=0.3)

# Batch GD (smooth) — starts very negative because of poor init; zoom to same window
axes[1].plot(range(1, EPOCHS+1), batch_r2_history, color='#2a7ae0', linewidth=1.5)
axes[1].set_title('Batch GD: Training R² per Epoch', fontsize=13, fontweight='bold')
axes[1].set_xlabel('Epoch', fontsize=11)
axes[1].set_ylabel('R² (training)', fontsize=11)
axes[1].set_xlim(1, EPOCHS)
axes[1].set_ylim(-0.05, 0.70)
axes[1].axhline(batch_r2_history[-1], color='gray', linestyle='--', linewidth=0.8, alpha=0.7)
axes[1].text(EPOCHS * 0.55, batch_r2_history[-1] + 0.02,
             f'Final ≈ {batch_r2_history[-1]:.3f}', color='gray', fontsize=9)
axes[1].grid(True, alpha=0.3)

plt.suptitle('SGD vs Batch GD: Convergence Comparison on Diabetes Dataset', fontsize=13.5, y=1.02)
plt.tight_layout()

out_path = '/Users/ayush/Master-Code/blog/public/images/ch9-convergence-comparison.png'
plt.savefig(out_path, dpi=150, bbox_inches='tight', facecolor='white')
plt.close()
print(f"\nSaved chart to {out_path}")
