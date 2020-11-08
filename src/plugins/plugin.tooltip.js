import Animations from '../core/core.animations';
import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import {valueOrDefault, each, noop, isNullOrUndef, isArray, _elementsEqual, merge} from '../helpers/helpers.core';
import {getRtlAdapter, overrideTextDirection, restoreTextDirection} from '../helpers/helpers.rtl';
import {distanceBetweenPoints} from '../helpers/helpers.math';
import {toFont} from '../helpers/helpers.options';
import {drawPoint} from '../helpers';

/**
 * @typedef { import("../platform/platform.base").ChartEvent } ChartEvent
 */

const positioners = {
	/**
	 * Average mode places the tooltip at the average position of the elements shown
	 * @function Chart.Tooltip.positioners.average
	 * @param items {object[]} the items being displayed in the tooltip
	 * @returns {object} tooltip position
	 */
	average(items) {
		if (!items.length) {
			return false;
		}

		let i, len;
		let x = 0;
		let y = 0;
		let count = 0;

		for (i = 0, len = items.length; i < len; ++i) {
			const el = items[i].element;
			if (el && el.hasValue()) {
				const pos = el.tooltipPosition();
				x += pos.x;
				y += pos.y;
				++count;
			}
		}

		return {
			x: x / count,
			y: y / count
		};
	},

	/**
	 * Gets the tooltip position nearest of the item nearest to the event position
	 * @function Chart.Tooltip.positioners.nearest
	 * @param items {object[]} the tooltip items
	 * @param eventPosition {object} the position of the event in canvas coordinates
	 * @returns {object} the tooltip position
	 */
	nearest(items, eventPosition) {
		let x = eventPosition.x;
		let y = eventPosition.y;
		let minDistance = Number.POSITIVE_INFINITY;
		let i, len, nearestElement;

		for (i = 0, len = items.length; i < len; ++i) {
			const el = items[i].element;
			if (el && el.hasValue()) {
				const center = el.getCenterPoint();
				const d = distanceBetweenPoints(eventPosition, center);

				if (d < minDistance) {
					minDistance = d;
					nearestElement = el;
				}
			}
		}

		if (nearestElement) {
			const tp = nearestElement.tooltipPosition();
			x = tp.x;
			y = tp.y;
		}

		return {
			x,
			y
		};
	}
};

// Helper to push or concat based on if the 2nd parameter is an array or not
function pushOrConcat(base, toPush) {
	if (toPush) {
		if (isArray(toPush)) {
			// base = base.concat(toPush);
			Array.prototype.push.apply(base, toPush);
		} else {
			base.push(toPush);
		}
	}

	return base;
}

/**
 * Returns array of strings split by newline
 * @param {*} str - The value to split by newline.
 * @returns {string|string[]} value if newline present - Returned from String split() method
 * @function
 */
function splitNewlines(str) {
	if ((typeof str === 'string' || str instanceof String) && str.indexOf('\n') > -1) {
		return str.split('\n');
	}
	return str;
}


/**
 * Private helper to create a tooltip item model
 * @param item - {element, index, datasetIndex} to create the tooltip item for
 * @return new tooltip item
 */
function createTooltipItem(chart, item) {
	const {element, datasetIndex, index} = item;
	const controller = chart.getDatasetMeta(datasetIndex).controller;
	const {label, value} = controller.getLabelAndValue(index);

	return {
		chart,
		label,
		dataPoint: controller.getParsed(index),
		formattedValue: value,
		dataset: controller.getDataset(),
		dataIndex: index,
		datasetIndex,
		element
	};
}

/**
 * Helper to get the reset model for the tooltip
 * @param options {object} the tooltip options
 * @param fallbackFont {object} the fallback font options
 */
function resolveOptions(options, fallbackFont) {

	options = merge(Object.create(null), [defaults.plugins.tooltip, options]);

	options.bodyFont = toFont(options.bodyFont, fallbackFont);
	options.titleFont = toFont(options.titleFont, fallbackFont);
	options.footerFont = toFont(options.footerFont, fallbackFont);

	options.boxHeight = valueOrDefault(options.boxHeight, options.bodyFont.size);
	options.boxWidth = valueOrDefault(options.boxWidth, options.bodyFont.size);

	return options;
}

/**
 * Get the size of the tooltip
 */
function getTooltipSize(tooltip) {
	const ctx = tooltip._chart.ctx;
	const {body, footer, options, title} = tooltip;
	const {bodyFont, footerFont, titleFont, boxWidth, boxHeight} = options;
	const titleLineCount = title.length;
	const footerLineCount = footer.length;
	const bodyLineItemCount = body.length;

	let height = options.yPadding * 2; // Tooltip Padding
	let width = 0;

	// Count of all lines in the body
	let combinedBodyLength = body.reduce((count, bodyItem) => count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
	combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;

	if (titleLineCount) {
		height += titleLineCount * titleFont.size
			+ (titleLineCount - 1) * options.titleSpacing
			+ options.titleMarginBottom;
	}
	if (combinedBodyLength) {
		// Body lines may include some extra height depending on boxHeight
		const bodyLineHeight = options.displayColors ? Math.max(boxHeight, bodyFont.size) : bodyFont.size;
		height += bodyLineItemCount * bodyLineHeight
			+ (combinedBodyLength - bodyLineItemCount) * bodyFont.size
			+ (combinedBodyLength - 1) * options.bodySpacing;
	}
	if (footerLineCount) {
		height += options.footerMarginTop
			+ footerLineCount * footerFont.size
			+ (footerLineCount - 1) * options.footerSpacing;
	}

	// Title width
	let widthPadding = 0;
	const maxLineWidth = function(line) {
		width = Math.max(width, ctx.measureText(line).width + widthPadding);
	};

	ctx.save();

	ctx.font = titleFont.string;
	each(tooltip.title, maxLineWidth);

	// Body width
	ctx.font = bodyFont.string;
	each(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);

	// Body lines may include some extra width due to the color box
	widthPadding = options.displayColors ? (boxWidth + 2) : 0;
	each(body, (bodyItem) => {
		each(bodyItem.before, maxLineWidth);
		each(bodyItem.lines, maxLineWidth);
		each(bodyItem.after, maxLineWidth);
	});

	// Reset back to 0
	widthPadding = 0;

	// Footer width
	ctx.font = footerFont.string;
	each(tooltip.footer, maxLineWidth);

	ctx.restore();

	// Add padding
	width += 2 * options.xPadding;

	return {width, height};
}

/**
 * Helper to get the alignment of a tooltip given the size
 */
function determineAlignment(chart, options, size) {
	const {x, y, width, height} = size;
	const chartArea = chart.chartArea;
	let xAlign = 'center';
	let yAlign = 'center';

	if (y < height / 2) {
		yAlign = 'top';
	} else if (y > (chart.height - height / 2)) {
		yAlign = 'bottom';
	}

	let lf, rf; // functions to determine left, right alignment
	const midX = (chartArea.left + chartArea.right) / 2;
	const midY = (chartArea.top + chartArea.bottom) / 2;

	if (yAlign === 'center') {
		lf = (value) => value <= midX;
		rf = (value) => value > midX;
	} else {
		lf = (value) => value <= (width / 2);
		rf = (value) => value >= (chart.width - (width / 2));
	}

	// functions to determine if left/right alignment causes tooltip to go outside chart
	const olf = (value) => value + width + options.caretSize + options.caretPadding > chart.width;
	const orf = (value) => value - width - options.caretSize - options.caretPadding < 0;
	// function to get the y alignment if the tooltip goes outside of the left or right edges
	const yf = (value) => value <= midY ? 'top' : 'bottom';

	if (lf(x)) {
		xAlign = 'left';

		// Is tooltip too wide and goes over the right side of the chart.?
		if (olf(x)) {
			xAlign = 'center';
			yAlign = yf(y);
		}
	} else if (rf(x)) {
		xAlign = 'right';

		// Is tooltip too wide and goes outside left edge of canvas?
		if (orf(x)) {
			xAlign = 'center';
			yAlign = yf(y);
		}
	}

	return {
		xAlign: options.xAlign ? options.xAlign : xAlign,
		yAlign: options.yAlign ? options.yAlign : yAlign
	};
}

function alignX(size, xAlign, chartWidth) {
	// eslint-disable-next-line prefer-const
	let {x, width} = size;
	if (xAlign === 'right') {
		x -= width;
	} else if (xAlign === 'center') {
		x -= (width / 2);
		if (x + width > chartWidth) {
			x = chartWidth - width;
		}
		if (x < 0) {
			x = 0;
		}
	}
	return x;
}

function alignY(size, yAlign, paddingAndSize) {
	// eslint-disable-next-line prefer-const
	let {y, height} = size;
	if (yAlign === 'top') {
		y += paddingAndSize;
	} else if (yAlign === 'bottom') {
		y -= height + paddingAndSize;
	} else {
		y -= (height / 2);
	}
	return y;
}

/**
 * Helper to get the location a tooltip needs to be placed at given the initial position (via the vm) and the size and alignment
 */
function getBackgroundPoint(options, size, alignment, chart) {
	const {caretSize, caretPadding, cornerRadius} = options;
	const {xAlign, yAlign} = alignment;
	const paddingAndSize = caretSize + caretPadding;
	const radiusAndPadding = cornerRadius + caretPadding;

	let x = alignX(size, xAlign, chart.width);
	const y = alignY(size, yAlign, paddingAndSize);

	if (yAlign === 'center') {
		if (xAlign === 'left') {
			x += paddingAndSize;
		} else if (xAlign === 'right') {
			x -= paddingAndSize;
		}
	} else if (xAlign === 'left') {
		x -= radiusAndPadding;
	} else if (xAlign === 'right') {
		x += radiusAndPadding;
	}

	return {x, y};
}

function getAlignedX(tooltip, align) {
	const options = tooltip.options;
	return align === 'center'
		? tooltip.x + tooltip.width / 2
		: align === 'right'
			? tooltip.x + tooltip.width - options.xPadding
			: tooltip.x + options.xPadding;
}

/**
 * Helper to build before and after body lines
 */
function getBeforeAfterBodyLines(callback) {
	return pushOrConcat([], splitNewlines(callback));
}

export class Tooltip extends Element {
	constructor(config) {
		super();

		this.opacity = 0;
		this._active = [];
		this._chart = config._chart;
		this._eventPosition = undefined;
		this._size = undefined;
		this._cachedAnimations = undefined;
		this.$animations = undefined;
		this.options = undefined;
		this.dataPoints = undefined;
		this.title = undefined;
		this.beforeBody = undefined;
		this.body = undefined;
		this.afterBody = undefined;
		this.footer = undefined;
		this.xAlign = undefined;
		this.yAlign = undefined;
		this.x = undefined;
		this.y = undefined;
		this.height = undefined;
		this.width = undefined;
		this.caretX = undefined;
		this.caretY = undefined;
		this.labelColors = undefined;
		this.labelPointStyles = undefined;
		this.labelTextColors = undefined;

		this.initialize();
	}

	initialize() {
		const me = this;
		const chartOpts = me._chart.options;
		me.options = resolveOptions(chartOpts.tooltips, chartOpts.font);
		me._cachedAnimations = undefined;
	}

	/**
	 * @private
	 */
	_resolveAnimations() {
		const me = this;
		const cached = me._cachedAnimations;

		if (cached) {
			return cached;
		}

		const chart = me._chart;
		const options = me.options;
		const opts = options.enabled && chart.options.animation && options.animation;
		const animations = new Animations(me._chart, opts);
		me._cachedAnimations = Object.freeze(animations);

		return animations;
	}

	getTitle(context) {
		const me = this;
		const opts = me.options;
		const callbacks = opts.callbacks;

		const beforeTitle = callbacks.beforeTitle.apply(me, [context]);
		const title = callbacks.title.apply(me, [context]);
		const afterTitle = callbacks.afterTitle.apply(me, [context]);

		let lines = [];
		lines = pushOrConcat(lines, splitNewlines(beforeTitle));
		lines = pushOrConcat(lines, splitNewlines(title));
		lines = pushOrConcat(lines, splitNewlines(afterTitle));

		return lines;
	}

	getBeforeBody(tooltipItems) {
		return getBeforeAfterBodyLines(this.options.callbacks.beforeBody.apply(this, [tooltipItems]));
	}

	getBody(tooltipItems) {
		const me = this;
		const callbacks = me.options.callbacks;
		const bodyItems = [];

		each(tooltipItems, (context) => {
			const bodyItem = {
				before: [],
				lines: [],
				after: []
			};
			pushOrConcat(bodyItem.before, splitNewlines(callbacks.beforeLabel.call(me, context)));
			pushOrConcat(bodyItem.lines, callbacks.label.call(me, context));
			pushOrConcat(bodyItem.after, splitNewlines(callbacks.afterLabel.call(me, context)));

			bodyItems.push(bodyItem);
		});

		return bodyItems;
	}

	getAfterBody(tooltipItems) {
		return getBeforeAfterBodyLines(this.options.callbacks.afterBody.apply(this, [tooltipItems]));
	}

	// Get the footer and beforeFooter and afterFooter lines
	getFooter(tooltipItems) {
		const me = this;
		const callbacks = me.options.callbacks;

		const beforeFooter = callbacks.beforeFooter.apply(me, [tooltipItems]);
		const footer = callbacks.footer.apply(me, [tooltipItems]);
		const afterFooter = callbacks.afterFooter.apply(me, [tooltipItems]);

		let lines = [];
		lines = pushOrConcat(lines, splitNewlines(beforeFooter));
		lines = pushOrConcat(lines, splitNewlines(footer));
		lines = pushOrConcat(lines, splitNewlines(afterFooter));

		return lines;
	}

	/**
	 * @private
	 */
	_createItems() {
		const me = this;
		const active = me._active;
		const options = me.options;
		const data = me._chart.data;
		const labelColors = [];
		const labelPointStyles = [];
		const labelTextColors = [];
		let tooltipItems = [];
		let i, len;

		for (i = 0, len = active.length; i < len; ++i) {
			tooltipItems.push(createTooltipItem(me._chart, active[i]));
		}

		// If the user provided a filter function, use it to modify the tooltip items
		if (options.filter) {
			tooltipItems = tooltipItems.filter((element, index, array) => options.filter(element, index, array, data));
		}

		// If the user provided a sorting function, use it to modify the tooltip items
		if (options.itemSort) {
			tooltipItems = tooltipItems.sort((a, b) => options.itemSort(a, b, data));
		}

		// Determine colors for boxes
		each(tooltipItems, (context) => {
			labelColors.push(options.callbacks.labelColor.call(me, context));
			labelPointStyles.push(options.callbacks.labelPointStyle.call(me, context));
			labelTextColors.push(options.callbacks.labelTextColor.call(me, context));
		});

		me.labelColors = labelColors;
		me.labelPointStyles = labelPointStyles;
		me.labelTextColors = labelTextColors;
		me.dataPoints = tooltipItems;
		return tooltipItems;
	}

	update(changed) {
		const me = this;
		const options = me.options;
		const active = me._active;
		let properties;

		if (!active.length) {
			if (me.opacity !== 0) {
				properties = {
					opacity: 0
				};
			}
		} else {
			const position = positioners[options.position].call(me, active, me._eventPosition);
			const tooltipItems = me._createItems();

			me.title = me.getTitle(tooltipItems);
			me.beforeBody = me.getBeforeBody(tooltipItems);
			me.body = me.getBody(tooltipItems);
			me.afterBody = me.getAfterBody(tooltipItems);
			me.footer = me.getFooter(tooltipItems);

			const size = me._size = getTooltipSize(me);
			const positionAndSize = Object.assign({}, position, size);
			const alignment = determineAlignment(me._chart, options, positionAndSize);
			const backgroundPoint = getBackgroundPoint(options, positionAndSize, alignment, me._chart);

			me.xAlign = alignment.xAlign;
			me.yAlign = alignment.yAlign;

			properties = {
				opacity: 1,
				x: backgroundPoint.x,
				y: backgroundPoint.y,
				width: size.width,
				height: size.height,
				caretX: position.x,
				caretY: position.y
			};
		}

		if (properties) {
			me._resolveAnimations().update(me, properties);
		}

		if (changed && options.custom) {
			options.custom.call(me, {chart: me._chart, tooltip: me});
		}
	}

	drawCaret(tooltipPoint, ctx, size) {
		const caretPosition = this.getCaretPosition(tooltipPoint, size);

		ctx.lineTo(caretPosition.x1, caretPosition.y1);
		ctx.lineTo(caretPosition.x2, caretPosition.y2);
		ctx.lineTo(caretPosition.x3, caretPosition.y3);
	}

	getCaretPosition(tooltipPoint, size) {
		const {xAlign, yAlign, options} = this;
		const {cornerRadius, caretSize} = options;
		const {x: ptX, y: ptY} = tooltipPoint;
		const {width, height} = size;
		let x1, x2, x3, y1, y2, y3;

		if (yAlign === 'center') {
			y2 = ptY + (height / 2);

			if (xAlign === 'left') {
				x1 = ptX;
				x2 = x1 - caretSize;

				// Left draws bottom -> top, this y1 is on the bottom
				y1 = y2 + caretSize;
				y3 = y2 - caretSize;
			} else {
				x1 = ptX + width;
				x2 = x1 + caretSize;

				// Right draws top -> bottom, thus y1 is on the top
				y1 = y2 - caretSize;
				y3 = y2 + caretSize;
			}

			x3 = x1;
		} else {
			if (xAlign === 'left') {
				x2 = ptX + cornerRadius + (caretSize);
			} else if (xAlign === 'right') {
				x2 = ptX + width - cornerRadius - caretSize;
			} else {
				x2 = this.caretX;
			}

			if (yAlign === 'top') {
				y1 = ptY;
				y2 = y1 - caretSize;

				// Top draws left -> right, thus x1 is on the left
				x1 = x2 - caretSize;
				x3 = x2 + caretSize;
			} else {
				y1 = ptY + height;
				y2 = y1 + caretSize;

				// Bottom draws right -> left, thus x1 is on the right
				x1 = x2 + caretSize;
				x3 = x2 - caretSize;
			}
			y3 = y1;
		}
		return {x1, x2, x3, y1, y2, y3};
	}

	drawTitle(pt, ctx) {
		const me = this;
		const options = me.options;
		const title = me.title;
		const length = title.length;
		let titleFont, titleSpacing, i;

		if (length) {
			const rtlHelper = getRtlAdapter(options.rtl, me.x, me.width);

			pt.x = getAlignedX(me, options.titleAlign);

			ctx.textAlign = rtlHelper.textAlign(options.titleAlign);
			ctx.textBaseline = 'middle';

			titleFont = options.titleFont;
			titleSpacing = options.titleSpacing;

			ctx.fillStyle = options.titleFont.color;
			ctx.font = titleFont.string;

			for (i = 0; i < length; ++i) {
				ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFont.size / 2);
				pt.y += titleFont.size + titleSpacing; // Line Height and spacing

				if (i + 1 === length) {
					pt.y += options.titleMarginBottom - titleSpacing; // If Last, add margin, remove spacing
				}
			}
		}
	}

	/**
	 * @private
	 */
	_drawColorBox(ctx, pt, i, rtlHelper) {
		const me = this;
		const options = me.options;
		const labelColors = me.labelColors[i];
		const labelPointStyle = me.labelPointStyles[i];
		const {boxHeight, boxWidth, bodyFont} = options;
		const colorX = getAlignedX(me, 'left');
		const rtlColorX = rtlHelper.x(colorX);
		const yOffSet = boxHeight < bodyFont.size ? (bodyFont.size - boxHeight) / 2 : 0;
		const colorY = pt.y + yOffSet;

		if (options.usePointStyle) {
			const drawOptions = {
				radius: Math.min(boxWidth, boxHeight) / 2, // fit the circle in the box
				pointStyle: labelPointStyle.pointStyle,
				rotation: labelPointStyle.rotation,
				borderWidth: 1
			};
			// Recalculate x and y for drawPoint() because its expecting
			// x and y to be center of figure (instead of top left)
			const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
			const centerY = colorY + boxHeight / 2;

			// Fill the point with white so that colours merge nicely if the opacity is < 1
			ctx.strokeStyle = options.multiKeyBackground;
			ctx.fillStyle = options.multiKeyBackground;
			drawPoint(ctx, drawOptions, centerX, centerY);

			// Draw the point
			ctx.strokeStyle = labelColors.borderColor;
			ctx.fillStyle = labelColors.backgroundColor;
			drawPoint(ctx, drawOptions, centerX, centerY);
		} else {
			// Fill a white rect so that colours merge nicely if the opacity is < 1
			ctx.fillStyle = options.multiKeyBackground;
			ctx.fillRect(rtlHelper.leftForLtr(rtlColorX, boxWidth), colorY, boxWidth, boxHeight);

			// Border
			ctx.lineWidth = 1;
			ctx.strokeStyle = labelColors.borderColor;
			ctx.strokeRect(rtlHelper.leftForLtr(rtlColorX, boxWidth), colorY, boxWidth, boxHeight);

			// Inner square
			ctx.fillStyle = labelColors.backgroundColor;
			ctx.fillRect(rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - 2), colorY + 1, boxWidth - 2, boxHeight - 2);
		}

		// restore fillStyle
		ctx.fillStyle = me.labelTextColors[i];
	}

	drawBody(pt, ctx) {
		const me = this;
		const {body, options} = me;
		const {bodyFont, bodySpacing, bodyAlign, displayColors, boxHeight, boxWidth} = options;
		let bodyLineHeight = bodyFont.size;
		let xLinePadding = 0;

		const rtlHelper = getRtlAdapter(options.rtl, me.x, me.width);

		const fillLineOfText = function(line) {
			ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
			pt.y += bodyLineHeight + bodySpacing;
		};

		const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
		let bodyItem, textColor, lines, i, j, ilen, jlen;

		ctx.textAlign = bodyAlign;
		ctx.textBaseline = 'middle';
		ctx.font = bodyFont.string;

		pt.x = getAlignedX(me, bodyAlignForCalculation);

		// Before body lines
		ctx.fillStyle = bodyFont.color;
		each(me.beforeBody, fillLineOfText);

		xLinePadding = displayColors && bodyAlignForCalculation !== 'right'
			? bodyAlign === 'center' ? (boxWidth / 2 + 1) : (boxWidth + 2)
			: 0;

		// Draw body lines now
		for (i = 0, ilen = body.length; i < ilen; ++i) {
			bodyItem = body[i];
			textColor = me.labelTextColors[i];

			ctx.fillStyle = textColor;
			each(bodyItem.before, fillLineOfText);

			lines = bodyItem.lines;
			// Draw Legend-like boxes if needed
			if (displayColors && lines.length) {
				me._drawColorBox(ctx, pt, i, rtlHelper);
				bodyLineHeight = Math.max(bodyFont.size, boxHeight);
			}

			for (j = 0, jlen = lines.length; j < jlen; ++j) {
				fillLineOfText(lines[j]);
				// Reset for any lines that don't include colorbox
				bodyLineHeight = bodyFont.size;
			}

			each(bodyItem.after, fillLineOfText);
		}

		// Reset back to 0 for after body
		xLinePadding = 0;
		bodyLineHeight = bodyFont.size;

		// After body lines
		each(me.afterBody, fillLineOfText);
		pt.y -= bodySpacing; // Remove last body spacing
	}

	drawFooter(pt, ctx) {
		const me = this;
		const options = me.options;
		const footer = me.footer;
		const length = footer.length;
		let footerFont, i;

		if (length) {
			const rtlHelper = getRtlAdapter(options.rtl, me.x, me.width);

			pt.x = getAlignedX(me, options.footerAlign);
			pt.y += options.footerMarginTop;

			ctx.textAlign = rtlHelper.textAlign(options.footerAlign);
			ctx.textBaseline = 'middle';

			footerFont = options.footerFont;

			ctx.fillStyle = options.footerFont.color;
			ctx.font = footerFont.string;

			for (i = 0; i < length; ++i) {
				ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFont.size / 2);
				pt.y += footerFont.size + options.footerSpacing;
			}
		}
	}

	drawBackground(pt, ctx, tooltipSize) {
		const {xAlign, yAlign, options} = this;
		const {x, y} = pt;
		const {width, height} = tooltipSize;
		const radius = options.cornerRadius;

		ctx.fillStyle = options.backgroundColor;
		ctx.strokeStyle = options.borderColor;
		ctx.lineWidth = options.borderWidth;

		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		if (yAlign === 'top') {
			this.drawCaret(pt, ctx, tooltipSize);
		}
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		if (yAlign === 'center' && xAlign === 'right') {
			this.drawCaret(pt, ctx, tooltipSize);
		}
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		if (yAlign === 'bottom') {
			this.drawCaret(pt, ctx, tooltipSize);
		}
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		if (yAlign === 'center' && xAlign === 'left') {
			this.drawCaret(pt, ctx, tooltipSize);
		}
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();

		ctx.fill();

		if (options.borderWidth > 0) {
			ctx.stroke();
		}
	}

	/**
	 * Update x/y animation targets when _active elements are animating too
	 * @private
	 */
	_updateAnimationTarget() {
		const me = this;
		const chart = me._chart;
		const options = me.options;
		const anims = me.$animations;
		const animX = anims && anims.x;
		const animY = anims && anims.y;
		if (animX || animY) {
			const position = positioners[options.position].call(me, me._active, me._eventPosition);
			if (!position) {
				return;
			}
			const size = me._size = getTooltipSize(me);
			const positionAndSize = Object.assign({}, position, me._size);
			const alignment = determineAlignment(chart, options, positionAndSize);
			const point = getBackgroundPoint(options, positionAndSize, alignment, chart);
			if (animX._to !== point.x || animY._to !== point.y) {
				me.xAlign = alignment.xAlign;
				me.yAlign = alignment.yAlign;
				me.width = size.width;
				me.height = size.height;
				me.caretX = position.x;
				me.caretY = position.y;
				me._resolveAnimations().update(me, point);
			}
		}
	}

	draw(ctx) {
		const me = this;
		const options = me.options;
		let opacity = me.opacity;

		if (!opacity) {
			return;
		}

		me._updateAnimationTarget();

		const tooltipSize = {
			width: me.width,
			height: me.height
		};
		const pt = {
			x: me.x,
			y: me.y
		};

		// IE11/Edge does not like very small opacities, so snap to 0
		opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;

		// Truthy/falsey value for empty tooltip
		const hasTooltipContent = me.title.length || me.beforeBody.length || me.body.length || me.afterBody.length || me.footer.length;

		if (options.enabled && hasTooltipContent) {
			ctx.save();
			ctx.globalAlpha = opacity;

			// Draw Background
			me.drawBackground(pt, ctx, tooltipSize);

			overrideTextDirection(ctx, options.textDirection);

			pt.y += options.yPadding;

			// Titles
			me.drawTitle(pt, ctx);

			// Body
			me.drawBody(pt, ctx);

			// Footer
			me.drawFooter(pt, ctx);

			restoreTextDirection(ctx, options.textDirection);

			ctx.restore();
		}
	}

	/**
	 * Get active elements in the tooltip
	 * @returns {Array} Array of elements that are active in the tooltip
	 */
	getActiveElements() {
		return this._active || [];
	}

	/**
	 * Set active elements in the tooltip
	 * @param {array} activeElements Array of active datasetIndex/index pairs.
	 * @param {object} eventPosition Synthetic event position used in positioning
	 */
	setActiveElements(activeElements, eventPosition) {
		const me = this;
		const lastActive = me._active;
		const active = activeElements.map(({datasetIndex, index}) => {
			const meta = me._chart.getDatasetMeta(datasetIndex);

			if (!meta) {
				throw new Error('Cannot find a dataset at index ' + datasetIndex);
			}

			return {
				datasetIndex,
				element: meta.data[index],
				index,
			};
		});
		const changed = !_elementsEqual(lastActive, active);
		const positionChanged = me._positionChanged(active, eventPosition);

		if (changed || positionChanged) {
			me._active = active;
			me._eventPosition = eventPosition;
			me.update(true);
		}
	}

	/**
	 * Handle an event
	 * @param {ChartEvent} e - The event to handle
	 * @param {boolean} [replay] - This is a replayed event (from update)
	 * @returns {boolean} true if the tooltip changed
	 */
	handleEvent(e, replay) {
		const me = this;
		const options = me.options;
		const lastActive = me._active || [];
		let changed = false;
		let active = [];

		// Find Active Elements for tooltips
		if (e.type !== 'mouseout') {
			active = me._chart.getElementsAtEventForMode(e, options.mode, options, replay);
			if (options.reverse) {
				active.reverse();
			}
		}

		// When there are multiple items shown, but the tooltip position is nearest mode
		// an update may need to be made because our position may have changed even though
		// the items are the same as before.
		const positionChanged = me._positionChanged(active, e);

		// Remember Last Actives
		changed = replay || !_elementsEqual(active, lastActive) || positionChanged;

		// Only handle target event on tooltip change
		if (changed) {
			me._active = active;

			if (options.enabled || options.custom) {
				me._eventPosition = {
					x: e.x,
					y: e.y
				};

				me.update(true);
			}
		}

		return changed;
	}

	/**
	 * Determine if the active elements + event combination changes the
	 * tooltip position
	 * @param {array} active - Active elements
	 * @param {ChartEvent} e - Event that triggered the position change
	 * @returns {boolean} True if the position has changed
	 */
	_positionChanged(active, e) {
		const me = this;
		const position = positioners[me.options.position].call(me, active, e);
		return me.caretX !== position.x || me.caretY !== position.y;
	}
}

/**
 * @namespace Chart.Tooltip.positioners
 */
Tooltip.positioners = positioners;

export default {
	id: 'tooltip',
	_element: Tooltip,
	positioners,

	afterInit(chart) {
		const tooltipOpts = chart.options.tooltips;

		if (tooltipOpts) {
			chart.tooltip = new Tooltip({_chart: chart});
		}
	},

	beforeUpdate(chart) {
		if (chart.tooltip) {
			chart.tooltip.initialize();
		}
	},

	reset(chart) {
		if (chart.tooltip) {
			chart.tooltip.initialize();
		}
	},

	afterDraw(chart) {
		const tooltip = chart.tooltip;

		const args = {
			tooltip
		};

		if (chart._plugins.notify(chart, 'beforeTooltipDraw', [args]) === false) {
			return;
		}

		if (tooltip) {
			tooltip.draw(chart.ctx);
		}

		chart._plugins.notify(chart, 'afterTooltipDraw', [args]);
	},

	afterEvent(chart, e, replay) {
		if (chart.tooltip) {
			// If the event is replayed from `update`, we should evaluate with the final positions.
			const useFinalPosition = replay;
			chart.tooltip.handleEvent(e, useFinalPosition);
		}
	},

	defaults: {
		enabled: true,
		custom: null,
		position: 'average',
		backgroundColor: 'rgba(0,0,0,0.8)',
		titleFont: {
			style: 'bold',
			color: '#fff',
		},
		titleSpacing: 2,
		titleMarginBottom: 6,
		titleAlign: 'left',
		bodySpacing: 2,
		bodyFont: {
			color: '#fff',
		},
		bodyAlign: 'left',
		footerSpacing: 2,
		footerMarginTop: 6,
		footerFont: {
			color: '#fff',
			style: 'bold',
		},
		footerAlign: 'left',
		yPadding: 6,
		xPadding: 6,
		caretPadding: 2,
		caretSize: 5,
		cornerRadius: 6,
		multiKeyBackground: '#fff',
		displayColors: true,
		borderColor: 'rgba(0,0,0,0)',
		borderWidth: 0,
		animation: {
			duration: 400,
			easing: 'easeOutQuart',
			numbers: {
				type: 'number',
				properties: ['x', 'y', 'width', 'height', 'caretX', 'caretY'],
			},
			opacity: {
				easing: 'linear',
				duration: 200
			}
		},
		callbacks: {
			// Args are: (tooltipItems, data)
			beforeTitle: noop,
			title(tooltipItems) {
				if (tooltipItems.length > 0) {
					const item = tooltipItems[0];
					const labels = item.chart.data.labels;
					const labelCount = labels ? labels.length : 0;

					if (this && this.options && this.options.mode === 'dataset') {
						return item.dataset.label || '';
					} else if (item.label) {
						return item.label;
					} else if (labelCount > 0 && item.dataIndex < labelCount) {
						return labels[item.dataIndex];
					}
				}

				return '';
			},
			afterTitle: noop,

			// Args are: (tooltipItems, data)
			beforeBody: noop,

			// Args are: (tooltipItem, data)
			beforeLabel: noop,
			label(tooltipItem) {
				if (this && this.options && this.options.mode === 'dataset') {
					return tooltipItem.label + ': ' + tooltipItem.formattedValue || tooltipItem.formattedValue;
				}

				let label = tooltipItem.dataset.label || '';

				if (label) {
					label += ': ';
				}
				const value = tooltipItem.formattedValue;
				if (!isNullOrUndef(value)) {
					label += value;
				}
				return label;
			},
			labelColor(tooltipItem) {
				const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
				const options = meta.controller.getStyle(tooltipItem.dataIndex);
				return {
					borderColor: options.borderColor,
					backgroundColor: options.backgroundColor
				};
			},
			labelTextColor() {
				return this.options.bodyFont.color;
			},
			labelPointStyle(tooltipItem) {
				const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
				const options = meta.controller.getStyle(tooltipItem.dataIndex);
				return {
					pointStyle: options.pointStyle,
					rotation: options.rotation,
				};
			},
			afterLabel: noop,

			// Args are: (tooltipItems, data)
			afterBody: noop,

			// Args are: (tooltipItems, data)
			beforeFooter: noop,
			footer: noop,
			afterFooter: noop
		}
	},
};
