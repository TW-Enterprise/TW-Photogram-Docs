---
title: "Algorithms Ported from OpenDroneMap / PDAL"
description: "Reference: which open-source algorithms back which TW-Photogram module, and\nwhat was changed...."
---

*Reference: which open-source algorithms back which TW-Photogram module, and
what was changed.*

---

## 1. Where the algorithms actually live

WebODM is a Django application: projects, tasks, tiles, and the map viewer. As of
2026 it has **decoupled from OpenDroneMap** and dispatches processing to `ODX`
(its README states WebODM "is not a user interface to OpenDroneMap" and "uses
ODX, not ODM"). `ODX` is not in that repository, so its code is not available to
read.

The open-source photogrammetry algorithms that WebODM and NodeODM have always
invoked are in three places:

| Repository | Licence | What it provides |
| :--- | :--- | :--- |
| [`OpenDroneMap/ODM`](https://github.com/OpenDroneMap/ODM) | AGPL-3.0 | Pipeline orchestration and the geometry/GSD/boundary/DEM/orthophoto helpers in `opendm/` |
| [`OpenDroneMap/PDAL`](https://github.com/OpenDroneMap/PDAL) | BSD-3-Clause | `filters.smrf` ground classification, morphological operators |
| WebODM `app/api/hillshade.py` | AGPL-3.0 (derived from Matplotlib, BSD) | Terrain shading |

**Licence note.** ODM is AGPL-3.0. It is used here as a *specification of
behaviour*, re-implemented from published papers and described source structure —
not copied. SMRF originates in PDAL (BSD-3-Clause) and implements Pingel, Clarke
& McBride (2013), a peer-reviewed method; that paper is the primary reference for
`smrf.rs`. Confirm the licence position with the repository owner before
distributing anything outside the project.

---

## 2. Ported algorithms

### 2.1 Ground sample distance — `src/pipeline/gsd.rs`

Source: `opendm/gsd.py`.

| ODM function | Ported as | Formula |
| :--- | :--- | :--- |
| `calculate_gsd_from_focal_ratio` | `gsd_from_focal_ratio` | `gsd_cm = ((H_m * 100) / W_px) / focal_ratio` |
| `calculate_gsd` | `gsd_from_sensor` | `focal_ratio = f_mm / sensor_width_mm` |
| `opensfm_reconstruction_average_gsd` | `average_gsd_cm` | Mean over shots of the per-shot GSD, absolute value |
| `image_scale_factor` | `image_scale_factor` | Half-octave downscale in `{1, 1/2, 1/4, ...}` |
| `cap_resolution` | `cap_resolution_cm` | `max(requested, gsd * (1 - 0.1))` |
| `image_max_size` | `image_max_size` | `ceil(max(W, H) * scale)`, never above the source |

ODM's own doctest is reproduced as a unit test:
`calculate_gsd(13.2, 100, 8.8, 5472) = 2.74`.

The half-octave loop is ported faithfully, including a consequence that is easy to
get wrong: for a 2.0 cm/px survey and a 4.0 cm/px target the result is **1.0**,
not 0.5, because the padded GSD (3.0) already satisfies the target.

### 2.2 Survey boundary — `src/pipeline/boundary.rs`

Source: `opendm/boundary.py`.

`compute_boundary_from_shots` takes the convex hull of the shot origins, buffers
it, and returns nothing when there are fewer than three shots. Ported as
`boundary_from_shots`, with:

* `convex_hull` — Andrew's monotone chain, collinear points dropped (OGR's
  `ConvexHull` behaves the same).
* `buffer_convex` — vertex-bisector offset, `distance = buffer / sin(theta/2)`,
  which matches `OGRGeometry::Buffer` for a convex ring.

### 2.3 Orthomosaic blending — `opendm/orthophoto.py`

ODM's `merge` runs three passes:

1. **Naive fill** — write a source pixel wherever the destination alpha is 0.
2. **Feather** — `blended = alpha/255 * src + (1 - alpha/255) * dst`.
3. **Cutline pass** — the same weighted average against the cutline raster.

That compositing formula is the reference for the two-pass feathering in
`dem_ortho.rs`. The project additionally enforces `Alpha = 0` outside every camera
footprint, which ODM also does through its alpha band.

### 2.4 Cutline — `src/pipeline/cutline.rs`

Source: `opendm/cutline.py`.

ODM's sequence:

1. `skimage.feature.canny` on the orthophoto → strong edges.
2. Cost map: edges `0`, background `1`, barrier lines `9999`.
3. `skimage.graph.route_through_array(..., fully_connected=True, geometric=True)`
   between barrier-gap anchors, then `polygonize`.

Ported:

| ODM / skimage | Ported as |
| :--- | :--- |
| `max(8, ceil(min(w,h)/256))` barrier lines | `barrier_line_count` |
| `skimage.draw.line` barrier painting | `CostMap::draw_barrier_line` |
| `route_through_array` (8-connected Dijkstra) | `route` |
| Canny | `sobel_edge_mask` (Sobel magnitude, normalised, thresholded) |

`route` is a binary-heap Dijkstra whose diagonal steps cost `SQRT_2` times the
destination cell, which is what `geometric=True` means. The built-in edge
detector is Sobel rather than Canny — Canny's hysteresis needs two thresholds and
a Gaussian stage that would be a new dependency. The routing stage, which is
where the seam quality actually comes from, is ported exactly.

### 2.5 SMRF ground classification — `src/pipeline/smrf.rs`

Source: `PDAL filters/SMRFilter.cpp`, configured by ODM's `--smrf-*` options.

Implementation of Pingel, Clarke & McBride (2013). Stages ported one-to-one:

| PDAL | Ported as | Detail |
| :--- | :--- | :--- |
| `createZImin` + `knnfill` | `minimum_surface`, `knn_fill` | min Z per cell, voids filled with the mean of 8 nearest |
| `createLowMask` | `low_mask` | negated surface, slope 5.0, **1 m** window |
| `createObjMask` | `progressive_filter` | erode 1 px, dilate `radius`, compare with previous opening |
| `createZIpro` | in `classify` | object/low cells dropped, voids refilled |
| `math::erodeDiamond` / `dilateDiamond` | `erode_diamond`, `dilate_diamond` | separable L1-ball, same result, `O(n*r)` |
| `classifyGround` | `classify` | `abs(ZIpro - z) <= threshold + scalar * gsurfs` |

Defaults are PDAL's, which ODM passes through unchanged:

```
scalar    = 1.25
slope     = 0.15
threshold = 0.5
window    = 18.0 m   (PDAL: 18 * cell)
cell      = 1.0 m
```

Two behaviours worth recording, both established by direct 2-D transcription of
the PDAL code during development:

* The **minimum** surface never sees a *raised* object; a roof is rejected by the
  point-level `threshold + scalar * slope` test. The progressive mask catches
  protrusions that survive opening.
* **Depressions are idempotent under opening**, so the progressive mask does not
  flag a pit; the low mask is responsible for those, and only for large ones.

`classify_ground_points` in `mvs.rs` now delegates here. The previous "moving
minimum + fixed height band" could not separate a kerb from a hedge of the same
height and called the roof plane of a low building ground.

### 2.6 Hillshade — `src/pipeline/hillshade.rs`

Source: WebODM `app/api/hillshade.py` (Matplotlib `LightSource`).

```
az  = radians(90 - azdeg)        # clockwise-from-north -> maths convention
alt = radians(altdeg)
L   = (cos(az)cos(alt), sin(az)cos(alt), sin(alt))
N   = normalize(-dz/dx, -dz/dy, 1)
I   = clip(dot(N, L) * fraction, 0, 1)
```

Defaults az 315 degrees, alt 45 degrees. Verified against the closed form: for
`dz/dx = -0.5` the intensity is `0.408849`, and for `dz/dx = +0.5` it is
`0.856062`.

---

## 3. What was deliberately not ported

| ODM / WebODM feature | Why |
| :--- | :--- |
| `opendm/osfm.py`, OpenSfM | Needs OpenSfM as a binary; this project does its own SfM in `sfm.rs` |
| `renderdem`, `dem2mesh`, PoissonRecon, `odm_texrecon` | External C++ binaries; `dem_ortho.rs` and `mesh_gen.rs` already build DEMs and meshes natively |
| `smrf` through the PDAL CLI | Re-implemented natively so no external binary is required |
| WebODM `tiler.py`, Django REST views | Presentation and HTTP; no algorithm |
| ODM `--pc-filter` statistical outlier | Not yet ported; the parameters (`meanK = 16`, `2.0 sigma`) are recorded here for a follow-up |
| ODM `--pc-rectify` ground rectification | Not yet ported; needs the full SMRF output plus area-threshold polygon reclassification |

---

## 4. Status

Every algorithm above is implemented and covered by unit tests in its own module
(`#[cfg(test)] mod tests`), plus the project-wide suites.

Verified in this workspace after the port:

* `cargo check --all-targets` — 0 warnings.
* `cargo test --tests` — 103 passed, 0 failed, exit code 0. This includes
  `test_mapping_01_full_pipeline` (371 s) against the real `mapping_01` survey.

Not verified — state `not measured` in any report until someone does it:

* No comparison against an actual ODM/WebODM run on the same dataset.
* No accuracy assessment (GCP RMSE) of the SMRF-classified ground.

---

## 5. References

* Pingel, T. J., Clarke, K. C., & McBride, W. A. (2013). *An improved simple
  morphological filter for the terrain classification of airborne LIDAR data.*
  ISPRS Journal of Photogrammetry and Remote Sensing, 77, 21–30.
* Matplotlib `LightSource` (BSD) — Horn hillshading.
* ODM `opendm/gsd.py`, `boundary.py`, `cutline.py`, `orthophoto.py`, `dem/`.
* PDAL `filters/SMRFilter.cpp`, `private/MathUtils.hpp`.
