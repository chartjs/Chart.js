(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	// The scale service is used to resize charts along with all of their axes. We make this as
	// a service where scales are registered with their respective charts so that changing the 
	// scales does not require 
	Chart.scaleService = {
		// Scale registration object. Extensions can register new scale types (such as log or DB scales) and then
		// use the new chart options to grab the correct scale
		constructors: {},
		// Use a registration function so that we can move to an ES6 map when we no longer need to support
		// old browsers
		// Scale config defaults
		defaults: {},
		registerScaleType: function(type, scaleConstructor, defaults) {
			this.constructors[type] = scaleConstructor;
			this.defaults[type] = defaults;
		},
		getScaleConstructor: function(type) {
			return this.constructors.hasOwnProperty(type) ? this.constructors[type] : undefined;
		},
		getScaleDefaults: function(type) {
			return this.defaults.hasOwnProperty(type) ? this.defaults[type] : {};
		},
		// The interesting function
		fitScalesForChart: function(chartInstance, width, height) {
			var xPadding = width > 30 ? 5 : 2;
			var yPadding = height > 30 ? 5 : 2;

			if (chartInstance) {
				var leftScales = helpers.where(chartInstance.scales, function(scaleInstance) {
					return scaleInstance.options.position == "left";
				});
				var rightScales = helpers.where(chartInstance.scales, function(scaleInstance) {
					return scaleInstance.options.position == "right";
				});
				var topScales = helpers.where(chartInstance.scales, function(scaleInstance) {
					return scaleInstance.options.position == "top";
				});
				var bottomScales = helpers.where(chartInstance.scales, function(scaleInstance) {
					return scaleInstance.options.position == "bottom";
				});

				// Essentially we now have any number of scales on each of the 4 sides.
				// Our canvas looks like the following.
				// The areas L1 and L2 are the left axes. R1 is the right axis, T1 is the top axis and 
				// B1 is the bottom axis
				// |------------------------------------------------------|
				// |          |             T1                      |     |
				// |----|-----|-------------------------------------|-----|
				// |    |     |                                     |     |
				// | L1 |  L2 |         Chart area                  |  R1 |
				// |    |     |                                     |     |
				// |    |     |                                     |     |
				// |----|-----|-------------------------------------|-----|
				// |          |             B1                      |     |
				// |          |                                     |     |
				// |------------------------------------------------------|

				// What we do to find the best sizing, we do the following
				// 1. Determine the minimum size of the chart area. 
				// 2. Split the remaining width equally between each vertical axis
				// 3. Split the remaining height equally between each horizontal axis
				// 4. Give each scale the maximum size it can be. The scale will return it's minimum size
				// 5. Adjust the sizes of each axis based on it's minimum reported size. 
				// 6. Refit each axis
				// 7. Position each axis in the final location
				// 8. Tell the chart the final location of the chart area

				// Step 1
				var chartWidth = width / 2; // min 50%
				var chartHeight = height / 2; // min 50%

				chartWidth -= (2 * xPadding);
				chartHeight -= (2 * yPadding);


				// Step 2
				var verticalScaleWidth = (width - chartWidth) / (leftScales.length + rightScales.length);

				// Step 3
				var horizontalScaleHeight = (height - chartHeight) / (topScales.length + bottomScales.length);

				// Step 4;
				var minimumScaleSizes = [];

				var verticalScaleMinSizeFunction = function(scaleInstance) {
					var minSize = scaleInstance.fit(verticalScaleWidth, chartHeight);
					minimumScaleSizes.push({
						horizontal: false,
						minSize: minSize,
						scale: scaleInstance,
					});
				};

				var horizontalScaleMinSizeFunction = function(scaleInstance) {
					var minSize = scaleInstance.fit(chartWidth, horizontalScaleHeight);
					minimumScaleSizes.push({
						horizontal: true,
						minSize: minSize,
						scale: scaleInstance,
					});
				};

				// vertical scales
				helpers.each(leftScales, verticalScaleMinSizeFunction);
				helpers.each(rightScales, verticalScaleMinSizeFunction);

				// horizontal scales
				helpers.each(topScales, horizontalScaleMinSizeFunction);
				helpers.each(bottomScales, horizontalScaleMinSizeFunction);

				// Step 5
				var maxChartHeight = height - (2 * yPadding);
				var maxChartWidth = width - (2 * xPadding);

				helpers.each(minimumScaleSizes, function(wrapper) {
					if (wrapper.horizontal) {
						maxChartHeight -= wrapper.minSize.height;
					} else {
						maxChartWidth -= wrapper.minSize.width;
					}
				});

				// At this point, maxChartHeight and maxChartWidth are the size the chart area could
				// be if the axes are drawn at their minimum sizes.

				// Step 6
				var verticalScaleFitFunction = function(scaleInstance) {
					var wrapper = helpers.findNextWhere(minimumScaleSizes, function(wrapper) {
						return wrapper.scale === scaleInstance;
					});

					if (wrapper) {
						scaleInstance.fit(wrapper.minSize.width, maxChartHeight);
					}
				};

				var horizontalScaleFitFunction = function(scaleInstance) {
					var wrapper = helpers.findNextWhere(minimumScaleSizes, function(wrapper) {
						return wrapper.scale === scaleInstance;
					});

					var scaleMargin = {
						left: totalLeftWidth,
						right: totalRightWidth,
						top: 0,
						bottom: 0,
					};

					if (wrapper) {
						scaleInstance.fit(maxChartWidth, wrapper.minSize.height, scaleMargin);
					}
				};

				var totalLeftWidth = xPadding;
				var totalRightWidth = xPadding;
				var totalTopHeight = yPadding;
				var totalBottomHeight = yPadding;

				helpers.each(leftScales, verticalScaleFitFunction);
				helpers.each(rightScales, verticalScaleFitFunction);

				// Figure out how much margin is on the left and right of the horizontal axes
				helpers.each(leftScales, function(scaleInstance) {
					totalLeftWidth += scaleInstance.width;
				});

				helpers.each(rightScales, function(scaleInstance) {
					totalRightWidth += scaleInstance.width;
				});

				helpers.each(topScales, horizontalScaleFitFunction);
				helpers.each(bottomScales, horizontalScaleFitFunction);

				helpers.each(topScales, function(scaleInstance) {
					totalTopHeight += scaleInstance.height;
				});
				helpers.each(bottomScales, function(scaleInstance) {
					totalBottomHeight += scaleInstance.height;
				});

				// Let the left scale know the final margin
				helpers.each(leftScales, function(scaleInstance) {
					var wrapper = helpers.findNextWhere(minimumScaleSizes, function(wrapper) {
						return wrapper.scale === scaleInstance;
					});

					var scaleMargin = {
						left: 0,
						right: 0,
						top: totalTopHeight,
						bottom: totalBottomHeight
					};

					if (wrapper) {
						scaleInstance.fit(wrapper.minSize.width, maxChartHeight, scaleMargin);
					}
				});

				helpers.each(rightScales, function(scaleInstance) {
					var wrapper = helpers.findNextWhere(minimumScaleSizes, function(wrapper) {
						return wrapper.scale === scaleInstance;
					});

					var scaleMargin = {
						left: 0,
						right: 0,
						top: totalTopHeight,
						bottom: totalBottomHeight
					};

					if (wrapper) {
						scaleInstance.fit(wrapper.minSize.width, maxChartHeight, scaleMargin);
					}
				});

				// Step 7 
				// Position the scales
				var left = xPadding;
				var top = yPadding;
				var right = 0;
				var bottom = 0;

				var verticalScalePlacer = function(scaleInstance) {
					scaleInstance.left = left;
					scaleInstance.right = left + scaleInstance.width;
					scaleInstance.top = totalTopHeight;
					scaleInstance.bottom = totalTopHeight + maxChartHeight;

					// Move to next point
					left = scaleInstance.right;
				};

				var horizontalScalePlacer = function(scaleInstance) {
					scaleInstance.left = totalLeftWidth;
					scaleInstance.right = totalLeftWidth + maxChartWidth;
					scaleInstance.top = top;
					scaleInstance.bottom = top + scaleInstance.height;

					// Move to next point 
					top = scaleInstance.bottom;
				};

				helpers.each(leftScales, verticalScalePlacer);
				helpers.each(topScales, horizontalScalePlacer);

				// Account for chart width and height
				left += maxChartWidth;
				top += maxChartHeight;

				helpers.each(rightScales, verticalScalePlacer);
				helpers.each(bottomScales, horizontalScalePlacer);

				// Step 8
				chartInstance.chartArea = {
					left: totalLeftWidth,
					top: totalTopHeight,
					right: totalLeftWidth + maxChartWidth,
					bottom: totalTopHeight + maxChartHeight,
				};
			}
		}
	};
}).call(this);
