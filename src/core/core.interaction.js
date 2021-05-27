import {_isPointInArea} from '../helpers/helpers.canvas';
import {_lookupByKey, _rlookupByKey} from '../helpers/helpers.collection';
import {getRelativePosition as helpersGetRelativePosition} from '../helpers/helpers.dom';

/**
 * @typedef { import("./core.controller").default } Chart
 * @typedef { import("../platform/platform.base").ChartEvent } ChartEvent
 * @typedef {{axis?: string, intersect?: boolean}} InteractionOptions
 * @typedef {{datasetIndex: number, index: number, element: import("./core.element").default}} InteractionItem
 */

/**
 * Helper function to get relative position for an event
 * @param {Event|ChartEvent} e - The event to get the position for
 * @param {Chart} chart - The chart
 * @returns {object} the event position
 */
function getRelativePosition(e, chart) {
  if ('native' in e) {
    return {
      x: e.x,
      y: e.y
    };
  }

  return helpersGetRelativePosition(e, chart);
}

/**
 * Helper function to traverse all of the visible elements in the chart
 * @param {Chart} chart - the chart
 * @param {function} handler - the callback to execute for each visible item
 */
function evaluateAllVisibleItems(chart, handler) {
  const metasets = chart.getSortedVisibleDatasetMetas();
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
 * Helper function to do binary search when possible
 * @param {object} metaset - the dataset meta
 * @param {string} axis - the axis mide. x|y|xy
 * @param {number} value - the value to find
 * @param {boolean} [intersect] - should the element intersect
 * @returns {{lo:number, hi:number}} indices to search data array between
 */
function binarySearch(metaset, axis, value, intersect) {
  const {controller, data, _sorted} = metaset;
  const iScale = controller._cachedMeta.iScale;
  if (iScale && axis === iScale.axis && _sorted && data.length) {
    const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
    if (!intersect) {
      return lookupMethod(data, axis, value);
    } else if (controller._sharedOptions) {
      // _sharedOptions indicates that each element has equal options -> equal proportions
      // So we can do a ranged binary search based on the range of first element and
      // be confident to get the full range of indices that can intersect with the value.
      const el = data[0];
      const range = typeof el.getRange === 'function' && el.getRange(axis);
      if (range) {
        const start = lookupMethod(data, axis, value - range);
        const end = lookupMethod(data, axis, value + range);
        return {lo: start.lo, hi: end.hi};
      }
    }
  }
  // Default to all elements, when binary search can not be used.
  return {lo: 0, hi: data.length - 1};
}

/**
 * Helper function to get items using binary search, when the data is sorted.
 * @param {Chart} chart - the chart
 * @param {string} axis - the axis mode. x|y|xy
 * @param {object} position - the point to be nearest to
 * @param {function} handler - the callback to execute for each visible item
 * @param {boolean} [intersect] - consider intersecting items
 */
function optimizedEvaluateItems(chart, axis, position, handler, intersect) {
  const metasets = chart.getSortedVisibleDatasetMetas();
  const value = position[axis];
  for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
    const {index, data} = metasets[i];
    const {lo, hi} = binarySearch(metasets[i], axis, value, intersect);
    for (let j = lo; j <= hi; ++j) {
      const element = data[j];
      if (!element.skip) {
        handler(element, index, j);
      }
    }
  }
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
 * @param {boolean} [useFinalPosition] - use the element's animation target instead of current position
 * @return {InteractionItem[]} the nearest items
 */
function getIntersectItems(chart, position, axis, useFinalPosition) {
  const items = [];

  if (!_isPointInArea(position, chart.chartArea, chart._minPadding)) {
    return items;
  }

  const evaluationFunc = function(element, datasetIndex, index) {
    if (element.inRange(position.x, position.y, useFinalPosition)) {
      items.push({element, datasetIndex, index});
    }
  };

  optimizedEvaluateItems(chart, axis, position, evaluationFunc, true);
  return items;
}

/**
 * Helper function to get the items nearest to the event position considering all visible items in the chart
 * @param {Chart} chart - the chart to look at elements from
 * @param {object} position - the point to be nearest to
 * @param {string} axis - the axes along which to measure distance
 * @param {boolean} [intersect] - if true, only consider items that intersect the position
 * @param {boolean} [useFinalPosition] - use the elements animation target instead of current position
 * @return {InteractionItem[]} the nearest items
 */
function getNearestItems(chart, position, axis, intersect, useFinalPosition) {
  const distanceMetric = getDistanceMetricForAxis(axis);
  let minDistance = Number.POSITIVE_INFINITY;
  let items = [];

  if (!_isPointInArea(position, chart.chartArea, chart._minPadding)) {
    return items;
  }

  const evaluationFunc = function(element, datasetIndex, index) {
    if (intersect && !element.inRange(position.x, position.y, useFinalPosition)) {
      return;
    }

    const center = element.getCenterPoint(useFinalPosition);
    if (!_isPointInArea(center, chart.chartArea, chart._minPadding)) {
      return;
    }
    const distance = distanceMetric(position, center);
    if (distance < minDistance) {
      items = [{element, datasetIndex, index}];
      minDistance = distance;
    } else if (distance === minDistance) {
      // Can have multiple items at the same distance in which case we sort by size
      items.push({element, datasetIndex, index});
    }
  };

  optimizedEvaluateItems(chart, axis, position, evaluationFunc);
  return items;
}

function getAxisItems(chart, e, options, useFinalPosition) {
  const position = getRelativePosition(e, chart);
  const items = [];
  const axis = options.axis;
  const rangeMethod = axis === 'x' ? 'inXRange' : 'inYRange';
  let intersectsItem = false;

  evaluateAllVisibleItems(chart, (element, datasetIndex, index) => {
    if (element[rangeMethod](position[axis], useFinalPosition)) {
      items.push({element, datasetIndex, index});
    }

    if (element.inRange(position.x, position.y, useFinalPosition)) {
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
		 * @param {InteractionOptions} options - options to use
		 * @param {boolean} [useFinalPosition] - use final element position (animation target)
		 * @return {InteractionItem[]} - items that are found
		 */
    index(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      // Default axis for index mode is 'x' to match old behaviour
      const axis = options.axis || 'x';
      const items = options.intersect
        ? getIntersectItems(chart, position, axis, useFinalPosition)
        : getNearestItems(chart, position, axis, false, useFinalPosition);
      const elements = [];

      if (!items.length) {
        return [];
      }

      chart.getSortedVisibleDatasetMetas().forEach((meta) => {
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
		 * @param {InteractionOptions} options - options to use
		 * @param {boolean} [useFinalPosition] - use final element position (animation target)
		 * @return {InteractionItem[]} - items that are found
		 */
    dataset(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || 'xy';
      let items = options.intersect
        ? getIntersectItems(chart, position, axis, useFinalPosition) :
        getNearestItems(chart, position, axis, false, useFinalPosition);

      if (items.length > 0) {
        const datasetIndex = items[0].datasetIndex;
        const data = chart.getDatasetMeta(datasetIndex).data;
        items = [];
        for (let i = 0; i < data.length; ++i) {
          items.push({element: data[i], datasetIndex, index: i});
        }
      }

      return items;
    },

    /**
		 * Point mode returns all elements that hit test based on the event position
		 * of the event
		 * @function Chart.Interaction.modes.intersect
		 * @param {Chart} chart - the chart we are returning items from
		 * @param {Event} e - the event we are find things at
		 * @param {InteractionOptions} options - options to use
		 * @param {boolean} [useFinalPosition] - use final element position (animation target)
		 * @return {InteractionItem[]} - items that are found
		 */
    point(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || 'xy';
      return getIntersectItems(chart, position, axis, useFinalPosition);
    },

    /**
		 * nearest mode returns the element closest to the point
		 * @function Chart.Interaction.modes.intersect
		 * @param {Chart} chart - the chart we are returning items from
		 * @param {Event} e - the event we are find things at
		 * @param {InteractionOptions} options - options to use
		 * @param {boolean} [useFinalPosition] - use final element position (animation target)
		 * @return {InteractionItem[]} - items that are found
		 */
    nearest(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || 'xy';
      return getNearestItems(chart, position, axis, options.intersect, useFinalPosition);
    },

    /**
		 * x mode returns the elements that hit-test at the current x coordinate
		 * @function Chart.Interaction.modes.x
		 * @param {Chart} chart - the chart we are returning items from
		 * @param {Event} e - the event we are find things at
		 * @param {InteractionOptions} options - options to use
		 * @param {boolean} [useFinalPosition] - use final element position (animation target)
		 * @return {InteractionItem[]} - items that are found
		 */
    x(chart, e, options, useFinalPosition) {
      options.axis = 'x';
      return getAxisItems(chart, e, options, useFinalPosition);
    },

    /**
		 * y mode returns the elements that hit-test at the current y coordinate
		 * @function Chart.Interaction.modes.y
		 * @param {Chart} chart - the chart we are returning items from
		 * @param {Event} e - the event we are find things at
		 * @param {InteractionOptions} options - options to use
		 * @param {boolean} [useFinalPosition] - use final element position (animation target)
		 * @return {InteractionItem[]} - items that are found
		 */
    y(chart, e, options, useFinalPosition) {
      options.axis = 'y';
      return getAxisItems(chart, e, options, useFinalPosition);
    }
  }
};
