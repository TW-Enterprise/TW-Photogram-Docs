---
title: "Bab 2 — Mengenal Antarmuka"
description: "Apa yang akan Anda lakukan: mengenali setiap bagian jendela TW Photogram — menu, bilah tombol, tiga tab viewport, dock kiri/kanan/bawah, status bar — serta..."
---

**Apa yang akan Anda lakukan:** mengenali setiap bagian jendela TW Photogram — menu, bilah tombol, tiga tab viewport, dock kiri/kanan/bawah, status bar — serta pintasan keyboard dan pengaturan tampilan.

---

## 2.1 Tata Letak Jendela

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Menu: Berkas · Sunting · Tampilan · Alur Kerja · Model · Alat · Bantuan   │
├──────────────────────────────────────────────────────────────────────────┤
│ Bilah tombol: Proyek | 1.…12. Alur kerja | Navigasi | Warna | Lapisan    │
├───────────────┬──────────────────────────────────────────┬───────────────┤
│ Workspace     │  [Model] [Ortho] [Photo]        Panel ▾  │ Properties    │
│ Reference     │                                          │ Genangan      │
│               │            VIEWPORT UTAMA                │ Batas         │
│               │                                          │               │
├───────────────┴──────────────────────────────────────────┴───────────────┤
│ [Photos (N)] [Console (N)]                                         ⌄     │
├──────────────────────────────────────────────────────────────────────────┤
│ Status: Chunk 1: 24/24 aligned (100%) | 4 GCP · GSD · Area · CRS        │
└──────────────────────────────────────────────────────────────────────────┘
```

Setiap dock berupa kartu dengan baris tab di atasnya. Tombol chevron di ujung kanan baris tab menciutkan dock tanpa menghilangkannya:

- Dock kiri atau kanan yang diciutkan menjadi **rail ikon** selebar 36 px, satu ikon per tab (kiri: Workspace, Reference; kanan: Properties, Genangan, Batas). Klik ikon untuk membuka dock langsung pada tab itu.
- Dock bawah yang diciutkan menyisakan **baris tab** Photos/Console. Klik tab atau chevron **⌃** untuk membukanya.
- Pintasan **Ctrl+1** (Workspace), **Ctrl+2** (Photos/Console), **Ctrl+3** (Properties); di macOS gunakan **⌘**.

Menu **Panel ▾** di kanan atas viewport memuat centang **Toolbar atas**, **Panel kiri**, **Panel kanan**, **Panel bawah**, dan **Status bawah**.

## 2.2 Menu

Label berikut adalah label menu dalam jendela (Windows/Linux) dan padanan menu native macOS.

### Berkas (File)

| Item | Fungsi |
| :-- | :-- |
| **Proyek Baru** (Ctrl+N) | Mengosongkan proyek; membatalkan pekerjaan latar yang berjalan |
| **Buka Proyek…** (Ctrl+O) | Membuka `.twp` / `.json` |
| **Simpan Proyek** (Ctrl+S) | Menyimpan seluruh proyek ke satu berkas |
| **Tambah Foto…** / **Tambah Folder…** | Menambah foto ke chunk aktif (JPG, JPEG, TIF, TIFF, PNG) |
| **Panduan Cepat Survei…** | Dialog *Quick Survey Wizard (Alur 3 Langkah Praktis)*; tombol **Jalankan Alur 3 Langkah** memulai Sejajarkan Foto |
| **Impor Referensi (GCP CSV)…** | Membuka dialog **Impor Referensi Survei** ([Bab 3](03-memulai-proyek.md#35-mengimpor-gcp)) |
| **Buka Gaussian Splat (PLY)…** | Memuat `.ply`/`.spz` ke viewport Model ([Bab 9](09-gaussian-splatting.md)) |
| **Ekspor Referensi (GCP CSV)…** | Menulis koordinat marker beserta estimasi dan residual |
| **Latih Gaussian Splatting…** | Dialog **Latih Gaussian Splatting** |
| **Ekspor Ortomosaik (GeoTIFF)…** | GeoTIFF RGBA georeferensi WGS 84 |
| **Ekspor DEM (GeoTIFF, WGS 84)…** | Float32, datum tinggi keluaran sesuai Kalibrasi Elevasi |
| **Ekspor DEM (GeoTIFF, UTM)…** | Float32 pada grid UTM |
| **Ekspor DEM (ESRI ASCII Grid)…** | `.asc` + `.prj` (UTM) |
| **Ekspor DEM (XYZ, UTM)…** | Teks `E N Z` |
| **Impor Shapes (GeoJSON/SHP/KML)…** | Membuka tab Ortho + dock **Batas** |
| **Ekspor Shapes…** | Membuka dock **Batas**; pilih lapisan lalu **Ekspor…** |
| **Cetak Lembar Peta / Laporan (PDF)…** | Dialog cetak ([Bab 8](08-cetak-laporan.md)) |
| **Ekspor Titik Awan (ASPRS LAS)…** / **(Stanford PLY)…** | Awan titik rapat |
| **Ekspor Model 3D (OBJ)…** | Mesh dengan warna verteks |
| **Ekspor Project XML (.xml)…** | `doc.xml` + `cameras.xml` bergaya Metashape (bahan referensi, bukan `.psx` yang bisa dibuka) |
| **Buat Laporan Survei (PDF/MD)…** | PDF membuka dialog cetak; HTML/MD/TXT ditulis langsung |
| **Buat Infografis Ringkasan…** | Dialog **Generate Infografis** (A4 lanskap PNG/PDF) |
| **Keluar** | Menutup aplikasi |

### Sunting (Edit)

- **Batal Pilih Semua** (Ctrl+D) — melepas foto yang terpilih.

### Tampilan (View)

- **Atur Ulang Tampilan (0)**, **Tampilan Atas (7)**, **Tampilan Depan (1)**, **Tampilan Kanan (3)**.
- Di menu native macOS tersedia juga centang **Show Cameras**, **Show Markers (GCP)**, **Show Tie Points**, **Show Point Cloud**, **Show 3D Mesh**, **Show Grid**, **Ruler Tool (3D)**.
- **Panel Ruang Kerja (Kiri)**, **Panel Foto & Konsol (Bawah)**, **Inspektur Properti (Kanan)** — buka/tutup dock.
- **Alihkan Posisi Bilah Tombol (Atas Semua / Atas & Kanan)**.

### Alur Kerja (Workflow)

Dua belas tahapan bernomor, dibahas satu per satu di [Bab 4](04-alur-kerja.md):

1. Sejajarkan Foto (SfM)… · 2. Sejajarkan Laser Scan (ICP)… · 3. Bangun Titik Awan (Dense Cloud)… · 4. Bangun Model 3D (Mesh)… · 5. Bangun Tekstur (Texture)… · 6. Bangun Model Bertingkat (Tiled Model)… · 7. Bangun Model Elevasi (DEM)… · **Kalibrasi Elevasi…** · 8. Bangun Ortomosaik… · 9. Bangun Panorama 360°… · 10. Sejajarkan Chunk (Sim3)… · 11. Gabungkan Chunk… · 12. Proses Batch (Otomatis)…

💡 **Klasifikasi Titik Tanah (CSF)…** tidak ada di menu Alur Kerja; bukalah dari klik kanan node **Awan Titik (Dense Cloud)** di Workspace, atau tambahkan sebagai tahap batch.

### Model

- **Titik Awan - Warna RGB**, **Titik Awan - Peta Elevasi**, **Titik Awan - Klasifikasi ASPRS** — mode pewarnaan awan titik di tab Model.

### Alat (Tools)

- **Kalibrasi Kamera (Brown-Conrady)…**, **Statistik Survei…** — membuka panel Properties.
- **Optimasi Kamera (SBA)…** — menjalankan Sparse Bundle Adjustment ([§4.13](04-alur-kerja.md#413-optimasi-kamera-sba)).
- **Pengaturan Referensi (CRS)…** — memilih CRS proyek.
- **Pengaturan / Preferensi…** — bahasa, tema, posisi bilah tombol, versi.

### Bantuan (Help)

- **Panduan Pengguna (F1)** — membuka jendela **Panduan Langkah Pemetaan Drone** (ringkasan 5 langkah dengan tombol **Tambah Foto (Add Photos)**).
- **Tentang TW Photogaram** — versi, tahap rilis, dan tautan changelog.

## 2.3 Bilah Tombol (Toolbar)

Bilah tombol 38 px di bawah menu terbagi dalam lima grup yang dipisahkan garis tipis:

1. **Proyek & Berkas** — Proyek Baru, Buka Proyek…, Simpan Proyek, Tambah Foto Udara….
2. **Alur kerja** — tombol **1. Selaraskan Foto (SfM)…** hingga **12. Proses Batch (Otomatis)…**. Tahap yang sudah selesai pada chunk aktif berlabel **[OK]**. Tooltip tiap tombol menjelaskan algoritmenya.
3. **Navigasi** — Atur Ulang Tampilan (0), Tampak Atas (7), Perbesar (+), Perkecil (−).
4. **Warna titik** — Warna (RGB), Heatmap Elevasi, Kelas ASPRS.
5. **Lapisan** — Tampilkan Kamera, Tampilkan GCP, Tampilkan Titik Ikat, Tampilkan Awan Titik, Tampilkan Model 3D, Alat Ukur 3D.

Dengan **Atas & Kanan** (Alat → Pengaturan → Tampilan & Tata Letak → **Posisi Bilah Tombol & Docking**), grup 3–5 pindah ke rail vertikal 36 px di sisi kanan; tiap grup dipisah garis tipis dan fungsi tombol dijelaskan lewat tooltip.

## 2.4 Viewport Utama: Tab Model / Ortho / Photo

### Tab **Model** — Ruang 3D

Menampilkan piramida kamera, marker GCP, titik ikat, awan titik rapat, mesh, grid, triad sumbu (X merah, Y hijau, Z biru), dan model Gaussian bila dimuat.

| Interaksi | Hasil |
| :-- | :-- |
| Seret tombol kiri | Orbit (putar) |
| Seret kiri + **Shift**, seret tombol tengah, atau seret tombol kanan | Geser (pan) |
| Roda gulir | Zoom ke arah kursor |
| Tombol **Geser** di sub-toolbar | Mengunci seret kiri sebagai geser (berguna untuk Gaussian) |
| `0` atau `F` | Atur ulang tampilan (fit) |
| `7` / `1` / `3` | Tampak atas / depan / kanan |
| `Spasi` | Berpindah ke foto berikutnya dan membuka tab Photo |

Sub-toolbar tab Model juga memuat **Buka Gaussian…**, **Alat Gaussian**, dan — bila ada model Gaussian — **Gaussian** (tampil/sembunyi) serta **Kurangi kabut** ([Bab 9](09-gaussian-splatting.md)).

**Alat Ukur 3D** (toolbar grup 5 / menu Tampilan → Ruler Tool) menggambar garis ukur antara dua titik di ruang 3D.

### Tab **Ortho** — Peta 2D

Sub-toolbar lapisan GIS:

- **Orthomosaic (Foto Orto Bebas Distorsi)** — menampilkan ortomosaik.
- **Maps** — basemap daring ([§2.8](#28-maps-view-di-tab-ortho)).
- **DEM (Digital Elevation Model Topografi)** — menampilkan DEM dengan kontrol gaya ([Bab 5](05-dem-kontur-lereng.md#53-mengatur-tampilan-dem)).
- **Show Camera / GPS Points**, **Show Camera Labels (zoom in untuk melihatnya)**.
- **Batas** — membuka dock Shapes & batas wilayah ([Bab 6](06-shapes-batas-wilayah.md)).
- **Genangan** — membuka dock simulasi genangan ([Bab 7](07-simulasi-genangan.md)).

Seret untuk menggeser, gulir untuk zoom; HUD menampilkan koordinat kursor dan skala meter. Tombol **Fullscreen peta** di kanan atas memaksimalkan peta; tekan **Esc** atau klik **Keluar fullscreen (Esc)** untuk kembali.

### Tab **Photo** — Inspeksi Foto

Menampilkan foto yang dipilih pada resolusi penuh. Judul tab menjadi `Photo (DJI_0001)` sesuai foto aktif.

- **Zoom In (+)**, **Zoom Out (−)**, **Reset 100% (Fit)**; gulir mouse memperbesar ~12 % per notch, berpusat pada kursor (rentang 5 %–2000 %).
- **Mode Pin GCP (Klik foto untuk pin target)** + kotak pilihan marker — menyematkan posisi GCP pada foto ([§3.6](03-memulai-proyek.md#36-menandai-gcp-pada-foto)).
- Bila belum ada foto terpilih: tombol **Buka Foto Pertama**.

## 2.5 Dock Kiri: Workspace dan Reference

### Workspace

Pohon proyek: **Workspace (N chunk)** → **Chunk** → node **Kamera**, **Titik Kontrol (Marker)**, **Titik Ikat**, **Peta Kedalaman**, **Awan Titik (Dense Cloud)**, **Model 3D (Mesh)**, **DEM**, **Ortomosaik**, **Tiled Model**, **Panorama**, **Scan Laser**. Chunk kosong berlabel **Chunk kosong (tambahkan foto untuk memulai)**.

Klik kanan membuka menu konteks per node, antara lain:

- Workspace: **Tambah Chunk**, **Tambah Foto…**, **Tambah Folder…**.
- Chunk: **Jadikan Chunk Aktif**, **Hapus Chunk**, **Penyelarasan Foto…**, **Bangun Awan Titik…**, **Bangun Model 3D…**, **Bangun Tekstur 3D…**, **Bangun DEM…**, **Bangun Ortomosaik…**, **Optimasi Kamera…**, **Pengaturan Referensi (CRS)…**, **Impor GCP (CSV)…**.
- Kamera: **Buka di Tampilan Foto**, **Nonaktifkan Kamera** / **Aktifkan Kamera**, **Hapus Kamera**.
- Marker: **Filter Foto berdasarkan Marker**, **Hapus Marker**, **Hapus Filter Marker**.
- Titik Ikat / Awan Titik / Model 3D / DEM / Ortomosaik: **Hapus …**, **Ekspor …**, dan untuk awan titik **Klasifikasi Titik Tanah (CSF)…**.

Status chunk ditandai pil **Aktif** dan **Selaras**.

### Reference

Tabel geodesi dengan dua sub-tab **Kamera (N)** dan **Marker (N)**, baris **CRS:** yang dapat diklik untuk mengubah CRS, serta tombol:

- **Impor GCP / Koordinat Referensi (CSV/TXT)**, **Ekspor Koordinat Referensi (CSV)**, **Pengaturan Referensi (CRS)**, **Optimasi Kamera & Kalibrasi Sensor (SBA)**, **Hitung Ulang Galat Residual Geodesi**.

Kolom tabel kamera: `No · Label · X (E) · Y (N) · Z (Alt) · Galat (px) · Proy`. Klik dua kali label kamera membuka tab Photo.

Kolom tabel marker: `No · Label · Role / σ · X (m) · Y (m) · Z (m) · dX (cm) · dY (cm) · dZ (cm) · Total · Proy`. Peran dipilih **Control / Checkpoint / Disabled**; `σ XY/Z m` adalah ketelitian pengukuran. Di bawah tabel: tombol **Datum elevasi / DEMNAS…**, **Total GCP RMSE:** dan baris **Checkpoint:**.

## 2.6 Dock Kanan: Properties / Genangan / Batas

Tiga tab di header dock kanan:

- **Properties** — `Coordinate System`, kartu **Survey Statistics** (GSD Resolution, Survey Area, GCP Accuracy, Reprojection, Aligned Cameras), kartu **Camera Calibration** Brown-Conrady (Focal Length f, Principal Point, Radial K1 K2, Tangential P1 P2) dengan tombol **Optimize Calibration (SBA)**, dan kartu metadata foto terpilih (Dimensions, Focal Length, Coordinates, Altitude, Make / Model) dengan tombol **Open in Photo View**.
- **Genangan** — hanya aktif di tab Ortho; judul **SIMULASI GENANGAN 2D** ([Bab 7](07-simulasi-genangan.md)).
- **Batas** — hanya aktif di tab Ortho ([Bab 6](06-shapes-batas-wilayah.md)).

Tombol chevron **»** di ujung baris tab menciutkan dock menjadi rail ikon (tooltip: *Ciutkan panel kanan*).

## 2.7 Dock Bawah: Photos dan Console

- **Photos (N)** — **Tampilan Tabel** (kolom No, Nama Foto, Dimensi, Lintang, Bujur, Ketinggian (m), Fokus (mm), Proyeksi, Kesalahan (px), Status) atau **Tampilan Gambar Mini** (kartu 124 × 104 pt dengan status **[OK] Selaras** / **Tertunda**). Tombol **Tambah Foto…**, **Tambah Folder…**. Saat filter marker aktif tampil pil **Filter Marker: [GCP01]** dan tombol **Hapus Filter**.
- **Console (N)** — log bertanda waktu dari semua pekerja latar. Baris kesalahan diberi pil **ERR**. Tombol **Bersihkan Log Konsol**. Selalu periksa Console bila suatu tahap tidak memberi hasil.

Tombol chevron **⌄** menciutkan dock bawah menjadi baris tab **Photos (N)** · **Console (N)**; klik salah satunya untuk membuka dock pada tab itu.

## 2.8 Maps View di Tab Ortho

Klik **Maps** di sub-toolbar Ortho untuk menumpangkan ortomosaik pada peta daring.

| Kontrol | Fungsi |
| :-- | :-- |
| **Basemap:** Google Satelit (HD) · Google Hibrida · Esri World Imagery · Peta Jalan (OSM) · Sentinel-2 (2016) | Memilih penyedia ubin; atribusi dan tahun citra tampil di peta |
| **Ortho** (centang) + **Opacity** | Menampilkan/menyembunyikan dan mengatur transparansi overlay |
| **−** / **+** | Zoom Out / Zoom In; gulir mouse juga berfungsi |
| **Fit Ortho** | Memusatkan peta ke batas ortomosaik |
| **Sesuaikan Overlay** ▸ Timur, Utara, Rotasi, Skala, **Reset** | Pergeseran *tampilan* saja — ekspor tetap memakai koordinat survei (ditandai *Penyesuaian tampilan aktif · ekspor memakai koordinat survei*) |

⚠️ Basemap membutuhkan jaringan. Kegagalan unduh ubin ditampilkan di antarmuka; ortho lokal tetap bisa dilihat. Overlay memerlukan origin GPS (*Chunk belum memiliki origin GPS; jalankan Align Photos*) dan ortomosaik yang sudah dibangun. Citra basemap adalah referensi visual, bukan bukti akurasi survei.

## 2.9 Dialog Progres dan Pembatalan

Setiap tahap berjalan di thread latar; GUI tetap responsif. Dialog progres di tengah layar menampilkan nama tahap, rincian sub-tahap, bilah progres, **Waktu berjalan**, dan tombol **Batal** (atau **Batalkan Batch**). Hanya satu tahap pipeline boleh berjalan pada satu waktu; permintaan lain dicatat di Console sebagai *Peringatan: … tidak dijalankan karena task … masih berlangsung.*

Jika Anda membuka tahap yang prasyaratnya belum terpenuhi (misalnya DEM sebelum awan titik), muncul dialog **fallback** yang menjelaskan apa yang kurang dan menawarkan tombol tindakan yang disarankan (mis. **1. Selaraskan Foto (SfM)…**).

Jika tahap sudah pernah selesai pada chunk aktif, dialognya menampilkan banner **Tahapan Ini Sudah Selesai Dilakukan pada Chunk Ini** dan tombol utamanya berubah menjadi **Proses Ulang …**.

## 2.10 Pintasan Keyboard

| Pintasan | Fungsi | Catatan |
| :-- | :-- | :-- |
| Ctrl+N / Ctrl+O / Ctrl+S | Proyek baru / buka / simpan | Di macOS gunakan ⌘ lewat menu native |
| Ctrl+D | Batal pilih semua | |
| Ctrl+1 / Ctrl+2 / Ctrl+3 | Ciutkan/buka dock Workspace / Photos-Console / Properties | Di macOS ⌘1–⌘3 lewat menu Tampilan |
| `0` atau `F` | Atur ulang tampilan 3D | Tidak aktif saat mengetik di kolom teks |
| `7`, `1`, `3` | Tampak atas, depan, kanan | |
| `Spasi` | Foto berikutnya + buka tab Photo | |
| `Esc` | Keluar dari fullscreen peta | |
| Seret-lepas berkas | Tambah foto / folder / proyek / CSV GCP | |

## 2.11 Pengaturan / Preferensi

**Alat → Pengaturan / Preferensi…** menampilkan daftar seksi di kiri dan isinya di kanan:

- **Umum** — **Bahasa Antarmuka**: *Bahasa Indonesia (ID)* atau *English (US)*.
- **Tampilan & Tata Letak** — **Tema Visual & Estetika Workstation** (**Pro Gelap** — bawaan, dan **Pro Terang**; keduanya memenuhi kontras WCAG AA ≥ 4.5:1) dan **Posisi Bilah Tombol & Docking** (*Atas Semua* / *Atas dan Kanan*).
- **Sistem & Standar** — ringkasan standar geodesi/fotogrametri, **Rilis Aktif** (mis. `v0.1.1-alpha`, `Alpha`), **Waktu Pembaruan**, dan tombol **Lihat Riwayat Perubahan (Changelog)…**.

---

**Langkah berikutnya:** buat proyek pertama Anda di [Bab 3 — Memulai proyek](03-memulai-proyek.md).
