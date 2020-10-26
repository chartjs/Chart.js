import { Element } from '../core';
import { Color, IChartArea, IChartComponent, IPoint } from '../core/interfaces';

export interface IVisualElement {
  draw(ctx: CanvasRenderingContext2D): void;
  inRange(mouseX: number, mouseY: number, useFinalPosition?: boolean): boolean;
  inXRange(mouseX: number, useFinalPosition?: boolean): boolean;
  inYRange(mouseY: number, useFinalPosition?: boolean): boolean;
  getCenterPoint(useFinalPosition?: boolean): { x: number; y: number };
  getRange?(axis: 'x' | 'y'): number;
}

export interface ICommonOptions {
  borderWidth: number;
  borderColor: Color;
  backgroundColor: Color;
}

export interface ICommonHoverOptions {
  hoverBorderWidth: number;
  hoverBorderColor: Color;
  hoverBackgroundColor: Color;
}

export interface ISegment {
  start: number;
  end: number;
  loop: boolean;
}

export interface IArcProps {
  x: number;
  y: number;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  circumference: number;
}

export interface IArcOptions extends ICommonOptions {
  /**
   * Arc stroke alignment.
   */
  borderAlign: 'center' | 'inner';
  /**
   * Arc offset (in pixels).
   */
  offset: number;
}

export interface IArcHoverOptions extends ICommonHoverOptions {
  hoverOffset: number;
}

export interface ArcElement<T extends IArcProps = IArcProps, O extends IArcOptions = IArcOptions>
  extends Element<T, O>,
    IVisualElement {}

export const ArcElement: IChartComponent & {
  prototype: ArcElement;
  new (cfg: any): ArcElement;
};

export interface ILineProps {}

export interface ILineOptions extends ICommonOptions {
  /**
   * Line cap style. See MDN.
   * @default 'butt'
   */
  borderCapStyle: CanvasLineCap;
  /**
   * Line dash. See MDN.
   * @default []
   */
  borderDash: number[];
  /**
   * Line dash offset. See MDN.
   * @default 0.0
   */
  borderDashOffset: number;
  /**
   * Line join style. See MDN.
   * @default 'miter'
   */
  borderJoinStyle: CanvasLineJoin;
  /**
   * 	true to keep Bézier control inside the chart, false for no restriction.
   * @default true
   */
  capBezierPoints: boolean;
  /**
   * Interpolation mode to apply.
   * @default 'default'
   */
  cubicInterpolationMode: 'default' | 'monotone';
  /**
   * Bézier curve tension (0 for no Bézier curves).
   * @default 0
   */
  tension: number;
  /**
   * true to show the line as a stepped line (tension will be ignored).
   * @default false
   */
  stepped: 'before' | 'after' | 'middle' | boolean;
}

export interface ILineHoverOptions extends ICommonHoverOptions {
  hoverBorderCapStyle: CanvasLineCap;
  hoverBorderDash: number[];
  hoverBorderDashOffset: number;
  hoverBorderJoinStyle: CanvasLineJoin;
}

export interface LineElement<T extends ILineProps = ILineProps, O extends ILineOptions = ILineOptions>
  extends Element<T, O>,
    IVisualElement {
  updateControlPoints(chartArea: IChartArea): void;
  points: IPoint[];
  readonly segments: ISegment[];
  first(): IPoint | false;
  last(): IPoint | false;
  interpolate(point: IPoint, property: 'x' | 'y'): undefined | IPoint | IPoint[];
  pathSegment(ctx: CanvasRenderingContext2D, segment: ISegment, params: any): undefined | boolean;
  path(ctx: CanvasRenderingContext2D): boolean;
}

export const LineElement: IChartComponent & {
  prototype: LineElement;
  new (cfg: any): LineElement;
};

export interface IPointProps {
  x: number;
  y: number;
}

export type PointStyle =
  | 'circle'
  | 'cross'
  | 'crossRot'
  | 'dash'
  | 'line'
  | 'rect'
  | 'rectRounded'
  | 'rectRot'
  | 'star'
  | 'triangle'
  | HTMLImageElement
  | HTMLCanvasElement;

export interface IPointOptions extends ICommonOptions {
  /**
   * Point radius
   * @default 3
   */
  radius: number;
  /**
   * Extra radius added to point radius for hit detection.
   * @default 1
   */
  hitRadius: number;
  /**
   * Point style
   * @default 'circle;
   */
  pointStyle: PointStyle;
  /**
   * Point rotation (in degrees).
   * @default 0
   */
  rotation: number;
}

export interface IPointHoverOptions extends ICommonHoverOptions {
  /**
   * Point radius when hovered.
   * @default 4
   */
  hoverRadius: number;
}

export interface IPointPrefixedOptions {
  /**
   * The fill color for points.
   */
  pointBackgroundColor: Color;
  /**
   * The border color for points.
   */
  pointBorderColor: Color;
  /**
   * The width of the point border in pixels.
   */
  pointBorderWidth: number;
  /**
   * The pixel size of the non-displayed point that reacts to mouse events.
   */
  pointHitRadius: number;
  /**
   * The radius of the point shape. If set to 0, the point is not rendered.
   */
  pointRadius: number;
  /**
   * The rotation of the point in degrees.
   */
  pointRotation: number;
  /**
   * Style of the point.
   */
  pointStyle: PointStyle;
}

export interface IPointPrefixedHoverOptions {
  /**
   * Point background color when hovered.
   */
  pointHoverBackgroundColor: Color;
  /**
   * Point border color when hovered.
   */
  pointHoverBorderColor: Color;
  /**
   * Border width of point when hovered.
   */
  pointHoverBorderWidth: number;
  /**
   * The radius of the point when hovered.
   */
  pointHoverRadius: number;
}

export interface PointElement<T extends IPointProps = IPointProps, O extends IPointOptions = IPointOptions>
  extends Element<T, O>,
    IVisualElement {
  readonly skip: boolean;
}

export const PointElement: IChartComponent & {
  prototype: PointElement;
  new (cfg: any): PointElement;
};

export interface IBarProps {
  x: number;
  y: number;
  base: number;
  horizontal: boolean;
  width: number;
  height: number;
}

export interface IBarOptions extends ICommonOptions {
  /**
   * The base value for the bar in data units along the value axis.
   */
  base: number;

  /**
   * 	Skipped (excluded) border: 'start', 'end', 'bottom', 'left', 'top' or 'right'.
   * @default 'start'
   */
  borderSkipped: 'start' | 'end' | 'left' | 'right' | 'bottom' | 'top';

  /**
   * Border radius
   * @default 0
   */
  borderRadius: number | IBorderRadius;
}

export interface IBorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface IBarHoverOptions extends ICommonHoverOptions {
  hoverBorderRadius: number | IBorderRadius;
}

export interface BarElement<
  T extends IBarProps = IBarProps,
  O extends IBarOptions = IBarOptions
> extends Element<T, O>, IVisualElement {}

export const BarElement: IChartComponent & {
  prototype: BarElement;
  new (cfg: any): BarElement;
};

export interface IElementChartOptions {
  elements: {
    arc: IArcOptions & IArcHoverOptions;
    bar: IBarOptions & IBarHoverOptions;
    line: ILineOptions & ILineHoverOptions;
    point: IPointOptions & IPointHoverOptions;
  };
}
