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

## Dedicated flood simulation report

After a successful simulation, use **Cetak Laporan Banjir (PDF)** in the flood panel,
then **Render**, **Simpan PDF**, and **Buka PDF / Cetak**. The existing print dialog
also offers **Laporan banjir**. Indonesian is the default; English is selectable.
Text pages default to A4 portrait and map sheets to A3 landscape.

`flood_report::FloodReportSnapshot` freezes the exact run configuration and source
rasters, domain shapes, CRS, timestamp and `Arc<FloodResult>`. Solver-relevant edits
invalidate export eligibility. Derived hazard shapes do not invalidate a run.
`FloodReportSpec` controls document identity/revision, reviewer, notes, logo, paper,
map scale, overlays and selected stored frames. `build_flood_report` returns the
existing vector `Document`; it accepts cancellation through the spec's shared flag.

The report contains document control, executive metrics, geospatial metadata,
methodology, numerical water budget, limitations, charts, thematic maps, six automatic
time snapshots and parameter/reference appendices. Snapshots use the nearest stored
frames to six equally spaced times, remove duplicates and share one depth scale.
Area uses valid cells times `cell_m²`, with the explicit depth threshold 0.01 m.
Ever-wet union area is separate from the largest simultaneous area in stored frames.
Arrival uses depth > 0.05 m; inundation duration uses the configured threshold.

HAND and connected bathtub reports are static: they do not claim velocity, arrival,
duration, hydrograph or dynamic water-balance validation. Static hazard maps are
available only for depth-only schemes. Solver elevations and prescribed stages are
**local ENU**, not the configured DEM export vertical datum. Depth is relative metres.
ISO 19115-1:2014 and ISO 19157-1:2023 guide metadata and quality disclosure; no
certification or field-calibration claim is inferred from these headings.

Reports include a true-colour orthomosaic overview when the source run has an
orthomosaic. Thematic maps and time snapshots preserve its photographic RGB with
a 55% flood overlay; DEM hillshade is the fallback when no orthomosaic exists.
NODATA remains separate from dry/never-reached cells. Shapes are inventoried with attributes
and SHA-256 hashes rather than dumping every coordinate. Rendering and atomic PDF
saves run off the UI thread; generation checks reject late previews and stale print
links, and preview textures upload on demand.

```
cargo test --test flood_report_tests
cargo test --lib ui::print_dialog::flood_report_tests
cargo run --example render_flood_report -- project.twp report.pdf [config.json] [en]
cargo run --example render_flood_report -- --photos mapping_01 report.pdf
cargo run --example render_flood_report -- project.twp report.pdf --build-ortho
```

The `--photos` path builds a real sparse-point DEM and a 0.10 m/px orthomosaic
for integration QA, explicitly labelled as such. `--build-ortho` reconstructs the
photographic background from an existing aligned project before running the report. It is not dense reconstruction, hydraulic calibration or evidence
of survey accuracy. The regular path uses the saved project's DEM and flood config.
