'use strict';

var DatasetController = require('../core/core.datasetController');
var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var resolve = helpers.options.resolve;

defaults._set('radar', {
	scale: {
		type: 'radialLinear'
	},
	elements: {
		line: {
			tension: 0 // no bezier in radar
		}
	}
});

module.exports = DatasetController.extend({

	datasetElementType: elements.Line,

	dataElementType: elements.Point,

	linkScales: helpers.noop,

	update: function(reset) {
		var me = this;
		var meta = me.getMeta();
		var line = meta.dataset;
		var points = meta.data || [];
		var custom = line.custom || {};
		var dataset = me.getDataset();
		var lineElementOptions = me.chart.options.elements.line;
		var scale = me.chart.scale;
		var i, ilen;

		// Compatibility: If the properties are defined with only the old name, use those values
		if ((dataset.tension !== undefined) && (dataset.lineTension === undefined)) {
			dataset.lineTension = dataset.tension;
		}

		helpers.extend(meta.dataset, {
			// Utility
			_datasetIndex: me.index,
			_scale: scale,
			// Data
			_children: points,
			_loop: true,
			// Model
			_model: {
				// Appearance
				tension: resolve([custom.tension, dataset.lineTension, lineElementOptions.tension]),
				backgroundColor: resolve([custom.backgroundColor, dataset.backgroundColor, lineElementOptions.backgroundColor]),
				borderWidth: resolve([custom.borderWidth, dataset.borderWidth, lineElementOptions.borderWidth]),
				borderColor: resolve([custom.borderColor, dataset.borderColor, lineElementOptions.borderColor]),
				fill: resolve([custom.fill, dataset.fill, lineElementOptions.fill]),
				borderCapStyle: resolve([custom.borderCapStyle, dataset.borderCapStyle, lineElementOptions.borderCapStyle]),
				borderDash: resolve([custom.borderDash, dataset.borderDash, lineElementOptions.borderDash]),
				borderDashOffset: resolve([custom.borderDashOffset, dataset.borderDashOffset, lineElementOptions.borderDashOffset]),
				borderJoinStyle: resolve([custom.borderJoinStyle, dataset.borderJoinStyle, lineElementOptions.borderJoinStyle]),
			}
		});

		meta.dataset.pivot();

		// Update Points
		for (i = 0, ilen = points.length; i < ilen; i++) {
			me.updateElement(points[i], i, reset);
		}

		// Update bezier control points
		me.updateBezierControlPoints();

		// Now pivot the point for animation
		for (i = 0, ilen = points.length; i < ilen; i++) {
			points[i].pivot();
		}
	},

	updateElement: function(point, index, reset) {
		var me = this;
		var custom = point.custom || {};
		var dataset = me.getDataset();
		var scale = me.chart.scale;
		var pointElementOptions = me.chart.options.elements.point;
		var pointPosition = scale.getPointPositionForValue(index, dataset.data[index]);

		// Compatibility: If the properties are defined with only the old name, use those values
		if ((dataset.radius !== undefined) && (dataset.pointRadius === undefined)) {
			dataset.pointRadius = dataset.radius;
		}
		if ((dataset.hitRadius !== undefined) && (dataset.pointHitRadius === undefined)) {
			dataset.pointHitRadius = dataset.hitRadius;
		}

		helpers.extend(point, {
			// Utility
			_datasetIndex: me.index,
			_index: index,
			_scale: scale,

			// Desired view properties
			_model: {
				x: reset ? scale.xCenter : pointPosition.x, // value not used in dataset scale, but we want a consistent API between scales
				y: reset ? scale.yCenter : pointPosition.y,

				// Appearance
				tension: resolve([custom.tension, dataset.lineTension, me.chart.options.elements.line.tension]),
				radius: resolve([custom.radius, dataset.pointRadius, pointElementOptions.radius], undefined, index),
				backgroundColor: resolve([custom.backgroundColor, dataset.pointBackgroundColor, pointElementOptions.backgroundColor], undefined, index),
				borderColor: resolve([custom.borderColor, dataset.pointBorderColor, pointElementOptions.borderColor], undefined, index),
				borderWidth: resolve([custom.borderWidth, dataset.pointBorderWidth, pointElementOptions.borderWidth], undefined, index),
				pointStyle: resolve([custom.pointStyle, dataset.pointStyle, pointElementOptions.pointStyle], undefined, index),
				rotation: resolve([custom.rotation, dataset.pointRotation, pointElementOptions.rotation], undefined, index),

				// Tooltip
				hitRadius: resolve([custom.hitRadius, dataset.pointHitRadius, pointElementOptions.hitRadius], undefined, index)
			}
		});

		point._model.skip = custom.skip || isNaN(point._model.x) || isNaN(point._model.y);
	},

	updateBezierControlPoints: function() {
		var me = this;
		var meta = me.getMeta();
		var area = me.chart.chartArea;
		var points = meta.data || [];
		var i, ilen, model, controlPoints;

		function capControlPoint(pt, min, max) {
			return Math.max(Math.min(pt, max), min);
		}

		for (i = 0, ilen = points.length; i < ilen; i++) {
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
		// Point
		var dataset = this.chart.data.datasets[point._datasetIndex];
		var custom = point.custom || {};
		var index = point._index;
		var model = point._model;
		var getHoverColor = helpers.getHoverColor;

		point.$previousStyle = {
			backgroundColor: model.backgroundColor,
			borderColor: model.borderColor,
			borderWidth: model.borderWidth,
			radius: model.radius
		};

		model.radius = resolve([custom.hoverRadius, dataset.pointHoverRadius, this.chart.options.elements.point.hoverRadius], undefined, index);
		model.backgroundColor = resolve([custom.hoverBackgroundColor, dataset.pointHoverBackgroundColor, getHoverColor(model.backgroundColor)], undefined, index);
		model.borderColor = resolve([custom.hoverBorderColor, dataset.pointHoverBorderColor, getHoverColor(model.borderColor)], undefined, index);
		model.borderWidth = resolve([custom.hoverBorderWidth, dataset.pointHoverBorderWidth, model.borderWidth], undefined, index);
	}
});
