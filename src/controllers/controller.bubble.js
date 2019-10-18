'use strict';

var DatasetController = require('../core/core.datasetController');
var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var valueOrDefault = helpers.valueOrDefault;
var resolve = helpers.options.resolve;

defaults._set('bubble', {
	hover: {
		mode: 'single'
	},

	scales: {
		xAxes: [{
			type: 'linear', // bubble should probably use a linear scale by default
			position: 'bottom',
			id: 'x-axis-0' // need an ID so datasets can reference the scale
		}],
		yAxes: [{
			type: 'linear',
			position: 'left',
			id: 'y-axis-0'
		}]
	},

	tooltips: {
		callbacks: {
			title: function() {
				// Title doesn't make sense for scatter since we format the data as a point
				return '';
			},
			label: function(item, data) {
				var datasetLabel = data.datasets[item.datasetIndex].label || '';
				var dataPoint = data.datasets[item.datasetIndex].data[item.index];
				return datasetLabel + ': (' + item.xLabel + ', ' + item.yLabel + ', ' + dataPoint.r + ')';
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
	 * @protected
	 */
	update: function(reset) {
		var me = this;
		var meta = me.getMeta();
		var points = meta.data;

		// Update Points
		helpers.each(points, function(point, index) {
			me.updateElement(point, index, reset);
		});
	},

	/**
	 * @protected
	 */
	updateElement: function(point, index, reset) {
		var me = this;
		var meta = me.getMeta();
		var custom = point.custom || {};
		var xScale = me.getScaleForId(meta.xAxisID);
		var yScale = me.getScaleForId(meta.yAxisID);
		var options = me._resolveDataElementOptions(point, index);
		var data = me.getDataset().data[index];
		var dsIndex = me.index;

		var x = reset ? xScale.getPixelForDecimal(0.5) : xScale.getPixelForValue(typeof data === 'object' ? data : NaN, index, dsIndex);
		var y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(data, index, dsIndex);

		point._xScale = xScale;
		point._yScale = yScale;
		point._options = options;
		point._datasetIndex = dsIndex;
		point._index = index;
		point._model = {
			backgroundColor: options.backgroundColor,
			borderColor: options.borderColor,
			borderWidth: options.borderWidth,
			hitRadius: options.hitRadius,
			pointStyle: options.pointStyle,
			rotation: options.rotation,
			radius: reset ? 0 : options.radius,
			skip: custom.skip || isNaN(x) || isNaN(y),
			x: x,
			y: y,
		};

		point.pivot();
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
	_resolveDataElementOptions: function(point, index) {
		var me = this;
		var chart = me.chart;
		var dataset = me.getDataset();
		var custom = point.custom || {};
		var data = dataset.data[index] || {};
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
			custom.radius,
			data.r,
			me._config.radius,
			chart.options.elements.point.radius
		], context, index);

		return values;
	}
});
