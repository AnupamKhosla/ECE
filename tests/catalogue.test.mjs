import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const tutorial = new URL('../tutorial/', import.meta.url);

test('each published catalogue entry has its own chapter file', () => {
  const window = {};
  runInNewContext(readFileSync(new URL('assets/toc.js', tutorial), 'utf8'), { window });
  const chapters = window.TOC.books.flatMap(book => book.parts.flatMap(part => part.chapters));
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
