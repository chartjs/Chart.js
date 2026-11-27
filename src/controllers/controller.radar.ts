import DatasetController from '../core/core.datasetController.js';
import {_parseObjectDataRadialScale} from '../helpers/index.js';
import type {AnyObject} from '../types/basic.js';
import type {ChartMeta, UpdateMode} from '../types/index.js';
import type PointElement from '../elements/element.point.js';

export default class RadarController extends DatasetController {

  static id = 'radar';

  static override defaults: any = {
    datasetElementType: 'line',
    dataElementType: 'point',
    indexAxis: 'r',
    showLine: true,
    elements: {
      line: {
        fill: 'start'
      }
    },
  };

  static overrides: any = {
    aspectRatio: 1,

    scales: {
      r: {
        type: 'radialLinear',
      }
    }
  };

  protected override getLabelAndValue(index: number): {label: string; value: string} {
    const vScale = this._cachedMeta.vScale;
    const parsed = this.getParsed(index);

    return {
      label: vScale.getLabels()[index],
      value: '' + vScale.getLabelForValue(parsed[vScale.axis])
    };
  }

  override parseObjectData(meta: ChartMeta<'radar'>, data: AnyObject[], start: number, count: number) {
    return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
  }

  override update(mode: UpdateMode): void {
    const meta = this._cachedMeta;
    const line = meta.dataset;
    const points = meta.data || [];
    const labels = meta.iScale.getLabels();

    // Update Line
    line.points = points;
    // In resize mode only point locations change, so no need to set the points or options.
    if (mode !== 'resize') {
      const options = this.resolveDatasetElementOptions(mode);
      if (!this.options.showLine) {
        options.borderWidth = 0;
      }

      const properties = {
        _loop: true,
        _fullLoop: labels.length === points.length,
        options
      };

      this.updateElement(line, undefined, properties, mode);
    }

    // Update Points
    this.updateElements(points, 0, points.length, mode);
  }

  override updateElements(points: PointElement[], start: number, count: number, mode: UpdateMode): void {
    const scale = this._cachedMeta.rScale;
    const reset = mode === 'reset';

    for (let i = start; i < start + count; i++) {
      const point = points[i];
      const options = this.resolveDataElementOptions(i, point.active ? 'active' : mode);
      const pointPosition = scale.getPointPositionForValue(i, this.getParsed(i).r);

      const x = reset ? scale.xCenter : pointPosition.x;
      const y = reset ? scale.yCenter : pointPosition.y;

      const properties = {
        x,
        y,
        angle: pointPosition.angle,
        skip: isNaN(x) || isNaN(y),
        options
      };

      this.updateElement(point, i, properties, mode);
    }
  }
}
