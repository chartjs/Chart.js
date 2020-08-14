import fixture from './fixture';
import Context from './context';
import matchers from './matchers';
import utils from './utils';

(function() {

	// Keep track of all acquired charts to automatically release them after each specs
	var charts = {};

	function acquireChart() {
		var chart = utils.acquireChart.apply(utils, arguments);
		charts[chart.id] = chart;
		return chart;
	}

	function releaseChart(chart) {
		utils.releaseChart.apply(utils, arguments);
		delete charts[chart.id];
	}

	function createMockContext() {
		return new Context();
	}

	// force ratio=1 for tests on high-res/retina devices
	// fixes https://github.com/chartjs/Chart.js/issues/4515
	window.devicePixelRatio = 1;

	window.acquireChart = acquireChart;
	window.afterEvent = utils.afterEvent;
	window.releaseChart = releaseChart;
	window.waitForResize = utils.waitForResize;
	window.createMockContext = createMockContext;

	// some style initialization to limit differences between browsers across different platforms.
	utils.injectCSS(
		'.chartjs-wrapper, .chartjs-wrapper canvas {' +
			'border: 0;' +
			'margin: 0;' +
			'padding: 0;' +
		'}' +
		'.chartjs-wrapper {' +
			'position: absolute' +
		'}');

	jasmine.fixture = fixture;
	jasmine.triggerMouseEvent = utils.triggerMouseEvent;

	beforeEach(function() {
		jasmine.addMatchers(matchers);
	});

	afterEach(function() {
		// Auto releasing acquired charts
		Object.keys(charts).forEach(function(id) {
			var chart = charts[id];
			if (!(chart.$test || {}).persistent) {
				releaseChart(chart);
			}
		});
	});
}());
