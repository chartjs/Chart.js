import { PointStyle } from '../index.esm';
import { ChartArea } from '../geometric';

/**
 * Clears the entire canvas associated to the given `chart`.
 * @param {Chart} chart - The chart for which to clear the canvas.
 */
export function clear(chart: { ctx: CanvasRenderingContext2D }): void;

export function clipArea(ctx: CanvasRenderingContext2D, area: ChartArea): void;

export function unclipArea(ctx: CanvasRenderingContext2D): void;

export interface DrawPointOptions {
  pointStyle: PointStyle;
  rotation?: number;
  radius: number;
  borderWidth: number;
}

export function drawPoint(ctx: CanvasRenderingContext2D, options: DrawPointOptions, x: number, y: number): void;

/**
 * Converts the given font object into a CSS font string.
 * @param font a font object
 * @return The CSS font string. See https://developer.mozilla.org/en-US/docs/Web/CSS/font
 */
export function toFontString(font: { size: number; family: string; style?: string; weight?: string }): string | null;

export interface RenderTextOpts {
  /**
   * The width of the strikethrough / underline
   * @default 2
   */
  decorationWidth?: number;

  /**
   * The max width of the text in pixels
   */
  maxWidth?: number;

  /**
   * Apply a strikethrough effect to the text
   */
  strikethrough?: boolean;

  /**
   * Should the text be stroked as well as filled
   */
  stroke?: boolean;

  /**
   * Underline the text
   */
  underline?: boolean;
}

export function renderText(
  ctx: CanvasRenderingContext2D,
  text: string | string[],
  x: number,
  y: number,
  lineHeight: number,
  opts?: RenderTextOpts
): void;
