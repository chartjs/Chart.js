import Scale from '../core/core.scale';

function findOrAddLabel(labels, raw, index) {
	const first = labels.indexOf(raw);
	if (first === -1) {
		return typeof raw === 'string' ? labels.push(raw) - 1 : index;
	}
	const last = labels.lastIndexOf(raw);
	return first !== last ? index : first;
}

export default class CategoryScale extends Scale {

	constructor(cfg) {
		super(cfg);

		/** @type {number} */
		this._startValue = undefined;
		this._valueRange = 0;
	}

	parse(raw, index) {
		const labels = this.getLabels();
		return isFinite(index) && labels[index] === raw
			? index : findOrAddLabel(labels, raw, index);
	}

	determineDataLimits() {
		const me = this;
		const {minDefined, maxDefined} = me.getUserBounds();
		let {min, max} = me.getMinMax(true);

		if (me.options.bounds === 'ticks') {
			if (!minDefined) {
				min = 0;
			}
			if (!maxDefined) {
				max = me.getLabels().length - 1;
			}
		}

		me.min = min;
		me.max = max;
	}

	buildTicks() {
		const me = this;
		const min = me.min;
		const max = me.max;
		const offset = me.options.offset;
		const ticks = [];
		let labels = me.getLabels();

		// If we are viewing some subset of labels, slice the original array
		labels = (min === 0 && max === labels.length - 1) ? labels : labels.slice(min, max + 1);

		me._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
		me._startValue = me.min - (offset ? 0.5 : 0);

		for (let value = min; value <= max; value++) {
			ticks.push({value});
		}
		return ticks;
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

	// Must override base implementation because it calls getPixelForValue
	// and category scale can have duplicate values
	getPixelForTick(index) {
		const me = this;
		const ticks = me.ticks;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return me.getPixelForValue(ticks[index].value);
	}

	getValueForPixel(pixel) {
		const me = this;
		return Math.round(me._startValue + me.getDecimalForPixel(pixel) * me._valueRange);
	}

	getBasePixel() {
		return this.bottom;
	}
}

CategoryScale.id = 'category';

/**
 * @type {any}
 */
CategoryScale.defaults = {
	ticks: {
		callback: CategoryScale.prototype.getLabelForValue
	}
};
