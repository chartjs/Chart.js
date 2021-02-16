export function getMaximumSize(node: HTMLElement, width?: number, height?: number, aspectRatio?: number): { width: number, height: number };
export function getRelativePosition(
	evt: MouseEvent,
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
