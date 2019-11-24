'use strict';

var DatasetController = require('../core/core.datasetController');
var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var valueOrDefault = helpers.valueOrDefault;
var resolve = helpers.options.resolve;
var isPointInArea = helpers.canvas._isPointInArea;

defaults._set('line', {
	showLines: true,
	spanGaps: false,

	hover: {
		mode: 'index'
	},

	scales: {
		x: {
			type: 'category',
		},
		y: {
			type: 'linear',
		},
	}
});

module.exports = DatasetController.extend({

	datasetElementType: elements.Line,

	dataElementType: elements.Point,

	/**
	 * @private
	 */
	_datasetElementOptions: [
		'backgroundColor',
		'borderCapStyle',
		'borderColor',
		'borderDash',
		'borderDashOffset',
		'borderJoinStyle',
		'borderWidth',
		'cubicInterpolationMode',
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

	update: function(reset) {
		const me = this;
		const meta = me._cachedMeta;
		const line = meta.dataset;
		const points = meta.data || [];
		const options = me.chart.options;
		const config = me._config;
		const showLine = me._showLine = valueOrDefault(config.showLine, options.showLines);
		let i, ilen;

		// Update Line
		if (showLine) {
			// Data
			line._children = points;
			// Model
			line._model = me._resolveDatasetElementOptions();

			line.pivot();
		}

		// Update Points
		me.updateElements(points, 0, points.length, reset);

		if (showLine && line._model.tension !== 0) {
			me.updateBezierControlPoints();
		}

		// Now pivot the point for animation
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			points[i].pivot(me.chart._animationsDisabled);
		}
	},

	updateElements: function(points, start, count, reset) {
		const me = this;
		const {xScale, yScale, _stacked} = me._cachedMeta;
		var i;

		for (i = start; i < start + count; ++i) {
			const point = points[i];
			const parsed = me._getParsed(i);
			const options = me._resolveDataElementOptions(i);
			const x = xScale.getPixelForValue(parsed[xScale.id]);
			const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(_stacked ? me._applyStack(yScale, parsed) : parsed[yScale.id]);

			// Utility
			point._options = options;

			// Desired view properties
			point._model = {
				x: x,
				y: y,
				skip: isNaN(x) || isNaN(y),
				// Appearance
				radius: options.radius,
				pointStyle: options.pointStyle,
				rotation: options.rotation,
				backgroundColor: options.backgroundColor,
				borderColor: options.borderColor,
				borderWidth: options.borderWidth,
				// Tooltip
				hitRadius: options.hitRadius
			};
		}
	},

	/**
	 * @private
	 */
	_resolveDatasetElementOptions: function() {
		var me = this;
		var config = me._config;
		var options = me.chart.options;
		var lineOptions = options.elements.line;
		var values = DatasetController.prototype._resolveDatasetElementOptions.apply(me, arguments);

		// The default behavior of lines is to break at null values, according
		// to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
		// This option gives lines the ability to span gaps
		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.lineTension, lineOptions.tension);
		values.steppedLine = resolve([config.steppedLine, lineOptions.stepped]);

		return values;
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
		var border = me._showLine ? meta.dataset._model.borderWidth : 0;
		var firstPoint = data[0].size();
		var lastPoint = data[data.length - 1].size();
		return Math.max(border, firstPoint, lastPoint) / 2;
	},

	updateBezierControlPoints: function() {
		var me = this;
		var chart = me.chart;
		var meta = me._cachedMeta;
		var lineModel = meta.dataset._model;
		var area = chart.chartArea;
		var points = meta.data || [];
		var i, ilen, model, controlPoints;

		// Only consider points that are drawn in case the spanGaps option is used
		if (lineModel.spanGaps) {
			points = points.filter(function(pt) {
				return !pt._model.skip;
			});
		}

		function capControlPoint(pt, min, max) {
			return Math.max(Math.min(pt, max), min);
		}

		if (lineModel.cubicInterpolationMode === 'monotone') {
			helpers.splineCurveMonotone(points);
		} else {
			for (i = 0, ilen = points.length; i < ilen; ++i) {
				model = points[i]._model;
				controlPoints = helpers.splineCurve(
					points[Math.max(0, i - 1)]._model,
					model,
					points[Math.min(i + 1, ilen - 1)]._model,
					lineModel.tension
				);
				model.controlPointPreviousX = controlPoints.previous.x;
				model.controlPointPreviousY = controlPoints.previous.y;
				model.controlPointNextX = controlPoints.next.x;
				model.controlPointNextY = controlPoints.next.y;
			}
		}

		if (chart.options.elements.line.capBezierPoints) {
			for (i = 0, ilen = points.length; i < ilen; ++i) {
				model = points[i]._model;
				if (isPointInArea(model, area)) {
					if (i > 0 && isPointInArea(points[i - 1]._model, area)) {
						model.controlPointPreviousX = capControlPoint(model.controlPointPreviousX, area.left, area.right);
						model.controlPointPreviousY = capControlPoint(model.controlPointPreviousY, area.top, area.bottom);
					}
					if (i < points.length - 1 && isPointInArea(points[i + 1]._model, area)) {
						model.controlPointNextX = capControlPoint(model.controlPointNextX, area.left, area.right);
						model.controlPointNextY = capControlPoint(model.controlPointNextY, area.top, area.bottom);
					}
				}
			}
		}
	},

	draw: function() {
		var me = this;
		var ctx = me._ctx;
		var chart = me.chart;
		var meta = me._cachedMeta;
		var points = meta.data || [];
		var area = chart.chartArea;
		var i = 0;
		var ilen = points.length;

		if (me._showLine) {
			meta.dataset.draw(ctx);
		}

		// Draw the points
		for (; i < ilen; ++i) {
			points[i].draw(ctx, area);
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
		model.radius = valueOrDefault(options.hoverRadius, options.radius);
	},
});
