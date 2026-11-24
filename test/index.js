import {acquireChart, releaseChart, createMockContext, afterEvent, waitForResize, injectWrapperCSS, triggerMouseEvent, addMatchers, releaseCharts} from 'chartjs-test-utils-karma';

// force ratio=1 for tests on high-res/retina devices
// fixes https://github.com/chartjs/Chart.js/issues/4515
window.devicePixelRatio = 1;

window.acquireChart = acquireChart;
window.afterEvent = afterEvent;
window.releaseChart = releaseChart;
window.waitForResize = waitForResize;
window.createMockContext = createMockContext;

injectWrapperCSS();

// The image fixtures run under Vitest, from test/specs/fixtures.spec.js. The
// `describe('auto', jasmine.fixture.specs(...))` lines left in the Karma specs
// get one placeholder each, because Jasmine rejects an empty describe.
jasmine.fixture = {
  specs: () => () => {
    it('runs under Vitest (test/specs/fixtures.spec.js)', () => {
      // Without an expectation Jasmine warns about every placeholder.
      expect().nothing();
    });
  }
};

jasmine.triggerMouseEvent = triggerMouseEvent;

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
