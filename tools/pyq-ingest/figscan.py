"""Finds diagrams in question crops without any model: remove every pixel that belongs to a word of the PDF text layer, then look
for a big connected blob of the ink that is left. Input json: [{"file":..., "words":[[x0,y0,x1,y1],...]}] (pixels of the crop).
Output json: {file: {"fig": bool, "blob": [w,h], "ink": ratio}}. Needs Pillow + numpy only."""
import json, sys
import numpy as np
from PIL import Image
def scan(item):
    dpi = item.get("dpi", 110); CELL = max(3, round(dpi / 18))      # thresholds are in inches so the result does not depend on the render resolution
    im = np.asarray(Image.open(item["file"]).convert("L"))
    h, w = im.shape
    ink = im < 150
    for x0, y0, x1, y1 in item["words"]:
        ink[max(0, int(y0) - 3):int(y1) + 4, max(0, int(x0) - 3):int(x1) + 4] = False
    ink[:, :4] = False; ink[:, w - 4:] = False; ink[:4, :] = False; ink[h - 4:, :] = False
    ch, cw = h // CELL, w // CELL
    if ch == 0 or cw == 0: return {"fig": False, "blob": [0, 0], "ink": 0}
    cells = ink[:ch * CELL, :cw * CELL].reshape(ch, CELL, cw, CELL).mean(axis=(1, 3)) > 0.06
    seen = np.zeros_like(cells); best = (0, 0, 0)
    for sy in range(ch):
        for sx in range(cw):
            if cells[sy, sx] and not seen[sy, sx]:
                st = [(sy, sx)]; seen[sy, sx] = True; ys = []; xs = []
                while st:
                    y, x = st.pop(); ys.append(y); xs.append(x)
                    for dy in (-2, -1, 0, 1, 2):          # small gaps (dashed lines, thin strokes) do not split a figure
                        for dx in (-2, -1, 0, 1, 2):
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < ch and 0 <= nx < cw and cells[ny, nx] and not seen[ny, nx]:
                                seen[ny, nx] = True; st.append((ny, nx))
                bw, bh = (max(xs) - min(xs) + 1) * CELL, (max(ys) - min(ys) + 1) * CELL
                if bw * bh > best[0] * best[1] or best == (0, 0, 0): best = (bw, bh, len(ys))
    bw, bh, n = best
    return {"fig": bw >= 0.6 * dpi and bh >= 0.55 * dpi and n >= 0.6 * (0.33 * dpi / CELL) ** 2, "blob": [int(bw), int(bh)], "ink": round(float(ink.mean()), 4)}
if __name__ == "__main__":
    items = json.load(open(sys.argv[1]))
    print(json.dumps({it["file"]: scan(it) for it in items}))
