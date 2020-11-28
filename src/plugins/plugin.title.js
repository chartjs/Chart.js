import Element from '../core/core.element';
import layouts from '../core/core.layouts';
import {PI, isArray, toPadding, toFont} from '../helpers';

const toLeftRightCenter = (align) => align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
const alignStartEnd = (align, start, end) => align === 'start' ? start : align === 'end' ? end : (start + end) / 2;

export class Title extends Element {
	constructor(config) {
		super();

		Object.assign(this, config);

		this.chart = config.chart;
		this.options = config.options;
		this.ctx = config.ctx;
		this._margins = undefined;
		this._padding = undefined;
		this.top = undefined;
		this.bottom = undefined;
		this.left = undefined;
		this.right = undefined;
		this.width = undefined;
		this.height = undefined;
		this.maxWidth = undefined;
		this.maxHeight = undefined;
		this.position = undefined;
		this.weight = undefined;
		this.fullWidth = undefined;
	}

	update(maxWidth, maxHeight, margins) {
		const me = this;

		me.maxWidth = maxWidth;
		me.maxHeight = maxHeight;
		me._margins = margins;

		me.setDimensions();

		me.fit();
	}

	setDimensions() {
		const me = this;
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
	}

	fit() {
		const me = this;
		const opts = me.options;
		const minSize = {};
		const isHorizontal = me.isHorizontal();

		if (!opts.display) {
			me.width = minSize.width = me.height = minSize.height = 0;
			return;
		}

		const lineCount = isArray(opts.text) ? opts.text.length : 1;
		me._padding = toPadding(opts.padding);
		const textSize = lineCount * toFont(opts.font, me.chart.options.font).lineHeight + me._padding.height;
		me.width = minSize.width = isHorizontal ? me.maxWidth : textSize;
		me.height = minSize.height = isHorizontal ? textSize : me.maxHeight;
	}

	isHorizontal() {
		const pos = this.options.position;
		return pos === 'top' || pos === 'bottom';
	}

	_drawArgs(offset) {
		const {top, left, bottom, right, options} = this;
		const align = options.align;
		let rotation = 0;
		let maxWidth, titleX, titleY;

		if (this.isHorizontal()) {
			titleX = alignStartEnd(align, left, right);
			titleY = top + offset;
			maxWidth = right - left;
		} else {
			if (options.position === 'left') {
				titleX = left + offset;
				titleY = alignStartEnd(align, bottom, top);
				rotation = PI * -0.5;
			} else {
				titleX = right - offset;
				titleY = alignStartEnd(align, top, bottom);
				rotation = PI * 0.5;
			}
			maxWidth = bottom - top;
		}
		return {titleX, titleY, maxWidth, rotation};
	}

	draw() {
		const me = this;
		const ctx = me.ctx;
		const opts = me.options;

		if (!opts.display) {
			return;
		}

		const fontOpts = toFont(opts.font, me.chart.options.font);
		const lineHeight = fontOpts.lineHeight;
		const offset = lineHeight / 2 + me._padding.top;
		const {titleX, titleY, maxWidth, rotation} = me._drawArgs(offset);

		ctx.save();

		ctx.fillStyle = opts.color;
		ctx.font = fontOpts.string;

		ctx.translate(titleX, titleY);
		ctx.rotate(rotation);
		ctx.textAlign = toLeftRightCenter(opts.align);
		ctx.textBaseline = 'middle';

		const text = opts.text;
		if (isArray(text)) {
			let y = 0;
			for (let i = 0; i < text.length; ++i) {
				ctx.fillText(text[i], 0, y, maxWidth);
				y += lineHeight;
			}
		} else {
			ctx.fillText(text, 0, 0, maxWidth);
		}

		ctx.restore();
	}
}

function createTitle(chart, titleOpts) {
	const title = new Title({
		ctx: chart.ctx,
		options: titleOpts,
		chart
	});

	layouts.configure(chart, title, titleOpts);
	layouts.addBox(chart, title);
	chart.titleBlock = title;
}

function removeTitle(chart) {
	const title = chart.titleBlock;
	if (title) {
		layouts.removeBox(chart, title);
		delete chart.titleBlock;
	}
}

function createOrUpdateTitle(chart, options) {
	const title = chart.titleBlock;
	if (title) {
		layouts.configure(chart, title, options);
		title.options = options;
	} else {
		createTitle(chart, options);
	}
}

export default {
	id: 'title',

	/**
	 * For tests
	 * @private
	 */
	_element: Title,

	start(chart, _args, options) {
		createTitle(chart, options);
	},

	stop(chart) {
		const titleBlock = chart.titleBlock;
		layouts.removeBox(chart, titleBlock);
		delete chart.titleBlock;
	},

	beforeUpdate(chart, _args, options) {
		if (options === false) {
			removeTitle(chart);
		} else {
			createOrUpdateTitle(chart, options);
		}
	},

	defaults: {
		align: 'center',
		display: false,
		font: {
			style: 'bold',
		},
		fullWidth: true,
		padding: 10,
		position: 'top',
		text: '',
		weight: 2000         // by default greater than legend (1000) to be above
	},

	defaultRoutes: {
		color: 'color'
	}
};
