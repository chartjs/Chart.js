'use strict';

var getRtlAdapter = function (rtl, rectX, width) {
	if (rtl) {
		return {
			x: function (x) {
				return rectX + rectX + width - x;
			},
			setWidth: function (w) {
				width = w;
			},
			textAlign: function(align) {
				if (align === 'center') return align;
				return align === 'right' ? 'left' : 'right';
			},
			xPlus: function(x, value) {
				return x - value;
			},
			leftForLtr: function(x, width) {
				return x - width;
			},
		};
	} else {
		return {
			x: function (x) {
				return x;
			},
			setWidth: function (w) {
				width = w;
			},
			textAlign: function(align) {
				return align;
			},
			xPlus: function(x, value) {
				return x + value;
			},
			leftForLtr: function(x, width) {
				return x;
			},
		};
	}
}

var overrideTextDirection = function(ctx, direction) {
	delete ctx.prevTextDirection;
	
	if (direction === 'ltr' || direction === 'rtl') {
		var original = [
			ctx.canvas.style.getPropertyValue('direction'),
			ctx.canvas.style.getPropertyPriority('direction'),
		];

		ctx.canvas.style.setProperty('direction', direction, 'important');
		ctx.prevTextDirection = original;
	}
};

var restoreTextDirection = function(ctx) {
	if (ctx.prevTextDirection === undefined)
		return;

	var original = ctx.prevTextDirection;
	delete ctx.prevTextDirection;

	ctx.canvas.style.setProperty('direction', original[0], original[1]);
};

module.exports = {
	getRtlAdapter: getRtlAdapter,
	overrideTextDirection: overrideTextDirection,
	restoreTextDirection: restoreTextDirection,
};
