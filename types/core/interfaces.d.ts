import { Chart, Element, InteractionMode } from '.';
import { ChartDataset } from '../interfaces';
import { ParsingOptions } from '../controllers';
import { PluginOptions } from '../plugins';

export type Color = string | CanvasGradient | CanvasPattern;

export interface ChartEvent {
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

export interface Point {
  x: number;
  y: number;
}

export interface ChartComponent {
  id: string;
  defaults?: any;
  defaultRoutes?: { [property: string]: string };

  beforeRegister?(): void;
  afterRegister?(): void;
  beforeUnregister?(): void;
  afterUnregister?(): void;
}

export type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface ChartArea {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface ScriptableContext {
  chart: Chart;
  dataPoint: any;
  dataIndex: number;
  dataset: ChartDataset;
  datasetIndex: number;
  active: boolean;
}

export type Scriptable<T> = T | ((ctx: ScriptableContext) => T);
export type ScriptableOptions<T> = { [P in keyof T]: Scriptable<T[P]> };
export type ScriptableAndArray<T> = readonly T[] | Scriptable<T>;
export type ScriptableAndArrayOptions<T> = { [P in keyof T]: ScriptableAndArray<T[P]> };

export interface CoreInteractionOptions {
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

export interface HoverInteractionOptions extends CoreInteractionOptions {
  /**
   * Called when any of the events fire. Passed the event, an array of active elements (bars, points, etc), and the chart.
   */
  onHover(event: ChartEvent, elements: Element[]): void;
}

export interface CoreChartOptions extends ParsingOptions {
  animation: Scriptable<AnimationOptions>;

  datasets: {
    animation: Scriptable<AnimationOptions>;
  };

  /**
   * base color
   * @see Defaults.color
   */
  color: string;
  /**
   * base font
   * @see Defaults.font
   */
  font: FontSpec;
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

  interaction: CoreInteractionOptions;

  hover: HoverInteractionOptions;

  /**
   * The events option defines the browser events that the chart should listen to for tooltips and hovering.
   * @default ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']
   */
  events: ('mousemove' | 'mouseout' | 'click' | 'touchstart' | 'touchmove')[];

  /**
   * Called when any of the events fire. Passed the event, an array of active elements (bars, points, etc), and the chart.
   */
  onHover(event: ChartEvent, elements: Element[]): void;

  /**
   * Called if the event is of type 'mouseup' or 'click'. Passed the event, an array of active elements, and the chart.
   */
  onClick(event: ChartEvent, elements: Element[]): void;

  layout: {
    padding: Scriptable<number | ChartArea>;
  };

  plugins: PluginOptions;
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

export interface AnimationCommonSpec {
	/**
	 * The number of milliseconds an animation takes.
	 * @default 1000
	 */
	duration: number;
	/**
	 * Easing function to use
	 * @default 'easeOutQuart'
	 */
	easing: EasingFunction;

	/**
	 * Running animation count + FPS display in upper left corner of the chart.
	 * @default false
	 */
	debug: boolean;

	/**
	 * Delay before starting the animations.
	 * @default 0
	 */
	delay: number;

	/**
	 * 	If set to true, the animations loop endlessly.
	 * @default false
	 */
	loop: boolean;
}

export interface AnimationPropertySpec extends AnimationCommonSpec {
	properties: string[];

	/**
	 * Type of property, determines the interpolator used. Possible values: 'number', 'color' and 'boolean'. Only really needed for 'color', because typeof does not get that right.
	 */
	type: 'color' | 'number' | 'boolean';

	fn: <T>(from: T, to: T, factor: number) => T;

	/**
	 * Start value for the animation. Current value is used when undefined
	 */
	from: Color | number | boolean;
	/**
	 *
	 */
	to: Color | number | boolean;
}

export type AnimationSpecContainer = AnimationCommonSpec & {
	[prop: string]: AnimationPropertySpec;
};

export type AnimationOptions = AnimationSpecContainer & {
	/**
	 * Callback called on each step of an animation.
	 */
	onProgress: (this: Chart, event: AnimationEvent) => void;
	/**
	 *Callback called when all animations are completed.
	 */
	onComplete: (this: Chart, event: AnimationEvent) => void;

	active: AnimationSpecContainer;
	hide: AnimationSpecContainer;
	reset: AnimationSpecContainer;
	resize: AnimationSpecContainer;
	show: AnimationSpecContainer;
};

export interface FontSpec {
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
