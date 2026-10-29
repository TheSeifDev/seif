"""Extract only the opaque person silhouette for the SVG shield.

Requires Pillow, numpy and opencv-python-headless in an isolated Python environment.
The source portrait is never overwritten or recolored. Low-alpha artifacts and
isolated pixels are excluded; dimensions and alignment remain 1200 × 1600.
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "public/images/seif-portrait.webp"
output = ROOT / "public/images/portrait-silhouette.png"
image = Image.open(source).convert("RGBA")
alpha = np.asarray(image.getchannel("A"))
binary = (alpha >= 100).astype(np.uint8) * 255
_, labels, stats, _ = cv2.connectedComponentsWithStats(binary)
main = 1 + int(stats[1:, cv2.CC_STAT_AREA].argmax())
mask = (labels == main).astype(np.uint8) * 255
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
rgba = np.full((*mask.shape, 4), 255, dtype=np.uint8)
rgba[:, :, 3] = mask
Image.fromarray(rgba).save(output, optimize=True)
print(output, image.size, output.stat().st_size)
