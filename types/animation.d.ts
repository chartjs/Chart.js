import { Chart } from './index.esm';
import { AnyObject } from './basic';

export class Animation {
  constructor(cfg: AnyObject, target: AnyObject, prop: string, to?: unknown);
  active(): boolean;
  update(cfg: AnyObject, to: unknown, date: number): void;
  cancel(): void;
  tick(date: number): void;
}

export interface AnimationEvent {
	chart: Chart;
	numSteps: number;
	currentState: number;
}

export class Animator {
  listen(chart: Chart, event: 'complete' | 'progress', cb: (event: AnimationEvent) => void): void;
  add(chart: Chart, items: readonly Animation[]): void;
  has(chart: Chart): boolean;
  start(chart: Chart): void;
  running(chart: Chart): boolean;
  stop(chart: Chart): void;
  remove(chart: Chart): boolean;
}

export class Animations {
  constructor(chart: Chart, animations: AnyObject);
  configure(animations: AnyObject): void;
  update(target: AnyObject, values: AnyObject): undefined | boolean;
}
