import DatasetController from '../core/core.datasetController';
import {isArray, valueOrDefault} from '../helpers/helpers.core';
import {toRadians, PI, TAU, HALF_PI} from '../helpers/helpers.math';

/**
 * @typedef { import("../core/core.controller").default } Chart
 */


function getRatioAndOffset(rotation, circumference, cutout) {
	let ratioX = 1;
	let ratioY = 1;
	let offsetX = 0;
	let offsetY = 0;
	// If the chart's circumference isn't a full circle, calculate size as a ratio of the width/height of the arc
	if (circumference < TAU) {
		let startAngle = rotation % TAU;
		startAngle += startAngle >= PI ? -TAU : startAngle < -PI ? TAU : 0;
		const endAngle = startAngle + circumference;
		const startX = Math.cos(startAngle);
		const startY = Math.sin(startAngle);
		const endX = Math.cos(endAngle);
		const endY = Math.sin(endAngle);
		const contains0 = (startAngle <= 0 && endAngle >= 0) || endAngle >= TAU;
		const contains90 = (startAngle <= HALF_PI && endAngle >= HALF_PI) || endAngle >= TAU + HALF_PI;
		const contains180 = startAngle === -PI || endAngle >= PI;
		const contains270 = (startAngle <= -HALF_PI && endAngle >= -HALF_PI) || endAngle >= PI + HALF_PI;
		const minX = contains180 ? -1 : Math.min(startX, startX * cutout, endX, endX * cutout);
		const minY = contains270 ? -1 : Math.min(startY, startY * cutout, endY, endY * cutout);
		const maxX = contains0 ? 1 : Math.max(startX, startX * cutout, endX, endX * cutout);
		const maxY = contains90 ? 1 : Math.max(startY, startY * cutout, endY, endY * cutout);
		ratioX = (maxX - minX) / 2;
		ratioY = (maxY - minY) / 2;
		offsetX = -(maxX + minX) / 2;
		offsetY = -(maxY + minY) / 2;
	}
	return {ratioX, ratioY, offsetX, offsetY};
}

export default class DoughnutController extends DatasetController {

	constructor(chart, datasetIndex) {
		super(chart, datasetIndex);

		this.enableOptionSharing = true;
		this.innerRadius = undefined;
		this.outerRadius = undefined;
		this.offsetX = undefined;
		this.offsetY = undefined;
	}

	linkScales() {}

	/**
	 * Override data parsing, since we are not using scales
	 */
	parse(start, count) {
		const data = this.getDataset().data;
		const meta = this._cachedMeta;
		let i, ilen;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			meta._parsed[i] = +data[i];
		}
	}

	// Get index of the dataset in relation to the visible datasets. This allows determining the inner and outer radius correctly
	getRingIndex(datasetIndex) {
		let ringIndex = 0;

		for (let j = 0; j < datasetIndex; ++j) {
			if (this.chart.isDatasetVisible(j)) {
				++ringIndex;
			}
		}

		return ringIndex;
	}

	/**
	 * @private
	 */
	_getRotation() {
		return toRadians(valueOrDefault(this._config.rotation, this.chart.options.rotation) - 90);
	}

	/**
	 * @private
	 */
	_getCircumference() {
		return toRadians(valueOrDefault(this._config.circumference, this.chart.options.circumference));
	}

	/**
	 * Get the maximal rotation & circumference extents
	 * across all visible datasets.
	 */
	_getRotationExtents() {
		let min = TAU;
		let max = -TAU;

		const me = this;

		for (let i = 0; i < me.chart.data.datasets.length; ++i) {
			if (me.chart.isDatasetVisible(i)) {
				const controller = me.chart.getDatasetMeta(i).controller;
				const rotation = controller._getRotation();
				const circumference = controller._getCircumference();

				min = Math.min(min, rotation);
				max = Math.max(max, rotation + circumference);
			}
		}

		return {
			rotation: min,
			circumference: max - min,
		};
	}

	/**
	 * @param {string} mode
	 */
	update(mode) {
		const me = this;
		const chart = me.chart;
		const {chartArea, options} = chart;
		const meta = me._cachedMeta;
		const arcs = meta.data;
		const cutout = options.cutoutPercentage / 100 || 0;
		const chartWeight = me._getRingWeight(me.index);

		// Compute the maximal rotation & circumference limits.
		// If we only consider our dataset, this can cause problems when two datasets
		// are both less than a circle with different rotations (starting angles)
		const {circumference, rotation} = me._getRotationExtents();
		const {ratioX, ratioY, offsetX, offsetY} = getRatioAndOffset(rotation, circumference, cutout);
		const spacing = me.getMaxBorderWidth() + me.getMaxOffset(arcs);
		const maxWidth = (chartArea.right - chartArea.left - spacing) / ratioX;
		const maxHeight = (chartArea.bottom - chartArea.top - spacing) / ratioY;
		const outerRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
		const innerRadius = Math.max(outerRadius * cutout, 0);
		const radiusLength = (outerRadius - innerRadius) / me._getVisibleDatasetWeightTotal();
		me.offsetX = offsetX * outerRadius;
		me.offsetY = offsetY * outerRadius;

		meta.total = me.calculateTotal();

		me.outerRadius = outerRadius - radiusLength * me._getRingWeightOffset(me.index);
		me.innerRadius = Math.max(me.outerRadius - radiusLength * chartWeight, 0);

		me.updateElements(arcs, 0, arcs.length, mode);
	}

	/**
	 * @private
	 */
	_circumference(i, reset) {
		const me = this;
		const opts = me.chart.options;
		const meta = me._cachedMeta;
		const circumference = me._getCircumference();
		return reset && opts.animation.animateRotate ? 0 : this.chart.getDataVisibility(i) ? me.calculateCircumference(meta._parsed[i] * circumference / TAU) : 0;
	}

	updateElements(arcs, start, count, mode) {
		const me = this;
		const reset = mode === 'reset';
		const chart = me.chart;
		const chartArea = chart.chartArea;
		const opts = chart.options;
		const animationOpts = opts.animation;
		const centerX = (chartArea.left + chartArea.right) / 2;
		const centerY = (chartArea.top + chartArea.bottom) / 2;
		const animateScale = reset && animationOpts.animateScale;
		const innerRadius = animateScale ? 0 : me.innerRadius;
		const outerRadius = animateScale ? 0 : me.outerRadius;
		const firstOpts = me.resolveDataElementOptions(start, mode);
		const sharedOptions = me.getSharedOptions(firstOpts);
		const includeOptions = me.includeOptions(mode, sharedOptions);
		let startAngle = me._getRotation();
		let i;

		for (i = 0; i < start; ++i) {
			startAngle += me._circumference(i, reset);
		}

		for (i = start; i < start + count; ++i) {
			const circumference = me._circumference(i, reset);
			const arc = arcs[i];
			const properties = {
				x: centerX + me.offsetX,
				y: centerY + me.offsetY,
				startAngle,
				endAngle: startAngle + circumference,
				circumference,
				outerRadius,
				innerRadius
			};
			if (includeOptions) {
				properties.options = sharedOptions || me.resolveDataElementOptions(i, mode);
			}
			startAngle += circumference;

			me.updateElement(arc, i, properties, mode);
		}
		me.updateSharedOptions(sharedOptions, mode, firstOpts);
	}

	calculateTotal() {
		const meta = this._cachedMeta;
		const metaData = meta.data;
		let total = 0;
		let i;

		for (i = 0; i < metaData.length; i++) {
			const value = meta._parsed[i];
			if (!isNaN(value) && this.chart.getDataVisibility(i)) {
				total += Math.abs(value);
			}
		}

		return total;
	}

	calculateCircumference(value) {
		const total = this._cachedMeta.total;
		if (total > 0 && !isNaN(value)) {
			return TAU * (Math.abs(value) / total);
		}
		return 0;
	}

	getLabelAndValue(index) {
		const me = this;
		const meta = me._cachedMeta;
		const chart = me.chart;
		const labels = chart.data.labels || [];

		return {
			label: labels[index] || '',
			value: meta._parsed[index],
		};
	}

	getMaxBorderWidth(arcs) {
		const me = this;
		let max = 0;
		const chart = me.chart;
		let i, ilen, meta, controller, options;

		if (!arcs) {
			// Find the outmost visible dataset
			for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
				if (chart.isDatasetVisible(i)) {
					meta = chart.getDatasetMeta(i);
					arcs = meta.data;
					controller = meta.controller;
					if (controller !== me) {
						controller.configure();
					}
					break;
				}
			}
		}

		if (!arcs) {
			return 0;
		}

		for (i = 0, ilen = arcs.length; i < ilen; ++i) {
			options = controller.resolveDataElementOptions(i);
			if (options.borderAlign !== 'inner') {
				max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0);
			}
		}
		return max;
	}

	getMaxOffset(arcs) {
		let max = 0;

		for (let i = 0, ilen = arcs.length; i < ilen; ++i) {
			const options = this.resolveDataElementOptions(i);
			max = Math.max(max, options.offset || 0, options.hoverOffset || 0);
		}
		return max;
	}

	/**
	 * Get radius length offset of the dataset in relation to the visible datasets weights. This allows determining the inner and outer radius correctly
	 * @private
	 */
	_getRingWeightOffset(datasetIndex) {
		let ringWeightOffset = 0;

		for (let i = 0; i < datasetIndex; ++i) {
			if (this.chart.isDatasetVisible(i)) {
				ringWeightOffset += this._getRingWeight(i);
			}
		}

		return ringWeightOffset;
	}

	/**
	 * @private
	 */
	_getRingWeight(datasetIndex) {
		return Math.max(valueOrDefault(this.chart.data.datasets[datasetIndex].weight, 1), 0);
	}

	/**
	 * Returns the sum of all visible data set weights.
	 * @private
	 */
	_getVisibleDatasetWeightTotal() {
		return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
	}
}

DoughnutController.id = 'doughnut';

/**
 * @type {any}
 */
DoughnutController.defaults = {
	datasetElementType: false,
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
			properties: ['circumference', 'endAngle', 'innerRadius', 'outerRadius', 'startAngle', 'x', 'y', 'offset', 'borderWidth']
		},
		// Boolean - Whether we animate the rotation of the Doughnut
		animateRotate: true,
		// Boolean - Whether we animate scaling the Doughnut from the centre
		animateScale: false
	},
	aspectRatio: 1,
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

	// The percentage of the chart that we cut out of the middle.
	cutoutPercentage: 50,

	// The rotation of the chart, where the first data arc begins.
	rotation: 0,

	// The total circumference of the chart.
	circumference: 360,

	// Need to override these to give a nice default
	tooltips: {
		callbacks: {
			title() {
				return '';
			},
			label(tooltipItem) {
				let dataLabel = tooltipItem.label;
				const value = ': ' + tooltipItem.formattedValue;

				if (isArray(dataLabel)) {
					// show value on first line of multiline label
					// need to clone because we are changing the value
					dataLabel = dataLabel.slice();
					dataLabel[0] += value;
				} else {
					dataLabel += value;
				}

				return dataLabel;
			}
		}
	}
};
