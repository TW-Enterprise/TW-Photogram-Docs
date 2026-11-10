---
title: "Panduan Geometri Pemetaan Drone & Rekonstruksi Ortomosaik (TW-Photogram)"
description: "Dokumen ini adalah spesifikasi teknis dan panduan wajib bagi seluruh pengembang (developers) dan AI agents (Antigravity, Claude Code, Gemini CLI, Cursor, Wind..."
---

Dokumen ini adalah spesifikasi teknis dan panduan wajib bagi seluruh pengembang (*developers*) dan AI agents (Antigravity, Claude Code, Gemini CLI, Cursor, Windsurf) yang memelihara serta mengembangkan modul Structure-from-Motion (SfM), Multi-View Stereo (MVS), Digital Elevation Model (DEM), dan Ortomosaik pada **TW-Photogram**.

---

## 1. Latar Belakang & Studi Kasus Survei Drone Nyata (`mapping_01`)

Pada pengujian pemetaan drone komersial di lapangan (misal: DJI Mini 4 Pro / Mini 5 Pro, 51 foto udara format 4096x3072), drone terbang dengan pola bolak-balik kisi (*lawnmower grid flight*).

### Masalah yang Pernah Terjadi:
1. **Atap dan Jalan Terbelah / Tumpang Tindih:**
   - Foto pada jalur maju (Strip 1) diambil dengan heading gimbal $+122.3^\circ$.
   - Foto pada jalur balik (Strip 2) diambil dengan heading gimbal $-57.7^\circ$ ($180^\circ$ berlawanan arah).
   - Apabila proyeksi piksel mengabaikan sudut yaw kamera, foto pada jalur balik diproyeksikan terbalik $180^\circ$ terhadap objek di tanah, membelah jalan raya aspal dan menduplikasi atap rumah.
2. **Feature Tracks Tereliminasi di SBA:**
   - Tanpa rotasi yaw pada Sparse Bundle Adjustment (SBA), reproyeksi 3D ke 2D meleset ratusan piksel, sehingga ribuan tie points asli dibuang oleh sigma threshold.
3. **Patahan Garis Sambungan (*Hard Knife-Edge Voronoi*):**
   - Mengambil 100% warna dari 1 kamera terdekat tanpa *feathering* menghasilkan garis patahan bergerigi di sepanjang perbatasan foto karena toleransi GPS sipil ($\approx 1\text{m}$).

---

## 2. Sistem Koordinat & Konvensi Geodesi

1. **Sistem Koordinat Global WGS84:**
   - Lintang (*Latitude* $\phi$), Bujur (*Longitude* $\lambda$), Ketinggian Elipsoid (*Altitude* $h$).
2. **Sistem Koordinat Metrik Lokal East-North-Up (ENU):**
   - Dihitung terhadap kamera referensi pertama $(\phi_0, \lambda_0, h_0)$:
     $$\Delta X = R \cdot (\lambda - \lambda_0) \cdot \cos\left(\frac{\phi + \phi_0}{2}\right) \quad (\text{Timur / East})$$
     $$\Delta Y = R \cdot (\phi - \phi_0) \quad (\text{Utara / North})$$
     $$\Delta Z = h - h_0 \quad (\text{Atas / Up})$$
     di mana $R = 6.378.137,0\text{ m}$ (jari-jari semi-mayor WGS84).
3. **Sistem Koordinat Sensor Kamera (Pinhole Frame):**
   - Asal koordinat $(c_x, c_y)$ di titik tengah sensor ($W/2, H/2$).
   - Sumbu $u$: Mengarah ke kanan (*Camera Right*).
   - Sumbu $v$: Mengarah ke bawah (*Camera Down*).
   - Arah pandang nadir (pitch $-90^\circ$): Atas foto mengarah ke depan (*Camera Forward*).

---

## 3. Matematika Proyeksi Kamera dengan Sudut Yaw $\psi$

Untuk sudut yaw gimbal $\psi$ (diukur searah jarum jam dari Utara geografis):
- Vektor satuan Maju (*Forward*): $\vec{f} = (\sin\psi, \cos\psi)$
- Vektor satuan Kanan (*Right*): $\vec{r} = (\cos\psi, -\sin\psi)$

Untuk pergeseran tanah $\Delta X = gx - c_x$ dan $\Delta Y = gy - c_y$:
$$\begin{pmatrix} x' \\ y' \end{pmatrix} = \begin{pmatrix} \cos\psi & -\sin\psi \\ \sin\psi & \cos\psi \end{pmatrix} \begin{pmatrix} \Delta X \\ \Delta Y \end{pmatrix}$$

Proyeksi ke koordinat piksel sensor $(u, v)$:
$$u = c_x + \frac{x' \cdot f_{\text{px}}}{dz}$$
$$v = c_y - \frac{y' \cdot f_{\text{px}}}{dz}$$
di mana $dz = (c_z - gz) > 0$ adalah tinggi terbang relatif di atas tanah (*AGL*).

---

## 4. Sparse Bundle Adjustment (SBA) Yaw-Aware Jacobian

Pada algoritma optimasi Levenberg-Marquardt SBA, turunan parsial terhadap posisi ground point $P(X, Y, Z)$ wajib memperhitungkan matriks rotasi:

$$J_u = \left( \frac{\partial u}{\partial X}, \; \frac{\partial u}{\partial Y}, \; \frac{\partial u}{\partial Z} \right) = \left( \frac{f_{\text{px}}}{dz} \cos\psi, \; -\frac{f_{\text{px}}}{dz} \sin\psi, \; \frac{x' \cdot f_{\text{px}}}{dz^2} \right)$$
$$J_v = \left( \frac{\partial v}{\partial X}, \; \frac{\partial v}{\partial Y}, \; \frac{\partial v}{\partial Z} \right) = \left( -\frac{f_{\text{px}}}{dz} \sin\psi, \; -\frac{f_{\text{px}}}{dz} \cos\psi, \; -\frac{y' \cdot f_{\text{px}}}{dz^2} \right)$$

Residual reproyeksi:
$$r_x = u_{\text{obs}} - u_{\text{pred}}, \quad r_y = v_{\text{obs}} - v_{\text{pred}}$$
$$J^T J \Delta P = J^T r$$

Dengan menyertakan $\psi$, feature tracks nyata menghasilkan residual sub-piksel ($< 1.5\text{ px}$) dan tidak dibuang oleh sigma filter.

---

## 5. Metashape-Grade Two-Pass Seamline Blending

Untuk menghasilkan ortomosaik berkualitas tinggi setara Agisoft Metashape tanpa sambungan patah (*seams*) dan tanpa bayangan ganda (*ghosting*):

### Langkah 1: Nadir Distance Pass
Untuk setiap piksel raster $(gx, gy)$, cari jarak nadir terdekat:
$$d_{\min} = \min_{k} \sqrt{(gx - c_{x,k})^2 + (gy - c_{y,k})^2}$$

### Langkah 2: Quadratic Smoothstep Feathering Corridor
Hanya kamera dengan selisih jarak $\Delta d = d_k - d_{\min} \le 3.0\text{m}$ yang diakumulasi:
$$w_{\text{dist}} = \left(1.0 - \frac{\Delta d}{3.0}\right)^2$$
$$w_{\text{edge}} = \text{smoothstep}\left(\frac{d_{\text{edge}}}{\text{margin}}\right) = f^2 (3 - 2f)$$
$$w_k = w_{\text{dist}} \cdot w_{\text{edge}}$$

Warna final piksel:
$$\text{Color}(gx, gy) = \frac{\sum_k w_k \cdot \text{Pixel}_k}{\sum_k w_k}$$

### Keuntungan:
1. **Nadir Dominance:** Di luar koridor transisi 3 meter, hanya 1 kamera terdekat yang memberikan bobot 100%, sehingga tekstur genteng rumah dan marka jalan aspal tetap tajam tanpa *ghosting*.
2. **Seamless Seamline:** Di perbatasan sambungan antar-jalur, transisi bobot berlangsung mulus bertingkat dua (*quadratic continuous*).
3. **Transparent NODATA:** Area di luar jangkauan foto bernilai $\text{RGBA} = (0, 0, 0, 0)$ transparan sempurna.

---

## 6. Aturan Wajib untuk AI Agent

1. **JANGAN PERNAH** menghapus atau mengabaikan pembacaan EXIF `gimbal_yaw` / `gimbal_pitch` / `gimbal_roll`.
2. **JANGAN PERNAH** mengasumsikan kamera drone selalu menghadap utara ($0^\circ$).
3. **JANGAN PERNAH** menggunakan hard Voronoi knife-edge cut tanpa feathering pada ortomosaik.
4. **SELALU** reset `self.ortho_texture = None` dan `self.dem_texture = None` di `TaskMessage::Finished` agar tekstur GPU segera diperbarui saat pipeline selesai.
5. **JALANKAN** `cargo test --release` dan pastikan 100% tes lulus sebelum melakukan commit ke git.
