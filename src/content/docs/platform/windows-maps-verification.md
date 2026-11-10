---
title: "Windows and Maps implementation verification"
description: "Verification dates: 2026-10-28–29. Native development host: macOS 26.6.2 arm64, Rust 1.98.1...."
---

Verification dates: 2026-10-28–29. Native development host: macOS 26.6.2 arm64, Rust 1.98.1.

## Implemented

- Native Ortho → Maps with road/satellite selection, pan, cursor-anchored fractional zoom, opacity, overlay visibility, fit, coordinates, scale, and attribution. Basemaps: OpenStreetMap and EOX Sentinel-2 cloudless 2016, without API keys. Only tile coordinates are requested; survey photographs and orthomosaic pixels are not uploaded.
- Exact ENU/WGS84 map placement, independent X/Y sample spacing, half-pixel raster edges, alpha-aware fractional-area previews, and bounded asynchronous source tiles. GeoTIFF/world-file placement uses the shared raster geometry; geographic GeoTIFF remains a local affine approximation.
- Relative project/photo paths, deterministic relinking, installed sample discovery, MSVC portable packaging/CI and strict GPU/real-data acceptance script. Windows requires a compatible GPU; hosted builds are not hardware certification.
- Background project workers detach on New/Open, and old map results cannot replace current-generation imagery. Missing inputs fail orthomosaic construction explicitly.

## Recorded checks

- `cargo fmt --all -- --check`: exit 0.
- `cargo clippy --offline --locked --all-targets -- -D warnings`: exit 0, no warnings.
- `cargo +stable clippy --offline --locked --target x86_64-pc-windows-gnu --all-targets -- -D warnings`: exit 0, no warnings. This is a cross-target check, not an MSVC build or a Windows execution.
- Library suite excluding GPU-dependent names: 147 passed, 3 existing timing tests ignored, 10 filtered out. The exclusions are explicit and do not establish a complete test-suite pass.
- New/affected integration suites pass: raster geometry, ortho failures/image sampling, exports, project portability, Maps math, tile coordinate validation, worker cancellation and Objective-C block ABI. Additional EXIF, SfM error, classification, model and stored Metashape projection suites pass.
- Headless egui frames verify real worker-to-texture upload, same-size raster replacement, preserved navigation, damaged-overlay behavior, and bounded tile enumeration for a 100001×100001 survey. These checks are not a desktop 60 FPS benchmark.
- Red-to-green regressions recorded: export half-pixel tiepoint, missing portability API, duplicate-filename relinking, unequal resampling bins, and old-worker cancellation on New Project.
- macOS icon bundle: all ten ICNS representations decoded independently, Info.plist validated, arm64 executable and ad-hoc signature verified. Installed bundle location: `/Applications/TW-Photogram.app`.

## Unverified or blocked

- Full `cargo test` aborts with SIGABRT in Apple's AGX/Metal compiler initialization. An isolated GPU test, a serial run and an escalated run reproduce it. LLDB's abort payload reports: “Unable to reach MTLCompilerService … Connection init failed at lookup with error 141”. No Rust failure is swallowed, and GPU tests are not disabled in CI or the production path.
- Real Windows 10/11 MSVC package execution, physical GPU pipeline/accuracy, DPI and desktop interactions require Windows hardware. The strict release script rejects missing `mapping_01` data and unavailable GPUs instead of silently skipping them.
- Interactive desktop inspection is unavailable in this session: the native Computer Use service cannot start. Live provider requests and GitHub remote access also fail DNS from the execution environment, including escalated commands. Local HTTP tests cover actual tile decoding, cache/revalidation, throttling, retries and failures.

## Dependency compatibility

`vendor/block` preserves the upstream MIT block 0.1.6 implementation with an inhabited opaque external class type and explicit C ABI declarations. This removes Rust future-compatibility/ABI warnings without suppressing lints. A native copy/capture/call test verifies the existing Objective-C block behavior. Broad source formatting and mechanical Clippy cleanups are included to satisfy repository-wide checks.

Installed executable SHA-256: `568f49064862a330f0fcd250305ba712aff57d66e7baf618e072d2960f07b66d`. Bundled sample: 24 JPEG files. Installed and staged signed executables matched byte-for-byte before staging cleanup.

Temporary build cleanup removed 21,878 files (9.1 GiB). Staged application copies and task-only icon/test launcher files were removed after verifying the installed bundle. Survey datasets and existing project files were retained.
