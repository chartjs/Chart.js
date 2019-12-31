'use strict';

var DatasetController = require('../core/core.datasetController');
var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var valueOrDefault = helpers.valueOrDefault;

var PI = Math.PI;
var DOUBLE_PI = PI * 2;
var HALF_PI = PI / 2;

defaults._set('doughnut', {
	animation: {
		numbers: {
			type: 'number',
			properties: ['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius']
		},
		// Boolean - Whether we animate the rotation of the Doughnut
		animateRotate: true,
		// Boolean - Whether we animate scaling the Doughnut from the centre
		animateScale: false
	},
	legendCallback: function(chart) {
		var list = document.createElement('ul');
		var data = chart.data;
		var datasets = data.datasets;
		var labels = data.labels;
		var i, ilen, listItem, listItemSpan;

		list.setAttribute('class', chart.id + '-legend');
		if (datasets.length) {
			for (i = 0, ilen = datasets[0].data.length; i < ilen; ++i) {
				listItem = list.appendChild(document.createElement('li'));
				listItemSpan = listItem.appendChild(document.createElement('span'));
				listItemSpan.style.backgroundColor = datasets[0].backgroundColor[i];
				if (labels[i]) {
					listItem.appendChild(document.createTextNode(labels[i]));
				}
			}
		}

		return list.outerHTML;
	},
	legend: {
		labels: {
			generateLabels: function(chart) {
				var data = chart.data;
				if (data.labels.length && data.datasets.length) {
					return data.labels.map(function(label, i) {
						var meta = chart.getDatasetMeta(0);
						var style = meta.controller.getStyle(i);

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

		onClick: function(e, legendItem) {
			var index = legendItem.index;
			var chart = this.chart;
			var i, ilen, meta;

			for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
				meta = chart.getDatasetMeta(i);
				// toggle visibility of index if exists
				if (meta.data[index]) {
					meta.data[index].hidden = !meta.data[index].hidden;
				}
			}

			chart.update();
		}
	},

	// The percentage of the chart that we cut out of the middle.
	cutoutPercentage: 50,

	// The percentage of the available radius that is used.
	radiusPercentage: 100,

	// The rotation of the chart, where the first data arc begins.
	rotation: -HALF_PI,

	// The total circumference of the chart.
	circumference: DOUBLE_PI,

	// Need to override these to give a nice default
	tooltips: {
		callbacks: {
			title: function() {
				return '';
			},
			label: function(tooltipItem, data) {
				var dataLabel = data.labels[tooltipItem.index];
				var value = ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

				if (helpers.isArray(dataLabel)) {
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
});

module.exports = DatasetController.extend({

	dataElementType: elements.Arc,

	linkScales: helpers.noop,

	/**
	 * @private
	 */
	_dataElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderWidth',
		'borderAlign',
		'hoverBackgroundColor',
		'hoverBorderColor',
		'hoverBorderWidth',
	],

	/**
	 * Override data parsing, since we are not using scales
	 * @private
	 */
	_parse: function(start, count) {
		var data = this.getDataset().data;
		var meta = this._cachedMeta;
		var i, ilen;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			meta._parsed[i] = +data[i];
		}
	},

	// Get index of the dataset in relation to the visible datasets. This allows determining the inner and outer radius correctly
	getRingIndex: function(datasetIndex) {
		var ringIndex = 0;

		for (var j = 0; j < datasetIndex; ++j) {
			if (this.chart.isDatasetVisible(j)) {
				++ringIndex;
			}
		}

		return ringIndex;
	},

	update: function(mode) {
		const me = this;
		const chart = me.chart;
		const chartArea = chart.chartArea;
		const opts = chart.options;
		let ratioX = 1;
		let ratioY = 1;
		let offsetX = 0;
		let offsetY = 0;
		const meta = me._cachedMeta;
		const arcs = meta.data;
		const cutout = opts.cutoutPercentage / 100 || 0;
		const radius = opts.radiusPercentage / 100 || 0;
		const circumference = opts.circumference;
		const chartWeight = me._getRingWeight(me.index);
		let maxWidth, maxHeight, i, ilen;

		// If the chart's circumference isn't a full circle, calculate size as a ratio of the width/height of the arc
		if (circumference < DOUBLE_PI) {
			let startAngle = opts.rotation % DOUBLE_PI;
			startAngle += startAngle >= PI ? -DOUBLE_PI : startAngle < -PI ? DOUBLE_PI : 0;
			const endAngle = startAngle + circumference;
			const startX = Math.cos(startAngle);
			const startY = Math.sin(startAngle);
			const endX = Math.cos(endAngle);
			const endY = Math.sin(endAngle);
			const contains0 = (startAngle <= 0 && endAngle >= 0) || endAngle >= DOUBLE_PI;
			const contains90 = (startAngle <= HALF_PI && endAngle >= HALF_PI) || endAngle >= DOUBLE_PI + HALF_PI;
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

		for (i = 0, ilen = arcs.length; i < ilen; ++i) {
			arcs[i]._options = me._resolveDataElementOptions(i, mode);
		}

		chart.borderWidth = me.getMaxBorderWidth();
		maxWidth = (chartArea.right - chartArea.left - chart.borderWidth) / ratioX;
		maxHeight = (chartArea.bottom - chartArea.top - chart.borderWidth) / ratioY;
		chart.outerRadius = Math.max(Math.min(maxWidth, maxHeight) * radius / 2, 0);
		chart.innerRadius = Math.max(chart.outerRadius * cutout, 0);
		chart.radiusLength = (chart.outerRadius - chart.innerRadius) / (me._getVisibleDatasetWeightTotal() || 1);
		chart.offsetX = offsetX * chart.outerRadius;
		chart.offsetY = offsetY * chart.outerRadius;

		meta.total = me.calculateTotal();

		me.outerRadius = chart.outerRadius - chart.radiusLength * me._getRingWeightOffset(me.index);
		me.innerRadius = Math.max(me.outerRadius - chart.radiusLength * chartWeight, 0);

		me.updateElements(arcs, 0, mode);
	},

	/**
	 * @private
	 */
	_circumference: function(i, reset) {
		const me = this;
		const opts = me.chart.options;
		const meta = me._cachedMeta;
		return reset && opts.animation.animateRotate ? 0 : meta.data[i].hidden ? 0 : me.calculateCircumference(meta._parsed[i] * opts.circumference / DOUBLE_PI);
	},

	updateElements: function(arcs, start, mode) {
		const me = this;
		const reset = mode === 'reset';
		const chart = me.chart;
		const chartArea = chart.chartArea;
		const opts = chart.options;
		const animationOpts = opts.animation;
		const centerX = (chartArea.left + chartArea.right) / 2;
		const centerY = (chartArea.top + chartArea.bottom) / 2;
		const innerRadius = reset && animationOpts.animateScale ? 0 : me.innerRadius;
		const outerRadius = reset && animationOpts.animateScale ? 0 : me.outerRadius;
		let startAngle = opts.rotation;
		let i;

		for (i = 0; i < start; ++i) {
			startAngle += me._circumference(i, reset);
		}

		for (i = 0; i < arcs.length; ++i) {
			const index = start + i;
			const circumference = me._circumference(index, reset);
			const arc = arcs[i];
			const options = arc._options || {};
			const properties = {
				x: centerX + chart.offsetX,
				y: centerY + chart.offsetY,
				startAngle,
				endAngle: startAngle + circumference,
				circumference,
				outerRadius,
				innerRadius,
				options
			};
			startAngle += circumference;

			me._updateElement(arc, index, properties, mode);
		}
	},

	calculateTotal: function() {
		const meta = this._cachedMeta;
		const metaData = meta.data;
		let total = 0;
		let i;

		for (i = 0; i < metaData.length; i++) {
			const value = meta._parsed[i];
			if (!isNaN(value) && !metaData[i].hidden) {
				total += Math.abs(value);
			}
		}

		/* if (total === 0) {
			total = NaN;
		}*/

		return total;
	},

	calculateCircumference: function(value) {
		var total = this._cachedMeta.total;
		if (total > 0 && !isNaN(value)) {
			return DOUBLE_PI * (Math.abs(value) / total);
		}
		return 0;
	},

	// gets the max border or hover width to properly scale pie charts
	getMaxBorderWidth: function(arcs) {
		var me = this;
		var max = 0;
		var chart = me.chart;
		var i, ilen, meta, controller, options;

		if (!arcs) {
			// Find the outmost visible dataset
			for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
				if (chart.isDatasetVisible(i)) {
					meta = chart.getDatasetMeta(i);
					arcs = meta.data;
					controller = meta.controller;
					if (controller !== me) {
						controller._configure();
					}
					break;
				}
			}
		}

		if (!arcs) {
			return 0;
		}

		for (i = 0, ilen = arcs.length; i < ilen; ++i) {
			options = controller._resolveDataElementOptions(i);
			if (options.borderAlign !== 'inner') {
				max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0);
			}
		}
		return max;
	},

	/**
	 * Get radius length offset of the dataset in relation to the visible datasets weights. This allows determining the inner and outer radius correctly
	 * @private
	 */
	_getRingWeightOffset: function(datasetIndex) {
		var ringWeightOffset = 0;

		for (var i = 0; i < datasetIndex; ++i) {
			if (this.chart.isDatasetVisible(i)) {
				ringWeightOffset += this._getRingWeight(i);
			}
		}

		return ringWeightOffset;
	},

	/**
	 * @private
	 */
	_getRingWeight: function(dataSetIndex) {
		return Math.max(valueOrDefault(this.chart.data.datasets[dataSetIndex].weight, 1), 0);
	},

	/**
	 * Returns the sum of all visibile data set weights.  This value can be 0.
	 * @private
	 */
	_getVisibleDatasetWeightTotal: function() {
		return this._getRingWeightOffset(this.chart.data.datasets.length);
	}
});
