"""Generate the kernel trick diagrams for Ch.35.

Source auto-transcript for this video was unusable (see ch35.txt, garbled
Hindi ASR); the user watched the video directly and described its two
whiteboard examples, which this script reproduces with real data and real
transformations:

1. A 1D line, red-green-red, not linearly separable by any single threshold.
   Squaring each point (x -> x^2) lifts it to 2D, where a line does separate
   the classes.
2. A 2D dataset, concentric circles (green ring around a red core... or vice
   versa), not linearly separable by any line. An RBF-style transformation
   z = exp(-(x^2+y^2)) lifts it to 3D, where a plane does separate the classes.

Both are rendered with Plotly (per the user's request) and exported to
static PNGs via kaleido for embedding in the post.

Run: python3 scripts/gen_ch35_kernel_trick.py
Writes: public/images/ch35-kernel-trick-1d-to-2d.png
        public/images/ch35-kernel-trick-2d-to-3d.png
"""

import numpy as np
import plotly.graph_objects as go
from PIL import Image, ImageChops


def autocrop(path, pad=30):
    img = Image.open(path)
    bg = Image.new(img.mode, img.size, (255, 255, 255, 255) if img.mode == "RGBA" else "white")
    diff = ImageChops.difference(img.convert(bg.mode), bg)
    bbox = diff.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        left = max(0, left - pad)
        top = max(0, top - pad)
        right = min(img.width, right + pad)
        bottom = min(img.height, bottom + pad)
        img.crop((left, top, right, bottom)).save(path)

RED = "#dc2626"
GREEN = "#16a34a"
BLUE = "#2563eb"

# --- Example 1: 1D line, red-green-red -> square transform lifts to 2D ---

rng = np.random.default_rng(11)
x_red_outer = np.concatenate([rng.uniform(-6, -3, 6), rng.uniform(3, 6, 6)])
x_green = rng.uniform(-2, 2, 10)
x = np.concatenate([x_red_outer, x_green])
y = np.array([0] * len(x_red_outer) + [1] * len(x_green))  # 0 = red, 1 = green

z = x ** 2

fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=x[y == 0], y=z[y == 0],
    mode="markers", marker=dict(color=RED, size=11, symbol="x", line=dict(width=2)),
    name="red: x²",
))
fig1.add_trace(go.Scatter(
    x=x[y == 1], y=z[y == 1],
    mode="markers", marker=dict(color=GREEN, size=13, symbol="cross", line=dict(width=2)),
    name="green: x²",
))
threshold = (z[y == 1].max() + z[y == 0].min()) / 2
fig1.add_trace(go.Scatter(
    x=[x.min() - 1, x.max() + 1], y=[threshold, threshold],
    mode="lines", line=dict(color=BLUE, width=2.5, dash="dash"),
    name="separating line",
))
fig1.add_trace(go.Scatter(
    x=x[y == 0], y=np.full((y == 0).sum(), -3.5),
    mode="markers", marker=dict(color=RED, size=10, symbol="x", opacity=0.5),
    name="red: original 1D position",
))
fig1.add_trace(go.Scatter(
    x=x[y == 1], y=np.full((y == 1).sum(), -3.5),
    mode="markers", marker=dict(color=GREEN, size=12, symbol="cross", opacity=0.5),
    name="green: original 1D position",
))

fig1.update_layout(
    title=dict(
        text="1D data (bottom row) lifted by z = x² (top)<br><sup>no threshold on x separates red/green, but a line on x² does</sup>",
        x=0.5, xanchor="center",
    ),
    xaxis_title="x",
    yaxis_title="z = x²   (bottom row: original x, all at z ≈ -3.5)",
    template="plotly_white",
    paper_bgcolor="white",
    width=1100, height=650,
    margin=dict(t=110, b=60, l=80, r=40),
    font=dict(size=13),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="center", x=0.5),
)
fig1.write_image("public/images/ch35-kernel-trick-1d-to-2d.png", scale=2)
autocrop("public/images/ch35-kernel-trick-1d-to-2d.png")
print("Wrote public/images/ch35-kernel-trick-1d-to-2d.png")

# --- Example 2: concentric circles -> RBF transform lifts to 3D ---

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

X2 = np.concatenate([x_inner, x_outer])
Y2 = np.concatenate([y_inner, y_outer])
labels = np.array([0] * n + [1] * n)  # 0 = red (inner), 1 = green (outer ring)

z_rbf = np.exp(-(X2 ** 2 + Y2 ** 2))

fig2 = go.Figure()
fig2.add_trace(go.Scatter3d(
    x=X2[labels == 0], y=Y2[labels == 0], z=z_rbf[labels == 0],
    mode="markers", marker=dict(color=RED, size=4, symbol="x"),
    name="red (inner cluster)",
))
fig2.add_trace(go.Scatter3d(
    x=X2[labels == 1], y=Y2[labels == 1], z=z_rbf[labels == 1],
    mode="markers", marker=dict(color=GREEN, size=4, symbol="cross"),
    name="green (outer ring)",
))

grid = np.linspace(-3, 3, 2)
gx, gy = np.meshgrid(grid, grid)
plane_z = np.full_like(gx, 0.25)
fig2.add_trace(go.Surface(
    x=gx, y=gy, z=plane_z, showscale=False, opacity=0.35,
    colorscale=[[0, BLUE], [1, BLUE]],
    name="separating plane", showlegend=True,
))

fig2.update_layout(
    title=dict(
        text="Concentric circles lifted by z = exp(-(x²+y²))<br><sup>no line separates them in 2D, but a plane does in 3D</sup>",
        x=0.5, xanchor="center",
    ),
    scene=dict(
        xaxis_title="x", yaxis_title="y", zaxis_title="z = exp(-(x²+y²))",
        camera=dict(eye=dict(x=1.6, y=-1.6, z=0.9), center=dict(x=0, y=0, z=-0.15)),
        aspectmode="cube",
        domain=dict(x=[0, 1], y=[0, 1]),
    ),
    template="plotly_white",
    paper_bgcolor="white",
    width=850, height=850,
    margin=dict(t=80, b=0, l=0, r=0),
    font=dict(size=13),
    legend=dict(orientation="h", yanchor="bottom", y=0.05, xanchor="center", x=0.5),
)
fig2.write_image("public/images/ch35-kernel-trick-2d-to-3d.png", scale=2)
autocrop("public/images/ch35-kernel-trick-2d-to-3d.png")
print("Wrote public/images/ch35-kernel-trick-2d-to-3d.png")
