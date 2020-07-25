import { PointStyle } from '../elements';

/**
 * Clears the entire canvas associated to the given `chart`.
 * @param {Chart} chart - The chart for which to clear the canvas.
 */
export function clear(chart: { ctx: CanvasRenderingContext2D }): void;

export function clipArea(
  ctx: CanvasRenderingContext2D,
  area: { left: number; top: number; right: number; bottom: number }
): void;

export function unclipArea(ctx: CanvasRenderingContext2D): void;

export interface IDrawPointOptions {
  pointStyle: PointStyle;
  rotation?: number;
  radius: number;
  borderWidth: number;
}

export function drawPoint(ctx: CanvasRenderingContext2D, options: IDrawPointOptions, x: number, y: number): void;

/**
 * Converts the given font object into a CSS font string.
 * @param font a font object
 * @return The CSS font string. See https://developer.mozilla.org/en-US/docs/Web/CSS/font
 */
export function toFontString(font: { size: number; family: string; style?: string; weight?: string }): string | null;
