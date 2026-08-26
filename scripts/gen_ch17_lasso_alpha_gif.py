import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter
from sklearn.datasets import make_regression
from sklearn.linear_model import Lasso

# ---------------------------------------------------------------------------
# Same single-feature dataset as ch17's section 1. Sweeps alpha from 0 up
# past the point where the Lasso coefficient hits exactly zero, animating
# the fitted line flattening toward the mean of y.
# ---------------------------------------------------------------------------
X, y = make_regression(n_samples=100, n_features=1, n_informative=1, n_targets=1, noise=20, random_state=13)

alphas = np.concatenate([
    np.linspace(0.01, 30, 45),
    np.full(15, 30.0),
])

x_line = np.linspace(X.min(), X.max(), 50).reshape(-1, 1)

fig, ax = plt.subplots(figsize=(7, 5), dpi=150)
ax.plot(X, y, "b.", alpha=0.5)
line, = ax.plot([], [], color="#dc2626", linewidth=2.5)
title = ax.set_title("")

ax.set_xlabel("x")
ax.set_ylabel("y")
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
ax.set_xlim(X.min() - 0.3, X.max() + 0.3)
ax.set_ylim(y.min() - 15, y.max() + 15)


def update(i):
    alpha = alphas[i]
    reg = Lasso(alpha=alpha, max_iter=10000)
    reg.fit(X, y)
    y_line = reg.predict(x_line)
    line.set_data(x_line.ravel(), y_line)
    title.set_text(f"alpha={alpha:.1f}   m={reg.coef_[0]:.2f}")
    return line, title


anim = FuncAnimation(fig, update, frames=len(alphas), interval=120, blit=False)
anim.save("public/images/ch17-lasso-alpha-gif.gif", writer=PillowWriter(fps=10))
plt.close()

print("saved public/images/ch17-lasso-alpha-gif.gif")
