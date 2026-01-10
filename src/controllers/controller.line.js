import DatasetController from '../core/core.datasetController.js';
import {isNullOrUndef} from '../helpers/index.js';
import {isNumber} from '../helpers/helpers.math.js';
import {_getStartAndCountOfVisiblePoints, _scaleRangesChanged} from '../helpers/helpers.extras.js';

export default class LineController extends DatasetController {

  static id = 'line';

  /**
   * @type {any}
   */
  static defaults = {
    datasetElementType: 'line',
    dataElementType: 'point',

    showLine: true,
    spanGaps: false,
  };

  /**
   * @type {any}
   */
  static overrides = {
    scales: {
      _index_: {
        type: 'category',
      },
      _value_: {
        type: 'linear',
      },
    }
  };

  initialize() {
    this.enableOptionSharing = true;
    this.supportsDecimation = true;
    super.initialize();
  }

  update(mode) {
    const meta = this._cachedMeta;
    const {dataset: line, data: points = [], _dataset} = meta;
    // @ts-ignore
    const animationsDisabled = this.chart._animationsDisabled;
    let {start, count} = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);

    if (_scaleRangesChanged(meta)) {
      start = 0;
      count = points.length;
    }

    ({start, count} = this._includeBoundaryPoints(meta, start, count));

    this._drawStart = start;
    this._drawCount = count;

    // Update Line
    line._chart = this.chart;
    line._datasetIndex = this.index;
    line._decimated = !!_dataset._decimated;
    line.points = points;

    const options = this.resolveDatasetElementOptions(mode);
    if (!this.options.showLine) {
      options.borderWidth = 0;
    }
    options.segment = this.options.segment;
    this.updateElement(line, undefined, {
      animated: !animationsDisabled,
      options
    }, mode);

    // Update Points
    this.updateElements(points, start, count, mode);
  }

  _includeBoundaryPoints(meta, start, count) {
    const {iScale, _parsed} = meta;
    const {min, max, axis: iAxis} = iScale;

    if (!_parsed?.length || !isNumber(min) || !isNumber(max)) {
      return {start, count};
    }

    const length = _parsed.length;

    // Find the largest value < min (beforeIndex) using binary search.
    let beforeIndex = -1;
    let beforeValue = -Infinity;
    {
      let low = 0;
      let high = length - 1;
      while (low <= high) {
        let mid = (low + high) >> 1;
        let value = _parsed[mid][iAxis];

        // If value is not numeric, search outward from mid to find a nearby numeric value.
        if (!isNumber(value)) {
          let left = mid - 1;
          let right = mid + 1;
          let found = false;
          while (left >= low || right <= high) {
            if (left >= low) {
              const lv = _parsed[left][iAxis];
              if (isNumber(lv)) {
                value = lv;
                mid = left;
                found = true;
                break;
              }
              left--;
            }
            if (right <= high) {
              const rv = _parsed[right][iAxis];
              if (isNumber(rv)) {
                value = rv;
                mid = right;
                found = true;
                break;
              }
              right++;
            }
          }
          if (!found) {
            // No numeric values in current search window.
            break;
          }
        }

        if (!isNumber(value)) {
          break;
        }

        if (value < min) {
          if (value > beforeValue) {
            beforeValue = value;
            beforeIndex = mid;
          }
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
    }

    // Find the smallest value > max (afterIndex) using binary search.
    let afterIndex = -1;
    let afterValue = Infinity;
    {
      let low = 0;
      let high = length - 1;
      while (low <= high) {
        let mid = (low + high) >> 1;
        let value = _parsed[mid][iAxis];

        // If value is not numeric, search outward from mid to find a nearby numeric value.
        if (!isNumber(value)) {
          let left = mid - 1;
          let right = mid + 1;
          let found = false;
          while (left >= low || right <= high) {
            if (left >= low) {
              const lv = _parsed[left][iAxis];
              if (isNumber(lv)) {
                value = lv;
                mid = left;
                found = true;
                break;
              }
              left--;
            }
            if (right <= high) {
              const rv = _parsed[right][iAxis];
              if (isNumber(rv)) {
                value = rv;
                mid = right;
                found = true;
                break;
              }
              right++;
            }
          }
          if (!found) {
            // No numeric values in current search window.
            break;
          }
        }

        if (!isNumber(value)) {
          break;
        }

        if (value > max) {
          if (value < afterValue) {
            afterValue = value;
            afterIndex = mid;
          }
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
    }

    let drawStart = start;
    let drawEnd = count > 0 ? start + count - 1 : -1;

    if (beforeIndex !== -1) {
      drawStart = drawEnd === -1 ? beforeIndex : Math.min(drawStart, beforeIndex);
      drawEnd = Math.max(drawEnd, beforeIndex);
    }

    if (afterIndex !== -1) {
      drawStart = drawEnd === -1 ? afterIndex : Math.min(drawStart, afterIndex);
      drawEnd = Math.max(drawEnd, afterIndex);
    }

    if (drawEnd >= drawStart && drawEnd !== -1) {
      return {start: drawStart, count: drawEnd - drawStart + 1};
    }

    return {start, count};
  }

  updateElements(points, start, count, mode) {
    const reset = mode === 'reset';
    const {iScale, vScale, _stacked, _dataset} = this._cachedMeta;
    const {sharedOptions, includeOptions} = this._getSharedOptions(start, mode);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const {spanGaps, segment} = this.options;
    const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
    const directUpdate = this.chart._animationsDisabled || reset || mode === 'none';
    const end = start + count;
    const pointsCount = points.length;
    let prevParsed = start > 0 && this.getParsed(start - 1);

    for (let i = 0; i < pointsCount; ++i) {
      const point = points[i];
      const properties = directUpdate ? point : {};

      if (i < start || i >= end) {
        properties.skip = true;
        continue;
      }

      const parsed = this.getParsed(i);
      const nullData = isNullOrUndef(parsed[vAxis]);
      const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
      const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);

      properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
      properties.stop = i > 0 && (Math.abs(parsed[iAxis] - prevParsed[iAxis])) > maxGapLength;
      if (segment) {
        properties.parsed = parsed;
        properties.raw = _dataset.data[i];
      }

      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode);
      }

      if (!directUpdate) {
        this.updateElement(point, i, properties, mode);
      }

      prevParsed = parsed;
    }
  }

  /**
	 * @protected
	 */
  getMaxOverflow() {
    const meta = this._cachedMeta;
    const dataset = meta.dataset;
    const border = dataset.options && dataset.options.borderWidth || 0;
    const data = meta.data || [];
    if (!data.length) {
      return border;
    }
    const firstPoint = data[0].size(this.resolveDataElementOptions(0));
    const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
    return Math.max(border, firstPoint, lastPoint) / 2;
  }

  draw() {
    const meta = this._cachedMeta;
    meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis);
    super.draw();
  }
}
