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

		return function(point) {
			return {
				x: x === null ? point.x : x,
				y: y === null ? point.y : y,
			};
		};
	}
};

// @todo if (fill[0] === '#')
function decodeFill(el, index, count) {
	var model = el._model || {};
	var fill = model.fill;
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

function computeBoundary(source) {
	var model = source.el._model || {};
	var scale = source.el._scale || {};
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
	} else if (scale.getBasePosition) {
		target = scale.getBasePosition();
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
				y: horizontal ? null : target
			};
		}
	}

	return null;
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

function drawArea(ctx, curve0, curve1, len0, len1, mode, area) {
	var i, above, below;
	var fillAreaPointsSet = [];
	var clipAreaPointsSet = [];

	if (!len0 || !len1) {
		return;
	}

	switch (mode) {
	case 'above':
		above = true;
		break;
	case 'below':
		below = true;
		break;
	default:
		above = false;
		below = false;
	}

	if (below || above) {
		if (above) {
			clipAreaPointsSet.push({x: curve1[len1 - 1].x, y: area.top});
		} else {
			clipAreaPointsSet.push({x: curve0[0].x, y: area.top});
			clipAreaPointsSet.push(curve0[0]);
		}
	}

	// building first area curve (normal)
	fillAreaPointsSet.push(curve0[0]);
	for (i = 1; i < len0; ++i) {
		curve0[i].flip = false;
		fillAreaPointsSet.push(curve0[i]);
		if (below) {
			clipAreaPointsSet.push(curve0[i]);
		}
	}

	// joining the two area curves
	curve1[len1 - 1].joint = true;
	fillAreaPointsSet.push(curve1[len1 - 1]);

	// building opposite area curve (reverse)
	for (i = len1 - 1; i > 0; --i) {
		if (above) {
			clipAreaPointsSet.push(curve1[i]);
		}
		curve1[i - 1].flip = true;
		fillAreaPointsSet.push(curve1[i - 1]);
	}
	if (above || below) {
		if (above) {
			clipAreaPointsSet.push(curve1[0]);
			clipAreaPointsSet.push({x: curve1[0].x, y: area.top});
		} else {
			clipAreaPointsSet.push({x: curve0[len0 - 1].x, y: area.top});
		}
	}
	return [clipAreaPointsSet, fillAreaPointsSet];
}

function doFill(ctx, points, mapper, view, color, loop, mode, area) {
	var count = points.length;
	var span = view.spanGaps;
	var curve0 = [];
	var curve1 = [];
	var len0 = 0;
	var len1 = 0;
	var fillAreaPointsSets = [];
	var clipAreaPointsSets = [];
	var specMode = mode === 'all' || mode === 'above' || mode === 'below';
	var i, ilen, index, p0, p1, d0, d1, sets;

	ctx.save();
	ctx.beginPath();

	for (i = 0, ilen = (count + !!loop); i < ilen; ++i) {
		index = i % count;
		p0 = points[index]._view;
		p1 = mapper(p0, index, view);
		d0 = isDrawable(p0);
		d1 = isDrawable(p1);

		if (d0 && d1) {
			len0 = curve0.push(p0);
			len1 = curve1.push(p1);
		} else if (len0 && len1) {
			if (!span) {
				sets = drawArea(ctx, curve0, curve1, len0, len1, mode, area);
				if (specMode && sets) {
					clipAreaPointsSets.push(sets[0]);
					fillAreaPointsSets.push(sets[1]);
				}
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

	sets = drawArea(ctx, curve0, curve1, len0, len1, mode, area);
	if (specMode && sets) {
		clipAreaPointsSets.push(sets[0]);
		fillAreaPointsSets.push(sets[1]);
	}

	var j, jlen, set;
	if (mode !== 'all') {
		for (i = 0; i < clipAreaPointsSets.length; i++) {
			set = clipAreaPointsSets[i];
			jlen = set.length;
			// Have edge lines straight
			ctx.moveTo(set[0].x, set[0].y);
			ctx.lineTo(set[1].x, set[1].y);
			for (j = 2; j < jlen - 1; j++) {
				helpers.canvas.lineTo(ctx, set[j - 1], set[j]);
			}
			ctx.lineTo(set[j].x, set[j].y);
		}
		ctx.closePath();
		ctx.clip();
		ctx.beginPath();
	}
	for (i = 0; i < fillAreaPointsSets.length; i++) {
		set = fillAreaPointsSets[i];
		jlen = set.length;
		ctx.moveTo(set[0].x, set[0].y);
		for (j = 1; j < jlen; j++) {
			if (set[j].joint) {
				ctx.lineTo(set[j].x, set[j].y);
			} else {
				helpers.canvas.lineTo(ctx, set[j - 1], set[j], set[j].flip);
			}
		}
	}

	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
	ctx.restore();
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

	beforeDatasetDraw: function(chart, args) {
		var meta = args.meta.$filler;
		var mode = chart.options.plugins.filler.mode || 'all';
		if (!meta) {
			return;
		}

		var ctx = chart.ctx;
		var el = meta.el;
		var view = el._view;
		var points = el._children || [];
		var mapper = meta.mapper;
		var color = view.backgroundColor || defaults.global.defaultColor;

		if (mapper && color && points.length) {
			helpers.canvas.clipArea(ctx, chart.chartArea);
			doFill(ctx, points, mapper, view, color, el._loop, mode, chart.chartArea);
			helpers.canvas.unclipArea(ctx);
		}
	}
};
