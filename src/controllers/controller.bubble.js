'use strict';

import DatasetController from '../core/core.datasetController';
import defaults from '../core/core.defaults';
import Point from '../elements/element.point';
import {extend} from '../helpers/helpers.core';
import {resolve} from '../helpers/helpers.options';

defaults.set('bubble', {
	animation: {
		numbers: {
			properties: ['x', 'y', 'borderWidth', 'radius']
		}
	},
	scales: {
		x: {
			type: 'linear',
			position: 'bottom'
		},
		y: {
			type: 'linear',
			position: 'left'
		}
	},

	tooltips: {
		callbacks: {
			title: function() {
				// Title doesn't make sense for scatter since we format the data as a point
				return '';
			}
		}
	}
});

class BubbleController extends DatasetController {

	constructor(chart, datasetIndex) {
		super(chart, datasetIndex);
	}

	/**
	 * Parse array of objects
	 * @private
	 */
	_parseObjectData(meta, data, start, count) {
		const {xScale, yScale} = meta;
		const parsed = [];
		let i, ilen, item;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			item = data[i];
			parsed.push({
				x: xScale._parseObject(item, 'x', i),
				y: yScale._parseObject(item, 'y', i),
				_custom: item && item.r && +item.r
			});
		}
		return parsed;
	}

	/**
	 * @private
	 */
	_getMaxOverflow() {
		const me = this;
		const meta = me._cachedMeta;
		let i = (meta.data || []).length - 1;
		let max = 0;
		for (; i >= 0; --i) {
			max = Math.max(max, me.getStyle(i, true).radius);
		}
		return max > 0 && max;
	}

	/**
	 * @private
	 */
	_getLabelAndValue(index) {
		const me = this;
		const meta = me._cachedMeta;
		const {xScale, yScale} = meta;
		const parsed = me._getParsed(index);
		const x = xScale.getLabelForValue(parsed.x);
		const y = yScale.getLabelForValue(parsed.y);
		const r = parsed._custom;

		return {
			label: meta.label,
			value: '(' + x + ', ' + y + (r ? ', ' + r : '') + ')'
		};
	}

	/**
	 * @protected
	 */
	update(mode) {
		const me = this;
		const points = me._cachedMeta.data;

		// Update Points
		me.updateElements(points, 0, mode);
	}

	/**
	 * @protected
	 */
	updateElements(points, start, mode) {
		const me = this;
		const reset = mode === 'reset';
		const {xScale, yScale} = me._cachedMeta;
		const firstOpts = me._resolveDataElementOptions(start, mode);
		const sharedOptions = me._getSharedOptions(mode, points[start], firstOpts);
		const includeOptions = me._includeOptions(mode, sharedOptions);

		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			const index = start + i;
			const parsed = !reset && me._getParsed(index);
			const x = reset ? xScale.getPixelForDecimal(0.5) : xScale.getPixelForValue(parsed.x);
			const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(parsed.y);
			const properties = {
				x,
				y,
				skip: isNaN(x) || isNaN(y)
			};

			if (includeOptions) {
				properties.options = me._resolveDataElementOptions(i, mode);

				if (reset) {
					properties.options.radius = 0;
				}
			}

			me._updateElement(point, index, properties, mode);
		}

		me._updateSharedOptions(sharedOptions, mode);
	}

	/**
	 * @private
	 */
	_resolveDataElementOptions(index, mode) {
		var me = this;
		var chart = me.chart;
		var dataset = me.getDataset();
		var parsed = me._getParsed(index);
		var values = super._resolveDataElementOptions.apply(me, arguments);

		// Scriptable options
		var context = {
			chart: chart,
			dataIndex: index,
			dataset: dataset,
			datasetIndex: me.index
		};

		// In case values were cached (and thus frozen), we need to clone the values
		if (values.$shared) {
			values = extend({}, values, {$shared: false});
		}


		// Custom radius resolution
		if (mode !== 'active') {
			values.radius = 0;
		}
		values.radius += resolve([
			parsed && parsed._custom,
			me._config.radius,
			chart.options.elements.point.radius
		], context, index);

		return values;
	}
}

/**
 * @protected
 */
BubbleController.prototype.dataElementType = Point;

/**
 * @private
 */
BubbleController.prototype._dataElementOptions = [
	'backgroundColor',
	'borderColor',
	'borderWidth',
	'hitRadius',
	'radius',
	'pointStyle',
	'rotation'
];


export default BubbleController;
