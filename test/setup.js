// Vitest counterpart of test/index.js, which sets up the specs Karma runs.
import {acquireChart, afterEvent, createMockContext, releaseChart, setup, triggerMouseEvent, waitForResize} from 'chartjs-test-utils';
import moment from 'moment-timezone';
import Chart from '../src/index.umd.ts';
import {registerables} from '../src/index.ts';
// Registers the date adapter on the source modules: vitest.config.js aliases
// 'chart.js' to src/index.ts.
import 'chartjs-adapter-moment';

// force ratio=1 for tests on high-res/retina devices
// fixes https://github.com/chartjs/Chart.js/issues/4515
window.devicePixelRatio = 1;

// src/index.umd.ts registers the built-ins by passing the module namespaces to
// Chart.register(). Unbundled, those are real namespace objects, which
// Chart.register() does not iterate (isObject() rejects '[object Module]'),
// so nothing gets registered. The bundle Karma loads has plain objects there.
Chart.register(...registerables.flatMap((namespace) => Object.values(namespace)));

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
