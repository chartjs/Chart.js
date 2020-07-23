import { IPoint, IChartComponent, IChartArea, Color } from "../core/interfaces";
import { Element } from "../core";
import { PointStyle } from "../helpers";

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
   * Arc angle to cover. - for polar only
   * @default circumference / (arc count)
   */
  angle: number;
  /**
   * Arc stroke alignment.
   */
  borderAlign: 'center' | 'inner';
}

export interface Arc<T extends IArcProps = IArcProps, O extends IArcOptions = IArcOptions>
  extends Element<T, O>,
  IVisualElement { }

export interface Arc extends IChartComponent {
  prototype: Arc;
  new(cfg: any): Arc;
}

export interface ILineProps { }

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
   * Interpolation mode to apply. See more...
   * @default 'default'
   */
  cubicInterpolationMode: 'default' | 'monotone';
  /**
   * 	How to fill the area under the line. See area charts.
   */
  fill: boolean | string;
  /**
   * Bézier curve tension (0 for no Bézier curves).
   * @default 0.4 or 0 // TODO
   */
  tension: number;
  /**
   * true to show the line as a stepped line (tension will be ignored).
   * @default false
   */
  stepped: 'before' | 'after' | 'middle' | boolean;
}
export interface Line<T extends ILineProps = ILineProps, O extends ILineOptions = ILineOptions>
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
export interface Line extends IChartComponent {
  prototype: Line;
  new(cfg: any): Line;
}

export interface IPointProps {
  x: number;
  y: number;
}
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
   * Point radius when hovered.
   * @default 4
   */
  hoverRadius: number;
  /**
   * Stroke width when hovered.
   * @default 1
   */
  hoverBorderWidth: number;
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
export interface Point<T extends IPointProps = IPointProps, O extends IPointOptions = IPointOptions>
  extends Element<T, O>,
  IVisualElement {
  readonly skip: boolean;
}
export interface Point extends IChartComponent {
  prototype: Point;
  new(cfg: any): Point;
}

export interface IRectangleProps {
  x: number;
  y: number;
  base: number;
  horizontal: boolean;
  width: number;
  height: number;
}
export interface IRectangleOptions extends ICommonOptions {
  /**
   * 	Skipped (excluded) border: 'start', 'end', 'bottom', 'left', 'top' or 'right'.
   * @default 'start'
   */
  borderSkipped: 'start' | 'end' | 'left' | 'right' | 'bottom' | 'top';
}

export interface Rectangle<T extends IRectangleProps = IRectangleProps, O extends IRectangleOptions = IRectangleOptions>
  extends Element<T, O>,
  IVisualElement { }

export const Rectangle: IChartComponent & {
  prototype: Rectangle;
  new(cfg: any): Rectangle;
};
