'use strict';

const LineController = require('./controller.line');
const defaults = require('../core/core.defaults');

defaults._set('fastline', {
	hover: {
		mode: 'index'
	},

	scales: {
		x: {
			type: 'category',
		},
		y: {
			type: 'linear',
		},
	}
});

// TODO: expose from elements.Line
function setStyle(ctx, vm) {
	ctx.lineCap = vm.borderCapStyle;
	ctx.setLineDash(vm.borderDash);
	ctx.lineDashOffset = vm.borderDashOffset;
	ctx.lineJoin = vm.borderJoinStyle;
	ctx.lineWidth = vm.borderWidth;
	ctx.strokeStyle = vm.borderColor;
}

module.exports = LineController.extend({

	addElements: function() {},

	insertElements: function(start, count) {
		this._parse(start, count);
	},

	update: function() {
		const me = this;
		me._cachedMeta._options = me._resolveDatasetElementOptions();
	},

	updateElements: function() {
	},

	/**
	 * @private
	 */
	_getMaxOverflow: function() {
		return this._cachedMeta._options.borderWidth;
	},

	draw: function() {
		const me = this;
		const ctx = me._ctx;
		const meta = me._cachedMeta;
		const {xScale, yScale, _stacked} = meta;
		const options = meta._options;
		let i = 0;

		ctx.save();
		setStyle(ctx, options);
		ctx.beginPath();

		for (i = 0; i < meta._parsed.length; ++i) {
			const parsed = me._getParsed(i);
			const x = xScale.getPixelForValue(parsed[xScale.id]);
			const y = yScale.getPixelForValue(_stacked ? me._applyStack(yScale, parsed) : parsed[yScale.id]);

			ctx.lineTo(x, y);
		}

		ctx.stroke();
		ctx.restore();
	}
});
