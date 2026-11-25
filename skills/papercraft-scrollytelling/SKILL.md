---
name: papercraft-scrollytelling
description: Production-grade Agent Skill for building full-bleed 16:9 3D pop-up papercraft scrollytelling dioramas from real illustrated cutouts with frustum-calibrated spring hinges, 5 pop-up mechanisms, true Linear-HDR Tilt-Shift Macro optics, and zero-clip Fold-Flat blueprints.
---

# Papercraft Scrollytelling v2.8 — Agent Skill

An upgraded evolution of `xikhar/papercraft` engineered for **cinematic Full-Bleed 16:9 Pop-Up Scrollytelling** with strict Anti-Slop QA guarantees.

## Engine Modules (`lib/`)
1. **`lib/cutout-extruder.js`**: Extrudes transparent PNG/WebP illustrations into 5-layer physical cardstock sandwiches (matte watercolor face, pale lit rim, 3 dark kraft core slices, cream cardstock back, silhouette shadows).
2. **`lib/popup-mechanisms.js`**:
   - `WaveHinge`: Frustum-calibrated spring hinge (`openDist ≈ 10.8` inside top third of FOV 28° viewport) with deterministic `foldLayer` stacking so pieces visibly pop up in view and NEVER clip under ground when folded flat.
   - `GateFold`: Double-door wings that remain folded while the center tower rises, swing open right in center frame, and flatten coplanar (`0.0 rad`) in Fold-Flat mode.
   - `VolvelleArc`: Upper-sky celestial arc (`±36°` around zenith) so moons/suns NEVER dip into the tabletop.
   - `PullTabRail`: Recessed linear track slider with golden-ratio ending stop.
   - `PaperWalker`: Single protagonist pawn with stop-motion cardstock hops and bridge-arch elevation synced to scroll velocity.
3. **`lib/tiltshift-post.js`**: 2-pass MSAA Linear-HDR 12-tap Tilt-Shift bokeh with Three.js native `#include <tonemapping_fragment>` + `#include <colorspace_fragment>` (zero brightness shift when toggled!).
4. **`lib/scroll-director.js`**: Macro telephoto spline (`FOV 28°`, `camHeight 15.2`) with Auto-Play Cinema hero-vista slowdowns.
5. **`lib/paper-foley.js`**: Procedural Web Audio paper snaps, page turns, and pentatonic music box.

## Mandatory Anti-Slop QA Rules (NEVER Violate)
- **Frustum-Calibrated Pop-Ups**: With `FOV 28°`, `camHeight 15.2`, `camBackOffset 16.5`, visible ground spans `ahead ∈ [-4.4, +18.5]`. ALWAYS set `openDist ∈ [10.2, 11.4] (77%–81% screen height)` so viewers SEE pieces lying flat before snapping upright inside the top third of the frame.
- **Separate Rotating Discs from Static Stands**: NEVER rotate a 3/4-perspective image containing both a wheel and its stand. Always separate concentric circular discs (`anchor: 'center'`) from stationary supports (`anchor: 'bottom'`).
- **Coplanar & Layered Fold-Flat**: Every 3D piece (including floating dragons, moons, waterwheels, and walkers) MUST smoothly lower to `y = 0.095 + foldLayer * 0.026` and flatten wings to `0.0 rad` in Fold-Flat mode — zero ground clipping, zero Z-fighting.
- **No Ruler-Cut Biome Seams**: Paint scalloped/wavy overlapping paper sheets with drop shadows between acts; never straight horizontal stripes.
- **Biome-Matched Props**: Never reuse dark night clouds on a sunset biome; recolor or generate matching palette cutouts.
- **Golden-Ratio Finale Check**: Verify `endZ` against bottom-edge visibility (`endZ + 4.4`) so neither hero characters nor pull-tab vehicles are ever cropped at `t = 1.0`.

- **Euler `'YXZ'` Order for Angled Cutouts**: ALWAYS set `card.rotation.order = 'YXZ'` so X-hinge folding executes BEFORE vertical Y-yaw; otherwise any prop with `rotY !== 0` will slice diagonally underground when folded flat.
- **Physical Tabletop Floor Stop**: Clamp spring hinge `angle >= -Math.PI * 0.499` with velocity damping so underdamped springs never bounce tall cutouts through the tabletop during Fold-Flat transitions.
