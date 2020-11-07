import { Element } from '../core';
import { Color, ChartArea, ChartComponent, Point } from '../core/interfaces';

export interface VisualElement {
  draw(ctx: CanvasRenderingContext2D): void;
  inRange(mouseX: number, mouseY: number, useFinalPosition?: boolean): boolean;
  inXRange(mouseX: number, useFinalPosition?: boolean): boolean;
  inYRange(mouseY: number, useFinalPosition?: boolean): boolean;
  getCenterPoint(useFinalPosition?: boolean): { x: number; y: number };
  getRange?(axis: 'x' | 'y'): number;
}

export interface CommonOptions {
  borderWidth: number;
  borderColor: Color;
  backgroundColor: Color;
}

export interface CommonHoverOptions {
  hoverBorderWidth: number;
  hoverBorderColor: Color;
  hoverBackgroundColor: Color;
}

export interface Segment {
  start: number;
  end: number;
  loop: boolean;
}

export interface ArcProps {
  x: number;
  y: number;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  circumference: number;
}

export interface ArcOptions extends CommonOptions {
  /**
   * Arc stroke alignment.
   */
  borderAlign: 'center' | 'inner';
  /**
   * Arc offset (in pixels).
   */
  offset: number;
}

export interface ArcHoverOptions extends CommonHoverOptions {
  hoverOffset: number;
}

export interface ArcElement<T extends ArcProps = ArcProps, O extends ArcOptions = ArcOptions>
  extends Element<T, O>,
    VisualElement {}

export const ArcElement: ChartComponent & {
  prototype: ArcElement;
  new (cfg: any): ArcElement;
};

export interface LineProps {}

export interface LineOptions extends CommonOptions {
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

export interface LineHoverOptions extends CommonHoverOptions {
  hoverBorderCapStyle: CanvasLineCap;
  hoverBorderDash: number[];
  hoverBorderDashOffset: number;
  hoverBorderJoinStyle: CanvasLineJoin;
}

export interface LineElement<T extends LineProps = LineProps, O extends LineOptions = LineOptions>
  extends Element<T, O>,
    VisualElement {
  updateControlPoints(chartArea: ChartArea): void;
  points: Point[];
  readonly segments: Segment[];
  first(): Point | false;
  last(): Point | false;
  interpolate(point: Point, property: 'x' | 'y'): undefined | Point | Point[];
  pathSegment(ctx: CanvasRenderingContext2D, segment: Segment, params: any): undefined | boolean;
  path(ctx: CanvasRenderingContext2D): boolean;
}

export const LineElement: ChartComponent & {
  prototype: LineElement;
  new (cfg: any): LineElement;
};

export interface PointProps {
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

export interface PointOptions extends CommonOptions {
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

export interface PointHoverOptions extends CommonHoverOptions {
  /**
   * Point radius when hovered.
   * @default 4
   */
  hoverRadius: number;
}

export interface PointPrefixedOptions {
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

export interface PointPrefixedHoverOptions {
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

export interface PointElement<T extends PointProps = PointProps, O extends PointOptions = PointOptions>
  extends Element<T, O>,
    VisualElement {
  readonly skip: boolean;
}

export const PointElement: ChartComponent & {
  prototype: PointElement;
  new (cfg: any): PointElement;
};

export interface BarProps {
  x: number;
  y: number;
  base: number;
  horizontal: boolean;
  width: number;
  height: number;
}

export interface BarOptions extends CommonOptions {
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
  borderRadius: number | BorderRadius;
}

export interface BorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface BarHoverOptions extends CommonHoverOptions {
  hoverBorderRadius: number | BorderRadius;
}

export interface BarElement<
  T extends BarProps = BarProps,
  O extends BarOptions = BarOptions
> extends Element<T, O>, VisualElement {}

export const BarElement: ChartComponent & {
  prototype: BarElement;
  new (cfg: any): BarElement;
};

export interface ElementChartOptions {
  elements: {
    arc: ArcOptions & ArcHoverOptions;
    bar: BarOptions & BarHoverOptions;
    line: LineOptions & LineHoverOptions;
    point: PointOptions & PointHoverOptions;
  };
}
