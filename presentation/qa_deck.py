"""QA audit for defense-deck.pptx — validity, content, geometry, images, overflow heuristics."""
import io
import math
import os
import sys
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from PIL import Image

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

def safe(s):
    return s.encode("ascii", "replace").decode("ascii")

HERE = os.path.dirname(os.path.abspath(__file__))
DECK = os.path.join(HERE, "defense-deck.pptx")
IMG_DIR = os.path.join(HERE, "..", "images", "defense")

SLIDE_W_IN = 13.333
SLIDE_H_IN = 7.5

prs = Presentation(DECK)
print(f"OPENED OK: {len(prs.slides.__iter__.__self__._sldIdLst)} slides, size {SLIDE_W_IN}x{SLIDE_H_IN}in")
slides = list(prs.slides)
print("slide size EMU:", prs.slide_width, prs.slide_height)

def emu_in(v):
    return v / 914400.0

issues = []
notes_ok = []

for idx, slide in enumerate(slides, 1):
    texts = []
    pic_count = 0
    boxes = []
    for shape in slide.shapes:
        x_in = emu_in(shape.left) if shape.left is not None else 0
        y_in = emu_in(shape.top) if shape.top is not None else 0
        w_in = emu_in(shape.width) if shape.width is not None else 0
        h_in = emu_in(shape.height) if shape.height is not None else 0
        boxes.append((shape.shape_type, x_in, y_in, w_in, h_in, getattr(shape, "name", "")))
        # bounds check (allow title-slide streak to touch edges)
        if x_in < -0.01 or y_in < -0.01 or x_in + w_in > SLIDE_W_IN + 0.01 or y_in + h_in > SLIDE_H_IN + 0.01:
            issues.append(f"  S{idx} OUT-OF-BOUNDS: {shape.shape_type} '{shape.name}' box=({x_in:.2f},{y_in:.2f},{w_in:.2f},{h_in:.2f})")
        if shape.shape_type == 13:  # PICTURE
            pic_count += 1
            src = getattr(shape.image, "blob", None)
            try:
                with Image.open(io.BytesIO(shape.image.blob)) as im:
                    sw, sh = im.size
                aspect_shape = w_in / h_in if h_in else 0
                aspect_src = sw / sh
                if abs(aspect_shape / aspect_src - 1) > 0.03:
                    issues.append(f"  S{idx} IMAGE ASPECT MISMATCH '{shape.name}': shape={aspect_shape:.3f} src={aspect_src:.3f}")
                else:
                    print(f"  S{idx} image '{shape.name}' {w_in:.2f}x{h_in:.2f}in aspect ok ({aspect_src:.3f})")
            except Exception as e:
                issues.append(f"  S{idx} image read fail '{shape.name}': {e}")
        if shape.has_text_frame:
            t = "\n".join(p.text for p in shape.text_frame.paragraphs if p.text.strip())
            if t.strip():
                texts.append(t)
            # overflow heuristic
            if t.strip():
                fontSize_pt = None
                for p in shape.text_frame.paragraphs:
                    for r in p.runs:
                        if r.font.size:
                            fontSize_pt = r.font.size.pt
                if fontSize_pt:
                    est_h = (len(t) / max(1, w_in * 10.0)) * fontSize_pt / 72.0 * 1.35 + 0.1
                    if est_h > h_in * 1.25 and h_in > 0 and est_h - h_in > 0.08:
                        issues.append(f"  S{idx} POSSIBLE VERTICAL OVERFLOW '{shape.name}' box h={h_in:.2f} est={est_h:.2f} text={t[:60]!r}")
    # horizontal overlap check between text-bearing boxes only (card text can overlay nothing else)
    tb = []
    for (typ, x, y, w, h, name) in boxes:
        if typ == MSO_SHAPE_TYPE.TEXT_BOX and x >= 0.3:
            tb.append((name, x, y, w, h, name))
    for i in range(len(tb)):
        for j in range(i + 1, len(tb)):
            a, b = tb[i], tb[j]
            ox = min(a[1] + a[3], b[1] + b[3]) - max(a[1], b[1])
            oy = min(a[2] + a[4], b[2] + b[4]) - max(a[2], b[2])
            if ox > 0.05 and oy > 0.05:
                issues.append(f"  S{idx} TEXT OVERLAP '{a[0]}' vs '{b[0]}' overlap=({ox:.2f},{oy:.2f})")

    print(f"\n=== SLIDE {idx} ===  ({pic_count} pictures, {len(texts)} text boxes)")
    for t in texts:
        ts = t.replace("\n", " || ") if len(t) < 300 else t[:300] + " ..."
        print("   |", safe(ts))
    for (typ, x, y, w, h, name) in boxes:
        print(f"   [box] {name:12s} type={typ} x={x:.2f} y={y:.2f} w={w:.2f} h={h:.2f}")
    if slide.has_notes_slide:
        nt = slide.notes_slide.notes_text_frame.text.strip()
        notes_ok.append((idx, len(nt)))
    else:
        issues.append(f"  S{idx} MISSING SPEAKER NOTES")

print("\n\n=== NOTES ===")
for idx, ln in notes_ok:
    print(f"  S{idx}: {ln} chars of notes")

print("\n\n=== ISSUES ===")
if issues:
    print("\n".join(issues))
else:
    print("none")

print(f"\nTOTAL ISSUES: {len(issues)}")