import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const tutorial = new URL('../tutorial/', import.meta.url);
const window = {};
runInNewContext(readFileSync(new URL('assets/toc.js', tutorial), 'utf8'), { window });
const chapters = window.TOC.books.flatMap(book => book.parts.flatMap(part => part.chapters));

test('each published catalogue entry has its own chapter file', () => {
  const slugs = new Set();
  const files = new Set();

  for (const chapter of chapters) {
    assert.ok(!slugs.has(chapter.n), `Repeated chapter ID ${chapter.n}`);
    assert.ok(!files.has(chapter.file), `Repeated chapter path ${chapter.file}`);
    slugs.add(chapter.n);
    files.add(chapter.file);

    if (chapter.planned === true) continue;
    const file = statSync(new URL(chapter.file, tutorial), { throwIfNoEntry: false });
    assert.ok(file?.isFile() && file.size > 0, `${chapter.n} needs ${chapter.file}`);
  }
});

test('each published chapter has a local photograph and video reference', () => {
  const photoSource = /\bsrc=["'](\.\.\/assets\/(?:photos|bms)\/[^"']+\.(?:jpe?g|png|webp))["']/i;
  const altText = /\balt=["']([^"']+)["']/i;
  const illustration = /\b(?:diagram|schematic|3D viewer|screenshot)\b/i;
  const linkedVideo = /\b(?:href|src)=["']https?:\/\/(?:[\w.-]+\.)?(?:youtube(?:-nocookie)?\.com\/|youtu\.be\/|vimeo\.com\/)/i;
  const videoElement = /<video\b[^>]*\bsrc=["'][^"']+["']|<video\b[^>]*>\s*<source\b[^>]*\bsrc=["'][^"']+["']/i;
  const publisherVideo = /<p\b[^>]*class=["'][^"']*\bcourse-video\b[^"']*["'][^>]*>(?:(?!<\/p>)[\s\S])*?<a\b[^>]*href=["']https?:\/\/[^"']+["']/i;
  const gaps = [];

  for (const chapter of chapters.filter(chapter => chapter.planned !== true)) {
    const file = new URL(chapter.file, tutorial);
    const content = readFileSync(file, 'utf8');
    const hasPhoto = (content.match(/<img\b[^>]+>/gi) ?? []).some(image => {
      const source = photoSource.exec(image)?.[1];
      const description = altText.exec(image)?.[1];
      if (!source || !description || illustration.test(description)) return false;
      return statSync(new URL(source, file), { throwIfNoEntry: false })?.isFile();
    });

    if (!hasPhoto) gaps.push(`${chapter.n} needs a local photo with alt text`);
    if (!linkedVideo.test(content) && !videoElement.test(content) && !publisherVideo.test(content)) {
      gaps.push(`${chapter.n} needs a video reference`);
    }
  }

  assert.deepEqual(gaps, []);
});
