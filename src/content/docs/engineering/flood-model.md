---
title: "Flood Simulation (Genangan)"
description: "src/pipeline/flood/ implements 2-D inundation modelling on the chunk DEM. It replaces the\nearlier exploratory Manning-diffusive routing with published, valida..."
---

`src/pipeline/flood/` implements 2-D inundation modelling on the chunk DEM. It replaces the
earlier exploratory Manning-diffusive routing with published, validated formulations.

## Models (`FloodConfig.model`)

| Model | Reference | Use |
|---|---|---|
| `LocalInertial` (default) | Bates, Horritt & Fewtrell (2010) *J. Hydrol.* 387:33–45; q-centred term de Almeida et al. (2012) | Rainfall-runoff and inflow routing in time (LISFLOOD-FP / HEC-RAS 2D diffusion class) |
| `StaticHand { stage_m }` | Nobre et al. (2011) HAND | Rapid inundation extent for a stage above the nearest drainage |
| `Bathtub { level_m }` | connected bathtub | Still-water level reachable from the grid edge / inflow cell |

Local-inertial update per face:

```
q⁺ = (q − g·h_f·Δt·∂(z+h)/∂x) / (1 + g·Δt·n²·|q| / h_f^{7/3})
h_f = max(η_i, η_j) − max(z_i, z_j),   dry threshold 1 mm
Δt = α·Δx / √(g·h_max),  α = 0.7 (CFL), clipped to series / breach knots and frames
```

Mass is conserved to round-off: the UI prints the volume-budget residual
(`rain + inflow + boundary_in + initial − out − final`).

## Hydrology (`FloodConfig.loss_model`)

* `RunoffCoefficient` — rational-method C (legacy field `runoff`).
* `ScsCurveNumber { cn }` — USDA TR-55: `S = 25400/CN − 254` mm, `Ia = 0.2 S`.
* `GreenAmpt { ks_mm_h, psi_mm, delta_theta }` — implicit Green–Ampt (Chow, Maidment & Mays 1988 §4.3), Newton per cell per step.

Rainfall may be uniform (`rain_mm_per_hour`, `rain_duration_seconds`) or a hyetograph CSV
(`rain_series`, seconds,mm/h). Point inflow, inflow hydrograph, open (critical outfall) and
fixed-stage boundaries, rectangular surface zones, scheduled / level-triggered breaches and a
discharge cross-section are retained from the previous solver.

## Domain

`domain_from_chunk` builds the solver domain from the chunk:

* DEM cells are coarsened to `cell_size_m` (0 = native resolution) by block mean; blocks with any
  NaN are impermeable walls.
* Outer/Inner boundary shapes (`Chunk.shapes`, see `vector-and-boundaries.md`) mask the domain.
* Polygon shapes with attributes `manning_n`/`n`, `runoff`/`C`, `cn`, `impermeable` become zones.

`estimate_cost` reports grid size, expected steps, time and memory before a run; the panel shows
it next to the cell-size control.

## Static analysis

`static_analysis` returns priority-flood depression filling (Barnes, Lehman & Mulla 2014), D8
flow direction (ESRI codes), flow accumulation, stream links above `stream_threshold_m2`, and the
HAND raster.

## Outputs (`FloodResult`)

Depth frames (`frame_count`), peak depth, peak velocity, peak depth×velocity, arrival time
(first depth > 5 cm), duration above `duration_threshold_m`, hazard raster and polygons
(`hazard_scheme`: ARR 2019 Book 6 H1–H6 or BNPB 02/2012 depth classes, editable), streams,
volume budget, hydrograph at the cross-section. Every layer exports to Float32 GeoTIFF
(`export::export_flood_raster`); hazard polygons export to GeoJSON/SHP/KML and can be added to the
chunk shapes for the map sheet (`FLOOD-01` sheet in the survey report).

## Verification

```
cargo test --lib pipeline::flood
cargo test --test flood_tests
```

Tests cover closed-basin mass conservation, dam-break against the exact Riemann solution of the
discretised p-system (with Ritter as an envelope), steady uniform flow vs Manning normal depth,
Green–Ampt (Chow Ex. 4.3.1) and SCS-CN (TR-55) reference values, priority-flood, D8, HAND,
bathtub connectivity, hazard monotonicity and polygon area equality.
