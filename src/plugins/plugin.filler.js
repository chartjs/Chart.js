/**
 * Plugin based on discussion from the following Chart.js issues:
 * @see https://github.com/chartjs/Chart.js/issues/2380#issuecomment-279961569
 * @see https://github.com/chartjs/Chart.js/issues/2440#issuecomment-256461897
 */

import defaults from '../core/core.defaults';
import Line from '../elements/element.line';
import {_boundSegment, _boundSegments} from '../helpers/helpers.segment';
import {clipArea, unclipArea} from '../helpers/helpers.canvas';
import {isArray, isFinite, valueOrDefault} from '../helpers/helpers.core';
import {_normalizeAngle} from '../helpers/helpers.math';

defaults.set('plugins', {
	filler: {
		propagate: true
	}
});

function getLineByIndex(chart, index) {
	const meta = chart.getDatasetMeta(index);
	const visible = meta && chart.isDatasetVisible(index);
	return visible ? meta.dataset : null;
}

function parseFillOption(line) {
	const options = line.options;
	const fillOption = options.fill;
	let fill = valueOrDefault(fillOption && fillOption.target, fillOption);

	if (fill === undefined) {
		fill = !!options.backgroundColor;
	}

	if (fill === false || fill === null) {
		return false;
	}

	if (fill === true) {
		return 'origin';
	}
	return fill;
}

// @todo if (fill[0] === '#')
function decodeFill(line, index, count) {
	const fill = parseFillOption(line);
	let target = parseFloat(fill);

	if (isFinite(target) && Math.floor(target) === target) {
		if (fill[0] === '-' || fill[0] === '+') {
			target = index + target;
		}

		if (target === index || target < 0 || target >= count) {
			return false;
		}

		return target;
	}

	return ['origin', 'start', 'end'].indexOf(fill) >= 0 ? fill : false;
}

function computeLinearBoundary(source) {
	const {scale = {}, fill} = source;
	let target = null;
	let horizontal;

	if (fill === 'start') {
		target = scale.bottom;
	} else if (fill === 'end') {
		target = scale.top;
	} else if (scale.getBasePixel) {
		target = scale.getBasePixel();
	}

	if (isFinite(target)) {
		horizontal = scale.isHorizontal();
		return {
			x: horizontal ? target : null,
			y: horizontal ? null : target
		};
	}

	return null;
}

// TODO: use elements.Arc instead
class simpleArc {
	constructor(opts) {
		this.x = opts.x;
		this.y = opts.y;
		this.radius = opts.radius;
	}

	pathSegment(ctx, bounds, opts) {
		const {x, y, radius} = this;
		bounds = bounds || {start: 0, end: Math.PI * 2};
		if (opts.reverse) {
			ctx.arc(x, y, radius, bounds.end, bounds.start, true);
		} else {
			ctx.arc(x, y, radius, bounds.start, bounds.end);
		}
		return !opts.bounds;
	}

	interpolate(point, property) {
		const {x, y, radius} = this;
		const angle = point.angle;
		if (property === 'angle') {
			return {
				x: x + Math.cos(angle) * radius,
				y: y + Math.sin(angle) * radius,
				angle
			};
		}
	}
}

function computeCircularBoundary(source) {
	const {scale, fill} = source;
	const options = scale.options;
	const length = scale.getLabels().length;
	const target = [];
	const start = options.reverse ? scale.max : scale.min;
	const end = options.reverse ? scale.min : scale.max;
	const value = fill === 'start' ? start : fill === 'end' ? end : scale.getBaseValue();
	let i, center;

	if (options.gridLines.circular) {
		center = scale.getPointPositionForValue(0, start);
		return new simpleArc({
			x: center.x,
			y: center.y,
			radius: scale.getDistanceFromCenterForValue(value)
		});
	}

	for (i = 0; i < length; ++i) {
		target.push(scale.getPointPositionForValue(i, value));
	}
	return target;
}

function computeBoundary(source) {
	const scale = source.scale || {};

	if (scale.getPointPositionForValue) {
		return computeCircularBoundary(source);
	}
	return computeLinearBoundary(source);
}

function pointsFromSegments(boundary, line) {
	const {x = null, y = null} = boundary || {};
	const linePoints = line.points;
	const points = [];
	line.segments.forEach((segment) => {
		const first = linePoints[segment.start];
		const last = linePoints[segment.end];
		if (y !== null) {
			points.push({x: first.x, y, _prop: 'x', _ref: first});
			points.push({x: last.x, y, _prop: 'x', _ref: last});
		} else if (x !== null) {
			points.push({x, y: first.y, _prop: 'y', _ref: first});
			points.push({x, y: last.y, _prop: 'y', _ref: last});
		}
	});
	return points;
}

function getTarget(source) {
	const {chart, fill, line} = source;

	if (isFinite(fill)) {
		return getLineByIndex(chart, fill);
	}

	const boundary = computeBoundary(source);
	let points = [];
	let _loop = false;
	let _refPoints = false;

	if (boundary instanceof simpleArc) {
		return boundary;
	}

	if (isArray(boundary)) {
		_loop = true;
		// @ts-ignore
		points = boundary;
	} else {
		points = pointsFromSegments(boundary, line);
		_refPoints = true;
	}
	return points.length ? new Line({
		points,
		options: {tension: 0},
		_loop,
		_fullLoop: _loop,
		_refPoints
	}) : null;
}

function resolveTarget(sources, index, propagate) {
	const source = sources[index];
	let fill = source.fill;
	const visited = [index];
	let target;

	if (!propagate) {
		return fill;
	}

	while (fill !== false && visited.indexOf(fill) === -1) {
		if (!isFinite(fill)) {
			return fill;
		}

		target = sources[fill];
		if (!target) {
			return false;
		}

		if (target.visible) {
			return fill;
		}

		visited.push(fill);
		fill = target.fill;
	}

	return false;
}

function _clip(ctx, target, clipY) {
	ctx.beginPath();
	target.path(ctx);
	ctx.lineTo(target.last().x, clipY);
	ctx.lineTo(target.first().x, clipY);
	ctx.closePath();
	ctx.clip();
}

function getBounds(property, first, last, loop) {
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

function _getEdge(a, b, prop, fn) {
	if (a && b) {
		return fn(a[prop], b[prop]);
	}
	return a ? a[prop] : b ? b[prop] : 0;
}

function _segments(line, target, property) {
	const segments = line.segments;
	const points = line.points;
	const tpoints = target.points;
	const parts = [];

	if (target._refPoints) {
		// Update properties from reference points. (In case those points are animating)
		for (let i = 0, ilen = tpoints.length; i < ilen; ++i) {
			const point = tpoints[i];
			const prop = point._prop;
			if (prop) {
				point[prop] = point._ref[prop];
			}
		}
	}

	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		const bounds = getBounds(property, points[segment.start], points[segment.end], segment.loop);

		if (!target.segments) {
			// Special case for boundary not supporting `segments` (simpleArc)
			// Bounds are provided as `target` for partial circle, or undefined for full circle
			parts.push({
				source: segment,
				target: bounds,
				start: points[segment.start],
				end: points[segment.end]
			});
			continue;
		}

		// Get all segments from `target` that intersect the bounds of current segment of `line`
		const subs = _boundSegments(target, bounds);

		for (let j = 0; j < subs.length; ++j) {
			const sub = subs[j];
			const subBounds = getBounds(property, tpoints[sub.start], tpoints[sub.end], sub.loop);
			const fillSources = _boundSegment(segment, points, subBounds);

			for (let k = 0; k < fillSources.length; k++) {
				parts.push({
					source: fillSources[k],
					target: sub,
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

function clipBounds(ctx, scale, bounds) {
	const {top, bottom} = scale.chart.chartArea;
	const {property, start, end} = bounds || {};
	if (property === 'x') {
		ctx.beginPath();
		ctx.rect(start, top, end - start, bottom - top);
		ctx.clip();
	}
}

function interpolatedLineTo(ctx, target, point, property) {
	const interpolatedPoint = target.interpolate(point, property);
	if (interpolatedPoint) {
		ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
	}
}

function _fill(ctx, cfg) {
	const {line, target, property, color, scale} = cfg;
	const segments = _segments(cfg.line, cfg.target, property);

	ctx.fillStyle = color;
	for (let i = 0, ilen = segments.length; i < ilen; ++i) {
		const {source: src, target: tgt, start, end} = segments[i];

		ctx.save();

		clipBounds(ctx, scale, getBounds(property, start, end));

		ctx.beginPath();

		const lineLoop = !!line.pathSegment(ctx, src);
		if (lineLoop) {
			ctx.closePath();
		} else {
			interpolatedLineTo(ctx, target, end, property);
		}

		const targetLoop = !!target.pathSegment(ctx, tgt, {move: lineLoop, reverse: true});
		const loop = lineLoop && targetLoop;
		if (!loop) {
			interpolatedLineTo(ctx, target, start, property);
		}

		ctx.closePath();
		ctx.fill(loop ? 'evenodd' : 'nonzero');

		ctx.restore();
	}
}

function doFill(ctx, cfg) {
	const {line, target, above, below, area, scale} = cfg;
	const property = line._loop ? 'angle' : 'x';

	ctx.save();

	if (property === 'x' && below !== above) {
		_clip(ctx, target, area.top);
		_fill(ctx, {line, target, color: above, scale, property});
		ctx.restore();
		ctx.save();
		_clip(ctx, target, area.bottom);
	}
	_fill(ctx, {line, target, color: below, scale, property});

	ctx.restore();
}

export default {
	id: 'filler',

	afterDatasetsUpdate(chart, options) {
		const count = (chart.data.datasets || []).length;
		const propagate = options.propagate;
		const sources = [];
		let meta, i, line, source;

		for (i = 0; i < count; ++i) {
			meta = chart.getDatasetMeta(i);
			line = meta.dataset;
			source = null;

			if (line && line.options && line instanceof Line) {
				source = {
					visible: chart.isDatasetVisible(i),
					fill: decodeFill(line, i, count),
					chart,
					scale: meta.vScale,
					line,
					target: undefined
				};
			}

			meta.$filler = source;
			sources.push(source);
		}

		for (i = 0; i < count; ++i) {
			source = sources[i];
			if (!source || source.fill === false) {
				continue;
			}

			source.fill = resolveTarget(sources, i, propagate);
			source.target = source.fill !== false && getTarget(source);
		}
	},

	beforeDatasetsDraw(chart) {
		const metasets = chart.getSortedVisibleDatasetMetas();
		const area = chart.chartArea;
		let i, meta;

		for (i = metasets.length - 1; i >= 0; --i) {
			meta = metasets[i].$filler;

			if (meta) {
				meta.line.updateControlPoints(area);
			}
		}
	},

	beforeDatasetDraw(chart, args) {
		const area = chart.chartArea;
		const ctx = chart.ctx;
		const meta = args.meta.$filler;

		if (!meta || meta.fill === false) {
			return;
		}

		const {line, target, scale} = meta;
		const lineOpts = line.options;
		const fillOption = lineOpts.fill;
		const color = lineOpts.backgroundColor || defaults.color;
		const {above = color, below = color} = fillOption || {};
		if (target && line.points.length) {
			clipArea(ctx, area);
			doFill(ctx, {line, target, above, below, area, scale});
			unclipArea(ctx);
		}
	}
};
