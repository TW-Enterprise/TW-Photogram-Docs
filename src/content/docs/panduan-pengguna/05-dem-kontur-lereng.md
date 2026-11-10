---
title: "Bab 5 — DEM, Kontur dan Lereng"
description: "Apa yang akan Anda lakukan: membangun DEM (DSM atau DTM) dengan opsi yang tepat, mengatur tampilannya, membuat kontur dan raster turunan (lereng, aspek, hil..."
---

**Apa yang akan Anda lakukan:** membangun DEM (DSM atau DTM) dengan opsi yang tepat, mengatur tampilannya, membuat kontur dan raster turunan (lereng, aspek, hillshade, roughness, TRI), memotong DEM dengan batas, serta mengkalibrasi datum tinggi dan membandingkannya dengan DEMNAS.

---

## 5.1 DSM atau DTM?

| Produk | Isi | Sumber titik | Kegunaan |
| :-- | :-- | :-- | :-- |
| **DSM** (Digital Surface Model) | Permukaan teratas: atap, tajuk pohon, kendaraan | Semua titik rapat | Ortorektifikasi, volume timbunan, model kota |
| **DTM** (Digital Terrain Model) | Tanah saja | Titik kelas ASPRS 2 (Ground) | Kontur, lereng, simulasi genangan, desain |

DTM memerlukan [Klasifikasi Titik Tanah](04-alur-kerja.md#44-klasifikasi-titik-tanah-asprs) terlebih dahulu. Bila titik kelas 2 tidak mencukupi, pembangunan DTM gagal dengan pesan jelas — tidak ada hasil "kira-kira".

## 5.2 Dialog Bangun Model Elevasi Digital (DEM)

**Alur Kerja → 7. Bangun Model Elevasi (DEM)…** · tombol **Bangun DEM** / **Proses Ulang Bangun DEM**

| Label | Pilihan | Bawaan | Penjelasan |
| :-- | :-- | :-- | :-- |
| **Tipe Koordinat** | *Geographic / Planar* | informasi | Raster dibangun pada grid ENU lokal; ekspor memproyeksikan ke WGS 84 atau UTM |
| **Permukaan** | **DSM — Surface / Permukaan** · **DTM — Ground / Tanah (class 2)** | DSM | Lihat §5.1 |
| **Sumber Data** | **Dense cloud** · **Tie points** · **Mesh** | Dense cloud | *Dense cloud*: hasil terbaik; bila belum ada, otomatis memakai titik ikat dan mencatatnya di log. *Tie points*: pratinjau sangat cepat tetapi kasar. *Mesh*: merasterkan mesh secara ortografis |
| **Interpolasi** | **Disabled — hanya sel yang punya titik** · **Enabled — isi lubang di dalam hull (TIN)** · **Extrapolated — isi hingga tepi raster/batas** | Enabled | *Disabled*: NODATA di setiap sel tanpa pengukuran (untuk audit cakupan). *Enabled*: lubang di dalam *convex hull* diisi TIN Delaunay + interpolasi barycentric; luar hull tetap NODATA. *Extrapolated*: seluruh raster (atau seluruh batas) diisi dengan meneruskan permukaan dari tepi terdekat secara halus; nilai ekstrapolasi tidak pernah melampaui min/maks pengukuran |
| **Batas wilayah** | centang **Potong sesuai batas (Shapes)** + **ALL_TOUCHED** | aktif bila ada batas | Hanya aktif bila dock **Batas** memiliki lapisan berperan *Batas luar*/*Batas dalam*; tooltip: *Tandai lapisan sebagai batas luar/dalam di dock 'Batas' dulu*. Pemotongan di sini non-destruktif — DEM dibangun lalu dimasker dan dipangkas ke extent batas. **ALL_TOUCHED** mempertahankan sel yang disentuh garis batas (aturan GDAL) alih-alih hanya sel yang pusatnya di dalam |
| **Resolusi** | centang **Kustom** + nilai `m/px` (0,02–5,0) atau teks *auto (4×GSD = 0,xxxx m)* | auto | Resolusi otomatis = 4 × GSD rata-rata, yaitu langkah peta kedalaman saat awan titik dibangun (sama dengan Metashape). Memperhalus di bawah nilai ini **tidak** menambah detail, hanya memperbesar berkas |

**Algoritme (sumber Dense cloud).** Median tinggi per sel → pengisian lubang TIN Delaunay → filter spike bilateral yang mempertahankan tepi (fit bidang lokal berbobot, tidak menggeser lereng) → masker cakupan kamera dengan penutupan/pembukaan morfologis agar tepi survei halus; komponen cakupan < 200 sel dibuang sebagai noise.

**Setelah selesai**, aplikasi berpindah ke tab **Ortho** lapisan **DEM**. Node **DEM** di Workspace menampilkan ukuran raster. Bila sebelumnya ada simulasi genangan atau laporan DEMNAS, keduanya ditandai kedaluwarsa (*DEM berubah; jalankan ulang simulasi.*).

⚠️ Mengubah algoritme atau parameter tidak membangun ulang DEM proyek lama secara otomatis. Jalankan **Proses Ulang Bangun DEM**.

## 5.3 Mengatur Tampilan DEM

Baris **Tampilan DEM** di atas peta (tab Ortho → lapisan DEM) hanya mengubah cara raster digambar; nilai elevasi tidak berubah (*Tinggi relatif terhadap origin ENU (m). Pengaturan ini hanya mengubah tampilan.*).

| Kontrol | Pilihan | Fungsi |
| :-- | :-- | :-- |
| Gaya | **Warna + relief** · **Warna elevasi** · **Hillshade** | Kombinasi ramp warna dan bayangan relief; hillshade murni abu-abu |
| Ramp warna | **Terrain** · **Hypsometric** · **Viridis** · **Grey** | *Terrain* (hijau–coklat–putih) untuk peta umum; *Hypsometric* untuk nuansa kartografi; *Viridis* ramah buta warna dan cetak; *Grey* untuk analisis |
| **Kontras relief** | 0–1 | Kekuatan bayangan |
| **Relief ×** | 0,25–5 | Pembesaran vertikal untuk hillshade — naikkan pada area datar |
| **Piksel tajam** | centang | Mempertahankan batas sel saat zoom (tooltip: *nilai elevasi tidak berubah*) |

Hillshade memakai azimut cahaya 315° dan ketinggian 45° (konvensi `gdaldem`). Renderer menggambar raster native dalam ubin ≤ 1024 px; tidak ada penurunan resolusi untuk zoom. NODATA ditampilkan putih.

💡 Untuk memeriksa artefak (pola kotak, tiang, lubang), pakai **Hillshade** dengan **Relief ×** 2–3 — kesalahan rekonstruksi paling terlihat tanpa warna.

## 5.4 Kontur

Buka tab Ortho → tombol **Batas** → bagian **PRODUK TURUNAN DEM** di dock kanan. Teks *Bangun DEM dulu untuk kontur, lereng, dan aspek.* muncul bila DEM belum ada.

| Kontrol | Fungsi |
| :-- | :-- |
| **Interval otomatis (x,xx m)** | Memilih interval dari deret kartografi 0,1 · 0,2 · 0,25 · 0,5 · 1 · 2 · 2,5 · 5 · 10 · 20 · 25 · 50 · 100 m sehingga rentang elevasi menghasilkan ≈ 30 garis |
| nilai `m` (0,05–500) | Interval manual bila centang otomatis dimatikan |
| **halus** 0–4 | Jumlah iterasi penghalusan Chaikin (tiap iterasi melipatgandakan jumlah verteks) |
| **Buat kontur (marching squares)** | Menjalankan penelusuran di thread latar; hasil menjadi lapisan **Kontur x,xx m** di bagian LAPISAN dengan label dari atribut `elevation` |

Kontur indeks ditandai atribut `index = true` dan hanya kontur indeks yang diberi label di peta. Lapisan kontur ikut dalam lembar peta ([Bab 8](08-cetak-laporan.md)) dan dapat diekspor ke GeoJSON/SHP/KML/DXF lewat tombol **Ekspor…** pada lapisan.

**Nilai yang disarankan**

| GSD / skala | Interval |
| :-- | :-- |
| 2–5 cm/px, lahan datar, skala 1:500–1:1 000 | 0,25–0,5 m |
| 5–10 cm/px, perbukitan, 1:2 000–1:5 000 | 1–2 m |
| Area luas 1:10 000 | 5 m |

Buat kontur dari **DTM**, bukan DSM — kontur DSM mengikuti atap dan tajuk.

## 5.5 Raster Turunan: Slope, Aspect, Hillshade, Roughness, TRI

Di bagian **PRODUK TURUNAN DEM**, kotak pilihan jenis + tombol **Ekspor GeoTIFF…** (tooltip: *Horn 3×3 seperti gdaldem; GeoTIFF Float32 EPSG:4326*).

| Jenis | Satuan | Arti | Pemakaian |
| :-- | :-- | :-- | :-- |
| **Slope (degrees)** | ° | Kemiringan dari gradien Horn 3×3 | Analisis kelayakan lahan, kelas lereng (0–2° datar · 2–8° landai · 8–15° miring · 15–30° curam · 30–45° sangat curam · > 45° terjal — kelas yang dipakai lembar lereng) |
| **Slope (percent)** | % | Kemiringan dalam persen (100 % = 45°) | Standar teknik sipil/jalan |
| **Aspect** | ° | Arah hadap lereng, searah jarum jam dari utara | Orientasi matahari, drainase |
| **Hillshade** | 0–255 | Bayangan relief azimut 315°, ketinggian 45° | Latar peta |
| **Roughness** | m | Beda tinggi maks–min dalam jendela 3×3 | Kekasaran permukaan |
| **Terrain ruggedness index** | m | TRI (Riley 1999): rata-rata beda absolut terhadap tetangga | Klasifikasi medan |

Semua keluaran berada pada grid DEM (NaN = NODATA) dan menyertakan nama besaran serta satuannya di deskripsi citra. Jalankan dari DTM untuk analisis tanah, dari DSM untuk kekasaran tajuk/bangunan.

## 5.6 Kalibrasi Elevasi dan DEMNAS

**Alur Kerja → Kalibrasi Elevasi…** (juga tombol **Datum elevasi / DEMNAS…** di dock Reference → Marker). Dialog membuka dengan dua peringatan tetap:

> *GCP mengontrol model. DEMNAS membandingkan elevasi; tidak membuktikan akurasi survei.*
> *Akurasi absolut memerlukan checkpoint survei independen.*

### Datum

| Kontrol | Pilihan |
| :-- | :-- |
| **Tinggi kamera/sumber** | *Unknown / Belum dikonfirmasi* · *WGS84 ellipsoid* · *EGM2008* · geoid khusus yang diimpor |
| **Tinggi keluaran** | *WGS84 ellipsoid* · *EGM2008* · *Local ENU (relative)* · geoid khusus |

Tetapkan datum sumber **sesuai metadata survei** (bukan tebakan dari nama drone). Mengubah datum sumber pada proyek yang sudah selaras membatalkan status selaras — *Mengubah datum sumber pada proyek terselaras memerlukan Align Photos ulang.* Tinggi absolut dihitung per lokasi lewat ENU → ECEF → geodetik, lalu `H = h − N` untuk geoid yang dipilih. *Local ENU* menyatakan tinggi relatif, bukan elevasi.

### Geoid

- **Unduh geoid EGM2008** — potongan grid untuk cakupan GPS foto (tidak perlu DEM).
- **Nama geoid khusus** + **Impor geoid…** — grid GTX atau GeoTIFF WGS84 north-up dengan undulasi dalam meter. Grid di luar cakupan, NoData, atau CRS tak didukung ditolak dengan pesan.

### DEMNAS sebagai Pembanding

1. Bangun DEM (DTM lebih tepat untuk dibandingkan).
2. **Unduh DEMNAS area survei** (ImageServer BIG, Float32 EGM2008) atau **Impor GeoTIFF DEMNAS…**. Baris `DEMNAS: W × H · datum · sumber` muncul bila berhasil.
3. Pada thumbnail DEM, **klik** titik-titik poligon di area tanah terbuka yang stabil (hindari bangunan, pohon, air, area yang berubah). **Klik kanan** menghapus titik terakhir; **Hapus area** mengosongkan.
4. Klik **Analisis** (aktif bila ≥ 3 titik). Hasil: `Sel valid: n · Ditolak: m` dan `Offset: ±x,xxx m · NMAD: … · RMSE: sebelum → sesudah`. Minimal 30 sel DEMNAS valid diperlukan.
5. **Terapkan offset** hanya tersedia bila **tidak ada GCP Control aktif** — dengan GCP, DEMNAS murni pembanding (*GCP aktif: DEMNAS hanya untuk pembandingan.*). Offset konstan disimpan terpisah dan dapat dibatalkan dengan **Batalkan offset**. Penerapan ulang mengganti koreksi sebelumnya.

⚠️ DEMNAS beresolusi ≈ 8 m; kesesuaiannya bukan bukti akurasi sentimeter. Tidak ada registrasi horizontal otomatis, koreksi kemiringan, atau deformasi DEM — jangan memakai offset untuk menutupi galat XY atau perbedaan DSM/DTM.

Jika layanan BIG tidak merespons (timeout), gunakan impor GeoTIFF. Unduhan yang gagal atau dibatalkan mempertahankan referensi yang sebelumnya valid. Semua grid, poligon, dan koreksi tersimpan di proyek.

## 5.7 Memotong DEM dengan Batas dan Statistik Zonal

Lihat [Bab 6 §6.7–6.8](06-shapes-batas-wilayah.md#67-potong-raster-dengan-batas) untuk **Potong DEM sekarang**, **Batalkan potongan**, dan **Statistik zonal** (luas, min/rata/maks, simpangan, volume di atas/bawah datum).

## 5.8 Ekspor DEM

Lihat [Bab 10](10-ekspor-interoperabilitas.md#102-dem): GeoTIFF WGS 84 (datum keluaran terpilih), GeoTIFF UTM, ESRI ASCII Grid, XYZ. Semua ekspor numerik menyertakan NODATA dan informasi datum/koreksi.

---

**Langkah berikutnya:** batasi area kerja dan tambahkan konteks administrasi di [Bab 6 — Shapes & batas wilayah](06-shapes-batas-wilayah.md).
