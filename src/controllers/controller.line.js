import DatasetController from '../core/core.datasetController';
import {valueOrDefault} from '../helpers/helpers.core';
import {isNumber} from '../helpers/helpers.math';
import {resolve} from '../helpers/helpers.options';
import {_lookupByKey} from '../helpers/helpers.collection';

export default class LineController extends DatasetController {

	initialize() {
		this.enableOptionSharing = true;
		super.initialize();
	}

	update(mode) {
		const me = this;
		const meta = me._cachedMeta;
		const {dataset: line, data: points = []} = meta;
		const {start, count} = getStartAndCountOfVisiblePoints(meta, points);

		me._drawStart = start;
		me._drawCount = count;

		// Update Line
		// In resize mode only point locations change, so no need to set the points or options.
		if (mode !== 'resize') {
			const properties = {
				points,
				options: me.resolveDatasetElementOptions()
			};

			me.updateElement(line, undefined, properties, mode);
		}

		// Update Points
		me.updateElements(points, start, count, mode);
	}

	updateElements(points, start, count, mode) {
		const me = this;
		const reset = mode === 'reset';
		const {xScale, yScale, _stacked} = me._cachedMeta;
		const firstOpts = me.resolveDataElementOptions(start, mode);
		const sharedOptions = me.getSharedOptions(firstOpts);
		const includeOptions = me.includeOptions(mode, sharedOptions);
		const spanGaps = valueOrDefault(me._config.spanGaps, me.chart.options.spanGaps);
		const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
		let prevParsed = start > 0 && me.getParsed(start - 1);

		for (let i = start; i < start + count; ++i) {
			const point = points[i];
			const parsed = me.getParsed(i);
			const x = xScale.getPixelForValue(parsed.x, i);
			const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(_stacked ? me.applyStack(yScale, parsed) : parsed.y, i);
			const properties = {
				x,
				y,
				skip: isNaN(x) || isNaN(y),
				stop: i > 0 && (parsed.x - prevParsed.x) > maxGapLength
			};

			if (includeOptions) {
				properties.options = sharedOptions || me.resolveDataElementOptions(i, mode);
			}

			me.updateElement(point, i, properties, mode);

			prevParsed = parsed;
		}

		me.updateSharedOptions(sharedOptions, mode, firstOpts);
	}

	/**
	 * @param {boolean} [active]
	 * @protected
	 */
	resolveDatasetElementOptions(active) {
		const me = this;
		const config = me._config;
		const options = me.chart.options;
		const lineOptions = options.elements.line;
		const values = super.resolveDatasetElementOptions(active);
		const showLine = valueOrDefault(config.showLine, options.showLines);

		// The default behavior of lines is to break at null values, according
		// to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
		// This option gives lines the ability to span gaps
		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.lineTension, lineOptions.tension);
		values.stepped = resolve([config.stepped, lineOptions.stepped]);

		if (!showLine) {
			values.borderWidth = 0;
		}

		return values;
	}

	/**
	 * @protected
	 */
	getMaxOverflow() {
		const me = this;
		const meta = me._cachedMeta;
		const border = meta.dataset.options.borderWidth || 0;
		const data = meta.data || [];
		if (!data.length) {
			return border;
		}
		const firstPoint = data[0].size();
		const lastPoint = data[data.length - 1].size();
		return Math.max(border, firstPoint, lastPoint) / 2;
	}

	draw() {
		this._cachedMeta.dataset.updateControlPoints(this.chart.chartArea);
		super.draw();
	}
}

LineController.id = 'line';

/**
 * @type {any}
 */
LineController.defaults = {
	datasetElementType: 'line',
	datasetElementOptions: [
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

	dataElementType: 'point',
	dataElementOptions: {
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

	showLines: true,
	spanGaps: false,

	hover: {
		mode: 'index'
	},

	scales: {
		_index_: {
			type: 'category',
		},
		_value_: {
			type: 'linear',
		},
	}
};

function getStartAndCountOfVisiblePoints(meta, points) {
	const pointCount = points.length;

	let start = 0;
	let count = pointCount;

	if (meta._sorted) {
		const {iScale, _parsed} = meta;
		const {min, max, minDefined, maxDefined} = iScale.getUserBounds();
		start = minDefined ? Math.max(0, _lookupByKey(_parsed, iScale.axis, min).lo) : 0;
		count = (maxDefined ? Math.min(pointCount, _lookupByKey(_parsed, iScale.axis, max).hi + 1) : pointCount) - start;
	}

	return {start, count};
}
