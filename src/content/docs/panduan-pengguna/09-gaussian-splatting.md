---
title: "Bab 9 — Gaussian Splatting"
description: "Apa yang akan Anda lakukan: melatih model 3D Gaussian Splatting dari foto dan hasil penyelarasan dengan mesin Brush, membuka model .ply/.spz di view..."
---

**Apa yang akan Anda lakukan:** melatih model 3D Gaussian Splatting dari foto dan hasil penyelarasan dengan mesin **Brush**, membuka model `.ply`/`.spz` di viewport, membersihkan dan memotongnya dengan **Alat Gaussian**, lalu mengekspornya.

---

## 9.1 Apa itu Gaussian Splatting

Gaussian Splatting merepresentasikan pemandangan sebagai jutaan elipsoid Gaussian berwarna (splat) yang dirender dengan cepat dari sudut mana pun — hasilnya fotorealistik, termasuk vegetasi dan permukaan yang sulit dibuat mesh. Model ini **bukan** produk pengukuran: gunakan untuk presentasi, inspeksi visual, dan komunikasi, bukan untuk volume atau kontur.

TW Photogram menyiapkan dataset COLMAP (foto, pose kamera, kalibrasi, titik ikat) dari chunk aktif lalu menjalankan trainer **Brush** (Apache-2.0, <https://github.com/ArthurBrussee/brush>) secara *headless* di latar.

## 9.2 Prasyarat

- Chunk selaras dengan **≥ 2 kamera aktif terselaras**, kalibrasi ter-fit, dan titik ikat (hasil **Sejajarkan Foto**).
- Foto asli **JPEG atau PNG** (TIFF tidak didukung oleh ekspor dataset).
- Ruang disk: semua foto **disalin** ke folder dataset baru `TW-Gaussian-<stempel waktu>`.
- GPU dengan VRAM memadai; perkiraan ditampilkan di dialog.
- Binari **Brush** yang dapat ditemukan. Urutan pencarian: variabel lingkungan `TW_BRUSH_EXECUTABLE` → jalur yang Anda pilih di dialog → folder aplikasi → `../Resources` bundel macOS → setiap entri `PATH`. Bila tidak ditemukan, pesan kesalahan mencantumkan semua jalur yang dicoba.

## 9.3 Dialog Latih Gaussian Splatting

**Berkas → Latih Gaussian Splatting…** membuka jendela **Latih Gaussian Splatting**.

| Bagian | Kontrol | Keterangan |
| :-- | :-- | :-- |
| Status trainer | *Trainer Brush: /jalur* (hijau) atau *Trainer Brush tidak ditemukan* (merah) + rincian | |
| | **Pilih binari Brush…** / **Deteksi ulang** | Menentukan jalur manual |
| **Iterasi** | 100–200 000 | bawaan 6000. Lebih banyak = lebih tajam, lebih lama. 6 000 cukup untuk pratinjau; 30 000 untuk kualitas presentasi |
| **Resolusi maks (px)** | 256–8192 | bawaan 1024. Sisi terpanjang foto saat pelatihan; 2048 untuk detail atap/fasad |
| **Maks splat** | 10 000–10 000 000 | bawaan 1 000 000. Menentukan ukuran berkas & VRAM |
| **Derajat SH** | 0–3 | bawaan 3. Harmonik bola untuk warna bergantung arah; 0 = warna datar, berkas lebih kecil |
| **Seed** | centang + angka | Benih acak (Brush bawaan 42 bila tidak dicentang) untuk hasil yang dapat diulang |
| Perkiraan | *Perkiraan: a–b menit, VRAM ≈ N MB (M foto). Perkiraan kasar, bergantung GPU.* | Dari 20–80 ms/iterasi pada titik acuan 1024 px / 1 M splat |
| **Pilih folder dataset & latih** | aktif bila opsi valid dan Brush ditemukan | Membuka pemilih folder induk |
| **Batal** | | |

Setelah memilih folder, Console mencatat *Menyiapkan foto, kamera, dan titik ikat untuk Gaussian Splatting...*; aplikasi berpindah ke tab Model dan sub-toolbar menampilkan bilah **Gaussian i/N** dengan tombol **Batalkan**. Pose dan titik tetap dalam meter ENU; konvensi distorsi tangensial dan pusat piksel dikonversi ke konvensi COLMAP secara otomatis.

Saat selesai: *Training Gaussian selesai: /jalur/gaussian.ply* dan model langsung dibuka di viewport. Hasil `gaussian.ply` dan log pelatihan tersimpan di folder dataset. Bila chunk aktif berubah selama pelatihan, hasil dibiarkan di disk dan jalurnya tercatat di Console.

⚠️ Bila Brush tidak ditemukan **setelah** dataset dibuat, pesan *Mesin Gaussian tidak ditemukan. Dataset tersimpan di …* muncul — Anda dapat melatihnya dengan Brush di mesin lain dan membuka hasilnya.

## 9.4 Membuka dan Melihat Model

- **Berkas → Buka Gaussian Splat (PLY)…** atau tombol **Buka Gaussian…** di sub-toolbar tab Model (filter *Gaussian Splat (PLY / SPZ)*).
- Format: PLY `ascii 1.0`, `binary_little_endian 1.0`, `binary_big_endian 1.0` (properti `float`/`double` dalam urutan apa pun, SH hingga derajat 3, hingga 3 juta splat) dan **SPZ** Niantic versi 2–3.
- Sumbu vertikal: viewport Z-up (ENU). Komentar `Vertical axis: …` di PLY dibaca otomatis; untuk PLY tanpa deklarasi, pilih **Sumbu atas PLY tanpa deklarasi: Z / Y** di Alat Gaussian. Ekspor TW Photogram selalu menyertakan komentar ini.

Kontrol di sub-toolbar Model saat model dimuat:

| Tombol | Fungsi |
| :-- | :-- |
| **Gaussian** | Tampil/sembunyikan model |
| **Kurangi kabut** | Pratinjau reversibel: meredupkan splat terbesar (> persentil 99) dan yang terlalu dekat kamera (tooltip: *Hanya memengaruhi preview; file asli tetap utuh*). Matikan untuk melihat model mentah; dapat ikut meredupkan fitur besar yang asli |
| **Geser** | Seret kiri = geser (bukan orbit). Shift+seret atau tombol tengah/kanan juga menggeser |
| **Atur Ulang Tampilan (0)** | Membingkai model Gaussian bila sedang tampil |

Titik ikat sparse yang ada hanya menginisialisasi pelatihan; titik itu sendiri bukan model Gaussian.

## 9.5 Alat Gaussian

Tombol **Alat Gaussian** (tooltip: *Potong, saring, dan ekspor model Gaussian*) membuka jendela **Alat Gaussian**. Baris informasi: `N splat · SH derajat d · bounds zmin…zmax m (Z)`. Setiap operasi berjalan di thread latar, menggantikan pratinjau hanya bila berhasil, dan melaporkan `k splat dihapus, n tersisa`. Operasi yang akan menghapus semua splat ditolak.

### Potong

| Kontrol | Fungsi |
| :-- | :-- |
| **Ke region (bounding box)** | Memotong ke *region* rekonstruksi chunk (aktif bila chunk punya region) |
| **Ke batas luar (Shapes)** | Memotong ke poligon pertama lapisan berperan **Batas luar** di dock Batas (tooltip: *Tandai lapisan sebagai batas luar di dock 'Batas'*); lubang dihormati |
| **Batasi Z** + min / max (m) | Rentang tinggi inklusif untuk pemotongan poligon (bawaan −5…50 m) |

### Saring

| Kontrol | Fungsi |
| :-- | :-- |
| `k=` (1–64) · `σ×` (0,1–10) · **Hapus outlier statistik** | Pencilan statistik berdasarkan jarak rata-rata ke k tetangga terdekat (bawaan k=16, σ×2,0) — menghapus "awan debu" di udara |
| **opasitas min** (0–1) · **Terapkan** | Membuang splat hampir transparan (bawaan 0,05) |
| **persentil skala** (50–100) · **Buang splat terbesar** | Bentuk permanen dari aturan *Kurangi kabut* (bawaan 99) |
| **Batalkan operasi terakhir** | Satu langkah undo |

Urutan yang disarankan: potong ke batas → hapus outlier → opasitas min 0,05 → buang splat terbesar 99,5 → periksa visual → ekspor.

### Ekspor

| Tombol | Format |
| :-- | :-- |
| **Simpan PLY…** | PLY biner little-endian tata letak INRIA (`x y z f_dc_* f_rest_* opacity scale_* rot_*`), derajat SH dipangkas ke pita tertinggi yang tidak nol, komentar `Vertical axis: 0 0 1` |
| **Simpan SPZ…** | Niantic SPZ v2 terkompresi (tooltip: *Format terkompresi Niantic SPZ v2*); kerangka RUB (Y-up) dikonversi otomatis, presisi posisi ≈ 0,25 mm untuk extent ±2048 m |

Kedua berkas dapat dibuka di penampil Gaussian umum (SuperSplat, Polycam, viewer web berbasis SPZ). Koordinat tetap meter ENU lokal relatif terhadap origin chunk — bukan koordinat proyeksi.

---

**Langkah berikutnya:** bawa seluruh produk ke perangkat lunak lain lewat [Bab 10 — Ekspor & interoperabilitas](10-ekspor-interoperabilitas.md).
