import Scale from '../core/core.scale.js';
import {isArray, isNullOrUndef, valueOrDefault, _limitValue} from '../helpers/index.js';

// A multi-line label is an array of lines; equal lines make the same label.
const sameLabel = (a, b) => a === b ||
  (isArray(a) && isArray(b) && a.length === b.length && a.every((line, i) => line === b[i]));

function findLabel(labels, raw, fromEnd) {
  if (!isArray(raw)) {
    return fromEnd ? labels.lastIndexOf(raw) : labels.indexOf(raw);
  }
  if (!fromEnd) {
    return labels.findIndex((label) => sameLabel(label, raw));
  }
  let i = labels.length - 1;
  while (i >= 0 && !sameLabel(labels[i], raw)) {
    i--;
  }
  return i;
}

const addIfLabel = (labels, raw, index) => {
  if (typeof raw === 'string' || isArray(raw)) {
    index = labels.push(raw) - 1;
  } else if (isNaN(raw)) {
    index = null;
  }
  return index;
};

function findOrAddLabel(labels, raw, index) {
  const first = findLabel(labels, raw);
  if (first === -1) {
    return addIfLabel(labels, raw, index);
  }
  const last = findLabel(labels, raw, true);
  return first !== last ? index : first;
}

const validIndex = (index, max) => index === null ? null : _limitValue(Math.round(index), 0, max);

function _getLabelForValue(value) {
  const labels = this.getLabels();

  if (value >= 0 && value < labels.length) {
    return labels[value];
  }
  return value;
}

export default class CategoryScale extends Scale {

  static id = 'category';

  /**
   * @type {any}
   */
  static defaults = {
    ticks: {
      callback: _getLabelForValue
    }
  };

  constructor(cfg) {
    super(cfg);

    /** @type {number} */
    this._startValue = undefined;
    this._valueRange = 0;
    /** @type {any[]} */
    this._labels = undefined;
  }

  init(scaleOptions) {
    // The labels found in the data go into this axis' own copy of the label source, so the
    // user's arrays and the other axes never see them. The copy is rebuilt on every update.
    this._labels = undefined;
    super.init(scaleOptions);
    // Parsing the bounds in init() may have taken a copy before the data labels are known and
    // before the beforeUpdate hook. Drop it; beforeLayout() parses the bounds again.
    this._labels = undefined;
  }

  getLabels() {
    return this._labels || (this._labels = super.getLabels().slice());
  }

  beforeLayout() {
    super.beforeLayout();
    // Dataset parsing has now finished adding the inferred labels.
    const options = this.options;
    this._userMin = this.parse(options.min);
    this._userMax = this.parse(options.max);
    this._suggestedMin = this.parse(options.suggestedMin);
    this._suggestedMax = this.parse(options.suggestedMax);
  }

  parse(raw, index) {
    if (isNullOrUndef(raw)) {
      return null;
    }
    const labels = this.getLabels();
    index = isFinite(index) && sameLabel(labels[index], raw) ? index
      : findOrAddLabel(labels, raw, valueOrDefault(index, raw));
    return validIndex(index, labels.length - 1);
  }

  determineDataLimits() {
    const {minDefined, maxDefined} = this.getUserBounds();
    let {min, max} = this.getMinMax(true);

    if (this.options.bounds === 'ticks') {
      if (!minDefined) {
        min = 0;
      }
      if (!maxDefined) {
        max = this.getLabels().length - 1;
      }
    }

    this.min = min;
    this.max = max;
  }

  buildTicks() {
    const min = this.min;
    const max = this.max;
    const offset = this.options.offset;
    const ticks = [];
    let labels = this.getLabels();

    // If we are viewing some subset of labels, slice the original array
    labels = (min === 0 && max === labels.length - 1) ? labels : labels.slice(min, max + 1);

    this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
    this._startValue = this.min - (offset ? 0.5 : 0);

    for (let value = min; value <= max; value++) {
      ticks.push({value});
    }
    return ticks;
  }

  getLabelForValue(value) {
    return _getLabelForValue.call(this, value);
  }

  /**
	 * @protected
	 */
  configure() {
    super.configure();

    if (!this.isHorizontal()) {
      // For backward compatibility, vertical category scale reverse is inverted.
      this._reversePixels = !this._reversePixels;
    }
  }

  // Used to get data value locations. Value can either be an index or a numerical value
  getPixelForValue(value) {
    if (typeof value !== 'number') {
      value = this.parse(value);
    }

    return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
  }

  // Must override base implementation because it calls getPixelForValue
  // and category scale can have duplicate values
  getPixelForTick(index) {
    const ticks = this.ticks;
    if (index < 0 || index > ticks.length - 1) {
      return null;
    }
    return this.getPixelForValue(ticks[index].value);
  }

  getValueForPixel(pixel) {
    return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange);
  }

  getBasePixel() {
    return this.bottom;
  }
}
