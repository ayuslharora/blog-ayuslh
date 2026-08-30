"""Generate the entropy/Gini and information-gain charts for Ch.38.

No companion notebook exists for this video in the CampusX 100-days-of-ML
repo, so this uses the classic "Play Tennis" dataset (Mitchell's Machine
Learning textbook / Quinlan's ID3 paper) that the video's own worked example
is drawn from, plus its well-known continuous-attribute variant (Quinlan,
"Induction of Decision Trees", 1986) for the numeric-splitting section. All
entropy / information-gain / Gini numbers below are computed for real from
this data, not invented.

Run: python3 scripts/gen_ch38_entropy_gini.py
Writes: public/images/ch38-entropy-vs-probability.png
        public/images/ch38-entropy-vs-gini.png
        public/images/ch38-information-gain-by-feature.png
        public/images/ch38-numeric-threshold-sweep.png
"""

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# --- The Play Tennis dataset -------------------------------------------------
data = pd.DataFrame({
    "outlook":     ["sunny", "sunny", "overcast", "rain", "rain", "rain", "overcast",
                     "sunny", "sunny", "rain", "sunny", "overcast", "overcast", "rain"],
    "temperature": [85, 80, 83, 70, 68, 65, 64, 72, 69, 75, 75, 72, 81, 71],  # Fahrenheit
    "humidity":    ["high", "high", "high", "high", "normal", "normal", "normal",
                     "high", "normal", "normal", "normal", "high", "normal", "high"],
    "wind":        ["weak", "strong", "weak", "weak", "weak", "strong", "strong",
                     "weak", "weak", "weak", "strong", "strong", "weak", "strong"],
    "play":        ["no", "no", "yes", "yes", "yes", "no", "yes",
                     "no", "yes", "yes", "yes", "yes", "yes", "no"],
})


def entropy(labels):
    counts = pd.Series(labels).value_counts(normalize=True)
    return -(counts * np.log2(counts)).sum()


def gini(labels):
    counts = pd.Series(labels).value_counts(normalize=True)
    return 1 - (counts ** 2).sum()


def information_gain(df, feature, target="play", impurity=entropy):
    parent = impurity(df[target])
    weighted_child = sum(
        (len(sub) / len(df)) * impurity(sub[target])
        for _, sub in df.groupby(feature)
    )
    return parent - weighted_child


root_entropy = entropy(data["play"])
print(f"root entropy H(S) = {root_entropy:.4f}  (9 yes / 5 no)")

for feat in ["outlook", "humidity", "wind"]:
    ig = information_gain(data, feat)
    print(f"information gain on {feat}: {ig:.4f}")

# --- Chart 1: entropy vs probability, binary case ----------------------------
p = np.linspace(0.001, 0.999, 400)
h = -p * np.log2(p) - (1 - p) * np.log2(1 - p)

fig, ax = plt.subplots(figsize=(7, 5), dpi=300)
ax.plot(p, h, color="#2563eb", linewidth=2.5)
ax.axvline(0.5, color="#9ca3af", linestyle="--", linewidth=1)
ax.scatter([0.5], [1.0], color="#dc2626", s=60, zorder=5)
ax.annotate("max uncertainty\nH = 1 at p = 0.5", xy=(0.5, 1.0), xytext=(0.58, 0.75),
            fontsize=10, color="#dc2626")
ax.set_xlabel("P(class = yes)")
ax.set_ylabel("Entropy H(p)")
ax.set_xlim(0, 1)
ax.set_ylim(0, 1.05)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch38-entropy-vs-probability.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch38-entropy-vs-probability.png")

# --- Chart 2: entropy vs Gini impurity, overlaid -----------------------------
g = 1 - p ** 2 - (1 - p) ** 2

fig, ax = plt.subplots(figsize=(7, 5), dpi=300)
ax.plot(p, h, color="#2563eb", linewidth=2.5, label="entropy")
ax.plot(p, g, color="#16a34a", linewidth=2.5, label="Gini impurity")
ax.set_xlabel("P(class = yes)")
ax.set_ylabel("Impurity")
ax.set_xlim(0, 1)
ax.set_ylim(0, 1.05)
ax.legend(frameon=False)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch38-entropy-vs-gini.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch38-entropy-vs-gini.png")

# --- Chart 3: information gain per feature, real computed values ------------
feats = ["outlook", "humidity", "wind"]
igs = [information_gain(data, f) for f in feats]

fig, ax = plt.subplots(figsize=(7, 5), dpi=300)
bars = ax.bar(feats, igs, color=["#2563eb", "#16a34a", "#dc2626"], width=0.5)
for bar, val in zip(bars, igs):
    ax.text(bar.get_x() + bar.get_width() / 2, val + 0.01, f"{val:.3f}",
            ha="center", fontsize=10)
ax.set_ylabel("Information gain")
ax.set_ylim(0, max(igs) * 1.3)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch38-information-gain-by-feature.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch38-information-gain-by-feature.png")

# --- Chart 4: numeric threshold sweep on temperature -------------------------
sorted_temps = sorted(data["temperature"].unique())
midpoints = [(a + b) / 2 for a, b in zip(sorted_temps, sorted_temps[1:])]

threshold_igs = []
for t in midpoints:
    left = data[data["temperature"] < t]
    right = data[data["temperature"] >= t]
    weighted = (len(left) / len(data)) * entropy(left["play"]) + \
               (len(right) / len(data)) * entropy(right["play"])
    threshold_igs.append(root_entropy - weighted)

best_idx = int(np.argmax(threshold_igs))
print(f"best temperature threshold: < {midpoints[best_idx]} (IG={threshold_igs[best_idx]:.4f})")

fig, ax = plt.subplots(figsize=(8, 5), dpi=300)
ax.plot(midpoints, threshold_igs, color="#2563eb", linewidth=2, marker="o", markersize=5)
ax.scatter([midpoints[best_idx]], [threshold_igs[best_idx]], color="#dc2626", s=100, zorder=5,
           label=f"best: temperature < {midpoints[best_idx]}")
ax.set_xlabel("candidate threshold (temperature, °F)")
ax.set_ylabel("information gain")
ax.legend(frameon=False)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
plt.tight_layout()
plt.savefig("public/images/ch38-numeric-threshold-sweep.png", bbox_inches="tight")
plt.close()
print("Wrote public/images/ch38-numeric-threshold-sweep.png")
