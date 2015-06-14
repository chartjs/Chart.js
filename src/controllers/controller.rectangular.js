(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.RectangularController = function(chart) {
		this.chart = chart;
	};

	Chart.RectangularController.prototype.eachLine = function(callback) {
		helpers.each(this.chart.data.datasets, function(dataset, datasetIndex) {
			callback(dataset.metaDataset, datasetIndex)
		}, this);
	};

	Chart.RectangularController.prototype.eachPoint = function(callback) {
		helpers.each(this.chart.data.datasets, function(dataset, datasetIndex) {
			helpers.each(dataset.metaData, callback, this, dataset.metaData, datasetIndex);
		}, this);
	};

	Chart.RectangularController.prototype.addLine = function addLine(dataset, datasetIndex) {
		if (dataset) {
			dataset.metaDataset = new Chart.Line({
				_chart: this.chart.chart,
				_datasetIndex: datasetIndex,
				_points: dataset.metaData,
			});
		}
	}

	Chart.RectangularController.prototype.addPoint = function(dataset, datasetIndex, index) {
		if (dataset) {
			dataset.metaData = dataset.metaData || new Array(this.chart.data.datasets[datasetIndex].data.length);

			if (index < dataset.metaData.length) {
				dataset.metaData[index] = new Chart.Point({
					_datasetIndex: datasetIndex,
					_index: index,
					_chart: this.chart.chart,
					_model: {
						x: 0, 
						y: 0, 
					},
				})
			}
		}
	};

	Chart.RectangularController.prototype.resetElements = function() {
		// Update the points
		this.eachPoint(function(point, index, dataset, datasetIndex) {
			var xScale = this.chart.scales[this.chart.data.datasets[datasetIndex].xAxisID];
			var yScale = this.chart.scales[this.chart.data.datasets[datasetIndex].yAxisID];

			var yScalePoint;

			if (yScale.min < 0 && yScale.max < 0) {
				// all less than 0. use the top
				yScalePoint = yScale.getPixelForValue(yScale.max);
			} else if (yScale.min > 0 && yScale.max > 0) {
				yScalePoint = yScale.getPixelForValue(yScale.min);
			} else {
				yScalePoint = yScale.getPixelForValue(0);
			}

			helpers.extend(point, {
				// Utility
				_chart: this.chart.chart, //WTF
				_xScale: xScale,
				_yScale: yScale,
				_datasetIndex: datasetIndex,
				_index: index,

				// Desired view properties
				_model: {
					x: xScale.getPointPixelForValue(this.chart.data.datasets[datasetIndex].data[index], index, datasetIndex),
					y: yScalePoint,

					// Appearance
					tension: point.custom && point.custom.tension ? point.custom.tension : this.chart.options.elements.line.tension,
					radius: point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(this.chart.data.datasets[datasetIndex].radius, index, this.chart.options.elements.point.radius),
					backgroundColor: point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.chart.data.datasets[datasetIndex].pointBackgroundColor, index, this.chart.options.elements.point.backgroundColor),
					borderColor: point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.chart.data.datasets[datasetIndex].pointBorderColor, index, this.chart.options.elements.point.borderColor),
					borderWidth: point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.chart.data.datasets[datasetIndex].pointBorderWidth, index, this.chart.options.elements.point.borderWidth),
					skip: this.chart.data.datasets[datasetIndex].data[index] === null,

					// Tooltip
					hitRadius: point.custom && point.custom.hitRadius ? point.custom.hitRadius : helpers.getValueAtIndexOrDefault(this.chart.data.datasets[datasetIndex].hitRadius, index, this.chart.options.elements.point.hitRadius),
				},
			});
		}, this);

		// Update control points for the bezier curve
		this.eachPoint(function(point, index, dataset, datasetIndex) {
			var controlPoints = helpers.splineCurve(
				this.chart.previousPoint(dataset, index)._model,
				point._model,
				this.chart.nextPoint(dataset, index)._model,
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
	};

}).call(this);
