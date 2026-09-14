import {clipArea, unclipArea, getDatasetClipArea} from '../../helpers/index.js';
import {_findSegmentEnd, _getBounds, _segments} from './filler.segment.js';
import {_getTarget} from './filler.target.js';

export function _drawfill(ctx, source, area) {
  const target = _getTarget(source);
  const {chart, index, line, scale, axis} = source;
  const lineOpts = line.options;
  const fillOption = lineOpts.fill;
  const color = lineOpts.backgroundColor;
  const {above = color, below = color} = fillOption || {};
  const meta = chart.getDatasetMeta(index);
  const clip = getDatasetClipArea(chart, meta);
  if (target && line.points.length) {
    clipArea(ctx, clipToIndexBounds(area, meta.iScale));
    doFill(ctx, {line, target, above, below, area, scale, axis, clip});
    unclipArea(ctx);
  }
}

// The line's stroke is limited to the index scale's min/max pixel bounds
// (see LineController#update -> _getStartAndCountOfVisiblePoints). Clip the
// fill to the same bounds so it doesn't extend past the stroke when
// `offset: true` insets tick pixels from the chart area edges.
function clipToIndexBounds(area, iScale) {
  // Radial scales (e.g. radar charts) aren't cartesian: min/max pixels
  // don't correspond to a left/right or top/bottom bound.
  if (!iScale || iScale.getPointPositionForValue) {
    return area;
  }
  const p1 = iScale.getPixelForValue(iScale.min);
  const p2 = iScale.getPixelForValue(iScale.max);
  const lo = Math.min(p1, p2);
  const hi = Math.max(p1, p2);
  return iScale.isHorizontal()
    ? {...area, left: Math.max(area.left, lo), right: Math.min(area.right, hi)}
    : {...area, top: Math.max(area.top, lo), bottom: Math.min(area.bottom, hi)};
}

function doFill(ctx, cfg) {
  const {line, target, above, below, area, scale, clip} = cfg;
  const property = line._loop ? 'angle' : cfg.axis;

  ctx.save();

  let fillColor = below;
  if (below !== above) {
    if (property === 'x') {
      clipVertical(ctx, target, area.top);
      fill(ctx, {line, target, color: above, scale, property, clip});
      ctx.restore();
      ctx.save();
      clipVertical(ctx, target, area.bottom);
    } else if (property === 'y') {
      clipHorizontal(ctx, target, area.left);
      fill(ctx, {line, target, color: below, scale, property, clip});
      ctx.restore();
      ctx.save();
      clipHorizontal(ctx, target, area.right);
      fillColor = above;
    }
  }
  fill(ctx, {line, target, color: fillColor, scale, property, clip});

  ctx.restore();
}

function clipVertical(ctx, target, clipY) {
  const {segments, points} = target;
  let first = true;
  let lineLoop = false;

  ctx.beginPath();
  for (const segment of segments) {
    const {start, end} = segment;
    const firstPoint = points[start];
    const lastPoint = points[_findSegmentEnd(start, end, points)];
    if (first) {
      ctx.moveTo(firstPoint.x, firstPoint.y);
      first = false;
    } else {
      ctx.lineTo(firstPoint.x, clipY);
      ctx.lineTo(firstPoint.x, firstPoint.y);
    }
    lineLoop = !!target.pathSegment(ctx, segment, {move: lineLoop});
    if (lineLoop) {
      ctx.closePath();
    } else {
      ctx.lineTo(lastPoint.x, clipY);
    }
  }

  ctx.lineTo(target.first().x, clipY);
  ctx.closePath();
  ctx.clip();
}

function clipHorizontal(ctx, target, clipX) {
  const {segments, points} = target;
  let first = true;
  let lineLoop = false;

  ctx.beginPath();
  for (const segment of segments) {
    const {start, end} = segment;
    const firstPoint = points[start];
    const lastPoint = points[_findSegmentEnd(start, end, points)];
    if (first) {
      ctx.moveTo(firstPoint.x, firstPoint.y);
      first = false;
    } else {
      ctx.lineTo(clipX, firstPoint.y);
      ctx.lineTo(firstPoint.x, firstPoint.y);
    }
    lineLoop = !!target.pathSegment(ctx, segment, {move: lineLoop});
    if (lineLoop) {
      ctx.closePath();
    } else {
      ctx.lineTo(clipX, lastPoint.y);
    }
  }

  ctx.lineTo(clipX, target.first().y);
  ctx.closePath();
  ctx.clip();
}

function fill(ctx, cfg) {
  const {line, target, property, color, scale, clip} = cfg;
  const segments = _segments(line, target, property);

  for (const {source: src, target: tgt, start, end} of segments) {
    const {style: {backgroundColor = color} = {}} = src;
    const notShape = target !== true;

    ctx.save();
    ctx.fillStyle = backgroundColor;

    clipBounds(ctx, scale, clip, notShape && _getBounds(property, start, end));

    ctx.beginPath();

    const lineLoop = !!line.pathSegment(ctx, src);

    let loop;
    if (notShape) {
      if (lineLoop) {
        ctx.closePath();
      } else {
        interpolatedLineTo(ctx, target, end, property);
      }

      const targetLoop = !!target.pathSegment(ctx, tgt, {move: lineLoop, reverse: true});
      loop = lineLoop && targetLoop;
      if (!loop) {
        interpolatedLineTo(ctx, target, start, property);
      }
    }

    ctx.closePath();
    ctx.fill(loop ? 'evenodd' : 'nonzero');

    ctx.restore();
  }
}

function clipBounds(ctx, scale, clip, bounds) {
  const chartArea = scale.chart.chartArea;
  const {property, start, end} = bounds || {};

  if (property === 'x' || property === 'y') {
    let left, top, right, bottom;

    if (property === 'x') {
      left = start;
      top = chartArea.top;
      right = end;
      bottom = chartArea.bottom;
    } else {
      left = chartArea.left;
      top = start;
      right = chartArea.right;
      bottom = end;
    }

    ctx.beginPath();

    if (clip) {
      left = Math.max(left, clip.left);
      right = Math.min(right, clip.right);
      top = Math.max(top, clip.top);
      bottom = Math.min(bottom, clip.bottom);
    }

    ctx.rect(left, top, right - left, bottom - top);
    ctx.clip();
  }
}

function interpolatedLineTo(ctx, target, point, property) {
  const interpolatedPoint = target.interpolate(point, property);
  if (interpolatedPoint) {
    ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
  }
}

