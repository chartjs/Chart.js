import effects from '../helpers/helpers.easing.js';
import {resolve} from '../helpers/helpers.options.js';
import {color as helpersColor} from '../helpers/helpers.color.js';

const transparent = 'transparent';
const interpolators = {
  boolean(from, to, factor) {
    return factor > 0.5 ? to : from;
  },
  /**
   * @param {string} from
   * @param {string} to
   * @param {number} factor
   */
  color(from, to, factor) {
    const c0 = helpersColor(from || transparent);
    const c1 = c0.valid && helpersColor(to || transparent);
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
    this._easing = effects[cfg.easing] || effects.linear;
    this._start = Math.floor(Date.now() + (cfg.delay || 0));
    this._duration = this._total = Math.floor(cfg.duration);
    this._loop = !!cfg.loop;
    this._target = target;
    this._prop = prop;
    this._from = from;
    this._to = to;
    this._promises = undefined;
  }

  active() {
    return this._active;
  }

  update(cfg, to, date) {
    if (this._active) {
      this._notify(false);

      const currentValue = this._target[this._prop];
      const elapsed = date - this._start;
      const remain = this._duration - elapsed;
      this._start = date;
      this._duration = Math.floor(Math.max(remain, cfg.duration));
      this._total += elapsed;
      this._loop = !!cfg.loop;
      this._to = resolve([cfg.to, to, currentValue, cfg.from]);
      this._from = resolve([cfg.from, currentValue, to]);
    }
  }

  cancel() {
    if (this._active) {
      // update current evaluated value, for smoother animations
      this.tick(Date.now());
      this._active = false;
      this._notify(false);
    }
  }

  tick(date) {
    const elapsed = date - this._start;
    const duration = this._duration;
    const prop = this._prop;
    const from = this._from;
    const loop = this._loop;
    const to = this._to;
    let factor;

    this._active = from !== to && (loop || (elapsed < duration));

    if (!this._active) {
      this._target[prop] = to;
      this._notify(true);
      return;
    }

    if (elapsed < 0) {
      this._target[prop] = from;
      return;
    }

    factor = (elapsed / duration) % 2;
    factor = loop && factor > 1 ? 2 - factor : factor;
    factor = this._easing(Math.min(1, Math.max(0, factor)));

    this._target[prop] = this._fn(from, to, factor);
  }

  wait() {
    const promises = this._promises || (this._promises = []);
    return new Promise((res, rej) => {
      promises.push({res, rej});
    });
  }

  _notify(resolved) {
    const method = resolved ? 'res' : 'rej';
    const promises = this._promises || [];
    for (let i = 0; i < promises.length; i++) {
      promises[i][method]();
    }
  }
}
