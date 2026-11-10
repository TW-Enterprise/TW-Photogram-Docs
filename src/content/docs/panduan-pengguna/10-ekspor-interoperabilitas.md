---
title: "Bab 10 — Ekspor dan Interoperabilitas"
description: "Apa yang akan Anda lakukan: memilih format ekspor yang tepat untuk tiap produk, memahami sistem koordinat yang tertanam di berkas, dan membuka hasilnya di Q..."
---

**Apa yang akan Anda lakukan:** memilih format ekspor yang tepat untuk tiap produk, memahami sistem koordinat yang tertanam di berkas, dan membuka hasilnya di QGIS, Agisoft Metashape, AutoCAD, dan Global Mapper tanpa pergeseran.

---

## 10.1 Prinsip Koordinat

- Secara internal semua geometri berada di **ENU lokal** (meter, berpusat di origin geodetik chunk).
- Ekspor georeferensi memerlukan origin geodetik — foto ber-GPS yang sudah **Sejajarkan Foto**. Tanpa itu ekspor gagal dengan pesan jelas, bukan menulis berkas tak bereferensi dengan nama yang menyesatkan.
- Raster bawaan diekspor dalam **WGS 84 geografis (EPSG:4326)** — sama dengan bawaan Metashape — dengan tag GeoTIFF asli (`PixelIsArea`, batas luar setengah piksel di luar pusat sampel).
- DEM juga tersedia dalam **UTM** (EPSG:326zz/327zz, zona dipilih dari origin chunk). Konversi ENU → UTM adalah *resampling* sungguhan (memperhitungkan konvergensi meridian dan faktor skala grid), bukan sekadar pelabelan ulang.
- Ketinggian DEM memakai **datum keluaran** dari Kalibrasi Elevasi (ellipsoid WGS84, EGM2008, geoid khusus, atau ENU relatif) dan menuliskan metadata CRS vertikal yang sesuai.
- Ekspor berjalan di thread latar; hasil atau kegagalan dicatat di Console (`Export failed: …`).

## 10.2 DEM

| Menu | Format | CRS horizontal | Tinggi | Catatan |
| :-- | :-- | :-- | :-- | :-- |
| **Ekspor DEM (GeoTIFF, WGS 84)…** | GeoTIFF Float32, NaN = NODATA | EPSG:4326 | datum keluaran | Dialog *Export DEM — selected height datum*. Grid ENU dengan afinitas geografis |
| **Ekspor DEM (GeoTIFF, UTM)…** | GeoTIFF Float32 | UTM meter, north-up | datum keluaran | Resampling bilinear ke grid UTM dengan ukuran sel sama |
| **Ekspor DEM (ESRI ASCII Grid)…** | `.asc` + `.prj` (WKT UTM), `NODATA_value -9999` | UTM | datum keluaran | Ditolak bila jarak sampel timur ≠ utara (format hanya punya satu `cellsize`) |
| **Ekspor DEM (XYZ, UTM)…** | teks `E N Z` per sel valid, presisi mm | UTM | datum keluaran | Dibaca driver GDAL XYZ dan paket survei/CAD |
| Workspace → DEM → **Ekspor DEM (GeoTIFF)…** | sama dengan GeoTIFF WGS 84 | | | |

## 10.3 Ortomosaik

| Menu | Format | CRS |
| :-- | :-- | :-- |
| **Ekspor Ortomosaik (GeoTIFF)…** | GeoTIFF RGBA 8-bit, alpha 0 = NODATA transparan | EPSG:4326 |

Tidak ada ekspor ortho UTM pada versi ini; reproyeksikan di QGIS (*Raster → Projections → Warp*) bila diperlukan.

## 10.4 Awan Titik dan Model 3D

| Menu | Format | CRS | Isi |
| :-- | :-- | :-- | :-- |
| **Ekspor Titik Awan (ASPRS LAS)…** | LAS 1.4, PDRF 2 (XYZ + intensitas + RGB) | **UTM** (WKT di VLR `LASF_Projection`) | Awan titik rapat dengan klasifikasi ASPRS |
| **Ekspor Titik Awan (Stanford PLY)…** | PLY | ENU lokal (meter) | Awan titik rapat berwarna |
| **Ekspor Model 3D (OBJ)…** | Wavefront OBJ, warna verteks `v x y z r g b`, normal `vn` | ENU lokal | Tanpa `.mtl`/atlas tekstur; dibaca MeshLab, CloudCompare, Blender, Metashape |
| **Ekspor Project XML (.xml)…** | `doc.xml` + `cameras.xml` di folder pilihan | — | **Bahan referensi** bergaya Metashape, bukan `.psx` yang bisa dibuka (Metashape memakai kontainer `.files/` ter-zip). Gunakan untuk membaca pose/kalibrasi kamera secara terprogram |

## 10.5 Vektor

| Sumber | Format | CRS |
| :-- | :-- | :-- |
| Dock Batas → lapisan → **Ekspor…** | GeoJSON (RFC 7946), Shapefile (`.shp/.shx/.dbf/.prj/.cpg`), KML | WGS 84 |
| | DXF (polyline) | **ENU lokal (meter)** |
| Dock Genangan → **Ekspor poligon bahaya…** | GeoJSON / Shapefile / KML | WGS 84 |
| **Ekspor Referensi (GCP CSV)…** | CSV `Label,X_Ref,Y_Ref,Z_Ref,Horizontal_CRS,Vertical_Datum,Role,Enabled,Sigma_XY_m,Sigma_Z_m,X_ENU_Est,Y_ENU_Est,Z_ENU_Est,Error_E_m,Error_N_m,Error_U_m,Error_3D_m` | sesuai impor | Kolom estimasi/residual kosong bila belum dihitung — tidak pernah nol buatan |

## 10.6 Raster Turunan dan Genangan

| Sumber | Format | CRS |
| :-- | :-- | :-- |
| Dock Batas → PRODUK TURUNAN DEM → **Ekspor GeoTIFF…** (Slope deg/%, Aspect, Hillshade, Roughness, TRI) | GeoTIFF Float32, NaN NODATA, besaran+satuan di deskripsi | EPSG:4326 (grid DEM) |
| Dock Genangan → **Ekspor GeoTIFF:** kedalaman saat ini / puncak, kecepatan puncak, waktu tiba, durasi, kelas bahaya | GeoTIFF Float32 | EPSG:4326 (grid solver) |
| Dock Genangan → **Ekspor hidrogaraf CSV** | `time_seconds,discharge_m3_s` | — |

## 10.7 Dokumen

| Menu | Format |
| :-- | :-- |
| **Cetak Lembar Peta / Laporan (PDF)…** | PDF vektor (teks dapat dicari, font tertanam, XMP) atau PNG 300 dpi per halaman |
| **Buat Laporan Survei (PDF/MD)…** | `.html`, `.md`, `.txt` (langsung) atau `.pdf` (lewat dialog cetak) |
| **Buat Infografis Ringkasan…** | PNG / PDF A4 lanskap 3508 × 2480 px |

## 10.8 Membuka di QGIS

1. **DEM / ortho / raster turunan**: seret GeoTIFF ke kanvas. QGIS membaca EPSG:4326 dan datum vertikal dari GeoKey. Untuk analisis metrik, aktifkan *on-the-fly* ke UTM atau gunakan **Ekspor DEM (GeoTIFF, UTM)**.
2. **Kontur / batas / bahaya**: seret `.geojson`/`.shp`/`.kml`. Atribut `elevation`, `index` (kontur) dan `label` (bahaya) tersedia untuk pelabelan.
3. **LAS**: *Layer → Add Layer → Add Point Cloud Layer*; CRS UTM terbaca dari WKT.
4. **GCP CSV**: *Add Delimited Text Layer*, pilih kolom `X_Ref/Y_Ref` dan CRS sesuai `Horizontal_CRS`.
5. Hillshade/kontur QGIS dari DEM WGS 84 akan terdistorsi arah; lakukan dari DEM UTM atau pakai produk turunan TW Photogram yang sudah dihitung di grid metrik.

## 10.9 Membawa ke Agisoft Metashape

Metashape tidak dapat membuka `doc.xml` hasil ekspor. Alur yang bekerja:

| Kebutuhan | Cara |
| :-- | :-- |
| Membandingkan ortho/DEM | Impor GeoTIFF sebagai *Import DEM* / *Import Orthomosaic* (CRS WGS 84, EPSG:4326) |
| Membandingkan awan titik | *Import Points* dari LAS (CRS UTM dibaca dari VLR) |
| Mesh | *Import Model* OBJ — koordinat ENU lokal; set CRS lokal atau transformasi manual |
| GCP | *Import Reference* dari CSV ekspor (kolom Label, X_Ref, Y_Ref, Z_Ref; pilih CRS yang sama dengan `Horizontal_CRS`) |
| Pose kamera | Baca `cameras.xml` secara terprogram (bukan impor langsung) |

Rujukan kesetaraan parameter ada di [`docs/engineering/metashape-parity-spec.md`](../engineering/metashape-parity-spec.md).

## 10.10 AutoCAD / CAD

- **Kontur & batas → DXF** berada dalam meter ENU lokal (origin = kamera referensi). Untuk menempatkannya di koordinat proyek:
  1. Ekspor DEM **XYZ UTM** — titik-titiknya sudah UTM.
  2. Ekspor kontur yang sama ke **GeoJSON** (WGS 84) dan konversi ke DXF UTM di QGIS (*Export → Save Features As → DXF*, CRS UTM), **atau**
  3. Terapkan transformasi (translasi + rotasi konvergensi meridian) di CAD dengan dua titik acuan dari GCP (ENU dari kolom `X_ENU_Est` vs UTM).
- **Lembar peta PDF** adalah vektor; dapat diimpor ke AutoCAD sebagai *PDF underlay* atau dikonversi.
- **OBJ** dibuka di produk 3D CAD (mis. Civil 3D lewat *Import*); satuan meter.

## 10.11 Global Mapper

- GeoTIFF (DEM/ortho/turunan/genangan), ESRI ASCII Grid, XYZ, LAS, GeoJSON/SHP/KML, DXF semuanya didukung langsung (*File → Open Data File*).
- Untuk DXF, atur proyeksi saat diminta: pilih *Local* lalu *rectify* dengan GCP, atau gunakan alternatif GeoJSON.
- Gunakan DEM UTM untuk perhitungan volume/kontur agar sel benar-benar persegi dalam meter.

## 10.12 Checklist sebelum Menyerahkan Data

- [ ] Datum sumber tinggi **bukan** *Belum dikonfirmasi* dan datum keluaran sesuai permintaan klien.
- [ ] GCP Control tersemat ≥ 2 foto, Optimasi Kamera dijalankan, DEM/ortho dibangun **setelah** optimasi.
- [ ] Checkpoint independen dilaporkan terpisah (pil **Checkpoint:** di dock Reference).
- [ ] Ortho diperiksa di **Maps** tanpa pergeseran sistematis.
- [ ] NODATA transparan di tepi (ortho) / NaN atau −9999 (DEM) — bukan nol.
- [ ] Laporan PDF menyertakan blok referensi dan akurasi.

---

**Langkah berikutnya:** bila sesuatu tidak berjalan semestinya, buka [Bab 11 — Pemecahan masalah](11-pemecahan-masalah.md).
