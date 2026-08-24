import json

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

rng = np.random.RandomState(42)

n = 120
x1 = rng.uniform(-3, 3, n)
x2 = rng.uniform(-3, 3, n)
z = 0.6 * x1**2 + 0.6 * x2**2 + rng.normal(0, 1.5, n)

X = np.column_stack([x1, x2])

lin_reg = LinearRegression()
lin_reg.fit(X, z)

poly = PolynomialFeatures(degree=2, include_bias=False)
X_poly = poly.fit_transform(X)
poly_reg = LinearRegression()
poly_reg.fit(X_poly, z)

grid = np.linspace(-3, 3, 30)
gx1, gx2 = np.meshgrid(grid, grid)
grid_points = np.column_stack([gx1.ravel(), gx2.ravel()])

plane_z = lin_reg.predict(grid_points).reshape(gx1.shape)
poly_z = poly_reg.predict(poly.transform(grid_points)).reshape(gx1.shape)

data = {
    "points": {"x": x1.tolist(), "y": x2.tolist(), "z": z.tolist()},
    "plane": {"x": grid.tolist(), "y": grid.tolist(), "z": plane_z.tolist()},
    "surface": {"x": grid.tolist(), "y": grid.tolist(), "z": poly_z.tolist()},
}

with open("public/data/ch11-3d-linear-vs-polynomial.json", "w") as f:
    json.dump(data, f)

print("wrote public/data/ch11-3d-linear-vs-polynomial.json")
