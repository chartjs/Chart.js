var Context = require('./jasmine.context');
var matchers = require('./jasmine.matchers');
var utils = require('./jasmine.utils');

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

	window.acquireChart = acquireChart;
	window.releaseChart = releaseChart;
	window.createMockContext = createMockContext;

	// some style initialization to limit differences between browsers across different plateforms.
	utils.injectCSS(
		'.chartjs-wrapper, .chartjs-wrapper canvas {' +
			'border: 0;' +
			'margin: 0;' +
			'padding: 0;' +
		'}' +
		'.chartjs-wrapper {' +
			'position: absolute' +
		'}');

	jasmine.specsFromFixtures = utils.specsFromFixtures;

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
