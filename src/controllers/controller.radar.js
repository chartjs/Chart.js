import DatasetController from '../core/core.datasetController';

export default class RadarController extends DatasetController {

  /**
	 * @protected
	 */
  getLabelAndValue(index) {
    const vScale = this._cachedMeta.vScale;
    const parsed = this.getParsed(index);

    return {
      label: vScale.getLabels()[index],
      value: '' + vScale.getLabelForValue(parsed[vScale.axis])
    };
  }

  update(mode) {
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

  updateElements(points, start, count, mode) {
    const dataset = this.getDataset();
    const scale = this._cachedMeta.rScale;
    const reset = mode === 'reset';

    for (let i = start; i < start + count; i++) {
      const point = points[i];
      const options = this.resolveDataElementOptions(i, point.active ? 'active' : mode);
      const pointPosition = scale.getPointPositionForValue(i, dataset.data[i]);

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

RadarController.id = 'radar';

/**
 * @type {any}
 */
RadarController.defaults = {
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

/**
 * @type {any}
 */
RadarController.overrides = {
  aspectRatio: 1,

  scales: {
    r: {
      type: 'radialLinear',
    }
  }
};
