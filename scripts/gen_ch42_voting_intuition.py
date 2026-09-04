"""Generate the voting-ensemble intuition charts for Ch.42.

CampusX 100-days-of-ML, video #103: the intuition-and-proof video for the
voting ensemble. No companion notebook: the video is a whiteboard talk that
works two numeric examples by hand (three independent models at 0.7 accuracy
combine to ~0.784; the same three at 0.3 accuracy collapse to ~0.216). These
charts reproduce that arithmetic exactly and then generalise it.

Chart 1: the eight right/wrong outcomes for three independent models at
p = 0.7, as a bar chart of their probabilities, with the four majority-correct
outcomes highlighted. The highlighted bars sum to 0.784.

Chart 2: the Condorcet curve. For an odd number n of independent models each
correct with probability p, the majority vote is correct with probability
sum_{k>n/2} C(n,k) p^k (1-p)^(n-k). Plotted against p for several n, it shows
the pivot at p = 0.5: above it the ensemble beats the base model and keeps
improving with n; below it the ensemble is worse and gets worse with n.

Run: python3 scripts/gen_ch42_voting_intuition.py
Writes: public/images/ch42-eight-outcomes.png
        public/images/ch42-condorcet-curve.png
"""

import matplotlib.pyplot as plt
import numpy as np
from math import comb
from itertools import product

# --- Chart 1: the eight outcomes for three models at p = 0.7 --------------
p = 0.7
labels, probs, majority_correct = [], [], []
for combo in product([1, 0], repeat=3):  # 1 = correct, 0 = wrong
    prob = 1.0
    for c in combo:
        prob *= p if c else (1 - p)
    labels.append("".join("R" if c else "W" for c in combo))
    probs.append(prob)
    majority_correct.append(sum(combo) >= 2)

order = np.argsort(probs)[::-1]
labels = [labels[i] for i in order]
probs = [probs[i] for i in order]
majority_correct = [majority_correct[i] for i in order]

colors = ["#2563eb" if m else "#d1d5db" for m in majority_correct]
ens_acc = sum(pr for pr, m in zip(probs, majority_correct) if m)

fig, ax = plt.subplots(figsize=(8, 5), dpi=300)
bars = ax.bar(labels, probs, color=colors, edgecolor="#111827", linewidth=0.5)
for b, pr in zip(bars, probs):
    ax.text(b.get_x() + b.get_width() / 2, pr + 0.006, f"{pr:.3f}",
            ha="center", va="bottom", fontsize=9)
ax.set_ylabel("probability of this outcome")
ax.set_xlabel("outcome across the three models  (R = correct, W = wrong)")
ax.set_title(
    f"Three independent models at 0.70 accuracy\n"
    f"blue = majority is correct  →  ensemble accuracy = {ens_acc:.3f}",
    fontsize=11,
)
ax.set_ylim(0, max(probs) * 1.18)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch42-eight-outcomes.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch42-eight-outcomes.png")


# --- Chart 2: the Condorcet curve ---------------------------------------
def majority_accuracy(n, p):
    """P(at least ceil(n/2)+... i.e. > n/2 of n independent models correct)."""
    p = np.asarray(p, dtype=float)
    need = n // 2 + 1
    out = np.zeros_like(p)
    for k in range(need, n + 1):
        out += float(comb(n, k)) * p**k * (1 - p) ** (n - k)
    return out


pp = np.linspace(0, 1, 500)
fig, ax = plt.subplots(figsize=(8, 5.5), dpi=300)
ax.plot(pp, pp, color="#111827", linewidth=1.5, linestyle="--",
        label="single model (baseline)")
for n, col in [(3, "#93c5fd"), (11, "#60a5fa"), (51, "#2563eb"), (201, "#1e3a8a")]:
    ax.plot(pp, majority_accuracy(n, pp), color=col, linewidth=2,
            label=f"majority vote of {n}")

# the video's two hand-worked points
ax.scatter([0.7, 0.3], [majority_accuracy(3, 0.7), majority_accuracy(3, 0.3)],
           color="#dc2626", zorder=5, s=40)
ax.annotate("0.70 → 0.784", (0.7, majority_accuracy(3, 0.7)),
            textcoords="offset points", xytext=(8, -14), fontsize=9, color="#dc2626")
ax.annotate("0.30 → 0.216", (0.3, majority_accuracy(3, 0.3)),
            textcoords="offset points", xytext=(-88, 6), fontsize=9, color="#dc2626")

ax.axvline(0.5, color="#9ca3af", linewidth=1, linestyle=":")
ax.set_xlabel("accuracy of each individual base model  (p)")
ax.set_ylabel("accuracy of the majority vote")
ax.set_title("Voting helps only when the base models beat a coin flip", fontsize=11)
ax.legend(frameon=False, loc="upper left", fontsize=9)
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch42-condorcet-curve.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch42-condorcet-curve.png")
