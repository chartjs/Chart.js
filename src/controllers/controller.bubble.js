import DatasetController from '../core/core.datasetController';
import {valueOrDefault} from '../helpers/helpers.core';

export default class BubbleController extends DatasetController {
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
  }

  /**
	 * Parse array of primitive values
	 * @protected
	 */
  parsePrimitiveData(meta, data, start, count) {
    const parsed = super.parsePrimitiveData(meta, data, start, count);
    for (let i = 0; i < parsed.length; i++) {
      parsed[i]._custom = this.resolveDataElementOptions(i + start).radius;
    }
    return parsed;
  }

  /**
	 * Parse array of arrays
	 * @protected
	 */
  parseArrayData(meta, data, start, count) {
    const parsed = super.parseArrayData(meta, data, start, count);
    for (let i = 0; i < parsed.length; i++) {
      const item = data[start + i];
      parsed[i]._custom = valueOrDefault(item[2], this.resolveDataElementOptions(i + start).radius);
    }
    return parsed;
  }

  /**
	 * Parse array of objects
	 * @protected
	 */
  parseObjectData(meta, data, start, count) {
    const parsed = super.parseObjectData(meta, data, start, count);
    for (let i = 0; i < parsed.length; i++) {
      const item = data[start + i];
      parsed[i]._custom = valueOrDefault(item && item.r && +item.r, this.resolveDataElementOptions(i + start).radius);
    }
    return parsed;
  }

  /**
	 * @protected
	 */
  getMaxOverflow() {
    const data = this._cachedMeta.data;

    let max = 0;
    for (let i = data.length - 1; i >= 0; --i) {
      max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
    }
    return max > 0 && max;
  }

  /**
	 * @protected
	 */
  getLabelAndValue(index) {
    const meta = this._cachedMeta;
    const {xScale, yScale} = meta;
    const parsed = this.getParsed(index);
    const x = xScale.getLabelForValue(parsed.x);
    const y = yScale.getLabelForValue(parsed.y);
    const r = parsed._custom;

    return {
      label: meta.label,
      value: '(' + x + ', ' + y + (r ? ', ' + r : '') + ')'
    };
  }

  update(mode) {
    const points = this._cachedMeta.data;

    // Update Points
    this.updateElements(points, 0, points.length, mode);
  }

  updateElements(points, start, count, mode) {
    const reset = mode === 'reset';
    const {iScale, vScale} = this._cachedMeta;
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;

    for (let i = start; i < start + count; i++) {
      const point = points[i];
      const parsed = !reset && this.getParsed(i);
      const properties = {};
      const iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]);
      const vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]);

      properties.skip = isNaN(iPixel) || isNaN(vPixel);

      if (includeOptions) {
        properties.options = this.resolveDataElementOptions(i, point.active ? 'active' : mode);

        if (reset) {
          properties.options.radius = 0;
        }
      }

      this.updateElement(point, i, properties, mode);
    }

    this.updateSharedOptions(sharedOptions, mode, firstOpts);
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
