'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	var noop = helpers.noop;

	Chart.defaults.global.legend = {

		display: true,
		position: 'top',
		fullWidth: true, // marks that this box should take the full width of the canvas (pushing down other boxes)
		reverse: false,

		// a callback that will handle
		onClick: function(e, legendItem) {
			var index = legendItem.datasetIndex;
			var ci = this.chart;
			var meta = ci.getDatasetMeta(index);

			// See controller.isDatasetVisible comment
			meta.hidden = meta.hidden === null? !ci.data.datasets[index].hidden : null;

			// We hid a dataset ... rerender the chart
			ci.update();
		},

		onHover: null,

		labels: {
			boxWidth: 40,
			padding: 10,
			// Generates labels shown in the legend
			// Valid properties to return:
			// text : text to display
			// fillStyle : fill of coloured box
			// strokeStyle: stroke of coloured box
			// hidden : if this legend item refers to a hidden item
			// lineCap : cap style for line
			// lineDash
			// lineDashOffset :
			// lineJoin :
			// lineWidth :
			generateLabels: function(chart) {
				var data = chart.data;
				return helpers.isArray(data.datasets) ? data.datasets.map(function(dataset, i) {
					return {
						text: dataset.label,
						fillStyle: (!helpers.isArray(dataset.backgroundColor) ? dataset.backgroundColor : dataset.backgroundColor[0]),
						hidden: !chart.isDatasetVisible(i),
						lineCap: dataset.borderCapStyle,
						lineDash: dataset.borderDash,
						lineDashOffset: dataset.borderDashOffset,
						lineJoin: dataset.borderJoinStyle,
						lineWidth: dataset.borderWidth,
						strokeStyle: dataset.borderColor,
						pointStyle: dataset.pointStyle,

						// Below is extra data used for toggling the datasets
						datasetIndex: i
					};
				}, this) : [];
			}
		}
	};

	/**
	 * Helper function to get the box width based on the usePointStyle option
	 * @param labelopts {Object} the label options on the legend
	 * @param fontSize {Number} the label font size
	 * @return {Number} width of the color box area
	 */
	function getBoxWidth(labelOpts, fontSize) {
		return labelOpts.usePointStyle ?
			fontSize * Math.SQRT2 :
			labelOpts.boxWidth;
	}

	Chart.Legend = Chart.Element.extend({

		initialize: function(config) {
			helpers.extend(this, config);

			// Contains hit boxes for each dataset (in dataset order)
			this.legendHitBoxes = [];

			// Are we in doughnut mode which has a different data type
			this.doughnutMode = false;
		},

		// These methods are ordered by lifecycle. Utilities then follow.
		// Any function defined here is inherited by all legend types.
		// Any function can be extended by the legend type

		beforeUpdate: noop,
		update: function(maxWidth, maxHeight, margins) {
			var me = this;

			// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
			me.beforeUpdate();

			// Absorb the master measurements
			me.maxWidth = maxWidth;
			me.maxHeight = maxHeight;
			me.margins = margins;

			// Dimensions
			me.beforeSetDimensions();
			me.setDimensions();
			me.afterSetDimensions();
			// Labels
			me.beforeBuildLabels();
			me.buildLabels();
			me.afterBuildLabels();

			// Fit
			me.beforeFit();
			me.fit();
			me.afterFit();
			//
			me.afterUpdate();

			return me.minSize;
		},
		afterUpdate: noop,

		//

		beforeSetDimensions: noop,
		setDimensions: function() {
			var me = this;
			// Set the unconstrained dimension before label rotation
			if (me.isHorizontal()) {
				// Reset position before calculating rotation
				me.width = me.maxWidth;
				me.left = 0;
				me.right = me.width;
			} else {
				me.height = me.maxHeight;

				// Reset position before calculating rotation
				me.top = 0;
				me.bottom = me.height;
			}

			// Reset padding
			me.paddingLeft = 0;
			me.paddingTop = 0;
			me.paddingRight = 0;
			me.paddingBottom = 0;

			// Reset minSize
			me.minSize = {
				width: 0,
				height: 0
			};
		},
		afterSetDimensions: noop,

		//

		beforeBuildLabels: noop,
		buildLabels: function() {
			var me = this;
			var labelOpts = me.options.labels;
			var legendItems = labelOpts.generateLabels.call(me, me.chart);

			if (labelOpts.filter) {
				legendItems = legendItems.filter(function(item) {
					return labelOpts.filter(item, me.chart.data);
				});
			}

			if (me.options.reverse) {
				legendItems.reverse();
			}

			me.legendItems = legendItems;
		},
		afterBuildLabels: noop,

		//

		beforeFit: noop,
		fit: function() {
			var me = this;
			var opts = me.options;
			var labelOpts = opts.labels;
			var display = opts.display;

			var ctx = me.ctx;

			var globalDefault = Chart.defaults.global,
				itemOrDefault = helpers.getValueOrDefault,
				fontSize = itemOrDefault(labelOpts.fontSize, globalDefault.defaultFontSize),
				fontStyle = itemOrDefault(labelOpts.fontStyle, globalDefault.defaultFontStyle),
				fontFamily = itemOrDefault(labelOpts.fontFamily, globalDefault.defaultFontFamily),
				labelFont = helpers.fontString(fontSize, fontStyle, fontFamily);

			// Reset hit boxes
			var hitboxes = me.legendHitBoxes = [];

			var minSize = me.minSize;
			var isHorizontal = me.isHorizontal();

			if (isHorizontal) {
				minSize.width = me.maxWidth; // fill all the width
				minSize.height = display ? 10 : 0;
			} else {
				minSize.width = display ? 10 : 0;
				minSize.height = me.maxHeight; // fill all the height
			}

			// Increase sizes here
			if (display) {
				ctx.font = labelFont;

				if (isHorizontal) {
					// Labels

					// Width of each line of legend boxes. Labels wrap onto multiple lines when there are too many to fit on one
					var lineWidths = me.lineWidths = [0];
					var totalHeight = me.legendItems.length ? fontSize + (labelOpts.padding) : 0;

					ctx.textAlign = 'left';
					ctx.textBaseline = 'top';

					helpers.each(me.legendItems, function(legendItem, i) {
						var boxWidth = getBoxWidth(labelOpts, fontSize);
						var width = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

						if (lineWidths[lineWidths.length - 1] + width + labelOpts.padding >= me.width) {
							totalHeight += fontSize + (labelOpts.padding);
							lineWidths[lineWidths.length] = me.left;
						}

						// Store the hitbox width and height here. Final position will be updated in `draw`
						hitboxes[i] = {
							left: 0,
							top: 0,
							width: width,
							height: fontSize
						};

						lineWidths[lineWidths.length - 1] += width + labelOpts.padding;
					});

					minSize.height += totalHeight;

				} else {
					var vPadding = labelOpts.padding;
					var columnWidths = me.columnWidths = [];
					var totalWidth = labelOpts.padding;
					var currentColWidth = 0;
					var currentColHeight = 0;
					var itemHeight = fontSize + vPadding;

					helpers.each(me.legendItems, function(legendItem, i) {
						var boxWidth = getBoxWidth(labelOpts, fontSize);
						var itemWidth = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

						// If too tall, go to new column
						if (currentColHeight + itemHeight > minSize.height) {
							totalWidth += currentColWidth + labelOpts.padding;
							columnWidths.push(currentColWidth); // previous column width

							currentColWidth = 0;
							currentColHeight = 0;
						}

						// Get max width
						currentColWidth = Math.max(currentColWidth, itemWidth);
						currentColHeight += itemHeight;

						// Store the hitbox width and height here. Final position will be updated in `draw`
						hitboxes[i] = {
							left: 0,
							top: 0,
							width: itemWidth,
							height: fontSize
						};
					});

					totalWidth += currentColWidth;
					columnWidths.push(currentColWidth);
					minSize.width += totalWidth;
				}
			}

			me.width = minSize.width;
			me.height = minSize.height;
		},
		afterFit: noop,

		// Shared Methods
		isHorizontal: function() {
			return this.options.position === 'top' || this.options.position === 'bottom';
		},

		// Actually draw the legend on the canvas
		draw: function() {
			var me = this;
			var opts = me.options;
			var labelOpts = opts.labels;
			var globalDefault = Chart.defaults.global,
				lineDefault = globalDefault.elements.line,
				legendWidth = me.width,
				lineWidths = me.lineWidths;

			if (opts.display) {
				var ctx = me.ctx,
					cursor,
					itemOrDefault = helpers.getValueOrDefault,
					fontColor = itemOrDefault(labelOpts.fontColor, globalDefault.defaultFontColor),
					fontSize = itemOrDefault(labelOpts.fontSize, globalDefault.defaultFontSize),
					fontStyle = itemOrDefault(labelOpts.fontStyle, globalDefault.defaultFontStyle),
					fontFamily = itemOrDefault(labelOpts.fontFamily, globalDefault.defaultFontFamily),
					labelFont = helpers.fontString(fontSize, fontStyle, fontFamily);

				// Canvas setup
				ctx.textAlign = 'left';
				ctx.textBaseline = 'top';
				ctx.lineWidth = 0.5;
				ctx.strokeStyle = fontColor; // for strikethrough effect
				ctx.fillStyle = fontColor; // render in correct colour
				ctx.font = labelFont;

				var boxWidth = getBoxWidth(labelOpts, fontSize),
					hitboxes = me.legendHitBoxes;

				// current position
				var drawLegendBox = function(x, y, legendItem) {
					if (isNaN(boxWidth) || boxWidth <= 0) {
						return;
					}

					// Set the ctx for the box
					ctx.save();

					ctx.fillStyle = itemOrDefault(legendItem.fillStyle, globalDefault.defaultColor);
					ctx.lineCap = itemOrDefault(legendItem.lineCap, lineDefault.borderCapStyle);
					ctx.lineDashOffset = itemOrDefault(legendItem.lineDashOffset, lineDefault.borderDashOffset);
					ctx.lineJoin = itemOrDefault(legendItem.lineJoin, lineDefault.borderJoinStyle);
					ctx.lineWidth = itemOrDefault(legendItem.lineWidth, lineDefault.borderWidth);
					ctx.strokeStyle = itemOrDefault(legendItem.strokeStyle, globalDefault.defaultColor);
					var isLineWidthZero = (itemOrDefault(legendItem.lineWidth, lineDefault.borderWidth) === 0);

					if (ctx.setLineDash) {
						// IE 9 and 10 do not support line dash
						ctx.setLineDash(itemOrDefault(legendItem.lineDash, lineDefault.borderDash));
					}

					if (opts.labels && opts.labels.usePointStyle) {
						// Recalculate x and y for drawPoint() because its expecting
						// x and y to be center of figure (instead of top left)
						var radius = fontSize * Math.SQRT2 / 2;
						var offSet = radius / Math.SQRT2;
						var centerX = x + offSet;
						var centerY = y + offSet;

						// Draw pointStyle as legend symbol
						Chart.canvasHelpers.drawPoint(ctx, legendItem.pointStyle, radius, centerX, centerY);
					} else {
						// Draw box as legend symbol
						if (!isLineWidthZero) {
							ctx.strokeRect(x, y, boxWidth, fontSize);
						}
						ctx.fillRect(x, y, boxWidth, fontSize);
					}

					ctx.restore();
				};
				var fillText = function(x, y, legendItem, textWidth) {
					ctx.fillText(legendItem.text, boxWidth + (fontSize / 2) + x, y);

					if (legendItem.hidden) {
						// Strikethrough the text if hidden
						ctx.beginPath();
						ctx.lineWidth = 2;
						ctx.moveTo(boxWidth + (fontSize / 2) + x, y + (fontSize / 2));
						ctx.lineTo(boxWidth + (fontSize / 2) + x + textWidth, y + (fontSize / 2));
						ctx.stroke();
					}
				};

				// Horizontal
				var isHorizontal = me.isHorizontal();
				if (isHorizontal) {
					cursor = {
						x: me.left + ((legendWidth - lineWidths[0]) / 2),
						y: me.top + labelOpts.padding,
						line: 0
					};
				} else {
					cursor = {
						x: me.left + labelOpts.padding,
						y: me.top + labelOpts.padding,
						line: 0
					};
				}

				var itemHeight = fontSize + labelOpts.padding;
				helpers.each(me.legendItems, function(legendItem, i) {
					var textWidth = ctx.measureText(legendItem.text).width,
						width = boxWidth + (fontSize / 2) + textWidth,
						x = cursor.x,
						y = cursor.y;

					if (isHorizontal) {
						if (x + width >= legendWidth) {
							y = cursor.y += itemHeight;
							cursor.line++;
							x = cursor.x = me.left + ((legendWidth - lineWidths[cursor.line]) / 2);
						}
					} else if (y + itemHeight > me.bottom) {
						x = cursor.x = x + me.columnWidths[cursor.line] + labelOpts.padding;
						y = cursor.y = me.top;
						cursor.line++;
					}

					drawLegendBox(x, y, legendItem);

					hitboxes[i].left = x;
					hitboxes[i].top = y;

					// Fill the actual label
					fillText(x, y, legendItem, textWidth);

					if (isHorizontal) {
						cursor.x += width + (labelOpts.padding);
					} else {
						cursor.y += itemHeight;
					}

				});
			}
		},

		/**
		 * Handle an event
		 * @private
		 * @param e {Event} the event to handle
		 * @return {Boolean} true if a change occured
		 */
		handleEvent: function(e) {
			var me = this;
			var opts = me.options;
			var type = e.type === 'mouseup' ? 'click' : e.type;
			var changed = false;

			if (type === 'mousemove') {
				if (!opts.onHover) {
					return;
				}
			} else if (type === 'click') {
				if (!opts.onClick) {
					return;
				}
			} else {
				return;
			}

			var position = helpers.getRelativePosition(e, me.chart.chart),
				x = position.x,
				y = position.y;

			if (x >= me.left && x <= me.right && y >= me.top && y <= me.bottom) {
				// See if we are touching one of the dataset boxes
				var lh = me.legendHitBoxes;
				for (var i = 0; i < lh.length; ++i) {
					var hitBox = lh[i];

					if (x >= hitBox.left && x <= hitBox.left + hitBox.width && y >= hitBox.top && y <= hitBox.top + hitBox.height) {
						// Touching an element
						if (type === 'click') {
							opts.onClick.call(me, e, me.legendItems[i]);
							changed = true;
							break;
						} else if (type === 'mousemove') {
							opts.onHover.call(me, e, me.legendItems[i]);
							changed = true;
							break;
						}
					}
				}
			}

			return changed;
		}
	});

	// Register the legend plugin
	Chart.plugins.register({
		beforeInit: function(chartInstance) {
			var opts = chartInstance.options;
			var legendOpts = opts.legend;

			if (legendOpts) {
				chartInstance.legend = new Chart.Legend({
					ctx: chartInstance.chart.ctx,
					options: legendOpts,
					chart: chartInstance
				});

				Chart.layoutService.addBox(chartInstance, chartInstance.legend);
			}
		}
	});
};
