import DatasetController from '../core/core.datasetController';
import defaults from '../core/core.defaults';
import {Line, Point} from '../elements/index';
import {valueOrDefault} from '../helpers/helpers.core';
import {isNumber} from '../helpers/helpers.math';
import {resolve} from '../helpers/helpers.options';

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
				options: me.resolveDatasetElementOptions()
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
	resolveDatasetElementOptions(active) {
		const me = this;
		const config = me._config;
		const options = me.chart.options;
		const lineOptions = options.elements.line;
		const values = super.resolveDatasetElementOptions(active);

		// The default behavior of lines is to break at null values, according
		// to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
		// This option gives lines the ability to span gaps
		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.lineTension, lineOptions.tension);
		values.stepped = resolve([config.stepped, lineOptions.stepped]);

		return values;
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

LineController.prototype.datasetElementType = Line;

LineController.prototype.dataElementType = Point;

LineController.prototype.datasetElementOptions = [
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
];

LineController.prototype.dataElementOptions = {
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
};
