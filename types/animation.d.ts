import { Chart } from './index.esm';

export class Animation {
	constructor(cfg: any, target: any, prop: string, to?: any);
	active(): boolean;
	update(cfg: any, to: any, date: number): void;
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
	constructor(chart: Chart, animations: {});
	configure(animations: {}): void;
	update(target: any, values: any): undefined | boolean;
}
