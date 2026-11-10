import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const base = process.env.DOCS_BASE ?? '/TW-Photogram-Docs';
const siteUrl = process.env.DOCS_SITE ?? 'https://tw-enterprise.github.io';

export default defineConfig({
  site: siteUrl,
  base,
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [
    starlight({
      title: 'TW Photogram',
      description: 'Dokumentasi Resmi & Panduan Pengguna TW Photogram — Platform Fotogrametri UAV, GIS, dan Analisis Bahaya Setara Agisoft Metashape Professional',
      logo: {
        src: './src/assets/logo.png',
        alt: 'TW Photogram Logo',
      },
      favicon: '/favicon.png',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/TW-Enterprise/TW-Photogram' },
      ],
      customCss: [
        'katex/dist/katex.min.css',
        './src/styles/custom.css',
      ],
      sidebar: [
        {
          label: 'Panduan Pengguna (User Manual)',
          items: [
            { label: '1. Pendahuluan & Instalasi', slug: 'panduan-pengguna/01-pendahuluan-instalasi' },
            { label: '2. Mengenal Antarmuka', slug: 'panduan-pengguna/02-antarmuka' },
            { label: '3. Memulai Proyek & GCP', slug: 'panduan-pengguna/03-memulai-proyek' },
            { label: '4. Alur Kerja 12 Tahap', slug: 'panduan-pengguna/04-alur-kerja' },
            { label: '5. DEM, Kontur & Lereng', slug: 'panduan-pengguna/05-dem-kontur-lereng' },
            { label: '6. Shapes & Batas Wilayah', slug: 'panduan-pengguna/06-shapes-batas-wilayah' },
            { label: '7. Simulasi Genangan Air', slug: 'panduan-pengguna/07-simulasi-genangan' },
            { label: '8. Cetak Lembar Peta & Laporan', slug: 'panduan-pengguna/08-cetak-laporan' },
            { label: '9. 3D Gaussian Splatting', slug: 'panduan-pengguna/09-gaussian-splatting' },
            { label: '10. Ekspor & Interoperabilitas', slug: 'panduan-pengguna/10-ekspor-interoperabilitas' },
            { label: '11. Pemecahan Masalah', slug: 'panduan-pengguna/11-pemecahan-masalah' },
            { label: '12. Glosarium & Referensi', slug: 'panduan-pengguna/12-glosarium-referensi' },
          ],
        },
        {
          label: 'Spesifikasi Rekayasa (Engineering Specs)',
          items: [
            { label: 'Matriks Paritas Agisoft Metashape', slug: 'engineering/metashape-parity-spec' },
            { label: 'Geometri Pemetaan Drone & Yaw Alternasi', slug: 'engineering/drone-mapping-geometry' },
            { label: 'Model Kamera & Distorsi Lensa', slug: 'engineering/metashape-camera-geometry' },
            { label: 'Kalibrasi Elevasi & Geoid DEMNAS', slug: 'engineering/elevation-calibration' },
            { label: 'Model Solver Genangan Inersial (Bates)', slug: 'engineering/flood-model' },
            { label: 'Mesin Pelaporan & Lembar Peta BIG', slug: 'engineering/report-and-map-sheet' },
            { label: 'Vektor Batas Wilayah & Kliping Raster', slug: 'engineering/vector-and-boundaries' },
            { label: '3D Gaussian Splatting & Brush', slug: 'engineering/gaussian-splatting' },
            { label: 'Port Algoritma OpenSfM & ODM', slug: 'engineering/odm-algorithm-ports' },
            { label: 'Sistem Desain Antarmuka (UI/UX)', slug: 'engineering/ui-design-system' },
            { label: 'Infografis & Visualisasi Medan DEM', slug: 'engineering/infographics-and-dem-display' },
          ],
        },
        {
          label: 'Platform & Portabilitas',
          items: [
            { label: 'Paket Portabel Windows & GPU', slug: 'platform/windows' },
            { label: 'Verifikasi Peta Offline Windows', slug: 'platform/windows-maps-verification' },
          ],
        },
        {
          label: 'Reverse Engineering & Benchmark',
          items: [
            { label: 'Panduan REA Agisoft Metashape', slug: 'internal/rea-guide' },
          ],
        },
      ],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
    }),
    mermaid({
      autoTheme: true,
    }),
  ],
});
