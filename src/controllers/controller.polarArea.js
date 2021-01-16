import DatasetController from '../core/core.datasetController';
import {resolve, toRadians, PI} from '../helpers/index';

function getStartAngleRadians(deg) {
	// radialLinear scale draws angleLines using startAngle. 0 is expected to be at top.
	// Here we adjust to standard unit circle used in drawing, where 0 is at right.
	return toRadians(deg) - 0.5 * PI;
}

export default class PolarAreaController extends DatasetController {

	constructor(chart, datasetIndex) {
		super(chart, datasetIndex);

		this.innerRadius = undefined;
		this.outerRadius = undefined;
	}

	update(mode) {
		const arcs = this._cachedMeta.data;

		this._updateRadius();
		this.updateElements(arcs, 0, arcs.length, mode);
	}

	/**
	 * @private
	 */
	_updateRadius() {
		const me = this;
		const chart = me.chart;
		const chartArea = chart.chartArea;
		const opts = chart.options;
		const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);

		const outerRadius = Math.max(minSize / 2, 0);
		const innerRadius = Math.max(opts.cutoutPercentage ? (outerRadius / 100) * (opts.cutoutPercentage) : 1, 0);
		const radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount();

		me.outerRadius = outerRadius - (radiusLength * me.index);
		me.innerRadius = me.outerRadius - radiusLength;
	}

	updateElements(arcs, start, count, mode) {
		const me = this;
		const reset = mode === 'reset';
		const chart = me.chart;
		const dataset = me.getDataset();
		const opts = chart.options;
		const animationOpts = opts.animation;
		const scale = me._cachedMeta.rScale;
		const centerX = scale.xCenter;
		const centerY = scale.yCenter;
		const datasetStartAngle = getStartAngleRadians(opts.startAngle);
		let angle = datasetStartAngle;
		let i;

		me._cachedMeta.count = me.countVisibleElements();

		for (i = 0; i < start; ++i) {
			angle += me._computeAngle(i, mode);
		}
		for (i = start; i < start + count; i++) {
			const arc = arcs[i];
			let startAngle = angle;
			let endAngle = angle + me._computeAngle(i, mode);
			let outerRadius = this.chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(dataset.data[i]) : 0;
			angle = endAngle;

			if (reset) {
				if (animationOpts.animateScale) {
					outerRadius = 0;
				}
				if (animationOpts.animateRotate) {
					startAngle = datasetStartAngle;
					endAngle = datasetStartAngle;
				}
			}

			const properties = {
				x: centerX,
				y: centerY,
				innerRadius: 0,
				outerRadius,
				startAngle,
				endAngle,
				options: me.resolveDataElementOptions(i, mode)
			};

			me.updateElement(arc, i, properties, mode);
		}
	}

	countVisibleElements() {
		const dataset = this.getDataset();
		const meta = this._cachedMeta;
		let count = 0;

		meta.data.forEach((element, index) => {
			if (!isNaN(dataset.data[index]) && this.chart.getDataVisibility(index)) {
				count++;
			}
		});

		return count;
	}

	/**
	 * @private
	 */
	_computeAngle(index, mode) {
		const me = this;
		const meta = me._cachedMeta;
		const count = meta.count;
		const dataset = me.getDataset();

		if (isNaN(dataset.data[index]) || !this.chart.getDataVisibility(index)) {
			return 0;
		}

		// Scriptable options
		const context = me.getContext(index, mode === 'active');

		return toRadians(resolve([
			me.chart.options.elements.arc.angle,
			360 / count
		], context, index));
	}
}

PolarAreaController.id = 'polarArea';

/**
 * @type {any}
 */
PolarAreaController.defaults = {
	dataElementType: 'arc',
	dataElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderWidth',
		'borderAlign',
		'offset'
	],

	animation: {
		numbers: {
			type: 'number',
			properties: ['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius']
		},
		animateRotate: true,
		animateScale: true
	},
	aspectRatio: 1,
	datasets: {
		indexAxis: 'r'
	},
	scales: {
		r: {
			type: 'radialLinear',
			angleLines: {
				display: false
			},
			beginAtZero: true,
			gridLines: {
				circular: true
			},
			pointLabels: {
				display: false
			}
		}
	},

	startAngle: 0,
	plugins: {
		legend: {
			labels: {
				generateLabels(chart) {
					const data = chart.data;
					if (data.labels.length && data.datasets.length) {
						return data.labels.map((label, i) => {
							const meta = chart.getDatasetMeta(0);
							const style = meta.controller.getStyle(i);

							return {
								text: label,
								fillStyle: style.backgroundColor,
								strokeStyle: style.borderColor,
								lineWidth: style.borderWidth,
								hidden: !chart.getDataVisibility(i),

								// Extra data used for toggling the correct item
								index: i
							};
						});
					}
					return [];
				}
			},

			onClick(e, legendItem, legend) {
				legend.chart.toggleDataVisibility(legendItem.index);
				legend.chart.update();
			}
		},

		// Need to override these to give a nice default
		tooltip: {
			callbacks: {
				title() {
					return '';
				},
				label(context) {
					return context.chart.data.labels[context.dataIndex] + ': ' + context.formattedValue;
				}
			}
		}
	}

};
