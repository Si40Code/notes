#!/usr/bin/env python3
"""
Generate a blog post background image from a title/keywords.

Design goals:
- Deterministic: same input text => same output style (colors/shapes) by default.
- Minimal deps: only Pillow.
- Good readability: add a subtle scrim behind text.

Usage:
  python3 script/gen_blog_bg.py --text "Go 包命名指南" --out content/posts/go-package-naming-guide/cover.jpg
  python3 script/gen_blog_bg.py --text "agent skills" --size 1920x1080 --out /tmp/bg.png
  python3 script/gen_blog_bg.py --style neon --text "agent skills" --out /tmp/bg-neon.png
  python3 script/gen_blog_bg.py --list-styles
  # If --out is omitted, it writes to the current directory using a safe filename stem.

Install:
  python3 -m pip install Pillow
"""

from __future__ import annotations

import argparse
import hashlib
import math
import os
import random
import re
import sys
from dataclasses import dataclass
from typing import Optional, Sequence, Tuple

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont


RGB = Tuple[int, int, int]


def _stable_seed(text: str) -> int:
    h = hashlib.sha256(text.encode("utf-8")).digest()
    return int.from_bytes(h[:8], "big", signed=False)


def _clamp(n: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, n))


def _hsl_to_rgb(h: float, s: float, l: float) -> RGB:
    # h, s, l in [0, 1]
    # Convert via colorsys, but keep it inline to avoid extra imports.
    def hue_to_rgb(p: float, q: float, t: float) -> float:
        if t < 0:
            t += 1
        if t > 1:
            t -= 1
        if t < 1 / 6:
            return p + (q - p) * 6 * t
        if t < 1 / 2:
            return q
        if t < 2 / 3:
            return p + (q - p) * (2 / 3 - t) * 6
        return p

    if s == 0:
        r = g = b = l
    else:
        q = l * (1 + s) if l < 0.5 else l + s - l * s
        p = 2 * l - q
        r = hue_to_rgb(p, q, h + 1 / 3)
        g = hue_to_rgb(p, q, h)
        b = hue_to_rgb(p, q, h - 1 / 3)
    return (int(round(r * 255)), int(round(g * 255)), int(round(b * 255)))


def _mix(a: RGB, b: RGB, t: float) -> RGB:
    t = _clamp(t, 0.0, 1.0)
    return (
        int(round(a[0] + (b[0] - a[0]) * t)),
        int(round(a[1] + (b[1] - a[1]) * t)),
        int(round(a[2] + (b[2] - a[2]) * t)),
    )


def _parse_size(s: str) -> Tuple[int, int]:
    m = re.fullmatch(r"(\d+)x(\d+)", s.strip())
    if not m:
        raise argparse.ArgumentTypeError("size must be like 1920x1080")
    w, h = int(m.group(1)), int(m.group(2))
    if w < 320 or h < 200:
        raise argparse.ArgumentTypeError("size too small; try >= 320x200")
    return w, h


def _find_font_path(user_font: Optional[str]) -> Optional[str]:
    if user_font:
        return user_font
    # Prefer Chinese-capable fonts on macOS; fall back to common system fonts.
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/System/Library/Fonts/Supplemental/Arial Unicode MS.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
        "/Library/Fonts/Arial Unicode MS.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return None


def _load_font(path: Optional[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    if path:
        try:
            return ImageFont.truetype(path, size=size)
        except Exception:
            pass
    return ImageFont.load_default()


def _is_cjk(char: str) -> bool:
    o = ord(char)
    # CJK Unified Ideographs + extensions (rough but effective for wrapping)
    return (
        0x4E00 <= o <= 0x9FFF
        or 0x3400 <= o <= 0x4DBF
        or 0x20000 <= o <= 0x2A6DF
        or 0x2A700 <= o <= 0x2B73F
        or 0x2B740 <= o <= 0x2B81F
        or 0x2B820 <= o <= 0x2CEAF
        or 0xF900 <= o <= 0xFAFF
    )


def _wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> Sequence[str]:
    text = re.sub(r"\s+", " ", text.strip())
    if not text:
        return []

    # If it has spaces, wrap by words; otherwise wrap by characters (for CJK).
    if " " in text:
        parts = text.split(" ")
        lines: list[str] = []
        cur = ""
        for w in parts:
            trial = w if not cur else f"{cur} {w}"
            if draw.textlength(trial, font=font) <= max_width:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines

    # No spaces: prefer CJK char wrapping, but still works for long latin strings.
    lines = []
    cur = ""
    for ch in text:
        trial = f"{cur}{ch}"
        if cur and draw.textlength(trial, font=font) > max_width:
            lines.append(cur)
            cur = ch
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return lines


@dataclass(frozen=True)
class Palette:
    c1: RGB
    c2: RGB
    accent: RGB
    text: RGB


@dataclass(frozen=True)
class StyleSpec:
    theme: str  # "dark" | "light"
    variant: str  # "default" | "neon" | "warm" | "mono"
    noise: float
    shapes: float
    vignette: float
    align: str
    margin: float
    description: str


STYLES: dict[str, StyleSpec] = {
    "default": StyleSpec(
        theme="dark",
        variant="default",
        noise=1.0,
        shapes=1.0,
        vignette=1.0,
        align="left",
        margin=0.07,
        description="Deep gradient + balanced grain + mixed geometric shapes (current default).",
    ),
    "minimal": StyleSpec(
        theme="dark",
        variant="default",
        noise=0.6,
        shapes=0.2,
        vignette=0.9,
        align="left",
        margin=0.08,
        description="Cleaner, fewer shapes; good for long titles.",
    ),
    "geometric": StyleSpec(
        theme="dark",
        variant="default",
        noise=0.8,
        shapes=1.8,
        vignette=1.0,
        align="left",
        margin=0.07,
        description="More polygons/stripes/circles; punchy tech vibe.",
    ),
    "neon": StyleSpec(
        theme="dark",
        variant="neon",
        noise=0.9,
        shapes=1.4,
        vignette=1.1,
        align="left",
        margin=0.07,
        description="Higher-contrast palette with vivid accents.",
    ),
    "warm": StyleSpec(
        theme="dark",
        variant="warm",
        noise=1.1,
        shapes=1.0,
        vignette=1.1,
        align="left",
        margin=0.07,
        description="Warm, earthy hues; good for essays/notes.",
    ),
    "mono": StyleSpec(
        theme="dark",
        variant="mono",
        noise=1.0,
        shapes=1.1,
        vignette=1.2,
        align="left",
        margin=0.07,
        description="Low-saturation palette; subtle and calm.",
    ),
    "light": StyleSpec(
        theme="light",
        variant="default",
        noise=0.6,
        shapes=0.9,
        vignette=0.3,
        align="left",
        margin=0.07,
        description="Light background with dark text; works well for print-like pages.",
    ),
    "paper": StyleSpec(
        theme="light",
        variant="warm",
        noise=1.4,
        shapes=0.3,
        vignette=0.2,
        align="left",
        margin=0.08,
        description="Paper-like warm light background with stronger grain.",
    ),
}


def _make_palette(rng: random.Random, *, theme: str, variant: str) -> Palette:
    # Pick a pleasing palette: gradient + accent. Theme controls luminance; variant controls hue/saturation.
    if variant == "warm":
        base_h = rng.uniform(0.03, 0.14)  # orange-ish
    else:
        base_h = rng.random()

    if theme == "light":
        l1 = rng.uniform(0.78, 0.86)
        l2 = rng.uniform(0.86, 0.93)
        text = (22, 24, 28)
    else:
        l1 = rng.uniform(0.18, 0.28)
        l2 = rng.uniform(0.30, 0.42)
        text = (245, 247, 250)

    if variant == "mono":
        s1 = rng.uniform(0.06, 0.16)
        s2 = rng.uniform(0.08, 0.20)
        sa = rng.uniform(0.10, 0.25)
    elif variant == "neon":
        s1 = rng.uniform(0.70, 0.92)
        s2 = rng.uniform(0.70, 0.92)
        sa = rng.uniform(0.85, 0.98)
    else:
        s1 = rng.uniform(0.55, 0.85)
        s2 = rng.uniform(0.55, 0.85)
        sa = rng.uniform(0.70, 0.95)

    c1 = _hsl_to_rgb(base_h % 1.0, s=s1, l=l1)
    c2 = _hsl_to_rgb((base_h + rng.uniform(0.08, 0.22)) % 1.0, s=s2, l=l2)

    accent_l = rng.uniform(0.52, 0.66) if theme == "dark" else rng.uniform(0.40, 0.55)
    if variant == "neon" and theme == "dark":
        accent_l = rng.uniform(0.60, 0.74)
    accent = _hsl_to_rgb((base_h + rng.uniform(0.45, 0.65)) % 1.0, s=sa, l=accent_l)
    return Palette(c1=c1, c2=c2, accent=accent, text=text)


def _linear_gradient(size: Tuple[int, int], c_top: RGB, c_bottom: RGB, horizontal: bool) -> Image.Image:
    w, h = size
    img = Image.new("RGB", (w, h), c_top)
    px = img.load()
    if horizontal:
        for x in range(w):
            t = x / max(1, w - 1)
            c = _mix(c_top, c_bottom, t)
            for y in range(h):
                px[x, y] = c
    else:
        for y in range(h):
            t = y / max(1, h - 1)
            c = _mix(c_top, c_bottom, t)
            for x in range(w):
                px[x, y] = c
    return img


def _add_noise(base: Image.Image, rng: random.Random, amount: float) -> Image.Image:
    if amount <= 0:
        return base
    w, h = base.size

    # effect_noise is deterministic based on seed within Pillow; we vary via sigma and rotate.
    sigma = 20 + int(60 * amount)
    noise = Image.effect_noise((w, h), sigma).convert("L")
    noise = noise.rotate(rng.uniform(-2, 2), resample=Image.BICUBIC, expand=False)

    # Convert noise into subtle RGB grain and blend using soft light-ish approach.
    grain = Image.merge("RGB", (noise, noise, noise))
    grain = ImageEnhance.Contrast(grain).enhance(1.6)
    grain = ImageEnhance.Brightness(grain).enhance(0.6)

    # Overlay with low opacity by difference + screen mix for texture.
    mixed = ImageChops.screen(base, grain)
    return Image.blend(base, mixed, alpha=_clamp(0.10 * amount, 0.0, 0.25))


def _add_shapes(img: Image.Image, rng: random.Random, palette: Palette, density: float) -> Image.Image:
    if density <= 0:
        return img
    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    n = int(8 + density * 18)
    for _ in range(n):
        kind = rng.choice(["circle", "poly", "stripe"])
        alpha = int(18 + rng.random() * 55)
        color = rng.choice([palette.accent, palette.c2, palette.c1])
        fill = (color[0], color[1], color[2], alpha)

        if kind == "circle":
            r = int(min(w, h) * rng.uniform(0.06, 0.18))
            cx = int(rng.uniform(-0.1, 1.1) * w)
            cy = int(rng.uniform(-0.1, 1.1) * h)
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill)
        elif kind == "stripe":
            x0 = int(rng.uniform(-0.2, 1.0) * w)
            y0 = int(rng.uniform(0.0, 1.0) * h)
            x1 = x0 + int(w * rng.uniform(0.4, 1.2))
            y1 = y0 + int(h * rng.uniform(0.02, 0.08))
            d.rounded_rectangle([x0, y0, x1, y1], radius=int(min(w, h) * 0.02), fill=fill)
        else:  # poly
            pts = []
            k = rng.randint(3, 6)
            cx = rng.uniform(0.0, 1.0) * w
            cy = rng.uniform(0.0, 1.0) * h
            radius = min(w, h) * rng.uniform(0.08, 0.22)
            start = rng.random() * math.tau
            for i in range(k):
                ang = start + i * (math.tau / k) + rng.uniform(-0.25, 0.25)
                rr = radius * rng.uniform(0.65, 1.15)
                pts.append((cx + math.cos(ang) * rr, cy + math.sin(ang) * rr))
            d.polygon(pts, fill=fill)

    layer = layer.filter(ImageFilter.GaussianBlur(radius=max(2, int(min(w, h) * 0.008))))
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")


def _add_vignette(img: Image.Image, strength: float) -> Image.Image:
    if strength <= 0:
        return img
    w, h = img.size
    try:
        mask = Image.radial_gradient("L").resize((w, h), resample=Image.BICUBIC)
    except Exception:
        # Fallback: center-bright mask approximated with a blurred rectangle.
        mask = Image.new("L", (w, h), 0)
        d = ImageDraw.Draw(mask)
        inset = int(min(w, h) * 0.12)
        d.rectangle([inset, inset, w - inset, h - inset], fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.15)))

    # radial_gradient("L") is bright at center, dark at edges; invert to darken edges.
    mask = ImageChops.invert(mask)
    mask = ImageEnhance.Contrast(mask).enhance(1.35)
    mask = ImageEnhance.Brightness(mask).enhance(0.75)

    dark = Image.new("RGB", (w, h), (0, 0, 0))
    out = Image.composite(dark, img, mask)  # take dark where mask bright
    return Image.blend(img, out, alpha=_clamp(0.35 * strength, 0.0, 0.55))


def _draw_title(
    img: Image.Image,
    title: str,
    subtitle: str,
    font_path: Optional[str],
    palette: Palette,
    theme: str,
    margin_ratio: float,
    align: str,
) -> Image.Image:
    w, h = img.size
    base = img.convert("RGBA")
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    margin = int(min(w, h) * _clamp(margin_ratio, 0.04, 0.12))
    max_text_width = w - 2 * margin

    # Font sizes scale with image size.
    title_size = int(min(w, h) * 0.085)
    subtitle_size = int(min(w, h) * 0.040)
    title_font = _load_font(font_path, size=title_size)
    subtitle_font = _load_font(font_path, size=subtitle_size)

    title_lines = _wrap_text(draw, title, title_font, max_text_width)
    subtitle_lines = _wrap_text(draw, subtitle, subtitle_font, max_text_width) if subtitle else []

    # Measure block.
    line_gap = int(title_size * 0.22)
    sub_gap = int(subtitle_size * 0.35)

    def text_bbox(line: str, fnt: ImageFont.ImageFont) -> Tuple[int, int]:
        b = draw.textbbox((0, 0), line, font=fnt)
        return b[2] - b[0], b[3] - b[1]

    title_metrics = [text_bbox(line, title_font) for line in title_lines] or [(0, 0)]
    subtitle_metrics = [text_bbox(line, subtitle_font) for line in subtitle_lines] or []

    block_w = max([m[0] for m in title_metrics] + ([m[0] for m in subtitle_metrics] if subtitle_metrics else [0]))
    block_h = sum(m[1] for m in title_metrics) + line_gap * max(0, len(title_lines) - 1)
    if subtitle_metrics:
        block_h += int(title_size * 0.35) + sum(m[1] for m in subtitle_metrics) + sub_gap * max(0, len(subtitle_lines) - 1)

    # Positioning.
    if align not in {"left", "center", "right"}:
        align = "left"
    if align == "left":
        x0 = margin
    elif align == "center":
        x0 = (w - block_w) // 2
    else:
        x0 = w - margin - block_w

    y0 = int(h * 0.60) - block_h // 2
    y0 = int(_clamp(y0, margin, h - margin - block_h))

    is_light = theme == "light"

    # Background scrim behind text.
    pad_x = int(min(w, h) * 0.030)
    pad_y = int(min(w, h) * 0.022)
    scrim = [x0 - pad_x, y0 - pad_y, x0 + block_w + pad_x, y0 + block_h + pad_y]
    scrim_fill = (255, 255, 255, 170) if is_light else (0, 0, 0, 110)
    draw.rounded_rectangle(scrim, radius=int(min(w, h) * 0.028), fill=scrim_fill)

    # Decorative accent bar.
    bar_w = int(min(block_w, w - 2 * margin) * 0.18)
    bar_h = max(6, int(min(w, h) * 0.010))
    bar = [x0, y0 - int(pad_y * 0.8) - bar_h - 6, x0 + bar_w, y0 - int(pad_y * 0.8) - 6]
    draw.rounded_rectangle(bar, radius=bar_h // 2, fill=(palette.accent[0], palette.accent[1], palette.accent[2], 210))

    # Draw title text with subtle shadow.
    shadow = (255, 255, 255, 150) if is_light else (0, 0, 0, 160)
    fg = (palette.text[0], palette.text[1], palette.text[2], 255)

    y = y0
    for i, line in enumerate(title_lines):
        lw, lh = title_metrics[i]
        if align == "center":
            x = x0 + (block_w - lw) // 2
        elif align == "right":
            x = x0 + (block_w - lw)
        else:
            x = x0
        draw.text((x + 2, y + 2), line, font=title_font, fill=shadow)
        draw.text((x, y), line, font=title_font, fill=fg)
        y += lh + line_gap

    if subtitle_lines:
        y += int(title_size * 0.18)
        for i, line in enumerate(subtitle_lines):
            lw, lh = subtitle_metrics[i]
            if align == "center":
                x = x0 + (block_w - lw) // 2
            elif align == "right":
                x = x0 + (block_w - lw)
            else:
                x = x0
            if is_light:
                draw.text((x + 1, y + 1), line, font=subtitle_font, fill=(255, 255, 255, 140))
                draw.text((x, y), line, font=subtitle_font, fill=(35, 38, 44, 220))
            else:
                draw.text((x + 1, y + 1), line, font=subtitle_font, fill=(0, 0, 0, 140))
                draw.text((x, y), line, font=subtitle_font, fill=(230, 233, 238, 230))
            y += lh + sub_gap

    composed = Image.alpha_composite(base, layer).convert("RGB")
    return composed


def generate_image(
    text: str,
    subtitle: str,
    size: Tuple[int, int],
    seed: Optional[int],
    style: str,
    font_path: Optional[str],
    noise: float,
    shapes: float,
    vignette: float,
    align: str,
    margin_ratio: float,
) -> Image.Image:
    style_spec = STYLES.get(style, STYLES["default"])
    rng = random.Random(_stable_seed(f"{text}|{style}") if seed is None else seed)
    palette = _make_palette(rng, theme=style_spec.theme, variant=style_spec.variant)

    # Background gradient: diagonal-ish by mixing horizontal + vertical.
    base_v = _linear_gradient(size, palette.c1, palette.c2, horizontal=False)
    base_h = _linear_gradient(size, palette.c2, palette.c1, horizontal=True)
    base = Image.blend(base_v, base_h, alpha=0.35)

    base = _add_noise(base, rng, amount=noise)
    base = _add_shapes(base, rng, palette, density=shapes)
    base = _add_vignette(base, strength=vignette)

    if text.strip():
        base = _draw_title(
            base,
            title=text,
            subtitle=subtitle,
            font_path=font_path,
            palette=palette,
            theme=style_spec.theme,
            margin_ratio=margin_ratio,
            align=align,
        )
    return base


def _ensure_parent_dir(path: str) -> None:
    parent = os.path.dirname(os.path.abspath(path))
    if parent and not os.path.exists(parent):
        os.makedirs(parent, exist_ok=True)

def _safe_filename_stem(text: str) -> str:
    """
    Turn arbitrary text into a safe-ish filename stem.

    - Keeps Unicode (including CJK) for readability on macOS/Linux
    - Removes filesystem-illegal characters
    - Normalizes whitespace to '-'
    - Falls back to a hash-based stem if nothing remains
    """
    s = text.strip()
    s = re.sub(r"\s+", "-", s)
    # Remove illegal filename chars (Windows + POSIX common subset) and control chars.
    s = re.sub(r'[\\/:*?"<>|\x00-\x1F]', "", s)
    s = re.sub(r"-{2,}", "-", s).strip(" .-_")
    s = s[:80].rstrip(" .-_")
    if s:
        return s
    h = hashlib.sha256(text.encode("utf-8")).hexdigest()[:10]
    return f"blog-bg-{h}"


def main(argv: Sequence[str]) -> int:
    p = argparse.ArgumentParser(description="Generate a blog background image from title/keywords.")
    p.add_argument("--list-styles", action="store_true", help="List available styles and exit.")
    p.add_argument("--style", default="default", choices=sorted(STYLES.keys()), help="Style preset.")
    p.add_argument("--text", required=False, help="Article title or keywords.")
    p.add_argument("--subtitle", default="", help="Optional subtitle / keywords line.")
    p.add_argument("--out", required=False, help="Output path. If omitted, writes to ./{slugified-text}.png")
    p.add_argument("--size", default="1600x900", type=_parse_size, help="Image size, e.g. 1600x900")
    p.add_argument("--seed", type=int, default=None, help="Override deterministic seed (int).")
    p.add_argument("--font", default=None, help="Font path (.ttf/.ttc). If omitted, auto-detect system fonts.")
    p.add_argument("--noise", type=float, default=None, help="Noise amount (0..2). If omitted, uses style preset.")
    p.add_argument("--shapes", type=float, default=None, help="Shapes density (0..2). If omitted, uses style preset.")
    p.add_argument("--vignette", type=float, default=None, help="Vignette strength (0..2). If omitted, uses style preset.")
    p.add_argument("--align", default=None, choices=["left", "center", "right"], help="Text alignment. If omitted, uses style preset.")
    p.add_argument("--margin", type=float, default=None, help="Margin ratio (e.g. 0.07). If omitted, uses style preset.")
    args = p.parse_args(argv)

    if args.list_styles:
        for name in sorted(STYLES.keys()):
            spec = STYLES[name]
            print(f"{name:9s}  theme={spec.theme:5s}  {spec.description}")
        return 0

    if not args.text or not args.text.strip():
        p.error("--text is required (unless --list-styles is set)")

    style_spec = STYLES.get(args.style, STYLES["default"])
    font_path = _find_font_path(args.font)
    noise = style_spec.noise if args.noise is None else _clamp(args.noise, 0.0, 2.0)
    shapes = style_spec.shapes if args.shapes is None else _clamp(args.shapes, 0.0, 2.0)
    vignette = style_spec.vignette if args.vignette is None else _clamp(args.vignette, 0.0, 2.0)
    align = style_spec.align if args.align is None else args.align
    margin = style_spec.margin if args.margin is None else args.margin

    out = args.out
    if not out:
        stem = _safe_filename_stem(args.text)
        out = os.path.join(os.getcwd(), f"{stem}.png")

    img = generate_image(
        text=args.text,
        subtitle=args.subtitle,
        size=args.size,
        seed=args.seed,
        style=args.style,
        font_path=font_path,
        noise=noise,
        shapes=shapes,
        vignette=vignette,
        align=align,
        margin_ratio=margin,
    )

    _ensure_parent_dir(out)

    ext = os.path.splitext(out.lower())[1]
    save_kwargs = {}
    if ext in {".jpg", ".jpeg"}:
        save_kwargs = {"quality": 92, "subsampling": 1, "optimize": True}
    elif ext == ".png":
        save_kwargs = {"optimize": True}

    img.save(out, **save_kwargs)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

