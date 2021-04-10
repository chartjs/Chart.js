import DatasetController from '../core/core.datasetController';
import {isNullOrUndef} from '../helpers';
import {_limitValue, isNumber} from '../helpers/helpers.math';
import {_lookupByKey} from '../helpers/helpers.collection';

export default class LineController extends DatasetController {

  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
  }

  update(mode) {
    const me = this;
    const meta = me._cachedMeta;
    const {dataset: line, data: points = [], _dataset} = meta;
    // @ts-ignore
    const animationsDisabled = me.chart._animationsDisabled;
    let {start, count} = getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);

    me._drawStart = start;
    me._drawCount = count;

    if (scaleRangesChanged(meta)) {
      start = 0;
      count = points.length;
    }

    // Update Line
    line._decimated = !!_dataset._decimated;
    line.points = points;

    const options = me.resolveDatasetElementOptions(mode);
    if (!me.options.showLine) {
      options.borderWidth = 0;
    }
    options.segment = me.options.segment;
    me.updateElement(line, undefined, {
      animated: !animationsDisabled,
      options
    }, mode);

    // Update Points
    me.updateElements(points, start, count, mode);
  }

  updateElements(points, start, count, mode) {
    const me = this;
    const reset = mode === 'reset';
    const {xScale, yScale, _stacked} = me._cachedMeta;
    const firstOpts = me.resolveDataElementOptions(start, mode);
    const sharedOptions = me.getSharedOptions(firstOpts);
    const includeOptions = me.includeOptions(mode, sharedOptions);
    const spanGaps = me.options.spanGaps;
    const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
    const directUpdate = me.chart._animationsDisabled || reset || mode === 'none';
    let prevParsed = start > 0 && me.getParsed(start - 1);

    for (let i = start; i < start + count; ++i) {
      const point = points[i];
      const parsed = me.getParsed(i);
      const properties = directUpdate ? point : {};
      const nullData = isNullOrUndef(parsed.y);
      const x = properties.x = xScale.getPixelForValue(parsed.x, i);
      const y = properties.y = reset || nullData ? yScale.getBasePixel() : yScale.getPixelForValue(_stacked ? me.applyStack(yScale, parsed, _stacked) : parsed.y, i);
      properties.skip = isNaN(x) || isNaN(y) || nullData;
      properties.stop = i > 0 && (parsed.x - prevParsed.x) > maxGapLength;
      properties.parsed = parsed;

      if (includeOptions) {
        properties.options = sharedOptions || me.resolveDataElementOptions(i, mode);
      }

      if (!directUpdate) {
        me.updateElement(point, i, properties, mode);
      }

      prevParsed = parsed;
    }

    me.updateSharedOptions(sharedOptions, mode, firstOpts);
  }

  /**
	 * @protected
	 */
  getMaxOverflow() {
    const me = this;
    const meta = me._cachedMeta;
    const dataset = meta.dataset;
    const border = dataset.options && dataset.options.borderWidth || 0;
    const data = meta.data || [];
    if (!data.length) {
      return border;
    }
    const firstPoint = data[0].size(me.resolveDataElementOptions(0));
    const lastPoint = data[data.length - 1].size(me.resolveDataElementOptions(data.length - 1));
    return Math.max(border, firstPoint, lastPoint) / 2;
  }

  draw() {
    this._cachedMeta.dataset.updateControlPoints(this.chart.chartArea);
    super.draw();
  }
}

LineController.id = 'line';

/**
 * @type {any}
 */
LineController.defaults = {
  datasetElementType: 'line',
  dataElementType: 'point',

  showLine: true,
  spanGaps: false,
};

/**
 * @type {any}
 */
LineController.overrides = {
  scales: {
    _index_: {
      type: 'category',
    },
    _value_: {
      type: 'linear',
    },
  }
};

function getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
  const pointCount = points.length;

  let start = 0;
  let count = pointCount;

  if (meta._sorted) {
    const {iScale, _parsed} = meta;
    const axis = iScale.axis;
    const {min, max, minDefined, maxDefined} = iScale.getUserBounds();

    if (minDefined) {
      start = _limitValue(Math.min(
        _lookupByKey(_parsed, iScale.axis, min).lo,
        animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo),
      0, pointCount - 1);
    }
    if (maxDefined) {
      count = _limitValue(Math.max(
        _lookupByKey(_parsed, iScale.axis, max).hi + 1,
        animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max)).hi + 1),
      start, pointCount) - start;
    } else {
      count = pointCount - start;
    }
  }

  return {start, count};
}

function scaleRangesChanged(meta) {
  const {xScale, yScale, _scaleRanges} = meta;
  const newRanges = {
    xmin: xScale.min,
    xmax: xScale.max,
    ymin: yScale.min,
    ymax: yScale.max
  };
  if (!_scaleRanges) {
    meta._scaleRanges = newRanges;
    return true;
  }
  const changed = _scaleRanges.xmin !== xScale.min
		|| _scaleRanges.xmax !== xScale.max
		|| _scaleRanges.ymin !== yScale.min
		|| _scaleRanges.ymax !== yScale.max;

  Object.assign(_scaleRanges, newRanges);
  return changed;
}
