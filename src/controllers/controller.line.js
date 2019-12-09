'use strict';

const DatasetController = require('../core/core.datasetController');
const defaults = require('../core/core.defaults');
const elements = require('../elements/index');
const helpers = require('../helpers/index');

const valueOrDefault = helpers.valueOrDefault;
const resolve = helpers.options.resolve;
const isPointInArea = helpers.canvas._isPointInArea;

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
		let i;

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
		const me = this;
		const config = me._config;
		const options = me.chart.options;
		const lineOptions = options.elements.line;
		const values = DatasetController.prototype._resolveDatasetElementOptions.apply(me, arguments);

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
		const me = this;
		const meta = me._cachedMeta;
		const data = meta.data || [];
		if (!data.length) {
			return false;
		}
		const border = me._showLine ? meta.dataset._model.borderWidth : 0;
		const firstPoint = data[0].size();
		const lastPoint = data[data.length - 1].size();
		return Math.max(border, firstPoint, lastPoint) / 2;
	},

	updateBezierControlPoints: function() {
		const me = this;
		const chart = me.chart;
		const meta = me._cachedMeta;
		const lineModel = meta.dataset._model;
		const area = chart.chartArea;
		let points = meta.data || [];
		let i, ilen;

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
				const model = points[i]._model;
				const controlPoints = helpers.splineCurve(
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
				const model = points[i]._model;
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
		const me = this;
		const ctx = me._ctx;
		const chart = me.chart;
		const meta = me._cachedMeta;
		const points = meta.data || [];
		const area = chart.chartArea;
		const ilen = points.length;
		let i = 0;

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
		const model = point._model;
		const options = point._options;
		const getHoverColor = helpers.getHoverColor;

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
