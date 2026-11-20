import {acquireChart, releaseChart, createMockContext, afterEvent, waitForResize, injectWrapperCSS, specsFromFixtures, triggerMouseEvent, addMatchers, releaseCharts} from 'chartjs-test-utils';

// force ratio=1 for tests on high-res/retina devices
// fixes https://github.com/chartjs/Chart.js/issues/4515
window.devicePixelRatio = 1;

window.acquireChart = acquireChart;
window.afterEvent = afterEvent;
window.releaseChart = releaseChart;
window.waitForResize = waitForResize;
window.createMockContext = createMockContext;

injectWrapperCSS();

jasmine.fixture = {
  specs: specsFromFixtures
};

// Some tests expect triggerMouseEvent to always resolve even when the chart is not listening
// (e.g. hover disabled). Wrap with a timeout to avoid hanging the test suite.
const _triggerMouseEvent = triggerMouseEvent;
jasmine.triggerMouseEvent = async function(chart, type, el) {
  const timeout = 100;
  return Promise.race([
    _triggerMouseEvent(chart, type, el),
    new Promise((resolve) => setTimeout(resolve, timeout))
  ]);
};

// Set a fixed time zone (and, in particular, disable Daylight Saving Time) for
// more stable test results.
window.moment.tz.setDefault('Etc/UTC');

beforeAll(() => {
  // Disable colors plugin for tests.
  window.Chart.defaults.plugins.colors.enabled = false;
});

beforeEach(() => {
  addMatchers();
});

afterEach(() => {
  releaseCharts();
});
