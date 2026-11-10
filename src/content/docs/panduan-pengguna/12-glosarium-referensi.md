---
title: "Bab 12 — Glosarium dan Referensi"
description: "Apa yang akan Anda lakukan: mencari arti istilah fotogrametri, geodesi, dan hidrologi yang dipakai di antarmuka dan panduan ini, serta menemukan standar dan..."
---

**Apa yang akan Anda lakukan:** mencari arti istilah fotogrametri, geodesi, dan hidrologi yang dipakai di antarmuka dan panduan ini, serta menemukan standar dan publikasi yang menjadi dasar perhitungan aplikasi.

---

## 12.1 Glosarium

| Istilah | Arti |
| :-- | :-- |
| **ALL_TOUCHED** | Aturan rasterisasi GDAL: sel yang disentuh garis poligon ikut dianggap di dalam, bukan hanya sel yang pusatnya di dalam |
| **Aspect** | Arah hadap lereng, derajat searah jarum jam dari utara |
| **ASPRS** | American Society for Photogrammetry and Remote Sensing; penerbit standar kelas titik LAS dan standar akurasi 2014 |
| **Bathtub** | Model genangan air tenang: semua sel di bawah elevasi muka air yang terhubung ke sumber tergenang |
| **Batas luar / batas dalam** | Peran lapisan Shapes: luar mempertahankan bagian dalam poligon; dalam membuat lubang (setara *Boundary type* Metashape) |
| **BRIEF** | Deskriptor biner 256-bit fitur gambar; dicocokkan dengan jarak Hamming |
| **Brown–Conrady** | Model distorsi lensa: fokus `f`, titik utama `cx, cy`, radial `k1, k2`, tangensial `p1, p2` |
| **Bundle adjustment (SBA)** | Optimasi serentak pose kamera, kalibrasi, dan titik 3D yang meminimalkan galat reproyeksi (Levenberg–Marquardt); *sparse* karena matriks Jacobian jarang |
| **CE90 / LE90** | Galat horizontal/vertikal pada tingkat kepercayaan 90 % (SNI 8202:2015): CE90 = 1,5175·RMSEr, LE90 = 1,6499·RMSEz |
| **CFL** | Syarat kestabilan langkah waktu solver eksplisit; α = 0,7 di model genangan |
| **Checkpoint (titik uji)** | GCP yang tidak dipakai dalam penyesuaian; residualnya adalah ukuran akurasi independen |
| **Chunk** | Unit proyek berisi kamera, marker, titik, mesh, DEM, ortho, shapes — satu kamera/penerbangan per chunk |
| **CN (Curve Number)** | Parameter SCS/TR-55 (30–100) yang merangkum tanah dan tutupan lahan untuk menghitung limpasan |
| **COLMAP** | Format dataset SfM (kamera, gambar, titik) yang dibaca trainer Brush |
| **Control (kontrol)** | GCP yang dipakai dalam penyesuaian dengan bobot σ |
| **CRS** | Coordinate Reference System, mis. WGS 84 (EPSG:4326) atau UTM 49S (EPSG:32749) |
| **CSF** | Cloth Simulation Filter — nama dialog klasifikasi tanah; implementasi aktif SMRF |
| **D·V** | Hasil kali kedalaman dan kecepatan (m²/s), ukuran bahaya hanyut |
| **Delaunay TIN** | Jaring segitiga tak beraturan yang memaksimalkan sudut minimum; dasar interpolasi DEM dan mesh |
| **DEM / DSM / DTM** | Model elevasi digital; permukaan (termasuk objek) / tanah saja |
| **DEMNAS** | DEM Nasional Indonesia dari BIG (≈ 8 m, datum EGM2008) |
| **Dense cloud (awan titik rapat)** | Jutaan titik 3D dari MVS |
| **Depth map (peta kedalaman)** | Jarak permukaan per piksel untuk tiap foto |
| **EGM2008** | Earth Gravitational Model 2008 — geoid global; tinggi ortometrik `H = h − N` |
| **ENU** | East-North-Up: kerangka metrik lokal yang berpusat di origin geodetik chunk |
| **EXIF** | Metadata foto: GPS, fokus, dimensi, tanggal |
| **FAST** | Detektor sudut cepat (Features from Accelerated Segment Test) |
| **Feathering / seamline** | Pembauran halus di koridor sempit antara dua foto sumber ortho |
| **GCP** | Ground Control Point — titik tanah berkoordinat teliti |
| **Green–Ampt** | Model infiltrasi fisik: Ks (konduktivitas jenuh), ψ (hisapan muka basah), Δθ (defisit kelembapan) |
| **GSD** | Ground Sample Distance — ukuran piksel di tanah (cm/px) |
| **HAND** | Height Above Nearest Drainage — tinggi tiap sel di atas saluran terdekat |
| **Hidrograf** | Debit terhadap waktu pada penampang |
| **Hillshade** | Bayangan relief dari sumber cahaya (azimut 315°, ketinggian 45°) |
| **ICP** | Iterative Closest Point — registrasi dua awan titik |
| **Inersial lokal** | Persamaan air dangkal yang disederhanakan (Bates dkk. 2010) untuk genangan 2D |
| **Interpolasi Enabled/Extrapolated** | Pengisian lubang DEM di dalam hull / hingga tepi raster |
| **ISO 19115-1** | Standar metadata geospasial; **ISO 19157** kualitas data |
| **Key point / tie point (titik kunci / titik ikat)** | Fitur gambar / fitur yang dicocokkan dan ditriangulasi |
| **LAS** | Format awan titik ASPRS; versi 1.4, PDRF 2 |
| **LOD** | Level of Detail — hierarki resolusi tiled model |
| **Manning n** | Koefisien kekasaran permukaan untuk aliran |
| **Marching squares** | Algoritme penelusuran garis kontur dari raster |
| **Marker** | Representasi GCP/checkpoint di proyek, dengan proyeksi di foto |
| **Mesh** | Jaring segitiga permukaan 3D |
| **MVS / SGM** | Multi-View Stereo / Semi-Global Matching — perhitungan kedalaman dari banyak foto |
| **NMAD** | Normalized Median Absolute Deviation — ukuran sebaran robust |
| **NODATA** | Sel tanpa nilai (NaN, −9999, atau alpha 0) |
| **NVA / VVA** | Non-/Vegetated Vertical Accuracy (ASPRS 2014); NVA = 1,96·RMSEz |
| **Nadir** | Kamera menghadap tegak ke bawah |
| **Origin geodetik** | Titik acuan ENU (dari kamera referensi) yang membuat chunk bereferensi |
| **Ortomosaik** | Mosaik foto yang telah diortorektifikasi (bebas distorsi perspektif dan relief) |
| **PixelIsArea** | Konvensi GeoTIFF: koordinat mengacu sudut luar piksel |
| **PLY / SPZ** | Format awan titik/Gaussian: Stanford PLY, Niantic SPZ terkompresi |
| **Priority-flood** | Algoritme pengisian cekungan DEM (Barnes dkk. 2014) |
| **RANSAC** | Estimasi robust dengan sampel acak untuk menolak kecocokan salah |
| **Reproyeksi (galat)** | Jarak piksel antara titik terukur dan titik 3D yang diproyeksikan kembali |
| **RMSE** | Root Mean Square Error; RMSEr = √(RMSEx² + RMSEy²) |
| **Roughness / TRI** | Beda tinggi maks–min 3×3 / Terrain Ruggedness Index (Riley 1999) |
| **Runoff coefficient (C)** | Fraksi hujan yang menjadi limpasan (metode rasional) |
| **SfM** | Structure-from-Motion — rekonstruksi pose kamera dan titik dari foto |
| **SH (spherical harmonics)** | Koefisien warna bergantung arah pada Gaussian Splatting (derajat 0–3) |
| **Sim3 / Umeyama** | Transformasi kesamaan 7-parameter (skala, rotasi, translasi) antar chunk |
| **SMRF** | Simple Morphological Filter (Pingel dkk. 2013) untuk klasifikasi tanah |
| **Splat** | Satu elipsoid Gaussian berwarna |
| **Statistik zonal** | Ringkasan raster di dalam poligon (luas, min/rata/maks, volume) |
| **Stage (muka air)** | Elevasi permukaan air |
| **Tiled model** | Mesh terbagi quadtree multiresolusi |
| **UTM** | Universal Transverse Mercator — proyeksi metrik berzona 6° |
| **WGS 84** | Datum/elipsoid global GPS |
| **Workspace** | Dock pohon proyek |
| **Yaw gimbal** | Sudut heading kamera; dimasukkan ke triangulasi dan Jacobian SBA |

## 12.2 Standar dan Pedoman yang Dirujuk Aplikasi

| Standar | Dipakai untuk |
| :-- | :-- |
| **ASPRS Positional Accuracy Standards for Digital Geospatial Data (2014)**, Tabel B.5/B.6 | Kelas akurasi horizontal/vertikal, NVA = 1,96·RMSEz, horizontal 95 % = 1,7308·RMSEr di blok akurasi lembar peta dan laporan |
| **ASPRS LAS 1.4 Specification** dan *Standard LiDAR Point Classes* | Kelas 1, 2, 3–5, 6, 7 pada awan titik; ekspor LAS PDRF 2 dengan VLR WKT |
| **SNI 8202:2015** Ketelitian Peta Dasar | Kelas 1–3 per skala: CE90 0,2/0,3/0,5 mm × skala; LE90 0,5/0,75/1,25 × interval kontur (skala/2500 m) |
| **ISO 19115-1:2014** Geographic information — Metadata; **ISO 19157** Data quality | Halaman metadata laporan (identifikasi, extent, sistem referensi, lineage, DQ_PositionalAccuracy) |
| **BIG — Peta Rupabumi Indonesia (RBI)** | Konvensi lembar peta (grid UTM, graticule, legenda, blok referensi); batas administrasi; DEMNAS; INAGEOID |
| **Perka BNPB No. 02 Tahun 2012** | Kelas bahaya banjir berdasarkan kedalaman (Rendah < 0,76 m, Sedang 0,76–1,5 m, Tinggi > 1,5 m) |
| **Australian Rainfall & Runoff 2019**, Book 6 Ch. 7 (Smith, Davey & Cox 2014) | Kelas bahaya H1–H6 dari D, V, D·V |
| **USDA NRCS TR-55 (1986)** Urban Hydrology for Small Watersheds | Metode SCS Curve Number: S = 25400/CN − 254, Ia = 0,2·S |
| **OGC 06-103r4** Simple Features; **RFC 7946** GeoJSON; **ESRI Shapefile**; **OGC KML** | Semantik dan format lapisan vektor |
| **GeoTIFF 1.1** (OGC 19-008r4) | Tag georeferensi raster, CRS vertikal |
| **COLMAP** text format | Dataset pelatihan Gaussian |
| **Niantic SPZ** | Format Gaussian terkompresi |

## 12.3 Publikasi Ilmiah yang Diimplementasikan

| Rujukan | Bagian aplikasi |
| :-- | :-- |
| Rosten & Drummond 2006 (FAST); Calonder dkk. 2010 (BRIEF); Lowe 2004 (ratio test) | Deteksi dan pencocokan fitur |
| Hartley & Zisserman 2004 *Multiple View Geometry*; Nistér 2004 (5-point) | Geometri epipolar, triangulasi |
| Brown 1971 / Conrady 1919 | Model distorsi lensa |
| Hirschmüller 2008 (Semi-Global Matching) | Peta kedalaman MVS |
| Pingel, Clarke & McBride 2013, *ISPRS J.* 77:21–30 (SMRF) | Klasifikasi titik tanah |
| Horn 1981 (gradien 3×3), Riley dkk. 1999 (TRI) | Lereng, aspek, hillshade, roughness, TRI |
| Shepard 1968 (IDW) | Ekstrapolasi DEM |
| Chaikin 1974; Ramer–Douglas–Peucker 1972/1973 | Penghalusan dan penyederhanaan kontur |
| Horn 1987 (kuaternion satuan) / Umeyama 1991 | Penyelarasan chunk Sim3, ICP |
| Bates, Horritt & Fewtrell 2010, *J. Hydrol.* 387:33–45; de Almeida dkk. 2012 | Solver genangan inersial lokal |
| Nobre dkk. 2011 (HAND); Barnes, Lehman & Mulla 2014 (priority-flood) | Model statis HAND, pengisian cekungan, D8 |
| Chow, Maidment & Mays 1988 *Applied Hydrology* §4.3; Rawls, Brakensiek & Miller 1983 | Green–Ampt dan parameter tanah acuan |
| Kerbl dkk. 2023 (3D Gaussian Splatting); Brush (Brussee) | Pelatihan dan penampil Gaussian |

## 12.4 Sumber Daring

- DEMNAS BIG — <https://www.big.go.id/en/content/produk/demnas>
- Layanan raster DEMNAS — <https://geoservices.big.go.id/raster/rest/services/DEMNAS/DEM_Indonesia/ImageServer>
- INAGEOID BIG — <https://srgi.big.go.id/page/model-geoid>
- Grid geoid Agisoft — <https://www.agisoft.com/downloads/geoids/>
- geoBoundaries — <https://www.geoboundaries.org> (CC BY 4.0)
- GADM — <https://gadm.org> (akademik/non-komersial)
- Brush — <https://github.com/ArthurBrussee/brush> (Apache-2.0)
- SPZ — <https://github.com/nianticlabs/spz>

---

**Langkah berikutnya:** kembali ke [daftar isi](../user-manual.md) atau mulai memproses survei Anda dari [Bab 3](03-memulai-proyek.md).
