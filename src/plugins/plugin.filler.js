/**
 * Plugin based on discussion from the following Chart.js issues:
 * @see https://github.com/chartjs/Chart.js/issues/2380#issuecomment-279961569
 * @see https://github.com/chartjs/Chart.js/issues/2440#issuecomment-256461897
 */

'use strict';

import defaults from '../core/core.defaults';
import Line, {_boundSegment, _boundSegments} from '../elements/element.line';
import {clipArea, unclipArea} from '../helpers/helpers.canvas';
import {valueOrDefault, isFinite, isArray, extend} from '../helpers/helpers.core';


defaults._set('global', {
	plugins: {
		filler: {
			propagate: true
		}
	}
});

function getLineByIndex(chart, index) {
	const meta = chart.getDatasetMeta(index);
	const visible = meta && chart.isDatasetVisible(index);
	return visible ? meta.dataset : null;
}

function parseFillOption(el) {
	const {_model: model = {}} = el;
	const fillOption = model.fill;
	let fill = valueOrDefault(fillOption && fillOption.target, fillOption);

	if (fill === undefined) {
		fill = !!model.backgroundColor;
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
function decodeFill(el, index, count) {
	const fill = parseFillOption(el);
	let target = parseFloat(fill, 10);

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
	var target = null;
	var horizontal;

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
		extend(this, opts);
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
	const length = scale._getLabels().length;
	const target = [];
	let start, end, value, i, center;

	start = options.reverse ? scale.max : scale.min;
	end = options.reverse ? scale.min : scale.max;

	value = fill === 'start' ? start
		: fill === 'end' ? end
		: scale.getBaseValue();

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
	var scale = source.scale || {};

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
			points.push({x: first.x, y});
			points.push({x: last.x, y});
		} else if (x !== null) {
			points.push({x, y: first.y});
			points.push({x, y: last.y});
		}
	});
	return points;
}

function getTarget(source) {
	const {chart, fill, el: line} = source;

	if (isFinite(fill)) {
		return getLineByIndex(chart, fill);
	}

	const boundary = computeBoundary(source);
	let points = [];
	let _loop = false;

	if (boundary instanceof simpleArc) {
		return boundary;
	}

	if (isArray(boundary)) {
		_loop = true;
		points = boundary;
	} else {
		points = pointsFromSegments(boundary, line);
	}
	return points.length ? new Line({points, options: {tension: 0}, _loop, _fullLoop: _loop}) : null;
}

function resolveTarget(sources, index, propagate) {
	var source = sources[index];
	var fill = source.fill;
	var visited = [index];
	var target;

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

const TAU = Math.PI * 2;
function getBounds(property, first, last, loop) {
	if (loop) {
		return;
	}
	let start = first[property];
	let end = last[property];

	if (property === 'angle') {
		start = (start + TAU) % TAU;
		end = (end + TAU) % TAU;
	}
	return {property, start, end};
}

function _segments(line, target, property) {
	const points = line.points;
	const tpoints = target.points;
	const parts = [];

	for (let segment of line.segments) {
		const bounds = getBounds(property, points[segment.start], points[segment.end], segment.loop);

		if (!target.segments) {
			// Special case for boundary not supporting `segments` (simpleArc)
			// Bounds are provided as `target` for partial circle, or undefined for full circle
			parts.push({source: segment, target: bounds});
			continue;
		}

		// Get all segments from `target` that intersect the bounds of current segment of `line`
		const subs = _boundSegments(target, bounds);

		for (let sub of subs) {
			const fillSources = _boundSegment(segment, points, getBounds(property, tpoints[sub.start], tpoints[sub.end], sub.loop));

			for (let source of fillSources) {
				parts.push({source, target: sub});
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
	const points = line.points;

	ctx.fillStyle = color;
	for (let i = 0, ilen = segments.length; i < ilen; ++i) {
		const {source: src, target: tgt} = segments[i];
		const first = points[src.start];
		const last = points[src.end];

		ctx.save();

		clipBounds(ctx, scale, getBounds(property, first, last));

		ctx.beginPath();

		let loop = !!line.pathSegment(ctx, src);
		if (loop) {
			ctx.closePath();
		} else {
			interpolatedLineTo(ctx, target, last, property);
		}

		loop &= target.pathSegment(ctx, tgt, {move: loop, reverse: true});
		if (!loop) {
			interpolatedLineTo(ctx, target, first, property);
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

	afterDatasetsUpdate: function(chart, options) {
		var count = (chart.data.datasets || []).length;
		var propagate = options.propagate;
		var sources = [];
		var meta, i, el, source;

		for (i = 0; i < count; ++i) {
			meta = chart.getDatasetMeta(i);
			el = meta.dataset;
			source = null;

			if (el && el.options && el instanceof Line) {
				source = {
					visible: chart.isDatasetVisible(i),
					fill: decodeFill(el, i, count),
					chart: chart,
					scale: meta.vScale,
					el: el
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

	beforeDatasetsDraw: function(chart) {
		const metasets = chart._getSortedVisibleDatasetMetas();
		const area = chart.chartArea;
		const ctx = chart.ctx;
		let i, meta;

		for (i = metasets.length - 1; i >= 0; --i) {
			meta = metasets[i].$filler;

			if (!meta || !meta.visible) {
				continue;
			}
			meta.el.updateControlPoints(area);
		}

		for (i = metasets.length - 1; i >= 0; --i) {
			meta = metasets[i].$filler;

			if (!meta || meta.fill === false) {
				continue;
			}
			const {el, target, scale} = meta;
			const lineOpts = el.options;
			const fillOption = lineOpts.fill;
			const color = lineOpts.backgroundColor || defaults.global.defaultColor;
			const {above = color, below = color} = fillOption || {};
			if (target && el.points.length) {
				clipArea(ctx, area);
				doFill(ctx, {line: el, target, above, below, area, scale});
				unclipArea(ctx);
			}
		}
	}
};
