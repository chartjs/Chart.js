'use strict';

const defaults = require('../core/core.defaults');
const Element = require('../core/core.element');
const helpers = require('../helpers/index');
const layouts = require('../core/core.layouts');

defaults._set('global', {
	title: {
		display: false,
		fontStyle: 'bold',
		fullWidth: true,
		padding: 10,
		position: 'top',
		text: '',
		weight: 2000         // by default greater than legend (1000) to be above
	}
});

/**
 * IMPORTANT: this class is exposed publicly as Chart.Legend, backward compatibility required!
 */
class Title extends Element {
	constructor(config) {
		super();

		var me = this;
		helpers.extend(me, config);

		// Contains hit boxes for each dataset (in dataset order)
		me.legendHitBoxes = [];
	}

	// These methods are ordered by lifecycle. Utilities then follow.

	beforeUpdate() {}
	update(maxWidth, maxHeight, margins) {
		var me = this;

		// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
		me.beforeUpdate();

		// Absorb the master measurements
		me.maxWidth = maxWidth;
		me.maxHeight = maxHeight;
		me.margins = margins;

		// Dimensions
		me.beforeSetDimensions();
		me.setDimensions();
		me.afterSetDimensions();
		// Labels
		me.beforeBuildLabels();
		me.buildLabels();
		me.afterBuildLabels();

		// Fit
		me.beforeFit();
		me.fit();
		me.afterFit();
		//
		me.afterUpdate();

		return me.minSize;

	}
	afterUpdate() {}

	//

	beforeSetDimensions() {}
	setDimensions() {
		var me = this;
		// Set the unconstrained dimension before label rotation
		if (me.isHorizontal()) {
			// Reset position before calculating rotation
			me.width = me.maxWidth;
			me.left = 0;
			me.right = me.width;
		} else {
			me.height = me.maxHeight;

			// Reset position before calculating rotation
			me.top = 0;
			me.bottom = me.height;
		}

		// Reset padding
		me.paddingLeft = 0;
		me.paddingTop = 0;
		me.paddingRight = 0;
		me.paddingBottom = 0;

		// Reset minSize
		me.minSize = {
			width: 0,
			height: 0
		};
	}
	afterSetDimensions() {}

	//

	beforeBuildLabels() {}
	buildLabels() {}
	afterBuildLabels() {}

	//

	beforeFit() {}
	fit() {
		var me = this;
		var opts = me.options;
		var minSize = me.minSize = {};
		var isHorizontal = me.isHorizontal();
		var lineCount, textSize;

		if (!opts.display) {
			me.width = minSize.width = me.height = minSize.height = 0;
			return;
		}

		lineCount = helpers.isArray(opts.text) ? opts.text.length : 1;
		textSize = lineCount * helpers.options._parseFont(opts).lineHeight + opts.padding * 2;

		me.width = minSize.width = isHorizontal ? me.maxWidth : textSize;
		me.height = minSize.height = isHorizontal ? textSize : me.maxHeight;
	}
	afterFit() {}

	// Shared Methods
	isHorizontal() {
		var pos = this.options.position;
		return pos === 'top' || pos === 'bottom';
	}

	// Actually draw the title block on the canvas
	draw() {
		var me = this;
		var ctx = me.ctx;
		var opts = me.options;

		if (!opts.display) {
			return;
		}

		var fontOpts = helpers.options._parseFont(opts);
		var lineHeight = fontOpts.lineHeight;
		var offset = lineHeight / 2 + opts.padding;
		var rotation = 0;
		var top = me.top;
		var left = me.left;
		var bottom = me.bottom;
		var right = me.right;
		var maxWidth, titleX, titleY;

		ctx.fillStyle = helpers.valueOrDefault(opts.fontColor, defaults.global.defaultFontColor); // render in correct colour
		ctx.font = fontOpts.string;

		// Horizontal
		if (me.isHorizontal()) {
			titleX = left + ((right - left) / 2); // midpoint of the width
			titleY = top + offset;
			maxWidth = right - left;
		} else {
			titleX = opts.position === 'left' ? left + offset : right - offset;
			titleY = top + ((bottom - top) / 2);
			maxWidth = bottom - top;
			rotation = Math.PI * (opts.position === 'left' ? -0.5 : 0.5);
		}

		ctx.save();
		ctx.translate(titleX, titleY);
		ctx.rotate(rotation);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		var text = opts.text;
		if (helpers.isArray(text)) {
			var y = 0;
			for (var i = 0; i < text.length; ++i) {
				ctx.fillText(text[i], 0, y, maxWidth);
				y += lineHeight;
			}
		} else {
			ctx.fillText(text, 0, 0, maxWidth);
		}

		ctx.restore();
	}
}

function createNewTitleBlockAndAttach(chart, titleOpts) {
	var title = new Title({
		ctx: chart.ctx,
		options: titleOpts,
		chart: chart
	});

	layouts.configure(chart, title, titleOpts);
	layouts.addBox(chart, title);
	chart.titleBlock = title;
}

module.exports = {
	id: 'title',

	/**
	 * Backward compatibility: since 2.1.5, the title is registered as a plugin, making
	 * Chart.Title obsolete. To avoid a breaking change, we export the Title as part of
	 * the plugin, which one will be re-exposed in the chart.js file.
	 * https://github.com/chartjs/Chart.js/pull/2640
	 * @private
	 */
	_element: Title,

	beforeInit: function(chart) {
		var titleOpts = chart.options.title;

		if (titleOpts) {
			createNewTitleBlockAndAttach(chart, titleOpts);
		}
	},

	beforeUpdate: function(chart) {
		var titleOpts = chart.options.title;
		var titleBlock = chart.titleBlock;

		if (titleOpts) {
			helpers.mergeIf(titleOpts, defaults.global.title);

			if (titleBlock) {
				layouts.configure(chart, titleBlock, titleOpts);
				titleBlock.options = titleOpts;
			} else {
				createNewTitleBlockAndAttach(chart, titleOpts);
			}
		} else if (titleBlock) {
			layouts.removeBox(chart, titleBlock);
			delete chart.titleBlock;
		}
	}
};
