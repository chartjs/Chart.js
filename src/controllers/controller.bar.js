(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.controllers.bar = function(chart, datasetIndex) {
		this.initialize.call(this, chart, datasetIndex);
	};

	helpers.extend(Chart.controllers.bar.prototype, {

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
			helpers.each(this.getDataset().data, function(value, index) {
				this.getDataset().metaData[index] = this.getDataset().metaData[index] || new Chart.elements.Rectangle({
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

			var xScale = this.getScaleForId(this.getDataset().xAxisID);
			var yScale = this.getScaleForId(this.getDataset().yAxisID);
			helpers.each(this.getDataset().metaData, function(rectangle, index) {

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
					_chart: this.chart.chart,
					_xScale: xScale,
					_yScale: yScale,
					_datasetIndex: this.index,
					_index: index,


					// Desired view properties
					_model: {
						x: xScale.calculateBarX(this.chart.data.datasets.length, this.index, index),
						y: reset ? yScalePoint : yScale.getPixelForValue(this.getDataset().data[index]),

						// Tooltip
						label: this.chart.data.labels[index],
						datasetLabel: this.getDataset().label,

						// Appearance
						base: yScale.calculateBarBase(this.index, index),
						width: xScale.calculateBarWidth(this.chart.data.datasets.length),
						backgroundColor: rectangle.custom && rectangle.custom.backgroundColor ? rectangle.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.rectangle.backgroundColor),
						borderColor: rectangle.custom && rectangle.custom.borderColor ? rectangle.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.rectangle.borderColor),
						borderWidth: rectangle.custom && rectangle.custom.borderWidth ? rectangle.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.rectangle.borderWidth),
					},
				});
				rectangle.pivot();
			}, this);
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			helpers.each(this.getDataset().metaData, function(rectangle, index) {
				rectangle.transition(easingDecimal).draw();
			}, this);
		},








		// eachLine: function eachLine(callback) {
		// 	helpers.each(this.chart.data.datasets, function(dataset, datasetIndex) {
		// 		if (dataset.metaDataset && dataset.metaDataset instanceof Chart.Line) {
		// 			callback.call(this, dataset, datasetIndex);
		// 		}
		// 	}, this);
		// },

		// addLine: function addLine(dataset, datasetIndex) {
		// 	if (dataset) {
		// 		dataset.metaDataset = new Chart.Line({
		// 			_chart: this.chart.chart,
		// 			_datasetIndex: datasetIndex,
		// 			_points: dataset.metaData,
		// 		});
		// 	}
		// },

		// addPoint: function addPoint(dataset, datasetIndex, index) {
		// 	if (dataset) {
		// 		dataset.metaData = dataset.metaData || new Array(this.chart.data.datasets[datasetIndex].data.length);

		// 		if (index < dataset.metaData.length) {
		// 			dataset.metaData[index] = new Chart.Point({
		// 				_datasetIndex: datasetIndex,
		// 				_index: index,
		// 				_chart: this.chart.chart,
		// 				_model: {
		// 					x: 0,
		// 					y: 0,
		// 				},
		// 			});
		// 		}
		// 	}
		// },



		// resetElements: function resetElements() {
		// 	helpers.each(this.chart.data.datasets, function(dataset, datasetIndex) {
		// 		// All elements must be the same type for the given dataset so we are fine to check just the first one
		// 		if (dataset.metaData[0] instanceof Chart.Point) {
		// 			// Have points. Update all of them
		// 			this.resetDatasetPoints(dataset, datasetIndex);
		// 		} else if (dataset.metaData[0] instanceof Chart.Rectangle) {
		// 			// Have rectangles (bars)
		// 			this.resetDatasetRectangles(dataset, datasetIndex);
		// 		}
		// 	}, this);
		// },

		// resetDatasetPoints: function resetDatasetPoints(dataset, datasetIndex) {
		// 	helpers.each(dataset.metaData, function(point, index) {
		// 		var xScale = this.getScaleForId(this.chart.data.datasets[datasetIndex].xAxisID);
		// 		var yScale = this.getScaleForId(this.chart.data.datasets[datasetIndex].yAxisID);

		// 		var yScalePoint;

		// 		if (yScale.min < 0 && yScale.max < 0) {
		// 			// all less than 0. use the top
		// 			yScalePoint = yScale.getPixelForValue(yScale.max);
		// 		} else if (yScale.min > 0 && yScale.max > 0) {
		// 			yScalePoint = yScale.getPixelForValue(yScale.min);
		// 		} else {
		// 			yScalePoint = yScale.getPixelForValue(0);
		// 		}

		// 		helpers.extend(point, {
		// 			// Utility
		// 			_chart: this.chart.chart, //WTF
		// 			_xScale: xScale,
		// 			_yScale: yScale,
		// 			_datasetIndex: datasetIndex,
		// 			_index: index,

		// 			// Desired view properties
		// 			_model: {
		// 				x: xScale.getPointPixelForValue(this.chart.data.datasets[datasetIndex].data[index], index, datasetIndex),
		// 				y: yScalePoint,
		// 			},
		// 		});

		// 		this.updatePointElementAppearance(point, datasetIndex, index);
		// 	}, this);

		// 	this.updateBezierControlPoints(dataset);
		// },

		// resetDatasetRectangles: function resetDatasetRectangles(dataset, datasetIndex) {

		// },

		// resetElementAppearance: function(element, datasetIndex, index) {
		// 	if (element instanceof Chart.Point) {
		// 		this.updatePointElementAppearance(element, datasetIndex, index);
		// 	} else if (element instanceof Chart.Rectangle) {
		// 		this.updateRectangleElementAppearance(element, datasetIndex, index);
		// 	}
		// },

		// updateElements: function updateElements() {
		// 	// Update the lines
		// 	this.updateLines();

		// 	helpers.each(this.chart.data.datasets, function(dataset, datasetIndex) {
		// 		// All elements must be the same type for the given dataset so we are fine to check just the first one
		// 		if (dataset.metaData[0] instanceof Chart.Point) {
		// 			// Have points. Update all of them
		// 			this.updatePoints(dataset, datasetIndex);
		// 		} else if (dataset.metaData[0] instanceof Chart.Rectangle) {
		// 			// Have rectangles (bars)
		// 			this.updateRectangles(dataset, datasetIndex);
		// 		}
		// 	}, this);
		// },

		// updateLines: function updateLines() {
		// 	this.eachLine(function(dataset, datasetIndex) {
		// 		var yScale = this.getScaleForId(dataset.yAxisID);
		// 		var scaleBase;

		// 		if (yScale.min < 0 && yScale.max < 0) {
		// 			scaleBase = yScale.getPixelForValue(yScale.max);
		// 		} else if (yScale.min > 0 && yScale.max > 0) {
		// 			scaleBase = yScale.getPixelForValue(yScale.min);
		// 		} else {
		// 			scaleBase = yScale.getPixelForValue(0);
		// 		}

		// 		helpers.extend(dataset.metaDataset, {
		// 			// Utility
		// 			_scale: yScale,
		// 			_datasetIndex: datasetIndex,
		// 			// Data
		// 			_children: dataset.metaData,
		// 			// Model
		// 			_model: {
		// 				// Appearance
		// 				tension: dataset.metaDataset.custom && dataset.metaDataset.custom.tension ? dataset.metaDataset.custom.tension : (dataset.tension || this.chart.options.elements.line.tension),
		// 				backgroundColor: dataset.metaDataset.custom && dataset.metaDataset.custom.backgroundColor ? dataset.metaDataset.custom.backgroundColor : (dataset.backgroundColor || this.chart.options.elements.line.backgroundColor),
		// 				borderWidth: dataset.metaDataset.custom && dataset.metaDataset.custom.borderWidth ? dataset.metaDataset.custom.borderWidth : (dataset.borderWidth || this.chart.options.elements.line.borderWidth),
		// 				borderColor: dataset.metaDataset.custom && dataset.metaDataset.custom.borderColor ? dataset.metaDataset.custom.borderColor : (dataset.borderColor || this.chart.options.elements.line.borderColor),
		// 				fill: dataset.metaDataset.custom && dataset.metaDataset.custom.fill ? dataset.metaDataset.custom.fill : (dataset.fill !== undefined ? dataset.fill : this.chart.options.elements.line.fill),
		// 				skipNull: dataset.skipNull !== undefined ? dataset.skipNull : this.chart.options.elements.line.skipNull,
		// 				drawNull: dataset.drawNull !== undefined ? dataset.drawNull : this.chart.options.elements.line.drawNull,
		// 				// Scale
		// 				scaleTop: yScale.top,
		// 				scaleBottom: yScale.bottom,
		// 				scaleZero: scaleBase,
		// 			},
		// 		});

		// 		dataset.metaDataset.pivot();
		// 	});
		// },

		// updatePoints: function updatePoints(dataset, datasetIndex) {
		// 	helpers.each(dataset.metaData, function(point, index) {
		// 		var xScale = this.getScaleForId(this.chart.data.datasets[datasetIndex].xAxisID);
		// 		var yScale = this.getScaleForId(this.chart.data.datasets[datasetIndex].yAxisID);

		// 		helpers.extend(point, {
		// 			// Utility
		// 			_chart: this.chart.chart,
		// 			_xScale: xScale,
		// 			_yScale: yScale,
		// 			_datasetIndex: datasetIndex,
		// 			_index: index,

		// 			// Desired view properties
		// 			_model: {
		// 				x: xScale.getPointPixelForValue(this.chart.data.datasets[datasetIndex].data[index], index, datasetIndex),
		// 				y: yScale.getPointPixelForValue(this.chart.data.datasets[datasetIndex].data[index], index, datasetIndex),
		// 			},
		// 		});

		// 		this.updatePointElementAppearance(point, datasetIndex, index);
		// 	}, this);

		// 	this.updateBezierControlPoints(dataset);
		// },

		// updatePointElementAppearance: function updatePointElementAppearance(point, datasetIndex, index) {
		// 	helpers.extend(point._model, {
		// 		// Appearance
		// 		tension: point.custom && point.custom.tension ? point.custom.tension : this.chart.options.elements.line.tension,
		// 		radius: point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(this.chart.data.datasets[datasetIndex].radius, index, this.chart.options.elements.point.radius),
		// 		backgroundColor: point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.chart.data.datasets[datasetIndex].pointBackgroundColor, index, this.chart.options.elements.point.backgroundColor),
		// 		borderColor: point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.chart.data.datasets[datasetIndex].pointBorderColor, index, this.chart.options.elements.point.borderColor),
		// 		borderWidth: point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.chart.data.datasets[datasetIndex].pointBorderWidth, index, this.chart.options.elements.point.borderWidth),
		// 		skip: this.chart.data.datasets[datasetIndex].data[index] === null,

		// 		// Tooltip
		// 		hitRadius: point.custom && point.custom.hitRadius ? point.custom.hitRadius : helpers.getValueAtIndexOrDefault(this.chart.data.datasets[datasetIndex].hitRadius, index, this.chart.options.elements.point.hitRadius),
		// 	});
		// },


		// setElementHoverStyle: function setElementHoverStyle(element) {
		// 	if (element instanceof Chart.Point) {
		// 		this.setPointHoverStyle(element);
		// 	} else if (element instanceof Chart.Rectangle) {
		// 		this.setRectangleHoverStyle(element);
		// 	}
		// },

		// setPointHoverStyle: function setPointHoverStyle(point) {
		// 	var dataset = this.chart.data.datasets[point._datasetIndex];
		// 	var index = point._index;

		// 	point._model.radius = point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.chart.options.elements.point.hoverRadius);
		// 	point._model.backgroundColor = point.custom && point.custom.hoverBackgroundColor ? point.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.color(point._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
		// 	point._model.borderColor = point.custom && point.custom.hoverBorderColor ? point.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.color(point._model.borderColor).saturate(0.5).darken(0.1).rgbString());
		// 	point._model.borderWidth = point.custom && point.custom.hoverBorderWidth ? point.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, point._model.borderWidth);
		// },

		// setHoverStyle: function(rectangle) {
		// 	var dataset = this.chart.data.datasets[rectangle._datasetIndex];
		// 	var index = rectangle._index;

		// 	rectangle._model.backgroundColor = rectangle.custom && rectangle.custom.hoverBackgroundColor ? rectangle.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(rectangle._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
		// 	rectangle._model.borderColor = rectangle.custom && rectangle.custom.hoverBorderColor ? rectangle.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(rectangle._model.borderColor).saturate(0.5).darken(0.1).rgbString());
		// 	rectangle._model.borderWidth = rectangle.custom && rectangle.custom.hoverBorderWidth ? rectangle.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, rectangle._model.borderWidth);
		// },

		// updateBezierControlPoints: function updateBezierControlPoints(dataset) {
		// 	// Update control points for the bezier curve
		// 	helpers.each(dataset.metaData, function(point, index) {
		// 		var controlPoints = helpers.splineCurve(
		// 			this.previousPoint(dataset.metaData, index)._model,
		// 			point._model,
		// 			this.nextPoint(dataset.metaData, index)._model,
		// 			point._model.tension
		// 		);

		// 		point._model.controlPointPreviousX = controlPoints.previous.x;
		// 		point._model.controlPointNextX = controlPoints.next.x;

		// 		// Prevent the bezier going outside of the bounds of the graph

		// 		// Cap puter bezier handles to the upper/lower scale bounds
		// 		if (controlPoints.next.y > this.chart.chartArea.bottom) {
		// 			point._model.controlPointNextY = this.chart.chartArea.bottom;
		// 		} else if (controlPoints.next.y < this.chart.chartArea.top) {
		// 			point._model.controlPointNextY = this.chart.chartArea.top;
		// 		} else {
		// 			point._model.controlPointNextY = controlPoints.next.y;
		// 		}

		// 		// Cap inner bezier handles to the upper/lower scale bounds
		// 		if (controlPoints.previous.y > this.chart.chartArea.bottom) {
		// 			point._model.controlPointPreviousY = this.chart.chartArea.bottom;
		// 		} else if (controlPoints.previous.y < this.chart.chartArea.top) {
		// 			point._model.controlPointPreviousY = this.chart.chartArea.top;
		// 		} else {
		// 			point._model.controlPointPreviousY = controlPoints.previous.y;
		// 		}

		// 		// Now pivot the point for animation
		// 		point.pivot();
		// 	}, this);
		// },

		getElementsAtEvent: function(e) {
			var elementsArray = [],
				eventPosition = helpers.getRelativePosition(e),
				datasetIterator = function(dataset) {
					elementsArray.push(dataset.metaData[elementIndex]);
				},
				elementIndex;

			for (var datasetIndex = 0; datasetIndex < this.chart.data.datasets.length; datasetIndex++) {
				for (elementIndex = 0; elementIndex < this.chart.data.datasets[datasetIndex].metaData.length; elementIndex++) {
					if (this.chart.data.datasets[datasetIndex].metaData[elementIndex].inGroupRange(eventPosition.x, eventPosition.y)) {
						helpers.each(this.chart.data.datasets, datasetIterator);
					}
				}
			}

			return elementsArray.length ? elementsArray : [];
		},

		// // Get the single element that was clicked on
		// // @return : An object containing the dataset index and element index of the matching element. Also contains the rectangle that was drawn
		getElementAtEvent: function(e) {
			var element = [];
			var eventPosition = helpers.getRelativePosition(e);

			for (var datasetIndex = 0; datasetIndex < this.chart.data.datasets.length; ++datasetIndex) {
				for (var elementIndex = 0; elementIndex < this.chart.data.datasets[datasetIndex].metaData.length; ++elementIndex) {
					if (this.chart.data.datasets[datasetIndex].metaData[elementIndex].inRange(eventPosition.x, eventPosition.y)) {
						element.push(this.chart.data.datasets[datasetIndex].metaData[elementIndex]);
						return element;
					}
				}
			}

			return [];
		},
	});



}).call(this);
