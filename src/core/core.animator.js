'use strict';

const helpers = require('../helpers/index');

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

class Animator {
	constructor() {
		this._request = null;
		this._charts = new Map();
		this._running = false;
	}

	/**
	 * @private
	 */
	_notify(anims, type, args) {
		const callbacks = anims._listeners[type] || [];
		callbacks.forEach(fn => fn(args || []));
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

		me._request = helpers.requestAnimFrame.call(window, function() {
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
		const date = Date.now();
		const charts = this._charts;
		let remaining = 0;

		for (let [chart, anims] of charts) {
			if (!anims.running || !anims.items.length) {
				continue;
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
				if (chart.options.animation.fps) {
					drawFPS(chart, items.length, date, this._lastDate);
				}
			}

			if (!items.length) {
				anims.running = false;
				this._notify(chart, 'complete');
			}

			remaining += items.length;
		}

		this._lastDate = date;

		if (remaining === 0) {
			this._running = false;
		}
	}

	_getAnims(chart) {
		const charts = this._charts;
		let anims = charts.get(chart);
		if (!anims) {
			anims = {
				running: false,
				items: [],
				listeners: {complete: []}
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
		this._notify(chart, 'complete');
	}
}

const instance = new Animator();

module.exports = instance;
