# Papercraft Scrollytelling (`papercraft-scrollytelling`)

> **Turn 2D watercolor cutouts into interactive, Full-Bleed 16:9 3D pop-up scrollytelling dioramas in Three.js.**
> Built by **Raymond Vu** ([@Raymondbuilt](https://x.com/Raymondbuilt)) — extending the visual craft of `xikhar/papercraft` with physical pop-up mechanics, optical Tilt-Shift Macro bokeh, and a zero-slop asset pipeline.

![Style](https://img.shields.io/badge/Three.js-WebGL_2-black?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Agent Skill](https://img.shields.io/badge/Agent_Skill-Ready-orange?style=flat-square)

## What Makes v2.8 Different from `xikhar/papercraft`?

| Capability | Original `xikhar/papercraft` | `papercraft-scrollytelling` v2.8 |
| :--- | :--- | :--- |
| **Artwork Fidelity** | Procedural shapes only | **5-Layer Cardstock Extruder (`cutout-extruder.js`)** converts real 2K illustrations into thick cardboard cutouts with kraft cores, pale cut rims & silhouette shadows |
| **Visible Pop-Up Wave** | Fixed overview / WASD walk | **Frustum-Calibrated `WaveHinge`**: Cutouts glide into the upper third lying flat, then visibly snap upright in a tactile spring wave |
| **5 Real Pop-Up Mechanisms** | Single 90° hinge | `WaveHinge`, **`GateFold`** (double-door opening wings), **`VolvelleArc`** (biome-bounded celestial wheel), **`PullTabRail`** (recessed sliding track), & **`PaperWalker`** (hopping protagonist pawn) |
| **Optical Tilt-Shift Macro** | Basic depth cues | **2-Pass MSAA Linear-HDR Tilt-Shift (`tiltshift-post.js`)** with native ACES Filmic + sRGB output (zero darkening, crisp center focus) |
| **Fold-Flat Blueprint Mode** | None | Press **`F`** to flatten every layer onto the tabletop with deterministic `foldLayer` stacking, coplanar wings & dashed fold lines |
| **Asset Pipeline** | Manual | **`scripts/process_cutouts.py`**: 1-command `#FF00FF` chroma-key, cream-paper despill, watermark removal & sprite-sheet slicing |

## Quick Start — *Spirited Away* Interactive Demo

### Option A: Zero-Setup 1-Click
Double-click **`examples/spirited-away/spirited-away-standalone.html`** in Chrome or Edge — all 32 WebP cutouts and engine modules are bundled inside.

### Option B: Local Dev Server
```bash
# Windows: double-click examples/spirited-away/start_windows.bat
# Or via terminal:
npx serve .
# Open http://localhost:3000/examples/spirited-away/
```

## Cinema & Recording Controls (16:9 Ready)
- **Mouse Wheel / Touch**: Scroll manually through all 6 Acts
- **`Space`**: Toggle **Auto-Play Cinema** (`0.6× / 1.0× / 1.4×`) with hero-vista slowdowns
- **`H`**: Hide/Show all HUD overlays for clean 16:9 recording
- **`F`**: Toggle **Fold Flat Blueprint Mode**
- **`M`**: Toggle procedural **Paper Foley & Pentatonic Music Box**
- **Click any Hero Cutout**: Triggers tactile spring bounce & cardstock foley

## Use as an Agent Skill
Copy `skills/papercraft-scrollytelling/` into your AI coding agent's skills directory (Cursor, OpenCode, Claude Code, Gemini CLI) and follow `prompts/asset-sheet-guide.md`.

## Credits & Legal Disclaimer
- **Inspiration:** Visual craft inspired by [xikhar/papercraft](https://github.com/xikhar/papercraft) (MIT License, Copyright © 2026 Shikhar). All v2.8 scrollytelling engine modules, pop-up mechanisms, and asset processing scripts in this repository were written from scratch.
- **Fan-Art Disclaimer:** The `examples/spirited-away/` showcase is a non-commercial fan-art tribute built strictly for technical and educational demonstration. *Spirited Away* and its characters belong to Studio Ghibli.

---
Built in public at **[@Raymondbuilt](https://x.com/Raymondbuilt)** 🧪
