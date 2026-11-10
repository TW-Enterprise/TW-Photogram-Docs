---
title: "Vector Layers, Administrative Boundaries and Raster Clipping"
description: "TW-Photogram carries a Metashape-style Shapes layer per chunk (Chunk.shapes). Shapes are\nsimple-feature geometries (OGC 06-103r4 semantics) with attribute..."
---

TW-Photogram carries a Metashape-style **Shapes** layer per chunk (`Chunk.shapes`). Shapes are
simple-feature geometries (OGC 06-103r4 semantics) with attributes, a CRS and an optional
*boundary role*. They are used to:

* clip the DEM, orthomosaic, dense cloud, mesh and the flood domain (`BoundaryType::Outer`
  keeps the interior, `BoundaryType::Inner` cuts holes — identical to Metashape's
  "Boundary type" attribute and to `gdalwarp -cutline`);
* label administrative areas on the map and in the printed map sheet;
* hold generated products (contours, flood-hazard polygons);
* compute zonal statistics (area, elevation min/mean/max, cut/fill volumes).

## Modules

| Module | Role |
|---|---|
| `pipeline/vector.rs` | `Geometry`, `Feature`, `FeatureCollection`, `Crs`, reprojection ENU ⇄ WGS84 ⇄ UTM, Douglas–Peucker, Chaikin, areas |
| `pipeline/vector_io.rs` | GeoJSON (RFC 7946), ESRI Shapefile (`.shp/.shx/.dbf/.prj/.cpg`), KML/KMZ, DXF writer |
| `pipeline/admin_boundary.rs` | Online administrative boundaries: BIG (Indonesia, ArcGIS REST), geoBoundaries, GADM, generic ArcGIS REST |
| `pipeline/clip.rs` | Mask rasterization (centre / all-touched), buffer (disc dilation/erosion), invert, crop-to-cutline, `clip_elevation`, `clip_rgba`, `zonal_statistics` |
| `ui/shapes.rs` | "Batas" dock: import, search/download, digitise, roles, buffer, export, clip DEM, zonal statistics |

## CRS handling

Only three CRSs are accepted; anything else fails at import with an explicit message:

* `Wgs84Geographic` — EPSG:4326 `[lon, lat]`.
* `UtmWgs84 { zone, northern }` — EPSG:326zz/327zz metres.
* `LocalEnu` — the chunk's east/north metres (hand-drawn shapes without a geodetic origin).

Hand-drawn polygons are converted to WGS84 at creation when the chunk has an `enu_origin`, so they
survive re-alignment and can be exported. `FeatureCollection::to_enu(origin)` projects any layer
onto the survey frame on demand; nothing is stored twice.

## Clipping semantics

```
mask = (∪ Outer shapes, buffered)  ∧  ¬(∪ Inner shapes, buffered)
```

* No Outer shape → everything is kept except the Inner holes.
* `all_touched = false` keeps cells whose centre is inside; `true` also keeps cells touched by the
  polygon edge (Liang–Barsky segment/cell test).
* `buffer_m` is applied per shape as a Euclidean-disc morphological dilation (positive) or erosion
  (negative) at raster resolution.
* `crop_to_cutline` trims rows/columns that became NODATA and recomputes the sample-centre bounds.
* Clipping during **Build DEM / Build Orthomosaic** is non-destructive: the product is built then
  masked. The "Potong DEM sekarang" button in the dock replaces the DEM and keeps a one-step undo.

## Administrative boundary sources

| Provider | Coverage | Levels | Licence |
|---|---|---|---|
| BIG (Badan Informasi Geospasial) ArcGIS REST | Indonesia (RBI) | provinsi, kabupaten/kota, kecamatan, desa/kelurahan | see service attribution |
| geoBoundaries (gbOpen) | World | ADM0–ADM4 | CC BY 4.0 |
| GADM 4.1 | World | level 0–4 | academic / non-commercial |
| Generic ArcGIS REST | any FeatureServer/MapServer layer | — | per service |

Search is bounded to the survey bbox (DEM → ortho → aligned camera extent) and optional name
filter; downloads are size-capped and cached atomically under the application cache directory.

## Verification

```
cargo test --lib pipeline::vector pipeline::clip
cargo test --test vector_io_tests --test admin_boundary_tests
```
