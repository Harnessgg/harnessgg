from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE_LOGO = PUBLIC / "logo-512.png"
SOURCE_FAVICON_SVG = PUBLIC / "favicon.svg"
OUT_ROOT = PUBLIC / "logo-palettes"

BASE_BG = (242, 244, 246)
BASE_FG = (90, 122, 138)

PALETTES = {
    "midnight-cyan": {"bg": "#101820", "fg": "#4fd1c5"},
    "sunset-ember": {"bg": "#fff1e6", "fg": "#d9480f"},
    "forest-mint": {"bg": "#eef7ef", "fg": "#2f6b3c"},
    "royal-ink": {"bg": "#eef2ff", "fg": "#3730a3"},
    "charcoal-gold": {"bg": "#1f2937", "fg": "#f59e0b"},
    "rose-crimson": {"bg": "#fff1f2", "fg": "#be123c"},
}


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.strip().lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16))


def blend_rgb(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        round(a[0] * (1.0 - t) + b[0] * t),
        round(a[1] * (1.0 - t) + b[1] * t),
        round(a[2] * (1.0 - t) + b[2] * t),
    )


def dist(c1: tuple[int, int, int], c2: tuple[int, int, int]) -> float:
    dr = c1[0] - c2[0]
    dg = c1[1] - c2[1]
    db = c1[2] - c2[2]
    return (dr * dr + dg * dg + db * db) ** 0.5


def recolor_logo(source: Image.Image, new_bg: tuple[int, int, int], new_fg: tuple[int, int, int]) -> Image.Image:
    src = source.convert("RGBA")
    dst = Image.new("RGBA", src.size, (0, 0, 0, 0))

    src_px = src.load()
    dst_px = dst.load()

    for y in range(src.height):
        for x in range(src.width):
            r, g, b, a = src_px[x, y]
            if a == 0:
                dst_px[x, y] = (0, 0, 0, 0)
                continue

            rgb = (r, g, b)
            d_bg = dist(rgb, BASE_BG)
            d_fg = dist(rgb, BASE_FG)
            total = d_bg + d_fg
            t = 0.0 if total == 0 else d_bg / total
            nr, ng, nb = blend_rgb(new_bg, new_fg, t)
            dst_px[x, y] = (nr, ng, nb, a)

    return dst


def write_palette_assets(name: str, bg_hex: str, fg_hex: str, base_logo: Image.Image, favicon_template: str) -> None:
    out_dir = OUT_ROOT / name
    out_dir.mkdir(parents=True, exist_ok=True)

    bg = hex_to_rgb(bg_hex)
    fg = hex_to_rgb(fg_hex)
    logo = recolor_logo(base_logo, bg, fg)

    logo.save(out_dir / "logo-512.png")
    logo.resize((256, 256), Image.Resampling.LANCZOS).save(out_dir / "logo-256.png")
    logo.resize((128, 128), Image.Resampling.LANCZOS).save(out_dir / "logo-128.png")
    logo.resize((64, 64), Image.Resampling.LANCZOS).save(out_dir / "favicon-64.png")
    logo.resize((32, 32), Image.Resampling.LANCZOS).save(out_dir / "favicon-32.png")

    svg = favicon_template.replace("#1e2830", bg_hex.lower()).replace("#7a9aaa", fg_hex.lower())
    (out_dir / "favicon.svg").write_text(svg, encoding="utf-8")


def main() -> None:
    base_logo = Image.open(SOURCE_LOGO)
    favicon_template = SOURCE_FAVICON_SVG.read_text(encoding="utf-8")

    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, dict[str, str]] = {}

    for name, colors in PALETTES.items():
        write_palette_assets(name, colors["bg"], colors["fg"], base_logo, favicon_template)
        manifest[name] = {"background": colors["bg"].lower(), "foreground": colors["fg"].lower()}

    (OUT_ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Generated {len(PALETTES)} logo palette sets at: {OUT_ROOT}")


if __name__ == "__main__":
    main()
