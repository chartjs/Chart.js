import DatasetController from '../core/core.datasetController.js';
import {toRadians, PI, formatNumber, _parseObjectDataRadialScale} from '../helpers/index.js';
import type {AnyObject} from '../types/basic.js';
import type {ChartMeta, UpdateMode} from '../types/index.js';
import type ArcElement from '../elements/element.arc.js';
import type Chart from '../core/core.controller.js';

export default class PolarAreaController extends DatasetController {

  static id = 'polarArea';

  static override defaults: any = {
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
    spacing: 0,
    spacingMode: 'proportional',
  };

  static overrides: any = {
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

        onClick(_e, legendItem, legend) {
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

  declare innerRadius: number;
  declare outerRadius: number;

  constructor(chart: Chart, datasetIndex: number) {
    super(chart, datasetIndex);

    this.innerRadius = undefined;
    this.outerRadius = undefined;
  }

  override getLabelAndValue(index: number): {label: string; value: string} {
    const meta = this._cachedMeta;
    const chart = this.chart;
    const labels = chart.data.labels || [];
    const value = formatNumber(meta._parsed[index].r, chart.options.locale);

    return {
      label: labels[index] || '',
      value,
    };
  }

  /**
   * An arc hidden by `chart.toggleDataVisibility` has no radius.
   * @protected
   */
  protected override _isDataVisible(index: number): boolean {
    return this.chart.getDataVisibility(index) && super._isDataVisible(index);
  }

  override parseObjectData(meta: ChartMeta<'polarArea'>, data: AnyObject[], start: number, count: number) {
    return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
  }

  override update(mode: UpdateMode): void {
    const arcs = this._cachedMeta.data;

    this._updateRadius();
    this.updateElements(arcs, 0, arcs.length, mode);
  }

  protected override getMinMax(): {min: number; max: number} {
    const meta = this._cachedMeta;
    const range = {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY};

    meta.data.forEach((_element, index) => {
      const parsed = this.getParsed(index).r;

      if (!isNaN(parsed) && this.chart.getDataVisibility(index)) {
        if (parsed < range.min) {
          range.min = parsed;
        }

        if (parsed > range.max) {
          range.max = parsed;
        }
      }
    });

    return range;
  }

  /** @internal */
  _updateRadius(): void {
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

  override updateElements(arcs: ArcElement[], start: number, count: number, mode: UpdateMode): void {
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
      let outerRadius = chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(this.getParsed(i).r) : 0;
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

      // Arc defaults (`spacing=0`, `spacingMode='angular'`) can mask polarArea-level values.
      if (properties.options.spacing === 0) {
        properties.options.spacing = this.options.spacing;
      }
      if (properties.options.spacingMode === 'angular') {
        properties.options.spacingMode = this.options.spacingMode;
      }

      this.updateElement(arc, i, properties, mode);
    }
  }

  countVisibleElements(): number {
    const meta = this._cachedMeta;
    let count = 0;

    meta.data.forEach((_element, index) => {
      if (!isNaN(this.getParsed(index).r) && this.chart.getDataVisibility(index)) {
        count++;
      }
    });

    return count;
  }

  /** @internal */
  _computeAngle(index: number, mode: UpdateMode, defaultAngle: number): number {
    return this.chart.getDataVisibility(index)
      ? toRadians(this.resolveDataElementOptions(index, mode).angle || defaultAngle)
      : 0;
  }
}
