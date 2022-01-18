import DatasetController from '../core/core.datasetController';
import {toRadians, PI} from '../helpers/index';
import {formatNumber} from '../helpers/helpers.intl';
import {updateStacks} from '../core/core.datasetController';
import {isArray, isObject} from '../helpers/helpers.core';
import {resolveObjectKey} from '../helpers/helpers.core';

export default class PolarAreaController extends DatasetController {

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

  parse(start, count) {
    const {_cachedMeta: meta, _data: data} = this;
    const {iScale, _stacked} = meta;
    const iAxis = iScale.axis;

    let sorted = start === 0 && count === data.length ? true : meta._sorted;
    let prev = start > 0 && meta._parsed[start - 1];
    let i, cur, parsed;

    if (this._parsing === false) {
      meta._parsed = data;
      meta._sorted = true;
      parsed = data;
    } else {
      if (isArray(data[start])) {
        parsed = this.parseArrayData(meta, data, start, count);
      } else if (isObject(data[start])) {
        parsed = this.parseObjectData(meta, data, start, count);
      } else {
        parsed = this.parsePrimitiveData(meta, data, start, count);
      }

      const isNotInOrderComparedToPrev = () => cur[iAxis] === null || (prev && cur[iAxis] < prev[iAxis]);
      for (i = 0; i < count; ++i) {
        meta._parsed[i + start] = cur = parsed[i];
        if (sorted) {
          if (isNotInOrderComparedToPrev()) {
            sorted = false;
          }
          prev = cur;
        }
      }
      meta._sorted = sorted;
    }

    if (_stacked) {
      updateStacks(this, parsed);
    }
  }

  parseObjectData(meta, data, start, count) {
    const {iScale} = meta;
    const {key = 'key'} = this._parsing;
    const parsed = new Array(count);
    let i, ilen, index, item;

    for (i = 0, ilen = count; i < ilen; ++i) {
      index = i + start;
      item = data[index];
      parsed[i] = {
        r: iScale.parse(resolveObjectKey(item, key), index)
      };
    }

    return parsed;
  }

  update(mode) {
    const arcs = this._cachedMeta.data;

    this._updateRadius();
    this.updateElements(arcs, 0, arcs.length, mode);
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
    const dataset = this.getDataset();
    const opts = chart.options;
    const animationOpts = opts.animation;
    const scale = this._cachedMeta.rScale;
    const centerX = scale.xCenter;
    const centerY = scale.yCenter;
    const datasetStartAngle = scale.getIndexAngle(0) - 0.5 * PI;
    let angle = datasetStartAngle;
    let i;
    const {key = 'key'} = this._parsing;

    const defaultAngle = 360 / this.countVisibleElements();

    for (i = 0; i < start; ++i) {
      angle += this._computeAngle(i, mode, defaultAngle);
    }
    for (i = start; i < start + count; i++) {
      const arc = arcs[i];
      const dataPoint = isObject(dataset.data[i]) ? resolveObjectKey(dataset.data[i], key) : dataset.data[i];
      let startAngle = angle;
      let endAngle = angle + this._computeAngle(i, mode, defaultAngle);
      let outerRadius = chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(dataPoint) : 0;
      angle = endAngle;

      if (reset) {
        if (animationOpts.animateScale) {
          outerRadius = 0;
        }
        if (animationOpts.animateRotate) {
          startAngle = endAngle = datasetStartAngle;
        }
      }

      const properties = {
        x: centerX,
        y: centerY,
        innerRadius: 0,
        outerRadius,
        startAngle,
        endAngle,
        options: this.resolveDataElementOptions(i, arc.active ? 'active' : mode)
      };

      this.updateElement(arc, i, properties, mode);
    }
  }

  countVisibleElements() {
    const dataset = this.getDataset();
    const meta = this._cachedMeta;
    const {key = 'key'} = this._parsing;
    let count = 0;

    meta.data.forEach((element, index) => {
      if ((!isNaN(dataset.data[index]) || (!isNaN(resolveObjectKey(dataset.data[index], key)))) && this.chart.getDataVisibility(index)) {
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

PolarAreaController.id = 'polarArea';

/**
 * @type {any}
 */
PolarAreaController.defaults = {
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
PolarAreaController.overrides = {
  aspectRatio: 1,

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

    // Need to override these to give a nice default
    tooltip: {
      callbacks: {
        title() {
          return '';
        },
        label(context) {
          return context.chart.data.labels[context.dataIndex] + ': ' + context.formattedValue;
        }
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
