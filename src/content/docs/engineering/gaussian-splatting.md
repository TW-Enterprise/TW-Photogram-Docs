---
title: "Gaussian Splatting"
description: "The File → Export → Train Gaussian Splatting action prepares a COLMAP\ndataset and runs the bundled Brush training engine without opening a separate viewer...."
---

The File → Export → **Train Gaussian Splatting** action prepares a COLMAP
dataset and runs the bundled Brush training engine without opening a separate viewer.
It requires at least two enabled aligned cameras, a fitted calibration, original
JPEG or PNG images and reconstructed tie points. The images are copied into a new dataset
directory; allow enough disk space. Camera poses and points remain in local ENU
metres. The exporter converts the Brown tangential terms and pixel-centre origin
from TW-Photogram's convention to COLMAP's corner-origin convention.

The macOS application package must include the headless Brush executable and
its license. When building it, set `TW_BRUSH_EXECUTABLE` and `TW_BRUSH_LICENSE`.
The Brush source is available at <https://github.com/ArthurBrussee/brush> under
Apache-2.0. The integration was developed against commit
`1388f74c6fe0236f68ee4915564bf00e9d2e3747`.

## Locating the trainer

`pipeline::gaussian::locate_brush(settings_hint)` searches, in order, the
`TW_BRUSH_EXECUTABLE` environment variable, the path configured in settings
(a file or a directory containing `brush`), the directory of the running
executable, `../Resources` of a macOS bundle, and every `PATH` entry. When
nothing is found the error lists every path that was tried.

## Training options

`pipeline::gaussian::TrainingOptions` maps to Brush flags verified against the
pinned commit:

| Option           | Brush flag             | Allowed range        | Default   |
|------------------|------------------------|----------------------|-----------|
| `iterations`     | `--total-train-iters`  | 100 … 200 000        | 6000      |
| `max_resolution` | `--max-resolution`     | 256 … 8192 px        | 1024      |
| `max_splats`     | `--max-splats`         | 10 000 … 10 000 000  | 1 000 000 |
| `sh_degree`      | `--sh-degree`          | 0 … 3                | 3         |
| `seed`           | `--seed`               | any; `None` = Brush default 42 | `None` |
| `extra_args`     | appended verbatim      | may not repeat managed flags | empty |

`validate()` rejects values outside these ranges and extra arguments that
duplicate a managed flag. The export flags (`--export-every`, `--export-path`,
`--export-name gaussian.ply`) are always set so the result lands in the dataset
folder. `run_gaussian_training_with` takes the options; `run_gaussian_training`
keeps the older `(iterations)` signature with default options.

`estimate_training(options, image_count)` returns an **estimate** for the UI:
20–80 ms per iteration at the 1024 px / 1 M-splat reference point (discrete vs.
integrated GPU, from public Brush reports), scaled by half the pixel ratio plus
half the splat-cap ratio and +5 % per SH band, plus 0.3–1 s per image for
loading. The VRAM hint counts parameters plus two Adam moments per splat, a
cached batch of up to 64 images at the training resolution, and 512 MB of
render buffers. Label it as approximate in the interface.

Dataset preparation and training run in the background; progress and cancellation
are available in the Model toolbar. The result `gaussian.ply` and the training log
are saved in the new dataset folder. On successful completion TW-Photogram opens
the model in its own 3D viewport; if the active chunk has changed, the result is
left on disk and its path appears in Console. Use **Model → Buka Gaussian…** or
**File → Open Gaussian Splat (PLY)** to reopen it.

## Supported files and vertical axis

The loader (`pipeline::gaussian_view`) reads Gaussian PLY in `ascii 1.0`,
`binary_little_endian 1.0` and `binary_big_endian 1.0` with `float` or `double`
vertex properties in any order, spherical harmonics through degree 3 and up to
3 million splats. The viewport is Z-up (ENU). A `comment Vertical axis: …` line
(Brush writes either `y` or a unit vector) is parsed into `UpAxis::{Y, Z}`;
`read_gaussian_ply` returns the raw model plus the detected axis,
`load_gaussian_ply_as` converts using the detected axis or the caller's
assumption, and `load_gaussian_ply` assumes Z-up when the file says nothing
(TW-Photogram's own exports always carry the comment). Vertical axes other than
+Y/+Z are rejected explicitly.

`GaussianModel::with_up_axis(UpAxis::Y)` applies +90° about X
(`(x, y, z) → (x, −z, y)`) to positions and covariance axes and rotates the
spherical-harmonic coefficients with the matching per-band rotation so colours
stay attached to the geometry. `GaussianModel::rotated(q)` is the general form.

## SPZ and PLY export (`pipeline::gaussian_io`)

* `write_ply` produces binary little-endian PLY in the INRIA layout
  (`x y z f_dc_* f_rest_* opacity scale_* rot_*`, SH degree trimmed to the
  highest non-zero band) with the `Vertical axis: 0 0 1` comment.
* `write_spz` / `read_spz` implement Niantic's SPZ (<https://github.com/nianticlabs/spz>),
  legacy gzip container: 16-byte header `{magic 0x5053474e, version, numPoints,
  shDegree, fractionalBits, flags, reserved}` followed by positions (24-bit
  fixed point, `fractionalBits`), alphas (u8, sigmoid space), colours (u8,
  `f_dc·0.15·255 + 127.5`), log-scales (u8, `(ln s + 10)·16`), rotations and
  SH coefficients (u8 offset-binary `/128`, bucketed to 5 bits for band 1 and
  4 bits for bands 2–3 as the reference packer does). Writing uses version 2
  (3×u8 quaternion `xyz`, `w` derived); reading accepts versions 2 and 3
  (smallest-three 10-bit quaternions). Version 1 (float16) and version 4 (zstd
  streams) and files with vendor extensions are rejected with explicit errors.
* SPZ data is in the RUB frame (Y up); the writer rotates Z-up → RUB and the
  reader rotates back, so files interoperate with the reference tools.
  `fractionalBits` is 12 (≈0.25 mm) when all coordinates fit ±2048 m and is
  lowered automatically for larger ENU extents (24-bit range). Rotation error
  of version 2 grows as the quaternion's `w → 0`; SH coefficients outside
  [−1, 1] are clamped by the format.

## Crop and filter tools (`pipeline::gaussian_edit`)

Each function returns a new model and the number of removed splats, and fails
when nothing would remain:

* `crop_to_box(model, &BoundingBox3D)` — the reconstruction region; `rotation_deg`
  is interpreted as intrinsic XYZ Euler angles.
* `crop_to_polygon(model, &Geometry, z_range)` — an ENU Polygon/MultiPolygon
  (holes honoured) with an optional inclusive height range.
* `remove_outliers(model, k, std_ratio)` — statistical outlier removal on the
  mean distance to the `k` nearest neighbours (exact kNN through a uniform grid
  searched in expanding shells).
* `filter_by_opacity(model, min)` and `filter_by_scale_percentile(model, pct)`
  — the latter is the permanent form of the **Kurangi kabut** preview rule.

## Viewer helpers

`prepare_gaussians` sorts back-to-front with a stable LSD radix sort on exact
`u32` depth keys (`depth_key`, four 8-bit passes) instead of a comparison sort;
`needs_resort(prev_dir, new_dir, threshold_deg)` lets the viewer skip
re-sorting for small rotations. `pick_nearest(model, origin, dir, max_dist)`
returns the first splat whose 1σ ellipsoid the ray enters (exact quadratic
solve in the splat's covariance frame) and `distance(a, b)` supports
measurements.

**Kurangi kabut** is a reversible preview filter: it gradually fades splats larger
than the 99th percentile and splats close to the camera. Disable it to inspect
the unfiltered trained model. It does not modify the PLY or model coordinates,
and may also fade genuinely large scene features. Choose **Geser** and drag to
pan; turn it off to orbit. Shift-drag or middle/right-drag also pans.
Existing sparse 3D points initialize
training; they are not themselves a trained Gaussian model. The COLMAP text
export omits per-image track observations, which Brush does not require for
training; the mandatory point error field is written as zero because no per-point
reprojection statistic is exported.
