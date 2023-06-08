import DatasetController from '../core/core.datasetController.js';
import {isNullOrUndef} from '../helpers/index.js';
import {isNumber} from '../helpers/helpers.math.js';
import {_getStartAndCountOfVisiblePoints, _scaleRangesChanged} from '../helpers/helpers.extras.js';

export default class ScatterController extends DatasetController {

  static id = 'scatter';

  /**
   * @type {any}
   */
  static defaults = {
    datasetElementType: false,
    dataElementType: 'point',
    showLine: false,
    fill: false
  };

  /**
   * @type {any}
   */
  static overrides = {

    interaction: {
      mode: 'point'
    },

    scales: {
      x: {
        type: 'linear'
      },
      y: {
        type: 'linear'
      }
    }
  };

  /**
	 * @protected
	 */
  getLabelAndValue(index) {
    const meta = this._cachedMeta;
    const labels = this.chart.data.labels || [];
    const {xScale, yScale} = meta;
    const parsed = this.getParsed(index);
    const x = xScale.getLabelForValue(parsed.x);
    const y = yScale.getLabelForValue(parsed.y);

    return {
      label: labels[index] || '',
      value: '(' + x + ', ' + y + ')'
    };
  }

  update(mode) {
    const meta = this._cachedMeta;
    const {data: points = []} = meta;
    // @ts-ignore
    const animationsDisabled = this.chart._animationsDisabled;
    let {start, count} = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);

    this._drawStart = start;
    this._drawCount = count;

    if (_scaleRangesChanged(meta)) {
      start = 0;
      count = points.length;
    }

    if (this.options.showLine) {

      // https://github.com/chartjs/Chart.js/issues/11333
      if (!this.datasetElementType) {
        this.addElements();
      }
      const {dataset: line, _dataset} = meta;

      // Update Line
      line._chart = this.chart;
      line._datasetIndex = this.index;
      line._decimated = !!_dataset._decimated;
      line.points = points;

      const options = this.resolveDatasetElementOptions(mode);
      options.segment = this.options.segment;
      this.updateElement(line, undefined, {
        animated: !animationsDisabled,
        options
      }, mode);
    } else if (this.datasetElementType) {
      // https://github.com/chartjs/Chart.js/issues/11333
      delete meta.dataset;
      this.datasetElementType = false;
    }

    // Update Points
    this.updateElements(points, start, count, mode);
  }

  addElements() {
    const {showLine} = this.options;

    if (!this.datasetElementType && showLine) {
      this.datasetElementType = this.chart.registry.getElement('line');
    }

    super.addElements();
  }

  updateElements(points, start, count, mode) {
    const reset = mode === 'reset';
    const {iScale, vScale, _stacked, _dataset} = this._cachedMeta;
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const {spanGaps, segment} = this.options;
    const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
    const directUpdate = this.chart._animationsDisabled || reset || mode === 'none';
    let prevParsed = start > 0 && this.getParsed(start - 1);

    for (let i = start; i < start + count; ++i) {
      const point = points[i];
      const parsed = this.getParsed(i);
      const properties = directUpdate ? point : {};
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

    this.updateSharedOptions(sharedOptions, mode, firstOpts);
  }

  /**
	 * @protected
	 */
  getMaxOverflow() {
    const meta = this._cachedMeta;
    const data = meta.data || [];

    if (!this.options.showLine) {
      let max = 0;
      for (let i = data.length - 1; i >= 0; --i) {
        max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
      }
      return max > 0 && max;
    }

    const dataset = meta.dataset;
    const border = dataset.options && dataset.options.borderWidth || 0;

    if (!data.length) {
      return border;
    }

    const firstPoint = data[0].size(this.resolveDataElementOptions(0));
    const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
    return Math.max(border, firstPoint, lastPoint) / 2;
  }
}
