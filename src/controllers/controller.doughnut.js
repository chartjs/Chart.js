"use strict";

module.exports = function(Chart) {

	var helpers = Chart.helpers,
		defaults = Chart.defaults;

	defaults.doughnut = {
		animation: {
			//Boolean - Whether we animate the rotation of the Doughnut
			animateRotate: true,
			//Boolean - Whether we animate scaling the Doughnut from the centre
			animateScale: false
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
					text.push('<li><span style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '"></span>');
					if (chart.data.labels[i]) {
						text.push(chart.data.labels[i]);
					}
					text.push('</li>');
				}
			}

			text.push('</ul>');
			return text.join("");
		},
		legend: {
			labels: {
				generateLabels: function(chart) {
					var data = chart.data;
					if (data.labels.length && data.datasets.length) {
						return data.labels.map(function(label, i) {
							var meta = chart.getDatasetMeta(0);
							var ds = data.datasets[0];
							var arc = meta.data[i];
							var fill = arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(ds.backgroundColor, i, this.chart.options.elements.arc.backgroundColor);
							var stroke = arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(ds.borderColor, i, this.chart.options.elements.arc.borderColor);
							var bw = arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(ds.borderWidth, i, this.chart.options.elements.arc.borderWidth);

							return {
								text: label,
								fillStyle: fill,
								strokeStyle: stroke,
								lineWidth: bw,
								hidden: isNaN(ds.data[i]) || meta.data[i].hidden,

								// Extra data used for toggling the correct item
								index: i
							};
						}, this);
					} else {
						return [];
					}
				}
			},

			onClick: function(e, legendItem) {
				var index = legendItem.index;
				var chart = this.chart;
				var i, ilen, meta;

				for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
					meta = chart.getDatasetMeta(i);
					meta.data[index].hidden = !meta.data[index].hidden;
				}

				chart.update();
			}
		},

		//The percentage of the chart that we cut out of the middle.
		cutoutPercentage: 50,

		//The rotation of the chart, where the first data arc begins.
		rotation: Math.PI * -0.5,

		//The total circumference of the chart.
		circumference: Math.PI * 2.0,

		// Need to override these to give a nice default
		tooltips: {
			callbacks: {
				title: function() {
					return '';
				},
				label: function(tooltipItem, data) {
					return data.labels[tooltipItem.index] + ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
				}
			}
		}
	};

	defaults.pie = helpers.clone(defaults.doughnut);
	helpers.extend(defaults.pie, {
		cutoutPercentage: 0
	});


	Chart.controllers.doughnut = Chart.controllers.pie = Chart.DatasetController.extend({
		// no scales for doughnut
		linkScales: helpers.noop,

		addElements: function() {
			var meta = this.getMeta(),
				data = meta.data;
			helpers.each(this.getDataset().data, function(value, index) {
				data[index] = data[index] || new Chart.elements.Arc({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index
				});
			}, this);
		},

		addElementAndReset: function(index, colorForNewElement) {
			var arc = new Chart.elements.Arc({
				_chart: this.chart.chart,
				_datasetIndex: this.index,
				_index: index
			}),
			ds = this.getDataset();

			if (colorForNewElement && helpers.isArray(ds.backgroundColor)) {
				ds.backgroundColor.splice(index, 0, colorForNewElement);
			}

			// Add to the points array and reset it
			this.getMeta().data.splice(index, 0, arc);
			this.updateElement(arc, index, true);
		},

		// Get index of the dataset in relation to the visible datasets. This allows determining the inner and outer radius correctly
		getRingIndex: function getRingIndex(datasetIndex) {
			var ringIndex = 0;

			for (var j = 0; j < datasetIndex; ++j) {
				if (this.chart.isDatasetVisible(j)) {
					++ringIndex;
				}
			}

			return ringIndex;
		},

		update: function update(reset) {
			var chart = this.chart,
				chartArea = chart.chartArea,
				opts = chart.options,
				arcOpts = opts.elements.arc,
				availableWidth = chartArea.right - chartArea.left - arcOpts.borderWidth,
				availableHeight = chartArea.bottom - chartArea.top - arcOpts.borderWidth,
				minSize = Math.min(availableWidth, availableHeight),
				offset = {
					x: 0, 
					y: 0
				},
				meta = this.getMeta(),
				cutoutPercentage = opts.cutoutPercentage,
				circumference = opts.circumference;

			// If the chart's circumference isn't a full circle, calculate minSize as a ratio of the width/height of the arc
			if (circumference < Math.PI * 2.0) {
				var startAngle = opts.rotation % (Math.PI * 2.0);
				startAngle += Math.PI * 2.0 * (startAngle >= Math.PI ? -1 : startAngle < -Math.PI ? 1 : 0);
				var endAngle = startAngle + circumference;
				var start = {x: Math.cos(startAngle), y: Math.sin(startAngle)};
				var end = {x: Math.cos(endAngle), y: Math.sin(endAngle)};
				var contains0 = (startAngle <= 0 && 0 <= endAngle) || (startAngle <= Math.PI * 2.0 && Math.PI * 2.0 <= endAngle);
				var contains90 = (startAngle <= Math.PI * 0.5 && Math.PI * 0.5 <= endAngle) || (startAngle <= Math.PI * 2.5 && Math.PI * 2.5 <= endAngle);
				var contains180 = (startAngle <= -Math.PI && -Math.PI <= endAngle) || (startAngle <= Math.PI && Math.PI <= endAngle);
				var contains270 = (startAngle <= -Math.PI * 0.5 && -Math.PI * 0.5 <= endAngle) || (startAngle <= Math.PI * 1.5 && Math.PI * 1.5 <= endAngle);
				var cutout = cutoutPercentage / 100.0;
				var min = {x: contains180 ? -1 : Math.min(start.x * (start.x < 0 ? 1 : cutout), end.x * (end.x < 0 ? 1 : cutout)), y: contains270 ? -1 : Math.min(start.y * (start.y < 0 ? 1 : cutout), end.y * (end.y < 0 ? 1 : cutout))};
				var max = {x: contains0 ? 1 : Math.max(start.x * (start.x > 0 ? 1 : cutout), end.x * (end.x > 0 ? 1 : cutout)), y: contains90 ? 1 : Math.max(start.y * (start.y > 0 ? 1 : cutout), end.y * (end.y > 0 ? 1 : cutout))};
				var size = {width: (max.x - min.x) * 0.5, height: (max.y - min.y) * 0.5};
				minSize = Math.min(availableWidth / size.width, availableHeight / size.height);
				offset = {x: (max.x + min.x) * -0.5, y: (max.y + min.y) * -0.5};
			}

			chart.outerRadius = Math.max(minSize / 2, 0);
			chart.innerRadius = Math.max(cutoutPercentage ? (chart.outerRadius / 100) * (cutoutPercentage) : 1, 0);
			chart.radiusLength = (chart.outerRadius - chart.innerRadius) / chart.getVisibleDatasetCount();
			chart.offsetX = offset.x * chart.outerRadius;
			chart.offsetY = offset.y * chart.outerRadius;

			meta.total = this.calculateTotal();

			this.outerRadius = chart.outerRadius - (chart.radiusLength * this.getRingIndex(this.index));
			this.innerRadius = this.outerRadius - chart.radiusLength;

			helpers.each(meta.data, function(arc, index) {
				this.updateElement(arc, index, reset);
			}, this);
		},

		updateElement: function(arc, index, reset) {
			var chart = this.chart,
				chartArea = chart.chartArea,
				opts = chart.options,
				animationOpts = opts.animation,
				arcOpts = opts.elements.arc,
				centerX = (chartArea.left + chartArea.right) / 2,
				centerY = (chartArea.top + chartArea.bottom) / 2,
				startAngle = opts.rotation, // non reset case handled later
				endAngle = opts.rotation, // non reset case handled later
				dataset = this.getDataset(),
				circumference = reset && animationOpts.animateRotate ? 0 : arc.hidden ? 0 : this.calculateCircumference(dataset.data[index]) * (opts.circumference / (2.0 * Math.PI)),
				innerRadius = reset && animationOpts.animateScale ? 0 : this.innerRadius,
				outerRadius = reset && animationOpts.animateScale ? 0 : this.outerRadius,
				custom = arc.custom,
				valueAtIndexOrDefault = helpers.getValueAtIndexOrDefault,
				backgroundColor = "backgroundColor",
				hoverBackgroundColor = "hoverBackgroundColor",
				borderWidth = "borderWidth",
				borderColor = "borderColor";

			helpers.extend(arc, {
				// Utility
				_chart: chart.chart,
				_datasetIndex: this.index,
				_index: index,

				// Desired view properties
				_model: {
					x: centerX + chart.offsetX,
					y: centerY + chart.offsetY,
					startAngle: startAngle,
					endAngle: endAngle,
					circumference: circumference,
					outerRadius: outerRadius,
					innerRadius: innerRadius,
					label: valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index])
				}
			});

			var model = arc._model;
			model[backgroundColor] = custom && custom[backgroundColor] ? custom[backgroundColor] : valueAtIndexOrDefault(dataset[backgroundColor], index, arcOpts[backgroundColor]);
			model[hoverBackgroundColor] = custom && custom[hoverBackgroundColor] ? custom[hoverBackgroundColor] : valueAtIndexOrDefault(dataset[hoverBackgroundColor], index, arcOpts[hoverBackgroundColor]);
			model[borderWidth] = custom && custom[borderWidth] ? custom[borderWidth] : valueAtIndexOrDefault(dataset[borderWidth], index, arcOpts[borderWidth]);
			model[borderColor] = custom && custom[borderColor] ? custom[borderColor] : valueAtIndexOrDefault(dataset[borderColor], index, arcOpts[borderColor]);

			// Set correct angles if not resetting
			if (!reset || !animationOpts.animateRotate) {
				if (index === 0) {
					model.startAngle = opts.rotation;
				} else {
					model.startAngle = this.getMeta().data[index - 1]._model.endAngle;
				}

				model.endAngle = model.startAngle + model.circumference;
			}

			arc.pivot();
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			helpers.each(this.getMeta().data, function(arc, index) {
				arc.transition(easingDecimal).draw();
			});
		},

		removeHoverStyle: function(arc) {
			Chart.DatasetController.prototype.removeHoverStyle.call(this, arc, this.chart.options.elements.arc);
		},

		calculateTotal: function() {
			var dataset = this.getDataset();
			var meta = this.getMeta();
			var total = 0;
			var value;

			helpers.each(meta.data, function(element, index) {
				value = dataset.data[index];
				if (!isNaN(value) && !element.hidden) {
					total += Math.abs(value);
				}
			});

			return total;
		},

		calculateCircumference: function(value) {
			var total = this.getMeta().total;
			if (total > 0 && !isNaN(value)) {
				return (Math.PI * 2.0) * (value / total);
			} else {
				return 0;
			}
		}
	});
};
