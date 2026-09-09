"""Ch.26: F1 (harmonic mean) vs the arithmetic mean as surfaces over (P, R).

Pure function plot, no dataset. F1 = 2PR/(P+R) over precision and recall in
[0, 1], alongside the arithmetic mean (P+R)/2. The F1 sheet sags toward the
lower of the two inputs everywhere off the diagonal; the arithmetic-mean plane
does not. That sag is why a model weak in either precision or recall cannot
hide behind one strong number.
"""
import json
from pathlib import Path

import numpy as np

g = np.linspace(0.01, 1.0, 60)
P, R = np.meshgrid(g, g)
f1 = 2 * P * R / (P + R)
arith = (P + R) / 2.0

out = {
    "p": [float(v) for v in g],
    "r": [float(v) for v in g],
    "f1": [[float(v) for v in row] for row in f1],
    "arithmetic": [[float(v) for v in row] for row in arith],
    "example": {"p": 0.6, "r": 1.0, "f1": float(2 * 0.6 * 1.0 / 1.6), "arith": 0.8},
}
dst = Path(__file__).resolve().parent.parent / "public" / "data" / "ch26-f1-surface.json"
dst.write_text(json.dumps(out))
print("example F1(0.6, 1.0) =", round(out["example"]["f1"], 3), "vs arithmetic 0.8")
print("wrote", dst)
