"use strict";

module.exports = function(Chart) {

	var helpers = Chart.helpers;

	Chart.defaults.polarArea = {

		scale: {
			type: "radialLinear",
			lineArc: true // so that lines are circular
		},

		//Boolean - Whether to animate the rotation of the chart
		animateRotate: true,
		animateScale: true,

		aspectRatio: 1,
		legendCallback: function(chart) {
			var text = [];
			text.push('<ul class="' + chart.id + '-legend">');

			if (chart.data.datasets.length) {
				for (var i = 0; i < chart.data.datasets[0].data.length; ++i) {
					text.push('<li><span style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '">');
					if (chart.data.labels[i]) {
						text.push(chart.data.labels[i]);
					}
					text.push('</span></li>');
				}
			}

			text.push('</ul>');
			return text.join("");
		},
		legend: {
			labels: {
				generateLabels: function(data) {
					if (data.labels.length && data.datasets.length) {
						return data.labels.map(function(label, i) {
							return {
								text: label,
								fillStyle: data.datasets[0].backgroundColor[i],
								hidden: isNaN(data.datasets[0].data[i]),

								// Extra data used for toggling the correct item
								index: i
							};
						});
					} else {
						return [];
					}
				}
			},
			onClick: function(e, legendItem) {
				helpers.each(this.chart.data.datasets, function(dataset) {
					dataset.metaHiddenData = dataset.metaHiddenData || [];
					var idx = legendItem.index;

					if (!isNaN(dataset.data[idx])) {
						dataset.metaHiddenData[idx] = dataset.data[idx];
						dataset.data[idx] = NaN;
					} else if (!isNaN(dataset.metaHiddenData[idx])) {
						dataset.data[idx] = dataset.metaHiddenData[idx];
					}
				});

				this.chart.update();
			}
		},

		// Need to override these to give a nice default
		tooltips: {
			callbacks: {
				title: function() {
					return '';
				},
				label: function(tooltipItem, data) {
					return data.labels[tooltipItem.index] + ': ' + tooltipItem.yLabel;
				}
			}
		}
	};

	Chart.controllers.polarArea = Chart.DatasetController.extend({
		linkScales: function() {
			// no scales for doughnut
		},
		addElements: function() {
			this.getDataset().metaData = this.getDataset().metaData || [];
			helpers.each(this.getDataset().data, function(value, index) {
				this.getDataset().metaData[index] = this.getDataset().metaData[index] || new Chart.elements.Arc({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index
				});
			}, this);
		},
		addElementAndReset: function(index) {
			this.getDataset().metaData = this.getDataset().metaData || [];
			var arc = new Chart.elements.Arc({
				_chart: this.chart.chart,
				_datasetIndex: this.index,
				_index: index
			});

			// Reset the point
			this.updateElement(arc, index, true);

			// Add to the points array
			this.getDataset().metaData.splice(index, 0, arc);
		},
		getVisibleDatasetCount: function getVisibleDatasetCount() {
			return helpers.where(this.chart.data.datasets, function(ds) {
				return helpers.isDatasetVisible(ds);
			}).length;
		},

		update: function update(reset) {
			var minSize = Math.min(this.chart.chartArea.right - this.chart.chartArea.left, this.chart.chartArea.bottom - this.chart.chartArea.top);
			this.chart.outerRadius = Math.max((minSize - this.chart.options.elements.arc.borderWidth / 2) / 2, 0);
			this.chart.innerRadius = Math.max(this.chart.options.cutoutPercentage ? (this.chart.outerRadius / 100) * (this.chart.options.cutoutPercentage) : 1, 0);
			this.chart.radiusLength = (this.chart.outerRadius - this.chart.innerRadius) / this.getVisibleDatasetCount();

			this.getDataset().total = 0;
			helpers.each(this.getDataset().data, function(value) {
				this.getDataset().total += Math.abs(value);
			}, this);

			this.outerRadius = this.chart.outerRadius - (this.chart.radiusLength * this.index);
			this.innerRadius = this.outerRadius - this.chart.radiusLength;

			helpers.each(this.getDataset().metaData, function(arc, index) {
				this.updateElement(arc, index, reset);
			}, this);
		},

		updateElement: function(arc, index, reset) {
			var circumference = this.calculateCircumference(this.getDataset().data[index]);
			var centerX = (this.chart.chartArea.left + this.chart.chartArea.right) / 2;
			var centerY = (this.chart.chartArea.top + this.chart.chartArea.bottom) / 2;

			// If there is NaN data before us, we need to calculate the starting angle correctly.
			// We could be way more efficient here, but its unlikely that the polar area chart will have a lot of data
			var notNullIndex = 0;
			for (var i = 0; i < index; ++i) {
				if (!isNaN(this.getDataset().data[i])) {
					++notNullIndex;
				}
			}

			var startAngle = (-0.5 * Math.PI) + (circumference * notNullIndex);
			var endAngle = startAngle + circumference;

			var resetModel = {
				x: centerX,
				y: centerY,
				innerRadius: 0,
				outerRadius: this.chart.options.animateScale ? 0 : this.chart.scale.getDistanceFromCenterForValue(this.getDataset().data[index]),
				startAngle: this.chart.options.animateRotate ? Math.PI * -0.5 : startAngle,
				endAngle: this.chart.options.animateRotate ? Math.PI * -0.5 : endAngle,

				backgroundColor: arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor),
				borderWidth: arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth),
				borderColor: arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor),

				label: helpers.getValueAtIndexOrDefault(this.chart.data.labels, index, this.chart.data.labels[index])
			};

			helpers.extend(arc, {
				// Utility
				_chart: this.chart.chart,
				_datasetIndex: this.index,
				_index: index,
				_scale: this.chart.scale,

				// Desired view properties
				_model: reset ? resetModel : {
					x: centerX,
					y: centerY,
					innerRadius: 0,
					outerRadius: this.chart.scale.getDistanceFromCenterForValue(this.getDataset().data[index]),
					startAngle: startAngle,
					endAngle: endAngle,

					backgroundColor: arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor),
					borderWidth: arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth),
					borderColor: arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor),

					label: helpers.getValueAtIndexOrDefault(this.chart.data.labels, index, this.chart.data.labels[index])
				}
			});

			arc.pivot();
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			helpers.each(this.getDataset().metaData, function(arc, index) {
				arc.transition(easingDecimal).draw();
			});
		},

		setHoverStyle: function(arc) {
			var dataset = this.chart.data.datasets[arc._datasetIndex];
			var index = arc._index;

			arc._model.backgroundColor = arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(arc._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			arc._model.borderColor = arc.custom && arc.custom.hoverBorderColor ? arc.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(arc._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			arc._model.borderWidth = arc.custom && arc.custom.hoverBorderWidth ? arc.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.hoverBorderWidth, index, arc._model.borderWidth);
		},

		removeHoverStyle: function(arc) {
			var dataset = this.chart.data.datasets[arc._datasetIndex];
			var index = arc._index;

			arc._model.backgroundColor = arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor);
			arc._model.borderColor = arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor);
			arc._model.borderWidth = arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth);
		},

		calculateCircumference: function(value) {
			if (isNaN(value)) {
				return 0;
			} else {
				// Count the number of NaN values
				var numNaN = helpers.where(this.getDataset().data, function(data) {
					return isNaN(data);
				}).length;

				return (2 * Math.PI) / (this.getDataset().data.length - numNaN);
			}
		}
	});

};