"""Generate a real before/after feature-scaling comparison for Ch.7.

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

Rendered as two 3D bowl surfaces with the gradient descent path traced on
top, so the "stretched canyon vs. round bowl" shape is visible directly
instead of only being inferred from contour spacing.

Run: python3 scripts/gen_ch7_feature_scaling.py
Writes: public/images/ch7-feature-scaling.png
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401


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


steps = 40
w0 = [1.0, 5.0]

a_unscaled, b_unscaled = 25, 1
lr_unscaled = 0.035
path_unscaled = run(a_unscaled, b_unscaled, lr_unscaled, steps, w0)

a_scaled, b_scaled = 1, 1
lr_scaled = 0.3
path_scaled = run(a_scaled, b_scaled, lr_scaled, steps, w0)

fig = plt.figure(figsize=(13, 6))

w1_range = np.linspace(-2, 2, 120)
w2_range = np.linspace(-1, 6, 120)
W1, W2 = np.meshgrid(w1_range, w2_range)

for i, (a, b, path, lr, title) in enumerate(
    [
        (a_unscaled, b_unscaled, path_unscaled, lr_unscaled, "Unscaled Features (std ratio 5:1)"),
        (a_scaled, b_scaled, path_scaled, lr_scaled, "Standardized Features (equal variance)"),
    ]
):
    ax = fig.add_subplot(1, 2, i + 1, projection="3d")
    Z = loss(a, b, W1, W2)

    ax.plot_surface(W1, W2, Z, cmap="Blues", alpha=0.55, linewidth=0, antialiased=True, rstride=2, cstride=2)
    ax.contour(W1, W2, Z, levels=15, cmap="Blues", offset=Z.min(), alpha=0.5)

    path_z = loss(a, b, path[:, 0], path[:, 1])
    ax.plot(path[:, 0], path[:, 1], path_z, color="#e6194b", linewidth=2, marker="o", markersize=3, zorder=10)
    ax.scatter([w0[0]], [w0[1]], [loss(a, b, w0[0], w0[1])], color="#4363d8", s=60, zorder=11, label="Start")
    ax.scatter([0], [0], [0], color="black", marker="*", s=140, zorder=11, label="Minimum")

    ax.set_title(f"{title}\nlr={lr}, {steps} steps, final w2={path[-1,1]:.3f}", fontsize=10, fontweight="bold")
    ax.set_xlabel("w1")
    ax.set_ylabel("w2")
    ax.set_zlabel("Loss")
    ax.view_init(elev=28, azim=-60)
    ax.legend(fontsize=8, loc="upper left")

plt.tight_layout()
plt.savefig("public/images/ch7-feature-scaling.png", dpi=150)
print("unscaled final w:", path_unscaled[-1])
print("scaled final w:", path_scaled[-1])
