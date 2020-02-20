import DatasetController from '../core/core.datasetController';
import defaults from '../core/core.defaults';
import {Line, Point} from '../elements/index';
import {valueOrDefault} from '../helpers/helpers.core';
import {isNumber} from '../helpers/helpers.math';

defaults.set('line', {
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

export default class LineController extends DatasetController {

	static datasetElementType = Line;
	static dataElementType = Point;

	constructor(chart, datasetIndex) {
		super(chart, datasetIndex);

		this._showLine = false;
	}

	update(mode) {
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
				options: me.resolveDatasetElementOptions(mode)
			};

			me.updateElement(line, undefined, properties, mode);
		}

		// Update Points
		me.updateElements(points, 0, mode);
	}

	updateElements(points, start, mode) {
		const me = this;
		const reset = mode === 'reset';
		const {xScale, yScale, _stacked} = me._cachedMeta;
		const firstOpts = me.resolveDataElementOptions(start, mode);
		const sharedOptions = me.getSharedOptions(mode, points[start], firstOpts);
		const includeOptions = me.includeOptions(mode, sharedOptions);
		const spanGaps = valueOrDefault(me._config.spanGaps, me.chart.options.spanGaps);
		const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
		let prevParsed;

		for (let i = 0; i < points.length; ++i) {
			const index = start + i;
			const point = points[i];
			const parsed = me.getParsed(index);
			const x = xScale.getPixelForValue(parsed.x);
			const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(_stacked ? me.applyStack(yScale, parsed) : parsed.y);
			const properties = {
				x,
				y,
				skip: isNaN(x) || isNaN(y),
				stop: i > 0 && (parsed.x - prevParsed.x) > maxGapLength
			};

			if (includeOptions) {
				properties.options = me.resolveDataElementOptions(index, mode);
			}

			me.updateElement(point, index, properties, mode);

			prevParsed = parsed;
		}

		me.updateSharedOptions(sharedOptions, mode);
	}

	/**
	 * @protected
	 */
	getMaxOverflow() {
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
	}

	draw() {
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
	}
}
