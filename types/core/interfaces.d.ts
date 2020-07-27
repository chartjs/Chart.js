import { Chart, Element, InteractionMode } from '.';
import { IChartDataset } from '../interfaces';

export type Color = string | CanvasGradient | CanvasPattern;

export interface IEvent {
  type:
    | 'contextmenu'
    | 'mouseenter'
    | 'mousedown'
    | 'mousemove'
    | 'mouseup'
    | 'mouseout'
    | 'click'
    | 'dblclick'
    | 'keydown'
    | 'keypress'
    | 'keyup'
    | 'resize';
  native: Event | null;
  x: number | null;
  y: number | null;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IChartComponent {
  id: string;
  defaults?: any;
  defaultRoutes?: { [property: string]: string };

  beforeRegister?(): void;
  afterRegister?(): void;
  beforeUnregister?(): void;
  afterUnregister?(): void;
}

export type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface IChartArea {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface IPadding {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface IScriptableContext {
  chart: Chart;
  dataPoint: any;
  dataIndex: number;
  dataset: IChartDataset;
  datasetIndex: number;
  active: boolean;
}

export type Scriptable<T> = T | ((ctx: IScriptableContext) => T);
export type ScriptableOptions<T> = { [P in keyof T]: Scriptable<T[P]> };
export type ScriptableAndArray<T> = readonly T[] | Scriptable<T>;
export type ScriptableAndArrayOptions<T> = { [P in keyof T]: ScriptableAndArray<T[P]> };

export interface IHoverInteractionOptions {
  /**
   * Sets which elements appear in the tooltip. See Interaction Modes for details.
   * @default 'nearest'
   */
  mode: InteractionMode;
  /**
   * if true, the hover mode only applies when the mouse position intersects an item on the chart.
   * @default true
   */
  intersect: boolean;

  /**
   * Can be set to 'x', 'y', or 'xy' to define which directions are used in calculating distances. Defaults to 'x' for 'index' mode and 'xy' in dataset and 'nearest' modes.
   */
  axis: 'x' | 'y' | 'xy';
}

export interface IElementOptions {
  // TODO
}

export interface ICoreChartOptions {
  /**
   * base color
   * @see Defaults.color
   */
  color: string;
  /**
   * base font
   * @see Defaults.font
   */
  font: IFontSpec;
  /**
   * Resizes the chart canvas when its container does (important note...).
   * @default true
   */
  responsive: boolean;
  /**
   * Maintain the original canvas aspect ratio (width / height) when resizing.
   * @default true
   */
  maintainAspectRatio: boolean;

  /**
   * Canvas aspect ratio (i.e. width / height, a value of 1 representing a square canvas). Note that this option is ignored if the height is explicitly defined either as attribute or via the style.
   * @default 2
   */
  aspectRatio: number;

  /**
   * Called when a resize occurs. Gets passed two arguments: the chart instance and the new size.
   */
  onResize(chart: Chart, size: { width: number; height: number }): void;

  /**
   * Override the window's default devicePixelRatio.
   * @default window.devicePixelRatio
   */
  devicePixelRatio: number;

  hover: IHoverInteractionOptions;

  /**
   * The events option defines the browser events that the chart should listen to for tooltips and hovering.
   * @default ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']
   */
  events: ('mousemove' | 'mouseout' | 'click' | 'touchstart' | 'touchmove')[];

  /**
   * Called when any of the events fire. Passed the event, an array of active elements (bars, points, etc), and the chart.
   */
  onHover(event: IEvent, elements: Element[]): void;
  /**
   * Called if the event is of type 'mouseup' or 'click'. Passed the event, an array of active elements, and the chart.
   */
  onClick(event: IEvent, elements: Element[]): void;

  elements: { [key: string]: IElementOptions };

  layout: {
    padding: number | IChartArea;
  };
}

export type EasingFunction =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint'
  | 'easeInSine'
  | 'easeOutSine'
  | 'easeInOutSine'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'
  | 'easeInCirc'
  | 'easeOutCirc'
  | 'easeInOutCirc'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'easeInOutBounce';

export interface IFontSpec {
  /**
   * Default font color for all text.
   * @default '#666'
   */
  color: Color;
  /**
   * Default font family for all text, follows CSS font-family options.
   * @default "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
   */
  family: string;
  /**
   * Default font size (in px) for text. Does not apply to radialLinear scale point labels.
   * @default 12
   */
  size: number;
  /**
   * Default font style. Does not apply to tooltip title or footer. Does not apply to chart title. Follows CSS font-style options (i.e. normal, italic, oblique, initial, inherit)
   * @default 'normal'
   */
  style: 'normal' | 'italic' | 'oblique' | 'initial' | 'inherit';
  /**
   * Default font weight (boldness). (see MDN).
   */
  weight: string | null;
  /**
   * Height of an individual line of text (see MDN).
   * @default 1.2
   */
  lineHeight: number | string;
  /**
   * Stroke width around the text. Currently only supported by ticks.
   * @default 0
   */
  lineWidth: number;
  /**
   * The color of the stroke around the text. Currently only supported by ticks.
   */
  strokeStyle: string | null;
}

export type TextAlign = 'left' | 'center' | 'right';
