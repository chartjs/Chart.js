'use strict';

import DatasetController from '../core/core.datasetController';
import defaults from '../core/core.defaults';
import elements from '../elements';
import helpers from '../helpers';

const valueOrDefault = helpers.valueOrDefault;
const resolve = helpers.options.resolve;

defaults._set('line', {
	showLines: true,
	spanGaps: false,

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

export default DatasetController.extend({

	datasetElementType: elements.Line,

	dataElementType: elements.Point,

	/**
	 * @private
	 */
	_datasetElementOptions: [
		'backgroundColor',
		'borderCapStyle',
		'borderColor',
		'borderDash',
		'borderDashOffset',
		'borderJoinStyle',
		'borderWidth',
		'capBezierPoints',
		'cubicInterpolationMode',
		'fill'
	],

	/**
	 * @private
	 */
	_dataElementOptions: {
		backgroundColor: 'pointBackgroundColor',
		borderColor: 'pointBorderColor',
		borderWidth: 'pointBorderWidth',
		hitRadius: 'pointHitRadius',
		hoverHitRadius: 'pointHitRadius',
		hoverBackgroundColor: 'pointHoverBackgroundColor',
		hoverBorderColor: 'pointHoverBorderColor',
		hoverBorderWidth: 'pointHoverBorderWidth',
		hoverRadius: 'pointHoverRadius',
		pointStyle: 'pointStyle',
		radius: 'pointRadius',
		rotation: 'pointRotation'
	},

	update: function(mode) {
		const me = this;
		const meta = me._cachedMeta;
		const line = meta.dataset;
		const points = meta.data || [];
		const options = me.chart.options;
		const config = me._config;
		const showLine = me._showLine = valueOrDefault(config.showLine, options.showLines);

		// Update Line
		if (showLine && mode !== 'resize') {
			const properties = {
				points,
				options: me._resolveDatasetElementOptions()
			};

			me._updateElement(line, undefined, properties, mode);
		}

		// Update Points
		if (meta.visible) {
			me.updateElements(points, 0, mode);
		}
	},

	updateElements: function(points, start, mode) {
		const me = this;
		const reset = mode === 'reset';
		const {xScale, yScale, _stacked} = me._cachedMeta;
		const firstOpts = me._resolveDataElementOptions(start, mode);
		const sharedOptions = me._getSharedOptions(mode, points[start], firstOpts);
		const includeOptions = me._includeOptions(mode, sharedOptions);

		for (let i = 0; i < points.length; ++i) {
			const index = start + i;
			const point = points[i];
			const parsed = me._getParsed(index);
			const x = xScale.getPixelForValue(parsed.x);
			const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(_stacked ? me._applyStack(yScale, parsed) : parsed.y);
			const properties = {
				x,
				y,
				skip: isNaN(x) || isNaN(y)
			};

			if (includeOptions) {
				properties.options = me._resolveDataElementOptions(index, mode);
			}

			me._updateElement(point, index, properties, mode);
		}

		me._updateSharedOptions(sharedOptions, mode);
	},

	/**
	 * @private
	 */
	_resolveDatasetElementOptions: function() {
		const me = this;
		const config = me._config;
		const options = me.chart.options;
		const lineOptions = options.elements.line;
		const values = DatasetController.prototype._resolveDatasetElementOptions.apply(me, arguments);

		// The default behavior of lines is to break at null values, according
		// to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
		// This option gives lines the ability to span gaps
		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.lineTension, lineOptions.tension);
		values.steppedLine = resolve([config.steppedLine, lineOptions.stepped]);

		return values;
	},

	/**
	 * @private
	 */
	_getMaxOverflow: function() {
		const me = this;
		const meta = me._cachedMeta;
		const border = me._showLine && meta.dataset.options.borderWidth || 0;
		const data = meta.data || [];
		if (!data.length) {
			return border;
		}
		const firstPoint = data[0].size();
		const lastPoint = data[data.length - 1].size();
		return Math.max(border, firstPoint, lastPoint) / 2;
	},

	draw: function() {
		const me = this;
		const ctx = me._ctx;
		const chart = me.chart;
		const meta = me._cachedMeta;
		const points = meta.data || [];
		const area = chart.chartArea;
		const active = [];
		let ilen = points.length;
		let i, point;

		if (me._showLine) {
			meta.dataset.draw(ctx, area);
		}


		// Draw the points
		for (i = 0; i < ilen; ++i) {
			point = points[i];
			if (point.active) {
				active.push(point);
			} else {
				point.draw(ctx, area);
			}
		}
		for (i = 0, ilen = active.length; i < ilen; ++i) {
			active[i].draw(ctx, area);
		}
	},
});
