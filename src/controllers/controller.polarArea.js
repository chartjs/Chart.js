(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;


	Chart.defaults.polarArea = {

		scale: {
			type: "radialLinear",
			lineArc: true, // so that lines are circular
		},

		//Boolean - Whether to animate the rotation of the chart
		animateRotate: true,
	};

	Chart.controllers.polarArea = function(chart, datasetIndex) {
		this.initialize.call(this, chart, datasetIndex);
	};

	helpers.extend(Chart.controllers.polarArea.prototype, {

		initialize: function(chart, datasetIndex) {
			this.chart = chart;
			this.index = datasetIndex;
			this.linkScales();
			this.addElements();
		},

		linkScales: function() {
			// no scales for doughnut
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
				this.getDataset().metaData[index] = this.getDataset().metaData[index] || new Chart.elements.Arc({
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

			Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);
			//this.chart.scale.setScaleSize();
			this.chart.scale.calculateRange();
			this.chart.scale.generateTicks();
			this.chart.scale.buildYLabels();

			this.chart.outerRadius = (helpers.min([this.chart.chart.width, this.chart.chart.height]) - this.chart.options.elements.arc.borderWidth / 2) / 2;
			this.chart.innerRadius = this.chart.options.cutoutPercentage ? (this.chart.outerRadius / 100) * (this.chart.options.cutoutPercentage) : 1;
			this.chart.radiusLength = (this.chart.outerRadius - this.chart.innerRadius) / this.chart.data.datasets.length;

			this.getDataset().total = 0;
			helpers.each(this.getDataset().data, function(value) {
				this.getDataset().total += Math.abs(value);
			}, this);

			this.outerRadius = this.chart.outerRadius - (this.chart.radiusLength * this.index);
			this.innerRadius = this.outerRadius - this.chart.radiusLength;

			helpers.each(this.getDataset().metaData, function(arc, index) {

				var resetModel = {
					x: this.chart.chart.width / 2,
					y: this.chart.chart.height / 2,
					innerRadius: 0,
					outerRadius: 0,
					startAngle: Math.PI * -0.5,
					endAngle: Math.PI * -0.5,

					backgroundColor: arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor),
					hoverBackgroundColor: arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().hoverBackgroundColor, index, this.chart.options.elements.arc.hoverBackgroundColor),
					borderWidth: arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth),
					borderColor: arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor),

					label: helpers.getValueAtIndexOrDefault(this.chart.data.labels, index, this.chart.data.labels[index])
				};

				var circumference = 1 / this.getDataset().data.length * 2;
				var startAngle = (-0.5 * Math.PI) + (Math.PI * circumference) * index;
				var endAngle = startAngle + (circumference * Math.PI);

				console.log()

				helpers.extend(arc, {
					// Utility
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,

					// Desired view properties
					_model: reset ? resetModel : {
						x: this.chart.chart.width / 2,
						y: this.chart.chart.height / 2,
						innerRadius: 0,
						outerRadius: this.chart.scale.getDistanceFromCenterForValue(this.getDataset().data[index]),
						startAngle: startAngle,
						endAngle: endAngle,

						backgroundColor: arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor),
						hoverBackgroundColor: arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().hoverBackgroundColor, index, this.chart.options.elements.arc.hoverBackgroundColor),
						borderWidth: arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth),
						borderColor: arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor),

						label: helpers.getValueAtIndexOrDefault(this.chart.data.labels, index, this.chart.data.labels[index])
					},
				});

				arc.pivot();
			}, this);
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			helpers.each(this.getDataset().metaData, function(arc, index) {
				arc.transition(easingDecimal).draw();
				console.log(arc);
			}, this);
		},



		setHoverStyle: function(arc) {
			var dataset = this.chart.data.datasets[arc._datasetIndex];
			var index = arc._index;

			arc._model.backgroundColor = arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(arc._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			arc._model.borderColor = arc.custom && arc.custom.hoverBorderColor ? arc.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(arc._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			arc._model.borderWidth = arc.custom && arc.custom.hoverBorderWidth ? arc.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, arc._model.borderWidth);
		},

		removeHoverStyle: function(arc) {
			var dataset = this.chart.data.datasets[arc._datasetIndex];
			var index = arc._index;

			arc._model.backgroundColor = arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor);
			arc._model.borderColor = arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor);
			arc._model.borderWidth = arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth);
		},

		calculateCircumference: function(value) {
			if (this.getDataset().total > 0) {
				return (Math.PI * 2) * (value / this.getDataset().total);
			} else {
				return 0;
			}
		},
		updateScaleRange: function() {
			helpers.extend(this.chart.scale, {
				size: helpers.min([this.chart.width, this.chart.height]),
				xCenter: this.chart.width / 2,
				yCenter: this.chart.height / 2
			});
		},

	});



	return;


	Chart.Type.extend({});

}).call(this);
