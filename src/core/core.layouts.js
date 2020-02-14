import defaults from './core.defaults';
import {each} from '../helpers/helpers.core';
import {toPadding} from '../helpers/helpers.options';

/**
 * @typedef { import("./core.controller").default } Chart
 */

const STATIC_POSITIONS = ['left', 'top', 'right', 'bottom'];

function filterByPosition(array, position) {
	return array.filter(v => v.pos === position);
}

function filterDynamicPositionByAxis(array, axis) {
	return array.filter(v => STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis);
}

function sortByWeight(array, reverse) {
	return array.sort((a, b) => {
		const v0 = reverse ? b : a;
		const v1 = reverse ? a : b;
		return v0.weight === v1.weight ?
			v0.index - v1.index :
			v0.weight - v1.weight;
	});
}

function wrapBoxes(boxes) {
	const layoutBoxes = [];
	let i, ilen, box;

	for (i = 0, ilen = (boxes || []).length; i < ilen; ++i) {
		box = boxes[i];
		layoutBoxes.push({
			index: i,
			box,
			pos: box.position,
			horizontal: box.isHorizontal(),
			weight: box.weight
		});
	}
	return layoutBoxes;
}

function setLayoutDims(layouts, params) {
	let i, ilen, layout;
	for (i = 0, ilen = layouts.length; i < ilen; ++i) {
		layout = layouts[i];
		// store width used instead of chartArea.w in fitBoxes
		layout.width = layout.horizontal
			? layout.box.fullWidth && params.availableWidth
			: params.vBoxMaxWidth;
		// store height used instead of chartArea.h in fitBoxes
		layout.height = layout.horizontal && params.hBoxMaxHeight;
	}
}

function buildLayoutBoxes(boxes) {
	const layoutBoxes = wrapBoxes(boxes);
	const left = sortByWeight(filterByPosition(layoutBoxes, 'left'), true);
	const right = sortByWeight(filterByPosition(layoutBoxes, 'right'));
	const top = sortByWeight(filterByPosition(layoutBoxes, 'top'), true);
	const bottom = sortByWeight(filterByPosition(layoutBoxes, 'bottom'));
	const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, 'x');
	const centerVertical = filterDynamicPositionByAxis(layoutBoxes, 'y');

	return {
		leftAndTop: left.concat(top),
		rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
		chartArea: filterByPosition(layoutBoxes, 'chartArea'),
		vertical: left.concat(right).concat(centerVertical),
		horizontal: top.concat(bottom).concat(centerHorizontal)
	};
}

function getCombinedMax(maxPadding, chartArea, a, b) {
	return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]);
}

function updateDims(chartArea, params, layout) {
	const box = layout.box;
	const maxPadding = chartArea.maxPadding;

	if (layout.size) {
		// this layout was already counted for, lets first reduce old size
		chartArea[layout.pos] -= layout.size;
	}
	layout.size = layout.horizontal ? box.height : box.width;
	chartArea[layout.pos] += layout.size;

	if (box.getPadding) {
		const boxPadding = box.getPadding();
		maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
		maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
		maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
		maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
	}

	const newWidth = params.outerWidth - getCombinedMax(maxPadding, chartArea, 'left', 'right');
	const newHeight = params.outerHeight - getCombinedMax(maxPadding, chartArea, 'top', 'bottom');

	if (newWidth !== chartArea.w || newHeight !== chartArea.h) {
		chartArea.w = newWidth;
		chartArea.h = newHeight;

		// return true if chart area changed in layout's direction
		return layout.horizontal ? newWidth !== chartArea.w : newHeight !== chartArea.h;
	}
}

function handleMaxPadding(chartArea) {
	const maxPadding = chartArea.maxPadding;

	function updatePos(pos) {
		const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
		chartArea[pos] += change;
		return change;
	}
	chartArea.y += updatePos('top');
	chartArea.x += updatePos('left');
	updatePos('right');
	updatePos('bottom');
}

function getMargins(horizontal, chartArea) {
	const maxPadding = chartArea.maxPadding;

	function marginForPositions(positions) {
		const margin = {left: 0, top: 0, right: 0, bottom: 0};
		positions.forEach((pos) => {
			margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
		});
		return margin;
	}

	return horizontal
		? marginForPositions(['left', 'right'])
		: marginForPositions(['top', 'bottom']);
}

function fitBoxes(boxes, chartArea, params) {
	const refitBoxes = [];
	let i, ilen, layout, box, refit, changed;

	for (i = 0, ilen = boxes.length; i < ilen; ++i) {
		layout = boxes[i];
		box = layout.box;

		box.update(
			layout.width || chartArea.w,
			layout.height || chartArea.h,
			getMargins(layout.horizontal, chartArea)
		);
		if (updateDims(chartArea, params, layout)) {
			changed = true;
			if (refitBoxes.length) {
				// Dimensions changed and there were non full width boxes before this
				// -> we have to refit those
				refit = true;
			}
		}
		if (!box.fullWidth) { // fullWidth boxes don't need to be re-fitted in any case
			refitBoxes.push(layout);
		}
	}

	return refit ? fitBoxes(refitBoxes, chartArea, params) || changed : changed;
}

function placeBoxes(boxes, chartArea, params) {
	const userPadding = params.padding;
	let x = chartArea.x;
	let y = chartArea.y;
	let i, ilen, layout, box;

	for (i = 0, ilen = boxes.length; i < ilen; ++i) {
		layout = boxes[i];
		box = layout.box;
		if (layout.horizontal) {
			box.left = box.fullWidth ? userPadding.left : chartArea.left;
			box.right = box.fullWidth ? params.outerWidth - userPadding.right : chartArea.left + chartArea.w;
			box.top = y;
			box.bottom = y + box.height;
			box.width = box.right - box.left;
			y = box.bottom;
		} else {
			box.left = x;
			box.right = x + box.width;
			box.top = chartArea.top;
			box.bottom = chartArea.top + chartArea.h;
			box.height = box.bottom - box.top;
			x = box.right;
		}
	}

	chartArea.x = x;
	chartArea.y = y;
}

defaults.set('layout', {
	padding: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	}
});

/**
 * @interface ILayoutItem
 * @typedef {object} ILayoutItem
 * @prop {string} position - The position of the item in the chart layout. Possible values are
 * 'left', 'top', 'right', 'bottom', and 'chartArea'
 * @prop {number} weight - The weight used to sort the item. Higher weights are further away from the chart area
 * @prop {boolean} fullWidth - if true, and the item is horizontal, then push vertical boxes down
 * @prop {function} isHorizontal - returns true if the layout item is horizontal (ie. top or bottom)
 * @prop {function} update - Takes two parameters: width and height. Returns size of item
 * @prop {function} draw - Draws the element
 * @prop {function} [getPadding] -  Returns an object with padding on the edges
 * @prop {number} width - Width of item. Must be valid after update()
 * @prop {number} height - Height of item. Must be valid after update()
 * @prop {number} left - Left edge of the item. Set by layout system and cannot be used in update
 * @prop {number} top - Top edge of the item. Set by layout system and cannot be used in update
 * @prop {number} right - Right edge of the item. Set by layout system and cannot be used in update
 * @prop {number} bottom - Bottom edge of the item. Set by layout system and cannot be used in update
 */

// The layout service is very self explanatory.  It's responsible for the layout within a chart.
// Scales, Legends and Plugins all rely on the layout service and can easily register to be placed anywhere they need
// It is this service's responsibility of carrying out that layout.
export default {
	defaults: {},

	/**
	 * Register a box to a chart.
	 * A box is simply a reference to an object that requires layout. eg. Scales, Legend, Title.
	 * @param {Chart} chart - the chart to use
	 * @param {ILayoutItem} item - the item to add to be layed out
	 */
	addBox(chart, item) {
		if (!chart.boxes) {
			chart.boxes = [];
		}

		// initialize item with default values
		item.fullWidth = item.fullWidth || false;
		item.position = item.position || 'top';
		item.weight = item.weight || 0;
		// @ts-ignore
		item._layers = item._layers || function() {
			return [{
				z: 0,
				draw(chartArea) {
					item.draw(chartArea);
				}
			}];
		};

		chart.boxes.push(item);
	},

	/**
	 * Remove a layoutItem from a chart
	 * @param {Chart} chart - the chart to remove the box from
	 * @param {ILayoutItem} layoutItem - the item to remove from the layout
	 */
	removeBox(chart, layoutItem) {
		const index = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
		if (index !== -1) {
			chart.boxes.splice(index, 1);
		}
	},

	/**
	 * Sets (or updates) options on the given `item`.
	 * @param {Chart} chart - the chart in which the item lives (or will be added to)
	 * @param {ILayoutItem} item - the item to configure with the given options
	 * @param {object} options - the new item options.
	 */
	configure(chart, item, options) {
		const props = ['fullWidth', 'position', 'weight'];
		const ilen = props.length;
		let i = 0;
		let prop;

		for (; i < ilen; ++i) {
			prop = props[i];
			if (Object.prototype.hasOwnProperty.call(options, prop)) {
				item[prop] = options[prop];
			}
		}
	},

	/**
	 * Fits boxes of the given chart into the given size by having each box measure itself
	 * then running a fitting algorithm
	 * @param {Chart} chart - the chart
	 * @param {number} width - the width to fit into
	 * @param {number} height - the height to fit into
	 */
	update(chart, width, height) {
		if (!chart) {
			return;
		}

		const layoutOptions = chart.options.layout || {};
		const padding = toPadding(layoutOptions.padding);

		const availableWidth = width - padding.width;
		const availableHeight = height - padding.height;
		const boxes = buildLayoutBoxes(chart.boxes);
		const verticalBoxes = boxes.vertical;
		const horizontalBoxes = boxes.horizontal;

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

		const params = Object.freeze({
			outerWidth: width,
			outerHeight: height,
			padding,
			availableWidth,
			vBoxMaxWidth: availableWidth / 2 / verticalBoxes.length,
			hBoxMaxHeight: availableHeight / 2
		});
		const chartArea = Object.assign({
			maxPadding: Object.assign({}, padding),
			w: availableWidth,
			h: availableHeight,
			x: padding.left,
			y: padding.top
		}, padding);

		setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);

		// First fit vertical boxes
		fitBoxes(verticalBoxes, chartArea, params);

		// Then fit horizontal boxes
		if (fitBoxes(horizontalBoxes, chartArea, params)) {
			// if the area changed, re-fit vertical boxes
			fitBoxes(verticalBoxes, chartArea, params);
		}

		handleMaxPadding(chartArea);

		// Finally place the boxes to correct coordinates
		placeBoxes(boxes.leftAndTop, chartArea, params);

		// Move to opposite side of chart
		chartArea.x += chartArea.w;
		chartArea.y += chartArea.h;

		placeBoxes(boxes.rightAndBottom, chartArea, params);

		chart.chartArea = {
			left: chartArea.left,
			top: chartArea.top,
			right: chartArea.left + chartArea.w,
			bottom: chartArea.top + chartArea.h,
			height: chartArea.h,
			width: chartArea.w,
		};

		// Finally update boxes in chartArea (radial scale for example)
		each(boxes.chartArea, (layout) => {
			const box = layout.box;
			Object.assign(box, chart.chartArea);
			box.update(chartArea.w, chartArea.h);
		});
	}
};
