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
		}, {
			title: 'Floating',
			path: 'charts/bar/float.html'
		}, {
			title: 'Border Radius',
			path: 'charts/bar/border-radius.html'
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
			title: 'Bubble',
			path: 'charts/bubble.html'
		}, {
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
			title: 'Multi Series Pie',
			path: 'charts/multi-series-pie.html'
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
			title: 'Line (break on 2 day gap)',
			path: 'scales/time/line-max-span.html'
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
			title: 'Scriptable Grid lines',
			path: 'scales/gridlines-scriptable.html'
		}, {
			title: 'Multiline labels',
			path: 'scales/multiline-labels.html'
		}, {
			title: 'Filtering Labels',
			path: 'scales/filtering-labels.html'
		}, {
			title: 'Label Text Alignment',
			path: 'scales/label-text-alignment.html'
		}, {
			title: 'Non numeric Y Axis',
			path: 'scales/non-numeric-y.html'
		}, {
			title: 'Toggle Scale Type',
			path: 'scales/toggle-scale-type.html'
		}, {
			title: 'Axes Labels',
			path: 'scales/axes-labels.html'
		}, {
			title: 'Center Positioning',
			path: 'scales/axis-center-position.html'
		}, {
			title: 'Custom major ticks',
			path: 'scales/financial.html'
		}]
	}, {
		title: 'Legend',
		items: [{
			title: 'Positioning',
			path: 'legend/positioning.html'
		}, {
			title: 'Legend Title',
			path: 'legend/title.html'
		}, {
			title: 'Point style',
			path: 'legend/point-style.html'
		}, {
			title: 'Callbacks',
			path: 'legend/callbacks.html'
		}]
	}, {
		title: 'Title',
		items: [{
			title: 'Alignment',
			path: 'title/alignment.html'
		}]
	}, {
		title: 'Tooltip',
		items: [{
			title: 'Positioning',
			path: 'tooltips/positioning.html'
		}, {
			title: 'Custom Positioning',
			path: 'tooltips/positioning-custom.html'
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
			title: 'Point style',
			path: 'tooltips/point-style.html'
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
		title: 'Animations',
		items: [{
			title: 'Delay',
			path: 'animations/delay.html'
		}, {
			title: 'Drop',
			path: 'animations/drop.html'
		}, {
			title: 'Loop',
			path: 'animations/loop.html'
		}]
	}, {
		title: 'Advanced',
		items: [{
			title: 'Progress bar',
			path: 'advanced/progress-bar.html'
		}, {
			title: 'Polar Area Radial Gradient',
			path: 'advanced/radial-gradient.html'
		}, {
			title: 'Line Gradient',
			path: 'advanced/line-gradient.html'
		}, {
			title: 'Programmatic Event Triggers',
			path: 'advanced/programmatic-events.html'
		}]
	}];

}(this));
