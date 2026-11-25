# Nano Banana Pro Cutout Asset Guide (`#FF00FF` Pipeline)

## Mandatory Style DNA Suffix
Append this exact suffix to every cutout prompt to lock consistent gouache/watercolor cardstock look, sepia ink outlines, orthographic front view, and clean chroma-key isolation:

```text
handcrafted 2D pop-up book paper cutout illustration, straight-on flat orthographic front view, printed on matte textured watercolor cardstock paper, subtle layered paper collage shading, crisp bold dark sepia ink outlines, warm vintage storybook gouache palette, chunky charming miniature proportions, flat straight bottom edge for pop-up hinge, clean sharp scissor-cut silhouette with thin cream paper rim, completely flat even studio lighting with zero cast shadows, isolated on solid flat pure neon magenta #FF00FF background
```

## Best Practices
- **Why `#FF00FF`?** Never collides with white characters/clouds or green foliage/roofs.
- **Pin 1 Architecture Cutout as Style Reference** so characters and buildings share identical watercolor pigment grain and ink weight.
- **Sprite Sheets (2x2 or 1x3):** Always specify `"with generous empty space between them"` so `scripts/process_cutouts.py` can auto-slice every prop deterministically via connected components.
