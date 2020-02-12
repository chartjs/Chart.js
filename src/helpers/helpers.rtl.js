const getRtlAdapter = function(rectX, width) {
	return {
		x(x) {
			return rectX + rectX + width - x;
		},
		setWidth(w) {
			width = w;
		},
		textAlign(align) {
			if (align === 'center') {
				return align;
			}
			return align === 'right' ? 'left' : 'right';
		},
		xPlus(x, value) {
			return x - value;
		},
		leftForLtr(x, itemWidth) {
			return x - itemWidth;
		},
	};
};

const getLtrAdapter = function() {
	return {
		x(x) {
			return x;
		},
		setWidth(w) { // eslint-disable-line no-unused-vars
		},
		textAlign(align) {
			return align;
		},
		xPlus(x, value) {
			return x + value;
		},
		leftForLtr(x, _itemWidth) { // eslint-disable-line no-unused-vars
			return x;
		},
	};
};

const getAdapter = function(rtl, rectX, width) {
	return rtl ? getRtlAdapter(rectX, width) : getLtrAdapter();
};

const overrideTextDirection = function(ctx, direction) {
	let style, original;
	if (direction === 'ltr' || direction === 'rtl') {
		style = ctx.canvas.style;
		original = [
			style.getPropertyValue('direction'),
			style.getPropertyPriority('direction'),
		];

		style.setProperty('direction', direction, 'important');
		ctx.prevTextDirection = original;
	}
};

const restoreTextDirection = function(ctx, original) {
	if (original !== undefined) {
		delete ctx.prevTextDirection;
		ctx.canvas.style.setProperty('direction', original[0], original[1]);
	}
};

export {
	getAdapter as getRtlAdapter,
	overrideTextDirection,
	restoreTextDirection
};
