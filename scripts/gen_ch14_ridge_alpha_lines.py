import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_regression
from sklearn.linear_model import LinearRegression, Ridge

# ---------------------------------------------------------------------------
# Recreates the notebook cell that fits OLS and two Ridge models (alpha=10,
# alpha=100) on a single-feature synthetic dataset, then overlays all three
# regression lines to show the visible flattening as alpha grows.
# ---------------------------------------------------------------------------
X, y = make_regression(n_samples=100, n_features=1, n_informative=1, n_targets=1, noise=20, random_state=13)

lr = LinearRegression().fit(X, y)
rr10 = Ridge(alpha=10).fit(X, y)
rr100 = Ridge(alpha=100).fit(X, y)

order = np.argsort(X[:, 0])
X_sorted = X[order]

fig, ax = plt.subplots(figsize=(8, 5.5), dpi=300)

ax.plot(X, y, "b.", alpha=0.6, label="data")
ax.plot(X_sorted, lr.predict(X_sorted), color="#dc2626", linewidth=2, label=f"alpha=0, m={lr.coef_[0]:.2f}")
ax.plot(X_sorted, rr10.predict(X_sorted), color="#16a34a", linewidth=2, label=f"alpha=10, m={rr10.coef_[0]:.2f}")
ax.plot(X_sorted, rr100.predict(X_sorted), color="#f97316", linewidth=2, label=f"alpha=100, m={rr100.coef_[0]:.2f}")

ax.set_xlabel("x")
ax.set_ylabel("y")
ax.legend(frameon=False, loc="upper left", fontsize=9)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)

plt.tight_layout()
plt.savefig("public/images/ch14-ridge-alpha-lines.png", bbox_inches="tight")
plt.close()

print("saved public/images/ch14-ridge-alpha-lines.png")
