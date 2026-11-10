---
title: "Riset geometri kamera Metashape untuk selisih ortho `mapping_01`"
description: "Status: 2026-10-26. Dokumen ini adalah titik awal riset untuk agent berikutnya,\nbukan klaim bahwa implementasi sudah setara Metashape atau bahwa algoritma\ninter..."
---

Status: 2026-10-26. Dokumen ini adalah titik awal riset untuk agent berikutnya,
bukan klaim bahwa implementasi sudah setara Metashape atau bahwa algoritma
internal proprietary sudah berhasil didekompilasi.

## Pertanyaan yang harus dijawab

Mengapa ortho TW-Photogram masih berbeda dari ortho Metashape dengan median
pergeseran lokal 2,03 m, padahal arah relatif dan rotasi antarlajur sudah benar?
Pertanyaan turunan: bagaimana Metashape mengestimasi pose kamera 6DoF dan
intrinsics bersama dari foto, dan bagaimana hasil itu memengaruhi proyeksi
MVS/ortho? Jangan menyelesaikannya dengan offset, tilt, atau kalibrasi hasil
Metashape yang ditanam sebagai konstanta pada pipeline produksi.

## Bukti dan tingkat kepastian

| Pernyataan | Dasar | Status |
|---|---|---|
| Metashape memakai kamera proyeksi sentral, model Brown untuk frame camera, dan sumbu kamera `+X` kanan, `+Y` bawah, `+Z` arah pandang | [Manual Professional 2.3, Appendix D](https://www.agisoft.com/pdf/metashape-pro_2_3_en.pdf), hlm. 231–232 | Terdokumentasi resmi |
| `mapping_01` menyimpan rotasi dan translasi **per kamera**, beserta satu kalibrasi `class="adjusted"` FC9313 untuk 51 foto | `/tmp/ms_probe/mapping01_v2/mapping01.files/0/chunk.zip` → `doc.xml` | Diamati pada proyek referensi |
| Pose referensi memiliki tilt optik median 1,167° dan p90 1,875° dari nadir | Hitung dari matriks kamera + transform komponen + ECEF→ENU di proyek tersebut | Hasil turunan yang dapat direproduksi |
| TW saat ini memproyeksikan dengan nadir+yaw dan profil fokus awal 2436,3425 px | `src/pipeline/camera_model.rs`, `src/pipeline/sfm.rs` | Diamati pada kode |
| Metashape memakai bentuk fungsi rugi dan schedule LM tertentu, kriteria inlier tertentu, atau metode spesifik untuk estimasi GSD otomatis | Belum tersedia dalam manual/proyek/disassembly yang berhasil | **Belum diketahui**; jangan diklaim |

REA 6.7.0 `inspect_macho` memverifikasi executable Metashape Pro 2.3.2
build 22956 sebagai Mach-O universal, SHA-256
`5f0c31b1e6f692d2fc25d315d9573a5025bdf48cd134b212618e6f01080778b5`
(Evidence `ev_c1d301f8fe8bd317f73239e185740116815248d7eecd85031e1db3e2546b778d`).
REA `inspect_artifact` memverifikasi ZIP chunk proyek, SHA-256
`d0d92044effe1531c87bfe05dda85eae2e7924a440463fceed4960e59443b348`
(Evidence `ev_82871cafb69014b00f960462da3226c53b8b34fa6b5ae7a481cb185de4365abc`).
REA menginventaris ZIP; angka XML di bawah dibaca dengan `unzip -p` dan
perhitungan Python, **bukan** hasil dekompilasi.

## Model proyeksi yang dipublikasikan Agisoft

Untuk titik dunia `P`, pusat kamera `C_i`, dan rotasi kamera-ke-dunia `R_i`,
ubah dulu ke koordinat kamera:

```text
q = R_iᵀ (P − C_i) = (X, Y, Z), Z > 0
x = X/Z, y = Y/Z, r² = x² + y²
L = 1 + k1 r² + k2 r⁴ + k3 r⁶ + k4 r⁸
xd = x L + p1(r² + 2x²) + 2p2xy
yd = y L + p2(r² + 2y²) + 2p1xy
u = w/2 + cx + f xd + b1 xd + b2 yd
v = h/2 + cy + f yd
```

Persamaan distorsi dan pixel dalam blok tersebut berasal dari
[Appendix D manual Professional](https://www.agisoft.com/pdf/metashape-pro_2_3_en.pdf)
(hlm. 232). Transform `q = Rᵀ(P−C)` adalah bentuk matematika untuk menempatkan
titik dunia pada sumbu kamera yang didefinisikan manual; periksa urutan matriks
dan orientasi saat mengimpor proyek. Pusat piksel pertama dalam konvensi
Metashape adalah `(0,5; 0,5)`. Sampler TW memakai pusat bilangan bulat, sehingga
konversi `−0,5` harus eksplisit dan hanya dilakukan sekali.

Pada XML Metashape, gunakan transform komponen dan transform tiap kamera:

```text
P_ECEF = s · R_component · P_chunk + t_component
R_camera→ECEF = R_component · R_camera→chunk
R_camera→ENU = R_ECEF→ENU · R_camera→ECEF
```

Baris `rotation` komponen dan elemen 3×3 dari `camera/transform` dibaca
row-major. Kolom ketiga rotasi kamera-ke-ENU adalah arah sumbu optik. Perlu
mengecek lagi efek atribut `camera/orientation` bila memakai foto lain; pada
dataset ini nilainya `1` untuk contoh yang diperiksa. Skala komponen tidak
mengubah arah sumbu optik, tetapi wajib dipakai untuk pusat/titik 3D.
Untuk mereproduksi angka tilt dari XML tanpa menjalankan Metashape, pada
lintang `φ` dan bujur `λ` referensi kamera bentuk basis ECEF→ENU:

```text
E = (−sin λ,             cos λ,            0)
N = (−sin φ cos λ, −sin φ sin λ,       cos φ)
U = ( cos φ cos λ,  cos φ sin λ,       sin φ)
a = [E; N; U] · R_component · kolom_3(R_camera→chunk)
tilt = atan2(√(a_E² + a_N²), −a_U)
shift bidang horizontal pada Δh = Δh · √(a_E² + a_N²)/(−a_U)
```

Gunakan radian dalam fungsi trigonometrik, pastikan `a_U < 0`, dan hitung
`φ, λ` dari metadata `reference y, x` kamera masing-masing. Median dihitung
atas 51 kamera aligned, bukan 51 piksel atau 43 patch ortho.

Metashape menyatakan bahwa alignment mengestimasi orientasi **interior dan
eksterior**, termasuk distorsi radial, per grup kalibrasi; metode rinci dan
semua parameter default tidak diumumkan di manual. Manual juga menyatakan
Metashape mencocokkan gambar pada beberapa skala dan meminimalkan galat
reproyeksi dalam satuan skala keypoint, bukan hanya piksel mentah.
[Sumber: manual Professional 2.3, bab Camera calibration dan Processing report](https://www.agisoft.com/pdf/metashape-pro_2_3_en.pdf).
API publik `OptimizeCameras` memperlihatkan parameter fit terpisah untuk
`f`, `cx`, `cy`, `k1`–`k4`, `p1`, `p2`, `b1`, `b2`, dan adaptive fitting;
itu membuktikan parameter dapat dioptimasi, **tidak** membuktikan fungsi rugi
atau urutan solver internal.
[Sumber: API Agisoft](https://download.agisoft.com/metashape-java-api/latest/com/agisoft/metashape/tasks/OptimizeCameras.html).

## Angka referensi yang harus direproduksi

Proyek: `/tmp/ms_probe/mapping01_v2/mapping01.psx`, 51 foto FC9313,
4096×3072, Metashape Pro 2.3.2 build 22956. XML kalibrasi `adjusted`:

| Parameter | Metashape, proyek ini | Profil awal TW saat ini |
|---|---:|---:|
| `f` px | 2595,241140 | 2436,3425 |
| `cx` px | +0,320404 | −0,696959 |
| `cy` px | −0,677261 | −2,918822 |
| `k1` | +0,079481820 | +0,07308185 |
| `k2` | −0,115059276 | −0,09259249 |
| `k3` | +0,072785647 | +0,052677356 |
| `p1` | −0,000105550 | −0,0000469824 |
| `p2` | +0,000374283 | +0,00037406012 |

Fokus adjusted referensi 6,522% lebih besar. Mengalikan GSD TW 0,0378 m/px
dengan `2436,3425/2595,241140` memberi sekitar 0,03549 m/px, dekat dengan
GSD ortho Metashape 0,0353 m/px. Ini **uji sensitivitas**, bukan identifikasi
lengkap rumus GSD otomatis Metashape. Kalibrasi adjusted adalah hasil solve
foto yang sama; menyalinnya ke produksi akan membocorkan jawaban benchmark.

Untuk 51 kamera, setelah transform komponen + ECEF→ENU, tilt sumbu optik
terhadap nadir: median 1,16694°, p90 1,87488°, maksimum 2,29023°.
Jarak lateral sumbu optik ke bidang horizontal 100 m di bawah pusat kamera
adalah `100 tan(tilt)`: median 2,03698 m, p90 3,27346 m, maksimum
3,99934 m. Kamera 0: tilt 2,16674°, arah sumbu optik ENU
`(+0,0374919, −0,0048765, −0,9992850)`, proyeksi lateral 3,78348 m pada
100 m. Besarnya serupa median selisih ortho TW 2,03 m, tetapi arah dan pola
lokal perlu diuji sebelum menetapkan kausalitas. Referensi yaw kamera 0 pada
XMP 123,4°; arah hasil alignment sekitar 140,168°.

Metrik pipeline sebelum eksperimen baru ada di
[`handover-gpt6-astra.md`](handover-gpt6-astra.md): ortho TW
0,0378 m/px, Metashape 0,0353 m/px; median pergeseran lokal 2,03 m,
p90 2,87 m pada 43 patch NCC≥0,8 tanpa transform global fitted. Itu metrik
registrasi citra, **bukan** RMSE GCP atau akurasi absolut.

## Hipotesis dan eksperimen pemisah

1. **Tilt pose per kamera.** Dengan kalibrasi dan permukaan yang sama serta
   pose referensi dibekukan, bandingkan proyeksi penuh 6DoF terhadap versi yang
   hanya mempertahankan yaw. Ukur vektor error pada grid dunia dan 43 patch
   lama. Prediksi: pola error berbeda menurut kamera, tidak berupa satu offset
   global. Jika vektor pergeseran dari tilt tidak searah residu ortho, cari
   penyebab lain.
2. **Self-calibration.** Dengan pose referensi dibekukan, jalankan proyeksi
   memakai profil TW lalu profil `adjusted` Metashape. Bandingkan galat piksel
   menurut radius citra, GSD, dan posisi tepi. Jangan mengubah produksi dengan
   hasil `adjusted`; implementasikan estimasi intrinsics bersama dan uji pada
   foto yang disisihkan.
3. **Translasi/Z/surface.** Tahan pose dan intrinsics yang sama, lalu ganti
   DEM/mesh TW versus referensi. Pisahkan residu di jalan datar, atap,
   vegetasi, dan tepi footprint. Jika residu berkorelasi dengan relief atau
   pemilihan source image mosaic, pose saja tidak cukup.
4. **Konvensi koordinat.** Uji proyeksi di pusat dan empat tepi foto, kamera
   dengan heading berlawanan 180°, dan resolusi resize yang membulat. Periksa
   `R` versus `Rᵀ`, tanda `Y`, urutan ENU/ECEF, skala komponen, distorsi,
   `b1/b2`, dan offset setengah piksel. Target numerik untuk proyeksi dengan
   parameter yang sama: beda <0,01 px pada `Calibration.project` API resmi
   jika runtime Metashape tersedia.

Untuk eksperimen ablation, simpan koordinat geografis dan grid pembanding
yang sama. Jangan fit affine/global transform saat menilai offset; laporkan
median **vektor** E/N dan median **panjang vektor** secara terpisah. Pakai
patch held-out yang tidak dipakai menyetel pose. Laporkan jumlah patch,
ambang tekstur/NCC, daerah NODATA, dan interval ketidakpastian bootstrap.

## Jalur implementasi yang diusulkan, belum terbukti identik

Bangun track fitur konsisten ≥3 foto dari korespondensi berpasangan dengan
uji epipolar/RANSAC dan cheirality. Optimasi bersama titik `P_j`, pusat kamera
`C_i`, rotasi `R_i ∈ SO(3)`, dan intrinsics `K_g` per grup kamera. Contoh
objektif **TW yang perlu diuji**, bukan klaim objektif persis Metashape:

```text
min Σ(i,j) ρ( ||z_ij − π(K_g, R_iᵀ(P_j − C_i))||² / σ_ij² )
    + Σi ||C_i − C_i,GPS||²_(Σ_i,GPS⁻¹)
    + prior skala/orientasi/marker bila tersedia
```

`σ_ij` harus memperhitungkan skala keypoint; prior GPS menggunakan akurasi
metadata yang masuk akal, bukan kunci posisi tetap. Gunakan update rotasi
pada manifold SO(3), Jacobian penuh termasuk distorsi, Schur complement
untuk titik, damping LM dengan acceptance berdasarkan objective sebenarnya,
serta gauge yang jelas. Validasi Jacobian analitik terhadap finite difference.
Tanpa GCP/checkpoint independen, optimasi dapat meningkatkan konsistensi
relatif tetapi tidak membuktikan akurasi geodetik absolut. Setelah pose berubah,
bangun ulang dense cloud, DEM, dan ortho; jangan gunakan raster lama.

Urutan penerimaan: tes unit proyeksi/rotasi/distorsi/derivatif, tes held-out
reprojection, pipeline 51 foto, bandingkan kembali ortho dan GSD terhadap
referensi, kemudian `cargo test`, `cargo check --all-targets`, dan build release.
Catat perubahan tiap ablation; jangan mengumumkan paritas dari satu metrik
atau hasil synthetic `sample_drone_survey/`.

## Status alat dan pemulihan

- `rea` CLI 6.7.0 tersedia; Hopper ada di
  `/Users/rachmataditiya/Applications/Hopper Disassembler.app`.
  Sesi Codex ini belum memuat MCP REA (`rea doctor --client codex --json`
  melaporkan drift registrasi), tetapi operasi REA statis melalui CLI berhasil.
- `mdutil -s /` melaporkan **Spotlight server is disabled**. Launcher Hopper
  (`Contents/MacOS/hopper`) karena itu mengembalikan *Hopper has not been
  found*. Menjalankan executable GUI langsung berakhir `SIGABRT` sebelum
  bridge REA siap; REA melaporkan cleanup belum terkonfirmasi dan menahan
  runtime `/tmp/rea-qOcJY5`. Jangan hapus lease/runtime atau mengklaim sudah
  mendapat pseudocode. Periksa status aplikasi dan panduan
  [`rea-reverse-engineering-guide.md`](../internal/rea-reverse-engineering-guide.md)
  sebelum mencoba sesi baru.
- Metashape CLI `-r` pada sesi ini juga abort dengan galat PasteBoard macOS.
  Proyek `.psx`, ZIP chunk, GeoTIFF, dan foto tetap dapat diperiksa offline.
- Sebelum dekompilasi berikutnya, pilih fungsi target dengan bukti xref dan
  bandingkan hasilnya dengan formula manual/API. Disassembly/pseudocode adalah
  rekonstruksi terbatas, bukan kode sumber asli atau bukti langsung default
  optimizer. Utamakan pengujian black-box yang dapat diulang.

Perintah reproduksi pembacaan artefak (read-only):

```sh
rea inspect-macho /Applications/MetashapePro.app/Contents/MacOS/MetashapePro --format json
rea inspect-artifact /tmp/ms_probe/mapping01_v2/mapping01.files/0/chunk.zip --format json
unzip -p /tmp/ms_probe/mapping01_v2/mapping01.files/0/chunk.zip doc.xml
mdutil -s /
```
