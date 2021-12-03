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

jasmine.triggerMouseEvent = triggerMouseEvent;

// Set a fixed time zone (and, in particular, disable Daylight Saving Time) for
// more stable test results.
window.moment.tz.setDefault('Etc/UTC');

beforeEach(function() {
  addMatchers();
});

afterEach(function() {
  releaseCharts();
});
