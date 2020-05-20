import helpers from '../helpers/index';

/**
 * @typedef { import("./core.controller").default } Chart
 */

function drawFPS(chart, count, date, lastDate) {
	const fps = (1000 / (date - lastDate)) | 0;
	const ctx = chart.ctx;
	ctx.save();
	ctx.clearRect(0, 0, 50, 24);
	ctx.fillStyle = 'black';
	ctx.textAlign = 'right';
	if (count) {
		ctx.fillText(count, 50, 8);
		ctx.fillText(fps + ' fps', 50, 18);
	}
	ctx.restore();
}

/**
 * Please use the module's default export which provides a singleton instance
 */
export class Animator {
	constructor() {
		this._request = null;
		this._charts = new Map();
		this._running = false;
		this._lastDate = undefined;
	}

	/**
	 * @private
	 */
	_notify(chart, anims, date, type) {
		const callbacks = anims.listeners[type] || [];
		const numSteps = anims.duration;

		callbacks.forEach(fn => fn({
			chart,
			numSteps,
			currentStep: date - anims.start
		}));
	}

	/**
	 * @private
	 */
	_refresh() {
		const me = this;

		if (me._request) {
			return;
		}
		me._running = true;

		me._request = helpers.requestAnimFrame.call(window, () => {
			me._update();
			me._request = null;

			if (me._running) {
				me._refresh();
			}
		});
	}

	/**
	 * @private
	 */
	_update() {
		const me = this;
		const date = Date.now();
		let remaining = 0;

		me._charts.forEach((anims, chart) => {
			if (!anims.running || !anims.items.length) {
				return;
			}
			const items = anims.items;
			let i = items.length - 1;
			let draw = false;
			let item;

			for (; i >= 0; --i) {
				item = items[i];

				if (item._active) {
					item.tick(date);
					draw = true;
				} else {
					// Remove the item by replacing it with last item and removing the last
					// A lot faster than splice.
					items[i] = items[items.length - 1];
					items.pop();
				}
			}

			if (draw) {
				chart.draw();
			}

			if (chart.options.animation.debug) {
				drawFPS(chart, items.length, date, me._lastDate);
			}

			me._notify(chart, anims, date, 'progress');

			if (!items.length) {
				anims.running = false;
				me._notify(chart, anims, date, 'complete');
			}

			remaining += items.length;
		});

		me._lastDate = date;

		if (remaining === 0) {
			me._running = false;
		}
	}

	/**
	 * @private
	 */
	_getAnims(chart) {
		const charts = this._charts;
		let anims = charts.get(chart);
		if (!anims) {
			anims = {
				running: false,
				items: [],
				listeners: {
					complete: [],
					progress: []
				}
			};
			charts.set(chart, anims);
		}
		return anims;
	}

	/**
	 * @param {Chart} chart
	 * @param {string} event - event name
	 * @param {Function} cb - callback
	 */
	listen(chart, event, cb) {
		this._getAnims(chart).listeners[event].push(cb);
	}

	/**
	 * Add animations
	 * @param {Chart} chart
	 * @param {Animation[]} items - animations
	 */
	add(chart, items) {
		if (!items || !items.length) {
			return;
		}
		this._getAnims(chart).items.push(...items);
	}

	/**
	 * Counts number of active animations for the chart
	 * @param {Chart} chart
	 */
	has(chart) {
		return this._getAnims(chart).items.length > 0;
	}

	/**
	 * Start animating (all charts)
	 * @param {Chart} chart
	 */
	start(chart) {
		const anims = this._charts.get(chart);
		if (!anims) {
			return;
		}
		anims.running = true;
		anims.start = Date.now();
		anims.duration = anims.items.reduce((acc, cur) => Math.max(acc, cur._duration), 0);
		this._refresh();
	}

	running(chart) {
		if (!this._running) {
			return false;
		}
		const anims = this._charts.get(chart);
		if (!anims || !anims.running || !anims.items.length) {
			return false;
		}
		return true;
	}

	/**
	 * Stop all animations for the chart
	 * @param {Chart} chart
	 */
	stop(chart) {
		const anims = this._charts.get(chart);
		if (!anims || !anims.items.length) {
			return;
		}
		const items = anims.items;
		let i = items.length - 1;

		for (; i >= 0; --i) {
			items[i].cancel();
		}
		anims.items = [];
		this._notify(chart, anims, Date.now(), 'complete');
	}

	/**
	 * Remove chart from Animator
	 * @param {Chart} chart
	 */
	remove(chart) {
		return this._charts.delete(chart);
	}
}

// singleton instance
export default new Animator();
