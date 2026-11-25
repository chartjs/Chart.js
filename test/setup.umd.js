// Setup of the smoke suite (vitest.umd.config.js): loads the built bundle the
// way a page does, with a script tag that sets `window.Chart`, instead of the
// source modules test/setup.js imports.
import {setup, triggerMouseEvent} from 'chartjs-test-utils';

const bundle = '/dist/chart.umd.min.js';

await new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = bundle;
  script.onload = resolve;
  script.onerror = () => reject(new Error(`Could not load ${bundle}: run \`pnpm run build\` first.`));
  document.head.appendChild(script);
});

// force ratio=1 for tests on high-res/retina devices
// fixes https://github.com/chartjs/Chart.js/issues/4515
window.devicePixelRatio = 1;

setup({Chart: window.Chart});

window.triggerMouseEvent = triggerMouseEvent;

// Disable colors plugin for tests, as test/setup.js does: the reference images
// were rendered without it.
window.Chart.defaults.plugins.colors.enabled = false;
