import { Chart } from '..';

export function getMaximumHeight(node: HTMLElement): number;
export function getMaximumWidth(node: HTMLElement): number;
export function getRelativePosition(evt: MouseEvent, chart: Chart): { x: number; y: number };
export function getStyle(el: HTMLElement, property: string): string;
export function retinaScale(chart: Chart, forceRatio: number): void;
