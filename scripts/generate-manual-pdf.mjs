#!/usr/bin/env node
/**
 * TW-Photogram — Manual Book PDF Generator
 * Mengompilasi seluruh panduan pengguna dan spesifikasi alur kerja menjadi
 * satu dokumen PDF resmi berkualitas cetak A4 (Manual Book).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import GithubSlugger from 'github-slugger';
import { createRequire } from 'node:module';
import markedKatex from 'marked-katex-extension';

marked.use(markedKatex({ throwOnError: false }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
const DOCS_DIR = join(SITE_DIR, 'src', 'content', 'docs');
const DIST_DIR = join(SITE_DIR, 'dist');
const OUT_PDF = join(DIST_DIR, 'TW-Photogram-Manual-Book.pdf');
const PUBLIC_DIR = join(SITE_DIR, 'public');
const BASE = (process.env.DOCS_BASE ?? '/TW-Photogram-Docs').replace(/\/$/, '');

// Embed local screenshots so setContent() needs no server or deployment to load them.
function embedImages(tokens, chapterPath) {
  marked.walkTokens(tokens, (token) => {
    if (token.type === 'link') {
      const match = token.href.match(/^(?:\/TW-Photogram-Docs\/panduan-pengguna\/)?(\d{2}-[\w-]+)(?:\.md|\/)(#[^]*)?$/);
      if (match) token.href = match[2] || '#' + match[1];
    }
    if (token.type !== 'image') return;
    const href = token.href;
    const local = href.startsWith(BASE + '/') ? href.slice(BASE.length) : href;
    const path = local.startsWith('/')
      ? resolve(PUBLIC_DIR, '.' + decodeURIComponent(local))
      : resolve(dirname(chapterPath), decodeURIComponent(local));
    if (!path.startsWith(PUBLIC_DIR + sep) && !path.startsWith(DOCS_DIR + sep)) {
      throw new Error(`Screenshot must be a local documentation asset: ${href}`);
    }
    const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(path).toLowerCase()];
    if (!mime) throw new Error(`Unsupported screenshot format: ${href}`);
    token.href = `data:${mime};base64,${readFileSync(path).toString('base64')}`;
  });
  return tokens;
}

// Daftar bab dan urutan file dokumen
const CHAPTERS = [
  {
    chapterTitle: 'Bab 1: Pendahuluan & Instalasi',
    chapterSummary: 'Persyaratan sistem, instalasi tanpa dependensi luar pada macOS/Windows/Linux, dan pemuatan sampel 24-foto drone DJI.',
    files: ['panduan-pengguna/01-pendahuluan-instalasi.md']
  },
  {
    chapterTitle: 'Bab 2: Mengenal Antarmuka & Panel Dock',
    chapterSummary: 'Menu, bilah tombol, viewport Model/Ortho/Photo, panel Workspace, Reference, Batas, Genangan, Photos, dan Console.',
    files: ['panduan-pengguna/02-antarmuka.md']
  },
  {
    chapterTitle: 'Bab 3: Memulai Proyek & Georeferensi GCP',
    chapterSummary: 'Impor foto, ekstraksi EXIF GPS WGS84, proyeksi metrik ENU, impor koordinat GCP, dan penandaan titik kontrol tanah pada foto.',
    files: ['panduan-pengguna/03-memulai-proyek.md']
  },
  {
    chapterTitle: 'Bab 4: Alur Kerja 12 Tahap Pemrosesan',
    chapterSummary: 'Penyelarasan SfM, Sparse Bundle Adjustment Levenberg-Marquardt, Multi-View Stereo SGM, dan klasifikasi tanah SMRF/CSF.',
    files: ['panduan-pengguna/04-alur-kerja.md']
  },
  {
    chapterTitle: 'Bab 5: DEM, Kontur & Analisis Lereng',
    chapterSummary: 'Pembuatan DSM/DTM via interpolasi Delaunay 2.5D, kontur marching-squares, analisis kemiringan lereng, aspek, dan kalibrasi DEMNAS.',
    files: ['panduan-pengguna/05-dem-kontur-lereng.md']
  },
  {
    chapterTitle: 'Bab 6: Shapes, Batas Wilayah & Kliping',
    chapterSummary: 'Impor Shapefile/GeoJSON/KML, unduh batas administrasi BIG/geoBoundaries, peran batas wilayah, kliping raster, dan statistik zonal.',
    files: ['panduan-pengguna/06-shapes-batas-wilayah.md']
  },
  {
    chapterTitle: 'Bab 7: Simulasi Genangan Air & Bahaya Banjir',
    chapterSummary: 'Model solver aliran inersial lokal (Bates 2010), infiltrasi Green-Ampt, hyetograph hujan, dan pemetaan kelas bahaya ARR 2019 / BNPB.',
    files: ['panduan-pengguna/07-simulasi-genangan.md']
  },
  {
    chapterTitle: 'Bab 8: Cetak Lembar Peta BIG & Laporan ASPRS',
    chapterSummary: 'Penyusunan lembar peta standar BIG/RBI (skala 1:1000 - 1:50000) dan laporan akurasi geospasial standar ASPRS 2014 / SNI 8202:2015.',
    files: ['panduan-pengguna/08-cetak-laporan.md']
  },
  {
    chapterTitle: 'Bab 9: 3D Gaussian Splatting & Integrasi Brush',
    chapterSummary: 'Ekspor dataset COLMAP, pelatihan model radiance fields via Brush, penampil GPU, dan alat potong/saring titik Gaussian.',
    files: ['panduan-pengguna/09-gaussian-splatting.md']
  },
  {
    chapterTitle: 'Bab 10: Ekspor & Interoperabilitas Sistem Luar',
    chapterSummary: 'Daftar lengkap format ekspor (GeoTIFF, LAS/LAZ, PLY, DXF, KMZ) dan panduan membuka hasil di QGIS, Metashape, AutoCAD, dan Global Mapper.',
    files: ['panduan-pengguna/10-ekspor-interoperabilitas.md']
  },
  {
    chapterTitle: 'Bab 11: Solusi Pemecahan Masalah (Troubleshooting)',
    chapterSummary: 'Panduan mengatasi kendala kegagalan penyelarasan foto, DEM berlubang, foto hilang, optimasi memori RAM, dan akselerasi GPU.',
    files: ['panduan-pengguna/11-pemecahan-masalah.md']
  },
  {
    chapterTitle: 'Bab 12: Glosarium & Standar Referensi',
    chapterSummary: 'Daftar istilah fotogrametri digital, geodesi, hidrologi, serta standar nasional dan internasional yang dirujuk.',
    files: ['panduan-pengguna/12-glosarium-referensi.md']
  },
];

function sanitizeMarkdown(md) {
  // Hapus blok frontmatter jika ada
  return md.replace(/^---[\s\S]*?---\s*/, '');
}

function embeddedKatexCss() {
  const require = createRequire(import.meta.url);
  const cssPath = require.resolve('katex/dist/katex.min.css');
  return readFileSync(cssPath, 'utf8').replace(/url\(([^)]+)\)/g, (_, relative) => {
    const path = resolve(dirname(cssPath), relative.replace(/["']/g, ''));
    const mime = { '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' }[extname(path)];
    if (!mime) throw new Error(`Unsupported KaTeX font: ${path}`);
    return `url(data:${mime};base64,${readFileSync(path).toString('base64')})`;
  });
}

async function generatePdf() {
  console.log('🚀 Memulai kompilasi TW-Photogram Manual Book PDF...');

  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true });
  }

  let htmlBody = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>TW-Photogram — Manual Book & Dokumentasi Resmi</title>
  <style>${embeddedKatexCss()}</style>
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.55;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .cover {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 85vh;
      text-align: center;
      padding: 2rem;
    }
    .cover h1 {
      font-size: 28pt;
      margin: 0 0 0.5rem;
      color: #0b1120;
      letter-spacing: -0.02em;
    }
    .cover .subtitle {
      font-size: 13pt;
      color: #0284c7;
      font-weight: 600;
      margin: 0 0 2rem;
    }
    .cover .badge {
      display: inline-block;
      padding: 0.35rem 1rem;
      background: #e0f2fe;
      color: #0369a1;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 9pt;
      margin-bottom: 2.5rem;
    }
    .cover .meta {
      font-size: 9pt;
      color: #64748b;
      margin-top: 3rem;
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
      max-width: 400px;
    }
    .toc {
      page-break-after: always;
      padding: 1rem 0;
    }
    .toc h2 {
      font-size: 16pt;
      color: #0b1120;
      border-bottom: 2px solid #00d2ff;
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      border-bottom: 1px dotted #cbd5e1;
      padding-bottom: 0.25rem;
    }
    .chapter {
      page-break-before: always;
      margin-top: 1.5rem;
    }
    h1 {
      font-size: 18pt;
      color: #0b1120;
      border-bottom: 2px solid #00d2ff;
      padding-bottom: 0.35rem;
      margin-top: 0;
    }
    h2 {
      font-size: 13pt;
      color: #0369a1;
      margin-top: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.2rem;
    }
    h3 {
      font-size: 11pt;
      color: #0f172a;
      margin-top: 1.25rem;
    }
    p, li {
      text-align: justify;
    }
    img {
      display: block;
      max-width: 100%;
      max-height: 170mm;
      object-fit: contain;
      margin: 0.75rem auto;
      break-inside: avoid;
    }
    p:has(> img) { break-inside: avoid; break-after: avoid; }
    p:has(> img) + p { break-before: avoid; }
    code {
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0369a1;
      padding: 0.15rem 0.35rem;
      border-radius: 3px;
    }
    pre code {
      display: block;
      padding: 0.75rem;
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      line-height: 1.4;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 8.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 0.4rem 0.6rem;
      text-align: left;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #0f172a;
    }
    blockquote {
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      border-left: 3px solid #00d2ff;
      background: #f0f9ff;
      color: #0369a1;
      font-size: 9pt;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover">
    <h1>TW Photogram</h1>
    <div class="subtitle">Buku Panduan Pengguna & Dokumentasi Rekayasa Lengkap</div>
    <div class="badge">Platform Fotogrametri UAV, GIS, dan Analisis Bahaya • Edisi 2026</div>
    <p style="max-width: 480px; font-size: 10pt; color: #334155; line-height: 1.6;">
      Panduan operasional komprehensif mulai dari pengolahan foto drone, GCP, penyejajaran SfM, Multi-View Stereo, DEM, ortomosaik, simulasi genangan, lembar peta standar BIG, hingga 3D Gaussian Splatting dengan paritas Agisoft Metashape Professional.
    </p>
    <div class="meta">
      <strong>TW-Enterprise</strong> • Made with ❤️ by Throttle Warriors<br>
      Repositori: <a href="https://github.com/TW-Enterprise/TW-Photogram">github.com/TW-Enterprise/TW-Photogram</a><br>
      Dokumentasi Daring: <a href="https://tw-enterprise.github.io/TW-Photogram-Docs/">tw-enterprise.github.io/TW-Photogram-Docs</a>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="toc">
    <h2>Daftar Bab & Materi Pelatihan</h2>
`;

  CHAPTERS.forEach((ch, idx) => {
    htmlBody += `
    <div class="toc-item">
      <div><strong>${ch.chapterTitle}</strong><br><span style="font-size: 8pt; color: #64748b;">${ch.chapterSummary}</span></div>
    </div>`;
  });

  htmlBody += `
  </div>
`;

  // Append chapter contents
  for (const ch of CHAPTERS) {
    htmlBody += `<div class="chapter">`;
    for (const relPath of ch.files) {
      const fullPath = join(DOCS_DIR, relPath);
      const rawMd = readFileSync(fullPath, 'utf8');
      const cleanMd = sanitizeMarkdown(rawMd);
      const slugger = new GithubSlugger();
      const renderer = new marked.Renderer();
      renderer.heading = function ({ tokens, depth, text }) {
        const id = slugger.slug(text.replace(/<[^>]*>/g, '').replace(/[`*_]/g, (c) => c === '_' ? '_' : ''));
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      };
      const chapterId = relPath.split('/').pop().replace(/\.md$/, '');
      htmlBody += `<section id="${chapterId}">`;
      htmlBody += marked.parser(embedImages(marked.lexer(cleanMd), fullPath), { renderer });
      htmlBody += '</section>';
    }
    htmlBody += `</div>`;
  }

  htmlBody += `
</body>
</html>
`;

  const ids = new Set(Array.from(htmlBody.matchAll(/\bid="([^"]+)"/g), (m) => m[1]));
  for (const [, fragment] of htmlBody.matchAll(/\bhref="#([^"]+)"/g)) {
    if (!ids.has(decodeURIComponent(fragment))) throw new Error(`Missing PDF link target: #${fragment}`);
  }
  const tempHtml = join(DIST_DIR, 'manual_book.html');
  writeFileSync(tempHtml, htmlBody, 'utf8');
  console.log(`✓ File HTML sementara dibuat: ${tempHtml}`);

  const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(htmlBody, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, async (img) => {
        await img.decode();
        if (!img.naturalWidth) throw new Error(`Screenshot failed to load: ${img.alt}`);
      }));
    });
    await page.pdf({
      path: OUT_PDF,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div style="width: 100%; font-size: 8pt; color: #94a3b8; text-align: center; font-family: sans-serif;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    });
    console.log(`✅ Sukses mengompilasi PDF: ${OUT_PDF}`);
  } finally {
    await browser.close();
  }
}

generatePdf().catch((err) => {
  console.error('Gagal generate PDF:', err);
  process.exitCode = 1;
});
