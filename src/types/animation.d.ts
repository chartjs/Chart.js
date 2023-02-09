import {Chart} from './index.js';
import {AnyObject} from './basic.js';
import {Color} from './color.js';

export type Interpolator<T> = (from: T, to: T, factor: number) => T;

export interface InterpolatorsMap {
  boolean: Interpolator<boolean>;
  color: Interpolator<Color>;
  number: Interpolator<number>;
}

export declare class Animation {
  constructor(cfg: AnyObject, target: AnyObject, prop: string, to?: unknown);
  active(): boolean;
  update(cfg: AnyObject, to: unknown, date: number): void;
  cancel(): void;
  tick(date: number): void;
  readonly _to: unknown;

  static readonly interpolators: InterpolatorsMap;
}

export interface AnimationEvent {
  chart: Chart;
  numSteps: number;
  initial: boolean;
  currentStep: number;
}

export declare class Animator {
  listen(chart: Chart, event: 'complete' | 'progress', cb: (event: AnimationEvent) => void): void;
  add(chart: Chart, items: readonly Animation[]): void;
  has(chart: Chart): boolean;
  start(chart: Chart): void;
  running(chart: Chart): boolean;
  stop(chart: Chart): void;
  remove(chart: Chart): boolean;
}

export declare class Animations {
  constructor(chart: Chart, animations: AnyObject);
  configure(animations: AnyObject): void;
  update(target: AnyObject, values: AnyObject): undefined | boolean;
}
