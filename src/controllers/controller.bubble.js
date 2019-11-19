'use strict';

var DatasetController = require('../core/core.datasetController');
var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var valueOrDefault = helpers.valueOrDefault;
var resolve = helpers.options.resolve;

defaults._set('bubble', {
	scales: {
		x: {
			type: 'linear',
			position: 'bottom'
		},
		y: {
			type: 'linear',
			position: 'left'
		}
	},

	tooltips: {
		callbacks: {
			title: function() {
				// Title doesn't make sense for scatter since we format the data as a point
				return '';
			}
		}
	}
});

module.exports = DatasetController.extend({
	/**
	 * @protected
	 */
	dataElementType: elements.Point,

	/**
	 * @private
	 */
	_dataElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderWidth',
		'hoverBackgroundColor',
		'hoverBorderColor',
		'hoverBorderWidth',
		'hoverRadius',
		'hitRadius',
		'pointStyle',
		'rotation'
	],

	/**
	 * Parse array of objects
	 * @private
	 */
	_parseObjectData: function(meta, data, start, count) {
		const {xScale, yScale} = meta;
		const xId = xScale.id;
		const yId = yScale.id;
		const parsed = [];
		let i, ilen, item;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			item = data[i];
			parsed.push({
				[xId]: xScale._parseObject(item, 'x', i),
				[yId]: yScale._parseObject(item, 'y', i),
				_custom: item && item.r && +item.r
			});
		}
		return parsed;
	},

	/**
	 * @private
	 */
	_getMaxOverflow: function() {
		var me = this;
		var meta = me._cachedMeta;
		var data = meta.data || [];
		if (!data.length) {
			return false;
		}
		var firstPoint = data[0].size();
		var lastPoint = data[data.length - 1].size();
		return Math.max(firstPoint, lastPoint) / 2;
	},

	/**
	 * @private
	 */
	_getLabelAndValue: function(index) {
		const me = this;
		const meta = me._cachedMeta;
		const {xScale, yScale} = meta;
		const parsed = me._getParsed(index);
		const x = xScale.getLabelForValue(parsed[xScale.id]);
		const y = yScale.getLabelForValue(parsed[yScale.id]);
		const r = parsed._custom;

		return {
			label: meta.label,
			value: '(' + x + ', ' + y + (r ? ', ' + r : '') + ')'
		};
	},

	/**
	 * @protected
	 */
	update: function(reset) {
		const me = this;
		const points = me._cachedMeta.data;

		// Update Points
		me.updateElements(points, 0, points.length, reset);
	},

	/**
	 * @protected
	 */
	updateElements: function(points, start, count, reset) {
		const me = this;
		const {xScale, yScale} = me._cachedMeta;
		let i;

		for (i = start; i < start + count; i++) {
			const point = points[i];
			const options = me._resolveDataElementOptions(i);
			const parsed = !reset && me._getParsed(i);
			const x = reset ? xScale.getPixelForDecimal(0.5) : xScale.getPixelForValue(parsed[xScale.id]);
			const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(parsed[yScale.id]);

			point._options = options;
			point._model = {
				backgroundColor: options.backgroundColor,
				borderColor: options.borderColor,
				borderWidth: options.borderWidth,
				hitRadius: options.hitRadius,
				pointStyle: options.pointStyle,
				rotation: options.rotation,
				radius: reset ? 0 : options.radius,
				skip: isNaN(x) || isNaN(y),
				x: x,
				y: y,
			};

			point.pivot(me.chart._animationsDisabled);
		}
	},

	/**
	 * @protected
	 */
	setHoverStyle: function(point) {
		var model = point._model;
		var options = point._options;
		var getHoverColor = helpers.getHoverColor;

		point.$previousStyle = {
			backgroundColor: model.backgroundColor,
			borderColor: model.borderColor,
			borderWidth: model.borderWidth,
			radius: model.radius
		};

		model.backgroundColor = valueOrDefault(options.hoverBackgroundColor, getHoverColor(options.backgroundColor));
		model.borderColor = valueOrDefault(options.hoverBorderColor, getHoverColor(options.borderColor));
		model.borderWidth = valueOrDefault(options.hoverBorderWidth, options.borderWidth);
		model.radius = options.radius + options.hoverRadius;
	},

	/**
	 * @private
	 */
	_resolveDataElementOptions: function(index) {
		var me = this;
		var chart = me.chart;
		var dataset = me.getDataset();
		var parsed = me._getParsed(index);
		var values = DatasetController.prototype._resolveDataElementOptions.apply(me, arguments);

		// Scriptable options
		var context = {
			chart: chart,
			dataIndex: index,
			dataset: dataset,
			datasetIndex: me.index
		};

		// In case values were cached (and thus frozen), we need to clone the values
		if (me._cachedDataOpts === values) {
			values = helpers.extend({}, values);
		}

		// Custom radius resolution
		values.radius = resolve([
			parsed && parsed._custom,
			me._config.radius,
			chart.options.elements.point.radius
		], context, index);

		return values;
	}
});
