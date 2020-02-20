import DatasetController from '../core/core.datasetController';
import defaults from '../core/core.defaults';
import {Point} from '../elements/index';

defaults.set('bubble', {
	animation: {
		numbers: {
			properties: ['x', 'y', 'borderWidth', 'radius']
		}
	},
	scales: {
		x: {
			type: 'linear'
		},
		y: {
			type: 'linear'
		}
	},

	tooltips: {
		callbacks: {
			title() {
				// Title doesn't make sense for scatter since we format the data as a point
				return '';
			}
		}
	}
});

export default class BubbleController extends DatasetController {

	static dataElementType = Point;

	/**
	 * Parse array of objects
	 * @protected
	 */
	parseObjectData(meta, data, start, count) {
		const {xScale, yScale} = meta;
		const parsed = [];
		let i, ilen, item;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			item = data[i];
			parsed.push({
				x: xScale.parseObject(item, 'x', i),
				y: yScale.parseObject(item, 'y', i),
				_custom: item && item.r && +item.r
			});
		}
		return parsed;
	}

	/**
	 * @protected
	 */
	getMaxOverflow() {
		const me = this;
		const meta = me._cachedMeta;
		let i = (meta.data || []).length - 1;
		let max = 0;
		for (; i >= 0; --i) {
			max = Math.max(max, Point.size(me.getStyle(i, false)), Point.size(me.getStyle(i, true)));
		}
		return max > 0 && max;
	}

	/**
	 * @protected
	 */
	getLabelAndValue(index) {
		const me = this;
		const meta = me._cachedMeta;
		const {xScale, yScale} = meta;
		const parsed = me.getParsed(index);
		const x = xScale.getLabelForValue(parsed.x);
		const y = yScale.getLabelForValue(parsed.y);
		const r = parsed._custom;

		return {
			label: meta.label,
			value: '(' + x + ', ' + y + (r ? ', ' + r : '') + ')'
		};
	}

	update(mode) {
		const me = this;
		const points = me._cachedMeta.data;

		// Update Points
		me.updateElements(points, 0, mode);
	}

	updateElements(points, start, mode) {
		const me = this;
		const reset = mode === 'reset';
		const {xScale, yScale} = me._cachedMeta;
		const firstOpts = me.resolveDataElementOptions(start, mode);
		const sharedOptions = me.getSharedOptions(mode, points[start], firstOpts);
		const includeOptions = me.includeOptions(mode, sharedOptions);

		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			const index = start + i;
			const parsed = !reset && me.getParsed(index);
			const x = reset ? xScale.getPixelForDecimal(0.5) : xScale.getPixelForValue(parsed.x);
			const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(parsed.y);
			const properties = {
				x,
				y,
				skip: isNaN(x) || isNaN(y)
			};

			if (includeOptions) {
				properties.options = me.resolveDataElementOptions(i, mode);

				if (reset) {
					properties.options.radius = 0;
				}
			}

			me.updateElement(point, index, properties, mode);
		}

		me.updateSharedOptions(sharedOptions, mode);
	}

	/**
	 * @param {number} index
	 * @param {string} [mode]
	 * @protected
	 */
	resolveDataElementOptions(index, mode) {
		const parsed = this.getParsed(index);

		// Custom options to consider at top priority.
		const custom = {
			radius: parsed && parsed._custom
		};

		const values = super.resolveDataElementOptions(index, mode, custom);

		// In `'active'` mode, `radius` is resolved from `hoverRadius`.
		// In Bubble chart we want `hoverRadius` to increase the `radius`.
		if (mode === 'active') {
			values.radius += (parsed._custom || 0);
		}

		return values;
	}
}
