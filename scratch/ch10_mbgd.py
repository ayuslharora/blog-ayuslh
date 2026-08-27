"""
Run MBGDRegressor on the diabetes dataset, compare to OLS/batch GD/SGD,
time it, and generate a three-way convergence chart for Ch.10.
"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
import random
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression, SGDRegressor as SklearnSGD
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split
import time

X, y = load_diabetes(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=2)
print(f"X_train shape: {X_train.shape}")

# --- OLS ---
reg = LinearRegression()
reg.fit(X_train, y_train)
ols_r2 = r2_score(y_test, reg.predict(X_test))
print(f"OLS R2: {ols_r2:.4f}, intercept: {reg.intercept_:.5f}")

# --- Batch GD (ch8) ---
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

# --- SGD (ch9) ---
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
                intercept_der = -2 * (y_train[idx] - y_hat)
                self.intercept_ -= self.lr * intercept_der
                coef_der = -2 * (y_train[idx] - y_hat) * X_train[idx]
                self.coef_ -= self.lr * coef_der
    def predict(self, X):
        return X @ self.coef_ + self.intercept_

# --- Mini-Batch GD (ch10, from campusx notebook) ---
class MBGDRegressor:
    def __init__(self, batch_size, learning_rate=0.01, epochs=100):
        self.coef_ = None
        self.intercept_ = None
        self.lr = learning_rate
        self.epochs = epochs
        self.batch_size = batch_size

    def fit(self, X_train, y_train):
        self.intercept_ = 0
        self.coef_ = np.ones(X_train.shape[1])

        for i in range(self.epochs):
            for j in range(int(X_train.shape[0] / self.batch_size)):
                idx = random.sample(range(X_train.shape[0]), self.batch_size)

                y_hat = np.dot(X_train[idx], self.coef_) + self.intercept_

                intercept_der = -2 * np.mean(y_train[idx] - y_hat)
                self.intercept_ -= self.lr * intercept_der

                coef_der = -2 * np.dot((y_train[idx] - y_hat), X_train[idx])
                self.coef_ -= self.lr * coef_der

    def predict(self, X_test):
        return np.dot(X_test, self.coef_) + self.intercept_

# --- Run MBGD ---
random.seed(3)
np.random.seed(3)
BATCH_SIZE = int(X_train.shape[0] / 50)  # 7
print(f"batch_size = {BATCH_SIZE}, batches/epoch = {int(X_train.shape[0]/BATCH_SIZE)}")

EPOCHS = 100
start = time.time()
mbr = MBGDRegressor(batch_size=BATCH_SIZE, learning_rate=0.01, epochs=EPOCHS)
mbr.fit(X_train, y_train)
mbgd_time = time.time() - start
mbgd_r2 = r2_score(y_test, mbr.predict(X_test))
print(f"\nMBGD intercept: {mbr.intercept_:.5f}")
print(f"MBGD coef: {mbr.coef_}")
print(f"MBGD R2: {mbgd_r2:.4f}")
print(f"MBGD time ({EPOCHS} epochs): {mbgd_time:.4f}s")

# --- Timing comparisons at matched epoch counts ---
random.seed(3); np.random.seed(3)
start = time.time()
gd100 = GDRegressor(learning_rate=0.5, epochs=EPOCHS)
gd100.fit(X_train, y_train)
gd100_time = time.time() - start
gd100_r2 = r2_score(y_test, gd100.predict(X_test))
print(f"\nBatch GD ({EPOCHS} epochs) R2: {gd100_r2:.4f}, time: {gd100_time:.4f}s")

random.seed(3); np.random.seed(3)
start = time.time()
sgd100 = SGDRegressor(learning_rate=0.01, epochs=EPOCHS)
sgd100.fit(X_train, y_train)
sgd100_time = time.time() - start
sgd100_r2 = r2_score(y_test, sgd100.predict(X_test))
print(f"SGD ({EPOCHS} epochs) R2: {sgd100_r2:.4f}, time: {sgd100_time:.4f}s")

# --- sklearn SGDRegressor via partial_fit, mini-batch style (from notebook) ---
random.seed(3)
sk_sgd = SklearnSGD(learning_rate='constant', eta0=0.1)
for i in range(100):
    idx = random.sample(range(X_train.shape[0]), 35)
    sk_sgd.partial_fit(X_train[idx], y_train[idx])
sk_r2 = r2_score(y_test, sk_sgd.predict(X_test))
print(f"\nsklearn SGDRegressor (mini-batch via partial_fit) R2: {sk_r2:.4f}")
print(f"sklearn intercept: {sk_sgd.intercept_}")

# --- Convergence history: MBGD vs SGD vs Batch GD, all 100 epochs ---
random.seed(3); np.random.seed(3)
mbr2 = MBGDRegressor(batch_size=BATCH_SIZE, learning_rate=0.01, epochs=EPOCHS)
mbr2.intercept_ = 0
mbr2.coef_ = np.ones(X_train.shape[1])
mbgd_r2_history = []
for i in range(EPOCHS):
    for j in range(int(X_train.shape[0] / mbr2.batch_size)):
        idx = random.sample(range(X_train.shape[0]), mbr2.batch_size)
        y_hat = np.dot(X_train[idx], mbr2.coef_) + mbr2.intercept_
        intercept_der = -2 * np.mean(y_train[idx] - y_hat)
        mbr2.intercept_ -= mbr2.lr * intercept_der
        coef_der = -2 * np.dot((y_train[idx] - y_hat), X_train[idx])
        mbr2.coef_ -= mbr2.lr * coef_der
    y_hat_train = X_train @ mbr2.coef_ + mbr2.intercept_
    mbgd_r2_history.append(r2_score(y_train, y_hat_train))

random.seed(3); np.random.seed(3)
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
    y_hat_train = X_train @ sgd2.coef_ + sgd2.intercept_
    sgd_r2_history.append(r2_score(y_train, y_hat_train))

gd2 = GDRegressor(learning_rate=0.5, epochs=EPOCHS)
gd2.intercept_ = 0
gd2.coef_ = np.ones(X_train.shape[1])
batch_r2_history = []
for i in range(EPOCHS):
    y_hat = X_train @ gd2.coef_ + gd2.intercept_
    batch_r2_history.append(r2_score(y_train, y_hat))
    intercept_der = -2 * np.mean(y_train - y_hat)
    gd2.intercept_ -= 0.5 * intercept_der
    coef_der = -2 * np.dot((y_train - y_hat), X_train) / X_train.shape[0]
    gd2.coef_ -= 0.5 * coef_der

print(f"\nFinal train R2 @ {EPOCHS} epochs: MBGD={mbgd_r2_history[-1]:.4f}, "
      f"SGD={sgd_r2_history[-1]:.4f}, Batch={batch_r2_history[-1]:.4f}")

# --- Chart: three-way overlay ---
fig, ax = plt.subplots(figsize=(9, 5.2))
ax.plot(range(1, EPOCHS+1), sgd_r2_history, color='#e05c2a', linewidth=0.7, alpha=0.85, label='SGD (n updates/epoch)')
ax.plot(range(1, EPOCHS+1), mbgd_r2_history, color='#2ca25f', linewidth=1.3, alpha=0.95, label=f'Mini-Batch GD (batch={BATCH_SIZE}, {int(X_train.shape[0]/BATCH_SIZE)} updates/epoch)')
ax.plot(range(1, EPOCHS+1), batch_r2_history, color='#2a7ae0', linewidth=1.8, label='Batch GD (1 update/epoch)')
ax.set_xlabel('Epoch', fontsize=11)
ax.set_ylabel('R² (training)', fontsize=11)
ax.set_title('Batch GD vs Mini-Batch GD vs SGD: Convergence over 100 Epochs', fontsize=13, fontweight='bold')
ax.set_xlim(1, EPOCHS)
ax.set_ylim(-0.05, 0.60)
ax.legend(loc='lower right', fontsize=10, frameon=True)
ax.grid(True, alpha=0.3)
plt.tight_layout()

out_path = '/Users/ayush/Master-Code/blog/public/images/ch10-convergence-comparison.png'
plt.savefig(out_path, dpi=150, bbox_inches='tight', facecolor='white')
plt.close()
print(f"\nSaved chart to {out_path}")
