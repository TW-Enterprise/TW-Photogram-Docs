---
title: "Map Sheet and Survey Report (PDF)"
description: "src/pipeline/report/ renders cartographic map sheets and multi-page survey reports as\nvector PDF. The dialog File → Export → Print Map Sheet / Report (PDF)…..."
---

`src/pipeline/report/` renders cartographic map sheets and multi-page survey reports as
vector PDF. The dialog **File → Export → Print Map Sheet / Report (PDF)…** (`ui/print_dialog.rs`)
drives it; `examples/render_report.rs` renders both from a saved project.

## Engine

| Module | Role |
|---|---|
| `layout.rs` | Millimetre page model: `PaperSize` A0–A4/Letter, `Orientation`, `Item` (text with wrap/rotation/weight, rect, line, polyline, image, table), text measurement via ab_glyph |
| `raster.rs` | Same page rendered to RGBA at any DPI (dialog preview, PNG) |
| `pdf.rs` | `pdf-writer`: Type0/CIDFontType2 fonts with embedded `FontFile2`, `W` widths, `ToUnicode` (text is selectable/searchable), Flate images with SMask, vector paths, Info dictionary + XMP, outlines, `/Lang` |
| `font.rs` | Ubuntu Light / Bold (UFL 1.0) metrics from `head`/`hhea`/`OS/2`/`post` |
| `map_sheet.rs` | Map sheet composition |
| `survey_report.rs` | Multi-page report |
| `lang.rs` | Indonesian / English strings |

Raster preview and PDF share one resolved primitive list, so what the dialog shows is what the
PDF contains.

## Map sheet (BIG / RBI conventions)

* Neat line with **UTM grid** (lines sampled every 50 m through `utm_to_geodetic → EnuOrigin::to_enu`,
  so meridian convergence is honoured) and `472 100 mE / 9 654 700 mN` labels; lat/lon graticule
  ticks in DMS inside the frame.
* **Numeric scale** from the standard series 1:500, 1 000, 2 000, 2 500, 5 000, 10 000, 20 000,
  25 000, 50 000 — the smallest that fits the extent without stretching; grid interval and graphic
  scale bar derive from it.
* Grid-north arrow with meridian convergence, legend (continuous or classed elevation ramp,
  index/intermediate contours, boundary, GCP, NODATA, hazard classes), inset location map,
  reference system block (horizontal datum, UTM zone/EPSG, vertical datum), accuracy block
  (ASPRS 2014 RMSE/NVA/VVA class and SNI 8202:2015 class for the sheet scale), sources, dates,
  organisation, logo, software version.
* Layers: DEM (hillshade + ramp, contours, boundaries), orthomosaic, slope (Horn, FAO classes),
  flood hazard (ARR / BNPB classes).
* Contours, boundaries and GCPs are drawn as vectors in the PDF.

## Survey report

Pages: cover · executive summary · ISO 19115-1 metadata (identification, extent WGS84 + UTM,
reference systems, lineage, DQ_PositionalAccuracy per ISO 19157) · equipment and camera
calibration (Brown–Conrady radial curve) · processing parameters · positional accuracy (GCP /
checkpoint table, RMSE, NVA = 1.96·RMSEz, horizontal 95 % = 1.7308·RMSEr, ASPRS 2014 Tables
B.5/B.6, SNI 8202:2015 CE90/LE90 classes) · DEM sheet (+ slope sheet, + flood hazard sheet when a
simulation exists) · orthomosaic sheet · camera appendix. RMSE values reuse
`control_points::reference_statistics`, identical to the HTML processing report.

## Verification

```
cargo test --test report_tests --test infographic_tests --lib pipeline::report
cargo run --release --example render_report -- project.twp out   # out.sheet.pdf, out.report.pdf
pdfinfo out.report.pdf && pdftotext out.report.pdf - | head      # metadata and text extraction
```
