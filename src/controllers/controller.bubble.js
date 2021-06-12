import DatasetController from '../core/core.datasetController';
import {resolveObjectKey, valueOrDefault} from '../helpers/helpers.core';

export default class BubbleController extends DatasetController {
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
  }

  /**
	 * Parse array of objects
	 * @protected
	 */
  parseObjectData(meta, data, start, count) {
    const {xScale, yScale} = meta;
    const {xAxisKey = 'x', yAxisKey = 'y'} = this._parsing;
    const parsed = [];
    let i, ilen, item;
    for (i = start, ilen = start + count; i < ilen; ++i) {
      item = data[i];
      parsed.push({
        x: xScale.parse(resolveObjectKey(item, xAxisKey), i),
        y: yScale.parse(resolveObjectKey(item, yAxisKey), i),
        _custom: item && item.r && +item.r
      });
    }
    return parsed;
  }

  /**
	 * @protected
	 */
  getMaxOverflow() {
    const {data, _parsed} = this._cachedMeta;

    let max = 0;
    for (let i = data.length - 1; i >= 0; --i) {
      max = Math.max(max, data[i].size() / 2, _parsed[i]._custom);
    }
    return max > 0 && max;
  }

  /**
	 * @protected
	 */
  getLabelAndValue(index) {
    const me = this;
    const meta = me._cachedMeta;
    const {xScale, yScale} = meta;
    const parsed = me.getParsed(index);
    const x = xScale.getLabelForValue(parsed.x);
    const y = yScale.getLabelForValue(parsed.y);
    const r = parsed._custom;

    return {
      label: meta.label,
      value: '(' + x + ', ' + y + (r ? ', ' + r : '') + ')'
    };
  }

  update(mode) {
    const me = this;
    const points = me._cachedMeta.data;

    // Update Points
    me.updateElements(points, 0, points.length, mode);
  }

  updateElements(points, start, count, mode) {
    const me = this;
    const reset = mode === 'reset';
    const {iScale, vScale} = me._cachedMeta;
    const firstOpts = me.resolveDataElementOptions(start, mode);
    const sharedOptions = me.getSharedOptions(firstOpts);
    const includeOptions = me.includeOptions(mode, sharedOptions);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;

    for (let i = start; i < start + count; i++) {
      const point = points[i];
      const parsed = !reset && me.getParsed(i);
      const properties = {};
      const iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]);
      const vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]);

      properties.skip = isNaN(iPixel) || isNaN(vPixel);

      if (includeOptions) {
        properties.options = me.resolveDataElementOptions(i, point.active ? 'active' : mode);

        if (reset) {
          properties.options.radius = 0;
        }
      }

      me.updateElement(point, i, properties, mode);
    }

    me.updateSharedOptions(sharedOptions, mode, firstOpts);
  }

  /**
	 * @param {number} index
	 * @param {string} [mode]
	 * @protected
	 */
  resolveDataElementOptions(index, mode) {
    const parsed = this.getParsed(index);
    let values = super.resolveDataElementOptions(index, mode);

    // In case values were cached (and thus frozen), we need to clone the values
    if (values.$shared) {
      values = Object.assign({}, values, {$shared: false});
    }

    // Custom radius resolution
    const radius = values.radius;
    if (mode !== 'active') {
      values.radius = 0;
    }
    values.radius += valueOrDefault(parsed && parsed._custom, radius);

    return values;
  }
}

BubbleController.id = 'bubble';

/**
 * @type {any}
 */
BubbleController.defaults = {
  datasetElementType: false,
  dataElementType: 'point',

  animations: {
    numbers: {
      type: 'number',
      properties: ['x', 'y', 'borderWidth', 'radius']
    }
  }
};

/**
 * @type {any}
 */
BubbleController.overrides = {
  scales: {
    x: {
      type: 'linear'
    },
    y: {
      type: 'linear'
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        title() {
          // Title doesn't make sense for scatter since we format the data as a point
          return '';
        }
      }
    }
  }
};
