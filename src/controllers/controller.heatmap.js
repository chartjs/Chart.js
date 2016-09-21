module.exports = function(Chart) {
	var helpers = Chart.helpers;

	Chart.HeatMapPlugin = Chart.PluginBase.extend({
		beforeInit: function(chart) {
			if (chart.config.type === 'heatmap') {
				// Keep the y-axis in sync with the datasets
				chart.data.yLabels = chart.data.datasets.map(function(ds) {
					return ds.label;
				});
			}
		},

		beforeUpdate: function(chart) {
			if (chart.config.type === 'heatmap') {
				// Keep the y-axis in sync with the datasets
				chart.data.yLabels = chart.data.datasets.map(function(ds) {
					return ds.label;
				});
			}
		},
	});

	Chart.plugins.register(new Chart.HeatMapPlugin());

	Chart.defaults.heatmap = {
		radiusScale: 0.1,
		paddingScale: 0.1,
		colorFunction: undefined,

		hover: {
			mode: 'single'
		},

		legend: {
			display: false
		},

		scales: {
			xAxes: [{
				type: 'category',
				position: 'bottom',
				gridLines: {
					display: false,
					offsetGridLines: true,
					drawBorder: false,
					drawTicks: false
				}
			}],
			yAxes: [{
				type: 'category',
				position: 'left',
				gridLines: {
					display: false,
					offsetGridLines: true,
					drawBorder: false,
					drawTicks: false
				}
			}]
		},

		tooltips: {
			callbacks: {
				title: function(tooltipItems, data) {
					return data.labels[tooltipItems[0].index];
				},
				label: function(tooltipItem, data) {
					var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
					var dataPoint = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
					return datasetLabel + ': ' + dataPoint;
				}
			}
		}
	};

	Chart.controllers.heatmap = Chart.DatasetController.extend({
		dataElementType: Chart.elements.Rectangle,

		update: function(reset) {
			var me = this;
			var meta = me.getMeta();
			var boxes = meta.data;

			// Update Boxes
			helpers.each(boxes, function(box, index) {
				me.updateElement(box, index, reset);
			});
		},

		updateElement: function(box, index) {
			var me = this;
			var meta = me.getMeta();
			var xScale = me.getScaleForId(meta.xAxisID);
			var yScale = me.getScaleForId(meta.yAxisID);
			var dataset = me.getDataset();
			var data = dataset.data[index];
			var datasetIndex = me.index;
			var radiusScale = me.chart.options.radiusScale;
			var paddingScale = me.chart.options.paddingScale;

			var x = xScale.getPixelForValue(data, index, datasetIndex);
			var y = yScale.getPixelForValue(data, datasetIndex, datasetIndex);

			var boxWidth = 0;
			if (dataset.data.length > 1) {
				var x0 = xScale.getPixelForValue(dataset.data[0], 0, datasetIndex);
				var x1 = xScale.getPixelForValue(dataset.data[1], 1, datasetIndex);
				boxWidth = x1 - x0;
			} else {
				boxWidth = xScale.width;
			}

			var boxHeight = 0;
			if (me.chart.data.datasets.length > 1) {
				// We only support 'category' scales on the y-axis for now
				boxHeight = yScale.getPixelForValue(null, 1, 1) - yScale.getPixelForValue(null, 0, 0);
			} else {
				boxHeight = yScale.height;
			}

			// Apply padding
			var horizontalPadding = paddingScale * boxWidth;
			var verticalPadding = paddingScale * boxHeight;
			boxWidth = boxWidth - horizontalPadding;
			boxHeight = boxHeight - verticalPadding;
			y = y + verticalPadding / 2;
			x = x + horizontalPadding / 2;

			var color = me.chart.options.colorFunction(data);
			var cornerRadius = boxWidth * radiusScale;

			helpers.extend(box, {
				// Utility
				_xScale: xScale,
				_yScale: yScale,
				_datasetIndex: datasetIndex,
				_index: index,
				_data: data,

				// Desired view properties
				_model: {
					// Position
					x: x + boxWidth / 2,
					y: y,

					// Appearance
					base: y + boxHeight,
					height: boxHeight,
					width: boxWidth,
					backgroundColor: color,
					cornerRadius: cornerRadius,

					// Tooltip
					label: me.chart.data.labels[index],
					datasetLabel: dataset.label,
				},

				// Override to draw rounded rectangles without any borders
				draw: function() {
					var ctx = this._chart.ctx;
					var vm = this._view;

					var leftX = vm.x - (vm.width) / 2;

					ctx.fillStyle = vm.backgroundColor;
					helpers.drawRoundedRectangle(ctx, leftX, vm.y, vm.width, vm.height, vm.cornerRadius);
					ctx.fill();
				},

				// Override to position the tooltip in the center of the box
				tooltipPosition: function() {
					var vm = this._view;
					return {
						x: vm.x,
						y: vm.y + vm.height / 2
					};
				}
			});

			box.pivot();
		},

		setHoverStyle: function() {
			// TODO: Implement this
		},

		removeHoverStyle: function() {
			// TODO: Implement this
		}
	});
};
