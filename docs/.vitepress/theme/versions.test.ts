import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {parseVersions, versionMenu} from './versions.ts';

// The shape of https://data.jsdelivr.com/v1/package/npm/chart.js, trimmed to
// the cases that matter, plus a 4.12 and a 5.0 prerelease that do not exist yet.
const published = parseVersions({
  tags: {latest: '4.6.2', next: '5.0.0-beta.10'},
  versions: [
    '5.0.0-beta.10', '5.0.0-beta.9', '4.12.0', '4.6.2', '4.6.1', '4.5.1', '4.5.0',
    '4.0.1', '4.0.0', '4.0.0-release', '4.0.0-alpha.3', '3.0.0', '3.0.0-rc.7',
    '2.9.4', '2.6.0', '2.5.0', '2.0.0', '1.1.1', '1.0.1-beta.2', '0.2.0',
  ],
});

const texts = (items: {text: string}[]) => items.map((item) => item.text);

describe('versionMenu', () => {
  const menu = versionMenu({docsVersion: 'master', version: '4.6.2', versions: published});

  it('lists master, latest and the newest patch of each minor from 2.6 on', () => {
    assert.deepEqual(texts(menu.documentation), [
      'Development (master)',
      'Latest version',
      '4.12.0',
      '4.6.2 (latest)',
      '4.5.1',
      '4.0.1',
      '3.0.0',
      '2.9.4',
      '2.6.0',
    ]);
  });

  it('links the documentation outside this site, in the same tab', () => {
    assert.deepEqual(menu.documentation[0], {
      text: 'Development (master)',
      link: 'https://www.chartjs.org/docs/master/',
      target: '_self',
      noIcon: true,
    });
    assert.equal(menu.documentation[3].link, 'https://www.chartjs.org/docs/4.6.2/');
    assert.ok(menu.documentation.every((item) => item.target === '_self'));
  });

  it('lists the release notes of the five latest releases in a new tab', () => {
    assert.deepEqual(texts(menu.releaseNotes), ['5.0.0-beta.10', '4.12.0', '4.6.2', '4.6.1', '4.5.1']);
    assert.deepEqual(menu.releaseNotes[2], {
      text: '4.6.2',
      link: 'https://github.com/chartjs/Chart.js/releases/tag/v4.6.2',
      target: '_blank',
    });
  });

  it('still offers master and latest without a version list', () => {
    const offline = versionMenu({docsVersion: '4.6.2', version: '4.6.2', versions: []});
    assert.deepEqual(texts(offline.documentation), ['Development (master)', 'Latest version']);
    assert.deepEqual(offline.releaseNotes, []);
  });
});

describe('versionMenu title', () => {
  const title = (docsVersion: string, version: string, versions = published) =>
    versionMenu({docsVersion, version, versions}).title;
  const untagged = published.map((v) => ({...v, tag: null}));

  it('names the development docs', () => {
    assert.equal(title('master', '4.6.2'), 'Development (master)');
  });

  it('names the latest release', () => {
    assert.equal(title('latest', '4.6.2'), 'Latest (4.6.2)');
    assert.equal(title('4.6.2', '4.6.2'), 'Latest (4.6.2)');
    // Before the list is refreshed in the browser, /docs/latest/ is the latest.
    assert.equal(title('latest', '4.6.2', untagged), 'Latest (4.6.2)');
  });

  it('marks an older release outdated, also one built when it was the latest', () => {
    assert.equal(title('4.5.1', '4.5.1'), '4.5.1 (outdated)');
    assert.equal(title('latest', '4.5.1'), '4.5.1 (outdated)');
  });

  it('names a prerelease by its tag', () => {
    assert.equal(title('next', '5.0.0-beta.10'), '5.0.0-beta.10 (next)');
    assert.equal(title('next', '5.0.0-beta.9'), '5.0.0-beta.9 (outdated)');
  });
});
