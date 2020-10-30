import DatasetController from '../core/core.datasetController';
import {valueOrDefault} from '../helpers/helpers.core';

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

		// Update Line
		// In resize mode only point locations change, so no need to set the points or options.
		if (mode !== 'resize') {
			const properties = {
				points,
				_loop: true,
				_fullLoop: labels.length === points.length,
				options: me.resolveDatasetElementOptions()
			};

			me.updateElement(line, undefined, properties, mode);
		}

		// Update Points
		me.updateElements(points, 0, points.length, mode);
	}

	updateElements(points, start, count, mode) {
		const me = this;
		const dataset = me.getDataset();
		const scale = me._cachedMeta.rScale;
		const reset = mode === 'reset';

		for (let i = start; i < start + count; i++) {
			const point = points[i];
			const options = me.resolveDataElementOptions(i, mode);
			const pointPosition = scale.getPointPositionForValue(i, dataset.data[i]);

			const x = reset ? scale.xCenter : pointPosition.x;
			const y = reset ? scale.yCenter : pointPosition.y;

			const properties = {
				x,
				y,
				angle: pointPosition.angle,
				skip: isNaN(x) || isNaN(y),
				options
			};

			me.updateElement(point, i, properties, mode);
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
		const showLine = valueOrDefault(config.showLine, options.showLine);

		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.tension, options.elements.line.tension);

		if (!showLine) {
			values.borderWidth = 0;
		}

		return values;
	}
}

RadarController.id = 'radar';

/**
 * @type {any}
 */
RadarController.defaults = {
	datasetElementType: 'line',
	datasetElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderCapStyle',
		'borderDash',
		'borderDashOffset',
		'borderJoinStyle',
		'borderWidth',
		'fill'
	],

	dataElementType: 'point',
	dataElementOptions: {
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
	},

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
};
