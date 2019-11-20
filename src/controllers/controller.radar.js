'use strict';

var DatasetController = require('../core/core.datasetController');
var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var valueOrDefault = helpers.valueOrDefault;

defaults._set('radar', {
	spanGaps: false,
	scales: {
		r: {
			type: 'radialLinear',
		}
	},
	elements: {
		line: {
			tension: 0 // no bezier in radar
		}
	}
});

function nextItem(collection, index) {
	return index >= collection.length - 1 ? collection[0] : collection[index + 1];
}

function previousItem(collection, index) {
	return index <= 0 ? collection[collection.length - 1] : collection[index - 1];
}

module.exports = DatasetController.extend({
	datasetElementType: elements.Line,

	dataElementType: elements.Point,

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
		return this._cachedMeta.rAxisID;
	},

	/**
	 * @private
	 */
	_getValueScaleId: function() {
		return this._cachedMeta.rAxisID;
	},

	/**
	 * @private
	 */
	_getLabelAndValue: function(index) {
		const me = this;
		const vScale = me._cachedMeta.vScale;
		const parsed = me._getParsed(index);

		return {
			label: vScale._getLabels()[index],
			value: '' + vScale.getLabelForValue(parsed[vScale.id])
		};
	},

	update: function(reset) {
		var me = this;
		var meta = me._cachedMeta;
		var line = meta.dataset;
		var points = meta.data || [];
		var animationsDisabled = me.chart._animationsDisabled;
		var i, ilen;

		// Data
		line._children = points;
		line._loop = true;
		// Model
		line._model = me._resolveDatasetElementOptions();

		line.pivot(animationsDisabled);

		// Update Points
		me.updateElements(points, 0, points.length, reset);

		// Update bezier control points
		me.updateBezierControlPoints();

		// Now pivot the point for animation
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			points[i].pivot(animationsDisabled);
		}
	},

	updateElements: function(points, start, count, reset) {
		const me = this;
		const dataset = me.getDataset();
		const scale = me.chart.scales.r;
		var i;

		for (i = start; i < start + count; i++) {
			const point = points[i];
			const pointPosition = scale.getPointPositionForValue(i, dataset.data[i]);
			const options = me._resolveDataElementOptions(i);
			const x = reset ? scale.xCenter : pointPosition.x;
			const y = reset ? scale.yCenter : pointPosition.y;

			// Utility
			point._options = options;

			// Desired view properties
			point._model = {
				x: x, // value not used in dataset scale, but we want a consistent API between scales
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
		var values = DatasetController.prototype._resolveDatasetElementOptions.apply(me, arguments);

		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.lineTension, options.elements.line.tension);

		return values;
	},

	updateBezierControlPoints: function() {
		var me = this;
		var meta = me._cachedMeta;
		var lineModel = meta.dataset._model;
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
				previousItem(points, i)._model,
				model,
				nextItem(points, i)._model,
				lineModel.tension
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
