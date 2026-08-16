"""Generate a real non-convex loss surface with a saddle point plus three
batch gradient descent trajectories for Ch.7's saddle-point section.

Uses f(x, y) = x^4 - 2x^2 + y^2, a classic double-well surface:
  - global minima at (-1, 0) and (1, 0), f = -1
  - a saddle point at (0, 0), f = 0 (max along x, min along y)

Run: python3 scripts/gen_ch7_nonconvex.py
Writes: public/data/ch7-nonconvex-surface.json
"""

import json


def f(x, y):
    return x**4 - 2 * x**2 + y**2


def grad(x, y):
    return 4 * x**3 - 4 * x, 2 * y


def run(x0, y0, lr, steps):
    x, y = x0, y0
    traj = [{"x": x, "y": y, "z": f(x, y)}]
    for _ in range(steps):
        gx, gy = grad(x, y)
        x -= lr * gx
        y -= lr * gy
        traj.append({"x": x, "y": y, "z": f(x, y)})
    return traj


lr = 0.05
steps = 150

trajectories = {
    "left": run(-1.5, 1.2, lr, steps),
    "right": run(1.5, -1.2, lr, steps),
    "saddle": run(0.01, 1.0, lr, steps),
}

n = 60
x_grid = [-2.0 + 4.0 * i / (n - 1) for i in range(n)]
y_grid = [-2.0 + 4.0 * i / (n - 1) for i in range(n)]
z_grid = [[f(xv, yv) for xv in x_grid] for yv in y_grid]

data = {
    "x": x_grid,
    "y": y_grid,
    "z": z_grid,
    "minima": [{"x": -1.0, "y": 0.0, "z": -1.0}, {"x": 1.0, "y": 0.0, "z": -1.0}],
    "saddle": {"x": 0.0, "y": 0.0, "z": 0.0},
    "trajectories": trajectories,
}

with open("public/data/ch7-nonconvex-surface.json", "w") as fh:
    json.dump(data, fh)

print("Wrote public/data/ch7-nonconvex-surface.json")
for name, traj in trajectories.items():
    print(name, "start", traj[0], "end", traj[-1])
