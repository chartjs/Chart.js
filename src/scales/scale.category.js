import Scale from '../core/core.scale';

const defaultConfig = {
};

export default class CategoryScale extends Scale {

	static id = 'category';
	// INTERNAL: static default options, registered in src/index.js
	static defaults = defaultConfig;

	constructor(cfg) {
		super(cfg);

		this._numLabels = 0;
		/** @type {number} */
		this._startValue = undefined;
		this._valueRange = 0;
	}

	parse(raw, index) {
		const labels = this.getLabels();
		if (labels[index] === raw) {
			return index;
		}
		const first = labels.indexOf(raw);
		const last = labels.lastIndexOf(raw);
		return first === -1 || first !== last ? index : first;
	}

	determineDataLimits() {
		const me = this;
		const max = me.getLabels().length - 1;

		me.min = Math.max(me._userMin || 0, 0);
		me.max = Math.min(me._userMax || max, max);
	}

	buildTicks() {
		const me = this;
		const min = me.min;
		const max = me.max;
		const offset = me.options.offset;
		let labels = me.getLabels();

		// If we are viewing some subset of labels, slice the original array
		labels = (min === 0 && max === labels.length - 1) ? labels : labels.slice(min, max + 1);

		me._numLabels = labels.length;
		me._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
		me._startValue = me.min - (offset ? 0.5 : 0);

		return labels.map((l) => ({value: l}));
	}

	getLabelForValue(value) {
		const me = this;
		const labels = me.getLabels();

		if (value >= 0 && value < labels.length) {
			return labels[value];
		}
		return value;
	}

	/**
	 * @protected
	 */
	configure() {
		const me = this;

		super.configure();

		if (!me.isHorizontal()) {
			// For backward compatibility, vertical category scale reverse is inverted.
			me._reversePixels = !me._reversePixels;
		}
	}

	// Used to get data value locations. Value can either be an index or a numerical value
	getPixelForValue(value) {
		const me = this;

		if (typeof value !== 'number') {
			value = me.parse(value);
		}

		return me.getPixelForDecimal((value - me._startValue) / me._valueRange);
	}

	getPixelForTick(index) {
		const me = this;
		const ticks = me.ticks;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return me.getPixelForValue(index * me._numLabels / ticks.length + me.min);
	}

	getValueForPixel(pixel) {
		const me = this;
		const value = Math.round(me._startValue + me.getDecimalForPixel(pixel) * me._valueRange);
		return Math.min(Math.max(value, 0), me.ticks.length - 1);
	}

	getBasePixel() {
		return this.bottom;
	}
}
