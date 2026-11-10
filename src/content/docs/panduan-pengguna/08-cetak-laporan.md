---
title: "Bab 8 — Cetak Lembar Peta dan Laporan"
description: "Apa yang akan Anda lakukan: membuat lembar peta kartografis bergaya BIG/RBI dan laporan survei lengkap berstandar ASPRS 2014 / SNI 8202:2015 / ISO 19115-1 d..."
---

**Apa yang akan Anda lakukan:** membuat lembar peta kartografis bergaya BIG/RBI dan laporan survei lengkap berstandar ASPRS 2014 / SNI 8202:2015 / ISO 19115-1 dalam PDF vektor, menyimpan halaman sebagai PNG, membuat infografis ringkasan, serta laporan pemrosesan HTML/Markdown.

---

## 8.1 Membuka Dialog

**Berkas → Cetak Lembar Peta / Laporan (PDF)…** membuka jendela **Cetak Lembar Peta / Laporan** (panel pengaturan di kiri, pratinjau halaman di kanan). Dialog yang sama terbuka bila Anda memilih ekstensi `.pdf` pada **Buat Laporan Survei (PDF/MD)…** (Console: *Laporan PDF dibuat lewat dialog Cetak: pilih 'Laporan lengkap' lalu Render → Simpan PDF.*).

Prasyarat: chunk dengan origin geodetik (foto ber-GPS yang sudah selaras). Lembar DEM memerlukan DEM, lembar Ortho memerlukan ortomosaik, lembar lereng memerlukan DEM, lembar bahaya banjir memerlukan hasil simulasi genangan yang masih aktif di dock Genangan.

## 8.2 Pengaturan

### Jenis Dokumen

| Kontrol | Pilihan |
| :-- | :-- |
| Mode | **Lembar peta** (satu halaman) · **Laporan lengkap** (multi-halaman) |
| **Bahasa** | **Indonesia** · **English** — semua teks lembar/laporan |

### Identitas

| Kolom | Isi | Bawaan |
| :-- | :-- | :-- |
| **Judul** | Judul peta/laporan | *Peta Model Elevasi Digital* |
| **Subjudul** | | nama chunk |
| **Instansi** | Organisasi pelaksana | — |
| **Pembuat** | Nama surveyor/operator | — |
| **Kontak** | Email/telepon | — |
| **No. lembar** | Nomor lembar | `01` |
| **Tanggal survei** | | tanggal EXIF foto paling awal (YYYY-MM-DD) |
| **Logo** | **Pilih…** PNG/JPG, **Hapus**; teks *bawaan* bila tidak ada | logo TW Photogram |

Jika dock Batas memuat lapisan administrasi, baris *Lokasi (dari batas administrasi): Kecamatan X, Kabupaten Y* tampil dan dipakai sebagai blok lokasi; bila tidak ada, CRS chunk yang dipakai.

### Lembar Peta

| Kontrol | Pilihan | Bawaan |
| :-- | :-- | :-- |
| **Kertas** | A4 · A3 · A2 · A1 · A0 · Letter; **Lanskap** / **Potret** | A3 Lanskap |
| **Lapisan** (mode Lembar peta) | **DEM** · **Ortho** · **Lereng** · **Bahaya banjir** (nonaktif bila datanya belum ada) | DEM |
| **Skala** | centang **otomatis** atau nilai tetap `1 : N` (100–250 000) | otomatis |
| **Overlay** | **Kontur** · **Batas wilayah** | keduanya aktif |

Skala otomatis memilih yang terkecil dari deret 1:500, 1 000, 2 000, 2 500, 5 000, 10 000, 20 000, 25 000, 50 000 yang memuat seluruh extent tanpa meregangkan. Interval grid dan skala grafis mengikuti skala terpilih. **Kontur** memakai lapisan kontur pertama yang terlihat di Shapes; **Batas wilayah** memakai semua lapisan areal yang terlihat (kecuali kontur dan poligon bahaya).

### Laporan (Mode Laporan Lengkap)

| Kontrol | Fungsi |
| :-- | :-- |
| **Kertas teks** | Ukuran halaman teks (bawaan A4); lembar peta di dalam laporan memakai ukuran/orientasi dari bagian LEMBAR PETA |
| **Sertakan lembar kemiringan lereng** | Menambah lembar lereng (kelas FAO: 0–2° datar … > 45° terjal) |
| **Sertakan lembar bahaya banjir** | Menambah lembar `FLOOD-01` (aktif bila ada hasil simulasi) |
| **Abstrak** | Teks bebas (metadata ISO 19115-1) |
| **Kendala / lisensi penggunaan** | Teks bebas (metadata ISO 19115-1 *constraints*) |

## 8.3 Render dan Simpan

1. Klik **Render** (menjadi **Render ulang** setelah hasil ada). Dokumen dibangun di thread latar (*Merender…*); info `N halaman, PDF x,x MB` muncul saat selesai.
2. Navigasi pratinjau dengan **◀ ▶** dan label *Halaman i / N*. Mengubah pengaturan apa pun menandai *Pengaturan berubah — render ulang* dan menonaktifkan tombol simpan.
3. **Simpan PDF…** — nama bawaan dari judul; penulisan atomik lewat berkas sementara.
4. **Simpan PNG halaman…** — halaman aktif dirender ulang pada 300 dpi (bukan tangkapan layar pratinjau).

Pratinjau raster dan PDF memakai daftar primitif yang sama, sehingga apa yang tampil persis yang tercetak. Teks PDF dapat dipilih/dicari (font tertanam Ubuntu Light/Bold); kontur, batas, dan GCP digambar sebagai vektor.

## 8.4 Elemen Lembar Peta (Konvensi BIG / RBI)

| Elemen | Keterangan |
| :-- | :-- |
| Garis tepi (*neat line*) dengan **grid UTM** | Garis grid tiap interval skala, label `472 100 mE / 9 654 700 mN`; konvergensi meridian dihormati (grid dihitung lewat UTM → geodetik → ENU) |
| Graticule lintang/bujur | Tanda DMS di dalam bingkai |
| **Skala numerik dan grafis** | Dari deret standar |
| Panah utara grid | Dengan nilai konvergensi meridian |
| **Legenda** | Ramp elevasi (kontinu/berkelas), kontur indeks/antara, batas, GCP, NODATA, kelas lereng/bahaya |
| Peta inset lokasi | Posisi survei |
| Blok sistem referensi | Datum horizontal, zona UTM/EPSG, datum vertikal (dari Kalibrasi Elevasi) |
| Blok akurasi | Kelas ASPRS 2014 (RMSE/NVA/VVA) dan kelas SNI 8202:2015 untuk skala lembar |
| Sumber, tanggal survei & terbit, instansi, logo, versi perangkat lunak | |

## 8.5 Isi Laporan Lengkap

Halaman berurutan: **sampul** · **ringkasan eksekutif** · **metadata ISO 19115-1** (identifikasi, extent WGS 84 + UTM, sistem referensi, *lineage*, DQ_PositionalAccuracy per ISO 19157) · **peralatan & kalibrasi kamera** (kurva distorsi radial Brown–Conrady) · **parameter pemrosesan** · **akurasi posisi** (tabel GCP/checkpoint, RMSE, NVA = 1,96·RMSEz, horizontal 95 % = 1,7308·RMSEr, Tabel B.5/B.6 ASPRS 2014, kelas CE90/LE90 SNI 8202:2015) · **lembar DEM** (+ lereng, + bahaya banjir) · **lembar ortomosaik** · **lampiran kamera**.

Nilai RMSE memakai statistik marker yang sama dengan dock Reference dan laporan HTML; tanpa GCP/checkpoint, bagian akurasi menyatakan *Belum dievaluasi* — tidak pernah angka nol buatan.

### Cara Membaca Kelas Akurasi

| Standar | Rumus | Kelas |
| :-- | :-- | :-- |
| **ASPRS 2014** vertikal | RMSEz (cm) pada area tak bervegetasi; NVA = 1,96 × RMSEz | Kelas = nilai RMSEz terkecil dari deret baku (mis. 5, 10, 15, 20 cm…) yang ≥ RMSEz terukur |
| **ASPRS 2014** horizontal | RMSEr = √(RMSEx² + RMSEy²); 95 % = 1,7308 × RMSEr | Kelas terkecil yang 1,414 × kelas ≥ RMSEr |
| **SNI 8202:2015** | CE90 = 1,5175 × RMSEr; LE90 = 1,6499 × RMSEz. Interval kontur = penyebut skala / 2500 m. Batas kelas 1/2/3: horizontal 0,2/0,3/0,5 mm × skala; vertikal 0,5/0,75/1,25 × interval kontur | Contoh 1:5 000 → kelas 1/2/3 = 1,0 / 1,5 / 2,5 m horizontal & vertikal. Kelas yang dipenuhi **kedua** komponen; *tidak memenuhi* bila kelas 3 pun gagal |

💡 Jika laporan menunjukkan kelas SNI yang lebih buruk dari harapan, periksa dulu apakah skala tetap terlalu besar (1:500 menuntut CE90 ≤ 10 cm) dan apakah checkpoint tersebar merata.

## 8.6 Infografis Ringkasan

**Berkas → Buat Infografis Ringkasan…** membuka **Generate Infografis** (*Ringkasan visual survei · A4 lanskap · 3508 × 2480 px · 300 dpi*). Memerlukan DEM dan ortomosaik; bila belum ada, dialog menampilkan langkah **Build DEM** / Build Orthomosaic.

| Kontrol | Fungsi |
| :-- | :-- |
| **Judul** | bawaan nama proyek |
| **Lokasi**, **Pembuat** | teks bebas |
| **Logo (opsional)** → **Pilih PNG / JPEG…**, **Hapus** | |
| **Render ulang** | Pratinjau dirender otomatis setelah perubahan form; hanya pratinjau terbaru yang dapat disimpan (*Preview kedaluwarsa — tunggu render baru sebelum menyimpan*) |
| **Simpan PNG…** / **Simpan PDF…** | Dari halaman render yang sama; PDF memakai kompresi lossless dan teksnya bagian dari gambar |
| **Batalkan** | Menghentikan penerimaan hasil pekerjaan |

Label tinggi di infografis adalah **tinggi relatif terhadap origin ENU**, bukan tinggi laut. Luas ortho dihitung dari piksel beralpha > 0 dikalikan luas sel.

## 8.7 Laporan Pemrosesan HTML / Markdown

**Berkas → Buat Laporan Survei (PDF/MD)…** → pilih filter *Report (HTML / Markdown)* dan ekstensi `.html`, `.md`, atau `.txt`. Laporan ditulis di thread latar dari snapshot chunk: parameter pemrosesan, statistik kamera, GSD, luas, residual GCP/checkpoint, selisih DEMNAS. Cocok sebagai lampiran teknis cepat; untuk dokumen resmi gunakan PDF.

## 8.8 Render dari Baris Perintah

Untuk otomatisasi, contoh program berikut merender dari proyek tersimpan tanpa membuka GUI:

```bash
cargo run --release --example render_report -- proyek.twp keluaran
# menghasilkan keluaran.sheet.pdf dan keluaran.report.pdf

cargo run --release --example render_infographic -- proyek.twp keluaran
```

---

**Langkah berikutnya:** buat visualisasi 3D fotorealistik di [Bab 9 — Gaussian Splatting](09-gaussian-splatting.md), atau lompat ke [Bab 10](10-ekspor-interoperabilitas.md) untuk membawa data ke QGIS/CAD.
