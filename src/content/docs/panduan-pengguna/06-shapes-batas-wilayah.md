---
title: "Bab 6 — Shapes dan Batas Wilayah"
description: "Apa yang akan Anda lakukan: membuka dock Batas, mengimpor lapisan vektor, mengunduh batas administrasi resmi, menggambar poligon di peta, memberi peran..."
---

**Apa yang akan Anda lakukan:** membuka dock **Batas**, mengimpor lapisan vektor, mengunduh batas administrasi resmi, menggambar poligon di peta, memberi peran batas luar/dalam, memotong DEM, menghitung statistik zonal, dan mengekspor lapisan.

---

## 6.1 Konsep Shapes

Setiap chunk membawa daftar **Shapes** (lapisan vektor) seperti Metashape. Sebuah lapisan berisi fitur (poligon, garis, titik) dengan atribut dan CRS. Lapisan dipakai untuk:

- **memotong** DEM, ortomosaik, dan domain simulasi genangan (peran *Batas luar* mempertahankan bagian dalam, *Batas dalam* membuat lubang — sama dengan atribut *Boundary type* Metashape dan `gdalwarp -cutline`);
- **melabeli** wilayah administrasi di peta dan lembar peta;
- **menampung** produk turunan (kontur, poligon bahaya banjir);
- **statistik zonal** (luas, elevasi, volume galian/timbunan);
- **memotong model Gaussian** ([Bab 9](09-gaussian-splatting.md)).

Hanya tiga CRS yang diterima: **WGS 84 lon/lat** (EPSG:4326), **WGS 84 / UTM** (EPSG:326xx/327xx), dan **ENU lokal** (meter survei). CRS lain ditolak saat impor dengan pesan eksplisit — reproyeksikan dulu di QGIS.

## 6.2 Membuka Dock Batas

Tab **Ortho** → tombol **Batas** di sub-toolbar (tooltip: *Shapes & batas wilayah: impor/unduh/gambar poligon, potong DEM*), atau tab **Batas** di header dock kanan, atau **Berkas → Impor Shapes…** / **Ekspor Shapes…**. Dock ini hanya tampil saat tab Ortho aktif.

Bagian atas dock memperlihatkan spinner + nama proses (mis. *Membaca lapisan vektor…*) dengan tombol **Batalkan**, pesan kesalahan merah, dan info terakhir (mis. *Lapisan 'desa' dimuat: 3 fitur*).

## 6.3 Impor Lapisan Vektor

Format: **GeoJSON, Shapefile (.shp + .dbf + .prj), KML/KMZ**.

| Kontrol | Fungsi |
| :-- | :-- |
| **CRS bila file tidak menyebut:** *Dari file (.prj / GeoJSON)* · *WGS 84 lon/lat* · *WGS 84 / UTM* | CRS asumsi bila berkas tidak memuat informasi CRS. Untuk UTM, atur **zona** 1–60 dan centang **Selatan** |
| **Impor file…** | Memilih berkas; lapisan diberi nama sesuai nama berkas |

💡 GeoJSON menurut RFC 7946 selalu WGS 84. Shapefile tanpa `.prj` harus Anda beri CRS di sini; salah zona UTM akan menempatkan poligon ratusan kilometer dari survei.

## 6.4 Batas Wilayah Administrasi

Mengunduh batas resmi yang memotong area survei (teks: *Unduh batas resmi yang memotong area survei (BIG RBI, geoBoundaries, GADM)*).

| Kontrol | Pilihan |
| :-- | :-- |
| Penyedia | **BIG (Indonesia)** — RBI, ArcGIS REST · **geoBoundaries** — dunia, CC BY 4.0 · **GADM** — dunia, akademik/non-komersial · **ArcGIS REST** generik |
| Level | BIG: **Provinsi**, **Kabupaten/Kota**, **Kecamatan** (bawaan), **Desa/Kelurahan** (*Negara (tidak tersedia)*). geoBoundaries: ADM0–ADM4. GADM: Level 0–4 |
| **Nama (opsional)** | Filter nama wilayah |
| **ISO3** | Kode negara untuk geoBoundaries/GADM (bawaan `IDN`); tidak tampil untuk BIG |
| **Cari wilayah yang memotong survei** | Mencari dalam kotak pembatas survei (DEM → ortho → kamera selaras). Memerlukan origin geodetik (*Chunk belum punya origin geodetik; align foto ber-GPS dulu*) |

Hasil pencarian tampil sebagai daftar `Nama — induk, induk` dengan tombol **Tambahkan** per kandidat; atribusi penyedia tampil di bawahnya. Unduhan dibatasi ukurannya dan di-cache di direktori cache aplikasi, sehingga membuka proyek tidak mengunduh ulang.

Lapisan administrasi yang dimuat otomatis dipakai sebagai baris **Lokasi (dari batas administrasi)** di dialog cetak ([Bab 8](08-cetak-laporan.md)).

## 6.5 Gambar Poligon di Peta

1. Klik **Mulai menggambar**.
2. Klik di peta Ortho/DEM untuk menambah titik (*Klik di peta untuk menambah titik; minimal 3 titik.*). Peta menampilkan garis hijau dan teks *Menggambar poligon: N titik — klik peta untuk menambah*.
3. **Hapus titik terakhir** membatalkan klik terakhir; **Batal** membuang gambar.
4. **Selesai** (aktif bila ≥ 3 titik) menyimpan lapisan **Poligon N**. Poligon dinormalisasi dan divalidasi; bila chunk punya origin geodetik, poligon disimpan dalam WGS 84 sehingga tetap benar setelah penyelarasan ulang dan dapat diekspor.

💡 Gambar poligon langsung di lapisan **DEM** dengan gaya **Hillshade** untuk melihat tepi cakupan yang bersih.

## 6.6 Lapisan

Setiap lapisan tampil sebagai kartu dengan:

| Kontrol | Fungsi |
| :-- | :-- |
| kotak centang | Tampil/sembunyi di peta |
| nama (klik) | Memilih lapisan (disorot) |
| `N fitur · CRS` | Informasi |
| **Peran:** *Tidak memotong* · *Batas luar* · *Batas dalam (lubang)* | Peran pemotongan. Di peta: batas luar oranye, batas dalam merah, lainnya biru |
| `± m buffer` (−1000…1000) | Tooltip: *Positif memperluas, negatif menyempitkan batas saat memotong* — dilatasi/erosi cakram Euklides pada resolusi raster |
| **Label dari:** *otomatis* / nama atribut | Atribut yang dipakai sebagai label peta; kontur memakai `elevation` |
| **Statistik zonal** | Lihat §6.8 |
| **Ekspor…** | GeoJSON, Shapefile, KML (WGS 84) atau DXF (ENU meter) |
| **Hapus** | Menghapus lapisan |

Centang **Label** di judul bagian menyalakan/mematikan semua label.

**Aturan masker pemotongan:** `masker = (∪ Batas luar, ter-buffer) ∧ ¬(∪ Batas dalam, ter-buffer)`. Tanpa batas luar, semua dipertahankan kecuali lubang batas dalam.

## 6.7 Potong Raster dengan Batas

Teks: *Sel di luar batas luar / di dalam batas dalam menjadi NODATA (seperti gdalwarp -cutline).*

| Kontrol | Fungsi |
| :-- | :-- |
| **Semua sel tersentuh** | `ALL_TOUCHED`: sel yang disentuh garis batas ikut dipertahankan (bukan hanya sel yang pusatnya di dalam) |
| **Pangkas extent** | `-crop_to_cutline`: membuang baris/kolom yang seluruhnya NODATA dan menghitung ulang batas |
| **Balik (simpan luar)** | Membalik masker |
| **Potong DEM sekarang** | Aktif bila ada lapisan berperan batas dan DEM ada (tooltip bila nonaktif: *Tandai minimal satu lapisan sebagai batas luar/dalam dan buat DEM dulu*). **Destruktif**: DEM diganti |
| **Batalkan potongan** | Satu langkah undo DEM |

Catatan di bawahnya: *Build DEM/Ortho juga memakai batas ini otomatis bila opsi 'Potong sesuai batas' aktif.* — pemotongan saat **Bangun DEM** / **Bangun Ortomosaik** bersifat non-destruktif (produk dibangun lalu dimasker).

Setelah memotong DEM, simulasi genangan dan laporan DEMNAS yang lama menjadi kedaluwarsa.

## 6.8 Statistik Zonal

Klik **Statistik zonal** pada lapisan berpoligon (fitur areal pertama dipakai). Memerlukan DEM (*Belum ada DEM untuk statistik zonal*). Hasil tampil di bawah daftar lapisan:

```
<nama fitur>
Luas      x.xxx ha (N sel)
Elevasi   min … / rata … / maks … m
Simpangan … m
Volume    +… m³ di atas datum, −… m³ di bawah
```

Kontrol **Datum volume** (m) menetapkan bidang acuan untuk volume galian/timbunan; ubah lalu klik ulang **Statistik zonal**. Elevasi dalam kerangka ENU relatif (bukan tinggi laut) kecuali Anda membaca ekspor DEM berdatum.

## 6.9 Ekspor Lapisan

Tombol **Ekspor…** di kartu lapisan membuka dialog simpan dengan filter **GeoJSON**, **Shapefile**, **KML**, **DXF**. Format ditentukan dari ekstensi:

| Format | CRS keluaran | Catatan |
| :-- | :-- | :-- |
| `.geojson` | WGS 84 (RFC 7946) | Dibaca QGIS, Global Mapper, web |
| `.shp` | menulis `.shp/.shx/.dbf/.prj/.cpg` | CRS mengikuti lapisan |
| `.kml` | WGS 84 | Google Earth |
| `.dxf` | ENU lokal (meter) | Untuk AutoCAD; satukan dengan DEM XYZ UTM hanya setelah transformasi, lihat [Bab 10](10-ekspor-interoperabilitas.md#1010-autocad--cad) |

Poligon bahaya banjir dapat ditambahkan ke Shapes dari dock **Genangan** ([Bab 7](07-simulasi-genangan.md#78-hasil--playback)).

---

**Langkah berikutnya:** gunakan DTM dan batas Anda untuk menjalankan [Bab 7 — Simulasi genangan](07-simulasi-genangan.md).
