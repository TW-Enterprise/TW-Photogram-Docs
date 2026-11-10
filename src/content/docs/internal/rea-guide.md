---
title: "REA (Reverse Engineer Anything) Guide for Agisoft Metashape"
description: "This guide provides operational workflows for AI agents using the REA MCP Server to reverse-engineer, inspect, and benchmark against the official Agisoft..."
---

This guide provides operational workflows for AI agents using the **REA MCP Server** to reverse-engineer, inspect, and benchmark against the official **Agisoft Metashape Professional (64-bit)** executable and its file artifacts.

---

## 1. Objectives

1. **Verify Binary Behavior**: Confirm undocumented algorithms, math constants, and calibration conventions directly from the official Metashape desktop binaries (`metashape.exe`, native DLLs, or ELF/Mach-O binaries).
2. **Reverse-Engineer Project Structures**: Understand the internal binary archives of `.psx` and `.psz` project containers.
3. **Inspect MakerNotes**: Decouple DJI, Autel, and Hasselblad proprietary EXIF / XMP MakerNotes using native disassembly and binary searching.

---

## 2. REA Tool Mapping for Photogrammetry Tasks

| Objective | REA Tool | Usage Pattern |
| :--- | :--- | :--- |
| **Inspect Metashape Binary Header & Sections** | `inspect_artifact` | Analyze PE/Mach-O/ELF headers, imported libraries (Qt6, OpenCV, CUDA, OpenCL), and exported symbols. |
| **Locate Constants & Camera Formulas** | `search_bytes` / `search_strings` | Search for calibration strings (e.g., `"Brown"`, `"f"`, `"cx"`, `"cy"`, `"k1"`, `"k2"`, `"k3"`, `"p1"`, `"p2"`, `"b1"`, `"b2"`). |
| **Inspect Mathematical Disassembly** | `procedure_assembly` / `read_function_instructions` | Disassemble core bundle adjustment (SBA) matrix solving routines and epipolar geometry functions. |
| **Extract Pseudo-code for Pipeline Steps** | `procedure_pseudo_code` / `analyze_function` | Generate high-level C-like pseudo-code for semi-global matching or Delaunay triangulation. |
| **Examine Coordinate Database** | `inspect_sqlite_database` | Inspect Metashape's embedded geoids, vertical datums, and EPSG coordinate reference system SQLite tables. |
| **Analyze Project Zip Archives** | `inspect_artifact` / `search_bytes` | Unpack and inspect `.psx`/`.psz` XML structures and binary block encodings for dense clouds and depth maps. |

---

## 3. Step-by-Step REA Workflows

### Workflow A: Reverse-Engineering Agisoft Project Archives (`.psx` / `.psz`)
1. Agisoft `.psx` is an XML document referencing a `project.files/` directory containing `.zip` containers (`doc.xml`, `frame.zip`, `cameras.xml`, `point_cloud.zip`).
2. Use `inspect_artifact` to inspect the structure of the zip blocks:
   - `cameras.xml`: Parses camera transforms (rotation matrix $R$ and translation vector $t$), sensor specifications, and image dimensions.
   - `point_cloud.zip`: Contains binary stream files representing sparse tie points, 3D coordinates (float32), color bytes, and track IDs.
3. Replicate the schema in `src/model/` and `src/pipeline/` in TW-Photogram.

### Workflow B: Validating Camera Calibration Matrices
1. Use `search_strings` with query `"k1"`, `"k2"`, `"p1"` in the Metashape binary.
2. Locate the function evaluating lens distortion:
   ```text
   procedure_assembly(address) -> inspect register usage (SIMD AVX / FMA)
   ```
3. Confirm parameter sign conventions:
   - Radial distortion: $1 + k_1 r^2 + k_2 r^4 + k_3 r^6 + k_4 r^8$
   - Tangential distortion: $P_1(r^2 + 2x^2) + 2 P_2 x y$ vs. alternate transposed conventions.
4. Implement identical math in `src/model/mod.rs` and verify in `tests/model_unit_tests.rs`.

### Workflow C: Benchmarking Dense Cloud & Depth Maps
1. Run the same drone flight dataset (`sample_drone_survey/`) through both Agisoft Metashape and TW-Photogram.
2. Compare point density, point classification distribution, GSD, and GCP residual RMSE.
3. Run `cargo test` to ensure 100% adherence to ASPRS standards.
