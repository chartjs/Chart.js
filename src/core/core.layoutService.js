(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	// The layout service is ver self explanatory.  It's responsible for the layout within a chart.  
	// Scales, Legends and Plugins all rely on the layout service and can easily register to be placed anywhere they need
	// It is this service's responsibility of carrying out that layout.
	Chart.layoutService = {
		defaults: {},

		// Register a box to a chartInstance. A box is simply a reference to an object that requires layout. eg. Scales, Legend, Plugins.
		addBox: function(chartInstance, box) {
			if (!chartInstance.boxes) {
				chartInstance.boxes = [];
			}
			chartInstance.boxes.push(box);
		},

		removeBox: function(chartInstance, box) {
			if (!chartInstance.boxes) {
				return;
			}
			chartInstance.boxes.splice(chartInstance.boxes.indexOf(box), 1);
		},

		// The most important function
		update: function(chartInstance, width, height) {

			if (!chartInstance) {
				return;
			}

			var xPadding = width > 30 ? 5 : 2;
			var yPadding = height > 30 ? 5 : 2;

			var leftBoxes = helpers.where(chartInstance.boxes, function(box) {
				return box.options.position == "left";
			});
			var rightBoxes = helpers.where(chartInstance.boxes, function(box) {
				return box.options.position == "right";
			});
			var topBoxes = helpers.where(chartInstance.boxes, function(box) {
				return box.options.position == "top";
			});
			var bottomBoxes = helpers.where(chartInstance.boxes, function(box) {
				return box.options.position == "bottom";
			});

			// Boxes that overlay the chartarea such as the radialLinear scale
			var chartAreaBoxes = helpers.where(chartInstance.boxes, function(box) {
				return box.options.position == "chartArea";
			});

			// Essentially we now have any number of boxes on each of the 4 sides.
			// Our canvas looks like the following.
			// The areas L1 and L2 are the left axes. R1 is the right axis, T1 is the top axis and 
			// B1 is the bottom axis
			// There are also 4 quadrant-like locations (left to right instead of clockwise) reserved for chart overlays
			// These locations are single-box locations only, when trying to register a chartArea location that is already taken,
			// an error will be thrown.
			//
			// |----------------------------------------------------|
			// |                  T1 (Full Width)                   |
			// |----------------------------------------------------|
			// |    |    |                 T2                  |    |
			// |    |----|-------------------------------------|----|
			// |    |    | C1 |                           | C2 |    |
			// |    |    |----|                           |----|    |
			// |    |    |                                     |    |
			// | L1 | L2 |           ChartArea (C0)            | R1 |
			// |    |    |                                     |    |
			// |    |    |----|                           |----|    |
			// |    |    | C3 |                           | C4 |    |
			// |    |----|-------------------------------------|----|
			// |    |    |                 B1                  |    |
			// |----------------------------------------------------|
			// |                  B2 (Full Width)                   |
			// |----------------------------------------------------|
			//
			// What we do to find the best sizing, we do the following
			// 1. Determine the minimum size of the chart area. 
			// 2. Split the remaining width equally between each vertical axis
			// 3. Split the remaining height equally between each horizontal axis
			// 4. Give each layout the maximum size it can be. The layout will return it's minimum size
			// 5. Adjust the sizes of each axis based on it's minimum reported size. 
			// 6. Refit each axis
			// 7. Position each axis in the final location
			// 8. Tell the chart the final location of the chart area
			// 9. Tell any axes that overlay the chart area the positions of the chart area

			// Step 1
			var chartWidth = width / 2; // min 50%
			var chartHeight = height / 2; // min 50%

			chartWidth -= (2 * xPadding);
			chartHeight -= (2 * yPadding);

			// Step 2
			var verticalBoxWidth = (width - chartWidth) / (leftBoxes.length + rightBoxes.length);

			// Step 3
			var horizontalBoxHeight = (height - chartHeight) / (topBoxes.length + bottomBoxes.length);

			// Step 4;
			var minBoxSizes = [];

			// vertical boxes
			helpers.each(leftBoxes, verticalBoxMinSizeFunction);
			helpers.each(rightBoxes, verticalBoxMinSizeFunction);

			function verticalBoxMinSizeFunction(box) {
				var minSize = box.update(verticalBoxWidth, chartHeight);
				minBoxSizes.push({
					horizontal: false,
					minSize: minSize,
					box: box,
				});
			}

			// horizontal boxes
			helpers.each(topBoxes, horizontalBoxMinSizeFunction);
			helpers.each(bottomBoxes, horizontalBoxMinSizeFunction);

			function horizontalBoxMinSizeFunction(box) {
				var minSize = box.update(chartWidth, horizontalBoxHeight);
				minBoxSizes.push({
					horizontal: true,
					minSize: minSize,
					box: box,
				});
			}

			// Step 5
			var maxChartHeight = height - (2 * yPadding);
			var maxChartWidth = width - (2 * xPadding);

			helpers.each(minBoxSizes, function(minimumBoxSize) {
				if (minimumBoxSize.horizontal) {
					maxChartHeight -= minimumBoxSize.minSize.height;
				} else {
					maxChartWidth -= minimumBoxSize.minSize.width;
				}
			});

			// At this point, maxChartHeight and maxChartWidth are the size the chart area could
			// be if the axes are drawn at their minimum sizes.

			// Step 6
			var totalLeftWidth = xPadding;
			var totalRightWidth = xPadding;
			var totalTopHeight = yPadding;
			var totalBottomHeight = yPadding;

			helpers.each(leftBoxes, verticalBoxFitFunction);
			helpers.each(rightBoxes, verticalBoxFitFunction);

			function verticalBoxFitFunction(box) {
				var minBoxSize = helpers.findNextWhere(minBoxSizes, function(minBoxSize) {
					return minBoxSize.box === box;
				});

				if (minBoxSize) {
					box.update(minBoxSize.minSize.width, maxChartHeight);
				}
			}

			// Figure out how much margin is on the left and right of the horizontal axes
			helpers.each(leftBoxes, function(box) {
				totalLeftWidth += box.width;
			});

			helpers.each(rightBoxes, function(box) {
				totalRightWidth += box.width;
			});

			helpers.each(topBoxes, horizontalBoxFitFunction);
			helpers.each(bottomBoxes, horizontalBoxFitFunction);

			function horizontalBoxFitFunction(box) {
				var minBoxSize = helpers.findNextWhere(minBoxSizes, function(minBoxSize) {
					return minBoxSize.box === box;
				});

				var scaleMargin = {
					left: totalLeftWidth,
					right: totalRightWidth,
					top: 0,
					bottom: 0,
				};

				if (minBoxSize) {
					box.update(maxChartWidth, minBoxSize.minSize.height, scaleMargin);
				}
			}

			helpers.each(topBoxes, function(box) {
				totalTopHeight += box.height;
			});

			helpers.each(bottomBoxes, function(box) {
				totalBottomHeight += box.height;
			});

			// Let the left layout know the final margin
			helpers.each(leftBoxes, function(box) {
				var wrapper = helpers.findNextWhere(minBoxSizes, function(wrapper) {
					return wrapper.box === box;
				});

				var scaleMargin = {
					left: 0,
					right: 0,
					top: totalTopHeight,
					bottom: totalBottomHeight
				};

				if (wrapper) {
					box.update(wrapper.minSize.width, maxChartHeight, scaleMargin);
				}
			});

			helpers.each(rightBoxes, function(box) {
				var wrapper = helpers.findNextWhere(minBoxSizes, function(wrapper) {
					return wrapper.box === box;
				});

				var scaleMargin = {
					left: 0,
					right: 0,
					top: totalTopHeight,
					bottom: totalBottomHeight
				};

				if (wrapper) {
					box.update(wrapper.minSize.width, maxChartHeight, scaleMargin);
				}
			});

			// Recalculate because the size of each layout might have changed slightly due to the margins (label rotation for instance)
			totalLeftWidth = xPadding;
			totalRightWidth = xPadding;
			totalTopHeight = yPadding;
			totalBottomHeight = yPadding;

			helpers.each(leftBoxes, function(box) {
				totalLeftWidth += box.width;
			});

			helpers.each(rightBoxes, function(box) {
				totalRightWidth += box.width;
			});

			helpers.each(topBoxes, function(box) {
				totalTopHeight += box.height;
			});
			helpers.each(bottomBoxes, function(box) {
				totalBottomHeight += box.height;
			});

			// Figure out if our chart area changed. This would occur if the dataset layout label rotation
			// changed due to the application of the margins in step 6. Since we can only get bigger, this is safe to do
			// without calling `fit` again
			var newMaxChartHeight = height - totalTopHeight - totalBottomHeight;
			var newMaxChartWidth = width - totalLeftWidth - totalRightWidth;

			if (newMaxChartWidth !== maxChartWidth || newMaxChartHeight !== maxChartHeight) {
				helpers.each(leftBoxes, function(box) {
					box.height = newMaxChartHeight;
				});

				helpers.each(rightBoxes, function(box) {
					box.height = newMaxChartHeight;
				});

				helpers.each(topBoxes, function(box) {
					box.width = newMaxChartWidth;
				});

				helpers.each(bottomBoxes, function(box) {
					box.width = newMaxChartWidth;
				});

				maxChartHeight = newMaxChartHeight;
				maxChartWidth = newMaxChartWidth;
			}

			// Step 7 - Position the boxes
			var left = xPadding;
			var top = yPadding;
			var right = 0;
			var bottom = 0;

			helpers.each(leftBoxes, verticalBoxPlacer);
			helpers.each(topBoxes, horizontalBoxPlacer);

			// Account for chart width and height
			left += maxChartWidth;
			top += maxChartHeight;

			helpers.each(rightBoxes, verticalBoxPlacer);
			helpers.each(bottomBoxes, horizontalBoxPlacer);

			function verticalBoxPlacer(box) {
				box.left = left;
				box.right = left + box.width;
				box.top = totalTopHeight;
				box.bottom = totalTopHeight + maxChartHeight;

				// Move to next point
				left = box.right;
			}

			function horizontalBoxPlacer(box) {
				box.left = totalLeftWidth;
				box.right = totalLeftWidth + maxChartWidth;
				box.top = top;
				box.bottom = top + box.height;

				// Move to next point 
				top = box.bottom;
			}

			// Step 8
			chartInstance.chartArea = {
				left: totalLeftWidth,
				top: totalTopHeight,
				right: totalLeftWidth + maxChartWidth,
				bottom: totalTopHeight + maxChartHeight,
			};

			// Step 9
			helpers.each(chartAreaBoxes, function(box) {
				box.left = chartInstance.chartArea.left;
				box.top = chartInstance.chartArea.top;
				box.right = chartInstance.chartArea.right;
				box.bottom = chartInstance.chartArea.bottom;

				box.update(maxChartWidth, maxChartHeight);
			});
		}
	};


}).call(this);
