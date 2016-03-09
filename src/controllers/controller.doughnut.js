(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;

	Chart.defaults.doughnut = {
		animation: {
			//Boolean - Whether we animate the rotation of the Doughnut
			animateRotate: true,
			//Boolean - Whether we animate scaling the Doughnut from the centre
			animateScale: false,
		},
		aspectRatio: 1,
		hover: {
			mode: 'single'
		},
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
					return data.labels.map(function(label, i) {
						return {
							text: label,
							fillStyle: data.datasets[0].backgroundColor[i],
							hidden: isNaN(data.datasets[0].data[i]),

							// Extra data used for toggling the correct item
							index: i
						};
					});
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

		//The percentage of the chart that we cut out of the middle.
		cutoutPercentage: 50,

		// Need to override these to give a nice default
		tooltips: {
			callbacks: {
				title: function() { return '';},
				label: function(tooltipItem, data) {
					return data.labels[tooltipItem.index] + ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
				}
			}
		}
	};

	Chart.defaults.pie = helpers.clone(Chart.defaults.doughnut);
	helpers.extend(Chart.defaults.pie, {
		cutoutPercentage: 0
	});


	Chart.controllers.doughnut = Chart.controllers.pie = Chart.DatasetController.extend({
		linkScales: function() {
			// no scales for doughnut
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
		addElementAndReset: function(index, colorForNewElement) {
			this.getDataset().metaData = this.getDataset().metaData || [];
			var arc = new Chart.elements.Arc({
				_chart: this.chart.chart,
				_datasetIndex: this.index,
				_index: index,
			});

			if (colorForNewElement && helpers.isArray(this.getDataset().backgroundColor)) {
				this.getDataset().backgroundColor.splice(index, 0, colorForNewElement);
			}

			// Reset the point
			this.updateElement(arc, index, true);

			// Add to the points array
			this.getDataset().metaData.splice(index, 0, arc);
		},

		getVisibleDatasetCount: function getVisibleDatasetCount() {
			return helpers.where(this.chart.data.datasets, function(ds) { return helpers.isDatasetVisible(ds); }).length;
		},

		// Get index of the dataset in relation to the visible datasets. This allows determining the inner and outer radius correctly
		getRingIndex: function getRingIndex(datasetIndex) {
			var ringIndex = 0;

			for (var j = 0; j < datasetIndex; ++j) {
				if (helpers.isDatasetVisible(this.chart.data.datasets[j])) {
					++ringIndex;
				}
			}

			return ringIndex;
		},

		update: function update(reset) {
			var minSize = Math.min(this.chart.chartArea.right - this.chart.chartArea.left, this.chart.chartArea.bottom - this.chart.chartArea.top);

			this.chart.outerRadius = Math.max((minSize / 2) - this.chart.options.elements.arc.borderWidth / 2, 0);
			this.chart.innerRadius = Math.max(this.chart.options.cutoutPercentage ? (this.chart.outerRadius / 100) * (this.chart.options.cutoutPercentage) : 1, 0);
			this.chart.radiusLength = (this.chart.outerRadius - this.chart.innerRadius) / this.getVisibleDatasetCount();

			this.getDataset().total = 0;
			helpers.each(this.getDataset().data, function(value) {
				if (!isNaN(value)) {
					this.getDataset().total += Math.abs(value);
				}
			}, this);

			this.outerRadius = this.chart.outerRadius - (this.chart.radiusLength * this.getRingIndex(this.index));
			this.innerRadius = this.outerRadius - this.chart.radiusLength;

			helpers.each(this.getDataset().metaData, function(arc, index) {
				this.updateElement(arc, index, reset);
			}, this);
		},
		updateElement: function(arc, index, reset) {
			var centerX = (this.chart.chartArea.left + this.chart.chartArea.right) / 2;
			var centerY = (this.chart.chartArea.top + this.chart.chartArea.bottom) / 2;

			var resetModel = {
				x: centerX,
				y: centerY,
				startAngle: Math.PI * -0.5, // use - PI / 2 instead of 3PI / 2 to make animations better. It means that we never deal with overflow during the transition function
				endAngle: Math.PI * -0.5,
				circumference: (this.chart.options.animation.animateRotate) ? 0 : this.calculateCircumference(this.getDataset().data[index]),
				outerRadius: (this.chart.options.animation.animateScale) ? 0 : this.outerRadius,
				innerRadius: (this.chart.options.animation.animateScale) ? 0 : this.innerRadius
			};

			helpers.extend(arc, {
				// Utility
				_chart: this.chart.chart,
				_datasetIndex: this.index,
				_index: index,

				// Desired view properties
				_model: reset ? resetModel : {
					x: centerX,
					y: centerY,
					circumference: this.calculateCircumference(this.getDataset().data[index]),
					outerRadius: this.outerRadius,
					innerRadius: this.innerRadius,

					backgroundColor: arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor),
					hoverBackgroundColor: arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().hoverBackgroundColor, index, this.chart.options.elements.arc.hoverBackgroundColor),
					borderWidth: arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth),
					borderColor: arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor),

					label: helpers.getValueAtIndexOrDefault(this.getDataset().label, index, this.chart.data.labels[index])
				},
			});

			if (!reset) {

				if (index === 0) {
					arc._model.startAngle = Math.PI * -0.5; // use - PI / 2 instead of 3PI / 2 to make animations better. It means that we never deal with overflow during the transition function
				} else {
					arc._model.startAngle = this.getDataset().metaData[index - 1]._model.endAngle;
				}

				arc._model.endAngle = arc._model.startAngle + arc._model.circumference;


				//Check to see if it's the last arc, if not get the next and update its start angle
				if (index < this.getDataset().data.length - 1) {
					this.getDataset().metaData[index + 1]._model.startAngle = arc._model.endAngle;
				}
			}

			arc.pivot();
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			helpers.each(this.getDataset().metaData, function(arc, index) {
				arc.transition(easingDecimal).draw();
			}, this);
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
			if (this.getDataset().total > 0 && !isNaN(value)) {
				return (Math.PI * 1.999999) * (value / this.getDataset().total);
			} else {
				return 0;
			}
		},

	});


}).call(this);
