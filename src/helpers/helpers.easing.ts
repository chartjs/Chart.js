import { getEasingFunction, effects } from '../helpers/helpers.easing';

export interface AnimationConfig {
  property: string;
  duration?: number;
  easing?: keyof typeof effects;
}

export class Animation {
  property: string;
  duration: number;
  easing: (t: number) => number;

  constructor(config: AnimationConfig) {
    this.property = config.property;
    this.duration = config.duration || 1000;
    this.easing = effects[config.easing] || getEasingFunction('linear'); // Support easing presets
  }
}
