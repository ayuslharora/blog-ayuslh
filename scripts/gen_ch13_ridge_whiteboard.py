import numpy as np
import matplotlib.pyplot as plt

# ---------------------------------------------------------------------------
# Recreates the whiteboard example from the video: two training points get
# fit exactly by a steep, unregularized line (L_N), while a shallower,
# regularized line (L_R) undershoots them slightly. A wider cloud of test
# points is generated independently and sits off the training points'
# trajectory, showing why the steep line fails to generalize.
# ---------------------------------------------------------------------------
rng = np.random.RandomState(13)

X_train = np.array([1.0, 3.0])
y_train = np.array([2.3, 5.3])

n_test = 22
X_test = rng.uniform(0.2, 5.8, n_test)
y_test = 0.85 * X_test + 1.7 + rng.normal(0, 0.55, n_test)

def L_N(x):
    return 1.5 * x + 0.8

def L_R(x):
    return 0.9 * x + 1.5

x_line = np.linspace(-0.3, 6.2, 200)

fig, ax = plt.subplots(figsize=(8, 5.5), dpi=300)

ax.plot(x_line, L_N(x_line), color="#dc2626", linewidth=2, label=r"$L_N$: $y=1.5x+0.8$ (unregularized)")
ax.plot(x_line, L_R(x_line), color="#2563eb", linewidth=2, label=r"$L_R$: $y=0.9x+1.5$ (ridge)")

ax.scatter(X_test, y_test, marker="x", color="#111827", s=70, linewidths=2, label="test points", zorder=3)
ax.scatter(X_train, y_train, facecolors="#2563eb", edgecolors="white", s=110, linewidths=1.5, label="train points", zorder=4)

for x, y in zip(X_train, y_train):
    ax.annotate(f"({x:g}, {y:g})", (x, y), textcoords="offset points", xytext=(10, -14), fontsize=9, color="#1e3a8a")

ax.set_xlim(-0.3, 6.2)
ax.set_ylim(0, 8)
ax.set_xlabel("x")
ax.set_ylabel("y")
ax.legend(frameon=False, loc="upper left", fontsize=9)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)

plt.tight_layout()
plt.savefig("public/images/ch13-ridge-train-test-whiteboard.png", bbox_inches="tight")
plt.close()

print("saved public/images/ch13-ridge-train-test-whiteboard.png")
