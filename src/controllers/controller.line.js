'use strict';

var DatasetController = require('../core/core.datasetController');
var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var _isPointInArea = helpers.canvas._isPointInArea;

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
	return helpers.valueOrDefault(dataset.showLine, options.showLines);
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
				spanGaps: dataset.spanGaps ? dataset.spanGaps : options.spanGaps,
				tension: custom.tension ? custom.tension : helpers.valueOrDefault(dataset.lineTension, lineElementOptions.tension),
				backgroundColor: custom.backgroundColor ? custom.backgroundColor : (dataset.backgroundColor || lineElementOptions.backgroundColor),
				borderWidth: custom.borderWidth ? custom.borderWidth : (dataset.borderWidth || lineElementOptions.borderWidth),
				borderColor: custom.borderColor ? custom.borderColor : (dataset.borderColor || lineElementOptions.borderColor),
				borderCapStyle: custom.borderCapStyle ? custom.borderCapStyle : (dataset.borderCapStyle || lineElementOptions.borderCapStyle),
				borderDash: custom.borderDash ? custom.borderDash : (dataset.borderDash || lineElementOptions.borderDash),
				borderDashOffset: custom.borderDashOffset ? custom.borderDashOffset : (dataset.borderDashOffset || lineElementOptions.borderDashOffset),
				borderJoinStyle: custom.borderJoinStyle ? custom.borderJoinStyle : (dataset.borderJoinStyle || lineElementOptions.borderJoinStyle),
				fill: custom.fill ? custom.fill : (dataset.fill !== undefined ? dataset.fill : lineElementOptions.fill),
				steppedLine: custom.steppedLine ? custom.steppedLine : helpers.valueOrDefault(dataset.steppedLine, lineElementOptions.stepped),
				cubicInterpolationMode: custom.cubicInterpolationMode ? custom.cubicInterpolationMode : helpers.valueOrDefault(dataset.cubicInterpolationMode, lineElementOptions.cubicInterpolationMode),
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
		var backgroundColor = this.chart.options.elements.point.backgroundColor;
		var dataset = this.getDataset();
		var custom = point.custom || {};

		if (custom.backgroundColor) {
			backgroundColor = custom.backgroundColor;
		} else if (dataset.pointBackgroundColor) {
			backgroundColor = helpers.valueAtIndexOrDefault(dataset.pointBackgroundColor, index, backgroundColor);
		} else if (dataset.backgroundColor) {
			backgroundColor = dataset.backgroundColor;
		}

		return backgroundColor;
	},

	getPointBorderColor: function(point, index) {
		var borderColor = this.chart.options.elements.point.borderColor;
		var dataset = this.getDataset();
		var custom = point.custom || {};

		if (custom.borderColor) {
			borderColor = custom.borderColor;
		} else if (dataset.pointBorderColor) {
			borderColor = helpers.valueAtIndexOrDefault(dataset.pointBorderColor, index, borderColor);
		} else if (dataset.borderColor) {
			borderColor = dataset.borderColor;
		}

		return borderColor;
	},

	getPointBorderWidth: function(point, index) {
		var borderWidth = this.chart.options.elements.point.borderWidth;
		var dataset = this.getDataset();
		var custom = point.custom || {};

		if (!isNaN(custom.borderWidth)) {
			borderWidth = custom.borderWidth;
		} else if (!isNaN(dataset.pointBorderWidth) || helpers.isArray(dataset.pointBorderWidth)) {
			borderWidth = helpers.valueAtIndexOrDefault(dataset.pointBorderWidth, index, borderWidth);
		} else if (!isNaN(dataset.borderWidth)) {
			borderWidth = dataset.borderWidth;
		}

		return borderWidth;
	},

	getPointRotation: function(point, index) {
		var pointRotation = this.chart.options.elements.point.rotation;
		var dataset = this.getDataset();
		var custom = point.custom || {};

		if (!isNaN(custom.rotation)) {
			pointRotation = custom.rotation;
		} else if (!isNaN(dataset.pointRotation) || helpers.isArray(dataset.pointRotation)) {
			pointRotation = helpers.valueAtIndexOrDefault(dataset.pointRotation, index, pointRotation);
		}
		return pointRotation;
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
			radius: custom.radius || helpers.valueAtIndexOrDefault(dataset.pointRadius, index, pointOptions.radius),
			pointStyle: custom.pointStyle || helpers.valueAtIndexOrDefault(dataset.pointStyle, index, pointOptions.pointStyle),
			rotation: me.getPointRotation(point, index),
			backgroundColor: me.getPointBackgroundColor(point, index),
			borderColor: me.getPointBorderColor(point, index),
			borderWidth: me.getPointBorderWidth(point, index),
			tension: meta.dataset._model ? meta.dataset._model.tension : 0,
			steppedLine: meta.dataset._model ? meta.dataset._model.steppedLine : false,
			// Tooltip
			hitRadius: custom.hitRadius || helpers.valueAtIndexOrDefault(dataset.pointHitRadius, index, pointOptions.hitRadius)
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
				if (_isPointInArea(model, area)) {
					if (i > 0 && _isPointInArea(points[i - 1]._model, area)) {
						model.controlPointPreviousX = capControlPoint(model.controlPointPreviousX, area.left, area.right);
						model.controlPointPreviousY = capControlPoint(model.controlPointPreviousY, area.top, area.bottom);
					}
					if (i < points.length - 1 && _isPointInArea(points[i + 1]._model, area)) {
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

		element.$previousStyle = {
			backgroundColor: model.backgroundColor,
			borderColor: model.borderColor,
			borderWidth: model.borderWidth,
			radius: model.radius
		};

		model.backgroundColor = custom.hoverBackgroundColor || helpers.valueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.getHoverColor(model.backgroundColor));
		model.borderColor = custom.hoverBorderColor || helpers.valueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.getHoverColor(model.borderColor));
		model.borderWidth = custom.hoverBorderWidth || helpers.valueAtIndexOrDefault(dataset.pointHoverBorderWidth, index, model.borderWidth);
		model.radius = custom.hoverRadius || helpers.valueAtIndexOrDefault(dataset.pointHoverRadius, index, this.chart.options.elements.point.hoverRadius);
	}
});
