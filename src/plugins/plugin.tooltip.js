import Animations from '../core/core.animations';
import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import plugins from '../core/core.plugins';
import helpers from '../helpers/index';

/**
 * @typedef { import("../platform/platform.base").IEvent } IEvent
 */

const valueOrDefault = helpers.valueOrDefault;
const getRtlHelper = helpers.rtl.getRtlAdapter;

defaults.set('tooltips', {
	enabled: true,
	custom: null,
	mode: 'nearest',
	position: 'average',
	intersect: true,
	backgroundColor: 'rgba(0,0,0,0.8)',
	titleFontStyle: 'bold',
	titleSpacing: 2,
	titleMarginBottom: 6,
	titleFontColor: '#fff',
	titleAlign: 'left',
	bodySpacing: 2,
	bodyFontColor: '#fff',
	bodyAlign: 'left',
	footerFontStyle: 'bold',
	footerSpacing: 2,
	footerMarginTop: 6,
	footerFontColor: '#fff',
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
			properties: ['x', 'y', 'width', 'height'],
		},
		opacity: {
			easing: 'linear',
			duration: 200
		}
	},
	callbacks: {
		// Args are: (tooltipItems, data)
		beforeTitle: helpers.noop,
		title(tooltipItems, data) {
			let title = '';
			const labels = data.labels;
			const labelCount = labels ? labels.length : 0;

			if (tooltipItems.length > 0) {
				const item = tooltipItems[0];
				if (item.label) {
					title = item.label;
				} else if (labelCount > 0 && item.index < labelCount) {
					title = labels[item.index];
				}
			}

			return title;
		},
		afterTitle: helpers.noop,

		// Args are: (tooltipItems, data)
		beforeBody: helpers.noop,

		// Args are: (tooltipItem, data)
		beforeLabel: helpers.noop,
		label(tooltipItem, data) {
			let label = data.datasets[tooltipItem.datasetIndex].label || '';

			if (label) {
				label += ': ';
			}
			const value = tooltipItem.value;
			if (!helpers.isNullOrUndef(value)) {
				label += value;
			}
			return label;
		},
		labelColor(tooltipItem, chart) {
			const meta = chart.getDatasetMeta(tooltipItem.datasetIndex);
			const options = meta.controller.getStyle(tooltipItem.index);
			return {
				borderColor: options.borderColor,
				backgroundColor: options.backgroundColor
			};
		},
		labelTextColor() {
			return this.options.bodyFontColor;
		},
		afterLabel: helpers.noop,

		// Args are: (tooltipItems, data)
		afterBody: helpers.noop,

		// Args are: (tooltipItems, data)
		beforeFooter: helpers.noop,
		footer: helpers.noop,
		afterFooter: helpers.noop
	}
});

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
				const d = helpers.math.distanceBetweenPoints(eventPosition, center);

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
		if (helpers.isArray(toPush)) {
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
 * @param item - the chart element (point, arc, bar) to create the tooltip item for
 * @return new tooltip item
 */
function createTooltipItem(chart, item) {
	const {datasetIndex, index} = item;
	const {label, value} = chart.getDatasetMeta(datasetIndex).controller.getLabelAndValue(index);

	return {
		label,
		value,
		index,
		datasetIndex
	};
}

/**
 * Helper to get the reset model for the tooltip
 * @param options {object} the tooltip options
 */
function resolveOptions(options) {

	options = Object.assign({}, defaults.tooltips, options);

	options.bodyFontFamily = valueOrDefault(options.bodyFontFamily, defaults.fontFamily);
	options.bodyFontStyle = valueOrDefault(options.bodyFontStyle, defaults.fontStyle);
	options.bodyFontSize = valueOrDefault(options.bodyFontSize, defaults.fontSize);

	options.titleFontFamily = valueOrDefault(options.titleFontFamily, defaults.fontFamily);
	options.titleFontStyle = valueOrDefault(options.titleFontStyle, defaults.fontStyle);
	options.titleFontSize = valueOrDefault(options.titleFontSize, defaults.fontSize);

	options.footerFontFamily = valueOrDefault(options.footerFontFamily, defaults.fontFamily);
	options.footerFontStyle = valueOrDefault(options.footerFontStyle, defaults.fontStyle);
	options.footerFontSize = valueOrDefault(options.footerFontSize, defaults.fontSize);

	return options;
}

/**
 * Get the size of the tooltip
 */
function getTooltipSize(tooltip) {
	const ctx = tooltip._chart.ctx;
	const {body, footer, options, title} = tooltip;
	const {bodyFontSize, footerFontSize, titleFontSize} = options;
	const titleLineCount = title.length;
	const footerLineCount = footer.length;

	let height = options.yPadding * 2; // Tooltip Padding
	let width = 0;

	// Count of all lines in the body
	let combinedBodyLength = body.reduce((count, bodyItem) => count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
	combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;

	if (titleLineCount) {
		height += titleLineCount * titleFontSize
			+ (titleLineCount - 1) * options.titleSpacing
			+ options.titleMarginBottom;
	}
	if (combinedBodyLength) {
		height += combinedBodyLength * bodyFontSize
			+ (combinedBodyLength - 1) * options.bodySpacing;
	}
	if (footerLineCount) {
		height += options.footerMarginTop
			+ footerLineCount * footerFontSize
			+ (footerLineCount - 1) * options.footerSpacing;
	}

	// Title width
	let widthPadding = 0;
	const maxLineWidth = function(line) {
		width = Math.max(width, ctx.measureText(line).width + widthPadding);
	};

	ctx.save();

	ctx.font = helpers.fontString(titleFontSize, options.titleFontStyle, options.titleFontFamily);
	helpers.each(tooltip.title, maxLineWidth);

	// Body width
	ctx.font = helpers.fontString(bodyFontSize, options.bodyFontStyle, options.bodyFontFamily);
	helpers.each(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);

	// Body lines may include some extra width due to the color box
	widthPadding = options.displayColors ? (bodyFontSize + 2) : 0;
	helpers.each(body, (bodyItem) => {
		helpers.each(bodyItem.before, maxLineWidth);
		helpers.each(bodyItem.lines, maxLineWidth);
		helpers.each(bodyItem.after, maxLineWidth);
	});

	// Reset back to 0
	widthPadding = 0;

	// Footer width
	ctx.font = helpers.fontString(footerFontSize, options.footerFontStyle, options.footerFontFamily);
	helpers.each(tooltip.footer, maxLineWidth);

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

	if (y < height) {
		yAlign = 'top';
	} else if (y > (chart.height - height)) {
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
		this.labelTextColors = undefined;

		this.initialize();
	}

	initialize() {
		const me = this;
		me.options = resolveOptions(me._chart.options.tooltips);
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
		const opts = chart.options.animation && me.options.animation;
		const animations = new Animations(me._chart, opts);
		me._cachedAnimations = Object.freeze(animations);

		return animations;
	}

	// Get the title
	// Args are: (tooltipItem, data)
	getTitle(tooltipitem, data) {
		const me = this;
		const opts = me.options;
		const callbacks = opts.callbacks;

		const beforeTitle = callbacks.beforeTitle.apply(me, [tooltipitem, data]);
		const title = callbacks.title.apply(me, [tooltipitem, data]);
		const afterTitle = callbacks.afterTitle.apply(me, [tooltipitem, data]);

		let lines = [];
		lines = pushOrConcat(lines, splitNewlines(beforeTitle));
		lines = pushOrConcat(lines, splitNewlines(title));
		lines = pushOrConcat(lines, splitNewlines(afterTitle));

		return lines;
	}

	// Args are: (tooltipItem, data)
	getBeforeBody(tooltipitem, data) {
		return getBeforeAfterBodyLines(this.options.callbacks.beforeBody.apply(this, [tooltipitem, data]));
	}

	// Args are: (tooltipItem, data)
	getBody(tooltipItems, data) {
		const me = this;
		const callbacks = me.options.callbacks;
		const bodyItems = [];

		helpers.each(tooltipItems, (tooltipItem) => {
			const bodyItem = {
				before: [],
				lines: [],
				after: []
			};
			pushOrConcat(bodyItem.before, splitNewlines(callbacks.beforeLabel.call(me, tooltipItem, data)));
			pushOrConcat(bodyItem.lines, callbacks.label.call(me, tooltipItem, data));
			pushOrConcat(bodyItem.after, splitNewlines(callbacks.afterLabel.call(me, tooltipItem, data)));

			bodyItems.push(bodyItem);
		});

		return bodyItems;
	}

	// Args are: (tooltipItem, data)
	getAfterBody(tooltipitem, data) {
		return getBeforeAfterBodyLines(this.options.callbacks.afterBody.apply(this, [tooltipitem, data]));
	}

	// Get the footer and beforeFooter and afterFooter lines
	// Args are: (tooltipItem, data)
	getFooter(tooltipitem, data) {
		const me = this;
		const callbacks = me.options.callbacks;

		const beforeFooter = callbacks.beforeFooter.apply(me, [tooltipitem, data]);
		const footer = callbacks.footer.apply(me, [tooltipitem, data]);
		const afterFooter = callbacks.afterFooter.apply(me, [tooltipitem, data]);

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
		const labelTextColors = [];
		let tooltipItems = [];
		let i, len;

		for (i = 0, len = active.length; i < len; ++i) {
			tooltipItems.push(createTooltipItem(me._chart, active[i]));
		}

		// If the user provided a filter function, use it to modify the tooltip items
		if (options.filter) {
			tooltipItems = tooltipItems.filter((a) => options.filter(a, data));
		}

		// If the user provided a sorting function, use it to modify the tooltip items
		if (options.itemSort) {
			tooltipItems = tooltipItems.sort((a, b) => options.itemSort(a, b, data));
		}

		// Determine colors for boxes
		helpers.each(tooltipItems, (tooltipItem) => {
			labelColors.push(options.callbacks.labelColor.call(me, tooltipItem, me._chart));
			labelTextColors.push(options.callbacks.labelTextColor.call(me, tooltipItem, me._chart));
		});

		me.labelColors = labelColors;
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
			const data = me._chart.data;
			const position = positioners[options.position].call(me, active, me._eventPosition);
			const tooltipItems = me._createItems();

			me.title = me.getTitle(tooltipItems, data);
			me.beforeBody = me.getBeforeBody(tooltipItems, data);
			me.body = me.getBody(tooltipItems, data);
			me.afterBody = me.getAfterBody(tooltipItems, data);
			me.footer = me.getFooter(tooltipItems, data);

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
			options.custom.call(me);
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
			} else {
				x1 = ptX + width;
				x2 = x1 + caretSize;
			}
			x3 = x1;
			y1 = y2 + caretSize;
			y3 = y2 - caretSize;
		} else {
			if (xAlign === 'left') {
				x2 = ptX + cornerRadius + (caretSize);
			} else if (xAlign === 'right') {
				x2 = ptX + width - cornerRadius - caretSize;
			} else {
				x2 = this.caretX;
			}
			x1 = x2 - caretSize;
			x3 = x2 + caretSize;
			if (yAlign === 'top') {
				y1 = ptY;
				y2 = y1 - caretSize;
			} else {
				y1 = ptY + height;
				y2 = y1 + caretSize;
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
		let titleFontSize, titleSpacing, i;

		if (length) {
			const rtlHelper = getRtlHelper(options.rtl, me.x, me.width);

			pt.x = getAlignedX(me, options.titleAlign);

			ctx.textAlign = rtlHelper.textAlign(options.titleAlign);
			ctx.textBaseline = 'middle';

			titleFontSize = options.titleFontSize;
			titleSpacing = options.titleSpacing;

			ctx.fillStyle = options.titleFontColor;
			ctx.font = helpers.fontString(titleFontSize, options.titleFontStyle, options.titleFontFamily);

			for (i = 0; i < length; ++i) {
				ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFontSize / 2);
				pt.y += titleFontSize + titleSpacing; // Line Height and spacing

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
		const bodyFontSize = options.bodyFontSize;
		const colorX = getAlignedX(me, 'left');
		const rtlColorX = rtlHelper.x(colorX);

		// Fill a white rect so that colours merge nicely if the opacity is < 1
		ctx.fillStyle = options.multiKeyBackground;
		ctx.fillRect(rtlHelper.leftForLtr(rtlColorX, bodyFontSize), pt.y, bodyFontSize, bodyFontSize);

		// Border
		ctx.lineWidth = 1;
		ctx.strokeStyle = labelColors.borderColor;
		ctx.strokeRect(rtlHelper.leftForLtr(rtlColorX, bodyFontSize), pt.y, bodyFontSize, bodyFontSize);

		// Inner square
		ctx.fillStyle = labelColors.backgroundColor;
		ctx.fillRect(rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), bodyFontSize - 2), pt.y + 1, bodyFontSize - 2, bodyFontSize - 2);

		// restore fillStyle
		ctx.fillStyle = me.labelTextColors[i];
	}

	drawBody(pt, ctx) {
		const me = this;
		const {body, options} = me;
		const {bodyFontSize, bodySpacing, bodyAlign, displayColors} = options;
		let xLinePadding = 0;

		const rtlHelper = getRtlHelper(options.rtl, me.x, me.width);

		const fillLineOfText = function(line) {
			ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyFontSize / 2);
			pt.y += bodyFontSize + bodySpacing;
		};

		const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
		let bodyItem, textColor, lines, i, j, ilen, jlen;

		ctx.textAlign = bodyAlign;
		ctx.textBaseline = 'middle';
		ctx.font = helpers.fontString(bodyFontSize, options.bodyFontStyle, options.bodyFontFamily);

		pt.x = getAlignedX(me, bodyAlignForCalculation);

		// Before body lines
		ctx.fillStyle = options.bodyFontColor;
		helpers.each(me.beforeBody, fillLineOfText);

		xLinePadding = displayColors && bodyAlignForCalculation !== 'right'
			? bodyAlign === 'center' ? (bodyFontSize / 2 + 1) : (bodyFontSize + 2)
			: 0;

		// Draw body lines now
		for (i = 0, ilen = body.length; i < ilen; ++i) {
			bodyItem = body[i];
			textColor = me.labelTextColors[i];

			ctx.fillStyle = textColor;
			helpers.each(bodyItem.before, fillLineOfText);

			lines = bodyItem.lines;
			// Draw Legend-like boxes if needed
			if (displayColors && lines.length) {
				me._drawColorBox(ctx, pt, i, rtlHelper);
			}

			for (j = 0, jlen = lines.length; j < jlen; ++j) {
				fillLineOfText(lines[j]);
			}

			helpers.each(bodyItem.after, fillLineOfText);
		}

		// Reset back to 0 for after body
		xLinePadding = 0;

		// After body lines
		helpers.each(me.afterBody, fillLineOfText);
		pt.y -= bodySpacing; // Remove last body spacing
	}

	drawFooter(pt, ctx) {
		const me = this;
		const options = me.options;
		const footer = me.footer;
		const length = footer.length;
		let footerFontSize, i;

		if (length) {
			const rtlHelper = getRtlHelper(options.rtl, me.x, me.width);

			pt.x = getAlignedX(me, options.footerAlign);
			pt.y += options.footerMarginTop;

			ctx.textAlign = rtlHelper.textAlign(options.footerAlign);
			ctx.textBaseline = 'middle';

			footerFontSize = options.footerFontSize;

			ctx.fillStyle = options.footerFontColor;
			ctx.font = helpers.fontString(footerFontSize, options.footerFontStyle, options.footerFontFamily);

			for (i = 0; i < length; ++i) {
				ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFontSize / 2);
				pt.y += footerFontSize + options.footerSpacing;
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

			helpers.rtl.overrideTextDirection(ctx, options.textDirection);

			pt.y += options.yPadding;

			// Titles
			me.drawTitle(pt, ctx);

			// Body
			me.drawBody(pt, ctx);

			// Footer
			me.drawFooter(pt, ctx);

			helpers.rtl.restoreTextDirection(ctx, options.textDirection);

			ctx.restore();
		}
	}

	/**
	 * Handle an event
	 * @param {IEvent} e - The event to handle
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

		// Remember Last Actives
		changed = replay || !helpers._elementsEqual(active, lastActive);

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

		if (plugins.notify(chart, 'beforeTooltipDraw', [args]) === false) {
			return;
		}

		tooltip.draw(chart.ctx);

		plugins.notify(chart, 'afterTooltipDraw', [args]);
	},

	afterEvent(chart, e, replay) {
		if (chart.tooltip) {
			// If the event is replayed from `update`, we should evaluate with the final positions.
			const useFinalPosition = replay;
			chart.tooltip.handleEvent(e, useFinalPosition);
		}
	}
};
