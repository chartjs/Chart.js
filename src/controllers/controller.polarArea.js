import DatasetController from '../core/core.datasetController.js';
import {toRadians, PI, formatNumber, _parseObjectDataRadialScale} from '../helpers/index.js';

export default class PolarAreaController extends DatasetController {

  static id = 'polarArea';

  /**
   * @type {any}
   */
  static defaults = {
    dataElementType: 'arc',
    animation: {
      animateRotate: true,
      animateScale: true
    },
    animations: {
      numbers: {
        type: 'number',
        properties: ['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius']
      },
    },
    indexAxis: 'r',
    startAngle: 0,
  };

  /**
   * @type {any}
   */
  static overrides = {
    aspectRatio: 1,

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
    },

    scales: {
      r: {
        type: 'radialLinear',
        angleLines: {
          display: false
        },
        beginAtZero: true,
        grid: {
          circular: true
        },
        pointLabels: {
          display: false
        },
        startAngle: 0
      }
    }
  };

  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);

    this.innerRadius = undefined;
    this.outerRadius = undefined;
  }

  getLabelAndValue(index) {
    const meta = this._cachedMeta;
    const chart = this.chart;
    const labels = chart.data.labels || [];
    const value = formatNumber(meta._parsed[index].r, chart.options.locale);

    return {
      label: labels[index] || '',
      value,
    };
  }

  parseObjectData(meta, data, start, count) {
    return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
  }

  update(mode) {
    const arcs = this._cachedMeta.data;

    this._updateRadius();
    this.updateElements(arcs, 0, arcs.length, mode);
  }

  /**
   * @protected
   */
  getMinMax() {
    const meta = this._cachedMeta;
    const range = {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY};

    meta.data.forEach((element, index) => {
      const parsed = this.getParsed(index).r;

      if (!isNaN(parsed) && this.chart.getDataVisibility(index)) {
        const value = meta.stack !== undefined ? this._getStackedOffset(index) + parsed : parsed;

        if (value < range.min) {
          range.min = value;
        }

        if (value > range.max) {
          range.max = value;
        }
      }
    });

    return range;
  }

  /**
   * @private
   */
  _getStackedOffset(index) {
    const chart = this.chart;
    const meta = this._cachedMeta;
    const myStack = meta.stack;

    if (myStack === undefined) {
      return 0;
    }

    let total = 0;

    for (let i = 0; i < chart.data.datasets.length; i++) {
      if (i === this.index) {
        break;
      }
      const otherMeta = chart.getDatasetMeta(i);
      if (otherMeta.stack === myStack && !otherMeta.hidden) {
        const parsed = otherMeta._parsed && otherMeta._parsed[index];
        if (parsed && !isNaN(parsed.r)) {
          total += parsed.r;
        }
      }
    }

    return total;
  }

  /**
	 * @private
	 */
  _updateRadius() {
    const chart = this.chart;
    const chartArea = chart.chartArea;
    const opts = chart.options;
    const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);

    const outerRadius = Math.max(minSize / 2, 0);
    const innerRadius = Math.max(opts.cutoutPercentage ? (outerRadius / 100) * (opts.cutoutPercentage) : 1, 0);
    const radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount();

    this.outerRadius = outerRadius - (radiusLength * this.index);
    this.innerRadius = this.outerRadius - radiusLength;
  }

  updateElements(arcs, start, count, mode) {
    const reset = mode === 'reset';
    const chart = this.chart;
    const opts = chart.options;
    const animationOpts = opts.animation;
    const scale = this._cachedMeta.rScale;
    const centerX = scale.xCenter;
    const centerY = scale.yCenter;
    const datasetStartAngle = scale.getIndexAngle(0) - 0.5 * PI;
    let angle = datasetStartAngle;
    let i;

    const defaultAngle = 360 / this.countVisibleElements();

    for (i = 0; i < start; ++i) {
      angle += this._computeAngle(i, mode, defaultAngle);
    }
    for (i = start; i < start + count; i++) {
      const arc = arcs[i];
      let startAngle = angle;
      let endAngle = angle + this._computeAngle(i, mode, defaultAngle);
      const isStacked = this._cachedMeta.stack !== undefined;
      const stackedOffset = isStacked ? this._getStackedOffset(i) : 0;
      let outerRadius = chart.getDataVisibility(i)
        ? scale.getDistanceFromCenterForValue(stackedOffset + this.getParsed(i).r)
        : 0;
      let innerRadius = isStacked && chart.getDataVisibility(i)
        ? scale.getDistanceFromCenterForValue(stackedOffset)
        : 0;
      angle = endAngle;

      if (reset) {
        if (animationOpts.animateScale) {
          outerRadius = 0;
          innerRadius = 0;
        }
        if (animationOpts.animateRotate) {
          startAngle = endAngle = datasetStartAngle;
        }
      }

      const properties = {
        x: centerX,
        y: centerY,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        options: this.resolveDataElementOptions(i, arc.active ? 'active' : mode)
      };

      this.updateElement(arc, i, properties, mode);
    }
  }

  countVisibleElements() {
    const meta = this._cachedMeta;
    let count = 0;

    meta.data.forEach((element, index) => {
      if (!isNaN(this.getParsed(index).r) && this.chart.getDataVisibility(index)) {
        count++;
      }
    });

    return count;
  }

  /**
	 * @private
	 */
  _computeAngle(index, mode, defaultAngle) {
    return this.chart.getDataVisibility(index)
      ? toRadians(this.resolveDataElementOptions(index, mode).angle || defaultAngle)
      : 0;
  }
}
