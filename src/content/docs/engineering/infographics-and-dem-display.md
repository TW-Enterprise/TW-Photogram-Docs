---
title: "Infografis survei dan tampilan DEM"
description: "Pilih File > Export > Generate Infografis pada chunk yang mempunyai DEM dan ortomosaik.\nForm identitas berlaku selama sesi aplikasi. Judul awal memakai nama..."
---

## Penggunaan

Pilih **File > Export > Generate Infografis** pada chunk yang mempunyai DEM dan ortomosaik.
Form identitas berlaku selama sesi aplikasi. Judul awal memakai nama proyek; lokasi,
pembuat, dan logo PNG/JPEG opsional. Data survei dan registrasi tampilan Maps tidak berubah.
Jika raster belum tersedia, dialog menampilkan langkah Build DEM atau Build Orthomosaic.

Perubahan form menandai preview kedaluwarsa, membatalkan pekerjaan lama, lalu merender ulang
setelah jeda singkat. Hanya preview terbaru yang bisa disimpan. Tombol Batalkan menghentikan
penerimaan hasil pekerjaan tersebut; pengodean atau resampling yang sedang berlangsung
menyelesaikan tahapnya sebelum memeriksa pembatalan berikutnya.

Halaman berukuran 3508 × 2480 piksel, A4 lanskap pada 300 dpi. PNG dan PDF berasal dari satu
halaman render yang sama. PDF memakai kompresi lossless RGB; teksnya merupakan bagian dari
gambar. Preview pada GPU dengan batas tekstur kecil diperkecil langsung dari halaman itu.
Output disimpan secara atomik melalui berkas sementara di direktori tujuan.

## Data dan geometri

- Minimum, maksimum, dan rata-rata berasal dari sampel DEM berhingga; NaN merupakan NODATA.
- Label tinggi selalu **tinggi relatif terhadap origin ENU**, bukan tinggi terhadap muka laut.
- Luas orto menghitung setiap piksel dengan alpha lebih besar dari nol, termasuk alpha parsial,
  dikalikan luas sel geometris. Tidak ada estimasi luas atau GSD berdasarkan kamera.
- Bounds raster merepresentasikan pusat sampel. Ukuran sel E/N diturunkan secara terpisah
  dari bounds dan jumlah sampel. Setengah sel pada batas luar ikut dihitung dalam geometri peta.
- Kedua peta mempertahankan rasio dan cakupan masing-masing, memiliki skala tersendiri,
  dan menampilkan NODATA putih. RGB transparan dikomposit sebelum resampling untuk mencegah halo.
- `Arc<Vec<f32>>` membuat snapshot DEM murah di thread UI. Format JSON `heights` tetap berupa
  array angka/null, kompatibel dengan proyek lama.
- Font Ubuntu Light dibundel bersama lisensi dan atribusi di `assets/fonts`.

## Detail DEM dan perbaikan yang terukur

Pemeriksaan `mapping01.twp` dan ekspor standar GeoTIFF Metashape menunjukkan resolusi grid
hampir sama: sekitar 0,14681 m dibanding 0,14137 m. Resolusi piksel saja tidak menjelaskan
seluruh perbedaan keterbacaan sungai dan jalan. Perbandingan ini bukan validasi akurasi:
rekonstruksi, cakupan, dan datum vertikal berbeda.

Perbaikan tampilan:

- Hillshade memakai sumbu North yang benar: baris raster bertambah ke selatan.
- Warna elevasi dan legenda memakai ekstrem valid sebenarnya.
- Renderer memakai raster native, dipecah menjadi tile maksimal 1024 piksel dengan gutter,
  maksimal dua upload per frame. Tidak ada pengurangan resolusi DEM untuk zoom.
- Satu worker aktif menampung perubahan pengaturan terbaru; hasil stale tidak diterapkan.
- Pilihan warna + relief, warna elevasi, hillshade, kontras, penguatan relief, dan piksel tajam
  hanya mengubah tampilan. Latar DEM putih meningkatkan keterbacaan peta.

Pemeriksaan ulang dengan point cloud tersimpan mengonfirmasi bahwa blok persegi juga sudah
ada pada data hasil interpolasi lama. Pengisi celah mip-map diganti dengan Delaunay TIN dan
interpolasi barycentric. Area di luar convex hull dukungan titik tetap NODATA; tidak
menyalin tinggi induk menjadi petak besar. Sampel masuk ke node raster terdekat. Filter
bilateral memakai fit bidang lokal berbobot agar tidak menggeser bidang miring atau sudut
batas raster; jika dukungan fit degenerat, tinggi pusat dipertahankan.

Perubahan algoritme baru berlaku setelah **Build DEM** dijalankan lagi. Proyek lama tidak
dibangun ulang otomatis. TIN tidak menciptakan detail yang tidak tersedia dalam point cloud;
celah besar dapat memperlihatkan bidang segitiga. Kualitas depth map masih membatasi detail
sungai/jalan, sehingga perbaikan ini belum membuktikan kesetaraan DEM dengan Metashape.

## Verifikasi yang dapat diulang

```sh
cargo test --test infographic_tests --test dem_display_tests --test dem_ortho_unit_tests --test export_unit_tests --test ui_state_unit_tests
cargo test --lib pipeline::fusion
cargo test --lib pipeline::hillshade
cargo test --lib ui::infographic
cargo test --lib ui::dem_preview
cargo check
cargo clippy --all-targets -- -D warnings
cargo fmt --check
cargo test --no-fail-fast
cargo run --example render_infographic -- project.twp /tmp/infografis
cargo run --example audit_dem -- project.twp /tmp/audit-dem --infographic
```

Tes mencakup geometri metrik, NODATA/alpha, buffer dan logo invalid, JSON lama, snapshot,
pembatalan, hasil worker lama, ukuran halaman/densitas PNG, dan kesamaan piksel preview-PNG-PDF.
Regresi TIN menguji bidang berlubang, convex hull, dukungan kolinear, batas band Rayon,
serta kepemilikan sampel pada extent pecahan. Artefak PNG dan PDF survei mapping_01 diperiksa
secara visual, termasuk hasil rasterisasi PDF dengan Poppler.

Pada sesi pengembangan 2026-10-30, `cargo test --no-fail-fast` terhenti dengan SIGABRT pada
empat target GPU (`--lib`, `metashape_parity_test`, `real_drone_photos_test`,
`test_mapping_01_pipeline`). LLDB menunjukkan kegagalan koneksi macOS `MTLCompilerService`
dengan error 141 pada `adapter.request_device`, sebelum shader dijalankan. Pengujian
tersebut tidak dilemahkan atau dinonaktifkan. Verifikasi GUI native juga belum tersedia
karena layanan Computer Use gagal dimulai. Hasil ini tidak boleh dilaporkan sebagai suite
penuh yang lulus.
