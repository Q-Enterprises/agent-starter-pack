#!/usr/bin/env python3
"""Render a synthetic "99 Luftballoons"-style training video from token_balloon_map.json."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

import numpy as np


def _load_map(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list) or len(data) != 99:
        raise ValueError("Expected token map with 99 entries.")
    return data


def _trajectory_xy(traj: str, t: float, idx: int) -> tuple[float, float]:
    base_x = 0.1 + (idx % 11) * 0.08
    base_y = 0.2 + (idx // 11) * 0.07
    if traj == "spiral_up":
        return base_x + 0.03 * math.cos(6 * t), base_y + 0.25 * t + 0.03 * math.sin(6 * t)
    if traj == "sine_drift":
        return base_x + 0.05 * math.sin(8 * t), base_y + 0.25 * t
    if traj == "helix":
        return base_x + 0.04 * math.cos(10 * t), base_y + 0.22 * t + 0.02 * math.sin(10 * t)
    if traj == "arc_left":
        return base_x - 0.08 * t, base_y + 0.24 * t
    if traj == "arc_right":
        return base_x + 0.08 * t, base_y + 0.24 * t
    if traj == "float":
        return base_x, base_y + 0.22 * t
    if traj == "zigzag":
        return base_x + 0.04 * math.sin(20 * t), base_y + 0.24 * t
    if traj == "pulse_ring":
        return base_x + 0.03 * math.cos(16 * t), base_y + 0.03 * math.sin(16 * t) + 0.23 * t
    if traj == "orbit":
        return base_x + 0.05 * math.cos(7 * t), base_y + 0.05 * math.sin(7 * t) + 0.2 * t
    if traj == "rise_fade":
        return base_x + 0.02 * math.sin(5 * t), base_y + 0.27 * t
    return base_x + 0.02 * math.cos(12 * t), base_y + 0.23 * t


def render_video(token_map: Path, output_mp4: Path, fps: int, width: int, height: int) -> None:
    import matplotlib.pyplot as plt
    from matplotlib.animation import FFMpegWriter

    balloons = _load_map(token_map)
    end_ms = max(item["music_cue_ms"][1] for item in balloons)
    duration_s = max(30, int(math.ceil(end_ms / 1000.0 + 5)))
    total_frames = duration_s * fps

    fig = plt.figure(figsize=(width / 100, height / 100), dpi=100)
    ax = fig.add_subplot(111)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_facecolor("#0d0f1a")
    ax.axis("off")

    writer = FFMpegWriter(fps=fps, metadata={"title": "99 Balloon Token Map"}, bitrate=2400)

    with writer.saving(fig, str(output_mp4), dpi=100):
        for frame in range(total_frames):
            t_ms = frame * 1000 / fps
            ax.clear()
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.set_facecolor("#0d0f1a")
            ax.axis("off")

            active = [b for b in balloons if b["music_cue_ms"][0] <= t_ms <= b["music_cue_ms"][1]]
            for b in active:
                idx = b["balloon_id"] - 1
                cue0, cue1 = b["music_cue_ms"]
                local_t = 0.0 if cue1 == cue0 else (t_ms - cue0) / (cue1 - cue0)
                x, y = _trajectory_xy(b["trajectory"], local_t, idx)
                radius = 0.015 + b["radius"] * 0.007
                pulse = 1.0 + 0.1 * math.sin(local_t * math.pi * 6)
                c = np.array([1.0, 0.18, 0.18, 0.5 + 0.5 * local_t])
                ax.add_patch(plt.Circle((x, y), radius * pulse, color=c, ec="#ff8080", lw=0.8))

            ax.text(0.02, 0.96, "Token Embedding Map · 99 Balloons", color="white", fontsize=14)
            ax.text(0.02, 0.92, f"t={t_ms/1000:05.2f}s | active={len(active):02d}", color="#ffb3b3", fontsize=10)
            writer.grab_frame()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render a 99-balloons MP4 from token map JSON")
    parser.add_argument("--token-map", default="token_balloon_map.json", type=Path)
    parser.add_argument("--output", default="99_luftballoons_token_map.mp4", type=Path)
    parser.add_argument("--fps", default=30, type=int)
    parser.add_argument("--width", default=1280, type=int)
    parser.add_argument("--height", default=720, type=int)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    render_video(args.token_map, args.output, args.fps, args.width, args.height)


if __name__ == "__main__":
    main()
