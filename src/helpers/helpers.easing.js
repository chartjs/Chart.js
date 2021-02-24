import {PI, TAU, HALF_PI} from './helpers.math';

const atEdge = (t) => t === 0 || t === 1;
const elasticIn = (t, s, p) => -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p));
const elasticOut = (t, s, p) => Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1;

/**
 * Easing functions adapted from Robert Penner's easing equations.
 * @namespace Chart.helpers.easing.effects
 * @see http://www.robertpenner.com/easing/
 */
const effects = {
  linear: t => t,

  easeInQuad: t => t * t,

  easeOutQuad: t => -t * (t - 2),

  easeInOutQuad: t => ((t /= 0.5) < 1)
    ? 0.5 * t * t
    : -0.5 * ((--t) * (t - 2) - 1),

  easeInCubic: t => t * t * t,

  easeOutCubic: t => (t -= 1) * t * t + 1,

  easeInOutCubic: t => ((t /= 0.5) < 1)
    ? 0.5 * t * t * t
    : 0.5 * ((t -= 2) * t * t + 2),

  easeInQuart: t => t * t * t * t,

  easeOutQuart: t => -((t -= 1) * t * t * t - 1),

  easeInOutQuart: t => ((t /= 0.5) < 1)
    ? 0.5 * t * t * t * t
    : -0.5 * ((t -= 2) * t * t * t - 2),

  easeInQuint: t => t * t * t * t * t,

  easeOutQuint: t => (t -= 1) * t * t * t * t + 1,

  easeInOutQuint: t => ((t /= 0.5) < 1)
    ? 0.5 * t * t * t * t * t
    : 0.5 * ((t -= 2) * t * t * t * t + 2),

  easeInSine: t => -Math.cos(t * HALF_PI) + 1,

  easeOutSine: t => Math.sin(t * HALF_PI),

  easeInOutSine: t => -0.5 * (Math.cos(PI * t) - 1),

  easeInExpo: t => (t === 0) ? 0 : Math.pow(2, 10 * (t - 1)),

  easeOutExpo: t => (t === 1) ? 1 : -Math.pow(2, -10 * t) + 1,

  easeInOutExpo: t => atEdge(t) ? t : t < 0.5
    ? 0.5 * Math.pow(2, 10 * (t * 2 - 1))
    : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2),

  easeInCirc: t => (t >= 1) ? t : -(Math.sqrt(1 - t * t) - 1),

  easeOutCirc: t => Math.sqrt(1 - (t -= 1) * t),

  easeInOutCirc: t => ((t /= 0.5) < 1)
    ? -0.5 * (Math.sqrt(1 - t * t) - 1)
    : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),

  easeInElastic: t => atEdge(t) ? t : elasticIn(t, 0.075, 0.3),

  easeOutElastic: t => atEdge(t) ? t : elasticOut(t, 0.075, 0.3),

  easeInOutElastic(t) {
    const s = 0.1125;
    const p = 0.45;
    return atEdge(t) ? t :
      t < 0.5
        ? 0.5 * elasticIn(t * 2, s, p)
        : 0.5 + 0.5 * elasticOut(t * 2 - 1, s, p);
  },

  easeInBack(t) {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },

  easeOutBack(t) {
    const s = 1.70158;
    return (t -= 1) * t * ((s + 1) * t + s) + 1;
  },

  easeInOutBack(t) {
    let s = 1.70158;
    if ((t /= 0.5) < 1) {
      return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s));
    }
    return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
  },

  easeInBounce: t => 1 - effects.easeOutBounce(1 - t),

  easeOutBounce(t) {
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

  easeInOutBounce: t => (t < 0.5)
    ? effects.easeInBounce(t * 2) * 0.5
    : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5,
};

export default effects;
