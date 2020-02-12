import DatasetController from '../core/core.datasetController';
import defaults from '../core/core.defaults';
import Arc from '../elements/element.arc';
import {toRadians} from '../helpers/helpers.math';
import {resolve} from '../helpers/helpers.options';

defaults.set('polarArea', {
	animation: {
		numbers: {
			type: 'number',
			properties: ['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius']
		},
		animateRotate: true,
		animateScale: true
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
							hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,

							// Extra data used for toggling the correct item
							index: i
						};
					});
				}
				return [];
			}
		},

		onClick(e, legendItem) {
			const index = legendItem.index;
			const chart = this.chart;
			let i, ilen, meta;

			for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
				meta = chart.getDatasetMeta(i);
				meta.data[index].hidden = !meta.data[index].hidden;
			}

			chart.update();
		}
	},

	// Need to override these to give a nice default
	tooltips: {
		callbacks: {
			title() {
				return '';
			},
			label(item, data) {
				return data.labels[item.index] + ': ' + item.value;
			}
		}
	}
});

function getStartAngleRadians(deg) {
	// radialLinear scale draws angleLines using startAngle. 0 is expected to be at top.
	// Here we adjust to standard unit circle used in drawing, where 0 is at right.
	return toRadians(deg) - 0.5 * Math.PI;
}

class PolarAreaController extends DatasetController {

	constructor(chart, datasetIndex) {
		super(chart, datasetIndex);

		this.innerRadius = undefined;
		this.outerRadius = undefined;
	}

	/**
	 * @private
	 */
	_getIndexScaleId() {
		return this._cachedMeta.rAxisID;
	}

	/**
	 * @private
	 */
	_getValueScaleId() {
		return this._cachedMeta.rAxisID;
	}

	update(mode) {
		const arcs = this._cachedMeta.data;

		this._updateRadius();
		this.updateElements(arcs, 0, mode);
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

		chart.outerRadius = Math.max(minSize / 2, 0);
		chart.innerRadius = Math.max(opts.cutoutPercentage ? (chart.outerRadius / 100) * (opts.cutoutPercentage) : 1, 0);
		chart.radiusLength = (chart.outerRadius - chart.innerRadius) / chart.getVisibleDatasetCount();

		me.outerRadius = chart.outerRadius - (chart.radiusLength * me.index);
		me.innerRadius = me.outerRadius - chart.radiusLength;
	}

	updateElements(arcs, start, mode) {
		const me = this;
		const reset = mode === 'reset';
		const chart = me.chart;
		const dataset = me.getDataset();
		const opts = chart.options;
		const animationOpts = opts.animation;
		const scale = chart.scales.r;
		const centerX = scale.xCenter;
		const centerY = scale.yCenter;
		const datasetStartAngle = getStartAngleRadians(opts.startAngle);
		let angle = datasetStartAngle;
		let i;

		me._cachedMeta.count = me.countVisibleElements();

		for (i = 0; i < start; ++i) {
			angle += me._computeAngle(i);
		}
		for (i = 0; i < arcs.length; i++) {
			const arc = arcs[i];
			const index = start + i;
			let startAngle = angle;
			let endAngle = angle + me._computeAngle(index);
			let outerRadius = arc.hidden ? 0 : scale.getDistanceFromCenterForValue(dataset.data[index]);
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
				options: me._resolveDataElementOptions(index)
			};

			me._updateElement(arc, index, properties, mode);
		}
	}

	countVisibleElements() {
		const dataset = this.getDataset();
		const meta = this._cachedMeta;
		let count = 0;

		meta.data.forEach((element, index) => {
			if (!isNaN(dataset.data[index]) && !element.hidden) {
				count++;
			}
		});

		return count;
	}

	/**
	 * @private
	 */
	_computeAngle(index) {
		const me = this;
		const meta = me._cachedMeta;
		const count = meta.count;
		const dataset = me.getDataset();

		if (isNaN(dataset.data[index]) || meta.data[index].hidden) {
			return 0;
		}

		// Scriptable options
		const context = {
			chart: me.chart,
			dataIndex: index,
			dataset,
			datasetIndex: me.index
		};

		return resolve([
			me.chart.options.elements.arc.angle,
			(2 * Math.PI) / count
		], context, index);
	}
}

PolarAreaController.prototype.dataElementType = Arc;

/**
 * @private
 */
PolarAreaController.prototype._dataElementOptions = [
	'backgroundColor',
	'borderColor',
	'borderWidth',
	'borderAlign',
	'hoverBackgroundColor',
	'hoverBorderColor',
	'hoverBorderWidth'
];

export default PolarAreaController;
