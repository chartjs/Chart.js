import helpers from '../helpers/index';
import effects from '../helpers/helpers.easing';
import {resolve} from '../helpers/helpers.options';

const transparent = 'transparent';
const interpolators = {
	boolean(from, to, factor) {
		return factor > 0.5 ? to : from;
	},
	color(from, to, factor) {
		const c0 = helpers.color(from || transparent);
		const c1 = c0.valid && helpers.color(to || transparent);
		return c1 && c1.valid
			? c1.mix(c0, factor).hexString()
			: to;
	},
	number(from, to, factor) {
		return from + (to - from) * factor;
	}
};

export default class Animation {
	constructor(cfg, target, prop, to) {
		const currentValue = target[prop];

		to = resolve([cfg.to, to, currentValue, cfg.from]);
		const from = resolve([cfg.from, currentValue, to]);

		this._active = true;
		this._fn = cfg.fn || interpolators[cfg.type || typeof from];
		this._easing = effects[cfg.easing || 'linear'];
		this._start = Math.floor(Date.now() + (cfg.delay || 0));
		this._duration = Math.floor(cfg.duration);
		this._loop = !!cfg.loop;
		this._target = target;
		this._prop = prop;
		this._from = from;
		this._to = to;
	}

	active() {
		return this._active;
	}

	cancel() {
		const me = this;
		if (me._active) {
			// update current evaluated value, for smoother animations
			me.tick(Date.now());
			me._active = false;
		}
	}

	tick(date) {
		const me = this;
		const elapsed = date - me._start;
		const duration = me._duration;
		const prop = me._prop;
		const from = me._from;
		const loop = me._loop;
		const to = me._to;
		let factor;

		me._active = from !== to && (loop || (elapsed < duration));

		if (!me._active) {
			me._target[prop] = to;
			return;
		}

		if (elapsed < 0) {
			me._target[prop] = from;
			return;
		}

		factor = (elapsed / duration) % 2;
		factor = loop && factor > 1 ? 2 - factor : factor;
		factor = me._easing(Math.min(1, Math.max(0, factor)));

		me._target[prop] = me._fn(from, to, factor);
	}
}
