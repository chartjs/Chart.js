'use strict';

import BarController from './controller.bar';
import defaults from '../core/core.defaults';

defaults.set('horizontalBar', {
	hover: {
		mode: 'index',
		axis: 'y'
	},

	scales: {
		x: {
			type: 'linear',
			position: 'bottom',
			beginAtZero: true
		},
		y: {
			type: 'category',
			position: 'left',
			offset: true,
			gridLines: {
				offsetGridLines: true
			}
		}
	},

	datasets: {
		categoryPercentage: 0.8,
		barPercentage: 0.9
	},

	elements: {
		rectangle: {
			borderSkipped: 'left'
		}
	},

	tooltips: {
		mode: 'index',
		axis: 'y'
	}
});

class HorizontalBarController extends BarController {

	constructor(chart, datasetIndex) {
		super(chart, datasetIndex);
	}

	/**
	 * @private
	 */
	_getValueScaleId() {
		return this._cachedMeta.xAxisID;
	}

	/**
	 * @private
	 */
	_getIndexScaleId() {
		return this._cachedMeta.yAxisID;
	}
}

export default HorizontalBarController;
