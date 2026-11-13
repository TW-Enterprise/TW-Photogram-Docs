import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, symlinkSync, writeFileSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const site = resolve(import.meta.dirname, '..');
function runFixture(markdown, executable = '/missing/chrome-for-regression-test') {
  const root = mkdtempSync(join(tmpdir(), 'tw-manual-test-'));
  try {
    mkdirSync(join(root, 'scripts'));
    mkdirSync(join(root, 'src/content/docs/panduan-pengguna'), { recursive: true });
    mkdirSync(join(root, 'public/manual/img'), { recursive: true });
    copyFileSync(join(site, 'scripts/generate-manual-pdf.mjs'), join(root, 'scripts/generate-manual-pdf.mjs'));
    symlinkSync(join(site, 'node_modules'), join(root, 'node_modules'));
    const chapters = ['01-pendahuluan-instalasi', '02-antarmuka', '03-memulai-proyek', '04-alur-kerja', '05-dem-kontur-lereng', '06-shapes-batas-wilayah', '07-simulasi-genangan', '08-cetak-laporan', '09-gaussian-splatting', '10-ekspor-interoperabilitas', '11-pemecahan-masalah', '12-glosarium-referensi'];
    for (const name of chapters) writeFileSync(join(root, 'src/content/docs/panduan-pengguna', name + '.md'), '# Chapter\n\n' + (name.startsWith('07') ? markdown : 'Text.'));
    copyFileSync(join(site, 'public/manual/img/07-waktu-nol.jpg'), join(root, 'public/manual/img/screenshot.jpg'));
    const result = spawnSync(process.execPath, [join(root, 'scripts/generate-manual-pdf.mjs')], {
      encoding: 'utf8', timeout: 30000,
      env: { ...process.env, PUPPETEER_EXECUTABLE_PATH: executable },
    });
    const htmlPath = join(root, 'dist/manual_book.html');
    return { ...result, html: existsSync(htmlPath) ? readFileSync(htmlPath, 'utf8') : '' };
  } finally { rmSync(root, { recursive: true, force: true }); }
}
test('PDF browser failure produces a nonzero exit status', () => {
  const result = runFixture('No images.');
  assert.equal(result.signal, null);
  assert.match(result.stderr, /chrome-for-regression-test/);
  assert.equal(result.status, 1, result.stdout + result.stderr);
});
test('missing screenshot fails before browser launch with its filename', () => {
  const result = runFixture('![Missing screenshot](/TW-Photogram-Docs/manual/img/missing.png)');
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /missing\.png/);
});

test('embedded screenshots and tutorial links survive PDF compilation', () => {
  const result = runFixture('## 7.0 Tutorial bergambar: mapping_01\n\n![Screenshot](/TW-Photogram-Docs/manual/img/screenshot.jpg)\n\n[Play](/TW-Photogram-Docs/panduan-pengguna/07-simulasi-genangan/#70-tutorial-bergambar-mapping_01)');
  assert.match(result.html, /url\(data:font\/woff2;base64,/);
  assert.match(result.html, /src="data:image\/jpeg;base64,/);
  assert.match(result.html, /id="70-tutorial-bergambar-mapping_01"/);
  assert.match(result.html, /href="#70-tutorial-bergambar-mapping_01"/);
});

test('broken internal PDF links fail with the missing target', () => {
  const result = runFixture('[Missing](#nonexistent-heading)');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing PDF link target: #nonexistent-heading/);
});
