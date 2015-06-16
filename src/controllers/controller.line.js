(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.line = {
		hover: {
			mode: "label"
		},

		scales: {
			xAxes: [{
				type: "category",
			}],
			yAxes: [{
				type: "linear",
			}],
		},
	};


	Chart.controllers.line = function(chart, datasetIndex) {
		this.initialize.call(this, chart, datasetIndex);
	};

	helpers.extend(Chart.controllers.line.prototype, {

		initialize: function(chart, datasetIndex) {
			this.chart = chart;
			this.index = datasetIndex;
			this.linkScales();
			this.addElements();
		},

		linkScales: function() {
			if (!this.getDataset().xAxisID) {
				this.getDataset().xAxisID = this.chart.options.scales.xAxes[0].id;
			}

			if (!this.getDataset().yAxisID) {
				this.getDataset().yAxisID = this.chart.options.scales.yAxes[0].id;
			}
		},

		getDataset: function() {
			return this.chart.data.datasets[this.index];
		},

		getScaleForId: function(scaleID) {
			return this.chart.scales[scaleID];
		},

		addElements: function() {

			this.getDataset().metaData = this.getDataset().metaData || [];

			this.getDataset().metaDataset = this.getDataset().metaDataset || new Chart.elements.Line({
				_chart: this.chart.chart,
				_datasetIndex: this.index,
				_points: this.getDataset().metaData,
			});

			helpers.each(this.getDataset().data, function(value, index) {
				this.getDataset().metaData[index] = this.getDataset().metaData[index] || new Chart.elements.Point({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,
				});
			}, this);
		},

		reset: function() {
			this.update(true);
		},

		update: function(reset) {

			var line = this.getDataset().metaDataset;
			var points = this.getDataset().metaData;

			var yScale = this.getScaleForId(this.getDataset().yAxisID);
			var xScale = this.getScaleForId(this.getDataset().xAxisID);
			var scaleBase;

			if (yScale.min < 0 && yScale.max < 0) {
				scaleBase = yScale.getPixelForValue(yScale.max);
			} else if (yScale.min > 0 && yScale.max > 0) {
				scaleBase = yScale.getPixelForValue(yScale.min);
			} else {
				scaleBase = yScale.getPixelForValue(0);
			}


			// Update Line
			helpers.extend(line, {
				// Utility
				_scale: yScale,
				_datasetIndex: this.index,
				// Data
				_children: points,
				// Model
				_model: {
					// Appearance
					tension: line.custom && line.custom.tension ? line.custom.tension : (this.getDataset().tension || this.chart.options.elements.line.tension),
					backgroundColor: line.custom && line.custom.backgroundColor ? line.custom.backgroundColor : (this.getDataset().backgroundColor || this.chart.options.elements.line.backgroundColor),
					borderWidth: line.custom && line.custom.borderWidth ? line.custom.borderWidth : (this.getDataset().borderWidth || this.chart.options.elements.line.borderWidth),
					borderColor: line.custom && line.custom.borderColor ? line.custom.borderColor : (this.getDataset().borderColor || this.chart.options.elements.line.borderColor),
					fill: line.custom && line.custom.fill ? line.custom.fill : (this.getDataset().fill !== undefined ? this.getDataset().fill : this.chart.options.elements.line.fill),
					skipNull: this.getDataset().skipNull !== undefined ? this.getDataset().skipNull : this.chart.options.elements.line.skipNull,
					drawNull: this.getDataset().drawNull !== undefined ? this.getDataset().drawNull : this.chart.options.elements.line.drawNull,
					// Scale
					scaleTop: yScale.top,
					scaleBottom: yScale.bottom,
					scaleZero: scaleBase,
				},
			});
			line.pivot();

			// Update Points
			helpers.each(points, function(point, index) {
				helpers.extend(point, {
					// Utility
					_chart: this.chart.chart,
					_xScale: xScale,
					_yScale: yScale,
					_datasetIndex: this.index,
					_index: index,

					// Desired view properties
					_model: {
						x: xScale.getPointPixelForValue(this.getDataset().data[index], index, this.index),
						y: reset ? scaleBase : yScale.getPointPixelForValue(this.getDataset().data[index], index, this.index),
						// Appearance
						tension: point.custom && point.custom.tension ? point.custom.tension : this.chart.options.elements.line.tension,
						radius: point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(this.getDataset().radius, index, this.chart.options.elements.point.radius),
						backgroundColor: point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBackgroundColor, index, this.chart.options.elements.point.backgroundColor),
						borderColor: point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderColor, index, this.chart.options.elements.point.borderColor),
						borderWidth: point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderWidth, index, this.chart.options.elements.point.borderWidth),
						skip: this.getDataset().data[index] === null,

						// Tooltip
						hitRadius: point.custom && point.custom.hitRadius ? point.custom.hitRadius : helpers.getValueAtIndexOrDefault(this.getDataset().hitRadius, index, this.chart.options.elements.point.hitRadius),
					},

				});
			}, this);

			// Update bezier control points
			helpers.each(this.getDataset().metaData, function(point, index) {
				var controlPoints = helpers.splineCurve(
					helpers.previousItem(this.getDataset().metaData, index)._model,
					point._model,
					helpers.nextItem(this.getDataset().metaData, index)._model,
					point._model.tension
				);

				point._model.controlPointPreviousX = controlPoints.previous.x;
				point._model.controlPointNextX = controlPoints.next.x;

				// Prevent the bezier going outside of the bounds of the graph

				// Cap puter bezier handles to the upper/lower scale bounds
				if (controlPoints.next.y > this.chart.chartArea.bottom) {
					point._model.controlPointNextY = this.chart.chartArea.bottom;
				} else if (controlPoints.next.y < this.chart.chartArea.top) {
					point._model.controlPointNextY = this.chart.chartArea.top;
				} else {
					point._model.controlPointNextY = controlPoints.next.y;
				}

				// Cap inner bezier handles to the upper/lower scale bounds
				if (controlPoints.previous.y > this.chart.chartArea.bottom) {
					point._model.controlPointPreviousY = this.chart.chartArea.bottom;
				} else if (controlPoints.previous.y < this.chart.chartArea.top) {
					point._model.controlPointPreviousY = this.chart.chartArea.top;
				} else {
					point._model.controlPointPreviousY = controlPoints.previous.y;
				}

				// Now pivot the point for animation
				point.pivot();
			}, this);

		},

		draw: function(ease) {
			var easingDecimal = ease || 1;

			// Transition Point Locations
			helpers.each(this.getDataset().metaData, function(point, index) {
				point.transition(easingDecimal);
			}, this);

			// Transition and Draw the line
			this.getDataset().metaDataset.transition(easingDecimal).draw();

			// Draw the points
			helpers.each(this.getDataset().metaData, function(point) {
				point.draw();
			});
		},

		setHoverStyle: function(point) {
			// Point
			var dataset = this.chart.data.datasets[point._datasetIndex];
			var index = point._index;

			point._model.radius = point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.chart.options.elements.point.hoverRadius);
			point._model.backgroundColor = point.custom && point.custom.hoverBackgroundColor ? point.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.color(point._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			point._model.borderColor = point.custom && point.custom.hoverBorderColor ? point.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.color(point._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			point._model.borderWidth = point.custom && point.custom.hoverBorderWidth ? point.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, point._model.borderWidth);
		},

		removeHoverStyle: function(point) {
			var dataset = this.chart.data.datasets[point._datasetIndex];
			var index = point._index;

			point._model.radius = point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(this.getDataset().radius, index, this.chart.options.elements.point.radius);
			point._model.backgroundColor = point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBackgroundColor, index, this.chart.options.elements.point.backgroundColor);
			point._model.borderColor = point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderColor, index, this.chart.options.elements.point.borderColor);
			point._model.borderWidth = point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderWidth, index, this.chart.options.elements.point.borderWidth);
		}

	});



}).call(this);
