'use strict';

import DatasetController from '../core/core.datasetController';
import defaults from '../core/core.defaults';
import Line from '../elements/element.line';
import Point from '../elements/element.point';
import {valueOrDefault} from '../helpers/helpers.core';

defaults.set('radar', {
	spanGaps: false,
	scales: {
		r: {
			type: 'radialLinear',
		}
	},
	elements: {
		line: {
			tension: 0 // no bezier in radar
		}
	}
});

class RadarController extends DatasetController {

	constructor(chart, datasetIndex) {
		super(chart, datasetIndex);
	}

	/**
	 * @private
	 */
	_getIndexScaleId() {
		return this._cachedMeta.rAxisID;
	}

	/**
	 * @private
	 */
	_getValueScaleId() {
		return this._cachedMeta.rAxisID;
	}

	/**
	 * @private
	 */
	_getLabelAndValue(index) {
		const me = this;
		const vScale = me._cachedMeta.vScale;
		const parsed = me._getParsed(index);

		return {
			label: vScale._getLabels()[index],
			value: '' + vScale.getLabelForValue(parsed[vScale.axis])
		};
	}

	update(mode) {
		const me = this;
		const meta = me._cachedMeta;
		const line = meta.dataset;
		const points = meta.data || [];
		const labels = meta.iScale._getLabels();
		const properties = {
			points,
			_loop: true,
			_fullLoop: labels.length === points.length,
			options: me._resolveDatasetElementOptions()
		};

		me._updateElement(line, undefined, properties, mode);

		// Update Points
		me.updateElements(points, 0, mode);

		line.updateControlPoints(me.chart.chartArea);
	}

	updateElements(points, start, mode) {
		const me = this;
		const dataset = me.getDataset();
		const scale = me.chart.scales.r;
		const reset = mode === 'reset';
		let i;

		for (i = 0; i < points.length; i++) {
			const point = points[i];
			const index = start + i;
			const options = me._resolveDataElementOptions(index);
			const pointPosition = scale.getPointPositionForValue(index, dataset.data[index]);

			const x = reset ? scale.xCenter : pointPosition.x;
			const y = reset ? scale.yCenter : pointPosition.y;

			const properties = {
				x,
				y,
				angle: pointPosition.angle,
				skip: isNaN(x) || isNaN(y),
				options
			};

			me._updateElement(point, index, properties, mode);
		}
	}

	/**
	 * @private
	 */
	_resolveDatasetElementOptions() {
		const me = this;
		const config = me._config;
		const options = me.chart.options;
		const values = super._resolveDatasetElementOptions.apply(me, arguments);

		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.lineTension, options.elements.line.tension);

		return values;
	}
}

RadarController.prototype.datasetElementType = Line;

RadarController.prototype.dataElementType = Point;

/**
 * @private
 */
RadarController.prototype._datasetElementOptions = [
	'backgroundColor',
	'borderColor',
	'borderCapStyle',
	'borderDash',
	'borderDashOffset',
	'borderJoinStyle',
	'borderWidth',
	'fill'
];

/**
 * @private
 */
RadarController.prototype._dataElementOptions = {
	backgroundColor: 'pointBackgroundColor',
	borderColor: 'pointBorderColor',
	borderWidth: 'pointBorderWidth',
	hitRadius: 'pointHitRadius',
	hoverBackgroundColor: 'pointHoverBackgroundColor',
	hoverBorderColor: 'pointHoverBorderColor',
	hoverBorderWidth: 'pointHoverBorderWidth',
	hoverRadius: 'pointHoverRadius',
	pointStyle: 'pointStyle',
	radius: 'pointRadius',
	rotation: 'pointRotation'
};

export default RadarController;
