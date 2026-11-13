---
title: "Bab 1 — Pendahuluan dan Instalasi"
description: "Apa yang akan Anda lakukan: memahami apa yang dihasilkan TW Photogram, memastikan komputer Anda memenuhi syarat, menjalankan aplikasi untuk pertama kali den..."
---

**Apa yang akan Anda lakukan:** memahami apa yang dihasilkan TW Photogram, memastikan komputer Anda memenuhi syarat, menjalankan aplikasi untuk pertama kali dengan data sampel, dan mengenal argumen baris perintah.

> Panduan ini berlaku untuk **TW Photogram versi 0.1.0-alpha** sebagaimana tercantum di `Cargo.toml` (`version = "0.1.0-alpha"`). Nomor versi aktif juga tampil di **Alat → Pengaturan / Preferensi… → Sistem & Standar → Versi Sistem & Riwayat Rilis** dan di dialog **Bantuan → Tentang TW Photogaram**.

---

## 1.1 Apa itu TW Photogram

TW Photogram memproses foto udara drone menjadi produk pemetaan:

| Produk | Tahap yang menghasilkan | Format ekspor utama |
| :-- | :-- | :-- |
| Orientasi kamera & titik ikat (sparse cloud) | Sejajarkan Foto (SfM) | PLY, Project XML |
| Awan titik rapat (dense cloud) berklasifikasi ASPRS | Bangun Awan Titik + Klasifikasi Titik Tanah | LAS 1.4, PLY |
| Model 3D (mesh) bertekstur, tiled model, panorama | Bangun Model 3D, Bangun Tekstur, Tiled Model, Panorama | OBJ |
| DEM — DSM atau DTM | Bangun Model Elevasi (DEM) | GeoTIFF (WGS 84 / UTM), ESRI ASCII, XYZ |
| Ortomosaik | Bangun Ortomosaik | GeoTIFF RGBA |
| Kontur, lereng, aspek, hillshade, roughness, TRI | Dock **Batas → PRODUK TURUNAN DEM** | GeoJSON/SHP/KML/DXF, GeoTIFF |
| Batas wilayah & poligon | Dock **Batas** | GeoJSON/SHP/KML/DXF |
| Simulasi genangan & kelas bahaya banjir | Dock **Genangan** | GeoTIFF, GeoJSON/SHP/KML, CSV hidrograf |
| Lembar peta & laporan survei | **Cetak Lembar Peta / Laporan (PDF)** | PDF vektor, PNG |
| Model Gaussian Splatting | **Latih Gaussian Splatting** | PLY, SPZ |

Semua tahapan menjalankan algoritme fotogrametri sungguhan (deteksi fitur FAST + deskriptor BRIEF, SfM dengan bundle adjustment Levenberg-Marquardt, Semi-Global Matching untuk MVS, filter morfologis untuk klasifikasi tanah, interpolasi TIN Delaunay untuk DEM, mosaik dominan-nadir untuk ortho). Tidak ada tahap yang disimulasikan.

Antarmuka mengikuti tata letak Agisoft Metashape Professional: menu **Berkas / Sunting / Tampilan / Alur Kerja / Model / Alat / Bantuan**, tab viewport **Model / Ortho / Photo**, dan dock **Workspace / Reference / Properties / Photos / Console**. Bab 2 menjelaskan semuanya.

## 1.2 Persyaratan Sistem

| Komponen | Persyaratan |
| :-- | :-- |
| Sistem operasi | macOS (Apple Silicon / Intel), Windows 10/11 64-bit, atau Linux x64 |
| GPU | Driver grafis yang menyediakan OpenGL untuk viewport 3D. Pencocokan fitur dan peta kedalaman memakai GPU komputasi (Metal di macOS; DX12/Vulkan di Windows) bila tersedia |
| RAM | Bergantung ukuran survei. 24 foto sampel 20 MP berjalan nyaman di 8 GB; blok ratusan foto membutuhkan 16–32 GB (lihat [Bab 11](/TW-Photogram-Docs/panduan-pengguna/11-pemecahan-masalah/#1112-performa-dan-memori)) |
| Ruang disk | Proyek `.twp` menyimpan hasil (awan titik, DEM, ortho) dalam satu berkas; sediakan beberapa GB untuk survei besar. Pelatihan Gaussian menyalin seluruh foto ke folder dataset baru |
| Jaringan | Hanya untuk fitur daring: basemap **Maps**, unduh batas administrasi (BIG, geoBoundaries, GADM), unduh DEMNAS dan geoid EGM2008. Pemrosesan fotogrametri sepenuhnya luring |
| Toolchain (hanya bila membangun dari sumber) | Rust **1.98.1**, dipatok di `rust-toolchain.toml` (edisi 2024) |

💡 Foto harus memiliki koordinat GPS di EXIF (lintang, bujur, ketinggian). Foto tanpa GPS tetap bisa dimuat, tetapi penyelarasan memakai GPS untuk seleksi pasangan dan skala; chunk tanpa origin geodetik tidak bisa diekspor ke format georeferensi.

## 1.3 Menjalankan Aplikasi

### macOS / Linux (dari Sumber)

```bash
# Jalankan dengan 24 foto sampel DJI + GCP langsung termuat
cargo run --release -- --sample

# Jalankan kosong, lalu tambah foto lewat menu
cargo run --release

# Atau bangun dulu, lalu jalankan binari
cargo build --release
./target/release/TW-Photogram --sample
```

Di macOS, menu aplikasi tampil di bilah menu sistem (NSMenu). Di Windows/Linux, menu tampil di dalam jendela aplikasi.

### Windows (Paket Portabel)

1. Ekstrak seluruh isi ZIP ke folder yang bisa ditulis. Rust dan Visual Studio **tidak** diperlukan; runtime MSVC sudah ditautkan statis.
2. Biarkan folder `sample_drone_survey` tetap di samping `TW-Photogram.exe`.
3. Klik dua kali `TW-Photogram.exe` atau `run_tw_photogram.bat`.
4. Untuk membuat pintasan desktop, jalankan `powershell -ExecutionPolicy Bypass -File scripts/create-shortcut.ps1` dari folder hasil ekstrak. Buat ulang pintasan bila folder dipindah.

Rincian build MSVC, pemindahan proyek, dan verifikasi GPU ada di [`docs/platform/windows.md`](../platform/windows.md).

### Argumen Baris Perintah

Peluncur (`TW-Photogram`, `TW-Photogram.exe`, `run_tw_photogram.bat`) menerima:

| Argumen | Efek |
| :-- | :-- |
| `--sample`, `-s`, atau `sample` | Memuat dataset sampel `sample_drone_survey/` (24 foto + `GCP_Coordinates.csv`) |
| `<folder>` | Memuat semua foto di folder tersebut sebagai chunk baru |
| `<proyek>.twp` atau `<proyek>.json` | Membuka proyek tersimpan |

Jendela selalu dibuka dalam keadaan termaksimalkan; ukuran minimum 1080 × 680 piksel.

### Variabel Lingkungan yang Berguna

| Variabel | Fungsi |
| :-- | :-- |
| `TW_DEPTH_BACKEND=cpu` | Memaksa peta kedalaman (Bangun Awan Titik) dihitung di CPU. Tanpa variabel ini aplikasi memakai GPU dan **tidak** diam-diam beralih ke CPU bila GPU gagal — kesalahan akan dilaporkan |
| `TW_BRUSH_EXECUTABLE` | Lokasi binari trainer **Brush** untuk Gaussian Splatting (lihat [Bab 9](/TW-Photogram-Docs/panduan-pengguna/09-gaussian-splatting/)) |

## 1.4 Dataset Sampel

Folder `sample_drone_survey/` berisi:

- **24 foto udara** `DJI_0001.JPG` … `DJI_0024.JPG` — kamera DJI FC6310 (Phantom 4 Pro), sensor 1 inci, 20 MP, 5472 × 3648 piksel, dengan EXIF GPS.
- **`GCP_Coordinates.csv`** — 4 titik kontrol tanah dengan kolom `Marker, Latitude, Longitude, Altitude, Local_X, Local_Y, Local_Z`.

Cara memuatnya:

- argumen `--sample` saat meluncurkan, **atau**
- di dialog **Alur Kerja → 12. Proses Batch (Otomatis)…**, bila proyek masih kosong tampil tombol **+ Muat Data Sampel Drone (24 Foto)**.

Dataset ini cocok untuk mencoba seluruh alur kerja dalam hitungan menit dan untuk mengikuti contoh di panduan ini.

## 1.5 Berkas Proyek

Proyek disimpan sebagai `.twp` (atau `.json`) lewat **Berkas → Simpan Proyek (Ctrl+S)**. Berkas ini memuat seluruh hasil pemrosesan, shapes, konfigurasi genangan, referensi elevasi, dan jalur foto.

- Jalur foto disimpan **relatif** bila proyek dan foto berada di akar filesystem yang sama, sehingga Anda bisa memindahkan folder survei (proyek + foto) bersama-sama.
- Bila foto tidak ditemukan saat membuka proyek, banner kuning **"Ada foto proyek yang tidak ditemukan."** muncul dengan tombol **Relink Photo Folder…**. Hanya nama berkas unik yang ditautkan ulang; nama ganda dilaporkan sebagai ambigu di Console.
- Anda juga dapat **menyeret dan melepas** berkas ke jendela: foto (`.jpg/.jpeg/.tif/.tiff/.png`), folder, proyek (`.twp/.json`), dan CSV GCP (`.csv/.txt/.tsv`) semuanya dikenali.

## 1.6 Bahasa Antarmuka

Bahasa bawaan adalah **Bahasa Indonesia (ID)**. Ubah ke **English (US)** lewat **Alat → Pengaturan / Preferensi… → Umum → Bahasa Antarmuka**. Pengaturan ini mengubah menu, dialog, nama tahapan progres, dan laporan. Beberapa label teknis (misalnya kolom tabel Reference, nama kelas ASPRS, label gaya DEM) sengaja tetap dalam istilah aslinya.

---

**Langkah berikutnya:** jalankan aplikasi dengan `--sample`, lalu lanjut ke [Bab 2 — Mengenal antarmuka](/TW-Photogram-Docs/panduan-pengguna/02-antarmuka/) untuk memahami tata letak jendela sebelum memproses data Anda sendiri.
