// Setup of the browser specs, the `browser` project of vitest.config.js: the
// Chart built from source, the date adapter and the globals the specs and
// fixtures use. The unit specs use test/setup.node.js instead.
import {acquireChart, afterEvent, createMockContext, releaseChart, setup, triggerMouseEvent, waitForResize} from 'chartjs-test-utils';
import moment from 'moment-timezone';
import Chart from '../src/index.umd.ts';
// Registers the date adapter on the source modules: vitest.config.js aliases
// 'chart.js' to src/index.ts.
import 'chartjs-adapter-moment';

// force ratio=1 for tests on high-res/retina devices
// fixes https://github.com/chartjs/Chart.js/issues/4515
window.devicePixelRatio = 1;

// Keep the scriptable default instead of the fixed 1 that setup() would set:
// specs change window.devicePixelRatio and expect the chart to follow it.
setup({Chart, devicePixelRatio: Chart.defaults.devicePixelRatio});

window.acquireChart = acquireChart;
window.afterEvent = afterEvent;
window.releaseChart = releaseChart;
window.waitForResize = waitForResize;
window.createMockContext = createMockContext;
window.triggerMouseEvent = triggerMouseEvent;

// Set a fixed time zone (and, in particular, disable Daylight Saving Time) for
// more stable test results.
window.moment = moment;
moment.tz.setDefault('Etc/UTC');

// Disable colors plugin for tests.
Chart.defaults.plugins.colors.enabled = false;
