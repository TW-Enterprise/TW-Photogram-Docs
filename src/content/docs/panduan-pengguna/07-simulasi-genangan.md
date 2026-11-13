---
title: "Bab 7 — Simulasi Genangan"
description: "Apa yang akan Anda lakukan: menjalankan simulasi genangan 2D di atas DTM hasil survei, memilih model dan parameter hidrologi yang masuk akal, menetapkan huj..."
---

**Apa yang akan Anda lakukan:** menjalankan simulasi genangan 2D di atas DTM hasil survei, memilih model dan parameter hidrologi yang masuk akal, menetapkan hujan dan sumber air, membaca lapisan hasil (kedalaman, kecepatan, waktu tiba, durasi, kelas bahaya), lalu mengekspornya ke GIS dan lembar peta.

⚠️ Simulasi ini adalah alat skrining berbasis DEM survei. Hasilnya bergantung pada kualitas DTM, parameter yang Anda masukkan, dan asumsi batas. Untuk desain struktur atau penetapan zona resmi, verifikasi dengan model hidraulik terkalibrasi dan data lapangan.

---

## 7.0 Tutorial bergambar: dari foto mapping_01 sampai air terlihat

**Jalur yang diuji:** aplikasi native macOS, 51 foto nyata `mapping_01`, penyelarasan → awan titik → klasifikasi tanah → DTM → orthomosaic → simulasi → playback. Jika proyek Anda sudah mempunyai DTM, langsung ke **langkah 7**.

> **Sudah klik Jalankan simulasi tetapi air belum terlihat?** Tunggu hasil selesai, gulir **panel kanan** ke **HASIL & PLAYBACK**, lalu tekan **▶**. Pada simulasi pertama, waktu masih **0 menit** dan permukaan awal kering. Gunakan tampilan **Orthomosaic atau DEM**, bukan Maps.

**Tentang screenshot.** Semua gambar di tutorial ini berasal dari aplikasi yang benar-benar dijalankan pada 13 November 2026: TW-Photogram **0.1.1-alpha**, bundle macOS terpasang bertanggal 6 November 2026, tema gelap, Bahasa Indonesia. Dialog pemrosesan dibuka kembali setelah pengujian untuk memperlihatkan pengaturannya; karena itu beberapa gambar bertuliskan **Proses Ulang** dan menampilkan hasil di latar belakang. Saat pertama kali memproses, tombolnya bertuliskan **Selaraskan Foto**, **Bangun Awan Titik**, dan seterusnya. Jangan mengulang tahap yang sudah berhasil hanya untuk mengikuti screenshot. Identitas binary dan daftar gambar dicatat di [catatan screenshot](/TW-Photogram-Docs/manual/img/README.md).

### Langkah 1 — Masukkan 51 foto survei

1. Mulai proyek kosong. Di dock **Workspace**, klik ikon folder bertanda **+** dengan tooltip **Tambah Folder…**.
2. Pilih folder `mapping_01`, lalu klik **Open**. Untuk dataset ini, Workspace dan tab Photos harus menunjukkan **51 foto**.
3. Tunggu thumbnail selesai dimuat. Sebelum penyelarasan, jumlah kamera selaras masih **0/51**. Foto yang sudah diproses dapat menunjukkan **51/51**, seperti proyek contoh di bawah.

![Workspace berisi 51 foto mapping_01 beserta DTM dan orthomosaic hasil pengujian](/TW-Photogram-Docs/manual/img/07-proyek-mapping01.jpg)

*Gambar 7-A. Proyek contoh setelah seluruh tahap selesai. Tombol Tambah Folder berada di kiri atas Workspace; hasil berikutnya muncul sebagai entri terpisah di bawah kamera.*

### Langkah 2 — Selaraskan foto

1. Klik tombol **1. Selaraskan Foto (SfM)…** di toolbar atas; arahkan pointer ke ikon untuk membaca tooltip. Pada menu native macOS, tindakan yang sama bernama **Workflow → Align Photos…**.
2. Untuk mengulang contoh ini, biarkan **High**, **40.000 key points**, dan **4.000 tie points** seperti pada dialog.
3. Klik **Selaraskan Foto**, tunggu dialog proses selesai, lalu periksa Workspace atau status bar. Pengujian ini menghasilkan **51/51 kamera selaras** dan **20.450 titik ikat**. Angka ini adalah catatan satu pengujian, bukan syarat bahwa setiap komputer harus menghasilkan jumlah titik identik.

![Dialog penyelarasan foto dengan High, 40000 key points, 4000 tie points dan hasil 51 dari 51 kamera](/TW-Photogram-Docs/manual/img/07-dialog-align.jpg)

*Gambar 7-B. Dialog dibuka kembali setelah penyelarasan; panel hijau mengonfirmasi bahwa tahap sudah selesai.*

### Langkah 3 — Bangun awan titik

1. Klik **3. Bangun Awan Titik (MVS)…** atau **Workflow → Build Point Cloud…**.
2. Pada build yang diuji, dialog menampilkan **Kualitas 1,00** dan **Filter Kedalaman Moderate**. Gunakan pengaturan tersebut untuk contoh ini.
3. Klik **Bangun Awan Titik** dan tunggu entri **Awan Titik (Dense Cloud)** muncul. Pengujian menghasilkan **3.315.976 titik**. Status siap saja belum berarti DTM sudah tersedia; lanjutkan klasifikasi tanah.

![Dialog Bangun Awan Titik dengan pengaturan kualitas dan konfirmasi 3315976 titik](/TW-Photogram-Docs/manual/img/07-dialog-dense.jpg)

*Gambar 7-C. Awan titik sudah selesai dibangun; tombol Proses Ulang hanya digunakan bila sengaja mengubah pengaturan.*

### Langkah 4 — Klasifikasikan tanah

1. Di **Workspace**, klik kanan entri **Awan Titik (Dense Cloud)**.
2. Pilih **Klasifikasi Titik Tanah (CSF)…**. Jalur klik kanan ini tersedia pada build macOS yang diuji.
3. Gunakan **Ukuran Sel 3,0 m** dan **Batas Jarak Kain 0,30 m**, lalu klik **Klasifikasikan Titik**. Ini ukuran sel klasifikasi, berbeda dari ukuran sel simulasi banjir pada langkah 8.
4. Tunggu selesai. Pengujian menghasilkan **1.486.617 titik Ground / kelas 2**. Periksa hasil klasifikasi sebelum memakainya untuk analisis lokasi lain.

![Menu klik kanan Awan Titik dengan pilihan Klasifikasi Titik Tanah CSF](/TW-Photogram-Docs/manual/img/07-menu-ground.jpg)

*Gambar 7-D. Buka klasifikasi dari entri Awan Titik di Workspace.*

![Dialog CSF dengan ukuran sel 3 meter, jarak kain 0,30 meter, dan jumlah titik Ground](/TW-Photogram-Docs/manual/img/07-dialog-ground.jpg)

*Gambar 7-E. Setelah berhasil, dialog menampilkan jumlah titik tanah. DTM memerlukan titik Ground; mengganti label permukaan saja tidak melakukan klasifikasi.*

### Langkah 5 — Bangun DTM

1. Klik **7. Bangun Model Elevasi (DEM)…**.
2. Pilih **Permukaan → DTM — Ground / Tanah (class 2)**; setelah dipilih, kotak menampilkan **Ground**.
3. Pilih **Sumber Data: Dense cloud**, **Interpolasi: Enabled (default)**, dan biarkan **Kustom** tidak dicentang untuk resolusi otomatis. Tutorial ini tidak memakai poligon batas.
4. Klik **Bangun DEM**. Tunggu entri DEM di Workspace. Pada pengujian: **1.860 × 1.672 piksel**, sekitar **0,147 m/piksel**.
5. Periksa permukaan di **Ortho → DEM**. Bila muncul pesan membutuhkan titik Ground, kembali ke langkah 4; jangan mengganti ke DSM hanya untuk melewati pesan tersebut.

![Dialog DEM dengan permukaan Ground, sumber Dense cloud, interpolasi Enabled dan resolusi otomatis](/TW-Photogram-Docs/manual/img/07-dialog-dtm.jpg)

*Gambar 7-F. Pilihan Ground membedakan DTM tanah dari DSM permukaan. Angka resolusi otomatis dapat berbeda dari GSD ringkasan pada status bar.*

### Langkah 6 — Bangun orthomosaic sebagai latar foto

1. Klik **8. Bangun Ortomosaik…** atau **Workflow → Build Orthomosaic…**.
2. Klik **Bangun Ortomosaik** dan tunggu proses selesai. Pada pengujian ini ukurannya **7.438 × 6.685 piksel**, sekitar **0,037 m/piksel**.
3. Buka **Ortho → Orthomosaic** untuk memeriksa foto orto. Orthomosaic menjadi latar tampilan; perhitungan banjir tetap memakai DEM/DTM. Jika hanya ingin membaca air di atas DEM, tahap orthomosaic tidak wajib.

![Dialog orthomosaic dengan permukaan acuan DEM atau Mesh dan mode mosaik dominan nadir](/TW-Photogram-Docs/manual/img/07-dialog-ortho.jpg)

*Gambar 7-G. Dialog orthomosaic dibuka kembali setelah hasil terbentuk.*

### Langkah 7 — Buka tampilan yang mendukung genangan

Klik tab **Ortho**, pilih ikon **Orthomosaic** atau ikon **DEM** (gunung), kemudian klik **Genangan**. Panel kanan berjudul **SIMULASI GENANGAN 2D**. Bila masih terbuka dock **Batas**, pilih tab **Genangan** di bagian atas dock kanan.

| Tampilan pada build yang diuji | Hasil genangan |
| :-- | :-- |
| Ortho → Orthomosaic | Overlay air dan partikel aliran terlihat di atas foto orto |
| Ortho → DEM | Overlay air terlihat di atas elevasi |
| Ortho → Maps | Basemap dan orthomosaic terlihat, tetapi overlay banjir **belum digambar** |
| Model 3D | Bukan viewport simulasi genangan 2D |

**Hujan bukan animasi tetesan.** Grafik *Pratinjau intensitas hujan* menunjukkan input hujan. Visual yang tersedia adalah genangan dan partikel yang mengikuti aliran hasil solver. Tidak munculnya tetesan hujan bukan tanda bahwa input hujan diabaikan.

### Langkah 8 — Masukkan skenario reproduksi

Gunakan tabel ini untuk mengikuti contoh `mapping_01`. **Ini skenario demonstrasi yang diuji, bukan parameter rekomendasi untuk semua lokasi atau kalibrasi banjir lapangan.**

| Kontrol | Nilai contoh |
| :-- | :-- |
| Model | Inersial lokal (Bates 2010) |
| Ukuran sel simulasi | **2,0 m**; grid efektif pada data ini **2,06 m**, 133 × 120 sel |
| Frame | 60 |
| Kehilangan | Koefisien limpasan C |
| Kelas bahaya | ARR 2019 (H1–H6) |
| Intensitas hujan | **50 mm/jam** |
| Lama simulasi | **3.600 detik** (60 menit) |
| Durasi hujan | **0** (hujan sepanjang simulasi, bukan tanpa hujan) |
| Koefisien limpasan C | **0,85** |
| Kekasaran Manning n | **0,035** |
| Air keluar batas grid | Tidak dicentang: contoh memakai batas tertutup |
| Elevasi air tetap, debit titik, penampang, zona dan bukaan tanggul | Tidak diaktifkan |

Untuk mengisi angka, klik dua kali nilai, pilih seluruh teks (**Cmd+A** di macOS), ketik nilai baru, lalu tekan **Enter**. Memperbesar sel simulasi mengagregasi DTM untuk perhitungan dan tidak mengganti raster DTM proyek.

![Panel model dan hujan dengan sel 2 meter, intensitas 50 mm per jam serta durasi simulasi 3600 detik](/TW-Photogram-Docs/manual/img/07-parameter-hujan.jpg)

*Gambar 7-H. Bagian atas dock Genangan. Gambar diambil setelah pengujian, sehingga hasil air masih terlihat di latar belakang.*

**Hindari langsung memakai ukuran sel 0 untuk percobaan pertama.** Nilai 0 memakai resolusi DEM asli. Pada DTM ini panel memperkirakan sekitar **2.276 MB snapshot** dan **4.324 detik** untuk sel asli; sel 2 m menghasilkan sekitar **12 MB snapshot**. Estimasi waktu panel bukan janji durasi aktual: pada pengujian, perhitungan sel 2 m juga tidak selesai seketika meskipun panel menampilkan `~2 s`.

### Langkah 9 — Jalankan, tunggu selesai, lalu tekan Play

1. **Gulir di dalam panel kanan**, melewati grafik hujan, sampai bagian **BATAS & SUMBER AIR** dan tombol **Jalankan simulasi** terlihat. Menggulir di atas peta akan melakukan zoom, bukan menggulir panel.
2. Klik **Jalankan simulasi** sekali. Selama menghitung, tombol berubah menjadi **Batalkan** dan ada spinner. Aplikasi belum menampilkan frame hasil baru pada tahap ini.
3. Tunggu **HASIL & PLAYBACK** muncul. Angka volume menunjukkan bahwa hasil sudah tersedia. Pengujian ini mencatat hujan efektif dan volume akhir sekitar **1.915,13 m³**, hujan bruto **2.253,09 m³**, infiltrasi **337,96 m³**, dan residu volume mendekati nol.
4. Pada hasil pertama, slider **Waktu = 0**. **Tekan ▶ di baris HASIL & PLAYBACK**. Tombol berubah menjadi **⏸**, angka waktu bergerak, dan air muncul di sel yang basah.

![Hasil simulasi tersedia tetapi Waktu nol dan belum ada air di atas orthomosaic](/TW-Photogram-Docs/manual/img/07-waktu-nol.jpg)

*Gambar 7-I. Kondisi awal kering pada waktu 0, ditampilkan kembali dengan tombol Ke awal. Tombol ▶ adalah tombol pertama di bawah HASIL & PLAYBACK; volume ringkasan sudah ada walaupun frame saat ini masih kering.*

![Genangan biru dan partikel aliran pada orthomosaic mapping_01 setelah playback berjalan](/TW-Photogram-Docs/manual/img/07-playback-ortho.jpg)

*Gambar 7-J. Hasil setelah menekan ▶, kemudian dijeda sekitar menit ke-56 agar mudah dibandingkan. Biru adalah genangan hasil perhitungan; titik putih adalah partikel aliran, bukan tetesan hujan.*

![Hasil pada waktu yang sama di atas DEM dengan panel playback dan volume](/TW-Photogram-Docs/manual/img/07-playback-dem.jpg)

*Gambar 7-K. Hasil yang sama di tampilan DEM. Berpindah antara DEM dan Orthomosaic tidak perlu menjalankan simulasi ulang.*

### Langkah 10 — Baca hasil, bandingkan, dan ekspor

- **⏸ / ▶:** jeda atau lanjutkan waktu. Riak permukaan dapat tetap bergerak ketika waktu dijeda.
- **Slider Waktu:** setelah pause, geser untuk memeriksa waktu tertentu. **⏮** kembali ke awal yang mungkin kering; **⏭** maju satu frame.
- **Otomatis (300×)** pada skenario satu jam ini memutar seluruh durasi dalam sekitar 12 detik. **Ulang** mengembalikan waktu ke awal setelah mencapai akhir; pilih kecepatan lebih rendah untuk mengamati perkembangan.
- **Kedalaman puncak:** melihat sel yang pernah tergenang selama skenario tanpa perlu memutar waktu. Ini bukan kedalaman serentak pada satu waktu.
- **Kelas bahaya:** membaca hasil klasifikasi bersama legenda luas. Klasifikasi skenario ini bukan peta risiko resmi atau bukti akurasi elevasi lapangan.
- **Ekspor GeoTIFF:** gulir lebih bawah dan pilih **kedalaman saat ini**, **kedalaman puncak**, atau **kelas bahaya**. Untuk kedalaman saat ini, pause dan pilih waktu terlebih dahulu. Tentukan nama dan lokasi berkas pada dialog ekspor.

![Lapisan Kedalaman puncak dipilih dan menampilkan sel yang pernah basah di atas DTM](/TW-Photogram-Docs/manual/img/07-hasil-kedalaman.jpg)

*Gambar 7-L. Kedalaman puncak membantu memastikan ada hasil basah tanpa bergantung pada posisi slider waktu.*

![Lapisan Kelas bahaya ARR 2019 dengan legenda luas kelas dan tombol ekspor GeoTIFF](/TW-Photogram-Docs/manual/img/07-hasil-bahaya.jpg)

*Gambar 7-M. Pilih Kelas bahaya, baca legenda, lalu gunakan tombol ekspor yang sesuai.*

### Jika tetap tidak terlihat

![Maps menampilkan basemap dan orthomosaic tetapi tanpa overlay banjir meskipun hasil tersedia](/TW-Photogram-Docs/manual/img/07-maps-tanpa-genangan.jpg)

*Gambar 7-N. Hasil dan waktu sama dengan pembanding DEM/ortho, tetapi Maps tidak menggambar air pada build ini. Kembali ke Orthomosaic atau DEM; mengulang solver tidak memperbaiki keterbatasan tampilan Maps.*

| Yang terlihat | Tindakan |
| :-- | :-- |
| Tombol Batalkan dan spinner | Perhitungan belum selesai; tunggu. Untuk percobaan berikutnya gunakan sel 2 m, bukan resolusi asli yang sangat rapat. |
| Hasil tersedia, Waktu 0, peta kering | Gulir ke HASIL & PLAYBACK dan tekan **▶**, atau pilih **Kedalaman puncak**. |
| Panel hanya memperlihatkan parameter hujan | Gulir **panel kanan** lebih bawah; kontrol hasil berada setelah parameter dan informasi model. |
| Waktu bergerak tetapi Maps tidak menampilkan air | Pilih **Orthomosaic atau DEM**. Ini keterbatasan build yang diuji. |
| Tidak ada efek tetesan hujan | Efek tersebut belum tersedia; periksa grafik hujan dan hasil genangan. |
| Beralih ke Batas lalu pembaruan hasil/waktu berhenti | Buka kembali dock **Genangan**. Polling/playback masih bergantung pada dock pada implementasi ini. |
| Parameter/DEM berubah; hasil hilang | Jalankan ulang setelah semua perubahan selesai; hasil lama memang dibatalkan. |
| Pesan Renderer air | Baca pesan; renderer memakai overlay sederhana jika GPU gagal. |
| Kedalaman puncak juga kosong | Periksa input hujan/debit, infiltrasi, domain DTM dan pesan kesalahan. Jangan menganggap setiap skenario harus menghasilkan banjir terlihat. |

**Batas verifikasi:** pengujian layar ini membuktikan alur pemakaian dan tampilan pada data nyata, bukan akurasi vertikal survei atau kalibrasi hidrologi. Status aplikasi mencatat **GCP belum dievaluasi**. Untuk penggunaan operasional, periksa DTM, datum, batas domain, dan parameter setempat.

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

**Sesudah selesai, gulir ke HASIL & PLAYBACK dan tekan ▶.** Hasil awal berada pada waktu 0 dan bisa seluruhnya transparan. Gunakan **Ortho → Orthomosaic atau DEM**; Maps belum menggambar overlay banjir pada build yang diuji.

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

Setelah simulasi, dialog **Cetak Lembar Peta / Laporan** menawarkan lapisan **Bahaya banjir** dan opsi **Sertakan lembar bahaya banjir** (lembar `FLOOD-01`) pada laporan lengkap ([Bab 8](/TW-Photogram-Docs/panduan-pengguna/08-cetak-laporan/)).

---

**Langkah berikutnya:** susun hasil Anda menjadi dokumen resmi di [Bab 8 — Cetak lembar peta & laporan](/TW-Photogram-Docs/panduan-pengguna/08-cetak-laporan/).
