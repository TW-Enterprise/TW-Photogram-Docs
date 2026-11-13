---
title: "Bab 4 — Alur Kerja 12 Tahap"
description: "Apa yang akan Anda lakukan: menjalankan tahapan fotogrametri dari foto mentah hingga ortomosaik dan model 3D, memahami setiap parameter dialog, memilih nila..."
---

**Apa yang akan Anda lakukan:** menjalankan tahapan fotogrametri dari foto mentah hingga ortomosaik dan model 3D, memahami setiap parameter dialog, memilih nilai yang tepat, memperkirakan waktu, membaca hasil di antarmuka, dan mengenali kesalahan yang umum terjadi.


**Ingin menjalankan hujan dan genangan?** Ikuti [tutorial bergambar mapping_01 dari foto sampai Play](/TW-Photogram-Docs/panduan-pengguna/07-simulasi-genangan/#70-tutorial-bergambar-dari-foto-mapping_01-sampai-air-terlihat), dengan screenshot aplikasi macOS dan pemeriksaan hasil setiap tahap.

---

## 4.0 Urutan dan Ketergantungan

Menu **Alur Kerja** menomori tahapan 1–12. Tidak semua wajib; alur minimum pemetaan 2D adalah **1 → 3 → (Klasifikasi) → 7 → 8**. Dialog **Panduan Cepat Survei** menjalankan versi ringkasnya.

```
1 Sejajarkan Foto ─┬─► 3 Bangun Awan Titik ─► Klasifikasi Titik Tanah (ASPRS)
                   │          │
                   │          ├─► 7 Bangun DEM ──► Kalibrasi Elevasi ──► 8 Bangun Ortomosaik
                   │          │
                   │          └─► 4 Bangun Model 3D ─► 5 Bangun Tekstur ─► 6 Tiled Model
                   ├─► 9 Bangun Panorama
                   └─► Optimasi Kamera (SBA)   ← setelah GCP disematkan
2 Sejajarkan Laser Scan (ICP) — opsional
10 Sejajarkan Chunk → 11 Gabungkan Chunk — hanya bila > 1 chunk
12 Proses Batch — menjalankan antrean tahapan di atas secara otomatis
```

Aplikasi memeriksa prasyarat setiap kali Anda membuka tahap. Bila tidak terpenuhi, dialog fallback menjelaskan kekurangannya (mis. *Awan titik rapat (Dense Point Cloud) belum dibuat.*) dan menawarkan tombol tahap yang harus dijalankan lebih dulu.

**Perkiraan waktu** di bawah ini adalah orde besaran untuk laptop modern dengan GPU terintegrasi pada dataset sampel (24 foto 20 MP). Survei ratusan foto berkembang kurang-lebih linier terhadap jumlah foto untuk penyelarasan dan awan titik, dan terhadap luas area untuk DEM/ortho.

---

## 4.1 Sejajarkan Foto (SfM)

**Menu:** Alur Kerja → **1. Sejajarkan Foto (SfM)…** · **Dialog:** *Penyelarasan Foto* · **Tombol:** **Selaraskan Foto** / **Proses Ulang Penyelarasan**

**Tujuan.** Menemukan titik-titik yang sama antar foto (titik ikat), menghitung posisi dan orientasi setiap kamera, serta mengkalibrasi lensa. Hasilnya adalah *sparse cloud* dan pose kamera yang menjadi dasar semua tahap berikutnya.

**Algoritme.** Deteksi sudut FAST multi-skala + deskriptor biner BRIEF 256-bit → pencocokan rasio Lowe (GPU bila tersedia) → seleksi pasangan dari tetangga GPS (12 tetangga terdekat, radius 120 m) → geometri epipolar + RANSAC → triangulasi → *Sparse Bundle Adjustment* Levenberg-Marquardt dengan prior GPS (σ = 10 m) dan prior panjang fokus, dalam beberapa ronde penolakan pencilan.

**Parameter dialog**

| Label | Pilihan / rentang | Bawaan | Arti |
| :-- | :-- | :-- | :-- |
| **Akurasi** | Highest (Tertinggi), High (Tinggi – Rekomendasi), Medium (Sedang), Low (Rendah) | High | Tingkat resolusi pencarian fitur (paritas Metashape) |
| **Batas Titik Kunci (Key points)** | angka | 40 000 | Batas fitur per foto |
| **Batas Titik Ikat (Tie points)** | angka | 4 000 | Batas titik ikat per foto |
| *Seleksi pasangan* | teks informasi | *Seleksi awal Generik & Referensi GPS* | Pasangan foto dipilih dari kedekatan GPS |

💡 Pada versi 0.1.0-alpha, tombol **Selaraskan Foto** menjalankan penyelarasan dengan parameter internal standar (`AlignParams::default()`); pilihan Akurasi dan batas titik ditampilkan untuk kesetaraan Metashape dan tersimpan sebagai ringkasan tahap batch. Nilai bawaan sudah dituning untuk blok survei nadir pada ketinggian tetap.

**Perkiraan waktu.** 24 foto: ± 1–3 menit (GPU) / 3–8 menit (CPU).

**Membaca hasil**

- Dialog progres menampilkan sub-tahap (*Mempersiapkan orientasi dan koordinat GPS…*, ekstraksi fitur, pencocokan, bundle adjustment). Console mencatat `Penyelarasan selesai: … (waktu per tahap)`.
- Status bar: **Chunk 1: 24/24 aligned (100%)**. Properties → **Aligned Cameras** dan **Reprojection** (px). Nilai reproyeksi < 1 px baik; 0,3–0,6 px lazim untuk foto DJI tajam.
- Dock Reference → Kamera: kolom **Galat (px)** dan **Proy** (jumlah proyeksi) per foto. Dock Photos menandai **[OK] Selaras** / **Tertunda**.
- Tab Model memperlihatkan piramida kamera membentuk jalur terbang dan titik ikat di bawahnya. Tekan `7` untuk tampak atas; jalur harus menyerupai pola terbang.

**Kesalahan umum**

| Gejala | Penyebab | Solusi |
| :-- | :-- | :-- |
| *Chunk aktif belum memiliki cukup foto (minimal 2 foto)* | < 2 foto | Tambah foto |
| Sebagian kamera **Tertunda** | Tumpang tindih kurang, foto buram, permukaan homogen (air, pasir, atap seragam) | Nonaktifkan foto buram; terbang ulang dengan overlap lebih besar; coba sertakan foto miring di tepi blok |
| Kamera selaras tetapi reproyeksi > 2 px | EXIF fokus salah, lensa rolling-shutter, foto dari dua kamera berbeda dalam satu chunk | Pisahkan kamera berbeda ke chunk terpisah; jalankan Optimasi Kamera setelah GCP |
| Model "melengkung" (dome) | Blok datar tanpa GCP dan kalibrasi lemah | Tambahkan GCP + Optimasi Kamera; lihat [§4.13](#413-optimasi-kamera-sba) |

---

## 4.2 Sejajarkan Laser Scan (ICP)

**Menu:** Alur Kerja → **2. Sejajarkan Laser Scan (ICP)…** · **Dialog:** *Penyelarasan Laser Scan (ICP)* · **Tombol:** **Selaraskan Scan**

**Tujuan.** Meregistrasi awan titik eksternal ke awan titik hasil foto dengan *Iterative Closest Point* (solusi SVD tertutup / kuaternion Horn).

| Label | Rentang | Bawaan |
| :-- | :-- | :-- |
| **Maksimal Iterasi** | 5–100 | 30 |
| **Batas Jarak (m)** | 0,5–20 m | 5 m |
| **Kriteria Konvergensi** | tetap `1e-4 m (Closed-form SVD)` | — |

💡 Versi ini belum menyediakan menu impor berkas laser scan (E57/LAS). Bila chunk tidak memuat scan laser tetapi sudah punya awan titik rapat, tahap ini meregistrasi titik ikat terhadap awan titik rapat dan melaporkan `Penyelarasan Laser Scan (ICP) berhasil dengan RMSE: … m`. Dalam **Proses Batch**, tahap ini dilewati otomatis bila tidak ada data (`[Batch] Dilewati Penyelarasan Laser Scan…`). Untuk survei foto murni, lewati tahap ini.

---

## 4.3 Bangun Awan Titik (Dense Cloud)

**Menu:** Alur Kerja → **3. Bangun Titik Awan (Dense Cloud)…** · **Dialog:** *Bangun Awan Titik (Dense Cloud)* · **Tombol:** **Bangun Awan Titik**

**Tujuan.** Menghitung peta kedalaman tiap foto dengan Semi-Global Matching (SGM) multi-pandangan, lalu memfusikannya menjadi jutaan titik 3D berwarna.

| Label | Rentang | Bawaan | Arti |
| :-- | :-- | :-- | :-- |
| **Kualitas** | 0,5–3,0 (slider) | 1,0 | Faktor kerapatan relatif terhadap langkah peta kedalaman 4×GSD (setara *Medium* Metashape). 2,0 ≈ *High*, 0,5 ≈ *Low*. Ukuran voksel fusi = 4·GSD / Kualitas |
| **Filter Kedalaman** | Mild (Rekomendasi foto udara), Moderate, Aggressive | Moderate | Seberapa agresif pencilan kedalaman dibuang. *Mild* mempertahankan detail tipis (tiang, kabel, tajuk); *Aggressive* menghasilkan permukaan lebih bersih tetapi dapat menghilangkan objek kecil |

**Nilai disarankan.** Pemetaan topografi/ortho: Kualitas 1,0, Mild. Model 3D bangunan: Kualitas 2,0, Moderate. Pratinjau cepat: 0,5, Aggressive.

**Perkiraan waktu.** 24 foto, Kualitas 1,0: 3–10 menit dengan GPU; CPU 3–5× lebih lama. Kualitas 2,0 ≈ 4× lebih lama dari 1,0 dan memori ≈ 4×.

**Membaca hasil.** Workspace menambah node **Peta Kedalaman** dan **Awan Titik (Dense Cloud)** (jumlah titik). Di tab Model, pakai **Warna (RGB)** / **Heatmap Elevasi**. Periksa lubang pada air, permukaan mengilap, dan vegetasi bergerak — itu normal dan akan diinterpolasi saat DEM.

**Kesalahan umum**

| Gejala | Solusi |
| :-- | :-- |
| *Foto udara belum diselaraskan* | Jalankan tahap 1 |
| Kegagalan GPU / adaptor tidak didukung dilaporkan di Console | Jalankan dengan `TW_DEPTH_BACKEND=cpu` ([Bab 11](/TW-Photogram-Docs/panduan-pengguna/11-pemecahan-masalah/)) |
| Awan titik "berisik" di atap/pohon | Naikkan filter ke Moderate/Aggressive atau naikkan Kualitas |
| Memori habis | Turunkan Kualitas; proses chunk lebih kecil lalu gabungkan |

---

## 4.4 Klasifikasi Titik Tanah (ASPRS)

**Akses:** klik kanan node **Awan Titik (Dense Cloud)** → **Klasifikasi Titik Tanah (CSF)…**, atau tahap batch *Klasifikasi Titik Tanah (CSF)* · **Dialog:** *Klasifikasi Titik Tanah (ASPRS CSF)* · **Tombol:** **Klasifikasikan Titik**

**Tujuan.** Memberi kelas ASPRS pada tiap titik rapat sehingga DTM (tanah saja) dan analisis genangan dapat dibuat. Kelas yang dipakai:

| Kelas ASPRS | Arti |
| :-- | :-- |
| 1 | Unclassified |
| 2 | Ground (tanah) |
| 3–5 | Low / Medium / High Vegetation |
| 6 | Building |
| 7 | Low Point (noise) |

**Algoritme.** Dialog menyebut CSF; implementasi aktif adalah filter morfologis sederhana **SMRF** (Pingel, Clarke & McBride 2013 — port dari PDAL `filters.smrf` yang dipakai OpenDroneMap), yang membandingkan tiap titik dengan permukaan minimum yang telah dibuka secara morfologis. Hasilnya: objek kompak yang menonjol (bangunan, pohon) ditolak sebagai tanah, sedangkan lereng tetap diterima.

| Label | Rentang | Bawaan | Arti |
| :-- | :-- | :-- | :-- |
| **Ukuran Sel (m)** | 1–10 m | 3 m | Sel raster permukaan minimum. Lebih kecil = mengikuti relief lebih rapat tetapi lebih mudah salah memasukkan bagian bawah bangunan |
| **Batas Jarak Kain (m)** | 0,1–1,5 m | 0,3 m | Ambang beda tinggi dari permukaan tanah yang masih dianggap tanah (ODM `--smrf-threshold`) |

**Nilai disarankan.** Lahan terbuka/perkebunan: 3 m / 0,3 m. Perkotaan padat: 2 m / 0,2–0,3 m. Hutan rapat: 5 m / 0,5 m.

**Membaca hasil.** Console menulis `SMRF: NN.N% of dense points classified as ground`. Di tab Model pilih **Kelas ASPRS** untuk melihat warna kelas. Persentase tanah 30–70 % lazim untuk area campuran; mendekati 100 % berarti bangunan ikut terkelas tanah (ambang terlalu besar), mendekati 0 % berarti ambang terlalu kecil atau awan titik sangat berisik.

---

## 4.5 Bangun Model 3D (Mesh)

**Menu:** Alur Kerja → **4. Bangun Model 3D (Mesh)…** · **Dialog:** *Bangun Model 3D (Mesh)* · **Tombol:** **Bangun Model 3D**

**Tujuan.** Membuat jaring segitiga permukaan dari DSM yang telah difusikan dan dibersihkan (bukan langsung dari titik mentah), dengan warna dari awan titik.

| Label | Nilai (informasi) |
| :-- | :-- |
| **Tipe Permukaan** | Arbitrary 3D / Height field (implementasi: *height field* 2.5D Delaunay TIN) |
| **Sumber Data** | Awan Titik / Titik Ikat |

Dialog ini tidak memiliki parameter yang dapat diubah. Target ≈ 800 000 segitiga untuk blok ~9 ha. Bila DEM belum ada, mesh membangun DSM otomatis (resolusi 4×GSD) lebih dulu.

**Membaca hasil.** Node **Model 3D (Mesh)** menampilkan jumlah bidang. Tampilkan dengan **Tampilkan Model 3D**. Segitiga sangat curam (dinding) sengaja tidak dibentuk untuk menghindari artefak tiang di tepi tajuk pohon; dinding bangunan tampak sebagai tepi terbuka.

---

## 4.6 Bangun Tekstur

**Menu:** Alur Kerja → **5. Bangun Tekstur (Texture)…** · **Dialog:** *Bangun Tekstur 3D* · **Tombol:** **Bangun Tekstur**

| Label | Pilihan | Bawaan |
| :-- | :-- | :-- |
| **Ukuran Tekstur / Resolusi** | 1024, 2048 (Standar), 4096 (Tinggi), 8192 (Ultra) | 2048 × 2048 |
| **Mode Pembauran** | *Mosaik (Dominan Nadir)* | tetap |
| **Mode Pemetaan UV** | *Generic / Orthophoto UV* | tetap |

Prasyarat: mesh dan ≥ 2 kamera selaras. Tekstur 8192 membutuhkan memori GPU besar; gunakan 2048–4096 untuk pemetaan.

---

## 4.7 Bangun Model Bertingkat (Tiled Model)

**Menu:** Alur Kerja → **6. Bangun Model Bertingkat (Tiled Model)…** · **Dialog:** *Bangun Tiled Model (LOD)* · **Tombol:** **Bangun Tiled Model**

| Label | Rentang | Bawaan |
| :-- | :-- | :-- |
| **Tingkat Kedalaman LOD** | 1–6 | 3 |
| **Ukuran Ubin Spasial** | 25,0 m (tetap) | — |
| **Format Target** | Hierarchical Tiles (Spatial Quadtree) | — |

Memecah mesh menjadi quadtree multiresolusi untuk rendering area luas. Node **Tiled Model** menampilkan jumlah ubin dan level. Tahap ini tidak memiliki ekspor khusus pada versi ini; gunakan OBJ untuk mesh penuh.

---

## 4.8 Bangun Model Elevasi (DEM)

**Menu:** Alur Kerja → **7. Bangun Model Elevasi (DEM)…** · **Dialog:** *Bangun Model Elevasi Digital (DEM)* · **Tombol:** **Bangun DEM**

Tahap ini dibahas lengkap di [Bab 5](/TW-Photogram-Docs/panduan-pengguna/05-dem-kontur-lereng/). Ringkasan parameter:

| Label | Pilihan | Bawaan |
| :-- | :-- | :-- |
| **Tipe Koordinat** | Geographic / Planar (informasi) | — |
| **Permukaan** | DSM — Surface / Permukaan · DTM — Ground / Tanah (class 2) | DSM |
| **Sumber Data** | Dense cloud · Tie points · Mesh | Dense cloud |
| **Interpolasi** | Disabled · Enabled (default) · Extrapolated | Enabled |
| **Batas wilayah** | **Potong sesuai batas (Shapes)** + **ALL_TOUCHED** | aktif bila ada batas |
| **Resolusi** | **Kustom** + m/px (0,02–5) atau *auto (4×GSD = … m)* | auto |

Setelah selesai aplikasi berpindah ke tab Ortho lapisan DEM. Waktu: detik hingga 1–2 menit.

---

## 4.9 Kalibrasi Elevasi

**Menu:** Alur Kerja → **Kalibrasi Elevasi…** · **Dialog:** *Kalibrasi Elevasi*

Bukan tahap bernomor, tetapi berada di antara DEM dan ortho karena memerlukan DEM. Mengatur datum tinggi sumber/keluaran, geoid, pembandingan dengan DEMNAS, dan penerapan offset. Lihat [§5.6](/TW-Photogram-Docs/panduan-pengguna/05-dem-kontur-lereng/#56-kalibrasi-elevasi-dan-demnas).

---

## 4.10 Bangun Ortomosaik

**Menu:** Alur Kerja → **8. Bangun Ortomosaik…** · **Dialog:** *Bangun Ortomosaik* · **Tombol:** **Bangun Ortomosaik**

**Tujuan.** Memproyeksikan setiap foto ke DEM (ortorektifikasi) dan menyatukannya menjadi satu citra tegak bebas distorsi perspektif.

| Label | Nilai (informasi) |
| :-- | :-- |
| **Tipe Koordinat** | Geographic (WGS84 / UTM) |
| **Permukaan Acuan** | DEM / Mesh |
| **Mode Pembauran** | Mosaik (Dominan Nadir) |

Tidak ada parameter yang dapat diubah; resolusi otomatis = GSD. **Algoritme:** peta label menetapkan satu foto sumber (paling nadir yang melihat sel) untuk tiap area; penyeimbangan warna frekuensi-rendah per kamera; pembauran hanya pada koridor sempit di sekitar *seamline* (feathering smoothstep ≤ 3 m) sehingga atap dan jalan tetap tajam tanpa *ghosting*. Piksel di luar jejak kamera bernilai alpha 0 (NODATA transparan). Bila DEM belum ada, DSM otomatis dibangun dulu. Bila ada batas luar/dalam di dock **Batas**, ortho dipotong sesuai batas.

**Perkiraan waktu.** 24 foto: 1–4 menit.

**Membaca hasil.** Console: `Ortomosaik selesai dibangun! Resolusi: W×H piksel.` Tab Ortho menampilkan lapisan **Orthomosaic**. Periksa: (1) tidak ada pergeseran jalan di batas strip terbang, (2) tidak ada tepi ganda pada atap, (3) tepi survei transparan. Gunakan **Maps** untuk membandingkan dengan basemap.

**Kesalahan umum**

| Gejala | Solusi |
| :-- | :-- |
| *Model Elevasi Digital (DEM) belum dibuat* (fallback) | Jalankan tahap 7 atau biarkan ortho membangun DSM otomatis dari awan titik |
| Jalan patah / bergeser di seam | Kamera tidak selaras sempurna; jalankan Optimasi Kamera dengan GCP lalu bangun ulang DEM dan ortho |
| Bangunan tinggi "rebah" | Ortho memakai DSM; ini efek relief wajar. Gunakan DTM hanya untuk *true ortho* bila Anda menerima artefak di tepi bangunan |
| Warna belang antar strip | Pencahayaan berubah saat terbang; penyeimbang warna hanya mengoreksi frekuensi rendah |

---

## 4.11 Bangun Panorama 360°

**Menu:** Alur Kerja → **9. Bangun Panorama 360°…** · **Dialog:** *Bangun Panorama 360°* · **Tombol:** **Bangun Panorama**

| Label | Pilihan | Bawaan |
| :-- | :-- | :-- |
| **Proyeksi Geometri** | centang **Bola Sferis (360x180°)** | aktif |
| **Resolusi** | 2048 × 1024 px (tetap) | — |

Menjahit foto-foto terselaras dari satu pusat rotasi menjadi citra *equirectangular*. Berguna untuk foto yang diambil dari satu titik (drone diam berputar), bukan untuk blok pemetaan. Prasyarat: ≥ 2 kamera selaras. Node **Panorama** menampilkan ukuran piksel.

---

## 4.12 Sejajarkan Chunk (Sim3) dan Gabungkan Chunk

**Menu:** Alur Kerja → **10. Sejajarkan Chunk (Sim3)…** dan **11. Gabungkan Chunk…**

Keduanya memerlukan **≥ 2 chunk** (klik kanan Workspace → **Tambah Chunk**, lalu tambah foto ke chunk baru).

**Penyelarasan Chunk** — dialog *Penyelarasan Chunk*, tombol **Selaraskan Chunk**:

| Label | Pilihan |
| :-- | :-- |
| **Chunk Referensi (Acuan)** | kotak pilihan chunk yang dijadikan acuan |
| **Metode Penyelarasan** | *Marker / Camera Based (Umeyama Sim3)* — transformasi kesamaan 7-parameter (skala, rotasi, translasi) dari marker bersama atau kamera |

**Penggabungan Chunk** — dialog *Penggabungan Chunk*, tombol **Gabungkan Chunk**:

| Label | Nilai |
| :-- | :-- |
| **Nama Chunk Baru** | teks, bawaan `Merged Chunk` |
| **Elemen yang Digabung** | *Cameras, Markers, Points, 3D Mesh* |

Setelah menggabungkan, bangun ulang DEM dan ortho pada chunk gabungan. Dalam Proses Batch, kedua tahap dilewati otomatis bila hanya ada satu chunk.

---

## 4.13 Optimasi Kamera (SBA)

**Menu:** Alat → **Optimasi Kamera (SBA)…**; tombol **Optimasi Kamera & Kalibrasi Sensor (SBA)** di dock Reference; **Optimize Calibration (SBA)** di Properties; klik kanan chunk → **Optimasi Kamera…**

**Tujuan.** Menjalankan ulang bundle adjustment Levenberg-Marquardt dengan memasukkan pengamatan GCP berbobot (σ XY/Z) untuk menyempurnakan panjang fokus, titik utama, distorsi radial/tangensial, dan pose kamera, serta menghitung residual GCP dan checkpoint.

Tidak ada dialog parameter. Prasyarat: ≥ 2 kamera selaras; untuk manfaat penuh, marker **Control** tersemat pada ≥ 2 foto masing-masing ([§3.6](/TW-Photogram-Docs/panduan-pengguna/03-memulai-proyek/#36-menandai-gcp-pada-foto)). Checkpoint tidak dipakai dalam *fitting* sehingga statistiknya independen.

**Membaca hasil.** Tabel Marker: **dX dY dZ (cm)**, **Total**; pil **Total GCP RMSE**; baris **Checkpoint:**. Properties → **GCP Accuracy** dan **Reprojection**. Kartu Camera Calibration berubah.

⚠️ Setelah optimasi, **bangun ulang** awan titik, DEM, dan ortho — produk lama dibuat dengan pose kamera sebelum optimasi. Referensi elevasi juga ditandai kedaluwarsa.

---

## 4.14 Proses Batch (Otomatis)

**Menu:** Alur Kerja → **12. Proses Batch (Otomatis)…** · **Dialog:** *Proses Batch (Otomatis)*

Menjalankan rangkaian tahap tanpa campur tangan — ideal untuk diproses semalam.

| Kontrol | Fungsi |
| :-- | :-- |
| **+ Tambah Alur Kerja…** | Membuka *Tambah Tahap Alur Kerja ke Batch*: pilih **Pilihan Tahap Alur Kerja** dan **Pengaturan Khusus Tahapan** (Akurasi/batas titik untuk Align; Kualitas & Filter Kedalaman untuk Awan Titik; Ukuran Sel & Jarak Maks untuk Klasifikasi; Ukuran Tekstur; Tingkat LOD; **Kustomisasi Resolusi Manual** untuk DEM; dsb.) |
| **Urutkan Sesuai Tahapan** | Mengurutkan antrean menurut ketergantungan fotogrametri |
| **Muat Alur Kerja Standar (11 Tahap)** | Mengisi antrean 1 → 11 (tanpa Klasifikasi dan Optimasi; tambahkan manual bila perlu) |
| **Kosongkan Antrean** | Menghapus semua tahap |
| `^` / `v` / **Hapus** | Mengatur urutan dan menghapus tahap |
| **Mulai Proses Batch** | Aktif bila ada foto, antrean tidak kosong, dan tidak ada tugas lain berjalan. Antrean selalu diurutkan otomatis sebelum mulai |

Bila urutan melanggar ketergantungan, banner merah **Pelanggaran Urutan Alur Kerja Terdeteksi** muncul dengan tombol **Urutkan Otomatis (Perbaiki Urutan Sekarang)**. Bila proyek belum punya foto, banner kuning **Belum Ada Foto Drone Dalam Proyek (0 Foto)** menawarkan **+ Muat Data Sampel Drone (24 Foto)**.

Selama berjalan, dialog progres menampilkan **Antrean Batch Aktif**, **Proses Berjalan**, **Progres Keseluruhan Batch**, dan tombol **Batalkan Batch**. Tahap yang tidak mungkin (laser scan tanpa data, align/merge chunk dengan satu chunk) dilewati dengan catatan `[Batch] Dilewati …` tanpa menghentikan antrean.

💡 Urutan batch yang disarankan untuk pemetaan standar: Sejajarkan Foto → Bangun Titik Awan → Klasifikasi Titik Tanah → Bangun DEM → Bangun Ortomosaik (→ Bangun Model 3D → Bangun Tekstur bila perlu 3D).

---

**Langkah berikutnya:** pelajari opsi DEM lebih dalam, buat kontur dan peta lereng di [Bab 5 — DEM, kontur & lereng](/TW-Photogram-Docs/panduan-pengguna/05-dem-kontur-lereng/).
