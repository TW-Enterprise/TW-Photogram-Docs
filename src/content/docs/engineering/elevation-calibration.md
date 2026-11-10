---
title: "Kalibrasi elevasi dan referensi survei"
description: "Buka Workflow → Calibrate Elevation / Kalibrasi Elevasi. Fitur ini memisahkan acuan tinggi, kontrol GCP, dan pembandingan DEMNAS. Kesesuaian DEMNAS bukan bu..."
---

Buka **Workflow → Calibrate Elevation / Kalibrasi Elevasi**. Fitur ini memisahkan acuan tinggi, kontrol GCP, dan pembandingan DEMNAS. Kesesuaian DEMNAS bukan bukti akurasi sentimeter.

## Alur pemakaian

1. Tambahkan foto. Tetapkan **Camera/source height** sesuai metadata survei, bukan tebakan berdasarkan nama drone. Tinggi relatif terhadap titik lepas landas tidak dianggap tinggi absolut.
2. Jika tinggi kamera menggunakan geoid, unduh EGM2008 atau impor grid geoid yang benar sebelum Align Photos. Unduhan geoid dapat menggunakan cakupan GPS foto sebelum DEM tersedia. Mengubah datum sumber atau mengganti grid sumber memerlukan penyelarasan ulang.
3. Jalankan Align Photos. Untuk kontrol lapangan, impor CSV melalui **Import Reference**, pilih CRS, datum, nomor kolom, dan ketelitian XY/Z hasil pengukuran. WGS84 menggunakan X=longitude, Y=latitude; UTM menggunakan easting/northing dalam meter. ENU lokal harus terikat origin proyek yang sama.
4. Tandai target pada sedikitnya dua foto terselaras dengan geometri triangulasi yang layak. Pilih **Control**, **Checkpoint**, atau **Disabled** di tabel Reference. Jalankan **Optimize Cameras**. Checkpoint tidak digunakan dalam fitting. Bangun ulang produk turunannya setelah optimasi.
5. Bangun DEM: **Surface** untuk DSM, **Ground** untuk DTM dari kelas ASPRS 2 yang sudah diklasifikasi. Data Ground yang tidak mencukupi menghasilkan error.
6. Pada Kalibrasi Elevasi, unduh DEMNAS untuk area survei atau impor GeoTIFF DEMNAS. Keluaran default adalah EGM2008; pilihan **Local ENU** menyatakan tinggi relatif, bukan elevasi absolut.
7. Gambar poligon pembanding pada thumbnail DEM, mencakup tanah terbuka yang stabil. Hindari bangunan, tajuk pohon, air, serta area yang berubah sejak perekaman referensi. Klik kanan menghapus vertex terakhir. Klik **Analyze**.
8. Periksa offset, NMAD, RMSE, jumlah sel valid, dan sel yang ditolak. Minimal 30 sel DEMNAS valid diperlukan. Ini syarat operasional analisis, bukan batas jaminan akurasi.
9. **Apply offset** hanya tersedia tanpa kontrol survei aktif. Offset konstan disimpan terpisah dan dapat dibatalkan. Penerapan berulang mengganti koreksi sebelumnya. Dengan GCP, DEMNAS hanya menjadi pembanding.
10. Ekspor DEM dan laporan. GeoTIFF memuat tinggi numerik pada datum yang dipilih, satuan meter, NoData, dan informasi koreksi. Laporan memisahkan residual kontrol, error checkpoint, dan selisih DEMNAS.

## Perilaku data

- Kamera, awan titik, dan DEM asli tetap menggunakan ENU. Tinggi absolut dihitung per lokasi melalui ENU/ECEF/geodetik, kemudian `H = h − N` untuk geoid yang dipilih.
- DEMNAS diperoleh dari ImageServer resmi BIG sebagai Float32 satu kanal, bukan gambar relief atau RGB. CRS yang diharapkan adalah WGS84 geografis dan EGM2008 dalam meter. Impor yang menyatakan datum bertentangan ditolak.
- Grid geoid menggunakan GTX atau GTG/GeoTIFF WGS84 north-up numerik, dengan undulasi dalam meter. Grid di luar cakupan, NoData, CRS tak didukung, atau data berskala yang belum dikonversi dilaporkan sebagai error.
- Referensi, grid yang diperlukan, poligon, dan koreksi tersimpan dalam proyek; membuka proyek tidak harus mengunduh ulang. Cache unduhan terpisah dari proyek. Proyek lama tetap dapat dibuka, tetapi datum belum terkonfirmasi dan estimasi/residual marker lama tidak dianggap hasil pengukuran.
- Perubahan input membuat laporan/koreksi kedaluwarsa. Hasil worker dengan input lama dibuang. Unduhan gagal atau dibatalkan mempertahankan referensi yang sebelumnya valid.
- Tidak ada registrasi horizontal otomatis, koreksi kemiringan, atau deformasi DEM dalam fitur ini. Jangan gunakan offset untuk menutupi kesalahan XY atau perbedaan DSM/DTM.

## Verifikasi dan batas akurasi

Uji otomatis mencakup konversi geoid, ekspor numerik/datum, GCP berbobot, independensi checkpoint, impor atomik, koreksi robust, penyimpanan offline, pembatalan, dan penolakan hasil worker yang kedaluwarsa. Fixture sintetis menguji matematika; foto nyata `mapping_01` menguji pipeline. Keduanya tidak menggantikan checkpoint survei independen untuk klaim akurasi absolut.

Uji layanan langsung dijalankan terpisah dari `cargo test` biasa agar gangguan jaringan tidak menjadi hasil matematika palsu. Unduhan potongan grid EGM2008 dari sumber resmi berhasil diuji. Metadata BIG dapat dijangkau pada pengujian sesi ini, tetapi permintaan raster mengalami timeout; gunakan impor GeoTIFF jika layanan tidak tersedia.

Sumber: [DEMNAS BIG](https://www.big.go.id/en/content/produk/demnas), [metadata layanan DEMNAS](https://geoservices.big.go.id/raster/rest/services/DEMNAS/DEM_Indonesia/ImageServer?f=pjson), [grid geoid Agisoft](https://www.agisoft.com/downloads/geoids/), [INAGEOID BIG](https://srgi.big.go.id/page/model-geoid).
