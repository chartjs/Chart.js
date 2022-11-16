import {PI, TAU, HALF_PI} from './helpers.math.js';

const atEdge = (t: number) => t === 0 || t === 1;
const elasticIn = (t: number, s: number, p: number) => -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p));
const elasticOut = (t: number, s: number, p: number) => Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1;

/**
 * Easing functions adapted from Robert Penner's easing equations.
 * @namespace Chart.helpers.easing.effects
 * @see http://www.robertpenner.com/easing/
 */
const effects = {
  linear: (t: number) => t,

  easeInQuad: (t: number) => t * t,

  easeOutQuad: (t: number) => -t * (t - 2),

  easeInOutQuad: (t: number) => ((t /= 0.5) < 1)
    ? 0.5 * t * t
    : -0.5 * ((--t) * (t - 2) - 1),

  easeInCubic: (t: number) => t * t * t,

  easeOutCubic: (t: number) => (t -= 1) * t * t + 1,

  easeInOutCubic: (t: number) => ((t /= 0.5) < 1)
    ? 0.5 * t * t * t
    : 0.5 * ((t -= 2) * t * t + 2),

  easeInQuart: (t: number) => t * t * t * t,

  easeOutQuart: (t: number) => -((t -= 1) * t * t * t - 1),

  easeInOutQuart: (t: number) => ((t /= 0.5) < 1)
    ? 0.5 * t * t * t * t
    : -0.5 * ((t -= 2) * t * t * t - 2),

  easeInQuint: (t: number) => t * t * t * t * t,

  easeOutQuint: (t: number) => (t -= 1) * t * t * t * t + 1,

  easeInOutQuint: (t: number) => ((t /= 0.5) < 1)
    ? 0.5 * t * t * t * t * t
    : 0.5 * ((t -= 2) * t * t * t * t + 2),

  easeInSine: (t: number) => -Math.cos(t * HALF_PI) + 1,

  easeOutSine: (t: number) => Math.sin(t * HALF_PI),

  easeInOutSine: (t: number) => -0.5 * (Math.cos(PI * t) - 1),

  easeInExpo: (t: number) => (t === 0) ? 0 : Math.pow(2, 10 * (t - 1)),

  easeOutExpo: (t: number) => (t === 1) ? 1 : -Math.pow(2, -10 * t) + 1,

  easeInOutExpo: (t: number) => atEdge(t) ? t : t < 0.5
    ? 0.5 * Math.pow(2, 10 * (t * 2 - 1))
    : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2),

  easeInCirc: (t: number) => (t >= 1) ? t : -(Math.sqrt(1 - t * t) - 1),

  easeOutCirc: (t: number) => Math.sqrt(1 - (t -= 1) * t),

  easeInOutCirc: (t: number) => ((t /= 0.5) < 1)
    ? -0.5 * (Math.sqrt(1 - t * t) - 1)
    : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),

  easeInElastic: (t: number) => atEdge(t) ? t : elasticIn(t, 0.075, 0.3),

  easeOutElastic: (t: number) => atEdge(t) ? t : elasticOut(t, 0.075, 0.3),

  easeInOutElastic(t: number) {
    const s = 0.1125;
    const p = 0.45;
    return atEdge(t) ? t :
      t < 0.5
        ? 0.5 * elasticIn(t * 2, s, p)
        : 0.5 + 0.5 * elasticOut(t * 2 - 1, s, p);
  },

  easeInBack(t: number) {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },

  easeOutBack(t: number) {
    const s = 1.70158;
    return (t -= 1) * t * ((s + 1) * t + s) + 1;
  },

  easeInOutBack(t: number) {
    let s = 1.70158;
    if ((t /= 0.5) < 1) {
      return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s));
    }
    return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
  },

  easeInBounce: (t: number) => 1 - effects.easeOutBounce(1 - t),

  easeOutBounce(t: number) {
    const m = 7.5625;
    const d = 2.75;
    if (t < (1 / d)) {
      return m * t * t;
    }
    if (t < (2 / d)) {
      return m * (t -= (1.5 / d)) * t + 0.75;
    }
    if (t < (2.5 / d)) {
      return m * (t -= (2.25 / d)) * t + 0.9375;
    }
    return m * (t -= (2.625 / d)) * t + 0.984375;
  },

  easeInOutBounce: (t: number) => (t < 0.5)
    ? effects.easeInBounce(t * 2) * 0.5
    : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5,
} as const;

export type EasingFunction = keyof typeof effects

export default effects;
