// What every Vitest config of this repository shares: the browsers and the page
// size the specs and the reference images are run with.
import {playwright} from '@vitest/browser-playwright';

// Explicitly disable hardware acceleration to make image diff more stable,
// with the same flags karma.conf.cjs uses.
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

// Karma ran the specs in a full browser window; Vitest's default is a phone
// sized 414x896 frame, which is narrower than some charts the specs create.
export const viewport = {width: 1024, height: 768};
