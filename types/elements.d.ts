import { IPoint, IChartComponent, IChartArea } from "./interfaces";
import { Element } from "./core";

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
  borderColor: string;
  backgroundColor: string;
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
  borderCapStyle: CanvasLineCap;
  borderDash: number[];
  borderDashOffset: number;
  borderJoinStyle: CanvasLineJoin;
  capBezierPoints: boolean;
  fill: boolean;
  tension: number;
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
  radius: number;
  hitRadius: number;
  hoverRadius: number;
  hoverBorderWidth: number;
  pointStyle:
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
  borderSkipped: 'start' | 'end' | 'left' | 'right' | 'bottom' | 'top';
}

export interface Rectangle<T extends IRectangleProps = IRectangleProps, O extends IRectangleOptions = IRectangleOptions>
  extends Element<T, O>,
  IVisualElement { }

export const Rectangle: IChartComponent & {
  prototype: Rectangle;
  new(cfg: any): Rectangle;
};
