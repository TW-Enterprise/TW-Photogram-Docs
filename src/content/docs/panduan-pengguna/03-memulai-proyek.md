---
title: "Bab 3 — Memulai Proyek"
description: "Apa yang akan Anda lakukan: membuat proyek, memasukkan foto udara, memeriksa metadata EXIF, menetapkan sistem koordinat (CRS) dan datum tinggi, mengimpor ti..."
---

**Apa yang akan Anda lakukan:** membuat proyek, memasukkan foto udara, memeriksa metadata EXIF, menetapkan sistem koordinat (CRS) dan datum tinggi, mengimpor titik kontrol tanah (GCP), menandainya di foto, lalu menyimpan proyek.


**Ingin menjalankan hujan dan genangan?** Ikuti [tutorial bergambar mapping_01 dari foto sampai Play](/TW-Photogram-Docs/panduan-pengguna/07-simulasi-genangan/#70-tutorial-bergambar-dari-foto-mapping_01-sampai-air-terlihat), dengan screenshot aplikasi macOS dan pemeriksaan hasil setiap tahap.

---

## 3.1 Persiapan Data di Lapangan

Kualitas hasil ditentukan sebelum aplikasi dibuka. Pastikan:

| Aspek | Nilai yang disarankan | Alasan |
| :-- | :-- | :-- |
| Tumpang tindih foto | ≥ 75 % maju, ≥ 65 % samping | SfM dan MVS membutuhkan ≥ 2 foto bertampalan untuk tiap titik tanah |
| Pola terbang | *Lawnmower* (bolak-balik) dengan heading berselang ≈ 180° | Aplikasi memasukkan yaw gimbal ke triangulasi dan bundle adjustment |
| Orientasi kamera | Nadir (tegak) | Mosaik ortho memilih foto paling nadir untuk tiap piksel |
| EXIF | Lintang, bujur, ketinggian, panjang fokus, dimensi gambar | Dipakai untuk seleksi pasangan, skala, GSD, dan luas survei |
| Format foto | JPG asli dari kamera (TIF/PNG juga didukung) | Pelatihan Gaussian membutuhkan JPG/PNG asli |
| GCP | ≥ 4–5 titik tersebar, diukur GNSS RTK/PPK, plus titik uji (checkpoint) independen | Akurasi absolut tidak bisa diklaim tanpa checkpoint |

⚠️ Ketinggian EXIF DJI sering berupa tinggi *relatif* terhadap titik lepas landas. Jangan menganggapnya tinggi absolut; lihat [§3.4](#34-menetapkan-crs-dan-datum-tinggi) dan [Bab 5](/TW-Photogram-Docs/panduan-pengguna/05-dem-kontur-lereng/#56-kalibrasi-elevasi-dan-demnas).

## 3.2 Membuat Proyek dan Menambah Foto

1. Jalankan aplikasi. Proyek baru berisi satu chunk kosong (**Chunk kosong (tambahkan foto untuk memulai)**).
2. Pilih **Berkas → Tambah Foto…** (dialog *Pilih Foto Drone*, filter *Foto Udara*: jpg, jpeg, tif, tiff, png) atau **Tambah Folder…** (*Pilih Folder Berisi Foto Drone*). Anda juga bisa menyeret folder atau berkas foto ke jendela.
3. Console mencatat `Mengimpor N foto & membaca metadata GPS EXIF...` lalu `Berhasil memuat N foto drone (M dengan GPS valid).`

Foto masuk ke chunk aktif. Untuk survei bertahap (beberapa penerbangan), buat chunk terpisah lewat klik kanan **Workspace → Tambah Chunk**, lalu gabungkan di tahap 10–11 ([Bab 4](/TW-Photogram-Docs/panduan-pengguna/04-alur-kerja/#412-sejajarkan-chunk-sim3-dan-gabungkan-chunk)).

💡 Untuk mencoba: jalankan dengan `--sample` atau klik **+ Muat Data Sampel Drone (24 Foto)** di dialog **Proses Batch**. Sampel memuat foto dan GCP sekaligus.

## 3.3 Memeriksa EXIF dan Kamera

- Dock bawah **Photos (N) → Tampilan Tabel** memperlihatkan Lintang, Bujur, Ketinggian (m), Fokus (mm), Dimensi untuk tiap foto. Baris `-` berarti tag tidak ada.
- Klik foto lalu buka dock kanan **Properties**: kartu metadata menampilkan **Dimensions**, **Focal Length**, **Coordinates**, **Altitude**, **Make / Model**.
- Kartu **Camera Calibration** menampilkan parameter Brown-Conrady awal (`f`, `cx, cy`, `K1 K2`, `P1 P2`) yang diturunkan dari EXIF; nilai ini disempurnakan oleh **Optimize Calibration (SBA)** setelah penyelarasan.
- Kartu **Survey Statistics** menampilkan **GSD Resolution** (cm/pix) dan **Survey Area** (ha) yang dihitung dari tinggi terbang rata-rata, panjang fokus, dan sebaran kamera.

Foto yang rusak atau tanpa EXIF tidak menghentikan impor; galatnya dicatat di Console. Nonaktifkan foto bermasalah lewat klik kanan kamera di Workspace → **Nonaktifkan Kamera** agar tidak ikut dalam penyelarasan.

## 3.4 Menetapkan CRS dan Datum Tinggi

### Sistem Koordinat Horizontal

**Alat → Pengaturan Referensi (CRS)…** (atau klik nilai **CRS:** di dock Reference) membuka *Reference Settings (Sistem Koordinat & CRS)*. Pilih salah satu preset:

| Preset | Wilayah Indonesia (acuan umum) |
| :-- | :-- |
| WGS 84 (EPSG:4326) | Geografis lintang/bujur |
| WGS 84 / UTM zone 47N (EPSG:32647) | Aceh, Sumut bagian barat |
| WGS 84 / UTM zone 48S (EPSG:32748) | Sumbar, Riau, Jambi, Sumsel, Kalbar |
| WGS 84 / UTM zone 49S (EPSG:32749) — **bawaan** | DKI Jakarta, Jabar, Jateng, DIY, Kalsel |
| WGS 84 / UTM zone 50S (EPSG:32750) | Jatim, Bali, Madura, NTB, Sulsel |
| WGS 84 / UTM zone 51S (EPSG:32751) | NTT, Sulut, Gorontalo, Maluku Utara |
| WGS 84 / UTM zone 52S (EPSG:32752) | Maluku, Papua Barat |
| WGS 84 / UTM zone 53S (EPSG:32753) | Papua Tengah / Pegunungan |
| WGS 84 / UTM zone 54S (EPSG:32754) | Merauke / Papua Selatan |

CRS ini dipakai untuk menampilkan Easting/Northing, metrik GCP, dan blok sistem referensi di lembar peta. Secara internal semua geometri disimpan dalam kerangka **ENU lokal** (East-North-Up, meter) yang berpusat di kamera referensi; ekspor memproyeksikan kembali ke WGS 84 atau UTM sesuai format ([Bab 10](/TW-Photogram-Docs/panduan-pengguna/10-ekspor-interoperabilitas/)).

### Datum Tinggi

**Alur Kerja → Kalibrasi Elevasi…** memuat dua pilihan penting yang sebaiknya ditetapkan **sebelum** penyelarasan:

- **Tinggi kamera/sumber** — datum ketinggian di EXIF: *Unknown / Belum dikonfirmasi* (bawaan), *WGS84 ellipsoid*, *EGM2008*, atau geoid khusus yang Anda impor.
- **Tinggi keluaran** — datum untuk ekspor DEM: *WGS84 ellipsoid*, *EGM2008*, *Local ENU (relative)*, atau geoid khusus.

Jika sumber memakai geoid, klik **Unduh geoid EGM2008** (memakai cakupan GPS foto, tidak perlu DEM) atau **Impor geoid…** (GTX / GeoTIFF). Dialog memperingatkan: *Mengubah datum sumber pada proyek terselaras memerlukan Align Photos ulang.* Rincian ada di [§5.6](/TW-Photogram-Docs/panduan-pengguna/05-dem-kontur-lereng/#56-kalibrasi-elevasi-dan-demnas).

⚠️ Selama datum sumber masih *Belum dikonfirmasi*, ekspor DEM tetap bisa dilakukan tetapi laporan menandai datum sebagai belum terkonfirmasi. Jangan menyerahkan DEM absolut dalam keadaan ini.

## 3.5 Mengimpor GCP

1. Siapkan CSV/TXT/TSV dengan kolom **label, X/lon, Y/lat, Z** (urutan kolom bisa diatur). Contoh `GCP_Coordinates.csv` sampel:

   ```
   Marker,Latitude,Longitude,Altitude,Local_X,Local_Y,Local_Z
   GCP01,-6.2085305,106.8458711,15.120,30.00,30.00,0.12
   ```

2. Pilih **Berkas → Impor Referensi (GCP CSV)…** (atau tombol **Impor GCP / Koordinat Referensi (CSV/TXT)** di dock Reference, atau seret CSV ke jendela). Dialog **Impor Referensi Survei** terbuka.
3. Atur:

   | Kontrol | Pilihan | Catatan |
   | :-- | :-- | :-- |
   | CRS | **Local ENU (m)**, **WGS84 longitude, latitude**, **WGS84 / UTM** (+ *UTM zone*, *Northern hemisphere*) | WGS84: X = longitude, Y = latitude. ENU lokal harus terikat origin proyek yang sama, jadi impor ENU hanya masuk akal setelah penyelarasan |
   | Datum tinggi | **Select height datum / Pilih datum tinggi**, **WGS84 ellipsoid**, **EGM2008**, geoid khusus | Tidak muncul untuk Local ENU (Z = ENU Up) |
   | **Sigma XY / Z (m)** | Ketelitian pengukuran GNSS | Dipakai sebagai bobot dalam bundle adjustment; RTK umumnya 0,02 / 0,03 m |
   | Peran | **Control / Kontrol**, **Checkpoint / Titik uji**, **Disabled / Nonaktif** | Checkpoint tidak ikut *fitting*; peran bisa diubah per marker di tabel Reference |
   | **Baris pertama judul kolom** | centang bila ada header | |
   | **Nomor kolom mulai 1: label, X/lon, Y/lat, Z** | empat angka | Untuk sampel WGS84: 1, 3, 2, 4 |

4. Klik **Impor dan ganti referensi**. Pesan `Imported N references. Mark them in photos before Optimize Cameras.` menandakan sukses. Seluruh baris diurai dulu; jika satu baris gagal, tidak ada marker yang diganti.

Marker tampil di node **Titik Kontrol (Marker)** Workspace dan di sub-tab **Marker (N)** dock Reference.

## 3.6 Menandai GCP pada Foto

Agar GCP memengaruhi solusi, setiap marker harus disematkan (pin) pada **minimal dua foto terselaras** dengan geometri triangulasi yang baik. Lakukan ini **setelah** Sejajarkan Foto agar Anda bisa memilih foto yang benar-benar melihat target.

1. Di dock Reference → **Marker (N)**, klik kanan marker → **Sematkan Marker di Foto**. Ini mengaktifkan **Mode Pin GCP** dan membuka tab Photo dengan marker tersebut sebagai target. Alternatif: klik kanan → **Filter Foto berdasarkan Marker** untuk menyaring dock Photos ke foto yang sudah/mungkin melihat marker.
2. Pilih foto di dock Photos (atau tekan `Spasi` untuk berpindah). Perbesar sampai target terlihat jelas (gulir berpusat pada kursor).
3. Klik tepat di pusat target. Console mencatat `Pinned marker 'GCP01' on DJI_0007 at (x, y)`.
4. Ulangi pada foto lain. Kolom **Proy** di tabel marker menunjukkan jumlah proyeksi.
5. Setelah semua marker tersemat, jalankan **Optimasi Kamera (SBA)** ([§4.13](/TW-Photogram-Docs/panduan-pengguna/04-alur-kerja/#413-optimasi-kamera-sba)). Kolom **dX dY dZ (cm)** dan **Total** terisi; pil **Total GCP RMSE:** menampilkan `n=… · RMSE Z … m · XY … m · 3D … m · bias Z … m`. Baris **Checkpoint:** menampilkan statistik titik uji secara terpisah.

💡 Tombol **Hitung Ulang Galat Residual Geodesi** menghitung ulang residual tanpa menjalankan optimasi.

⚠️ Mengubah peran atau σ marker di tabel membatalkan estimasi lama (`position` dikosongkan) dan menandai referensi elevasi kedaluwarsa. Jalankan optimasi lagi.

## 3.7 Menyimpan Proyek

**Berkas → Simpan Proyek (Ctrl+S)** → dialog *Simpan Proyek Pemetaan* → `.twp`. Simpan secara berkala, terutama sebelum tahap yang lama (awan titik, ortho). Proyek menyimpan jalur foto relatif bila memungkinkan; pindahkan proyek bersama folder fotonya.

Untuk membuka: **Berkas → Buka Proyek… (Ctrl+O)**, seret berkas `.twp` ke jendela, atau berikan jalurnya sebagai argumen peluncur.

---

**Langkah berikutnya:** proses foto Anda mengikuti [Bab 4 — Alur kerja 12 tahap](/TW-Photogram-Docs/panduan-pengguna/04-alur-kerja/), dimulai dari **1. Sejajarkan Foto (SfM)**.
