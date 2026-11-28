import effects from '../helpers/helpers.easing.js';
import {resolve} from '../helpers/helpers.options.js';
import {color as helpersColor} from '../helpers/helpers.color.js';
import type {AnyObject} from '../types/basic.js';

const transparent = 'transparent';
const interpolators = {
  boolean(from: unknown, to: unknown, factor: number) {
    return factor > 0.5 ? to : from;
  },
  color(from: string, to: string, factor: number) {
    const c0 = helpersColor(from || transparent);
    const c1 = c0.valid && helpersColor(to || transparent);
    return c1 && c1.valid
      ? c1.mix(c0, factor).hexString()
      : to;
  },
  number(from: number, to: number, factor: number) {
    return from + (to - from) * factor;
  }
};

export default class Animation {
  /** @internal */
  declare _active: boolean;
  /** @internal */
  declare _fn: (from: unknown, to: unknown, factor: number) => unknown;
  /** @internal */
  declare _easing: (t: number) => number;
  /** @internal */
  declare _start: number;
  /** @internal */
  declare _duration: number;
  /** @internal */
  declare _total: number;
  /** @internal */
  declare _loop: boolean;
  /** @internal */
  declare _target: AnyObject;
  /** @internal */
  declare _prop: string;
  /** @internal */
  declare _from: unknown;
  declare _to: unknown;
  /** @internal */
  declare _promises: {res: () => void, rej: () => void}[];

  constructor(cfg: AnyObject, target: AnyObject, prop: string, to?: unknown) {
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

  active(): boolean {
    return this._active;
  }

  update(cfg: AnyObject, to: unknown, date: number): void {
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

  cancel(): void {
    if (this._active) {
      // update current evaluated value, for smoother animations
      this.tick(Date.now());
      this._active = false;
      this._notify(false);
    }
  }

  tick(date: number): void {
    const elapsed = date - this._start;
    const duration = this._duration;
    const prop = this._prop;
    const from = this._from;
    const loop = this._loop;
    const to = this._to;
    let factor: number;

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

  wait(): Promise<void> {
    const promises = this._promises || (this._promises = []);
    return new Promise<void>((res, rej) => {
      promises.push({res, rej});
    });
  }

  /** @internal */
  _notify(resolved: boolean): void {
    const method = resolved ? 'res' : 'rej';
    const promises = this._promises || [];
    for (let i = 0; i < promises.length; i++) {
      promises[i][method]();
    }
  }
}
