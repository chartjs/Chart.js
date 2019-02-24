(function(global) {

	var Samples = global.Samples || (global.Samples = {});

	Samples.items = [{
		title: 'Bar charts',
		items: [{
			title: 'Vertical',
			path: 'charts/bar/vertical.html'
		}, {
			title: 'Horizontal',
			path: 'charts/bar/horizontal.html'
		}, {
			title: 'Multi axis',
			path: 'charts/bar/multi-axis.html'
		}, {
			title: 'Stacked',
			path: 'charts/bar/stacked.html'
		}, {
			title: 'Stacked groups',
			path: 'charts/bar/stacked-group.html'
		}]
	}, {
		title: 'Line charts',
		items: [{
			title: 'Basic',
			path: 'charts/line/basic.html'
		}, {
			title: 'Multi axis',
			path: 'charts/line/multi-axis.html'
		}, {
			title: 'Stepped',
			path: 'charts/line/stepped.html'
		}, {
			title: 'Interpolation',
			path: 'charts/line/interpolation-modes.html'
		}, {
			title: 'Line styles',
			path: 'charts/line/line-styles.html'
		}, {
			title: 'Point styles',
			path: 'charts/line/point-styles.html'
		}, {
			title: 'Point sizes',
			path: 'charts/line/point-sizes.html'
		}]
	}, {
		title: 'Area charts',
		items: [{
			title: 'Boundaries (line)',
			path: 'charts/area/line-boundaries.html'
		}, {
			title: 'Datasets (line)',
			path: 'charts/area/line-datasets.html'
		}, {
			title: 'Stacked (line)',
			path: 'charts/area/line-stacked.html'
		}, {
			title: 'Radar',
			path: 'charts/area/radar.html'
		}]
	}, {
		title: 'Other charts',
		items: [{
			title: 'Scatter',
			path: 'charts/scatter/basic.html'
		}, {
			title: 'Scatter - Multi axis',
			path: 'charts/scatter/multi-axis.html'
		}, {
			title: 'Doughnut',
			path: 'charts/doughnut.html'
		}, {
			title: 'Pie',
			path: 'charts/pie.html'
		}, {
			title: 'Polar area',
			path: 'charts/polar-area.html'
		}, {
			title: 'Radar',
			path: 'charts/radar.html'
		}, {
			title: 'Combo bar/line',
			path: 'charts/combo-bar-line.html'
		}]
	}, {
		title: 'Linear scale',
		items: [{
			title: 'Step size',
			path: 'scales/linear/step-size.html'
		}, {
			title: 'Min & max',
			path: 'scales/linear/min-max.html'
		}, {
			title: 'Min & max (suggested)',
			path: 'scales/linear/min-max-suggested.html'
		}]
	}, {
		title: 'Logarithmic scale',
		items: [{
			title: 'Line',
			path: 'scales/logarithmic/line.html'
		}, {
			title: 'Scatter',
			path: 'scales/logarithmic/scatter.html'
		}]
	}, {
		title: 'Time scale',
		items: [{
			title: 'Line',
			path: 'scales/time/line.html'
		}, {
			title: 'Line (point data)',
			path: 'scales/time/line-point-data.html'
		}, {
			title: 'Time Series',
			path: 'scales/time/financial.html'
		}, {
			title: 'Combo',
			path: 'scales/time/combo.html'
		}]
	}, {
		title: 'Scale options',
		items: [{
			title: 'Grid lines display',
			path: 'scales/gridlines-display.html'
		}, {
			title: 'Grid lines style',
			path: 'scales/gridlines-style.html'
		}, {
			title: 'Multiline labels',
			path: 'scales/multiline-labels.html'
		}, {
			title: 'Filtering Labels',
			path: 'scales/filtering-labels.html'
		}, {
			title: 'Non numeric Y Axis',
			path: 'scales/non-numeric-y.html'
		}, {
			title: 'Toggle Scale Type',
			path: 'scales/toggle-scale-type.html'
		}]
	}, {
		title: 'Legend',
		items: [{
			title: 'Positioning',
			path: 'legend/positioning.html'
		}, {
			title: 'Point style',
			path: 'legend/point-style.html'
		}, {
			title: 'Callbacks',
			path: 'legend/callbacks.html'
		}]
	}, {
		title: 'Tooltip',
		items: [{
			title: 'Positioning',
			path: 'tooltips/positioning.html'
		}, {
			title: 'Interactions',
			path: 'tooltips/interactions.html'
		}, {
			title: 'Callbacks',
			path: 'tooltips/callbacks.html'
		}, {
			title: 'Border',
			path: 'tooltips/border.html'
		}, {
			title: 'HTML tooltips (line)',
			path: 'tooltips/custom-line.html'
		}, {
			title: 'HTML tooltips (pie)',
			path: 'tooltips/custom-pie.html'
		}, {
			title: 'HTML tooltips (points)',
			path: 'tooltips/custom-points.html'
		}]
	}, {
		title: 'Scriptable',
		items: [{
			title: 'Bar Chart',
			path: 'scriptable/bar.html'
		}, {
			title: 'Bubble Chart',
			path: 'scriptable/bubble.html'
		}, {
			title: 'Pie Chart',
			path: 'scriptable/pie.html'
		}, {
			title: 'Line Chart',
			path: 'scriptable/line.html'
		}, {
			title: 'Polar Area Chart',
			path: 'scriptable/polar.html'
		}, {
			title: 'Radar Chart',
			path: 'scriptable/radar.html'
		}]
	}, {
		title: 'Advanced',
		items: [{
			title: 'Progress bar',
			path: 'advanced/progress-bar.html'
		}, {
			title: 'Content Security Policy',
			path: 'advanced/content-security-policy.html'
		}]
	}];

}(this));
