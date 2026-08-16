"""Generate a real L(m, b) cost surface grid plus the batch GD trajectory for
Ch.7's interactive 3D plot, reusing the same dataset as gen_ch7_gd_data.py.

Run: python3 scripts/gen_ch7_cost_surface.py
Writes: public/data/ch7-cost-surface.json
"""

import json

import numpy as np
from sklearn.datasets import make_regression
from sklearn.linear_model import LinearRegression

X, y = make_regression(
    n_samples=100, n_features=1, n_informative=1, n_targets=1, noise=20, random_state=13
)
x_flat = X.ravel()

ols = LinearRegression().fit(X, y)
m_star, b_star = float(ols.coef_[0]), float(ols.intercept_)

m_start, b_start = 100.0, -120.0
learning_rate = 0.001
epochs = 60

trace = []
m, b = m_start, b_start
for _ in range(epochs):
    y_pred = m * x_flat + b
    cost = float(np.sum((y - y_pred) ** 2))
    trace.append({"m": float(m), "b": float(b), "cost": cost})
    slope_b = -2 * np.sum(y - y_pred)
    slope_m = -2 * np.sum((y - y_pred) * x_flat)
    b = b - learning_rate * slope_b
    m = m - learning_rate * slope_m

m_grid = np.linspace(-20, 110, 60)
b_grid = np.linspace(-140, 50, 60)
cost_grid = np.zeros((len(b_grid), len(m_grid)))
for i, bv in enumerate(b_grid):
    for j, mv in enumerate(m_grid):
        y_pred = mv * x_flat + bv
        cost_grid[i, j] = np.sum((y - y_pred) ** 2)

data = {
    "m": m_grid.tolist(),
    "b": b_grid.tolist(),
    "cost": cost_grid.tolist(),
    "mStar": m_star,
    "bStar": b_star,
    "costStar": float(np.sum((y - (m_star * x_flat + b_star)) ** 2)),
    "trace": trace,
}

with open("public/data/ch7-cost-surface.json", "w") as f:
    json.dump(data, f)

print("Wrote public/data/ch7-cost-surface.json")
