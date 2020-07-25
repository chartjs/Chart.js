export function getMaximumHeight(node: HTMLElement): number;
export function getMaximumWidth(node: HTMLElement): number;
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
  forceRatio: number
): void;
