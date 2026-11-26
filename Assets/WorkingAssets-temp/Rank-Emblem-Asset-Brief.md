# BigBlackGymLog rank emblem brief

Work from `Assets/WorkingAssets-temp/` in the BigBlackGymLog project. Use the current reference images in that folder for each rank and tier.

## Goal

Create 15 finished emblems, covering five rank positions across three tiers. Fully Bricked is a separate capstone and is already complete. Leave it untouched.

The script currently displays blank emblems with HTML rank names overlaid on them. Bake each rank name into the artwork so the emblem and lettering are a single image. Make the lettering look physically integrated into the material, such as ink absorbed into cardboard, lettering stamped into metal, or engraving with realistic depth and highlights. Match the spelling and wording on the corresponding text-bearing reference, and keep the name legible at its in-game display size.

## Tier progression

Give each rank position three distinct versions that look like successive upgrades of the same emblem. Carry recognizable elements such as the silhouette, layout, or signature details across tiers. Show progression through materials, craftsmanship, construction, and finish. Use the name for the specific tier and rank shown in its reference.

The first rank position is the model for this progression:

- **Tier 1, Dry Clay** — A simple piece of cardboard with the name integrated into it.
- **Tier 2, Parched Clay** — The existing cardboard-on-scrap-metal design.
- **Tier 3, Cracked Clay** — A cleaner, shinier, better-finished version of the Tier 2 design.

Apply the same progression principle to the other ranks. Settle each rank’s specific materials and lettering treatment as we work through the assets.

## Drop-in sizing

- Match the exact canvas width and height in pixels, aspect ratio, overall proportions, and placement of the corresponding reference. Use the text-bearing reference for the name and its layout. Use the blank emblem currently displayed by the script to verify the drop-in geometry. If the two references differ, use the blank emblem’s geometry for the finished export.
- Preserve the visible footprint, alignment, transparent margins, and clean alpha edges. Keep the emblem in the same position and at the same scale on the canvas. Avoid stretching, cropping, zooming, or recentering it.
- Verify the exported pixel dimensions and transparency against the reference. The finished image should fit the existing UI with no layout adjustments.

## Review and final saving

- Work on the rank and tier I specify. When revising, use the most recently approved version as the starting point. Preserve the original references.
- Keep drafts and previews outside `Assets/WorkingAssets-temp/`. Save a copy in that folder only after I explicitly confirm that the image is finalized.
- Name the finalized copy exactly like the corresponding reference, with `-new` inserted before the file extension. For example, `T1R1-Dry-Clay.png` becomes `T1R1-Dry-Clay-new.png`.
- Keep the work focused on artwork unless I ask to integrate the finished assets into the script.
