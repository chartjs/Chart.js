import {_boundSegment, _boundSegments, _normalizeAngle} from '../../helpers/index.js';

export function _segments(line, target, property) {
  const segments = line.segments;
  const points = line.points;
  const tpoints = target.points;
  const parts = [];

  for (const segment of segments) {
    let {start, end} = segment;
    end = _findSegmentEnd(start, end, points);

    const bounds = _getBounds(property, points[start], points[end], segment.loop);

    if (!target.segments) {
      // Special case for boundary not supporting `segments` (simpleArc)
      // Bounds are provided as `target` for partial circle, or undefined for full circle
      parts.push({
        source: segment,
        target: bounds,
        start: points[start],
        end: points[end]
      });
      continue;
    }

    // Get all segments from `target` that intersect the bounds of current segment of `line`
    const targetSegments = _boundSegments(target, bounds);

    for (const tgt of targetSegments) {
      const subBounds = target._straight ? bounds : _getBounds(property, tpoints[tgt.start], tpoints[tgt.end], tgt.loop);
      const fillSources = _boundSegment(segment, points, subBounds);

      for (const fillSource of fillSources) {
        parts.push({
          source: fillSource,
          target: tgt,
          start: {
            [property]: _getEdge(bounds, subBounds, 'start', Math.max)
          },
          end: {
            [property]: _getEdge(bounds, subBounds, 'end', Math.min)
          }
        });
      }
    }
  }
  return parts;
}

export function _getBounds(property, first, last, loop) {
  if (loop) {
    return;
  }
  let start = first[property];
  let end = last[property];

  if (property === 'angle') {
    start = _normalizeAngle(start);
    end = _normalizeAngle(end);
  }
  return {property, start, end};
}

export function _pointsFromSegments(boundary, line) {
  const {x = null, y = null} = boundary || {};
  const linePoints = line.points;
  const points = [];
  line.segments.forEach(({start, end}) => {
    end = _findSegmentEnd(start, end, linePoints);
    const first = linePoints[start];
    const last = linePoints[end];
    if (y !== null) {
      points.push({x: first.x, y});
      points.push({x: last.x, y});
    } else if (x !== null) {
      points.push({x, y: first.y});
      points.push({x, y: last.y});
    }
  });
  // The boundary is a straight line, so a line that only moves forward along it
  // needs just the two ends. Every fill segment searches these points, so keeping
  // one pair per segment makes drawing quadratic in the number of segments.
  if (points.length > 2 && _isAscending(linePoints, y !== null ? 'x' : 'y')) {
    points.splice(1, points.length - 2);
  }
  return points;
}

function _isAscending(points, property) {
  let prev = -Infinity;
  for (const point of points) {
    if (!point.skip) {
      const value = point[property];
      if (!(value >= prev)) {
        return false;
      }
      prev = value;
    }
  }
  return true;
}

export function _findSegmentEnd(start, end, points) {
  for (;end > start; end--) {
    const point = points[end];
    if (!isNaN(point.x) && !isNaN(point.y)) {
      break;
    }
  }
  return end;
}

function _getEdge(a, b, prop, fn) {
  if (a && b) {
    return fn(a[prop], b[prop]);
  }
  return a ? a[prop] : b ? b[prop] : 0;
}
