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
    clipArea(ctx, area);
    doFill(ctx, {line, target, above, below, area, scale, axis, clip});
    unclipArea(ctx);
  }
}

function doFill(ctx, cfg) {
  const {line, target, above, below, area, scale, clip} = cfg;
  const property = line._loop ? 'angle' : cfg.axis;

  ctx.save();

  if (property === 'x' && below !== above) {
    clipVertical(ctx, target, area.top);
    fill(ctx, {line, target, color: above, scale, property, clip});
    ctx.restore();
    ctx.save();
    clipVertical(ctx, target, area.bottom);
  }
  fill(ctx, {line, target, color: below, scale, property, clip});

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

