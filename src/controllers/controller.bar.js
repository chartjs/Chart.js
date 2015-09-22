(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.bar = {
		hover: {
			mode: "label"
		},

		scales: {
			xAxes: [{
				type: "category",
				categorySpacing: 10,
				spacing: 1,

				// grid line settings
				gridLines: {
					offsetGridLines: true,
				},
			}],
			yAxes: [{
				type: "linear",
			}],
		},
	};

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
		updateIndex: function(datasetIndex) {
			this.index = datasetIndex;
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

		// Get the number of datasets that display bars. We use this to correctly calculate the bar width
		getBarCount: function getBarCount() {
			var barCount = 0;

			helpers.each(this.chart.data.datasets, function(dataset) {
				if (dataset.type === 'bar') {
					++barCount;
				} else if (dataset.type === undefined && this.chart.config.type === 'bar') {
					++barCount;
				}
			}, this);

			return barCount;
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
		addElementAndReset: function(index) {
			this.getDataset().metaData = this.getDataset().metaData || [];
			var rectangle = new Chart.elements.Rectangle({
				_chart: this.chart.chart,
				_datasetIndex: this.index,
				_index: index,
			});

			var numBars = this.getBarCount();

			this.updateElement(rectangle, index, true, numBars);
			this.getDataset().metaData.splice(index, 0, rectangle);
		},
		removeElement: function(index) {
			this.getDataset().metaData.splice(index, 1);
		},

		reset: function() {
			this.update(true);
		},

		buildOrUpdateElements: function buildOrUpdateElements() {
			var numData = this.getDataset().data.length;
			var numRectangles = this.getDataset().metaData.length;

			// Make sure that we handle number of datapoints changing
			if (numData < numRectangles) {
				// Remove excess bars for data points that have been removed
				this.getDataset().metaData.splice(numData, numRectangles - numData)
			} else if (numData > numRectangles) {
				// Add new elements
				for (var index = numRectangles; index < numData; ++index) {
					this.addElementAndReset(index);
				}
			}
		},

		update: function update(reset) {
			var numBars = this.getBarCount();

			helpers.each(this.getDataset().metaData, function(rectangle, index) {
				this.updateElement(rectangle, index, reset, numBars);
			}, this);
		},

		updateElement: function updateElement(rectangle, index, reset, numBars) {
			var xScale = this.getScaleForId(this.getDataset().xAxisID);
			var yScale = this.getScaleForId(this.getDataset().yAxisID);
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
					x: xScale.calculateBarX(numBars, this.index, index),
					y: reset ? yScalePoint : yScale.calculateBarY(this.index, index),

					// Tooltip
					label: this.chart.data.labels[index],
					datasetLabel: this.getDataset().label,

					// Appearance
					base: yScale.calculateBarBase(this.index, index),
					width: xScale.calculateBarWidth(numBars),
					backgroundColor: rectangle.custom && rectangle.custom.backgroundColor ? rectangle.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.rectangle.backgroundColor),
					borderColor: rectangle.custom && rectangle.custom.borderColor ? rectangle.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.rectangle.borderColor),
					borderWidth: rectangle.custom && rectangle.custom.borderWidth ? rectangle.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.rectangle.borderWidth),
				},
			});
			rectangle.pivot();
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			helpers.each(this.getDataset().metaData, function(rectangle, index) {
				rectangle.transition(easingDecimal).draw();
			}, this);
		},

		setHoverStyle: function(rectangle) {
			var dataset = this.chart.data.datasets[rectangle._datasetIndex];
			var index = rectangle._index;

			rectangle._model.backgroundColor = rectangle.custom && rectangle.custom.hoverBackgroundColor ? rectangle.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(rectangle._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			rectangle._model.borderColor = rectangle.custom && rectangle.custom.hoverBorderColor ? rectangle.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(rectangle._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			rectangle._model.borderWidth = rectangle.custom && rectangle.custom.hoverBorderWidth ? rectangle.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.hoverBorderWidth, index, rectangle._model.borderWidth);
		},

		removeHoverStyle: function(rectangle) {
			var dataset = this.chart.data.datasets[rectangle._datasetIndex];
			var index = rectangle._index;

			rectangle._model.backgroundColor = rectangle.custom && rectangle.custom.backgroundColor ? rectangle.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.rectangle.backgroundColor);
			rectangle._model.borderColor = rectangle.custom && rectangle.custom.borderColor ? rectangle.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.rectangle.borderColor);
			rectangle._model.borderWidth = rectangle.custom && rectangle.custom.borderWidth ? rectangle.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.rectangle.borderWidth);
		}

	});



}).call(this);
