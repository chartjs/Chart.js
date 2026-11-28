import {_lookupByKey, _rlookupByKey} from '../helpers/helpers.collection.js';
import {getRelativePosition} from '../helpers/helpers.dom.js';
import {_angleBetween, getAngleFromPoint} from '../helpers/helpers.math.js';
import {_isPointInArea, isNullOrUndef} from '../helpers/index.js';
import type PrivateChart from './core.controller.js';
import type Element from './core.element.js';
import type {
  ChartArea,
  ChartEvent,
  ChartMeta,
  InteractionItem,
  InteractionOptions,
  Point,
  VisualElement
} from '../types/index.js';

export type Chart = PrivateChart;
export type {ChartEvent, InteractionItem, InteractionOptions, Point};

type InteractionElement = Element & VisualElement & {
  skip?: boolean;
  _getAreaCenter?(area: ChartArea, useFinalPosition?: boolean): Point | null | undefined;
};

/**
 * The point to measure to for an element that knows its visible part (a bar): the centre of
 * the part inside the chart area, or null when no part is inside. Undefined for any other
 * element, which keeps the generic rule on its `x/y` or centre point.
 */
function getAreaCenter(element: InteractionElement, area: ChartArea, useFinalPosition?: boolean): Point | null | undefined {
  return element._getAreaCenter ? element._getAreaCenter(area, useFinalPosition) : undefined;
}

/** The data elements, read by the lookup helpers through their axis keys. */
type LookupTable = Record<string, number>[];

/**
 * Helper function to do binary search when possible
 * @param metaset - the dataset meta
 * @param axis - the axis mode. x|y|xy|r
 * @param value - the value to find
 * @param [intersect] - should the element intersect
 * @returns indices to search data array between
 */
function binarySearch(metaset: ChartMeta, axis: string, value: number, intersect?: boolean): {lo: number, hi: number} {
  const {controller, data, _sorted} = metaset;
  const iScale = controller._cachedMeta.iScale as ChartMeta['iScale'] & {_reversePixels?: boolean};
  const spanGaps = metaset.dataset ? metaset.dataset.options ? metaset.dataset.options.spanGaps : null : null;

  if (iScale && axis === iScale.axis && axis !== 'r' && _sorted && data.length) {
    const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
    if (!intersect) {
      const result = lookupMethod(data as unknown as LookupTable, axis, value);
      if (spanGaps) {
        const {vScale} = controller._cachedMeta;
        const {_parsed} = metaset as {_parsed: Record<string, unknown>[]};

        const distanceToDefinedLo = (_parsed
          .slice(0, result.lo + 1)
          .reverse()
          .findIndex(
            point => !isNullOrUndef(point[vScale.axis])));
        result.lo -= Math.max(0, distanceToDefinedLo);

        const distanceToDefinedHi = (_parsed
          .slice(result.hi)
          .findIndex(
            point => !isNullOrUndef(point[vScale.axis])));
        result.hi += Math.max(0, distanceToDefinedHi);
      }
      return result;
    } else if ((controller as {_sharedOptions?: unknown})._sharedOptions) {
      // _sharedOptions indicates that each element has equal options -> equal proportions
      // So we can do a ranged binary search based on the range of first element and
      // be confident to get the full range of indices that can intersect with the value.
      const el = data[0] as InteractionElement;
      const range = typeof el.getRange === 'function' && el.getRange(axis as 'x' | 'y');
      if (range) {
        const start = lookupMethod(data as unknown as LookupTable, axis, value - range);
        const end = lookupMethod(data as unknown as LookupTable, axis, value + range);
        return {lo: start.lo, hi: end.hi};
      }
    }
  }
  // Default to all elements, when binary search can not be used.
  return {lo: 0, hi: data.length - 1};
}

/**
 * Helper function to select candidate elements for interaction
 * @param chart - the chart
 * @param axis - the axis mode. x|y|xy|r
 * @param position - the point to be nearest to, in relative coordinates
 * @param handler - the callback to execute for each visible item
 * @param [intersect] - consider intersecting items
 */
function evaluateInteractionItems(
  chart: Chart,
  axis: string,
  position: Point,
  handler: (element: Element & VisualElement, datasetIndex: number, index: number) => void,
  intersect?: boolean
): void {
  const metasets = chart.getSortedVisibleDatasetMetas() as ChartMeta[];
  const value = position[axis];
  for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
    const {index, data} = metasets[i];
    const {lo, hi} = binarySearch(metasets[i], axis, value, intersect);
    for (let j = lo; j <= hi; ++j) {
      const element = data[j] as InteractionElement;
      if (!element.skip) {
        handler(element, index, j);
      }
    }
  }
}

/**
 * Get a distance metric function for two points based on the
 * axis mode setting
 * @param axis - the axis mode. x|y|xy|r
 */
function getDistanceMetricForAxis(axis: string) {
  const useX = axis.indexOf('x') !== -1;
  const useY = axis.indexOf('y') !== -1;

  return function(pt1: Point, pt2: Point) {
    const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
    const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  };
}

/**
 * Helper function to get the items that intersect the event position
 * @param chart - the chart
 * @param position - the point to be nearest to, in relative coordinates
 * @param axis - the axis mode. x|y|xy|r
 * @param [useFinalPosition] - use the element's animation target instead of current position
 * @param [includeInvisible] - include invisible points that are outside of the chart area
 * @return the nearest items
 */
function getIntersectItems(
  chart: Chart,
  position: Point,
  axis: string,
  useFinalPosition?: boolean,
  includeInvisible?: boolean
): InteractionItem[] {
  const items: InteractionItem[] = [];

  if (!includeInvisible && !chart.isPointInArea(position)) {
    return items;
  }

  const evaluationFunc = function(element: InteractionElement, datasetIndex: number, index: number) {
    if (!element.inRange(position.x, position.y, useFinalPosition)) {
      return;
    }
    if (!includeInvisible) {
      const areaCenter = getAreaCenter(element, chart.chartArea, useFinalPosition);
      const visible = areaCenter === undefined ? _isPointInArea(element, chart.chartArea, 0) : areaCenter !== null;
      if (!visible) {
        return;
      }
    }
    items.push({element, datasetIndex, index});
  };

  evaluateInteractionItems(chart, axis, position, evaluationFunc, true);
  return items;
}

/**
 * Helper function to get the items nearest to the event position for a radial chart
 * @param chart - the chart to look at elements from
 * @param position - the point to be nearest to, in relative coordinates
 * @param axis - the axes along which to measure distance
 * @param [useFinalPosition] - use the element's animation target instead of current position
 * @return the nearest items
 */
function getNearestRadialItems(chart: Chart, position: Point, axis: string, useFinalPosition?: boolean): InteractionItem[] {
  let items: InteractionItem[] = [];

  function evaluationFunc(element: InteractionElement, datasetIndex: number, index: number) {
    const {startAngle, endAngle} = element.getProps(['startAngle', 'endAngle'], useFinalPosition) as {
      startAngle: number;
      endAngle: number;
    };
    const {angle} = getAngleFromPoint(element, {x: position.x, y: position.y});

    if (_angleBetween(angle, startAngle, endAngle)) {
      items.push({element, datasetIndex, index});
    }
  }

  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}

/**
 * The point the nearest modes measure a bar by, from its `_getAreaCenter` result: the centre of its part
 * inside the chart area. A bar with no part inside (`null`) is measured to its centre with
 * `includeInvisible`, and is not a candidate (`null`) without it.
 */
function getBarMeasurePoint(
  element: InteractionElement,
  areaCenter: Point | null,
  useFinalPosition?: boolean,
  includeInvisible?: boolean
): Point | null {
  if (areaCenter) {
    return areaCenter;
  }
  return includeInvisible ? element.getCenterPoint(useFinalPosition) : null;
}

/**
 * Helper function to get the items nearest to the event position for a cartesian chart
 * @param chart - the chart to look at elements from
 * @param position - the point to be nearest to, in relative coordinates
 * @param axis - the axes along which to measure distance
 * @param [intersect] - if true, only consider items that intersect the position
 * @param [useFinalPosition] - use the element's animation target instead of current position
 * @param [includeInvisible] - include invisible points that are outside of the chart area
 * @return the nearest items
 */
function getNearestCartesianItems(
  chart: Chart,
  position: Point,
  axis: string,
  intersect?: boolean,
  useFinalPosition?: boolean,
  includeInvisible?: boolean
): InteractionItem[] {
  let items: InteractionItem[] = [];
  const distanceMetric = getDistanceMetricForAxis(axis);
  let minDistance = Number.POSITIVE_INFINITY;

  function evaluationFunc(element: InteractionElement, datasetIndex: number, index: number) {
    const inRange = element.inRange(position.x, position.y, useFinalPosition);
    if (intersect && !inRange) {
      return;
    }

    const areaCenter = getAreaCenter(element, chart.chartArea, useFinalPosition);
    if (areaCenter !== undefined) {
      // A bar (see getAreaCenter). A branch of its own: sharing the code below with it made
      // points allocate a centre object per element and pointer event.
      const barCenter = getBarMeasurePoint(element, areaCenter, useFinalPosition, includeInvisible);
      if (barCenter) {
        addItem(distanceMetric(position, barCenter), element, datasetIndex, index);
      }
      return;
    }

    const center = element.getCenterPoint(useFinalPosition);
    const pointInArea = !!includeInvisible || chart.isPointInArea(center);
    if (!pointInArea && !inRange) {
      return;
    }
    addItem(distanceMetric(position, center), element, datasetIndex, index);
  }

  function addItem(distance: number, element: InteractionElement, datasetIndex: number, index: number) {
    if (distance < minDistance) {
      items = [{element, datasetIndex, index}];
      minDistance = distance;
    } else if (distance === minDistance) {
      // Can have multiple items at the same distance in which case we sort by size
      items.push({element, datasetIndex, index});
    }
  }

  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}

/**
 * Helper function to get the items nearest to the event position considering all visible items in the chart
 * @param chart - the chart to look at elements from
 * @param position - the point to be nearest to, in relative coordinates
 * @param axis - the axes along which to measure distance
 * @param [intersect] - if true, only consider items that intersect the position
 * @param [useFinalPosition] - use the element's animation target instead of current position
 * @param [includeInvisible] - include invisible points that are outside of the chart area
 * @return the nearest items
 */
function getNearestItems(
  chart: Chart,
  position: Point,
  axis: string,
  intersect?: boolean,
  useFinalPosition?: boolean,
  includeInvisible?: boolean
): InteractionItem[] {
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return [];
  }

  return axis === 'r' && !intersect
    ? getNearestRadialItems(chart, position, axis, useFinalPosition)
    : getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible);
}

/**
 * Helper function to get the items matching along the given X or Y axis
 * @param chart - the chart to look at elements from
 * @param position - the point to be nearest to, in relative coordinates
 * @param axis - the axis to match
 * @param [intersect] - if true, only consider items that intersect the position
 * @param [useFinalPosition] - use the element's animation target instead of current position
 * @return the nearest items
 */
function getAxisItems(
  chart: Chart,
  position: Point,
  axis: 'x' | 'y',
  intersect?: boolean,
  useFinalPosition?: boolean
): InteractionItem[] {
  const items: InteractionItem[] = [];
  const rangeMethod = axis === 'x' ? 'inXRange' : 'inYRange';
  let intersectsItem = false;

  evaluateInteractionItems(chart, axis, position, (element: InteractionElement, datasetIndex: number, index: number) => {
    if (element[rangeMethod] && element[rangeMethod](position[axis], useFinalPosition)) {
      items.push({element, datasetIndex, index});
      intersectsItem = intersectsItem || element.inRange(position.x, position.y, useFinalPosition);
    }
  });

  // If we want to trigger on an intersect and we don't have any items
  // that intersect the position, return nothing
  if (intersect && !intersectsItem) {
    return [];
  }
  return items;
}

/**
 * Contains interaction related functions
 */
export default {
  // Part of the public API to facilitate developers creating their own modes
  evaluateInteractionItems,

  // Helper function for different modes
  modes: {
    /**
		 * Returns items at the same index. If the options.intersect parameter is true, we only return items if we intersect something
		 * If the options.intersect mode is false, we find the nearest item and return the items at the same index as that item
		 * @since v2.4.0
		 * @param chart - the chart we are returning items from
		 * @param e - the event we are find things at
		 * @param options - options to use
		 * @param [useFinalPosition] - use final element position (animation target)
		 * @return - items that are found
		 */
    index(chart: Chart, e: Event, options: InteractionOptions, useFinalPosition?: boolean): InteractionItem[] {
      const position = getRelativePosition(e, chart);
      // Default axis for index mode is 'x' to match old behaviour
      const axis = options.axis || 'x';
      const includeInvisible = options.includeInvisible || false;
      const items = options.intersect
        ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible)
        : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      const elements: InteractionItem[] = [];

      if (!items.length) {
        return [];
      }

      (chart.getSortedVisibleDatasetMetas() as ChartMeta[]).forEach((meta) => {
        const index = items[0].index;
        const element = meta.data[index] as InteractionElement;

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
		 * @param chart - the chart we are returning items from
		 * @param e - the event we are find things at
		 * @param options - options to use
		 * @param [useFinalPosition] - use final element position (animation target)
		 * @return - items that are found
		 */
    dataset(chart: Chart, e: Event, options: InteractionOptions, useFinalPosition?: boolean): InteractionItem[] {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || 'xy';
      const includeInvisible = options.includeInvisible || false;
      let items = options.intersect
        ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) :
        getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);

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
		 * @param chart - the chart we are returning items from
		 * @param e - the event we are find things at
		 * @param options - options to use
		 * @param [useFinalPosition] - use final element position (animation target)
		 * @return - items that are found
		 */
    point(chart: Chart, e: Event, options: InteractionOptions, useFinalPosition?: boolean): InteractionItem[] {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || 'xy';
      const includeInvisible = options.includeInvisible || false;
      return getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible);
    },

    /**
		 * nearest mode returns the element closest to the point
		 * @param chart - the chart we are returning items from
		 * @param e - the event we are find things at
		 * @param options - options to use
		 * @param [useFinalPosition] - use final element position (animation target)
		 * @return - items that are found
		 */
    nearest(chart: Chart, e: Event, options: InteractionOptions, useFinalPosition?: boolean): InteractionItem[] {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || 'xy';
      const includeInvisible = options.includeInvisible || false;
      return getNearestItems(chart, position, axis, options.intersect, useFinalPosition, includeInvisible);
    },

    /**
		 * x mode returns the elements that hit-test at the current x coordinate
		 * @param chart - the chart we are returning items from
		 * @param e - the event we are find things at
		 * @param options - options to use
		 * @param [useFinalPosition] - use final element position (animation target)
		 * @return - items that are found
		 */
    x(chart: Chart, e: Event, options: InteractionOptions, useFinalPosition?: boolean): InteractionItem[] {
      const position = getRelativePosition(e, chart);
      return getAxisItems(chart, position, 'x', options.intersect, useFinalPosition);
    },

    /**
		 * y mode returns the elements that hit-test at the current y coordinate
		 * @param chart - the chart we are returning items from
		 * @param e - the event we are find things at
		 * @param options - options to use
		 * @param [useFinalPosition] - use final element position (animation target)
		 * @return - items that are found
		 */
    y(chart: Chart, e: Event, options: InteractionOptions, useFinalPosition?: boolean): InteractionItem[] {
      const position = getRelativePosition(e, chart);
      return getAxisItems(chart, position, 'y', options.intersect, useFinalPosition);
    }
  }
};
