#!/usr/bin/env python3
"""
Split a 4x4 grid image into 16 single images, excluding black cell borders.

Usage:
  # Single image
  python3 scripts/split_grid_4x4.py \
    --input public/primary_phonics/F9DF170D-E62A-4DB8-93B5-50CC275839EA.png \
    --output-dir /tmp/grid_cells

  # Batch process all images in a folder
  python3 scripts/split_grid_4x4.py \
    --input-dir /path/to/images \
    --output-dir /tmp/grid_cells_batch
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tif", ".tiff"}


@dataclass
class Band:
    start: int
    end: int


def contiguous_bands(indices: np.ndarray) -> list[Band]:
    if indices.size == 0:
        return []

    bands: list[Band] = []
    start = int(indices[0])
    prev = int(indices[0])
    for idx in indices[1:]:
        i = int(idx)
        if i == prev + 1:
            prev = i
            continue
        bands.append(Band(start, prev))
        start = i
        prev = i
    bands.append(Band(start, prev))
    return bands


def select_line_bands(
    projection: np.ndarray,
    axis_len: int,
    expected_count: int,
) -> list[Band]:
    # Border lines are the darkest and longest strokes. We sweep a few
    # thresholds and keep the best match.
    for ratio in (0.72, 0.68, 0.64, 0.60, 0.56, 0.52, 0.48):
        min_count = int(axis_len * ratio)
        idx = np.where(projection >= min_count)[0]
        bands = contiguous_bands(idx)
        if len(bands) >= expected_count:
            if len(bands) > expected_count:
                # Keep strongest bands only, then restore left-to-right order.
                scored = sorted(
                    bands,
                    key=lambda b: int(np.max(projection[b.start : b.end + 1])),
                    reverse=True,
                )[:expected_count]
                bands = sorted(scored, key=lambda b: b.start)
            return bands

    raise RuntimeError(
        f"Unable to detect enough border lines. Expected {expected_count}, "
        f"found fewer after threshold sweep."
    )


def pair_bands(bands: list[Band], expected_pairs: int) -> list[tuple[Band, Band]]:
    if len(bands) != expected_pairs * 2:
        raise RuntimeError(
            f"Expected {expected_pairs * 2} line bands, got {len(bands)}."
        )
    pairs: list[tuple[Band, Band]] = []
    for i in range(expected_pairs):
        left = bands[2 * i]
        right = bands[2 * i + 1]
        if right.start <= left.end:
            raise RuntimeError("Detected invalid border band ordering.")
        pairs.append((left, right))
    return pairs


def trim_border_lines(
    image: Image.Image,
    dark_threshold: int,
    line_ratio: float = 0.85,
    max_trim: int = 12,
) -> Image.Image:
    arr = np.array(image.convert("L"))
    h, w = arr.shape

    top = 0
    bottom = h
    left = 0
    right = w

    # Remove only rows/cols dominated by dark pixels (likely border strokes).
    for _ in range(max_trim):
        if top >= bottom or left >= right:
            break
        row_dark_ratio = np.mean(arr[top, left:right] <= dark_threshold)
        if row_dark_ratio >= line_ratio:
            top += 1
        else:
            break

    for _ in range(max_trim):
        if top >= bottom or left >= right:
            break
        row_dark_ratio = np.mean(arr[bottom - 1, left:right] <= dark_threshold)
        if row_dark_ratio >= line_ratio:
            bottom -= 1
        else:
            break

    for _ in range(max_trim):
        if top >= bottom or left >= right:
            break
        col_dark_ratio = np.mean(arr[top:bottom, left] <= dark_threshold)
        if col_dark_ratio >= line_ratio:
            left += 1
        else:
            break

    for _ in range(max_trim):
        if top >= bottom or left >= right:
            break
        col_dark_ratio = np.mean(arr[top:bottom, right - 1] <= dark_threshold)
        if col_dark_ratio >= line_ratio:
            right -= 1
        else:
            break

    return image.crop((left, top, right, bottom))


def split_grid(
    input_path: Path,
    output_dir: Path,
    rows: int,
    cols: int,
    dark_threshold: int,
    inner_pad: int,
    start_index: int,
    name_prefix: str,
) -> tuple[int, int]:
    img = Image.open(input_path).convert("RGB")
    gray = np.array(img.convert("L"))
    h, w = gray.shape

    # Some source images use medium-gray borders rather than near-black lines.
    # Try progressively higher thresholds until we can reliably detect all grid lines.
    percentile_candidates = [
        int(np.percentile(gray, p)) for p in (8, 10, 12, 15, 18, 20, 25, 30, 35)
    ]
    threshold_candidates = [dark_threshold, *percentile_candidates, 90, 100, 110, 120, 130, 140, 150]
    seen = set()
    threshold_candidates = [
        t
        for t in threshold_candidates
        if 20 <= t <= 220 and not (t in seen or seen.add(t))
    ]

    vertical_lines: list[Band] | None = None
    horizontal_lines: list[Band] | None = None
    used_threshold: int | None = None

    for t in threshold_candidates:
        dark_mask = gray <= t
        col_projection = dark_mask.sum(axis=0)
        row_projection = dark_mask.sum(axis=1)
        try:
            v = select_line_bands(col_projection, h, expected_count=cols * 2)
            h_ = select_line_bands(row_projection, w, expected_count=rows * 2)
            vertical_lines = v
            horizontal_lines = h_
            used_threshold = t
            break
        except RuntimeError:
            continue

    if vertical_lines is None or horizontal_lines is None or used_threshold is None:
        raise RuntimeError(
            "Unable to detect grid lines. Try increasing --dark-threshold "
            "(e.g. 110~150) or check whether the image is a clear 4x4 grid."
        )

    col_pairs = pair_bands(vertical_lines, cols)
    row_pairs = pair_bands(horizontal_lines, rows)

    output_dir.mkdir(parents=True, exist_ok=True)

    saved = 0
    current_index = start_index
    for r, (top_band, bottom_band) in enumerate(row_pairs, start=1):
        top = top_band.end + 1 + inner_pad
        bottom = bottom_band.start - inner_pad

        for c, (left_band, right_band) in enumerate(col_pairs, start=1):
            left = left_band.end + 1 + inner_pad
            right = right_band.start - inner_pad

            if right <= left or bottom <= top:
                raise RuntimeError(
                    f"Invalid crop at row {r}, col {c}: "
                    f"left={left}, right={right}, top={top}, bottom={bottom}"
                )

            cell = img.crop((left, top, right, bottom))
            cell = trim_border_lines(cell, dark_threshold=used_threshold)
            out = output_dir / f"{name_prefix}{current_index:06d}.png"
            while out.exists():
                current_index += 1
                out = output_dir / f"{name_prefix}{current_index:06d}.png"
            cell.save(out)
            current_index += 1
            saved += 1

    print(
        f"Done. {input_path.name}: saved {saved} images to {output_dir} "
        f"(threshold={used_threshold})"
    )
    return saved, current_index


def detect_next_index(output_dir: Path, name_prefix: str) -> int:
    if not output_dir.exists():
        return 1
    pattern = re.compile(rf"^{re.escape(name_prefix)}(\d+)\.png$")
    max_index = 0
    for path in output_dir.iterdir():
        if not path.is_file():
            continue
        match = pattern.match(path.name)
        if not match:
            continue
        max_index = max(max_index, int(match.group(1)))
    return max_index + 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Split a 4x4 grid image into single images without black borders."
    )
    source_group = parser.add_mutually_exclusive_group(required=True)
    source_group.add_argument("--input", type=Path, help="Input image path")
    source_group.add_argument(
        "--input-dir",
        type=Path,
        help="Input folder path (process all supported images)",
    )
    parser.add_argument(
        "--output-dir",
        required=True,
        type=Path,
        help="Output directory for all split images.",
    )
    parser.add_argument("--rows", type=int, default=4, help="Grid rows (default: 4)")
    parser.add_argument("--cols", type=int, default=4, help="Grid cols (default: 4)")
    parser.add_argument(
        "--dark-threshold",
        type=int,
        default=70,
        help="Gray threshold for dark border detection (default: 70)",
    )
    parser.add_argument(
        "--inner-pad",
        type=int,
        default=2,
        help="Extra inward pixels to avoid keeping border anti-aliasing (default: 2)",
    )
    parser.add_argument(
        "--fail-fast",
        action="store_true",
        help="Stop immediately if any image fails in batch mode",
    )
    parser.add_argument(
        "--name-prefix",
        type=str,
        default="cell_",
        help="Output filename prefix (default: cell_).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    next_index = detect_next_index(args.output_dir, args.name_prefix)

    if args.input is not None:
        saved, _ = split_grid(
            input_path=args.input,
            output_dir=args.output_dir,
            rows=args.rows,
            cols=args.cols,
            dark_threshold=args.dark_threshold,
            inner_pad=args.inner_pad,
            start_index=next_index,
            name_prefix=args.name_prefix,
        )
        print(f"Complete. Success=1, Failed=0, Saved={saved}")
        return

    input_dir: Path = args.input_dir
    if not input_dir.exists() or not input_dir.is_dir():
        raise RuntimeError(f"Invalid input directory: {input_dir}")

    image_paths = sorted(
        p for p in input_dir.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
    )
    if not image_paths:
        raise RuntimeError(f"No supported images found in: {input_dir}")

    total = 0
    ok = 0
    failed = 0
    total_saved = 0
    for image_path in image_paths:
        total += 1
        try:
            saved, next_index = split_grid(
                input_path=image_path,
                output_dir=args.output_dir,
                rows=args.rows,
                cols=args.cols,
                dark_threshold=args.dark_threshold,
                inner_pad=args.inner_pad,
                start_index=next_index,
                name_prefix=args.name_prefix,
            )
            ok += 1
            total_saved += saved
        except Exception as exc:  # noqa: BLE001
            failed += 1
            print(f"[FAILED] {image_path.name}: {exc}")
            if args.fail_fast:
                raise

    print(
        f"Batch complete. Total={total}, Success={ok}, Failed={failed}, "
        f"Saved={total_saved}"
    )


if __name__ == "__main__":
    main()
