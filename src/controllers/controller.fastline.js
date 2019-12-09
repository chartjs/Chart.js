import Line from '../elements/element.line';
import LineController from './controller.line';
import defaults from '../core/core.defaults';

defaults.fastline = defaults['line'];

export default class FastLineController extends LineController {

	addElements() {}

	insertElements(start, count) {
		this.parse(start, count);
	}

	getMinMax(scale) {
		const meta = this._cachedMeta;
		const {_parsed} = meta;
		const ilen = _parsed.length;
		const isIndexScale = scale === meta.iScale;
		let min = Number.POSITIVE_INFINITY;
		let max = Number.NEGATIVE_INFINITY;
		let i, value;


		if (isIndexScale) {
			if (ilen > 0) {
				min = _parsed[0][scale.axis];
				max = _parsed[ilen - 1][scale.axis];
			}
		} else {
			for (i = 0; i < ilen; ++i) {
				value = _parsed[i][scale.id];
				min = Math.min(min, value);
				max = Math.max(max, value);
			}
		}

		return {min, max};
	}

	update() {
		const me = this;
		me._cachedMeta._options = me.resolveDatasetElementOptions();
	}

	draw() {
		const me = this;
		const ctx = me._ctx;
		const meta = me._cachedMeta;
		const {xScale, yScale, _stacked} = meta;
		const options = meta._options;
		let i = 0;

		ctx.save();
		Line._setStyle(ctx, options);
		ctx.beginPath();

		for (i = 0; i < meta._parsed.length; ++i) {
			const parsed = me.getParsed(i);
			const x = xScale.getPixelForValue(parsed[xScale.id]);
			const y = yScale.getPixelForValue(_stacked ? me.applyStack(yScale, parsed) : parsed[yScale.id]);

			ctx.lineTo(x, y);
		}

		ctx.stroke();
		ctx.restore();
	}
}
