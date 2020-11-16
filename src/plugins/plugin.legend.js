import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import layouts from '../core/core.layouts';
import {drawPoint} from '../helpers/helpers.canvas';
import {
	callback as call, merge, valueOrDefault, isNullOrUndef, toFont, isObject,
	toPadding, getRtlAdapter, overrideTextDirection, restoreTextDirection,
	INFINITY
} from '../helpers/index';

/**
 * @typedef { import("../platform/platform.base").ChartEvent } ChartEvent
 */

/**
 * Helper function to get the box width based on the usePointStyle option
 * @param {object} labelOpts - the label options on the legend
 * @param {number} fontSize - the label font size
 * @return {number} width of the color box area
 */
function getBoxWidth(labelOpts, fontSize) {
	const {boxWidth} = labelOpts;
	return (labelOpts.usePointStyle && boxWidth > fontSize) || isNullOrUndef(boxWidth) ?
		fontSize :
		boxWidth;
}

/**
 * Helper function to get the box height
 * @param {object} labelOpts - the label options on the legend
 * @param {*} fontSize - the label font size
 * @return {number} height of the color box area
 */
function getBoxHeight(labelOpts, fontSize) {
	const {boxHeight} = labelOpts;
	return (labelOpts.usePointStyle && boxHeight > fontSize) || isNullOrUndef(boxHeight) ?
		fontSize :
		boxHeight;
}

export class Legend extends Element {

	constructor(config) {
		super();

		Object.assign(this, config);

		// Contains hit boxes for each dataset (in dataset order)
		this.legendHitBoxes = [];

		/**
 		 * @private
 		 */
		this._hoveredItem = null;

		// Are we in doughnut mode which has a different data type
		this.doughnutMode = false;

		this.chart = config.chart;
		this.options = config.options;
		this.ctx = config.ctx;
		this.legendItems = undefined;
		this.columnWidths = undefined;
		this.columnHeights = undefined;
		this.lineWidths = undefined;
		this._minSize = undefined;
		this.maxHeight = undefined;
		this.maxWidth = undefined;
		this.top = undefined;
		this.bottom = undefined;
		this.left = undefined;
		this.right = undefined;
		this.height = undefined;
		this.width = undefined;
		this._margins = undefined;
		this.paddingTop = undefined;
		this.paddingBottom = undefined;
		this.paddingLeft = undefined;
		this.paddingRight = undefined;
		this.position = undefined;
		this.weight = undefined;
		this.fullWidth = undefined;
	}

	// These methods are ordered by lifecycle. Utilities then follow.
	// Any function defined here is inherited by all legend types.
	// Any function can be extended by the legend type

	beforeUpdate() {}

	update(maxWidth, maxHeight, margins) {
		const me = this;

		// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
		me.beforeUpdate();

		// Absorb the master measurements
		me.maxWidth = maxWidth;
		me.maxHeight = maxHeight;
		me._margins = margins;

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

	beforeSetDimensions() {}

	setDimensions() {
		const me = this;
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

	beforeBuildLabels() {}

	buildLabels() {
		const me = this;
		const labelOpts = me.options.labels || {};
		let legendItems = call(labelOpts.generateLabels, [me.chart], me) || [];

		if (labelOpts.filter) {
			legendItems = legendItems.filter((item) => labelOpts.filter(item, me.chart.data));
		}

		if (labelOpts.sort) {
			legendItems = legendItems.sort((a, b) => labelOpts.sort(a, b, me.chart.data));
		}

		if (me.options.reverse) {
			legendItems.reverse();
		}

		me.legendItems = legendItems;
	}

	afterBuildLabels() {}

	beforeFit() {}

	fit() {
		const me = this;
		const opts = me.options;
		const labelOpts = opts.labels;
		const display = opts.display;

		const ctx = me.ctx;
		const labelFont = toFont(labelOpts.font, me.chart.options.font);
		const fontSize = labelFont.size;
		const boxWidth = getBoxWidth(labelOpts, fontSize);
		const boxHeight = getBoxHeight(labelOpts, fontSize);
		const itemHeight = Math.max(boxHeight, fontSize);

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

			me.legendItems.forEach((legendItem, i) => {
				const width = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

				if (i === 0 || lineWidths[lineWidths.length - 1] + width + 2 * labelOpts.padding > minSize.width) {
					totalHeight += itemHeight + labelOpts.padding;
					lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0;
				}

				// Store the hitbox width and height here. Final position will be updated in `draw`
				hitboxes[i] = {
					left: 0,
					top: 0,
					width,
					height: itemHeight
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

			const heightLimit = minSize.height - titleHeight;
			me.legendItems.forEach((legendItem, i) => {
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
					height: itemHeight,
				};
			});

			totalWidth += currentColWidth;
			columnWidths.push(currentColWidth);
			columnHeights.push(currentColHeight);
			minSize.width += totalWidth;
		}

		me.width = Math.min(minSize.width, opts.maxWidth || INFINITY);
		me.height = Math.min(minSize.height, opts.maxHeight || INFINITY);
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
		const legendHeight = me.height;
		const columnHeights = me.columnHeights;
		const legendWidth = me.width;
		const lineWidths = me.lineWidths;

		if (!opts.display) {
			return;
		}

		me.drawTitle();
		const rtlHelper = getRtlAdapter(opts.rtl, me.left, me._minSize.width);
		const ctx = me.ctx;
		const labelFont = toFont(labelOpts.font, me.chart.options.font);
		const fontColor = labelFont.color;
		const fontSize = labelFont.size;
		let cursor;

		// Canvas setup
		ctx.textAlign = rtlHelper.textAlign('left');
		ctx.textBaseline = 'middle';
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = fontColor; // for strikethrough effect
		ctx.fillStyle = fontColor; // render in correct colour
		ctx.font = labelFont.string;

		const boxWidth = getBoxWidth(labelOpts, fontSize);
		const boxHeight = getBoxHeight(labelOpts, fontSize);
		const height = Math.max(fontSize, boxHeight);
		const hitboxes = me.legendHitBoxes;

		// current position
		const drawLegendBox = function(x, y, legendItem) {
			if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
				return;
			}

			// Set the ctx for the box
			ctx.save();

			const lineWidth = valueOrDefault(legendItem.lineWidth, 1);
			ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
			ctx.lineCap = valueOrDefault(legendItem.lineCap, 'butt');
			ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0);
			ctx.lineJoin = valueOrDefault(legendItem.lineJoin, 'miter');
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);

			ctx.setLineDash(valueOrDefault(legendItem.lineDash, []));

			if (labelOpts && labelOpts.usePointStyle) {
				// Recalculate x and y for drawPoint() because its expecting
				// x and y to be center of figure (instead of top left)
				const drawOptions = {
					radius: boxWidth * Math.SQRT2 / 2,
					pointStyle: legendItem.pointStyle,
					rotation: legendItem.rotation,
					borderWidth: lineWidth
				};
				const centerX = rtlHelper.xPlus(x, boxWidth / 2);
				const centerY = y + fontSize / 2;

				// Draw pointStyle as legend symbol
				drawPoint(ctx, drawOptions, centerX, centerY);
			} else {
				// Draw box as legend symbol
				// Adjust position when boxHeight < fontSize (want it centered)
				const yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0);

				ctx.fillRect(rtlHelper.leftForLtr(x, boxWidth), yBoxTop, boxWidth, boxHeight);
				if (lineWidth !== 0) {
					ctx.strokeRect(rtlHelper.leftForLtr(x, boxWidth), yBoxTop, boxWidth, boxHeight);
				}
			}

			ctx.restore();
		};

		const fillText = function(x, y, legendItem, textWidth) {
			const halfFontSize = fontSize / 2;
			const xLeft = rtlHelper.xPlus(x, boxWidth + halfFontSize);
			const yMiddle = y + (height / 2);
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

		const alignmentOffset = function(dimension, blockSize) {
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

		overrideTextDirection(me.ctx, opts.textDirection);

		const itemHeight = height + labelOpts.padding;
		me.legendItems.forEach((legendItem, i) => {
			const textWidth = ctx.measureText(legendItem.text).width;
			const width = boxWidth + (fontSize / 2) + textWidth;
			let x = cursor.x;
			let y = cursor.y;

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

			const realX = rtlHelper.x(x);

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

		restoreTextDirection(me.ctx, opts.textDirection);
	}

	/**
	 * @protected
	 */
	drawTitle() {
		const me = this;
		const opts = me.options;
		const titleOpts = opts.title;
		const titleFont = toFont(titleOpts.font, me.chart.options.font);
		const titlePadding = toPadding(titleOpts.padding);

		if (!titleOpts.display) {
			return;
		}

		const rtlHelper = getRtlAdapter(opts.rtl, me.left, me._minSize.width);
		const ctx = me.ctx;
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
		ctx.strokeStyle = titleFont.color;
		ctx.fillStyle = titleFont.color;
		ctx.font = titleFont.string;

		ctx.fillText(titleOpts.text, x, y);
	}

	/**
	 * @private
	 */
	_computeTitleHeight() {
		const titleOpts = this.options.title;
		const titleFont = toFont(titleOpts.font, this.chart.options.font);
		const titlePadding = toPadding(titleOpts.padding);
		return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
	}

	/**
	 * @private
	 */
	_getLegendItemAt(x, y) {
		const me = this;
		let i, hitBox, lh;

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
	 * @param {ChartEvent} e - The event to handle
	 */
	handleEvent(e) {
		const me = this;
		const opts = me.options;
		const type = e.type === 'mouseup' ? 'click' : e.type;

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
		const hoveredItem = me._getLegendItemAt(e.x, e.y);

		if (type === 'click') {
			if (hoveredItem) {
				call(opts.onClick, [e, hoveredItem, me], me);
			}
		} else {
			if (opts.onLeave && hoveredItem !== me._hoveredItem) {
				if (me._hoveredItem) {
					call(opts.onLeave, [e, me._hoveredItem, me], me);
				}
				me._hoveredItem = hoveredItem;
			}

			if (hoveredItem) {
				call(opts.onHover, [e, hoveredItem, me], me);
			}
		}
	}
}

function resolveOptions(options) {
	return options !== false && merge(Object.create(null), [defaults.plugins.legend, options]);
}

function createNewLegendAndAttach(chart, legendOpts) {
	const legend = new Legend({
		ctx: chart.ctx,
		options: legendOpts,
		chart
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

	beforeInit(chart) {
		const legendOpts = resolveOptions(chart.options.legend);

		if (legendOpts) {
			createNewLegendAndAttach(chart, legendOpts);
		}
	},

	// During the beforeUpdate step, the layout configuration needs to run
	// This ensures that if the legend position changes (via an option update)
	// the layout system respects the change. See https://github.com/chartjs/Chart.js/issues/7527
	beforeUpdate(chart) {
		const legendOpts = resolveOptions(chart.options.legend);
		const legend = chart.legend;

		if (legendOpts) {
			if (legend) {
				layouts.configure(chart, legend, legendOpts);
				legend.options = legendOpts;
			} else {
				createNewLegendAndAttach(chart, legendOpts);
			}
		} else if (legend) {
			layouts.removeBox(chart, legend);
			delete chart.legend;
		}
	},

	// The labels need to be built after datasets are updated to ensure that colors
	// and other styling are correct. See https://github.com/chartjs/Chart.js/issues/6968
	afterUpdate(chart) {
		if (chart.legend) {
			chart.legend.buildLabels();
		}
	},


	afterEvent(chart, e) {
		const legend = chart.legend;
		if (legend) {
			legend.handleEvent(e);
		}
	},

	defaults: {
		display: true,
		position: 'top',
		align: 'center',
		fullWidth: true,
		reverse: false,
		weight: 1000,

		// a callback that will handle
		onClick(e, legendItem, legend) {
			const index = legendItem.datasetIndex;
			const ci = legend.chart;
			if (ci.isDatasetVisible(index)) {
				ci.hide(index);
				legendItem.hidden = true;
			} else {
				ci.show(index);
				legendItem.hidden = false;
			}
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
			generateLabels(chart) {
				const datasets = chart.data.datasets;
				const {labels} = chart.legend.options;
				const usePointStyle = labels.usePointStyle;
				const overrideStyle = labels.pointStyle;

				return chart._getSortedDatasetMetas().map((meta) => {
					const style = meta.controller.getStyle(usePointStyle ? 0 : undefined);
					const borderWidth = isObject(style.borderWidth) ? (valueOrDefault(style.borderWidth.top, 0) + valueOrDefault(style.borderWidth.left, 0) + valueOrDefault(style.borderWidth.bottom, 0) + valueOrDefault(style.borderWidth.right, 0)) / 4 : style.borderWidth;

					return {
						text: datasets[meta.index].label,
						fillStyle: style.backgroundColor,
						hidden: !meta.visible,
						lineCap: style.borderCapStyle,
						lineDash: style.borderDash,
						lineDashOffset: style.borderDashOffset,
						lineJoin: style.borderJoinStyle,
						lineWidth: borderWidth,
						strokeStyle: style.borderColor,
						pointStyle: overrideStyle || style.pointStyle,
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
	}
};
