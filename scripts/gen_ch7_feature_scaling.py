"""Generate a real before/after feature-scaling comparison for Ch.7's
interactive 3D plot.

For MSE loss, the curvature of L(w) along a weight's axis scales with that
feature's variance (Hessian ~ 2 * X^T X). A feature with 5x the standard
deviation of another contributes ~25x the curvature along its axis, so we
model that directly with a quadratic bowl L(w1, w2) = a*w1^2 + b*w2^2:
  - unscaled: a=25, b=1  (mimics one feature's std being 5x the other's)
  - standardized: a=1, b=1  (equal variance after scaling -> circular bowl)

The learning rate is picked as the largest stable rate for each bowl's
steepest direction (barely under 1/a), which is what you're forced into in
practice: a single global learning rate has to respect the steepest
direction, starving progress along the shallow one.

Run: python3 scripts/gen_ch7_feature_scaling.py
Writes: public/data/ch7-feature-scaling.json
"""

import json

import numpy as np


def run(a, b, lr, steps, w0):
    w = np.array(w0, dtype=float)
    path = [w.copy()]
    for _ in range(steps):
        grad = np.array([2 * a * w[0], 2 * b * w[1]])
        w = w - lr * grad
        path.append(w.copy())
    return np.array(path)


def loss(a, b, w1, w2):
    return a * w1**2 + b * w2**2


def bowl(a, b, lr, steps, w0, title):
    path = run(a, b, lr, steps, w0)
    w1_range = np.linspace(-2, 2, 60)
    w2_range = np.linspace(-1, 6, 60)
    W1, W2 = np.meshgrid(w1_range, w2_range)
    Z = loss(a, b, W1, W2)
    path_z = loss(a, b, path[:, 0], path[:, 1])
    return {
        "title": title,
        "lr": lr,
        "w1": w1_range.tolist(),
        "w2": w2_range.tolist(),
        "z": Z.tolist(),
        "path": {
            "w1": path[:, 0].tolist(),
            "w2": path[:, 1].tolist(),
            "z": path_z.tolist(),
        },
        "start": {"w1": w0[0], "w2": w0[1], "z": float(loss(a, b, w0[0], w0[1]))},
        "finalW2": float(path[-1, 1]),
    }


steps = 40
w0 = [1.0, 5.0]

data = {
    "unscaled": bowl(25, 1, 0.035, steps, w0, "Unscaled Features (std ratio 5:1)"),
    "scaled": bowl(1, 1, 0.3, steps, w0, "Standardized Features (equal variance)"),
    "steps": steps,
}

with open("public/data/ch7-feature-scaling.json", "w") as f:
    json.dump(data, f)

print("unscaled final w2:", data["unscaled"]["finalW2"])
print("scaled final w2:", data["scaled"]["finalW2"])
print("Wrote public/data/ch7-feature-scaling.json")
