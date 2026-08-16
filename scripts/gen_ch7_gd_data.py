"""Generate real gradient descent trace data for Ch.7's interactive animation.

Reproduces CampusX's day51-gradient-descent notebook: make_regression with the
same seed, then batch gradient descent starting from m=100, b=-120 with
lr=0.001 for 60 epochs, tracking (m, b, cost) at every step.

Run: python3 scripts/gen_ch7_gd_data.py
Writes: public/data/ch7-gradient-descent.json
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

m, b = 100.0, -120.0
learning_rate = 0.001
epochs = 60

trace = []
for _ in range(epochs):
    y_pred = m * x_flat + b
    cost = float(np.sum((y - y_pred) ** 2))
    slope_b = -2 * np.sum(y - y_pred)
    slope_m = -2 * np.sum((y - y_pred) * x_flat)
    b = b - learning_rate * slope_b
    m = m - learning_rate * slope_m
    trace.append({"m": float(m), "b": float(b), "cost": cost})

data = {
    "x": x_flat.tolist(),
    "y": y.tolist(),
    "mStar": m_star,
    "bStar": b_star,
    "trace": trace,
}

with open("public/data/ch7-gradient-descent.json", "w") as f:
    json.dump(data, f)

print(f"Wrote public/data/ch7-gradient-descent.json with {epochs} epochs")
print(f"OLS: m={m_star:.4f}, b={b_star:.4f}")
print(f"GD final: m={trace[-1]['m']:.4f}, b={trace[-1]['b']:.4f}")
