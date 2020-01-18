'use strict';

import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import helpers from '../helpers';
import layouts from '../core/core.layouts';

const getRtlHelper = helpers.rtl.getRtlAdapter;
const valueOrDefault = helpers.valueOrDefault;

defaults._set('legend', {
	display: true,
	position: 'top',
	align: 'center',
	fullWidth: true,
	reverse: false,
	weight: 1000,

	// a callback that will handle
	onClick: function(e, legendItem) {
		var index = legendItem.datasetIndex;
		var ci = this.chart;
		var meta = ci.getDatasetMeta(index);

		// See controller.isDatasetVisible comment
		meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;

		// We hid a dataset ... rerender the chart
		ci.update();
	},

	onHover: null,
	onLeave: null,

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
			var datasets = chart.data.datasets;
			var options = chart.options.legend || {};
			var usePointStyle = options.labels && options.labels.usePointStyle;

			return chart._getSortedDatasetMetas().map(function(meta) {
				var style = meta.controller.getStyle(usePointStyle ? 0 : undefined);

				return {
					text: datasets[meta.index].label,
					fillStyle: style.backgroundColor,
					hidden: !meta.visible,
					lineCap: style.borderCapStyle,
					lineDash: style.borderDash,
					lineDashOffset: style.borderDashOffset,
					lineJoin: style.borderJoinStyle,
					lineWidth: style.borderWidth,
					strokeStyle: style.borderColor,
					pointStyle: style.pointStyle,
					rotation: style.rotation,

					// Below is extra data used for toggling the datasets
					datasetIndex: meta.index
				};
			}, this);
		}
	},

	title: {
		display: false,
		position: 'center',
		text: '',
	}
});

/**
 * Helper function to get the box width based on the usePointStyle option
 * @param {object} labelopts - the label options on the legend
 * @param {number} fontSize - the label font size
 * @return {number} width of the color box area
 */
function getBoxWidth(labelOpts, fontSize) {
	return labelOpts.usePointStyle && labelOpts.boxWidth > fontSize ?
		fontSize :
		labelOpts.boxWidth;
}

/**
 * IMPORTANT: this class is exposed publicly as Chart.Legend, backward compatibility required!
 */
class Legend extends Element {

	constructor(config) {
		super();

		const me = this;
		helpers.extend(me, config);

		// Contains hit boxes for each dataset (in dataset order)
		me.legendHitBoxes = [];

		/**
 		 * @private
 		 */
		me._hoveredItem = null;

		// Are we in doughnut mode which has a different data type
		me.doughnutMode = false;
	}

	// These methods are ordered by lifecycle. Utilities then follow.
	// Any function defined here is inherited by all legend types.
	// Any function can be extended by the legend type

	beforeUpdate() {}

	update(maxWidth, maxHeight, margins) {
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
	}

	afterUpdate() {}

	//

	beforeSetDimensions() {}

	setDimensions() {
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
		me._minSize = {
			width: 0,
			height: 0
		};
	}

	afterSetDimensions() {}

	//

	beforeBuildLabels() {}

	buildLabels() {
		var me = this;
		var labelOpts = me.options.labels || {};
		var legendItems = helpers.callback(labelOpts.generateLabels, [me.chart], me) || [];

		if (labelOpts.filter) {
			legendItems = legendItems.filter(function(item) {
				return labelOpts.filter(item, me.chart.data);
			});
		}

		if (me.options.reverse) {
			legendItems.reverse();
		}

		me.legendItems = legendItems;
	}

	afterBuildLabels() {}

	//

	beforeFit() {}

	fit() {
		const me = this;
		const opts = me.options;
		const labelOpts = opts.labels;
		const display = opts.display;

		const ctx = me.ctx;
		const labelFont = helpers.options._parseFont(labelOpts);
		const fontSize = labelFont.size;

		// Reset hit boxes
		const hitboxes = me.legendHitBoxes = [];

		const minSize = me._minSize;
		const isHorizontal = me.isHorizontal();
		const titleHeight = me._computeTitleHeight();

		if (isHorizontal) {
			minSize.width = me.maxWidth; // fill all the width
			minSize.height = display ? 10 : 0;
		} else {
			minSize.width = display ? 10 : 0;
			minSize.height = me.maxHeight; // fill all the height
		}

		// Increase sizes here
		if (!display) {
			me.width = minSize.width = me.height = minSize.height = 0;
			return;
		}
		ctx.font = labelFont.string;

		if (isHorizontal) {
			// Width of each line of legend boxes. Labels wrap onto multiple lines when there are too many to fit on one
			const lineWidths = me.lineWidths = [0];
			let totalHeight = titleHeight;

			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';

			me.legendItems.forEach(function(legendItem, i) {
				const boxWidth = getBoxWidth(labelOpts, fontSize);
				const width = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

				if (i === 0 || lineWidths[lineWidths.length - 1] + width + 2 * labelOpts.padding > minSize.width) {
					totalHeight += fontSize + labelOpts.padding;
					lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0;
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
			const vPadding = labelOpts.padding;
			const columnWidths = me.columnWidths = [];
			const columnHeights = me.columnHeights = [];
			let totalWidth = labelOpts.padding;
			let currentColWidth = 0;
			let currentColHeight = 0;

			let heightLimit = minSize.height - titleHeight;
			me.legendItems.forEach(function(legendItem, i) {
				const boxWidth = getBoxWidth(labelOpts, fontSize);
				const itemWidth = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

				// If too tall, go to new column
				if (i > 0 && currentColHeight + fontSize + 2 * vPadding > heightLimit) {
					totalWidth += currentColWidth + labelOpts.padding;
					columnWidths.push(currentColWidth); // previous column width
					columnHeights.push(currentColHeight);
					currentColWidth = 0;
					currentColHeight = 0;
				}

				// Get max width
				currentColWidth = Math.max(currentColWidth, itemWidth);
				currentColHeight += fontSize + vPadding;

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
			columnHeights.push(currentColHeight);
			minSize.width += totalWidth;
		}

		me.width = minSize.width;
		me.height = minSize.height;
	}

	afterFit() {}

	// Shared Methods
	isHorizontal() {
		return this.options.position === 'top' || this.options.position === 'bottom';
	}

	// Actually draw the legend on the canvas
	draw() {
		const me = this;
		const opts = me.options;
		const labelOpts = opts.labels;
		const defaultColor = defaults.color;
		const lineDefault = defaults.elements.line;
		const legendHeight = me.height;
		const columnHeights = me.columnHeights;
		const legendWidth = me.width;
		const lineWidths = me.lineWidths;

		if (!opts.display) {
			return;
		}

		me._drawTitle();
		const rtlHelper = getRtlHelper(opts.rtl, me.left, me._minSize.width);
		const ctx = me.ctx;
		const fontColor = valueOrDefault(labelOpts.fontColor, defaults.fontColor);
		const labelFont = helpers.options._parseFont(labelOpts);
		const fontSize = labelFont.size;
		let cursor;

		// Canvas setup
		ctx.textAlign = rtlHelper.textAlign('left');
		ctx.textBaseline = 'middle';
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = fontColor; // for strikethrough effect
		ctx.fillStyle = fontColor; // render in correct colour
		ctx.font = labelFont.string;

		var boxWidth = getBoxWidth(labelOpts, fontSize);
		var hitboxes = me.legendHitBoxes;

		// current position
		var drawLegendBox = function(x, y, legendItem) {
			if (isNaN(boxWidth) || boxWidth <= 0) {
				return;
			}

			// Set the ctx for the box
			ctx.save();

			var lineWidth = valueOrDefault(legendItem.lineWidth, lineDefault.borderWidth);
			ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
			ctx.lineCap = valueOrDefault(legendItem.lineCap, lineDefault.borderCapStyle);
			ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, lineDefault.borderDashOffset);
			ctx.lineJoin = valueOrDefault(legendItem.lineJoin, lineDefault.borderJoinStyle);
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);

			if (ctx.setLineDash) {
				// IE 9 and 10 do not support line dash
				ctx.setLineDash(valueOrDefault(legendItem.lineDash, lineDefault.borderDash));
			}

			if (labelOpts && labelOpts.usePointStyle) {
				// Recalculate x and y for drawPoint() because its expecting
				// x and y to be center of figure (instead of top left)
				const drawOptions = {
					radius: boxWidth * Math.SQRT2 / 2,
					pointStyle: legendItem.pointStyle,
					rotation: legendItem.rotation,
					borderWidth: lineWidth
				};
				var centerX = rtlHelper.xPlus(x, boxWidth / 2);
				var centerY = y + fontSize / 2;

				// Draw pointStyle as legend symbol
				helpers.canvas.drawPoint(ctx, drawOptions, centerX, centerY);
			} else {
				// Draw box as legend symbol
				ctx.fillRect(rtlHelper.leftForLtr(x, boxWidth), y, boxWidth, fontSize);
				if (lineWidth !== 0) {
					ctx.strokeRect(rtlHelper.leftForLtr(x, boxWidth), y, boxWidth, fontSize);
				}
			}

			ctx.restore();
		};

		var fillText = function(x, y, legendItem, textWidth) {
			var halfFontSize = fontSize / 2;
			var xLeft = rtlHelper.xPlus(x, boxWidth + halfFontSize);
			var yMiddle = y + halfFontSize;

			ctx.fillText(legendItem.text, xLeft, yMiddle);

			if (legendItem.hidden) {
				// Strikethrough the text if hidden
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.moveTo(xLeft, yMiddle);
				ctx.lineTo(rtlHelper.xPlus(xLeft, textWidth), yMiddle);
				ctx.stroke();
			}
		};

		var alignmentOffset = function(dimension, blockSize) {
			switch (opts.align) {
			case 'start':
				return labelOpts.padding;
			case 'end':
				return dimension - blockSize;
			default: // center
				return (dimension - blockSize + labelOpts.padding) / 2;
			}
		};

		// Horizontal
		const isHorizontal = me.isHorizontal();
		const titleHeight = this._computeTitleHeight();
		if (isHorizontal) {
			cursor = {
				x: me.left + alignmentOffset(legendWidth, lineWidths[0]),
				y: me.top + labelOpts.padding + titleHeight,
				line: 0
			};
		} else {
			cursor = {
				x: me.left + labelOpts.padding,
				y: me.top + alignmentOffset(legendHeight, columnHeights[0]) + titleHeight,
				line: 0
			};
		}

		helpers.rtl.overrideTextDirection(me.ctx, opts.textDirection);

		var itemHeight = fontSize + labelOpts.padding;
		me.legendItems.forEach(function(legendItem, i) {
			var textWidth = ctx.measureText(legendItem.text).width;
			var width = boxWidth + (fontSize / 2) + textWidth;
			var x = cursor.x;
			var y = cursor.y;

			rtlHelper.setWidth(me._minSize.width);

			// Use (me.left + me._minSize.width) and (me.top + me._minSize.height)
			// instead of me.right and me.bottom because me.width and me.height
			// may have been changed since me._minSize was calculated
			if (isHorizontal) {
				if (i > 0 && x + width + labelOpts.padding > me.left + me._minSize.width) {
					y = cursor.y += itemHeight;
					cursor.line++;
					x = cursor.x = me.left + alignmentOffset(legendWidth, lineWidths[cursor.line]);
				}
			} else if (i > 0 && y + itemHeight > me.top + me._minSize.height) {
				x = cursor.x = x + me.columnWidths[cursor.line] + labelOpts.padding;
				cursor.line++;
				y = cursor.y = me.top + alignmentOffset(legendHeight, columnHeights[cursor.line]);
			}

			var realX = rtlHelper.x(x);

			drawLegendBox(realX, y, legendItem);

			hitboxes[i].left = rtlHelper.leftForLtr(realX, hitboxes[i].width);
			hitboxes[i].top = y;

			// Fill the actual label
			fillText(realX, y, legendItem, textWidth);

			if (isHorizontal) {
				cursor.x += width + labelOpts.padding;
			} else {
				cursor.y += itemHeight;
			}
		});

		helpers.rtl.restoreTextDirection(me.ctx, opts.textDirection);
	}

	_drawTitle() {
		const me = this;
		const opts = me.options;
		const titleOpts = opts.title;
		const titleFont = helpers.options._parseFont(titleOpts);
		const titlePadding = helpers.options.toPadding(titleOpts.padding);

		if (!titleOpts.display) {
			return;
		}

		const rtlHelper = getRtlHelper(opts.rtl, me.left, me.minSize.width);
		const ctx = me.ctx;
		const fontColor = valueOrDefault(titleOpts.fontColor, defaults.fontColor);
		const position = titleOpts.position;
		let x, textAlign;

		const halfFontSize = titleFont.size / 2;
		let y = me.top + titlePadding.top + halfFontSize;

		// These defaults are used when the legend is vertical.
		// When horizontal, they are computed below.
		let left = me.left;
		let maxWidth = me.width;

		if (this.isHorizontal()) {
			// Move left / right so that the title is above the legend lines
			maxWidth = Math.max(...me.lineWidths);
			switch (opts.align) {
			case 'start':
				// left is already correct in this case
				break;
			case 'end':
				left = me.right - maxWidth;
				break;
			default:
				left = ((me.left + me.right) / 2) - (maxWidth / 2);
				break;
			}
		} else {
			// Move down so that the title is above the legend stack in every alignment
			const maxHeight = Math.max(...me.columnHeights);
			switch (opts.align) {
			case 'start':
				// y is already correct in this case
				break;
			case 'end':
				y += me.height - maxHeight;
				break;
			default: // center
				y += (me.height - maxHeight) / 2;
				break;
			}
		}

		// Now that we know the left edge of the inner legend box, compute the correct
		// X coordinate from the title alignment
		switch (position) {
		case 'start':
			x = left;
			textAlign = 'left';
			break;
		case 'end':
			x = left + maxWidth;
			textAlign = 'right';
			break;
		default:
			x = left + (maxWidth / 2);
			textAlign = 'center';
			break;
		}

		// Canvas setup
		ctx.textAlign = rtlHelper.textAlign(textAlign);
		ctx.textBaseline = 'middle';
		ctx.strokeStyle = fontColor;
		ctx.fillStyle = fontColor;
		ctx.font = titleFont.string;

		ctx.fillText(titleOpts.text, x, y);
	}

	_computeTitleHeight() {
		const titleOpts = this.options.title;
		const titleFont = helpers.options._parseFont(titleOpts);
		const titlePadding = helpers.options.toPadding(titleOpts.padding);
		return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
	}

	/**
	 * @private
	 */
	_getLegendItemAt(x, y) {
		var me = this;
		var i, hitBox, lh;

		if (x >= me.left && x <= me.right && y >= me.top && y <= me.bottom) {
			// See if we are touching one of the dataset boxes
			lh = me.legendHitBoxes;
			for (i = 0; i < lh.length; ++i) {
				hitBox = lh[i];

				if (x >= hitBox.left && x <= hitBox.left + hitBox.width && y >= hitBox.top && y <= hitBox.top + hitBox.height) {
					// Touching an element
					return me.legendItems[i];
				}
			}
		}

		return null;
	}

	/**
	 * Handle an event
	 * @private
	 * @param {IEvent} event - The event to handle
	 */
	handleEvent(e) {
		var me = this;
		var opts = me.options;
		var type = e.type === 'mouseup' ? 'click' : e.type;
		var hoveredItem;

		if (type === 'mousemove') {
			if (!opts.onHover && !opts.onLeave) {
				return;
			}
		} else if (type === 'click') {
			if (!opts.onClick) {
				return;
			}
		} else {
			return;
		}

		// Chart event already has relative position in it
		hoveredItem = me._getLegendItemAt(e.x, e.y);

		if (type === 'click') {
			if (hoveredItem && opts.onClick) {
				// use e.native for backwards compatibility
				opts.onClick.call(me, e.native, hoveredItem);
			}
		} else {
			if (opts.onLeave && hoveredItem !== me._hoveredItem) {
				if (me._hoveredItem) {
					opts.onLeave.call(me, e.native, me._hoveredItem);
				}
				me._hoveredItem = hoveredItem;
			}

			if (opts.onHover && hoveredItem) {
				// use e.native for backwards compatibility
				opts.onHover.call(me, e.native, hoveredItem);
			}
		}
	}
}

function createNewLegendAndAttach(chart, legendOpts) {
	var legend = new Legend({
		ctx: chart.ctx,
		options: legendOpts,
		chart: chart
	});

	layouts.configure(chart, legend, legendOpts);
	layouts.addBox(chart, legend);
	chart.legend = legend;
}

export default {
	id: 'legend',

	/**
	 * Backward compatibility: since 2.1.5, the legend is registered as a plugin, making
	 * Chart.Legend obsolete. To avoid a breaking change, we export the Legend as part of
	 * the plugin, which one will be re-exposed in the chart.js file.
	 * https://github.com/chartjs/Chart.js/pull/2640
	 * @private
	 */
	_element: Legend,

	beforeInit: function(chart) {
		var legendOpts = chart.options.legend;

		if (legendOpts) {
			createNewLegendAndAttach(chart, legendOpts);
		}
	},

	afterUpdate: function(chart) {
		var legendOpts = chart.options.legend;
		var legend = chart.legend;

		if (legendOpts) {
			helpers.mergeIf(legendOpts, defaults.legend);

			if (legend) {
				layouts.configure(chart, legend, legendOpts);
				legend.options = legendOpts;
				legend.buildLabels();
			} else {
				createNewLegendAndAttach(chart, legendOpts);
			}
		} else if (legend) {
			layouts.removeBox(chart, legend);
			delete chart.legend;
		}
	},

	afterEvent: function(chart, e) {
		var legend = chart.legend;
		if (legend) {
			legend.handleEvent(e);
		}
	}
};
