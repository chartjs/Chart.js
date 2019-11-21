/**
 * Plugin based on discussion from the following Chart.js issues:
 * @see https://github.com/chartjs/Chart.js/issues/2380#issuecomment-279961569
 * @see https://github.com/chartjs/Chart.js/issues/2440#issuecomment-256461897
 */

'use strict';

var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

defaults._set('global', {
	plugins: {
		filler: {
			propagate: true
		}
	}
});

var mappers = {
	dataset: function(source) {
		var index = source.fill;
		var chart = source.chart;
		var meta = chart.getDatasetMeta(index);
		var visible = meta && chart.isDatasetVisible(index);
		var points = (visible && meta.dataset._children) || [];
		var length = points.length || 0;

		return !length ? null : function(point, i) {
			return (i < length && points[i]._view) || null;
		};
	},

	boundary: function(source) {
		var boundary = source.boundary;
		var x = boundary ? boundary.x : null;
		var y = boundary ? boundary.y : null;

		if (helpers.isArray(boundary)) {
			return function(point, i) {
				return boundary[i];
			};
		}

		return function(point) {
			return {
				x: x === null ? point.x : x,
				y: y === null ? point.y : y,
				boundary: true
			};
		};
	}
};

// @todo if (fill[0] === '#')
function decodeFill(el, index, count) {
	var model = el._model || {};
	var fillOption = model.fill;
	var fill = fillOption && typeof fillOption.target !== 'undefined' ? fillOption.target : fillOption;
	var target;

	if (fill === undefined) {
		fill = !!model.backgroundColor;
	}

	if (fill === false || fill === null) {
		return false;
	}

	if (fill === true) {
		return 'origin';
	}

	target = parseFloat(fill, 10);
	if (isFinite(target) && Math.floor(target) === target) {
		if (fill[0] === '-' || fill[0] === '+') {
			target = index + target;
		}

		if (target === index || target < 0 || target >= count) {
			return false;
		}

		return target;
	}

	switch (fill) {
	// compatibility
	case 'bottom':
		return 'start';
	case 'top':
		return 'end';
	case 'zero':
		return 'origin';
	// supported boundaries
	case 'origin':
	case 'start':
	case 'end':
		return fill;
	// invalid fill values
	default:
		return false;
	}
}

function computeLinearBoundary(source) {
	var model = source.el._model || {};
	var scale = source.scale || {};
	var fill = source.fill;
	var target = null;
	var horizontal;

	if (isFinite(fill)) {
		return null;
	}

	// Backward compatibility: until v3, we still need to support boundary values set on
	// the model (scaleTop, scaleBottom and scaleZero) because some external plugins and
	// controllers might still use it (e.g. the Smith chart).

	if (fill === 'start') {
		target = model.scaleBottom === undefined ? scale.bottom : model.scaleBottom;
	} else if (fill === 'end') {
		target = model.scaleTop === undefined ? scale.top : model.scaleTop;
	} else if (model.scaleZero !== undefined) {
		target = model.scaleZero;
	} else if (scale.getBasePixel) {
		target = scale.getBasePixel();
	}

	if (target !== undefined && target !== null) {
		if (target.x !== undefined && target.y !== undefined) {
			return target;
		}

		if (helpers.isFinite(target)) {
			horizontal = scale.isHorizontal();
			return {
				x: horizontal ? target : null,
				y: horizontal ? null : target,
				boundary: true
			};
		}
	}

	return null;
}

function computeCircularBoundary(source) {
	var scale = source.scale;
	var options = scale.options;
	var length = scale.chart.data.labels.length;
	var fill = source.fill;
	var target = [];
	var start, end, center, i, point;

	if (!length) {
		return null;
	}

	start = options.reverse ? scale.max : scale.min;
	end = options.reverse ? scale.min : scale.max;
	center = scale.getPointPositionForValue(0, start);
	for (i = 0; i < length; ++i) {
		point = fill === 'start' || fill === 'end'
			? scale.getPointPositionForValue(i, fill === 'start' ? start : end)
			: scale.getBasePosition(i);
		if (options.gridLines.circular) {
			point.cx = center.x;
			point.cy = center.y;
			point.angle = scale.getIndexAngle(i) - Math.PI / 2;
		}
		point.boundary = true;
		target.push(point);
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

function createMapper(source) {
	var fill = source.fill;
	var type = 'dataset';

	if (fill === false) {
		return null;
	}

	if (!isFinite(fill)) {
		type = 'boundary';
	}

	return mappers[type](source);
}

function isDrawable(point) {
	return point && !point.skip;
}

function fillPointsSets(ctx, curve0, curve1, len0, len1, area, pointSets) {
	const fillAreaPointsSet = [];
	const clipAboveAreaPointsSet = [];
	const clipBelowAreaPointsSet = [];
	const radialSet = [];
	const jointPoint = {};
	let i, cx, cy, r;

	if (!len0 || !len1) {
		return;
	}
	clipAboveAreaPointsSet.push({x: curve1[len1 - 1].x, y: area.top});
	clipBelowAreaPointsSet.push({x: curve0[0].x, y: area.top});
	clipBelowAreaPointsSet.push(curve0[0]);

	// building first area curve (normal)
	fillAreaPointsSet.push(curve0[0]);
	for (i = 1; i < len0; ++i) {
		curve0[i].flip = false;
		fillAreaPointsSet.push(curve0[i]);
		clipBelowAreaPointsSet.push(curve0[i]);
	}

	if (curve1[0].angle !== undefined) {
		pointSets.fill.push(fillAreaPointsSet);
		cx = curve1[0].cx;
		cy = curve1[0].cy;
		r = Math.sqrt(Math.pow(curve1[0].x - cx, 2) + Math.pow(curve1[0].y - cy, 2));
		for (i = len1 - 1; i > 0; --i) {
			radialSet.push({cx: cx, cy: cy, radius: r, startAngle: curve1[i].angle, endAngle: curve1[i - 1].angle});
		}
		if (radialSet.length) {
			pointSets.fill.push(radialSet);
		}
		return;
	}
	// joining the two area curves
	for (var key in curve1[len1 - 1]) {
		if (Object.prototype.hasOwnProperty.call(curve1[len1 - 1], key)) {
			jointPoint[key] = curve1[len1 - 1][key];
		}
	}
	jointPoint.joint = true;
	fillAreaPointsSet.push(jointPoint);

	// building opposite area curve (reverse)
	for (i = len1 - 1; i > 0; --i) {
		curve1[i].flip = true;
		clipAboveAreaPointsSet.push(curve1[i]);
		curve1[i - 1].flip = true;
		fillAreaPointsSet.push(curve1[i - 1]);
	}
	clipAboveAreaPointsSet.push(curve1[0]);
	clipAboveAreaPointsSet.push({x: curve1[0].x, y: area.top});
	clipBelowAreaPointsSet.push({x: curve0[len0 - 1].x, y: area.top});

	pointSets.clipAbove.push(clipAboveAreaPointsSet);
	pointSets.clipBelow.push(clipBelowAreaPointsSet);
	pointSets.fill.push(fillAreaPointsSet);
}

function clipAndFill(ctx, clippingPointsSets, fillingPointsSets, color, stepped, tension) {
	const lineTo = stepped ? helpers.canvas._steppedLineTo : helpers.canvas._bezierCurveTo;
	let i, ilen, j, jlen, set, target;
	if (clippingPointsSets) {
		ctx.save();
		ctx.beginPath();
		for (i = 0, ilen = clippingPointsSets.length; i < ilen; i++) {
			set = clippingPointsSets[i];
			// Have edge lines straight
			ctx.moveTo(set[0].x, set[0].y);
			ctx.lineTo(set[1].x, set[1].y);
			for (j = 2, jlen = set.length; j < jlen - 1; j++) {
				target = set[j];
				if (!target.boundary && (tension || stepped)) {
					lineTo(ctx, set[j - 1], target, target.flip, stepped);
				} else {
					ctx.lineTo(target.x, target.y);
				}
			}
			ctx.lineTo(set[j].x, set[j].y);
		}
		ctx.closePath();
		ctx.clip();
		ctx.beginPath();
	}
	for (i = 0, ilen = fillingPointsSets.length; i < ilen; i++) {
		set = fillingPointsSets[i];
		if (set[0].startAngle !== undefined) {
			for (j = 0, jlen = set.length; j < jlen; j++) {
				ctx.arc(set[j].cx, set[j].cy, set[j].radius, set[j].startAngle, set[j].endAngle, true);
			}
		} else {
			ctx.moveTo(set[0].x, set[0].y);
			for (j = 1, jlen = set.length; j < jlen; j++) {
				if (set[j].joint) {
					ctx.lineTo(set[j].x, set[j].y);
				} else {
					target = set[j];
					if (!target.boundary && (tension || stepped)) {
						lineTo(ctx, set[j - 1], target, target.flip, stepped);
					} else {
						ctx.lineTo(target.x, target.y);
					}
				}
			}
		}
	}
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
	ctx.restore();
}

function doFill(ctx, points, mapper, colors, el, area) {
	const count = points.length;
	const view = el._view;
	const loop = el._loop;
	const span = view.spanGaps;
	const stepped = view.steppedLine;
	const tension = view.tension;
	let curve0 = [];
	let curve1 = [];
	let len0 = 0;
	let len1 = 0;
	let pointSets = {clipBelow: [], clipAbove: [], fill: []};
	let i, ilen, index, p0, p1, d0, d1, loopOffset;

	ctx.save();
	ctx.beginPath();

	for (i = 0, ilen = count; i < ilen; ++i) {
		index = i % count;
		p0 = points[index]._view;
		p1 = mapper(p0, index, view);
		d0 = isDrawable(p0);
		d1 = isDrawable(p1);

		if (loop && loopOffset === undefined && d0) {
			loopOffset = i + 1;
			ilen = count + loopOffset;
		}

		if (d0 && d1) {
			len0 = curve0.push(p0);
			len1 = curve1.push(p1);
		} else if (len0 && len1) {
			if (!span) {
				fillPointsSets(ctx, curve0, curve1, len0, len1, area, pointSets);
				len0 = len1 = 0;
				curve0 = [];
				curve1 = [];
			} else {
				if (d0) {
					curve0.push(p0);
				}
				if (d1) {
					curve1.push(p1);
				}
			}
		}
	}

	fillPointsSets(ctx, curve0, curve1, len0, len1, area, pointSets);

	if (colors.below !== colors.above) {
		clipAndFill(ctx, pointSets.clipAbove, pointSets.fill, colors.above, stepped, tension);
		clipAndFill(ctx, pointSets.clipBelow, pointSets.fill, colors.below, stepped, tension);
	} else {
		clipAndFill(ctx, false, pointSets.fill, colors.above, stepped, tension);
	}
}

module.exports = {
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

			if (el && el._model && el instanceof elements.Line) {
				source = {
					visible: chart.isDatasetVisible(i),
					fill: decodeFill(el, i, count),
					chart: chart,
					scale: meta.yScale || meta.rScale,
					el: el
				};
			}

			meta.$filler = source;
			sources.push(source);
		}

		for (i = 0; i < count; ++i) {
			source = sources[i];
			if (!source) {
				continue;
			}

			source.fill = resolveTarget(sources, i, propagate);
			source.boundary = computeBoundary(source);
			source.mapper = createMapper(source);
		}
	},

	beforeDatasetsDraw: function(chart) {
		var metasets = chart._getSortedVisibleDatasetMetas();
		var ctx = chart.ctx;
		var meta, i, el, view, points, mapper, color, colors, fillOption;

		for (i = metasets.length - 1; i >= 0; --i) {
			meta = metasets[i].$filler;

			if (!meta || !meta.visible) {
				continue;
			}

			el = meta.el;
			view = el._view;
			points = el._children || [];
			mapper = meta.mapper;
			fillOption = meta.el._model.fill;
			color = view.backgroundColor || defaults.global.defaultColor;

			colors = {above: color, below: color};
			if (fillOption && typeof fillOption === 'object') {
				colors.above = fillOption.above || color;
				colors.below = fillOption.below || color;
			}
			if (mapper && points.length) {
				helpers.canvas.clipArea(ctx, chart.chartArea);
				doFill(ctx, points, mapper, colors, el, chart.chartArea);
				helpers.canvas.unclipArea(ctx);
			}
		}
	}
};
