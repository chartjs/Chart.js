import {isFinite} from '../../helpers/index.js';
import {_createBoundaryLine} from './filler.helper.js';
import {_getTargetPixel, _getTargetValue} from './filler.options.js';
import {_buildStackLine} from './filler.target.stack.js';
import {simpleArc} from './simpleArc.js';

/**
 * @typedef { import('../../core/core.controller.js').default } Chart
 * @typedef { import('../../core/core.scale.js').default } Scale
 * @typedef { import('../../elements/element.point.js').default } PointElement
 */

export function _getTarget(source) {
  const {chart, fill, line} = source;

  if (isFinite(fill)) {
    return getLineByIndex(chart, fill);
  }

  if (fill === 'stack') {
    return _buildStackLine(source);
  }

  if (fill === 'shape') {
    return true;
  }

  const boundary = computeBoundary(source);

  if (boundary instanceof simpleArc) {
    return boundary;
  }

  return _createBoundaryLine(boundary, line);
}

/**
 * @param {Chart} chart
 * @param {number} index
 */
function getLineByIndex(chart, index) {
  const meta = chart.getDatasetMeta(index);
  const visible = meta && chart.isDatasetVisible(index);
  return visible ? meta.dataset : null;
}

function computeBoundary(source) {
  const scale = source.scale || {};

  if (scale.getPointPositionForValue) {
    return computeCircularBoundary(source);
  }
  return computeLinearBoundary(source);
}


function computeLinearBoundary(source) {
  const {scale = {}, fill} = source;
  const pixel = _getTargetPixel(fill, scale);

  if (isFinite(pixel)) {
    const horizontal = scale.isHorizontal();

    return {
      x: horizontal ? pixel : null,
      y: horizontal ? null : pixel
    };
  }

  return null;
}

function computeCircularBoundary(source) {
  const {scale, fill} = source;
  const options = scale.options;
  const length = scale.getLabels().length;
  const start = options.reverse ? scale.max : scale.min;
  const value = _getTargetValue(fill, scale, start);
  const target = [];

  if (options.grid.circular) {
    const center = scale.getPointPositionForValue(0, start);
    return new simpleArc({
      x: center.x,
      y: center.y,
      radius: scale.getDistanceFromCenterForValue(value)
    });
  }

  for (let i = 0; i < length; ++i) {
    target.push(scale.getPointPositionForValue(i, value));
  }
  return target;
}

