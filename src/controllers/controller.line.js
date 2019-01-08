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
		mode: 'label'
	},

	scales: {
		xAxes: [{
			type: 'category',
			id: 'x-axis-0'
		}],
		yAxes: [{
			type: 'linear',
			id: 'y-axis-0'
		}]
	}
});

function lineEnabled(dataset, options) {
	return valueOrDefault(dataset.showLine, options.showLines);
}

module.exports = DatasetController.extend({

	datasetElementType: elements.Line,

	dataElementType: elements.Point,

	update: function(reset) {
		var me = this;
		var meta = me.getMeta();
		var line = meta.dataset;
		var points = meta.data || [];
		var options = me.chart.options;
		var lineElementOptions = options.elements.line;
		var scale = me.getScaleForId(meta.yAxisID);
		var i, ilen, custom;
		var dataset = me.getDataset();
		var showLine = lineEnabled(dataset, options);

		// Update Line
		if (showLine) {
			custom = line.custom || {};

			// Compatibility: If the properties are defined with only the old name, use those values
			if ((dataset.tension !== undefined) && (dataset.lineTension === undefined)) {
				dataset.lineTension = dataset.tension;
			}

			// Utility
			line._scale = scale;
			line._datasetIndex = me.index;
			// Data
			line._children = points;
			// Model
			line._model = {
				// Appearance
				// The default behavior of lines is to break at null values, according
				// to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
				// This option gives lines the ability to span gaps
				spanGaps: valueOrDefault(dataset.spanGaps, options.spanGaps),
				tension: resolve([custom.tension, dataset.lineTension, lineElementOptions.tension]),
				backgroundColor: resolve([custom.backgroundColor, dataset.backgroundColor, lineElementOptions.backgroundColor]),
				borderWidth: resolve([custom.borderWidth, dataset.borderWidth, lineElementOptions.borderWidth]),
				borderColor: resolve([custom.borderColor, dataset.borderColor, lineElementOptions.borderColor]),
				borderCapStyle: resolve([custom.borderCapStyle, dataset.borderCapStyle, lineElementOptions.borderCapStyle]),
				borderDash: resolve([custom.borderDash, dataset.borderDash, lineElementOptions.borderDash]),
				borderDashOffset: resolve([custom.borderDashOffset, dataset.borderDashOffset, lineElementOptions.borderDashOffset]),
				borderJoinStyle: resolve([custom.borderJoinStyle, dataset.borderJoinStyle, lineElementOptions.borderJoinStyle]),
				fill: resolve([custom.fill, dataset.fill, lineElementOptions.fill]),
				steppedLine: resolve([custom.steppedLine, dataset.steppedLine, lineElementOptions.stepped]),
				cubicInterpolationMode: resolve([custom.cubicInterpolationMode, dataset.cubicInterpolationMode, lineElementOptions.cubicInterpolationMode]),
			};

			line.pivot();
		}

		// Update Points
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			me.updateElement(points[i], i, reset);
		}

		if (showLine && line._model.tension !== 0) {
			me.updateBezierControlPoints();
		}

		// Now pivot the point for animation
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			points[i].pivot();
		}
	},

	getPointBackgroundColor: function(point, index) {
		var dataset = this.getDataset();
		var custom = point.custom || {};

		return resolve([
			custom.backgroundColor,
			dataset.pointBackgroundColor,
			dataset.backgroundColor,
			this.chart.options.elements.point.backgroundColor
		], undefined, index);
	},

	getPointBorderColor: function(point, index) {
		var dataset = this.getDataset();
		var custom = point.custom || {};

		return resolve([
			custom.borderColor,
			dataset.pointBorderColor,
			dataset.borderColor,
			this.chart.options.elements.point.borderColor
		], undefined, index);
	},

	getPointBorderWidth: function(point, index) {
		var dataset = this.getDataset();
		var custom = point.custom || {};

		return resolve([
			custom.borderWidth,
			dataset.pointBorderWidth,
			dataset.borderWidth,
			this.chart.options.elements.point.borderWidth
		], undefined, index);
	},

	getPointRotation: function(point, index) {
		var custom = point.custom || {};

		return resolve([
			custom.rotation,
			this.getDataset().pointRotation,
			this.chart.options.elements.point.rotation
		], undefined, index);
	},

	updateElement: function(point, index, reset) {
		var me = this;
		var meta = me.getMeta();
		var custom = point.custom || {};
		var dataset = me.getDataset();
		var datasetIndex = me.index;
		var value = dataset.data[index];
		var yScale = me.getScaleForId(meta.yAxisID);
		var xScale = me.getScaleForId(meta.xAxisID);
		var pointOptions = me.chart.options.elements.point;
		var x, y;

		// Compatibility: If the properties are defined with only the old name, use those values
		if ((dataset.radius !== undefined) && (dataset.pointRadius === undefined)) {
			dataset.pointRadius = dataset.radius;
		}
		if ((dataset.hitRadius !== undefined) && (dataset.pointHitRadius === undefined)) {
			dataset.pointHitRadius = dataset.hitRadius;
		}

		x = xScale.getPixelForValue(typeof value === 'object' ? value : NaN, index, datasetIndex);
		y = reset ? yScale.getBasePixel() : me.calculatePointY(value, index, datasetIndex);

		// Utility
		point._xScale = xScale;
		point._yScale = yScale;
		point._datasetIndex = datasetIndex;
		point._index = index;

		// Desired view properties
		point._model = {
			x: x,
			y: y,
			skip: custom.skip || isNaN(x) || isNaN(y),
			// Appearance
			radius: resolve([custom.radius, dataset.pointRadius, pointOptions.radius], undefined, index),
			pointStyle: resolve([custom.pointStyle, dataset.pointStyle, pointOptions.pointStyle], undefined, index),
			rotation: me.getPointRotation(point, index),
			backgroundColor: me.getPointBackgroundColor(point, index),
			borderColor: me.getPointBorderColor(point, index),
			borderWidth: me.getPointBorderWidth(point, index),
			tension: meta.dataset._model ? meta.dataset._model.tension : 0,
			steppedLine: meta.dataset._model ? meta.dataset._model.steppedLine : false,
			// Tooltip
			hitRadius: resolve([custom.hitRadius, dataset.pointHitRadius, pointOptions.hitRadius], undefined, index)
		};
	},

	calculatePointY: function(value, index, datasetIndex) {
		var me = this;
		var chart = me.chart;
		var meta = me.getMeta();
		var yScale = me.getScaleForId(meta.yAxisID);
		var sumPos = 0;
		var sumNeg = 0;
		var i, ds, dsMeta;

		if (yScale.options.stacked) {
			for (i = 0; i < datasetIndex; i++) {
				ds = chart.data.datasets[i];
				dsMeta = chart.getDatasetMeta(i);
				if (dsMeta.type === 'line' && dsMeta.yAxisID === yScale.id && chart.isDatasetVisible(i)) {
					var stackedRightValue = Number(yScale.getRightValue(ds.data[index]));
					if (stackedRightValue < 0) {
						sumNeg += stackedRightValue || 0;
					} else {
						sumPos += stackedRightValue || 0;
					}
				}
			}

			var rightValue = Number(yScale.getRightValue(value));
			if (rightValue < 0) {
				return yScale.getPixelForValue(sumNeg + rightValue);
			}
			return yScale.getPixelForValue(sumPos + rightValue);
		}

		return yScale.getPixelForValue(value);
	},

	updateBezierControlPoints: function() {
		var me = this;
		var chart = me.chart;
		var meta = me.getMeta();
		var lineModel = meta.dataset._model;
		var area = chart.chartArea;
		var points = meta.data || [];
		var i, ilen, point, model, controlPoints;

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
				point = points[i];
				model = point._model;
				controlPoints = helpers.splineCurve(
					helpers.previousItem(points, i)._model,
					model,
					helpers.nextItem(points, i)._model,
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
		var chart = me.chart;
		var meta = me.getMeta();
		var points = meta.data || [];
		var area = chart.chartArea;
		var ilen = points.length;
		var halfBorderWidth;
		var i = 0;

		if (lineEnabled(me.getDataset(), chart.options)) {
			halfBorderWidth = (meta.dataset._model.borderWidth || 0) / 2;

			helpers.canvas.clipArea(chart.ctx, {
				left: area.left,
				right: area.right,
				top: area.top - halfBorderWidth,
				bottom: area.bottom + halfBorderWidth
			});

			meta.dataset.draw();

			helpers.canvas.unclipArea(chart.ctx);
		}

		// Draw the points
		for (; i < ilen; ++i) {
			points[i].draw(area);
		}
	},

	setHoverStyle: function(element) {
		// Point
		var dataset = this.chart.data.datasets[element._datasetIndex];
		var index = element._index;
		var custom = element.custom || {};
		var model = element._model;
		var getHoverColor = helpers.getHoverColor;

		element.$previousStyle = {
			backgroundColor: model.backgroundColor,
			borderColor: model.borderColor,
			borderWidth: model.borderWidth,
			radius: model.radius
		};

		model.backgroundColor = resolve([custom.hoverBackgroundColor, dataset.pointHoverBackgroundColor, getHoverColor(model.backgroundColor)], undefined, index);
		model.borderColor = resolve([custom.hoverBorderColor, dataset.pointHoverBorderColor, getHoverColor(model.borderColor)], undefined, index);
		model.borderWidth = resolve([custom.hoverBorderWidth, dataset.pointHoverBorderWidth, model.borderWidth], undefined, index);
		model.radius = resolve([custom.hoverRadius, dataset.pointHoverRadius, this.chart.options.elements.point.hoverRadius], undefined, index);
	}
});
