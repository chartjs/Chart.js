import {_limitValue, _lookupByKey, isNullOrUndef, resolve} from '../helpers/index.js';

function lttbDecimation(data, start, count, availableWidth, options) {
  /**
   * Implementation of the Largest Triangle Three Buckets algorithm.
   *
   * This implementation is based on the original implementation by Sveinn Steinarsson
   * in https://github.com/sveinn-steinarsson/flot-downsample/blob/master/jquery.flot.downsample.js
   *
   * The original implementation is MIT licensed.
   */
  const samples = options.samples || availableWidth;
  // There are less points than the threshold, returning the whole array
  if (samples >= count) {
    return data.slice(start, start + count);
  }

  const decimated = [];

  const bucketWidth = (count - 2) / (samples - 2);
  let sampledIndex = 0;
  const endIndex = start + count - 1;
  // Starting from offset
  let a = start;
  let i, maxAreaPoint, maxArea, area, nextA;

  decimated[sampledIndex++] = data[a];

  for (i = 0; i < samples - 2; i++) {
    let avgX = 0;
    let avgY = 0;
    let j;

    // Adding offset
    const avgRangeStart = Math.floor((i + 1) * bucketWidth) + 1 + start;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketWidth) + 1, count) + start;
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j].x;
      avgY += data[j].y;
    }

    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // Adding offset
    const rangeOffs = Math.floor(i * bucketWidth) + 1 + start;
    const rangeTo = Math.min(Math.floor((i + 1) * bucketWidth) + 1, count) + start;
    const {x: pointAx, y: pointAy} = data[a];

    // Note that this is changed from the original algorithm which initializes these
    // values to 1. The reason for this change is that if the area is small, nextA
    // would never be set and thus a crash would occur in the next loop as `a` would become
    // `undefined`. Since the area is always positive, but could be 0 in the case of a flat trace,
    // initializing with a negative number is the correct solution.
    maxArea = area = -1;

    for (j = rangeOffs; j < rangeTo; j++) {
      area = 0.5 * Math.abs(
        (pointAx - avgX) * (data[j].y - pointAy) -
        (pointAx - data[j].x) * (avgY - pointAy)
      );

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j];
        nextA = j;
      }
    }

    decimated[sampledIndex++] = maxAreaPoint;
    a = nextA;
  }

  // Include the last point
  decimated[sampledIndex++] = data[endIndex];

  return decimated;
}

function minMaxDecimation(data, start, count, availableWidth) {
  let avgX = 0;
  let countX = 0;
  let i, point, x, y, prevX, minIndex, maxIndex, startIndex, minY, maxY;
  const decimated = [];
  const endIndex = start + count - 1;

  const xMin = data[start].x;
  const xMax = data[endIndex].x;
  const dx = xMax - xMin;

  for (i = start; i < start + count; ++i) {
    point = data[i];
    x = (point.x - xMin) / dx * availableWidth;
    y = point.y;
    const truncX = x | 0;

    if (truncX === prevX) {
      // Determine `minY` / `maxY` and `avgX` while we stay within same x-position
      if (y < minY) {
        minY = y;
        minIndex = i;
      } else if (y > maxY) {
        maxY = y;
        maxIndex = i;
      }
      // For first point in group, countX is `0`, so average will be `x` / 1.
      // Use point.x here because we're computing the average data `x` value
      avgX = (countX * avgX + point.x) / ++countX;
    } else {
      // Push up to 4 points, 3 for the last interval and the first point for this interval
      const lastIndex = i - 1;

      if (!isNullOrUndef(minIndex) && !isNullOrUndef(maxIndex)) {
        // The interval is defined by 4 points: start, min, max, end.
        // The starting point is already considered at this point, so we need to determine which
        // of the other points to add. We need to sort these points to ensure the decimated data
        // is still sorted and then ensure there are no duplicates.
        const intermediateIndex1 = Math.min(minIndex, maxIndex);
        const intermediateIndex2 = Math.max(minIndex, maxIndex);

        if (intermediateIndex1 !== startIndex && intermediateIndex1 !== lastIndex) {
          decimated.push({
            ...data[intermediateIndex1],
            x: avgX,
          });
        }
        if (intermediateIndex2 !== startIndex && intermediateIndex2 !== lastIndex) {
          decimated.push({
            ...data[intermediateIndex2],
            x: avgX
          });
        }
      }

      // lastIndex === startIndex will occur when a range has only 1 point which could
      // happen with very uneven data
      if (i > 0 && lastIndex !== startIndex) {
        // Last point in the previous interval
        decimated.push(data[lastIndex]);
      }

      // Start of the new interval
      decimated.push(point);
      prevX = truncX;
      countX = 0;
      minY = maxY = y;
      minIndex = maxIndex = startIndex = i;
    }
  }

  return decimated;
}

function cleanDecimatedDataset(dataset) {
  if (dataset._decimated) {
    const data = dataset._data;
    delete dataset._decimated;
    delete dataset._data;
    Object.defineProperty(dataset, 'data', {value: data});
  }
}

function cleanDecimatedData(chart) {
  chart.data.datasets.forEach((dataset) => {
    cleanDecimatedDataset(dataset);
  });
}

function getStartAndCountOfVisiblePointsSimplified(meta, points) {
  const pointCount = points.length;

  let start = 0;
  let count;

  const {iScale} = meta;
  const {min, max, minDefined, maxDefined} = iScale.getUserBounds();

  if (minDefined) {
    start = _limitValue(_lookupByKey(points, iScale.axis, min).lo, 0, pointCount - 1);
  }
  if (maxDefined) {
    count = _limitValue(_lookupByKey(points, iScale.axis, max).hi + 1, start, pointCount) - start;
  } else {
    count = pointCount - start;
  }

  return {start, count};
}

export default {
  id: 'decimation',

  defaults: {
    algorithm: 'min-max',
    enabled: false,
  },

  beforeElementsUpdate: (chart, args, options) => {
    if (!options.enabled) {
      // The decimation plugin may have been previously enabled. Need to remove old `dataset._data` handlers
      cleanDecimatedData(chart);
      return;
    }

    // Assume the entire chart is available to show a few more points than needed
    const availableWidth = chart.width;

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const {_data, indexAxis} = dataset;
      const meta = chart.getDatasetMeta(datasetIndex);
      const data = _data || dataset.data;

      if (resolve([indexAxis, chart.options.indexAxis]) === 'y') {
        // Decimation is only supported for lines that have an X indexAxis
        return;
      }

      if (!meta.controller.supportsDecimation) {
        // Only line datasets are supported
        return;
      }

      const xAxis = chart.scales[meta.xAxisID];
      if (xAxis.type !== 'linear' && xAxis.type !== 'time') {
        // Only linear interpolation is supported
        return;
      }

      if (chart.options.parsing) {
        // Plugin only supports data that does not need parsing
        return;
      }

      let {start, count} = getStartAndCountOfVisiblePointsSimplified(meta, data);
      const threshold = options.threshold || 4 * availableWidth;
      if (count <= threshold) {
        // No decimation is required until we are above this threshold
        cleanDecimatedDataset(dataset);
        return;
      }

      if (isNullOrUndef(_data)) {
        // First time we are seeing this dataset
        // We override the 'data' property with a setter that stores the
        // raw data in _data, but reads the decimated data from _decimated
        dataset._data = data;
        delete dataset.data;
        Object.defineProperty(dataset, 'data', {
          configurable: true,
          enumerable: true,
          get: function() {
            return this._decimated;
          },
          set: function(d) {
            this._data = d;
          }
        });
      }

      // Point the chart to the decimated data
      let decimated;
      switch (options.algorithm) {
      case 'lttb':
        decimated = lttbDecimation(data, start, count, availableWidth, options);
        break;
      case 'min-max':
        decimated = minMaxDecimation(data, start, count, availableWidth);
        break;
      default:
        throw new Error(`Unsupported decimation algorithm '${options.algorithm}'`);
      }

      dataset._decimated = decimated;
    });
  },

  destroy(chart) {
    cleanDecimatedData(chart);
  }
};
