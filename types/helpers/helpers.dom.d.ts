import { ChartEvent } from '../index.esm';

export function getMaximumSize(node: HTMLElement, width?: number, height?: number, aspectRatio?: number): { width: number, height: number };
export function getRelativePosition(
	evt: MouseEvent | ChartEvent,
	chart: { readonly canvas: HTMLCanvasElement }
): { x: number; y: number };
export function getStyle(el: HTMLElement, property: string): string;
export function retinaScale(
	chart: {
		currentDevicePixelRatio: number;
		readonly canvas: HTMLCanvasElement;
		readonly width: number;
		readonly height: number;
		readonly ctx: CanvasRenderingContext2D;
	},
  forceRatio: number,
  forceStyle?: boolean
): void;
export function readUsedSize(element: HTMLElement, property: 'width' | 'height'): number | undefined;
