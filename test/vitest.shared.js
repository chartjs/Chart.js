// What every Vitest config of this repository shares: the browsers, the page
// size the specs and the reference images are run with, and the loader for the
// CommonJS image fixtures.
import {playwright} from '@vitest/browser-playwright';

// Explicitly disable hardware acceleration to make image diff more stable, and
// keep the page from being throttled while it runs in the background.
// https://github.com/chartjs/Chart.js/pull/5629
// Since FF 110 https://github.com/chartjs/Chart.js/issues/11164
//
// These belong to the provider: Vitest accepts launch options on an instance
// and silently ignores them.
export const browserProvider = playwright({
  launchOptions: {
    args: [
      '--disable-accelerated-2d-canvas',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ],
    firefoxUserPrefs: {
      'layers.acceleration.disabled': true,
      'gfx.canvas.accelerated': false
    }
  }
});

// A desktop-sized page: Vitest's default is a phone sized 414x896 frame, which
// is narrower than some charts the specs create.
export const viewport = {width: 1024, height: 768};

// The image fixtures in test/fixtures are CommonJS (`module.exports = {...}`),
// the form the existing ones and those in open pull requests use.
// Vite serves source files as ES modules unchanged, so wrap each one to give
// it a default export.
const fixtureFile = /\/test\/fixtures\/.+\.js$/;

export function commonjsFixtures() {
  return {
    name: 'chartjs-commonjs-fixtures',
    enforce: 'pre',
    transform(code, id) {
      if (!fixtureFile.test(id.split('?')[0]) || !code.includes('module.exports')) {
        return null;
      }
      // Prepended on the first line, so line numbers in errors stay the file's.
      return {
        code: 'const module = {exports: {}}; ' + code + '\nexport default module.exports;\n',
        map: null
      };
    }
  };
}
