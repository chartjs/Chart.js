'use strict';

var DatasetController = require('../core/core.datasetController');
var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var valueOrDefault = helpers.valueOrDefault;

defaults._set('radar', {
	spanGaps: false,
	scale: {
		type: 'radialLinear'
	},
	elements: {
		line: {
			fill: 'start',
			tension: 0 // no bezier in radar
		}
	}
});

module.exports = DatasetController.extend({
	datasetElementType: elements.Line,

	dataElementType: elements.Point,

	linkScales: helpers.noop,

	/**
	 * @private
	 */
	_datasetElementOptions: [
		'backgroundColor',
		'borderWidth',
		'borderColor',
		'borderCapStyle',
		'borderDash',
		'borderDashOffset',
		'borderJoinStyle',
		'fill'
	],

	/**
	 * @private
	 */
	_dataElementOptions: {
		backgroundColor: 'pointBackgroundColor',
		borderColor: 'pointBorderColor',
		borderWidth: 'pointBorderWidth',
		hitRadius: 'pointHitRadius',
		hoverBackgroundColor: 'pointHoverBackgroundColor',
		hoverBorderColor: 'pointHoverBorderColor',
		hoverBorderWidth: 'pointHoverBorderWidth',
		hoverRadius: 'pointHoverRadius',
		pointStyle: 'pointStyle',
		radius: 'pointRadius',
		rotation: 'pointRotation'
	},

	/**
	 * @private
	 */
	_getIndexScaleId: function() {
		return this.chart.scale.id;
	},

	/**
	 * @private
	 */
	_getValueScaleId: function() {
		return this.chart.scale.id;
	},

	update: function(reset) {
		var me = this;
		var meta = me.getMeta();
		var line = meta.dataset;
		var points = meta.data || [];
		var scale = me.chart.scale;
		var config = me._config;
		var i, ilen;

		// Compatibility: If the properties are defined with only the old name, use those values
		if (config.tension !== undefined && config.lineTension === undefined) {
			config.lineTension = config.tension;
		}

		// Utility
		line._scale = scale;
		line._datasetIndex = me.index;
		// Data
		line._children = points;
		line._loop = true;
		// Model
		line._model = me._resolveDatasetElementOptions(line);

		line.pivot();

		// Update Points
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			me.updateElement(points[i], i, reset);
		}

		// Update bezier control points
		me.updateBezierControlPoints();

		// Now pivot the point for animation
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			points[i].pivot();
		}
	},

	updateElement: function(point, index, reset) {
		var me = this;
		var custom = point.custom || {};
		var dataset = me.getDataset();
		var scale = me.chart.scale;
		var pointPosition = scale.getPointPositionForValue(index, dataset.data[index]);
		var options = me._resolveDataElementOptions(point, index);
		var lineModel = me.getMeta().dataset._model;
		var x = reset ? scale.xCenter : pointPosition.x;
		var y = reset ? scale.yCenter : pointPosition.y;

		// Utility
		point._scale = scale;
		point._options = options;
		point._datasetIndex = me.index;
		point._index = index;

		// Desired view properties
		point._model = {
			x: x, // value not used in dataset scale, but we want a consistent API between scales
			y: y,
			skip: custom.skip || isNaN(x) || isNaN(y),
			// Appearance
			radius: options.radius,
			pointStyle: options.pointStyle,
			rotation: options.rotation,
			backgroundColor: options.backgroundColor,
			borderColor: options.borderColor,
			borderWidth: options.borderWidth,
			tension: valueOrDefault(custom.tension, lineModel ? lineModel.tension : 0),

			// Tooltip
			hitRadius: options.hitRadius
		};
	},

	/**
	 * @private
	 */
	_resolveDatasetElementOptions: function() {
		var me = this;
		var config = me._config;
		var options = me.chart.options;
		var values = DatasetController.prototype._resolveDatasetElementOptions.apply(me, arguments);

		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.lineTension, options.elements.line.tension);

		return values;
	},

	updateBezierControlPoints: function() {
		var me = this;
		var meta = me.getMeta();
		var area = me.chart.chartArea;
		var points = meta.data || [];
		var i, ilen, model, controlPoints;

		// Only consider points that are drawn in case the spanGaps option is used
		if (meta.dataset._model.spanGaps) {
			points = points.filter(function(pt) {
				return !pt._model.skip;
			});
		}

		function capControlPoint(pt, min, max) {
			return Math.max(Math.min(pt, max), min);
		}

		for (i = 0, ilen = points.length; i < ilen; ++i) {
			model = points[i]._model;
			controlPoints = helpers.splineCurve(
				helpers.previousItem(points, i, true)._model,
				model,
				helpers.nextItem(points, i, true)._model,
				model.tension
			);

			// Prevent the bezier going outside of the bounds of the graph
			model.controlPointPreviousX = capControlPoint(controlPoints.previous.x, area.left, area.right);
			model.controlPointPreviousY = capControlPoint(controlPoints.previous.y, area.top, area.bottom);
			model.controlPointNextX = capControlPoint(controlPoints.next.x, area.left, area.right);
			model.controlPointNextY = capControlPoint(controlPoints.next.y, area.top, area.bottom);
		}
	},

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
		model.radius = valueOrDefault(options.hoverRadius, options.radius);
	}
});
