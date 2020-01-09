'use strict';

import helpers from '../helpers/index';
import {isNumber} from '../helpers/helpers.math';
import {_isPointInArea} from '../helpers/helpers.canvas';

/**
 * Helper function to get relative position for an event
 * @param {Event|IEvent} event - The event to get the position for
 * @param {Chart} chart - The chart
 * @returns {object} the event position
 */
function getRelativePosition(e, chart) {
	if (e.native) {
		return {
			x: e.x,
			y: e.y
		};
	}

	return helpers.dom.getRelativePosition(e, chart);
}

/**
 * Helper function to traverse all of the visible elements in the chart
 * @param {Chart} chart - the chart
 * @param {function} handler - the callback to execute for each visible item
 */
function evaluateAllVisibleItems(chart, handler) {
	const metasets = chart._getSortedVisibleDatasetMetas();
	let index, data, element;

	for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
		({index, data} = metasets[i]);
		for (let j = 0, jlen = data.length; j < jlen; ++j) {
			element = data[j];
			if (!element.skip) {
				handler(element, index, j);
			}
		}
	}
}

/**
 * Helper function to check the items at the hovered index on the index scale
 * @param {Chart} chart - the chart
 * @param {string} axis - the axis mode. x|y|xy
 * @param {object} position - the point to be nearest to
 * @param {function} handler - the callback to execute for each visible item
 * @return whether all scales were of a suitable type
 */
function evaluateItemsAtIndex(chart, axis, position, handler) {
	const metasets = chart._getSortedVisibleDatasetMetas();
	const indices = [];
	for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
		const metaset = metasets[i];
		const iScale = metaset.controller._cachedMeta.iScale;
		if (!iScale || axis !== iScale.axis || !iScale.getIndexForPixel) {
			return false;
		}
		const index = iScale.getIndexForPixel(position[axis]);
		if (!isNumber(index)) {
			return false;
		}
		indices.push(index);
	}
	// do this only after checking whether all scales are of a suitable type
	for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
		const metaset = metasets[i];
		const index = indices[i];
		const element = metaset.data[index];
		if (!element.skip) {
			handler(element, metaset.index, index);
		}
	}
	return true;
}

/**
 * Get a distance metric function for two points based on the
 * axis mode setting
 * @param {string} axis - the axis mode. x|y|xy
 */
function getDistanceMetricForAxis(axis) {
	const useX = axis.indexOf('x') !== -1;
	const useY = axis.indexOf('y') !== -1;

	return function(pt1, pt2) {
		const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
		const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
		return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
	};
}

/**
 * Helper function to get the items that intersect the event position
 * @param {Chart} chart - the chart
 * @param {object} position - the point to be nearest to
 * @param {string} axis - the axis mode. x|y|xy
 * @return {ChartElement[]} the nearest items
 */
function getIntersectItems(chart, position, axis) {
	const items = [];

	if (!_isPointInArea(position, chart.chartArea)) {
		return items;
	}

	const evaluationFunc = function(element, datasetIndex, index) {
		if (element.inRange(position.x, position.y)) {
			items.push({element, datasetIndex, index});
		}
	};

	const optimized = evaluateItemsAtIndex(chart, axis, position, evaluationFunc);
	if (optimized) {
		return items;
	}

	evaluateAllVisibleItems(chart, evaluationFunc);
	return items;
}

/**
 * Helper function to get the items nearest to the event position considering all visible items in the chart
 * @param {Chart} chart - the chart to look at elements from
 * @param {object} position - the point to be nearest to
 * @param {function} axis - the axes along which to measure distance
 * @param {boolean} intersect - if true, only consider items that intersect the position
 * @return {ChartElement[]} the nearest items
 */
function getNearestItems(chart, position, axis, intersect) {
	const distanceMetric = getDistanceMetricForAxis(axis);
	let minDistance = Number.POSITIVE_INFINITY;
	let items = [];

	if (!_isPointInArea(position, chart.chartArea)) {
		return items;
	}

	const evaluationFunc = function(element, datasetIndex, index) {
		if (intersect && !element.inRange(position.x, position.y)) {
			return;
		}

		const center = element.getCenterPoint();
		const distance = distanceMetric(position, center);
		if (distance < minDistance) {
			items = [{element, datasetIndex, index}];
			minDistance = distance;
		} else if (distance === minDistance) {
			// Can have multiple items at the same distance in which case we sort by size
			items.push({element, datasetIndex, index});
		}
	};

	const optimized = evaluateItemsAtIndex(chart, axis, position, evaluationFunc);
	if (optimized) {
		return items;
	}

	evaluateAllVisibleItems(chart, evaluationFunc);
	return items;
}

/**
 * @interface IInteractionOptions
 */
/**
 * If true, only consider items that intersect the point
 * @name IInterfaceOptions#boolean
 * @type Boolean
 */

/**
 * Contains interaction related functions
 * @namespace Chart.Interaction
 */
export default {
	// Helper function for different modes
	modes: {
		/**
		 * Returns items at the same index. If the options.intersect parameter is true, we only return items if we intersect something
		 * If the options.intersect mode is false, we find the nearest item and return the items at the same index as that item
		 * @function Chart.Interaction.modes.index
		 * @since v2.4.0
		 * @param {Chart} chart - the chart we are returning items from
		 * @param {Event} e - the event we are find things at
		 * @param {IInteractionOptions} options - options to use during interaction
		 * @return {Object[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		index: function(chart, e, options) {
			const position = getRelativePosition(e, chart);
			// Default axis for index mode is 'x' to match old behaviour
			const axis = options.axis || 'x';
			const items = options.intersect ? getIntersectItems(chart, position, axis) : getNearestItems(chart, position, axis);
			const elements = [];

			if (!items.length) {
				return [];
			}

			chart._getSortedVisibleDatasetMetas().forEach(function(meta) {
				const index = items[0].index;
				const element = meta.data[index];

				// don't count items that are skipped (null data)
				if (element && !element.skip) {
					elements.push({element, datasetIndex: meta.index, index});
				}
			});

			return elements;
		},

		/**
		 * Returns items in the same dataset. If the options.intersect parameter is true, we only return items if we intersect something
		 * If the options.intersect is false, we find the nearest item and return the items in that dataset
		 * @function Chart.Interaction.modes.dataset
		 * @param {Chart} chart - the chart we are returning items from
		 * @param {Event} e - the event we are find things at
		 * @param {IInteractionOptions} options - options to use during interaction
		 * @return {Object[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		dataset: function(chart, e, options) {
			const position = getRelativePosition(e, chart);
			const axis = options.axis || 'xy';
			let items = options.intersect ? getIntersectItems(chart, position, axis) : getNearestItems(chart, position, axis);

			if (items.length > 0) {
				items = [{datasetIndex: items[0].datasetIndex}]; // when mode: 'dataset' we only need to return datasetIndex
			}

			return items;
		},

		/**
		 * Point mode returns all elements that hit test based on the event position
		 * of the event
		 * @function Chart.Interaction.modes.intersect
		 * @param {Chart} chart - the chart we are returning items from
		 * @param {Event} e - the event we are find things at
		 * @param {IInteractionOptions} options - options to use
		 * @return {Object[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		point: function(chart, e, options) {
			const position = getRelativePosition(e, chart);
			const axis = options.axis || 'xy';
			return getIntersectItems(chart, position, axis);
		},

		/**
		 * nearest mode returns the element closest to the point
		 * @function Chart.Interaction.modes.intersect
		 * @param {Chart} chart - the chart we are returning items from
		 * @param {Event} e - the event we are find things at
		 * @param {IInteractionOptions} options - options to use
		 * @return {Object[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		nearest: function(chart, e, options) {
			const position = getRelativePosition(e, chart);
			const axis = options.axis || 'xy';
			return getNearestItems(chart, position, axis, options.intersect);
		},

		/**
		 * x mode returns the elements that hit-test at the current x coordinate
		 * @function Chart.Interaction.modes.x
		 * @param {Chart} chart - the chart we are returning items from
		 * @param {Event} e - the event we are find things at
		 * @param {IInteractionOptions} options - options to use
		 * @return {Object[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		x: function(chart, e, options) {
			const position = getRelativePosition(e, chart);
			const items = [];
			let intersectsItem = false;

			evaluateAllVisibleItems(chart, function(element, datasetIndex, index) {
				if (element.inXRange(position.x)) {
					items.push({element, datasetIndex, index});
				}

				if (element.inRange(position.x, position.y)) {
					intersectsItem = true;
				}
			});

			// If we want to trigger on an intersect and we don't have any items
			// that intersect the position, return nothing
			if (options.intersect && !intersectsItem) {
				return [];
			}
			return items;
		},

		/**
		 * y mode returns the elements that hit-test at the current y coordinate
		 * @function Chart.Interaction.modes.y
		 * @param {Chart} chart - the chart we are returning items from
		 * @param {Event} e - the event we are find things at
		 * @param {IInteractionOptions} options - options to use
		 * @return {Object[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		y: function(chart, e, options) {
			const position = getRelativePosition(e, chart);
			const items = [];
			let intersectsItem = false;

			evaluateAllVisibleItems(chart, function(element, datasetIndex, index) {
				if (element.inYRange(position.y)) {
					items.push({element, datasetIndex, index});
				}

				if (element.inRange(position.x, position.y)) {
					intersectsItem = true;
				}
			});

			// If we want to trigger on an intersect and we don't have any items
			// that intersect the position, return nothing
			if (options.intersect && !intersectsItem) {
				return [];
			}
			return items;
		}
	}
};
