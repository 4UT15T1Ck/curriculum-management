#!/usr/bin/env python3
"""
Frame Sequence Extractor & Optimizer for Cinematic Canvas Scroll Engines.
Part of landing-page-skill.

Takes any video file (.mp4, .mov, .webm) and transforms it into a high-performance,
lightweight WebP image sequence tailored for 120 FPS canvas scrub engines.

Features:
- Multi-threaded WebP compression (ThreadPoolExecutor)
- Smart aspect ratio cropping (center crop or letterbox)
- Auto-generation of engine manifest.json (metadata, keyframe stride, lerp parameters)
- Optional background thresholding for dark luxury / clean white backgrounds
"""

import os
import sys
import argparse
import json
import math
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

try:
    import cv2
except ImportError:
    print("Error: OpenCV (cv2) is required. Install via: pip install opencv-python", file=sys.stderr)
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    Image = None


def parse_args():
    parser = argparse.ArgumentParser(
        description="Extract and optimize video frames into a high-speed WebP canvas sequence."
    )
    parser.add_argument("--input", "-i", required=True, help="Path to input video file (.mp4, .mov, etc.)")
    parser.add_argument("--output", "-o", required=True, help="Output directory for frames (e.g. ./assets/frames)")
    parser.add_argument("--target-frames", "-n", type=int, default=300, help="Target total frame count (default: 300)")
    parser.add_argument("--width", "-w", type=int, default=640, help="Output frame width (default: 640)")
    parser.add_argument("--height", "-H", type=int, default=640, help="Output frame height (default: 640)")
    parser.add_argument("--quality", "-q", type=int, default=82, help="WebP compression quality 1-100 (default: 82)")
    parser.add_argument("--crop", choices=["center", "fit", "stretch"], default="center", help="Aspect ratio handling")
    parser.add_argument("--darken-bg", action="store_true", help="Enhance blacks to pure deep black (#000) for seamless blend")
    parser.add_argument("--prefix", default="frame_", help="File prefix (default: frame_)")
    parser.add_argument("--stride-keyframe", type=int, default=4, help="Keyframe preload interval in manifest (default: 4)")
    parser.add_argument("--workers", type=int, default=8, help="Parallel worker threads (default: 8)")
    return parser.parse_args()


def process_frame(img, target_w, target_h, crop_mode, darken_bg):
    h, w = img.shape[:2]

    if crop_mode == "center":
        # Calculate aspect ratios
        target_ratio = target_w / target_h
        src_ratio = w / h

        if src_ratio > target_ratio:
            # Source is wider, crop horizontal margins
            new_w = int(h * target_ratio)
            offset = (w - new_w) // 2
            cropped = img[:, offset:offset + new_w]
        else:
            # Source is taller, crop vertical margins
            new_h = int(w / target_ratio)
            offset = (h - new_h) // 2
            cropped = img[offset:offset + new_h, :]
        resized = cv2.resize(cropped, (target_w, target_h), interpolation=cv2.INTER_AREA)

    elif crop_mode == "fit":
        # Letterbox / pillarbox fit with black padding
        scale = min(target_w / w, target_h / h)
        scaled_w, scaled_h = int(w * scale), int(h * scale)
        scaled = cv2.resize(img, (scaled_w, scaled_h), interpolation=cv2.INTER_AREA)
        resized = cv2.copyMakeBorder(
            scaled,
            top=(target_h - scaled_h) // 2,
            bottom=target_h - scaled_h - (target_h - scaled_h) // 2,
            left=(target_w - scaled_w) // 2,
            right=target_w - scaled_w - (target_w - scaled_w) // 2,
            borderType=cv2.BORDER_CONSTANT,
            value=[0, 0, 0]
        )
    else:
        resized = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_AREA)

    if darken_bg:
        # Boost black levels: if pixel sum is low, smoothly blend down to pure black #000
        # Prevents visible bounding boxes on dark-themed landing pages
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        mask = gray < 28
        resized[mask] = (resized[mask] * 0.4).astype(resized.dtype)

    return resized


def save_webp_frame(task):
    img, path, quality = task
    # Encode with OpenCV WebP writer
    encode_param = [int(cv2.IMWRITE_WEBP_QUALITY), quality]
    cv2.imwrite(path, img, encode_param)
    return path


def main():
    args = parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input video '{args.input}' does not exist.", file=sys.stderr)
        sys.exit(1)

    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(str(input_path))
    if not cap.isOpened():
        print(f"Error: Could not open video '{args.input}'", file=sys.stderr)
        sys.exit(1)

    total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    duration_sec = total_video_frames / fps

    print(f"=== Video Source Analysis ===")
    print(f"File: {input_path.name}")
    print(f"Total Video Frames: {total_video_frames} ({duration_sec:.2f}s @ {fps:.1f} FPS)")
    print(f"Requested Sequence Target: {args.target_frames} frames")
    print(f"Output Resolution: {args.width}x{args.height} WebP (q={args.quality})")

    # Select sampled frame indices
    if total_video_frames <= args.target_frames:
        target_count = total_video_frames
        indices = list(range(total_video_frames))
    else:
        target_count = args.target_frames
        indices = [int(round(i * (total_video_frames - 1) / (target_count - 1))) for i in range(target_count)]

    # Read frames sequentially
    print(f"Extracting {target_count} frames...")
    tasks = []
    digits = len(str(target_count - 1))
    
    current_idx = 0
    sampled_set = set(indices)
    frame_order_map = {idx: i for i, idx in enumerate(indices)}

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if current_idx in sampled_set:
            out_index = frame_order_map[current_idx]
            filename = f"{args.prefix}{out_index:0{digits}d}.webp"
            target_path = str(out_dir / filename)

            processed = process_frame(frame, args.width, args.height, args.crop, args.darken_bg)
            tasks.append((processed, target_path, args.quality))

        current_idx += 1

    cap.release()

    # Parallel saving
    print(f"Compressing {len(tasks)} frames using {args.workers} threads...")
    saved_paths = []
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        for result in executor.map(save_webp_frame, tasks):
            saved_paths.append(result)

    # Compute total sequence size
    total_bytes = sum(os.path.getsize(p) for p in saved_paths)
    total_mb = total_bytes / (1024 * 1024)
    avg_kb = (total_bytes / len(saved_paths)) / 1024

    # Generate manifest.json
    manifest = {
        "engineVersion": "1.0.0",
        "totalFrames": len(saved_paths),
        "framePrefix": args.prefix,
        "digits": digits,
        "extension": ".webp",
        "format": f"{args.prefix}%0{digits}d.webp",
        "dimensions": {
            "width": args.width,
            "height": args.height,
            "aspectRatio": round(args.width / args.height, 4)
        },
        "stats": {
            "totalSizeMB": round(total_mb, 2),
            "averageFrameKB": round(avg_kb, 1),
            "originalDurationSec": round(duration_sec, 2)
        },
        "canvasEngineConfig": {
            "hydrationStrategy": "progressive-two-phase",
            "keyframeStride": args.stride_keyframe,
            "springLerpFactor": 0.18,
            "opticalCrossfade": True,
            "scrubVelocitySensitivity": 1.2
        }
    }

    manifest_path = out_dir / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print("\n=== Sequence Extraction Complete ===")
    print(f"Frames saved to: {out_dir}")
    print(f"Total Sequence Size: {total_mb:.2f} MB (~{avg_kb:.1f} KB/frame)")
    print(f"Manifest created: {manifest_path}")
    print(f"Ready for drop-in use with ScrollSequenceEngine!")


if __name__ == "__main__":
    main()
