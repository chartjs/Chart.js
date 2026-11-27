// Setup of the unit specs, the files named `*.unit.spec.js` (the `unit`
// project of vitest.config.js). They run in Node, without a DOM: the Chart
// built from source, the Chart.js matchers and the globals that need no
// browser. Pinned by test/specs/vitest.setup.node.unit.spec.js.
//
// No `window` is defined: src/helpers/helpers.dom.ts and src/index.umd.ts take
// its presence for a browser.
import {relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createMockContext, matchers} from 'chartjs-test-utils';
import Chart from '../src/index.umd.ts';

// setup() of chartjs-test-utils also injects CSS through `document`, so
// register only its matchers.
expect.extend(matchers);

global.Chart = Chart;
global.createMockContext = createMockContext;

const root = fileURLToPath(new URL('..', import.meta.url));

// The chart helpers need a canvas in a page. In a unit spec they fail with the
// rename that moves the file to the browsers, instead of a bare ReferenceError.
function needsBrowser(name) {
  return function() {
    const file = relative(root, expect.getState().testPath).split(sep).join('/');
    throw new Error(`${name} needs a browser: rename ${file} to drop .unit from its name`);
  };
}

for (const name of ['acquireChart', 'afterEvent', 'releaseChart', 'triggerMouseEvent', 'waitForResize']) {
  global[name] = needsBrowser(name);
}

// Disable colors plugin for tests, as test/setup.js does.
Chart.defaults.plugins.colors.enabled = false;
