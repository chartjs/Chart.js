import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { redirects, writeRedirects } from './redirects.ts';

const docs = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// The addresses the VuePress site redirected (docs/.vuepress/redirects and its
// `redirect` plugin), and its two enumeration pages, which TypeDoc now writes
// to api/enumerations/.
const expected = [
  ['charts/index.html', 'charts/line.html'],
  ['general/index.html', 'general/data-structures.html'],
  ['samples/index.html', 'samples/information.html'],
  ['getting-started/v3-migration/index.html', 'migration/v3-migration.html'],
  ['api/enums/DecimationAlgorithm.html', 'api/enumerations/DecimationAlgorithm.html'],
  ['api/enums/UpdateModeEnum.html', 'api/enumerations/UpdateModeEnum.html'],
];

describe('redirects', () => {
  it('lists the old addresses and their pages', () => {
    assert.deepEqual([...redirects].sort(), [...expected].sort());
  });

  it('leads each guide address to a page that exists', () => {
    for (const [, to] of expected.filter(([from]) => !from.startsWith('api/'))) {
      assert.ok(existsSync(path.join(docs, ...to.replace(/\.html$/, '.md').split('/'))), to);
    }
  });

  for (const base of ['/docs/master/', '/vitepress/']) {
    describe(`with base ${base}`, () => {
      const outDir = mkdtempSync(path.join(tmpdir(), 'chartjs-redirects-'));
      after(() => rmSync(outDir, {recursive: true, force: true}));
      writeRedirects({outDir, site: {base}});

      for (const [from, to] of expected) {
        it(`writes ${from}, leading to ${to} and keeping the hash`, () => {
          const file = path.join(outDir, ...from.split('/'));
          assert.ok(existsSync(file), `${file} is missing`);
          const html = readFileSync(file, 'utf8');
          const url = base + to;
          assert.ok(html.includes(`location.replace(${JSON.stringify(url)} + location.hash)`), 'script');
          assert.ok(html.includes(`<meta http-equiv="refresh" content="0; url=${url}">`), 'meta refresh');
          assert.ok(html.includes(`<link rel="canonical" href="${url}">`), 'canonical link');
        });
      }
    });
  }
});
