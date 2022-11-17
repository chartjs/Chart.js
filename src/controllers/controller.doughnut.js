import DatasetController from '../core/core.datasetController.js';
import {isObject, resolveObjectKey, toPercentage, toDimension, valueOrDefault} from '../helpers/helpers.core.js';
import {formatNumber} from '../helpers/helpers.intl.js';
import {toRadians, PI, TAU, HALF_PI, _angleBetween} from '../helpers/helpers.math.js';

/**
 * @typedef { import('../core/core.controller.js').default } Chart
 */

function getRatioAndOffset(rotation, circumference, cutout) {
  let ratioX = 1;
  let ratioY = 1;
  let offsetX = 0;
  let offsetY = 0;
  // If the chart's circumference isn't a full circle, calculate size as a ratio of the width/height of the arc
  if (circumference < TAU) {
    const startAngle = rotation;
    const endAngle = startAngle + circumference;
    const startX = Math.cos(startAngle);
    const startY = Math.sin(startAngle);
    const endX = Math.cos(endAngle);
    const endY = Math.sin(endAngle);
    const calcMax = (angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? 1 : Math.max(a, a * cutout, b, b * cutout);
    const calcMin = (angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? -1 : Math.min(a, a * cutout, b, b * cutout);
    const maxX = calcMax(0, startX, endX);
    const maxY = calcMax(HALF_PI, startY, endY);
    const minX = calcMin(PI, startX, endX);
    const minY = calcMin(PI + HALF_PI, startY, endY);
    ratioX = (maxX - minX) / 2;
    ratioY = (maxY - minY) / 2;
    offsetX = -(maxX + minX) / 2;
    offsetY = -(maxY + minY) / 2;
  }
  return {ratioX, ratioY, offsetX, offsetY};
}

export default class DoughnutController extends DatasetController {

  static id = 'doughnut';

  /**
   * @type {any}
   */
  static defaults = {
    datasetElementType: false,
    dataElementType: 'arc',
    animation: {
      // Boolean - Whether we animate the rotation of the Doughnut
      animateRotate: true,
      // Boolean - Whether we animate scaling the Doughnut from the centre
      animateScale: false
    },
    animations: {
      numbers: {
        type: 'number',
        properties: ['circumference', 'endAngle', 'innerRadius', 'outerRadius', 'startAngle', 'x', 'y', 'offset', 'borderWidth', 'spacing']
      },
    },
    // The percentage of the chart that we cut out of the middle.
    cutout: '50%',

    // The rotation of the chart, where the first data arc begins.
    rotation: 0,

    // The total circumference of the chart.
    circumference: 360,

    // The outr radius of the chart
    radius: '100%',

    // Spacing between arcs
    spacing: 0,

    indexAxis: 'r',
  };

  static descriptors = {
    _scriptable: (name) => name !== 'spacing',
    _indexable: (name) => name !== 'spacing',
  };

  /**
   * @type {any}
   */
  static overrides = {
    aspectRatio: 1,

    // Need to override these to give a nice default
    plugins: {
      legend: {
        labels: {
          generateLabels(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const {labels: {pointStyle, color}} = chart.legend.options;

              return data.labels.map((label, i) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i);

                return {
                  text: label,
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  fontColor: color,
                  lineWidth: style.borderWidth,
                  pointStyle: pointStyle,
                  hidden: !chart.getDataVisibility(i),

                  // Extra data used for toggling the correct item
                  index: i
                };
              });
            }
            return [];
          }
        },

        onClick(e, legendItem, legend) {
          legend.chart.toggleDataVisibility(legendItem.index);
          legend.chart.update();
        }
      }
    }
  };

  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);

    this.enableOptionSharing = true;
    this.innerRadius = undefined;
    this.outerRadius = undefined;
    this.offsetX = undefined;
    this.offsetY = undefined;
  }

  linkScales() {}

  /**
	 * Override data parsing, since we are not using scales
	 */
  parse(start, count) {
    const data = this.getDataset().data;
    const meta = this._cachedMeta;

    if (this._parsing === false) {
      meta._parsed = data;
    } else {
      let getter = (i) => +data[i];

      if (isObject(data[start])) {
        const {key = 'value'} = this._parsing;
        getter = (i) => +resolveObjectKey(data[i], key);
      }

      let i, ilen;
      for (i = start, ilen = start + count; i < ilen; ++i) {
        meta._parsed[i] = getter(i);
      }
    }
  }

  /**
	 * @private
	 */
  _getRotation() {
    return toRadians(this.options.rotation - 90);
  }

  /**
	 * @private
	 */
  _getCircumference() {
    return toRadians(this.options.circumference);
  }

  /**
	 * Get the maximal rotation & circumference extents
	 * across all visible datasets.
	 */
  _getRotationExtents() {
    let min = TAU;
    let max = -TAU;

    for (let i = 0; i < this.chart.data.datasets.length; ++i) {
      if (this.chart.isDatasetVisible(i) && this.chart.getDatasetMeta(i).type === this._type) {
        const controller = this.chart.getDatasetMeta(i).controller;
        const rotation = controller._getRotation();
        const circumference = controller._getCircumference();

        min = Math.min(min, rotation);
        max = Math.max(max, rotation + circumference);
      }
    }

    return {
      rotation: min,
      circumference: max - min,
    };
  }

  /**
	 * @param {string} mode
	 */
  update(mode) {
    const chart = this.chart;
    const {chartArea} = chart;
    const meta = this._cachedMeta;
    const arcs = meta.data;
    const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing;
    const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
    const cutout = Math.min(toPercentage(this.options.cutout, maxSize), 1);
    const chartWeight = this._getRingWeight(this.index);

    // Compute the maximal rotation & circumference limits.
    // If we only consider our dataset, this can cause problems when two datasets
    // are both less than a circle with different rotations (starting angles)
    const {circumference, rotation} = this._getRotationExtents();
    const {ratioX, ratioY, offsetX, offsetY} = getRatioAndOffset(rotation, circumference, cutout);
    const maxWidth = (chartArea.width - spacing) / ratioX;
    const maxHeight = (chartArea.height - spacing) / ratioY;
    const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
    const outerRadius = toDimension(this.options.radius, maxRadius);
    const innerRadius = Math.max(outerRadius * cutout, 0);
    const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
    this.offsetX = offsetX * outerRadius;
    this.offsetY = offsetY * outerRadius;

    meta.total = this.calculateTotal();

    this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
    this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);

    this.updateElements(arcs, 0, arcs.length, mode);
  }

  /**
   * @private
   */
  _circumference(i, reset) {
    const opts = this.options;
    const meta = this._cachedMeta;
    const circumference = this._getCircumference();
    if ((reset && opts.animation.animateRotate) || !this.chart.getDataVisibility(i) || meta._parsed[i] === null || meta.data[i].hidden) {
      return 0;
    }
    return this.calculateCircumference(meta._parsed[i] * circumference / TAU);
  }

  updateElements(arcs, start, count, mode) {
    const reset = mode === 'reset';
    const chart = this.chart;
    const chartArea = chart.chartArea;
    const opts = chart.options;
    const animationOpts = opts.animation;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const animateScale = reset && animationOpts.animateScale;
    const innerRadius = animateScale ? 0 : this.innerRadius;
    const outerRadius = animateScale ? 0 : this.outerRadius;
    const {sharedOptions, includeOptions} = this._getSharedOptions(start, mode);
    let startAngle = this._getRotation();
    let i;

    for (i = 0; i < start; ++i) {
      startAngle += this._circumference(i, reset);
    }

    for (i = start; i < start + count; ++i) {
      const circumference = this._circumference(i, reset);
      const arc = arcs[i];
      const properties = {
        x: centerX + this.offsetX,
        y: centerY + this.offsetY,
        startAngle,
        endAngle: startAngle + circumference,
        circumference,
        outerRadius,
        innerRadius
      };
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, arc.active ? 'active' : mode);
      }
      startAngle += circumference;

      this.updateElement(arc, i, properties, mode);
    }
  }

  calculateTotal() {
    const meta = this._cachedMeta;
    const metaData = meta.data;
    let total = 0;
    let i;

    for (i = 0; i < metaData.length; i++) {
      const value = meta._parsed[i];
      if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i) && !metaData[i].hidden) {
        total += Math.abs(value);
      }
    }

    return total;
  }

  calculateCircumference(value) {
    const total = this._cachedMeta.total;
    if (total > 0 && !isNaN(value)) {
      return TAU * (Math.abs(value) / total);
    }
    return 0;
  }

  getLabelAndValue(index) {
    const meta = this._cachedMeta;
    const chart = this.chart;
    const labels = chart.data.labels || [];
    const value = formatNumber(meta._parsed[index], chart.options.locale);

    return {
      label: labels[index] || '',
      value,
    };
  }

  getMaxBorderWidth(arcs) {
    let max = 0;
    const chart = this.chart;
    let i, ilen, meta, controller, options;

    if (!arcs) {
      // Find the outmost visible dataset
      for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
        if (chart.isDatasetVisible(i)) {
          meta = chart.getDatasetMeta(i);
          arcs = meta.data;
          controller = meta.controller;
          break;
        }
      }
    }

    if (!arcs) {
      return 0;
    }

    for (i = 0, ilen = arcs.length; i < ilen; ++i) {
      options = controller.resolveDataElementOptions(i);
      if (options.borderAlign !== 'inner') {
        max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0);
      }
    }
    return max;
  }

  getMaxOffset(arcs) {
    let max = 0;

    for (let i = 0, ilen = arcs.length; i < ilen; ++i) {
      const options = this.resolveDataElementOptions(i);
      max = Math.max(max, options.offset || 0, options.hoverOffset || 0);
    }
    return max;
  }

  /**
	 * Get radius length offset of the dataset in relation to the visible datasets weights. This allows determining the inner and outer radius correctly
	 * @private
	 */
  _getRingWeightOffset(datasetIndex) {
    let ringWeightOffset = 0;

    for (let i = 0; i < datasetIndex; ++i) {
      if (this.chart.isDatasetVisible(i)) {
        ringWeightOffset += this._getRingWeight(i);
      }
    }

    return ringWeightOffset;
  }

  /**
	 * @private
	 */
  _getRingWeight(datasetIndex) {
    return Math.max(valueOrDefault(this.chart.data.datasets[datasetIndex].weight, 1), 0);
  }

  /**
	 * Returns the sum of all visible data set weights.
	 * @private
	 */
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
