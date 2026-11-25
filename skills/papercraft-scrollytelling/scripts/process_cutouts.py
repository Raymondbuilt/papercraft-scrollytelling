#!/usr/bin/env python3
"""
Automated Papercraft Cutout Pipeline:
- Strips solid #FF00FF magenta background with smooth anti-aliased alpha
- Despills residual pink fringe into warm cream cardstock (#F2E8D5)
- Masks out bottom-right corner AI watermarks
- Auto-slices 2x2 or 1xN sprite sheets via connected components
- Exports crisp WebP cutouts + manifest.json
"""
import argparse, json, os
import cv2
import numpy as np
from PIL import Image

def chroma_key_magenta(img_rgb):
    arr = img_rgb.astype(np.float32)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    rb_min = np.minimum(r, b)
    rb_diff = np.abs(r - b)
    mag_excess = rb_min - g
    is_mag_hue = (rb_diff < 95) & (r > g + 20) & (b > g + 20)

    t = np.clip((mag_excess - 35.0) / 60.0, 0.0, 1.0)
    alpha = np.where(is_mag_hue, 1.0 - t, 1.0)

    h, w = r.shape
    alpha[int(h * 0.925):, int(w * 0.925):] = 0.0

    binary = cv2.morphologyEx((alpha > 0.5).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3,3), np.uint8))
    alpha = np.where(binary > 0, alpha, 0.0)

    edge_dilated = cv2.dilate((alpha < 0.95).astype(np.uint8), np.ones((5,5), np.uint8)) > 0
    fringe = edge_dilated & (alpha > 0.0) & (mag_excess > 12.0) & (rb_diff < 80)

    out_r = np.where(fringe, np.clip(r * 0.4 + 242 * 0.6, 0, 255), r)
    out_g = np.where(fringe, np.clip(g * 0.4 + 232 * 0.6, 0, 255), g)
    out_b = np.where(fringe, np.clip(b * 0.4 + 213 * 0.6, 0, 255), b)

    return np.stack([
        out_r.astype(np.uint8), out_g.astype(np.uint8), out_b.astype(np.uint8),
        np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    ], axis=-1)

def slice_components(rgba, sort_mode="left_to_right"):
    h, w, _ = rgba.shape
    mask = (rgba[:,:,3] > 128).astype(np.uint8)
    dil = cv2.dilate(mask, np.ones((15, 15), np.uint8))
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(dil)
    min_area = h * w * 0.004
    comps = []
    for i in range(1, num_labels):
        x, y, cw, ch, area = stats[i]
        if area >= min_area:
            comps.append({"id": i, "x": x, "y": y, "w": cw, "h": ch, "cx": centroids[i][0], "cy": centroids[i][1]})
    if sort_mode == "grid_2x2":
        top = sorted([c for c in comps if c["cy"] < h * 0.5], key=lambda c: c["cx"])
        bot = sorted([c for c in comps if c["cy"] >= h * 0.5], key=lambda c: c["cx"])
        comps = top + bot
    else:
        comps = sorted(comps, key=lambda c: c["cx"])

    out = []
    for c in comps:
        x0, y0 = max(0, c["x"] - 8), max(0, c["y"] - 8)
        x1, y1 = min(w, c["x"] + c["w"] + 8), min(h, c["y"] + c["h"] + 8)
        crop = rgba[y0:y1, x0:x1].copy()
        sub_labels = labels[y0:y1, x0:x1]
        crop[(sub_labels != c["id"]) & (sub_labels != 0), 3] = 0
        ys, xs = np.where(crop[:,:,3] > 10)
        if len(xs) > 0:
            crop = crop[max(0, ys.min()-4):min(crop.shape[0], ys.max()+5),
                        max(0, xs.min()-4):min(crop.shape[1], xs.max()+5)]
        out.append(crop)
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="Folder of #FF00FF raw images")
    ap.add_argument("--output", required=True, help="Output folder for WebP cutouts")
    ap.add_argument("--max-dim", type=int, default=960)
    args = ap.parse_args()
    os.makedirs(args.output, exist_ok=True)
    manifest = {}
    for fname in sorted(os.listdir(args.input)):
        if not fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            continue
        stem = os.path.splitext(fname)[0]
        rgb = np.array(Image.open(os.path.join(args.input, fname)).convert("RGB"))
        rgba = chroma_key_magenta(rgb)
        parts = slice_components(rgba)
        for idx, part in enumerate(parts):
            im = Image.fromarray(part, "RGBA")
            w, h = im.size
            s = min(1.0, args.max_dim / max(w, h))
            if s < 1.0:
                im = im.resize((int(w*s), int(h*s)), Image.Resampling.LANCZOS)
            key = stem if len(parts) == 1 else f"{stem}_{idx+1}"
            out_file = f"{key}.webp"
            im.save(os.path.join(args.output, out_file), "WEBP", quality=90, method=4)
            manifest[key] = {"file": out_file, "w": im.size[0], "h": im.size[1], "aspect": round(im.size[0]/im.size[1], 4)}
    with open(os.path.join(args.output, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Processed {len(manifest)} cutouts into {args.output}")

if __name__ == "__main__":
    main()
