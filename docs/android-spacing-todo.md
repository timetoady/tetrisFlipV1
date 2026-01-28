# Android Spacing & Layout TODO

Date: 2026-01-24
Owner: Timetoady

## Observed issues
- Portrait (Standard): menus look fine but in-game view is zoomed/cropped horizontally (HUD cut off).
- Menus can be dragged out of view with touch (page scroll/overscroll).
- Handheld portrait: menus (title/mode/options) are oversized; title should always fit.
- Handheld landscape: game area is too small and left-shifted; must be centered.
- Compact mode still has extra vertical padding; field should be wider and shorter.
- Menus in landscape can be cut off at bottom; scrolling is OK, but title must fit.

## Prioritized fixes
1) **Viewport scaling**
   - Scale game to fit BOTH width and height (not height-only), with safe padding.
   - Center the game canvas after scaling (no left bias).
   - Re-evaluate wrap padding-left; remove or make responsive.

2) **Prevent menu drag/scroll**
   - Lock body/html overflow on Android so swipe doesn’t move the page.
   - Keep menu/help scrolling inside panels only.

3) **Portrait menu sizing**
   - Add responsive font/spacing for small handheld screens.
   - Ensure splash/title screen fits without clipping.

4) **Landscape menu layout**
   - Create a landscape layout for Mode Select / Options:
     - Reduce vertical spacing and/or use multi-column grid.
     - Keep title and back buttons visible without scrolling.

5) **Compact mode height**
   - Increase compact reductions (likely -2 rows per field, additional -4 total).
   - Re-test spawn/flip safety after further reductions.

6) **HUD + field sizing**
   - Consider reducing HUD width in compact mode.
   - Tighten HUD spacing (scores/hold/next) for small screens.

## Implementation touchpoints
- `src/main.js`: viewport scaling, centering, touch scaling.
- `src/style.css`: html/body overflow, responsive menu sizes, landscape layout rules.
- `src/constants.js` + layout config in `src/main.js`: compact row adjustments.
- `src/systems/gameloop.js`: spawn row/visible rows after changes.

## Device test checklist
- Pixel 8 Pro (portrait/landscape)
- AYN Thor (portrait/landscape)
- Compact vs Standard, Mode Select, Options, Title
- In-game HUD visibility (score/hold/next), centered canvas

## Notes
- Current compact reduction is -6 total rows (neutral -2, field -2 each); likely still insufficient.
- Menus should be tight in landscape but still legible.

## Progress
- [x] Fit scaling to both width and height; center canvas transform (needs device re-check).
- [x] Lock body scroll; keep menu panel scrolling when constrained.
- [x] Add responsive menu sizing for small screens and a landscape grid for Mode/Options (needs device re-check).
- [ ] Re-test compact row reductions (now -2 per field, -2 neutral) and adjust further if needed.
- [ ] Evaluate HUD width/spacing in compact mode after scaling changes.

## Android 10 handheld issues (post-launch)
- Options controller image should be contained (max-width/height); no overflow on tall or wide handhelds.
- Menu layout switches between narrow portrait and wider landscape automatically; applies to Mode Select too.
- Selected menu item stays visible without manual touch scroll (auto-scroll to selection).
- Splash/title screen should fill the display with consistent padding (no large gray bars).
- Compact mode momentum meter should move up ~50px when touch buttons are removed.
