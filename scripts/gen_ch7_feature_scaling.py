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

Run: python3 scripts/gen_ch7_feature_scaling.py
Writes: public/images/ch7-feature-scaling.png
"""

import numpy as np
import matplotlib.pyplot as plt


def run(a, b, lr, steps, w0):
    w = np.array(w0, dtype=float)
    path = [w.copy()]
    for _ in range(steps):
        grad = np.array([2 * a * w[0], 2 * b * w[1]])
        w = w - lr * grad
        path.append(w.copy())
    return np.array(path)


steps = 40
w0 = [1.0, 5.0]

a_unscaled, b_unscaled = 25, 1
lr_unscaled = 0.035
path_unscaled = run(a_unscaled, b_unscaled, lr_unscaled, steps, w0)

a_scaled, b_scaled = 1, 1
lr_scaled = 0.3
path_scaled = run(a_scaled, b_scaled, lr_scaled, steps, w0)

fig, axes = plt.subplots(1, 2, figsize=(13, 5.5))

w1_range = np.linspace(-2, 2, 200)
w2_range = np.linspace(-1, 6, 200)
W1, W2 = np.meshgrid(w1_range, w2_range)

for ax, (a, b, path, lr, title) in zip(
    axes,
    [
        (a_unscaled, b_unscaled, path_unscaled, lr_unscaled, "Unscaled Features (std ratio 5:1)"),
        (a_scaled, b_scaled, path_scaled, lr_scaled, "Standardized Features (equal variance)"),
    ],
):
    Z = a * W1**2 + b * W2**2
    ax.contour(W1, W2, Z, levels=20, cmap="Blues", alpha=0.7)
    ax.plot(path[:, 0], path[:, 1], color="#e6194b", linewidth=1.5, marker="o", markersize=3)
    ax.scatter([w0[0]], [w0[1]], color="#4363d8", s=50, zorder=5, label="Start")
    ax.scatter([0], [0], color="black", marker="*", s=120, zorder=5, label="Minimum")
    ax.set_title(f"{title}\nlr={lr}, {steps} steps, final w2={path[-1,1]:.3f}", fontsize=10, fontweight="bold")
    ax.set_xlabel("w1")
    ax.set_ylabel("w2")
    ax.legend(fontsize=8, loc="upper right")
    ax.grid(alpha=0.2)

plt.tight_layout()
plt.savefig("public/images/ch7-feature-scaling.png", dpi=150)
print("unscaled final w:", path_unscaled[-1])
print("scaled final w:", path_scaled[-1])
