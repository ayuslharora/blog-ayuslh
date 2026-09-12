"""Ch.35: JSON data for the interactive RBF-lift 3D explorer.

Same concentric-circles data and z = exp(-(x^2+y^2)) transform as the static
ch35-kernel-trick-2d-to-3d.png chart (gen_ch35_kernel_trick.py), exported as
JSON so the post can embed a real, rotatable Plotly component instead of a
flat screenshot.
"""
import json
from pathlib import Path

import numpy as np

rng = np.random.default_rng(7)
n = 90
theta_inner = rng.uniform(0, 2 * np.pi, n)
r_inner = rng.normal(1.0, 0.12, n)
x_inner = r_inner * np.cos(theta_inner)
y_inner = r_inner * np.sin(theta_inner)

theta_outer = rng.uniform(0, 2 * np.pi, n)
r_outer = rng.normal(2.6, 0.15, n)
x_outer = r_outer * np.cos(theta_outer)
y_outer = r_outer * np.sin(theta_outer)

X = np.concatenate([x_inner, x_outer])
Y = np.concatenate([y_inner, y_outer])
labels = np.array([0] * n + [1] * n)  # 0 = red (inner), 1 = green (outer ring)

z_rbf = np.exp(-(X ** 2 + Y ** 2))

out = {
    "points": {
        "x": [float(v) for v in X],
        "y": [float(v) for v in Y],
        "z0": [0.0 for _ in X],          # original (flat, unseparable) position
        "z_rbf": [float(v) for v in z_rbf],  # lifted position
        "label": [int(v) for v in labels],
    },
    "plane_z": 0.25,
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch35-kernel-lift.json"
dst.write_text(json.dumps(out))
print("wrote", dst)
