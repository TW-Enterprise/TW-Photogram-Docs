---
title: "Windows portable edition"
description: "Target: Windows 10/11 x64, with graphics drivers providing the OpenGL viewport and a compatible DX12/Vulkan compute adapter. A successful Windows build does not..."
---

Target: Windows 10/11 x64, with graphics drivers providing the OpenGL viewport and a compatible DX12/Vulkan compute adapter. A successful Windows build does not certify every graphics driver or the full survey pipeline. Automated package metadata records hardware verification separately.

## Running the ZIP

Extract the complete ZIP to a writable folder and launch `TW-Photogram.exe` or `run_tw_photogram.bat`. Rust and Visual Studio are not required on the destination machine; the MSVC C runtime is linked statically. Keep `sample_drone_survey` beside the executable. The launcher accepts arguments such as `--sample`, a photo directory, or a `.twp` project. To create a desktop shortcut, run `powershell -ExecutionPolicy Bypass -File scripts/create-shortcut.ps1` from the extracted folder. Recreate the shortcut after moving that folder.

Save photos and the `.twp` file together to relocate a survey. Saving uses relative photo paths when the project and photos share a filesystem root. Loading resolves these paths from the project directory, independent of the application's working directory. Existing absolute paths remain supported. Missing photos are reported; use the application's relink action to select their new folder. Only unique filenames are relinked; duplicate matches remain unresolved rather than selecting an arbitrary photo. Photos on another Windows drive retain absolute references and may need relinking after a move.

Maps View uses online road/satellite basemaps and displays provider attribution. Panning, zooming, and viewing the existing orthomosaic remain available when a basemap request fails; network failures must be shown in the interface. Basemap imagery is a visual reference, not independent survey accuracy evidence.

## Building and packaging

Install the Rust toolchain pinned by `rust-toolchain.toml` and Visual Studio Build Tools with Desktop development with C++ and the Windows SDK. Run:

```powershell
cargo check --locked --target x86_64-pc-windows-msvc
cargo test --locked --target x86_64-pc-windows-msvc
./scripts/package-windows.ps1
```

The packaging script builds the exact current checkout, packages the freshly built EXE, sample photos, launcher, shortcut script, dependency license texts, and build metadata. It never copies the historical executable at the repository root. `BUILD.json` records version, revision, dirty state, compiler, target, and timestamp. `SHA256SUMS.txt` covers package contents, and the ZIP has a separate SHA256 sidecar. For crates whose published archive omits workspace license texts, packaging downloads the upstream licenses from the exact commit recorded in the crate, records source URLs and hashes, and includes separate font notices. Packaging therefore needs network access. It fails if required license texts cannot be found; resolve their attribution before distribution. Application licensing must be agreed with the repository owner; these changes do not assign an application license.

GitHub's Windows workflow performs compilation and tests and uploads a ZIP. Hosted runners are not a substitute for testing supported physical GPUs. The package initially records `compute_release_verified: false`.

## Hardware release acceptance

On real Windows 10 and 11 machines, install current vendor graphics drivers and make the complete 51-photo `mapping_01` dataset available in the checkout. Run `./scripts/verify-windows-release.ps1`. It sets `TW_STRICT_RELEASE_TESTS=1` and `TW_DEPTH_BACKEND=gpu`, requires real survey photos, and records test output and adapter information. Strict tests must fail when a GPU or dataset is unavailable. An explicit `TW_DEPTH_BACKEND=cpu` run can verify the CPU path separately; it does not certify GPU execution.

Record the following manual checks with OS, GPU/driver, source revision, and ZIP hash:

- Start the ZIP on a machine without Rust, from Explorer, the shortcut, and a different working directory; load the bundled sample.
- Check file dialogs, Ctrl shortcuts, menus, 3D viewport, and DPI scales 100%, 150%, and 200%.
- Open/save/reopen and relink projects under paths containing spaces and non-ASCII text; move the survey directory and repeat.
- Run import, alignment, dense cloud, ground classification, mesh, DEM, orthomosaic, and exports on the real survey; verify transparent NODATA and exported georeferencing.
- Pan/zoom and switch Maps View basemaps while a processing worker runs. Change overlay opacity, fit the survey extent, rebuild ortho, and switch chunks without showing stale imagery.
- Disconnect the network, reconnect, and check cached imagery and visible errors. Close the application during tile requests and check clean shutdown.
- Exercise Intel, AMD, and NVIDIA hardware where available; unsupported compute adapters must report a clear error and refuse GPU processing; do not silently substitute CPU execution.

Retain the generated evidence and manual results with the release. Do not describe an artifact as Windows hardware verified using only a macOS build or a skipped GPU test.
