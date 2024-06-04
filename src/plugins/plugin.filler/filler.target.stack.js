/**
 * @typedef { import('../../core/core.controller.js').default } Chart
 * @typedef { import('../../core/core.scale.js').default } Scale
 * @typedef { import('../../elements/element.point.js').default } PointElement
 */

import {LineElement} from '../../elements/index.js';
import {_isBetween} from '../../helpers/index.js';
import {_createBoundaryLine} from './filler.helper.js';

/**
 * @param {{ chart: Chart; scale: Scale; index: number; line: LineElement; }} source
 * @return {LineElement}
 */
export function _buildStackLine(source) {
  const {scale, index, line} = source;
  const points = [];
  const segments = line.segments;
  const sourcePoints = line.points;
  const linesBelow = getLinesBelow(scale, index);
  linesBelow.push(_createBoundaryLine({x: null, y: scale.bottom}, line));

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    for (let j = segment.start; j <= segment.end; j++) {
      addPointsBelow(points, sourcePoints[j], linesBelow);
    }
  }
  return new LineElement({points, options: {}});
}

/**
 * @param {Scale} scale
 * @param {number} index
 * @return {LineElement[]}
 */
function getLinesBelow(scale, index) {
  const below = [];
  const metas = scale.getMatchingVisibleMetas('line');

  for (let i = 0; i < metas.length; i++) {
    const meta = metas[i];
    if (meta.index === index) {
      break;
    }
    if (!meta.hidden) {
      below.unshift(meta.dataset);
    }
  }
  return below;
}

/**
 * @param {PointElement[]} points
 * @param {PointElement} sourcePoint
 * @param {LineElement[]} linesBelow
 */
function addPointsBelow(points, sourcePoint, linesBelow) {
  const postponed = [];
  for (let j = 0; j < linesBelow.length; j++) {
    const line = linesBelow[j];
    const {first, last, point} = findPoint(line, sourcePoint, 'x');

    if (!point || (first && last)) {
      continue;
    }
    if (first) {
      // First point of an segment -> need to add another point before this,
      // from next line below.
      postponed.unshift(point);
    } else {
      points.push(point);
      if (!last) {
        // In the middle of an segment, no need to add more points.
        break;
      }
    }
  }
  points.push(...postponed);
}

/**
 * @param {LineElement} line
 * @param {PointElement} sourcePoint
 * @param {string} property
 * @returns {{point?: PointElement, first?: boolean, last?: boolean}}
 */
function findPoint(line, sourcePoint, property) {
  const point = line.interpolate(sourcePoint, property);
  if (!point) {
    return {};
  }

  const pointValue = point[property];
  const segments = line.segments;
  const linePoints = line.points;
  let first = false;
  let last = false;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const firstValue = linePoints[segment.start][property];
    const lastValue = linePoints[segment.end][property];
    if (_isBetween(pointValue, firstValue, lastValue)) {
      first = pointValue === firstValue;
      last = pointValue === lastValue;
      break;
    }
  }
  return {first, last, point};
}
