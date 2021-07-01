import DatasetController from '../core/core.datasetController';
import {isArray, toPercentage, toDimension, valueOrDefault} from '../helpers/helpers.core';
import {formatNumber} from '../helpers/helpers.intl';
import {toRadians, PI, TAU, HALF_PI, _angleBetween} from '../helpers/helpers.math';

/**
 * @typedef { import("../core/core.controller").default } Chart
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
    let i, ilen;
    for (i = start, ilen = start + count; i < ilen; ++i) {
      meta._parsed[i] = +data[i];
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

    const me = this;

    for (let i = 0; i < me.chart.data.datasets.length; ++i) {
      if (me.chart.isDatasetVisible(i)) {
        const controller = me.chart.getDatasetMeta(i).controller;
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
    const me = this;
    const chart = me.chart;
    const {chartArea} = chart;
    const meta = me._cachedMeta;
    const arcs = meta.data;
    const spacing = me.getMaxBorderWidth() + me.getMaxOffset(arcs) + me.options.spacing;
    const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
    const cutout = Math.min(toPercentage(me.options.cutout, maxSize), 1);
    const chartWeight = me._getRingWeight(me.index);

    // Compute the maximal rotation & circumference limits.
    // If we only consider our dataset, this can cause problems when two datasets
    // are both less than a circle with different rotations (starting angles)
    const {circumference, rotation} = me._getRotationExtents();
    const {ratioX, ratioY, offsetX, offsetY} = getRatioAndOffset(rotation, circumference, cutout);
    const maxWidth = (chartArea.width - spacing) / ratioX;
    const maxHeight = (chartArea.height - spacing) / ratioY;
    const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
    const outerRadius = toDimension(me.options.radius, maxRadius);
    const innerRadius = Math.max(outerRadius * cutout, 0);
    const radiusLength = (outerRadius - innerRadius) / me._getVisibleDatasetWeightTotal();
    me.offsetX = offsetX * outerRadius;
    me.offsetY = offsetY * outerRadius;

    meta.total = me.calculateTotal();

    me.outerRadius = outerRadius - radiusLength * me._getRingWeightOffset(me.index);
    me.innerRadius = Math.max(me.outerRadius - radiusLength * chartWeight, 0);

    me.updateElements(arcs, 0, arcs.length, mode);
  }

  /**
   * @private
   */
  _circumference(i, reset) {
    const me = this;
    const opts = me.options;
    const meta = me._cachedMeta;
    const circumference = me._getCircumference();
    if ((reset && opts.animation.animateRotate) || !this.chart.getDataVisibility(i) || meta._parsed[i] === null) {
      return 0;
    }
    return me.calculateCircumference(meta._parsed[i] * circumference / TAU);
  }

  updateElements(arcs, start, count, mode) {
    const me = this;
    const reset = mode === 'reset';
    const chart = me.chart;
    const chartArea = chart.chartArea;
    const opts = chart.options;
    const animationOpts = opts.animation;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const animateScale = reset && animationOpts.animateScale;
    const innerRadius = animateScale ? 0 : me.innerRadius;
    const outerRadius = animateScale ? 0 : me.outerRadius;
    const firstOpts = me.resolveDataElementOptions(start, mode);
    const sharedOptions = me.getSharedOptions(firstOpts);
    const includeOptions = me.includeOptions(mode, sharedOptions);
    let startAngle = me._getRotation();
    let i;

    for (i = 0; i < start; ++i) {
      startAngle += me._circumference(i, reset);
    }

    for (i = start; i < start + count; ++i) {
      const circumference = me._circumference(i, reset);
      const arc = arcs[i];
      const properties = {
        x: centerX + me.offsetX,
        y: centerY + me.offsetY,
        startAngle,
        endAngle: startAngle + circumference,
        circumference,
        outerRadius,
        innerRadius
      };
      if (includeOptions) {
        properties.options = sharedOptions || me.resolveDataElementOptions(i, arc.active ? 'active' : mode);
      }
      startAngle += circumference;

      me.updateElement(arc, i, properties, mode);
    }
    me.updateSharedOptions(sharedOptions, mode, firstOpts);
  }

  calculateTotal() {
    const meta = this._cachedMeta;
    const metaData = meta.data;
    let total = 0;
    let i;

    for (i = 0; i < metaData.length; i++) {
      const value = meta._parsed[i];
      if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i)) {
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
    const me = this;
    const meta = me._cachedMeta;
    const chart = me.chart;
    const labels = chart.data.labels || [];
    const value = formatNumber(meta._parsed[index], chart.options.locale);

    return {
      label: labels[index] || '',
      value,
    };
  }

  getMaxBorderWidth(arcs) {
    const me = this;
    let max = 0;
    const chart = me.chart;
    let i, ilen, meta, controller, options;

    if (!arcs) {
      // Find the outmost visible dataset
      for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
        if (chart.isDatasetVisible(i)) {
          meta = chart.getDatasetMeta(i);
          arcs = meta.data;
          controller = meta.controller;
          if (controller !== me) {
            controller.configure();
          }
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

DoughnutController.id = 'doughnut';

/**
 * @type {any}
 */
DoughnutController.defaults = {
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

DoughnutController.descriptors = {
  _scriptable: (name) => name !== 'spacing',
  _indexable: (name) => name !== 'spacing',
};

/**
 * @type {any}
 */
DoughnutController.overrides = {
  aspectRatio: 1,

  // Need to override these to give a nice default
  plugins: {
    legend: {
      labels: {
        generateLabels(chart) {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            const {labels: {pointStyle}} = chart.legend.options;

            return data.labels.map((label, i) => {
              const meta = chart.getDatasetMeta(0);
              const style = meta.controller.getStyle(i);

              return {
                text: label,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
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
    },
    tooltip: {
      callbacks: {
        title() {
          return '';
        },
        label(tooltipItem) {
          let dataLabel = tooltipItem.label;
          const value = ': ' + tooltipItem.formattedValue;

          if (isArray(dataLabel)) {
            // show value on first line of multiline label
            // need to clone because we are changing the value
            dataLabel = dataLabel.slice();
            dataLabel[0] += value;
          } else {
            dataLabel += value;
          }

          return dataLabel;
        }
      }
    }
  }
};
