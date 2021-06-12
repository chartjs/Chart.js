import DatasetController from '../core/core.datasetController';

export default class RadarController extends DatasetController {

  /**
	 * @protected
	 */
  getLabelAndValue(index) {
    const me = this;
    const vScale = me._cachedMeta.vScale;
    const parsed = me.getParsed(index);

    return {
      label: vScale.getLabels()[index],
      value: '' + vScale.getLabelForValue(parsed[vScale.axis])
    };
  }

  update(mode) {
    const me = this;
    const meta = me._cachedMeta;
    const line = meta.dataset;
    const points = meta.data || [];
    const labels = meta.iScale.getLabels();

    // Update Line
    line.points = points;
    // In resize mode only point locations change, so no need to set the points or options.
    if (mode !== 'resize') {
      const options = me.resolveDatasetElementOptions(mode);
      if (!me.options.showLine) {
        options.borderWidth = 0;
      }

      const properties = {
        _loop: true,
        _fullLoop: labels.length === points.length,
        options
      };

      me.updateElement(line, undefined, properties, mode);
    }

    // Update Points
    me.updateElements(points, 0, points.length, mode);
  }

  updateElements(points, start, count, mode) {
    const me = this;
    const dataset = me.getDataset();
    const scale = me._cachedMeta.rScale;
    const reset = mode === 'reset';

    for (let i = start; i < start + count; i++) {
      const point = points[i];
      const options = me.resolveDataElementOptions(i, point.active ? 'active' : mode);
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

      me.updateElement(point, i, properties, mode);
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
