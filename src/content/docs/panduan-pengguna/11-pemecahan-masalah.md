---
title: "Bab 11 — Pemecahan Masalah"
description: "Apa yang akan Anda lakukan: mendiagnosis kegagalan dan hasil aneh dengan membaca Console, mengenali pesan yang dikeluarkan aplikasi, dan menerapkan perbaika..."
---

**Apa yang akan Anda lakukan:** mendiagnosis kegagalan dan hasil aneh dengan membaca Console, mengenali pesan yang dikeluarkan aplikasi, dan menerapkan perbaikan yang sudah terbukti.

💡 Aturan pertama: **buka dock Console**. Setiap tahap, ekspor, impor, dan pekerja latar menulis hasil atau kesalahan di sana dengan tanda waktu; baris kesalahan diberi pil **ERR**. Aplikasi tidak pernah menelan kesalahan secara diam-diam atau mengganti hasil dengan nilai dummy.

---

## 11.1 Memuat Foto dan Proyek

| Pesan / gejala | Penyebab | Solusi |
| :-- | :-- | :-- |
| `Berhasil memuat N foto drone (M dengan GPS valid)` dengan M < N | Sebagian foto tanpa tag GPS | Periksa Tampilan Tabel; foto tanpa GPS masih bisa selaras lewat kecocokan fitur tetapi memperlemah seleksi pasangan. Nonaktifkan bila banyak |
| Banner **Ada foto proyek yang tidak ditemukan.** | Proyek dipindah tanpa fotonya | Klik **Relink Photo Folder…**; log `Relink: a foto ditemukan, b hilang, c ambigu`. Nama ganda ("ambigu") harus diselesaikan manual dengan memberi nama unik |
| `Error: foto tidak ditemukan: … Gunakan Relink Photo Folder.` | Idem saat membangun tekstur/Gaussian | Idem |
| Foto dari dua drone dalam satu chunk, reproyeksi besar | Kalibrasi tunggal per chunk | Satu kamera per chunk; gabungkan di tahap 10–11 |

## 11.2 Penyelarasan (Align) Gagal atau Sebagian

| Gejala | Penyebab | Solusi |
| :-- | :-- | :-- |
| Dialog fallback *Chunk aktif belum memiliki cukup foto* | < 2 foto | Tambah foto |
| Banyak kamera **Tertunda** | Overlap < 60 %, permukaan seragam (air, pasir, atap logam), foto buram/gelap, perubahan skala besar (terbang naik-turun) | Nonaktifkan foto buram; terbang ulang dengan overlap 75/65 %; sertakan foto miring di tepi; untuk data zoom/ketinggian campuran, parameter bawaan (1 level piramida) kurang cocok |
| Jalur kamera benar tetapi model "cekung" (dome) | Panjang fokus kurang terkendala pada blok nadir datar | Tambah GCP + checkpoint, jalankan **Optimasi Kamera (SBA)**; sedikit foto miring 10–15° sangat membantu |
| Reproyeksi > 2 px | EXIF fokus/dimensi salah, rolling shutter, pose GPS buruk | Periksa Properties → Camera Calibration; optimasi dengan GCP |
| Kamera "terbang" jauh dari lainnya | Kecocokan salah pada pola berulang | Nonaktifkan kamera tersebut (klik kanan → **Nonaktifkan Kamera**), jalankan ulang |
| Proses berhenti dengan `Peringatan: … tidak dijalankan karena task … masih berlangsung` | Tahap lain sedang berjalan | Tunggu atau **Batal** di dialog progres |
| `Reference processing is running; wait or cancel before changing the pipeline.` | Impor referensi/kalibrasi elevasi sedang berjalan | Tunggu atau batalkan di dialognya |

## 11.3 Awan Titik dan GPU

| Gejala | Solusi |
| :-- | :-- |
| Console melaporkan adaptor GPU tidak didukung / `depth: camera N failed` | Perbarui driver. Untuk memaksa CPU: jalankan dengan `TW_DEPTH_BACKEND=cpu` (lebih lambat; aplikasi **tidak** beralih otomatis agar kegagalan GPU tidak tersembunyi) |
| Awan titik kosong di air/kaca | Normal — tidak ada tekstur untuk dicocokkan; DEM mengisi lubang dengan TIN |
| Noise di atas permukaan ("awan debu") | Naikkan **Filter Kedalaman** ke Moderate/Aggressive; klasifikasi memberi kelas 7 pada titik rendah |
| Memori habis / sangat lambat | Turunkan **Kualitas** (0,5–1,0); proses per chunk; tutup aplikasi lain. Kualitas 2 ≈ 4× memori Kualitas 1 |

## 11.4 DEM

| Gejala | Penyebab | Solusi |
| :-- | :-- | :-- |
| **DEM berlubang** (NODATA di tengah) | Interpolasi *Disabled*; atau lubang berada di luar *convex hull* titik (tepi survei, danau besar) | Pakai **Enabled** (isi dalam hull) atau **Extrapolated** (isi sampai tepi/batas). Untuk DTM, lubang besar berarti tidak ada titik kelas 2 di sana (bangunan luas/hutan) — ekstrapolasi atau terima NODATA |
| DTM gagal: *tidak cukup titik Ground* | Klasifikasi belum dijalankan atau ambang terlalu ketat | Jalankan **Klasifikasi Titik Tanah**; naikkan **Batas Jarak Kain** ke 0,5 m |
| Pola kotak/teras pada hillshade | Proyek lama dibangun dengan algoritme sebelumnya | **Proses Ulang Bangun DEM** — algoritme TIN + filter bilateral baru berlaku saat dibangun ulang |
| Tiang/spike tinggi | Pencilan awan titik | Naikkan filter kedalaman; bangun ulang |
| Tepi survei bergerigi | Masker cakupan kamera | Normal; gunakan **Batas luar** untuk tepi rapi |
| Resolusi lebih halus tidak menambah detail | Auto = 4×GSD adalah batas informasi peta kedalaman | Tingkatkan **Kualitas** awan titik, bukan resolusi DEM |
| Segitiga datar besar di area tanpa titik | TIN menjembatani celah | Normal; TIN tidak menciptakan detail yang tidak ada |

## 11.5 Datum dan Ketinggian

| Gejala | Penjelasan | Solusi |
| :-- | :-- | :-- |
| Laporan menyatakan datum **Belum dikonfirmasi** | **Tinggi kamera/sumber** masih *Unknown* | Buka **Kalibrasi Elevasi…**, pilih datum sesuai metadata survei. Ini keputusan Anda, bukan tebakan aplikasi |
| Elevasi DEM berbeda puluhan meter dari peta/DEMNAS | Tinggi EXIF relatif (titik lepas landas) atau ellipsoid vs geoid (undulasi 20–40 m di Indonesia) | Datum sumber yang benar + geoid EGM2008; bila tanpa GCP, gunakan **Analisis** DEMNAS lalu **Terapkan offset** |
| **Terapkan offset** nonaktif | Ada GCP Control aktif | Dengan GCP, DEMNAS hanya pembanding; akurasi absolut datang dari GCP |
| *Laporan kedaluwarsa; analisis ulang* | DEM, poligon, atau datum berubah | Klik **Analisis** lagi |
| *Input berubah; jalankan ulang* | Hasil pekerja dibuang karena proyek diubah saat berjalan | Jalankan lagi |
| Unduh DEMNAS timeout | Layanan BIG tidak merespons | Gunakan **Impor GeoTIFF DEMNAS…**; referensi lama tetap dipertahankan |
| Status selaras hilang setelah mengubah datum | Disengaja — pose kamera bergantung pada datum sumber | Jalankan **Sejajarkan Foto** lagi |

## 11.6 GCP dan Optimasi

| Gejala | Solusi |
| :-- | :-- |
| `Imported N references. Mark them in photos before Optimize Cameras.` tetapi residual `-` | Marker belum disematkan di foto. Lihat [§3.6](/TW-Photogram-Docs/panduan-pengguna/03-memulai-proyek/#36-menandai-gcp-pada-foto); minimal 2 foto per marker |
| Residual satu GCP jauh lebih besar | Salah klik target, atau koordinat lapangan salah/tertukar X-Y. Periksa **Proy**, sematkan ulang; ubah peran ke **Checkpoint** atau **Disabled** untuk menguji |
| Semua residual bias Z sama arah | Datum tinggi CSV ≠ datum sumber kamera. Set datum di dialog impor |
| RMSE bagus tetapi checkpoint buruk | Overfitting dengan GCP terlalu sedikit/terkumpul. Tambah GCP di tepi blok |
| Parameter kalibrasi berubah drastis setelah SBA | Normal bila foto hanya nadir; verifikasi dengan checkpoint |
| `Optimize Cameras: …` / `Optimization cancelled; original project retained` | Optimasi gagal atau dibatalkan; proyek asli tidak diubah |

## 11.7 Ortomosaik

| Gejala | Solusi |
| :-- | :-- |
| Jalan patah di seam | Pose kamera tidak konsisten → GCP + SBA → bangun ulang DEM dan ortho |
| Objek ganda (ghosting) pada objek bergerak | Kendaraan bergerak antar foto; normal pada mosaik label-map (hanya satu foto per area, jadi ghosting minimal). Pilih foto lain dengan menonaktifkan kamera |
| Bangunan tinggi miring/rebah | Ortho dari DSM memproyeksikan fasad. Terima untuk pemetaan, atau bangun dari DTM untuk tepi yang berbeda |
| Warna belang | Pencahayaan berubah; penyeimbang hanya memperbaiki frekuensi rendah |
| Tepi tidak transparan di GIS | Pastikan membaca band alpha; QGIS: *Transparency → Use alpha* |
| `Clip orthomosaic to boundary: …` | Batas tidak valid/di luar area | Periksa peran dan buffer lapisan |

## 11.8 Shapes, Batas, dan Unduhan

| Gejala | Solusi |
| :-- | :-- |
| CRS impor ditolak | Hanya WGS 84, UTM WGS 84, dan ENU lokal yang diterima; reproyeksikan di QGIS |
| Poligon muncul jauh dari survei | Zona UTM atau belahan bumi salah saat impor |
| *Chunk belum punya origin geodetik; align foto ber-GPS dulu* | Pencarian batas administrasi membutuhkan origin | Selaraskan foto dulu |
| *Belum ada DEM, ortho, atau kamera ter-align untuk menentukan area survei* | Idem | |
| Unduhan BIG/geoBoundaries/GADM gagal | Jaringan atau batas ukuran | Coba lagi; cache tersimpan di direktori cache aplikasi |
| **Potong DEM sekarang** nonaktif | Tidak ada lapisan berperan batas atau DEM | Set **Peran: Batas luar** |

## 11.9 Simulasi Genangan

Mulai dari [tutorial bergambar mapping_01](/TW-Photogram-Docs/panduan-pengguna/07-simulasi-genangan/#70-tutorial-bergambar-dari-foto-mapping_01-sampai-air-terlihat). Pada build macOS 0.1.1-alpha yang diuji, **Jalankan simulasi tidak otomatis menekan Play**.

| Gejala tampilan | Pemeriksaan dan solusi |
| :-- | :-- |
| Hasil selesai tetapi air tidak terlihat, Waktu 0 | Gulir dock kanan ke **HASIL & PLAYBACK**, tekan **▶** atau pilih **Kedalaman puncak**. |
| Tidak menemukan tombol Play | Gulir di dalam panel kanan, bukan di atas peta. Kontrol berada di bawah parameter. |
| Waktu bergerak di Maps tetapi air hilang | Maps belum menggambar overlay banjir. Gunakan **Ortho → Orthomosaic atau DEM**. |
| Tidak ada tetesan hujan | Visual tetesan belum tersedia; hujan masuk ke perhitungan, grafik menunjukkan intensitas. |
| Pembaruan berhenti setelah membuka Batas | Buka kembali dock **Genangan**; ini keterbatasan polling/playback UI yang diketahui. |
| Spinner masih berjalan | Hasil belum selesai. Estimasi waktu hanya perkiraan; sel 0 memakai resolusi DEM asli dan dapat sangat mahal. |


| Gejala | Solusi |
| :-- | :-- |
| Air "menggenang" di atas atap | Memakai DSM — bangun **DTM** |
| *Parameter berubah; jalankan ulang simulasi.* | Disengaja; hasil tidak boleh menyesatkan | Klik **Jalankan simulasi** |
| Estimasi menunjukkan ratusan MB / ribuan detik | Sel terlalu kecil | Naikkan **Ukuran sel** ke 1–3 m untuk eksplorasi |
| *Durasi hujan melebihi lama simulasi.* | Set **Durasi hujan** ≤ **Lama simulasi** |
| Lapisan **Kelas bahaya** nonaktif | Skema **Tidak ada** dipilih | Pilih ARR 2019 atau BNPB |
| Air tidak keluar dari domain | Batas tertutup (bawaan) | Centang **Air keluar batas grid** atau tetapkan **Elevasi air tetap di batas** |
| Residu neraca volume besar | Tidak seharusnya terjadi; laporkan sebagai bug dengan proyek `.twp` |

## 11.10 Cetak dan Laporan

| Gejala | Solusi |
| :-- | :-- |
| *Chunk belum punya origin geodetik; align foto ber-GPS dulu* | Lembar peta memerlukan referensi | Selaraskan |
| *Belum ada DEM* / *Belum ada ortomosaik* / *Belum ada hasil simulasi banjir* | Bangun produk yang diminta |
| Tombol simpan nonaktif | Pengaturan berubah setelah render | Klik **Render ulang** |
| Blok akurasi *Belum dievaluasi* | Tidak ada GCP/checkpoint dengan residual | Sematkan GCP dan jalankan SBA |
| Infografis: *DEM belum tersedia…* / *Ortomosaik belum tersedia…* | Bangun keduanya |

## 11.11 Gaussian Splatting

| Gejala | Solusi |
| :-- | :-- |
| *Trainer Brush tidak ditemukan* | Set `TW_BRUSH_EXECUTABLE` atau **Pilih binari Brush…**; pesan mencantumkan jalur yang dicoba |
| *Mesin Gaussian tidak ditemukan. Dataset tersimpan di …* | Latih dataset COLMAP itu dengan Brush secara terpisah, lalu **Buka Gaussian Splat** |
| Model tampak terbalik/miring | Sumbu atas PLY tanpa deklarasi | Ganti **Sumbu atas PLY tanpa deklarasi: Z / Y** di Alat Gaussian |
| Kabut/awan besar menutupi model | Aktifkan **Kurangi kabut** (pratinjau) atau **Buang splat terbesar** (permanen) |
| Operasi ditolak | Hasilnya akan kosong | Longgarkan parameter |
| `Gaussian: proses training terhenti tanpa hasil.` | Trainer crash | Periksa log di folder dataset; kurangi **Resolusi maks**/**Maks splat** |

## 11.12 Performa dan Memori

| Faktor | Dampak | Tips |
| :-- | :-- | :-- |
| Jumlah foto | Penyelarasan ≈ linier; pencocokan dibatasi 12 tetangga GPS | Pisahkan survei > 500 foto ke beberapa chunk |
| **Kualitas** awan titik | Waktu dan memori ≈ kuadrat terhadap faktor | 1,0 untuk pemetaan; 2,0 hanya bila perlu detail 3D |
| Resolusi DEM/ortho | Memori raster ≈ 1/res² | Biarkan auto (4×GSD) |
| Tekstur 8192 | VRAM besar | 2048–4096 |
| Simulasi genangan | ≈ 1/sel³ | Mulai dari sel 2 m |
| Tampilan DEM | Ubin ≤ 1024 px, maks 2 unggahan per frame | Tidak mengurangi resolusi; GUI tetap 60 FPS |
| Berkas `.twp` besar | Menyimpan semua produk | Hapus produk yang tidak perlu lewat klik kanan node (**Hapus Awan Titik**, **Hapus DEM**, dst.) sebelum arsip |

Semua tahap berjalan di thread latar dengan Rayon; GUI tidak membeku. Jika aplikasi terasa lambat merespons, periksa apakah dialog progres masih menunjukkan tahap aktif dan gunakan **Batal**.

## 11.13 Melaporkan Bug

Sertakan: versi (**Tentang TW Photogaram**), OS dan GPU/driver, cuplikan Console (**Console (N)** → salin teks), langkah reproduksi, dan bila memungkinkan proyek `.twp` kecil atau dataset sampel. Log kesalahan GPU, ekspor, dan unduhan semuanya ada di Console.

---

**Langkah berikutnya:** istilah yang belum jelas dapat dicari di [Bab 12 — Glosarium & referensi](/TW-Photogram-Docs/panduan-pengguna/12-glosarium-referensi/).
