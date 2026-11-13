# Gambar untuk Panduan Pengguna

Folder ini menampung tangkapan layar dan render yang dirujuk panduan di `docs/manual/`. Screenshot alur genangan `mapping_01` sudah tersedia. Daftar rencana bab lain di bawah belum berarti gambar tersebut sudah dibuat. Jangan membuat gambar tiruan/ilustrasi palsu — setiap gambar harus berasal dari aplikasi versi yang didokumentasikan (0.1.1-alpha) atau dari program contoh di repo.

Konvensi: PNG, tema **Pro Gelap** (bawaan); untuk tangkapan otomatis gunakan hook `TWP_SCREENSHOT` (lihat `docs/engineering/ui-design-system.md`), bahasa antarmuka **Bahasa Indonesia**, dataset sampel `sample_drone_survey/` (jalankan dengan `--sample`) kecuali disebut lain, lebar ≥ 1600 px untuk tangkapan jendela penuh, tanpa data klien.

## Screenshot mapping_01 yang sudah tersedia

Diuji dan ditangkap **13 November 2026** pada macOS, TW-Photogram **0.1.1-alpha**, bundle terpasang bertanggal **6 November 2026**, bundle ID `org.rwandaz.tw-photogram`. SHA-256 executable:

```
a45958882d60648e8e7d9680a78d1b2942913bea3c25b411013b8d4c389d1f2f
```

Ini identitas binary yang diuji, bukan klaim bahwa binary dibangun dari HEAD repository saat publikasi. Data: **51 JPEG nyata mapping_01**, 51 kamera selaras, 20.450 titik ikat, 3.315.976 titik rapat, 1.486.617 titik Ground, DTM 1860×1672, orthomosaic 7438×6685. Tidak ada validasi GCP pada uji ini.

Skenario: sel yang diminta 2 m (efektif 2,06 m), 60 frame, hujan 50 mm/jam selama 3600 s, C 0,85, Manning 0,035, batas tertutup. Volume akhir 1915,13 m³. Dialog tahap pemrosesan dibuka kembali sesudah berhasil; tombol Proses Ulang pada gambar bukan instruksi untuk memproses lagi.

Seluruh JPEG bab 7 adalah tangkapan jendela asli 3024×1796 tanpa ilustrasi, data sintetis, atau modifikasi visual. Waktu nol ditampilkan ulang menggunakan Ke awal; screenshot ortho/DEM/Maps dijeda pada frame 56 untuk perbandingan. Efek riak dan partikel bisa tetap bergerak saat waktu dijeda.

| Berkas | Isi |
| :-- | :-- |
| `07-proyek-mapping01.jpg` | Workspace 51 foto dan hasil pemrosesan |
| `07-dialog-align.jpg` | Pengaturan penyelarasan dan hasil kamera |
| `07-dialog-dense.jpg` | Pengaturan awan titik |
| `07-menu-ground.jpg` | Menu klik kanan klasifikasi tanah |
| `07-dialog-ground.jpg` | CSF 3 m / 0,30 m dan jumlah Ground |
| `07-dialog-dtm.jpg` | DEM dari Ground, resolusi otomatis |
| `07-dialog-ortho.jpg` | Orthomosaic dari permukaan DEM |
| `07-parameter-hujan.jpg` | Model, resolusi solver, hujan dan infiltrasi |
| `07-waktu-nol.jpg` | Hasil tersedia, waktu 0, awal kering |
| `07-playback-ortho.jpg` | Genangan di orthomosaic pada frame 56 |
| `07-playback-dem.jpg` | Genangan yang sama di DEM |
| `07-hasil-kedalaman.jpg` | Kedalaman puncak |
| `07-hasil-bahaya.jpg` | Kelas bahaya dan tombol ekspor |
| `07-maps-tanpa-genangan.jpg` | Maps tidak menggambar overlay banjir |

Sumber konten utama: `docs/manual/`. Jalankan `python3 scripts/sync_flood_manual.py` dari root repository untuk menyalin bab terkait dan JPEG ke submodule website; `--check` memeriksa kesamaan tanpa menulis. Screenshot publik berada di `site/public/manual/img/`. Konvensi sampel 24 foto di bawah berlaku untuk rencana gambar lain; tutorial ini secara khusus memakai mapping_01 nyata.

## Rencana tangkapan layar bab lain (manual)

| Berkas | Bab | Isi yang harus terlihat |
| :-- | :-- | :-- |
| `01-jendela-utama.png` | 2 | Jendela penuh setelah `--sample` dan Sejajarkan Foto: menu, bilah tombol, tab Model aktif, dock Workspace, Properties, Photos |
| `02-menu-berkas.png` | 2 | Menu **Berkas** terbuka memperlihatkan seluruh item ekspor (Windows/Linux, menu dalam jendela) |
| `02-toolbar-atas-kanan.png` | 2 | Tata letak **Atas dan Kanan** dengan rail vertikal kanan (Navigasi, Warna, Lapisan) |
| `02-tab-ortho-subtoolbar.png` | 2 | Tab Ortho dengan sub-toolbar Orthomosaic · Maps · DEM · Batas · Genangan |
| `02-maps-view.png` | 2 | Lapisan **Maps** dengan basemap Google Satelit (HD), ortho overlay opacity ~0,7, tombol Fit Ortho |
| `02-pengaturan.png` | 2 | Dialog **Pengaturan / Preferensi** tab Tampilan & Tata Letak |
| `03-impor-referensi.png` | 3 | Dialog **Impor Referensi Survei** dengan CRS WGS84 dan kolom 1, 3, 2, 4 |
| `03-pin-gcp.png` | 3 | Tab Photo, **Mode Pin GCP** aktif, target GCP01 diperbesar dengan pin |
| `03-reference-marker.png` | 3 | Dock Reference → Marker setelah SBA: kolom dX/dY/dZ, pil Total GCP RMSE |
| `04-dialog-align.png` | 4 | Dialog **Penyelarasan Foto** |
| `04-dialog-dense.png` | 4 | Dialog **Bangun Awan Titik (Dense Cloud)** |
| `04-dialog-klasifikasi.png` | 4 | Dialog **Klasifikasi Titik Tanah (ASPRS CSF)** |
| `04-kelas-asprs-3d.png` | 4 | Tab Model, awan titik dengan pewarnaan **Kelas ASPRS** |
| `04-dialog-ortho.png` | 4 | Dialog **Bangun Ortomosaik** |
| `04-batch.png` | 4 | Dialog **Proses Batch (Otomatis)** dengan antrean 5 tahap pemetaan |
| `04-fallback.png` | 4 | Dialog fallback prasyarat (mis. Bangun DEM tanpa awan titik) |
| `04-progres.png` | 4 | Dialog progres saat Bangun Awan Titik berjalan |
| `05-dialog-dem.png` | 5 | Dialog **Bangun Model Elevasi Digital (DEM)** dengan semua opsi terlihat |
| `05-tampilan-dem.png` | 5 | Baris **Tampilan DEM** (Warna + relief, Terrain, slider) di atas peta DEM |
| `05-hillshade-relief3.png` | 5 | DEM gaya Hillshade, Relief × 3 — contoh pemeriksaan artefak |
| `05-kontur.png` | 5 | Lapisan kontur di atas DEM dengan label kontur indeks |
| `05-kalibrasi-elevasi.png` | 5 | Dialog **Kalibrasi Elevasi** dengan poligon pembanding dan hasil Analisis |
| `06-dock-batas.png` | 6 | Dock **Batas** lengkap (IMPOR LAPISAN VEKTOR … POTONG RASTER DENGAN BATAS) |
| `06-gambar-poligon.png` | 6 | Peta saat menggambar poligon (garis hijau, teks "Menggambar poligon: N titik") |
| `06-batas-admin.png` | 6 | Hasil pencarian BIG Kecamatan dengan tombol Tambahkan |
| `06-statistik-zonal.png` | 6 | Blok hasil Statistik zonal |
| `07-dock-genangan-atas.jpg` | 7 | Bagian MODEL, Kehilangan, Kelas bahaya, HUJAN & PERMUKAAN dengan pratinjau hujan |
| `07-dock-genangan-bawah.jpg` | 7 | BATAS & SUMBER AIR, Zona permukaan, Bukaan tanggul |
| `07-hasil-kedalaman.jpg` | 7 | Lapisan **Kedalaman puncak** di atas DTM |
| `07-hasil-bahaya.jpg` | 7 | Lapisan **Kelas bahaya** ARR 2019 dengan legenda luas per kelas |
| `07-hidrograf.jpg` | 7 | Grafik hidrograf penampang dan tombol Ekspor hidrogaraf CSV |
| `08-dialog-cetak.png` | 8 | Dialog **Cetak Lembar Peta / Laporan** dengan pratinjau lembar DEM |
| `08-infografis.png` | 8 | Dialog **Generate Infografis** dengan pratinjau |
| `09-latih-gaussian.png` | 9 | Dialog **Latih Gaussian Splatting** dengan trainer terdeteksi |
| `09-alat-gaussian.png` | 9 | Jendela **Alat Gaussian** dengan model termuat |
| `09-gaussian-viewport.png` | 9 | Tab Model menampilkan model Gaussian, tombol Gaussian / Kurangi kabut aktif |
| `11-console-err.png` | 11 | Dock Console dengan baris berpil ERR |
| `11-relink.png` | 11 | Banner "Ada foto proyek yang tidak ditemukan." dengan tombol Relink Photo Folder… |

## Render yang dapat dibuat dari kode (tanpa tangkapan layar)

Program contoh di `examples/` merender berkas dari proyek tersimpan. Buat dulu proyek `.twp` dari sampel (jalankan aplikasi dengan `--sample`, proses sampai DEM + ortho, simpan sebagai `sample.twp`), lalu:

```bash
# Lembar peta (sheet) dan laporan lengkap PDF
cargo run --release --example render_report -- sample.twp docs/manual/img/08
#   → docs/manual/img/08.sheet.pdf, docs/manual/img/08.report.pdf
#   konversi halaman ke PNG (mis. `pdftoppm -png -r 110 08.sheet.pdf 08-lembar-peta`)

# Infografis A4 lanskap
cargo run --release --example render_infographic -- sample.twp docs/manual/img/08-infografis
#   → 08-infografis.png / .pdf

# Raster DEM/ortho sebagai PNG untuk ilustrasi bab 5
cargo run --release --example dump_rasters -- sample.twp docs/manual/img/raster
#   → folder berisi dem/ortho yang dirender

# Render mesh dari sudut tertentu
cargo run --release --example render_mesh -- sample.twp docs/manual/img/04-mesh.png

# Membuat proyek dari folder foto tanpa GUI (untuk reproduksi)
cargo run --release --example make_project -- sample_drone_survey sample.twp
```

Nama berkas keluaran yang diharapkan panduan:

| Berkas | Sumber |
| :-- | :-- |
| `08-lembar-peta-1.png` | halaman 1 `08.sheet.pdf` |
| `08-laporan-akurasi.png` | halaman akurasi posisi dari `08.report.pdf` |
| `08-infografis.png` | `render_infographic` |
| `04-mesh.png` | `render_mesh` |
| `05-dem-raster.png`, `05-ortho-raster.png` | `dump_rasters` |

## Cara merujuk gambar di bab

Gunakan jalur relatif dari folder bab:

```markdown
![Dialog Bangun DEM](img/05-dialog-dem.png)
```

Perbarui daftar ini bila menambah gambar baru, dan hapus entri yang tidak lagi dirujuk.
