import DatasetController from '../core/core.datasetController';
import defaults from '../core/core.defaults';
import {Line, Point} from '../elements/index';
import {valueOrDefault} from '../helpers/helpers.core';

defaults.set('radar', {
	aspectRatio: 1,
	spanGaps: false,
	scales: {
		r: {
			type: 'radialLinear',
		}
	},
	datasets: {
		indexAxis: 'r'
	},
	elements: {
		line: {
			fill: 'start',
			tension: 0 // no bezier in radar
		}
	}
});

export default class RadarController extends DatasetController {

	/**
	 * @protected
	 */
	getLabelAndValue(index) {
		const me = this;
		const vScale = me._cachedMeta.vScale;
		const parsed = me.getParsed(index);

		return {
			label: vScale.getLabels()[index],
			value: '' + vScale.getLabelForValue(parsed[vScale.axis])
		};
	}

	update(mode) {
		const me = this;
		const meta = me._cachedMeta;
		const line = meta.dataset;
		const points = meta.data || [];
		const labels = meta.iScale.getLabels();
		const properties = {
			points,
			_loop: true,
			_fullLoop: labels.length === points.length,
			options: me.resolveDatasetElementOptions()
		};

		me.updateElement(line, undefined, properties, mode);

		// Update Points
		me.updateElements(points, 0, mode);

		line.updateControlPoints(me.chart.chartArea);
	}

	updateElements(points, start, mode) {
		const me = this;
		const dataset = me.getDataset();
		const scale = me._cachedMeta.rScale;
		const reset = mode === 'reset';
		let i;

		for (i = 0; i < points.length; i++) {
			const point = points[i];
			const index = start + i;
			const options = me.resolveDataElementOptions(index, mode);
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

			me.updateElement(point, index, properties, mode);
		}
	}

	/**
	 * @param {boolean} [active]
	 * @protected
	 */
	resolveDatasetElementOptions(active) {
		const me = this;
		const config = me._config;
		const options = me.chart.options;
		const values = super.resolveDatasetElementOptions(active);

		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.lineTension, options.elements.line.tension);

		return values;
	}
}

RadarController.prototype.datasetElementType = Line;

RadarController.prototype.dataElementType = Point;

RadarController.prototype.datasetElementOptions = [
	'backgroundColor',
	'borderColor',
	'borderCapStyle',
	'borderDash',
	'borderDashOffset',
	'borderJoinStyle',
	'borderWidth',
	'fill'
];

RadarController.prototype.dataElementOptions = {
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
