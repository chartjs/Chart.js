(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.RectangularElementController = function(chart) {
		this.chartInstance = chart;
	};

	Chart.RectangularElementController.prototype.getScaleForId = function getScaleForId(scaleID) {
		return this.chartInstance.scales[scaleID];
	};

	// 2 helper functions to get points in collections
	Chart.RectangularElementController.prototype.nextPoint = function nextPoint(collection, index) {
		return collection[index + 1] || collection[index];
	};
	Chart.RectangularElementController.prototype.previousPoint = function previousPoint(collection, index) {
		return collection[index - 1] || collection[index];
	};

	Chart.RectangularElementController.prototype.eachLine = function eachLine(callback) {
		helpers.each(this.chartInstance.data.datasets, function(dataset, datasetIndex) {
			if (dataset.metaDataset && dataset.metaDataset instanceof Chart.Line) {
				callback.call(this, dataset, datasetIndex)
			}
		}, this);
	};

	Chart.RectangularElementController.prototype.eachRectangle = function(callback) {
		helpers.each(this.chartInstance.data.datasets, function(dataset, datasetIndex) {
			helpers.each(dataset.metaData, function(element, index) {
				if (element instanceof Chart.Rectangle) {
					callback(element, index, dataset, datasetIndex);
				}
			}, this);
		}, this);
	};

	Chart.RectangularElementController.prototype.addLine = function addLine(dataset, datasetIndex) {
		if (dataset) {
			dataset.metaDataset = new Chart.Line({
				_chart: this.chartInstance.chart,
				_datasetIndex: datasetIndex,
				_points: dataset.metaData,
			});
		}
	}

	Chart.RectangularElementController.prototype.addPoint = function addPoint(dataset, datasetIndex, index) {
		if (dataset) {
			dataset.metaData = dataset.metaData || new Array(this.chartInstance.data.datasets[datasetIndex].data.length);

			if (index < dataset.metaData.length) {
				dataset.metaData[index] = new Chart.Point({
					_datasetIndex: datasetIndex,
					_index: index,
					_chart: this.chartInstance.chart,
					_model: {
						x: 0, 
						y: 0, 
					},
				})
			}
		}
	};

	Chart.RectangularElementController.prototype.addRectangle = function(dataset, datasetIndex, index) {
		if (dataset) {
			dataset.metaData = dataset.metaData || new Array(this.chartInstance.data.datasets[datasetIndex].data.length);

			if (index < dataset.metaData.length) {
				dataset.metaData[index] = new Chart.Rectangle({
					_chart: this.chartInstance.chart,
					_datasetIndex: datasetIndex,
					_index: index,
				});
			}
		}
	};

	Chart.RectangularElementController.prototype.resetElements = function resetElements() {
		helpers.each(this.chartInstance.data.datasets, function(dataset, datasetIndex) {
			// All elements must be the same type for the given dataset so we are fine to check just the first one
			if (dataset.metaData[0] instanceof Chart.Point) {
				// Have points. Update all of them
				this.resetDatasetPoints(dataset, datasetIndex);
			} else if (dataset.metaData[0] instanceof Chart.Rectangle) {
				// Have rectangles (bars)
				this.resetDatasetRectangles(dataset, datasetIndex);
			}
		}, this);
	};
	
	Chart.RectangularElementController.prototype.resetDatasetPoints = function resetDatasetPoints(dataset, datasetIndex) {
		helpers.each(dataset.metaData, function(point, index){
			var xScale = this.getScaleForId(this.chartInstance.data.datasets[datasetIndex].xAxisID);
			var yScale = this.getScaleForId(this.chartInstance.data.datasets[datasetIndex].yAxisID);

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
				_chart: this.chartInstance.chart, //WTF
				_xScale: xScale,
				_yScale: yScale,
				_datasetIndex: datasetIndex,
				_index: index,

				// Desired view properties
				_model: {
					x: xScale.getPointPixelForValue(this.chartInstance.data.datasets[datasetIndex].data[index], index, datasetIndex),
					y: yScalePoint,
				},
			});

			this.updatePointElementAppearance(point, datasetIndex, index);
		}, this);

		this.updateBezierControlPoints(dataset);
	};

	Chart.RectangularElementController.prototype.resetDatasetRectangles = function resetDatasetRectangles(dataset, datasetIndex) {
		helpers.each(dataset.metaData, function(rectangle, index) {
			var xScale = this.getScaleForId(this.chartInstance.data.datasets[datasetIndex].xAxisID);
			var yScale = this.getScaleForId(this.chartInstance.data.datasets[datasetIndex].yAxisID);

			var yScalePoint;

			if (yScale.min < 0 && yScale.max < 0) {
				// all less than 0. use the top
				yScalePoint = yScale.getPixelForValue(yScale.max);
			} else if (yScale.min > 0 && yScale.max > 0) {
				yScalePoint = yScale.getPixelForValue(yScale.min);
			} else {
				yScalePoint = yScale.getPixelForValue(0);
			}

			helpers.extend(rectangle, {
				// Utility
				_chart: this.chartInstance.chart,
				_xScale: xScale,
				_yScale: yScale,
				_datasetIndex: datasetIndex,
				_index: index,

				// Desired view properties
				_model: {
					x: xScale.calculateBarX(this.chartInstance.data.datasets.length, datasetIndex, index),
					y: yScalePoint,

					// Tooltip
					label: this.chartInstance.data.labels[index],
					datasetLabel: this.chartInstance.data.datasets[datasetIndex].label,

					// Appearance
					base: yScale.calculateBarBase(datasetIndex, index),
					width: xScale.calculateBarWidth(this.chartInstance.data.datasets.length),
				},
			});

			this.updateRectangleElementAppearance(rectangle, datasetIndex, index);
			rectangle.pivot();
		}, this);
	};

	Chart.RectangularElementController.prototype.resetElementAppearance = function(element, datasetIndex, index) {
		if (element instanceof Chart.Point) {
			this.updatePointElementAppearance(element, datasetIndex, index);
		} else if (element instanceof Chart.Rectangle) {
			this.updateRectangleElementAppearance(element, datasetIndex, index);
		}
	};

	Chart.RectangularElementController.prototype.updateElements = function updateElements() {
		// Update the lines
		this.updateLines();

		helpers.each(this.chartInstance.data.datasets, function(dataset, datasetIndex) {
			// All elements must be the same type for the given dataset so we are fine to check just the first one
			if (dataset.metaData[0] instanceof Chart.Point) {
				// Have points. Update all of them
				this.updatePoints(dataset, datasetIndex);
			} else if (dataset.metaData[0] instanceof Chart.Rectangle) {
				// Have rectangles (bars)
				this.updateRectangles(dataset, datasetIndex);
			}
		}, this);
	};

	Chart.RectangularElementController.prototype.updateLines = function updateLines() {
		this.eachLine(function(dataset, datasetIndex) {
			var yScale = this.getScaleForId(dataset.yAxisID);
			var scaleBase;

			if (yScale.min < 0 && yScale.max < 0) {
				scaleBase = yScale.getPixelForValue(yScale.max);
			} else if (yScale.min > 0 && yScale.max > 0) {
				scaleBase = yScale.getPixelForValue(yScale.min);
			} else {
				scaleBase = yScale.getPixelForValue(0);
			}

			helpers.extend(dataset.metaDataset, {
				// Utility
				_scale: yScale,
				_datasetIndex: datasetIndex,
				// Data
				_children: dataset.metaData,
				// Model
				_model: {
					// Appearance
					tension: dataset.metaDataset.custom && dataset.metaDataset.custom.tension ? dataset.metaDataset.custom.tension : (dataset.tension || this.chartInstance.options.elements.line.tension),
					backgroundColor: dataset.metaDataset.custom && dataset.metaDataset.custom.backgroundColor ? dataset.metaDataset.custom.backgroundColor : (dataset.backgroundColor || this.chartInstance.options.elements.line.backgroundColor),
					borderWidth: dataset.metaDataset.custom && dataset.metaDataset.custom.borderWidth ? dataset.metaDataset.custom.borderWidth : (dataset.borderWidth || this.chartInstance.options.elements.line.borderWidth),
					borderColor: dataset.metaDataset.custom && dataset.metaDataset.custom.borderColor ? dataset.metaDataset.custom.borderColor : (dataset.borderColor || this.chartInstance.options.elements.line.borderColor),
					fill: dataset.metaDataset.custom && dataset.metaDataset.custom.fill ? dataset.metaDataset.custom.fill : (dataset.fill !== undefined ? dataset.fill : this.chartInstance.options.elements.line.fill),
					skipNull: dataset.skipNull !== undefined ? dataset.skipNull : this.chartInstance.options.elements.line.skipNull,
					drawNull: dataset.drawNull !== undefined ? dataset.drawNull : this.chartInstance.options.elements.line.drawNull,
					// Scale
					scaleTop: yScale.top,
					scaleBottom: yScale.bottom,
					scaleZero: scaleBase,
				},
			});

			dataset.metaDataset.pivot();
		});
	};

	Chart.RectangularElementController.prototype.updatePoints = function updatePoints(dataset, datasetIndex) {
		helpers.each(dataset.metaData, function(point, index) {
			var xScale = this.getScaleForId(this.chartInstance.data.datasets[datasetIndex].xAxisID);
			var yScale = this.getScaleForId(this.chartInstance.data.datasets[datasetIndex].yAxisID);

			helpers.extend(point, {
				// Utility
				_chart: this.chartInstance.chart,
				_xScale: xScale,
				_yScale: yScale,
				_datasetIndex: datasetIndex,
				_index: index,

				// Desired view properties
				_model: {
					x: xScale.getPointPixelForValue(this.chartInstance.data.datasets[datasetIndex].data[index], index, datasetIndex),
					y: yScale.getPointPixelForValue(this.chartInstance.data.datasets[datasetIndex].data[index], index, datasetIndex),
				},
			});

			this.updatePointElementAppearance(point, datasetIndex, index);
		}, this);

		this.updateBezierControlPoints(dataset);
	};

	Chart.RectangularElementController.prototype.updatePointElementAppearance = function updatePointElementAppearance(point, datasetIndex, index) {
		helpers.extend(point._model, {
			// Appearance
			tension: point.custom && point.custom.tension ? point.custom.tension : this.chartInstance.options.elements.line.tension,
			radius: point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(this.chartInstance.data.datasets[datasetIndex].radius, index, this.chartInstance.options.elements.point.radius),
			backgroundColor: point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.chartInstance.data.datasets[datasetIndex].pointBackgroundColor, index, this.chartInstance.options.elements.point.backgroundColor),
			borderColor: point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.chartInstance.data.datasets[datasetIndex].pointBorderColor, index, this.chartInstance.options.elements.point.borderColor),
			borderWidth: point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.chartInstance.data.datasets[datasetIndex].pointBorderWidth, index, this.chartInstance.options.elements.point.borderWidth),
			skip: this.chartInstance.data.datasets[datasetIndex].data[index] === null,

			// Tooltip
			hitRadius: point.custom && point.custom.hitRadius ? point.custom.hitRadius : helpers.getValueAtIndexOrDefault(this.chartInstance.data.datasets[datasetIndex].hitRadius, index, this.chartInstance.options.elements.point.hitRadius),
		});
	};

	Chart.RectangularElementController.prototype.updateRectangles = function updateRectangles(dataset, datasetIndex) {
		helpers.each(dataset.metaData, function(rectangle, index){
			var xScale = this.getScaleForId(this.chartInstance.data.datasets[datasetIndex].xAxisID);
			var yScale = this.getScaleForId(this.chartInstance.data.datasets[datasetIndex].yAxisID);

			helpers.extend(rectangle, {
				// Utility
				_chart: this.chartInstance.chart,
				_xScale: xScale,
				_yScale: yScale,
				_datasetIndex: datasetIndex,
				_index: index,

				// Desired view properties
				_model: {
					x: xScale.calculateBarX(this.chartInstance.data.datasets.length, datasetIndex, index),
					y: yScale.calculateBarY(datasetIndex, index),

					// Appearance
					base: yScale.calculateBarBase(datasetIndex, index),
					width: xScale.calculateBarWidth(this.chartInstance.data.datasets.length),

					// Tooltip
					label: this.chartInstance.data.labels[index],
					datasetLabel: this.chartInstance.data.datasets[datasetIndex].label,
				},
			});

			this.updateRectangleElementAppearance(rectangle, datasetIndex, index);
			rectangle.pivot();
		}, this);
	};

	Chart.RectangularElementController.prototype.updateRectangleElementAppearance = function updateRectangleElementAppearance(rectangle, datasetIndex, index) {
		helpers.extend(rectangle._model, {
			// Appearance
			backgroundColor: rectangle.custom && rectangle.custom.backgroundColor ? rectangle.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.chartInstance.data.datasets[datasetIndex].backgroundColor, index, this.chartInstance.options.elements.rectangle.backgroundColor),
			borderColor: rectangle.custom && rectangle.custom.borderColor ? rectangle.custom.borderColor : helpers.getValueAtIndexOrDefault(this.chartInstance.data.datasets[datasetIndex].borderColor, index, this.chartInstance.options.elements.rectangle.borderColor),
			borderWidth: rectangle.custom && rectangle.custom.borderWidth ? rectangle.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.chartInstance.data.datasets[datasetIndex].borderWidth, index, this.chartInstance.options.elements.rectangle.borderWidth),
		});
	};

	Chart.RectangularElementController.prototype.setElementHoverStyle = function setElementHoverStyle(element) {
		if (element instanceof Chart.Point) {
			this.setPointHoverStyle(element);
		} else if (element instanceof Chart.Rectangle) {
			this.setRectangleHoverStyle(element);
		}
	};

	Chart.RectangularElementController.prototype.setPointHoverStyle = function setPointHoverStyle(point) {
		var dataset = this.chartInstance.data.datasets[point._datasetIndex];
		var index = point._index;

		point._model.radius = point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.chartInstance.options.elements.point.hoverRadius);
		point._model.backgroundColor = point.custom && point.custom.hoverBackgroundColor ? point.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.color(point._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
		point._model.borderColor = point.custom && point.custom.hoverBorderColor ? point.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.color(point._model.borderColor).saturate(0.5).darken(0.1).rgbString());
		point._model.borderWidth = point.custom && point.custom.hoverBorderWidth ? point.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, point._model.borderWidth);
	};

	Chart.RectangularElementController.prototype.setRectangleHoverStyle = function(rectangle) {
		var dataset = this.chartInstance.data.datasets[rectangle._datasetIndex];
		var index = rectangle._index;

		rectangle._model.backgroundColor = rectangle.custom && rectangle.custom.hoverBackgroundColor ? rectangle.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(rectangle._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
		rectangle._model.borderColor = rectangle.custom && rectangle.custom.hoverBorderColor ? rectangle.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(rectangle._model.borderColor).saturate(0.5).darken(0.1).rgbString());
		rectangle._model.borderWidth = rectangle.custom && rectangle.custom.hoverBorderWidth ? rectangle.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, rectangle._model.borderWidth);
	};

	Chart.RectangularElementController.prototype.updateBezierControlPoints = function updateBezierControlPoints(dataset) {
		// Update control points for the bezier curve
		helpers.each(dataset.metaData, function(point, index) {
			var controlPoints = helpers.splineCurve(
				this.previousPoint(dataset.metaData, index)._model,
				point._model,
				this.nextPoint(dataset.metaData, index)._model,
				point._model.tension
			);

			point._model.controlPointPreviousX = controlPoints.previous.x;
			point._model.controlPointNextX = controlPoints.next.x;

			// Prevent the bezier going outside of the bounds of the graph

			// Cap puter bezier handles to the upper/lower scale bounds
			if (controlPoints.next.y > this.chartInstance.chartArea.bottom) {
				point._model.controlPointNextY = this.chartInstance.chartArea.bottom;
			} else if (controlPoints.next.y < this.chartInstance.chartArea.top) {
				point._model.controlPointNextY = this.chartInstance.chartArea.top;
			} else {
				point._model.controlPointNextY = controlPoints.next.y;
			}

			// Cap inner bezier handles to the upper/lower scale bounds
			if (controlPoints.previous.y > this.chartInstance.chartArea.bottom) {
				point._model.controlPointPreviousY = this.chartInstance.chartArea.bottom;
			} else if (controlPoints.previous.y < this.chartInstance.chartArea.top) {
				point._model.controlPointPreviousY = this.chartInstance.chartArea.top;
			} else {
				point._model.controlPointPreviousY = controlPoints.previous.y;
			}

			// Now pivot the point for animation
			point.pivot();
		}, this);
	};

	Chart.RectangularElementController.prototype.getElementsAtEvent = function(e) {
		var elementsArray = [],
			eventPosition = helpers.getRelativePosition(e),
			datasetIterator = function(dataset) {
				elementsArray.push(dataset.metaData[elementIndex]);
			},
			elementIndex;

		for (var datasetIndex = 0; datasetIndex < this.chartInstance.data.datasets.length; datasetIndex++) {
			for (elementIndex = 0; elementIndex < this.chartInstance.data.datasets[datasetIndex].metaData.length; elementIndex++) {
				if (this.chartInstance.data.datasets[datasetIndex].metaData[elementIndex].inGroupRange(eventPosition.x, eventPosition.y)) {
					helpers.each(this.chartInstance.data.datasets, datasetIterator);
				}
			}
		}

		return elementsArray.length ? elementsArray : [];
	};

	// Get the single element that was clicked on
	// @return : An object containing the dataset index and element index of the matching element. Also contains the rectangle that was drawn
	Chart.RectangularElementController.prototype.getElementAtEvent = function(e) {
		var element = [];
		var eventPosition = helpers.getRelativePosition(e);

		for (var datasetIndex = 0; datasetIndex < this.chartInstance.data.datasets.length; ++datasetIndex) {
			for (var elementIndex = 0; elementIndex < this.chartInstance.data.datasets[datasetIndex].metaData.length; ++elementIndex) {
				if (this.chartInstance.data.datasets[datasetIndex].metaData[elementIndex].inRange(eventPosition.x, eventPosition.y)) {
					element.push(this.chartInstance.data.datasets[datasetIndex].metaData[elementIndex]);
					return element;
				}
			}
		}

		return [];
	};

}).call(this);
