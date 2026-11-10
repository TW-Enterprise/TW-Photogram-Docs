---
title: "UI design system"
description: "TW-Photogram's egui interface follows the design system of\nPhotoCraft(https://github.com/storytold/photocraft): dark charcoal docks, monochrome Lucide-style\ni..."
---

TW-Photogram's egui interface follows the design system of
[PhotoCraft](https://github.com/storytold/photocraft): dark charcoal docks, monochrome Lucide-style
icons tinted by the theme, Inter and JetBrains Mono, pill buttons and 28 pt tab strips. The window
layout stays Metashape's: Workspace left, Model/Ortho/Photo viewport centre, Photos/Console bottom,
Properties right. This page is the reference; [`UI_UX_RULES.md`](../../UI_UX_RULES.md) holds the
rules a change must pass.

## Where things live

| Path | Role |
|---|---|
| `src/ui/tokens.rs` | `Tokens` (every colour and radius), `tokens::size` (chrome sizes), fonts, `apply`, `contrast`, `lerp_color` |
| `src/ui/widgets/` | Shared widgets: `dock` (dock card, rails, strips), `tab_strip`, `buttons`, `panel` (cards, tags, banners, separators, popup-menu style), `dialog` (screen-bounded windows, form grid, workflow dialog), `tooltip` |
| `src/ui/icons.rs` | Typed icon constants (`Icon::SAVE`, …) and icon buttons (`button`, `toggle_button`, `rail_button`, `tab_button`, `menu_button`) |
| `src/ui/icon_data.rs` | Generated table of embedded SVGs (`scripts/gen_icon_data.sh`) |
| `assets/icons/*.svg` | 24×24 line icons; Lucide (ISC, `LICENSE-lucide.txt`) plus our photogrammetry icons |
| `assets/fonts/` | Inter Regular/Medium/SemiBold, JetBrains Mono (OFL) |

Panels and dialogs compose widgets. They read colours from `Tokens::get(ui.ctx())` and never write
`Color32::from_rgb` for chrome. Colour literals are allowed only for data: ASPRS point classes, the
DEM legend, XYZ axes, GCP markers, flood depth.

## Themes

`AppTheme` has two values. Settings saved by older builds as `"Charcoal"` or `"Dark"` load as Pro
Dark, `"Light"` as Pro Light.

| Token | Pro Dark | Pro Light | Used for |
|---|---|---|---|
| `chrome` | 50 | 240 | menu bar, toolbar, status bar, rails, dialogs' panel fill |
| `dock` | 30 | 226 | background behind dock cards (the 4 pt gaps) |
| `card` | 50 | 240 | dock cards, windows |
| `card_border` | 30 | 214 | card outline |
| `tab_strip` | 38 | 226 | tab strip behind the tabs; the active tab takes `card` |
| `canvas` | 40 | 214 | 3D, Ortho and Photo view background |
| `field` / `field_border` | 36 / 74 | 255 / 186 | text fields, combo boxes |
| `hover` / `pressed` | 66 / 78 | 226 / 206 | button states |
| `row_selected` | 82 | 204 | selected tree row, settings section, active rail button uses `pressed` |
| `text` / `text_dim` / `text_faint` | 222 / 178 / 128 | 20 / 64 / 120 | primary, secondary, hint text |
| `icon` | 200 | 46 | resting icon tint |
| `accent` | (55,142,240) | same | selection, primary button, focus ring, popup-menu hover |
| `success` / `info` / `warning` / `danger` | (88,196,120) / (110,170,245) / (232,176,70) / (244,124,128) | (20,120,55) / (16,98,196) / (140,88,0) / (200,40,48) | status tags, banners, status dot |
| radius | 3 / 4 / 6 | same | `radius_sm` buttons, `radius` cards, `radius_lg` windows |

Grey values are `(v, v, v)`. `test_pro_theme_text_contrast` checks that `text`, `text_dim` and the
four status colours reach 4.5:1 on `chrome`, `card` and `field` in both themes. Selected widgets draw
`primary_text` (white) on the accent.

## Chrome sizes (`tokens::size`)

| Constant | pt | Where |
|---|---|---|
| `TOOLBAR_H` | 36 | top toolbar |
| `STATUS_H` | 24 | status bar |
| `RAIL_W` | 36 | right toolbar rail and collapsed side docks |
| `TAB_STRIP_H` | 28 | dock tab strips |
| `DOC_TAB_H` | 26 | viewport Model/Ortho/Photo tabs |
| `ICON_BUTTON` / `ICON_GLYPH` | 28 / 16 | toolbar and rail icon buttons |
| `ICON_SMALL` | 14 | tree, menu, list and settings-section icons |
| `GROUP_GAP` | 4 | gap between dock cards |

Dialog layout constants are in `widgets::dialog`: `DIALOG_W` 420, `FIELD_W` 220, `LABEL_COL_W` 108,
`GAP` 8, `GAP_S` 4, `CONTROL_H` 28.

## Docks and tabs

- Every dock is a card: `widgets::dock::card_with_header` paints the tab strip and returns a child
  `Ui` for the body, clipped to the card.
- The end button of the strip is a chevron that collapses the dock.
- A collapsed side dock becomes an icon rail (`dock::collapsed_rail`) with one button per tab;
  clicking one reopens the dock on that tab.
- A collapsed bottom dock shows only its tab strip (`dock::collapsed_strip`).
- `Ctrl+1`, `Ctrl+2` and `Ctrl+3` toggle Workspace, Photos/Console and Properties, as do the
  viewport's Panel menu and the View menu.

## Typography

| Use | Font |
|---|---|
| Body, buttons | Inter 12 |
| Small labels | Inter 10.5 |
| Headings | Inter SemiBold 15 (`tokens::semibold`) |
| Tabs, pill buttons, tooltip titles | Inter Medium (`tokens::medium`) |
| Numbers that change (coordinates, timers, ms/frame) | JetBrains Mono (`tokens::mono`) |

Ubuntu Light stays as a glyph fallback and for the PDF report.

## Adding an icon

1. Save a 24×24 SVG that strokes with `currentColor` in `assets/icons/<name>.svg`. Use the Lucide
   file when one exists; otherwise draw it in the same style (stroke 2, round caps and joins).
2. Run `scripts/gen_icon_data.sh` from the repository root.
3. Add a constant to the `icons!` block in `src/ui/icons.rs`.

The `every_icon_constant_has_an_svg` unit test and
`test_svg_icons_are_lucide_style_and_all_embedded` catch a missing file or a forgotten regeneration.
At load time the SVG's `currentColor` becomes white and the stroke width becomes 1.75; each use tints
it.

## Checking a change visually

The app has development hooks for screenshots without a screen recorder:

```sh
TWP_SCREENSHOT=/tmp/shot.png TWP_THEME=light ./target/debug/TW-Photogram --sample
TWP_COLLAPSED=1 TWP_SCREENSHOT=/tmp/rails.png ./target/debug/TW-Photogram --sample
TWP_OPEN=settings TWP_SCREENSHOT=/tmp/prefs.png ./target/debug/TW-Photogram --sample
```

`TWP_SCREENSHOT_FRAMES` sets how many frames to wait before saving, 150 by default. Check both themes
before committing.
