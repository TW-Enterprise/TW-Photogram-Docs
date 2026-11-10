---
title: "Bab 7 — Simulasi Genangan"
description: "Apa yang akan Anda lakukan: menjalankan simulasi genangan 2D di atas DTM hasil survei, memilih model dan parameter hidrologi yang masuk akal, menetapkan huj..."
---

**Apa yang akan Anda lakukan:** menjalankan simulasi genangan 2D di atas DTM hasil survei, memilih model dan parameter hidrologi yang masuk akal, menetapkan hujan dan sumber air, membaca lapisan hasil (kedalaman, kecepatan, waktu tiba, durasi, kelas bahaya), lalu mengekspornya ke GIS dan lembar peta.

⚠️ Simulasi ini adalah alat skrining berbasis DEM survei. Hasilnya bergantung pada kualitas DTM, parameter yang Anda masukkan, dan asumsi batas. Untuk desain struktur atau penetapan zona resmi, verifikasi dengan model hidraulik terkalibrasi dan data lapangan.

---

## 7.1 Prasyarat

1. **DTM** (Permukaan = *DTM — Ground*) — teks di dock: *Gunakan DTM (Ground) untuk hasil aliran yang benar.* DSM akan menahan air di atas atap dan tajuk.
2. Opsional: lapisan **Batas luar/dalam** di dock Batas untuk membatasi domain, dan poligon dengan atribut `manning_n`/`n`, `runoff`/`C`, `cn`, `impermeable` yang otomatis menjadi zona permukaan (*Domain dipotong oleh batas luar/dalam dari dock Batas; poligon dengan atribut … menjadi zona.*).
3. Buka tab **Ortho** → tombol **Genangan** (tooltip: *Buka analisis genangan; klik lagi untuk menyembunyikan lapisan*). Dock kanan berjudul **SIMULASI GENANGAN 2D — Atur hujan, sumber air, dan analisis aliran**. Bila DEM belum ada: *Bangun DEM untuk memulai.*

Konfigurasi tersimpan per chunk di dalam proyek.

## 7.2 Model

| Pilihan | Referensi | Kapan dipakai | Parameter tambahan |
| :-- | :-- | :-- | :-- |
| **Inersial lokal (Bates 2010)** — bawaan | Bates, Horritt & Fewtrell 2010; suku q-centred de Almeida dkk. 2012 (kelas LISFLOOD-FP / HEC-RAS 2D difusi) | Hujan-limpasan dan perutean debit **dalam waktu**: hidrograf, kecepatan, waktu tiba | — |
| **Statis HAND (Nobre 2011)** | *Height Above Nearest Drainage* | Luasan genangan cepat untuk tinggi muka air tertentu di atas drainase terdekat; tanpa dinamika | **Tinggi muka air di atas drainase** (m) |
| **Bathtub terkoneksi** | Bathtub berkonektivitas | Genangan air tenang pada satu elevasi (mis. pasang/laut, waduk) yang terhubung ke tepi grid/sel debit | **Elevasi muka air (ENU)** (m) |

Persamaan inersial lokal per muka sel:

```
q⁺ = (q − g·h_f·Δt·∂(z+h)/∂x) / (1 + g·Δt·n²·|q| / h_f^(7/3))
Δt = α·Δx / √(g·h_max), α = 0,7 (CFL)
```

Massa dikonservasi hingga pembulatan; neraca volume ditampilkan setelah simulasi.

**Ukuran sel** (m, 0–100): *0 = resolusi DEM asli; nilai lebih besar mengagregasi DEM (lebih cepat)*. Di sampingnya tampil estimasi `W×H sel (x,xx m) · ~N langkah · ~T s · M MB`. Sel DEM digabung dengan rata-rata blok; blok yang memuat NaN menjadi dinding kedap.

💡 Mulailah dengan sel 1–2 m untuk eksplorasi (puluhan detik), lalu turunkan ke resolusi DEM bila hasilnya menarik. Waktu komputasi naik ≈ kubik terhadap pengecilan sel (lebih banyak sel **dan** Δt lebih kecil).

## 7.3 Kehilangan (Infiltrasi)

| Pilihan | Rumus | Parameter | Cocok untuk |
| :-- | :-- | :-- | :-- |
| **Koefisien limpasan C** — bawaan | Metode rasional: limpasan = C × hujan | **Koefisien limpasan C** (0–1) di bagian HUJAN & PERMUKAAN | Skrining cepat, kawasan homogen |
| **SCS Curve Number (TR-55)** | `S = 25400/CN − 254` mm, `Ia = 0,2·S` | **CN** 30–100 (bawaan 80) | Kawasan campuran tanah/tutupan dengan tabel CN baku |
| **Green-Ampt** | Infiltrasi fisik implisit (Chow, Maidment & Mays 1988 §4.3), Newton per sel per langkah | **Ks** mm/j (0,01–500; bawaan 6,5) · **ψ** mm (1–2000; 167) · **Δθ** (0,01–0,6; 0,34) | Bila sifat tanah diketahui; hujan panjang |

**Nilai acuan C (metode rasional)**

| Tutupan lahan | C |
| :-- | :-- |
| Atap, aspal, beton | 0,85–0,95 |
| Permukiman padat | 0,60–0,80 |
| Permukiman renggang / pekarangan | 0,40–0,60 |
| Rumput, taman, tanah datar | 0,10–0,25 |
| Hutan, lahan gembur | 0,05–0,20 |

**Nilai acuan CN (TR-55, kelompok tanah hidrologi A–D; AMC II)**

| Tutupan | A (pasir) | B | C | D (lempung) |
| :-- | :-- | :-- | :-- | :-- |
| Kedap (atap, jalan) | 98 | 98 | 98 | 98 |
| Permukiman (≈ 65 % kedap) | 77 | 85 | 90 | 92 |
| Permukiman (≈ 38 % kedap) | 61 | 75 | 83 | 87 |
| Rumput kondisi baik | 39 | 61 | 74 | 80 |
| Lahan pertanian baris | 67 | 78 | 85 | 89 |
| Hutan kondisi baik | 30 | 55 | 70 | 77 |

**Nilai acuan Green-Ampt (Rawls dkk. 1983)**

| Tekstur tanah | Ks (mm/j) | ψ (mm) | Δθ (porositas efektif) |
| :-- | :-- | :-- | :-- |
| Pasir | 117,8 | 49,5 | 0,417 |
| Lempung berpasir | 29,9 | 61,3 | 0,401 |
| Geluh (loam) | 3,4 | 88,9 | 0,434 |
| Geluh berdebu (silt loam) | 6,5 | 166,8 | 0,486 |
| Geluh berlempung (clay loam) | 1,0 | 208,8 | 0,309 |
| Lempung (clay) | 0,3 | 316,3 | 0,385 |

## 7.4 Kelas Bahaya

| Pilihan | Dasar | Kelas |
| :-- | :-- | :-- |
| **ARR 2019 (H1–H6)** — bawaan | Australian Rainfall & Runoff 2019 Book 6 Bab 7 (kurva Smith, Davey & Cox 2014) dari kedalaman puncak D, kecepatan puncak V, dan D·V | lihat §7.9 |
| **BNPB 02/2012 (kedalaman)** | Perka BNPB No. 02/2012, kedalaman saja | Rendah < 0,76 m · Sedang 0,76–1,5 m · Tinggi > 1,5 m |
| **Tidak ada** | — | Lapisan bahaya tidak dibuat |

Kontrol **durasi > x m** (0,01–5; bawaan 0,3 m) menetapkan ambang kedalaman untuk lapisan **Durasi genangan**.

## 7.5 Hujan dan Permukaan

| Kontrol | Rentang | Bawaan | Arti |
| :-- | :-- | :-- | :-- |
| **Intensitas hujan** | 0–1000 mm/jam | 50 | Hujan seragam di seluruh domain |
| **Lama simulasi** | 1–86 400 detik | 3600 | Total waktu yang disimulasikan |
| **Durasi hujan** | 0–86 400 detik | 0 | *Durasi hujan 0 berarti hujan berlangsung sepanjang simulasi.* Set lebih pendek dari lama simulasi untuk melihat surut |
| **Koefisien limpasan C** | 0–1 | 0,85 | Dipakai bila Kehilangan = C; juga nilai bawaan zona |
| **Kekasaran Manning n** | 0,001–1 | 0,035 | Kekasaran permukaan untuk inersial lokal |

Grafik **Pratinjau intensitas hujan** menampilkan blok hujan terhadap lama simulasi beserta teks `x mm/jam · y menit hujan / z menit simulasi`. Peringatan merah muncul bila *Durasi hujan melebihi lama simulasi.*

**Nilai acuan Manning n (permukaan overland)**

| Permukaan | n |
| :-- | :-- |
| Beton, aspal halus | 0,011–0,015 |
| Tanah gundul, padat | 0,020–0,030 |
| Rumput pendek / lapangan | 0,030–0,050 |
| Lahan pertanian, rumput tinggi | 0,050–0,130 |
| Semak | 0,100–0,200 |
| Hutan dengan serasah | 0,150–0,400 |
| Saluran alami bersih | 0,025–0,035 |

**Intensitas hujan acuan Indonesia** (orde besaran untuk skrining): hujan sedang 20–50 mm/jam selama 1–2 jam; hujan ekstrem 80–120 mm/jam selama 1 jam; gunakan kurva IDF setempat untuk periode ulang tertentu.

## 7.6 Batas dan Sumber Air

| Kontrol | Fungsi |
| :-- | :-- |
| **Air keluar batas grid** | Batas terbuka (outfall kritis) — air meninggalkan domain di tepi grid. Mematikan muka air tetap |
| **Elevasi air tetap di batas** + **Elevasi ENU (m)** | Tepi grid dipaksa pada elevasi muka air tetap (laut/sungai besar). Bawaan = elevasi minimum DEM. Mematikan batas terbuka |
| **Debit titik** → **Pilih titik di peta**, **Timur (m)**, **Utara (m)**, **Debit m³/detik** | Sumber titik konstan (mis. outlet gorong-gorong, limpasan dari hulu di luar survei) |
| **Penampang debit** → **Gambar penampang (2 klik)**, **A Timur/Utara**, **B Timur/Utara** | Garis pengukur untuk hidrograf keluaran |
| **Debit CSV** / **Muka air CSV** | Deret waktu `detik,nilai` (*mulai dari 0, interpolasi linier, nilai akhir ditahan*; maks 4 MB) untuk debit titik atau muka air batas. Tombol aktif hanya bila sumber terkait dicentang; tampil `N titik` dan tombol **Hapus …** |

Saat memilih titik/penampang: *Klik pada peta Ortho/DEM; untuk membatalkan, tutup dan buka panel simulasi.*

### Zona Permukaan (Kotak ENU)

Header lipat **Zona permukaan (kotak ENU)**: **Tambah zona** membuat kotak sebesar DEM dengan C dan n saat ini; ubah **Barat/Timur/Selatan/Utara** (m ENU), **C**, **n**. *Zona terakhir menang jika area bertumpuk; hanya sel dengan pusat di dalam kotak yang terpengaruh.* Untuk zona berbentuk bebas, pakai poligon Shapes beratribut (§7.1).

### Bukaan Tanggul Terjadwal / Ambang Muka Air

Header lipat dengan teks *Penurunan DEM terparametrisasi, bukan prediksi keruntuhan struktur; elevasi menggunakan ENU.* Centang **Aktifkan bukaan**, lalu atur kotak **Barat/Timur/Selatan/Utara**, **Dasar ENU m**, **Durasi bukaan detik**, dan pemicu: **Waktu pemicu detik** atau centang **Pemicu elevasi air** + **Ambang ENU m**. Hasil mencatat *Bukaan tanggul terpicu pada x detik*.

## 7.7 Menjalankan

Tombol **Jalankan simulasi** (aktif bila ada DEM). Selama berjalan tampil spinner dan tombol **Batalkan**; **Hapus hasil** membuang hasil lama. Simulasi berjalan di thread latar; peta tetap bisa digeser.

⚠️ Mengubah parameter apa pun setelah simulasi membatalkan hasil (*Parameter berubah; jalankan ulang simulasi.*); demikian pula mengganti DEM (*DEM berubah; jalankan ulang simulasi.*).

## 7.8 Hasil dan Playback

| Kontrol | Fungsi |
| :-- | :-- |
| **▶ / ⏸**, **⏮**, **⏭** + slider **Waktu** | Memutar hasil secara mulus: posisi waktu diinterpolasi di antara frame solver mengikuti jam nyata, bukan loncat per frame |
| Kecepatan (**otomatis (N×)** / **1×** … **1800× waktu nyata**) | *Otomatis* memutar seluruh durasi simulasi dalam ±12 detik; nilai lain = detik simulasi per detik nyata |
| **Ulang** | Memutar berulang dari awal |
| **Air animasi (GPU)** + kualitas **Sederhana / Normal / Tinggi** | Permukaan air dirender di GPU: warna mengikuti kedalaman (penyerapan Beer–Lambert), riak bergerak searah arus (*flow map*), kilau matahari, busa di tepi genangan yang maju dan di arus deras, kaustik (kualitas Tinggi). Partikel aliran kecil mengikuti medan kecepatan hasil solver. Bila GPU tidak mendukung, muncul pesan *Renderer air: …* dan overlay kembali ke tampilan sederhana |
| Baris ringkasan | `t menit \| hujan m³ \| debit masuk m³ \| masuk batas m³ \| keluar m³ \| akhir m³ \| sel m` |
| *Selisih neraca volume* | `residu m³ · hujan bruto · infiltrasi · N langkah` — residu harus ≈ 0 |
| **Lapisan:** **Kedalaman (waktu)** · **Kedalaman puncak** · **Kecepatan puncak** · **Waktu tiba** · **Durasi genangan** · **Kelas bahaya** | Overlay pada peta (transparan di sel kering) |
| Legenda bahaya | `■ H3 0.xxx ha` per kelas yang muncul |
| **Tambah poligon bahaya ke Shapes** | Lapisan *Bahaya banjir (skema)* dengan atribut `label`; sumber mencatat skenario `skema · mm/j · mnt` |
| **Ekspor poligon bahaya…** | GeoJSON / Shapefile / KML |
| **Ekspor GeoTIFF:** *kedalaman saat ini* · *kedalaman puncak* · *kecepatan puncak* · *waktu tiba* · *durasi genangan* · *kelas bahaya* | Float32 pada grid solver |
| Hidrograf | *Debit penampang puncak (magnitudo sampel)* + grafik + **Ekspor hidrogaraf CSV** (`time_seconds,discharge_m3_s`) |

**Cara membaca lapisan**

| Lapisan | Warna | Interpretasi |
| :-- | :-- | :-- |
| Kedalaman (waktu) / puncak | air animasi (GPU) atau biru muda → biru tua (0–0,5 m+) | Genangan > 0,3 m sudah menghambat kendaraan kecil; > 0,5 m membahayakan pejalan |
| Kecepatan puncak | kuning → merah (0–2 m/s+) | > 1 m/s mulai menghanyutkan orang dewasa pada kedalaman 0,5 m |
| Waktu tiba | merah (cepat) → biru (lambat) | Waktu sejak awal simulasi saat kedalaman pertama kali > 5 cm; penting untuk peringatan dini |
| Durasi genangan | kuning → ungu | Lama kedalaman > ambang (bawaan 0,3 m); menandai area yang sulit dievakuasi |
| Kelas bahaya | sesuai skema | Lihat §7.9 |

## 7.9 Kelas Bahaya ARR 2019 (Kedalaman × Kecepatan)

Kelas ditentukan oleh **nilai terkecil** yang dilampaui dari tiga ambang (D, V, D·V); sel masuk kelas pertama yang masih memenuhi ketiganya.

| Kelas | D maks (m) | V maks (m/s) | D·V maks (m²/s) | Dampak (ARR 2019 Tabel 6.7.1) |
| :-- | :-- | :-- | :-- | :-- |
| **H1** | 0,3 | 2,0 | 0,3 | Umumnya aman bagi orang, kendaraan, bangunan |
| **H2** | 0,5 | 2,0 | 0,6 | Tidak aman bagi kendaraan kecil |
| **H3** | 1,2 | 2,0 | 0,6 | Tidak aman bagi kendaraan, anak-anak, dan lansia |
| **H4** | 2,0 | 2,0 | 1,0 | Tidak aman bagi orang dan kendaraan |
| **H5** | 4,0 | 4,0 | 4,0 | Tidak aman bagi semua; bangunan ringan rentan runtuh |
| **H6** | ∞ | ∞ | ∞ | Tidak aman; semua jenis bangunan rentan |

Contoh: sel dengan D = 0,4 m dan V = 1,0 m/s → D·V = 0,4 → melampaui H1 (D > 0,3; D·V > 0,3) tetapi memenuhi H2 (D ≤ 0,5; V ≤ 2; D·V ≤ 0,6) → **H2**.

**BNPB 02/2012** hanya memakai kedalaman: **Rendah** < 0,76 m, **Sedang** 0,76–1,5 m, **Tinggi** > 1,5 m — cocok untuk peta risiko kabupaten yang mengikuti pedoman kajian risiko bencana Indonesia.

Poligon kelas ditelusuri sepanjang tepi sel, sehingga luas poligon = jumlah sel × luas sel (konsisten dengan legenda).

## 7.10 Ke Lembar Peta

Setelah simulasi, dialog **Cetak Lembar Peta / Laporan** menawarkan lapisan **Bahaya banjir** dan opsi **Sertakan lembar bahaya banjir** (lembar `FLOOD-01`) pada laporan lengkap ([Bab 8](08-cetak-laporan.md)).

---

**Langkah berikutnya:** susun hasil Anda menjadi dokumen resmi di [Bab 8 — Cetak lembar peta & laporan](08-cetak-laporan.md).
