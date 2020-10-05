import { Chart, DatasetController } from '../core';
import { IChartArea, IChartComponent, ScriptableAndArrayOptions, ScriptableOptions } from '../core/interfaces';
import {
  IArcHoverOptions,
  IArcOptions,
  ICommonHoverOptions,
  IPointHoverOptions,
  ILineHoverOptions,
  ILineOptions,
  IPointOptions,
  IPointPrefixedHoverOptions,
  IPointPrefixedOptions,
  IRectangleOptions,
} from '../elements';

export interface IControllerDatasetOptions {
  /**
   * 	How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. 0 = clip at chartArea. Clipping can also be configured per side: clip: {left: 5, top: false, right: -2, bottom: 0}
   */
  clip: number | IChartArea;
  /**
   * The label for the dataset which appears in the legend and tooltips.
   */
  label: string;
  /**
   * The drawing order of dataset. Also affects order for stacking, tooltip and legend.
   */
  order: number;
}

export interface IBarControllerDatasetOptions
  extends IControllerDatasetOptions,
    ScriptableAndArrayOptions<IRectangleOptions>,
    ScriptableAndArrayOptions<ICommonHoverOptions> {
  /**
   * The base axis of the dataset. 'x' for vertical bars and 'y' for horizontal bars.
   * @default 'x'
   */
  indexAxis: 'x' | 'y';
  /**
   * The ID of the x axis to plot this dataset on.
   */
  xAxisID: string;
  /**
   * The ID of the y axis to plot this dataset on.
   */
  yAxisID: string;

  /**
   * Percent (0-1) of the available width each bar should be within the category width. 1.0 will take the whole category width and put the bars right next to each other.
   * @default 0.9
   */
  barPercentage: number;
  /**
   * Percent (0-1) of the available width each category should be within the sample width.
   * @default 0.8
   */
  categoryPercentage: number;

  /**
   * Manually set width of each bar in pixels. If set to 'flex', it computes "optimal" sample widths that globally arrange bars side by side. If not set (default), bars are equally sized based on the smallest interval.
   */
  barThickness: number | 'flex';

  /**
   * Set this to ensure that bars are not sized thicker than this.
   */
  maxBarThickness: number;

  /**
   * Set this to ensure that bars have a minimum length in pixels.
   */
  minBarLength: number;

  /**
   * The ID of the group to which this dataset belongs to (when stacked, each group will be a separate stack).
   */
  stack: string;
}

export interface IBarControllerChartOptions {
  /**
   * Should null or undefined values be omitted from drawing
   */
  skipNull?: boolean;
}

export interface BarController extends DatasetController {}
export const BarController: IChartComponent & {
  prototype: BarController;
  new (chart: Chart, datasetIndex: number): BarController;
};

export interface IBubbleControllerDatasetOptions
  extends IControllerDatasetOptions,
    ScriptableAndArrayOptions<IPointOptions>,
    ScriptableAndArrayOptions<IPointHoverOptions> {}

export interface IBubbleDataPoint {
  /**
   * X Value
   */
  x: number;

  /**
   * Y Value
   */
  y: number;

  /**
   * Bubble radius in pixels (not scaled).
   */
  r: number;
}

export interface BubbleController extends DatasetController {}
export const BubbleController: IChartComponent & {
  prototype: BubbleController;
  new (chart: Chart, datasetIndex: number): BubbleController;
};

export interface ILineControllerDatasetOptions
  extends IControllerDatasetOptions,
    ScriptableAndArrayOptions<IPointPrefixedOptions>,
    ScriptableAndArrayOptions<IPointPrefixedHoverOptions>,
    ScriptableOptions<ILineOptions>,
    ScriptableOptions<ILineHoverOptions> {
  /**
   * The ID of the x axis to plot this dataset on.
   */
  xAxisID: string;
  /**
   * The ID of the y axis to plot this dataset on.
   */
  yAxisID: string;

  /**
   * If true, lines will be drawn between points with no or null data. If false, points with NaN data will create a break in the line. Can also be a number specifying the maximum gap length to span. The unit of the value depends on the scale used.
   * @default false
   */
  spanGaps: boolean | number;

  showLine: boolean;
}

export interface ILineControllerChartOptions {
  /**
   * If true, lines will be drawn between points with no or null data. If false, points with NaN data will create a break in the line. Can also be a number specifying the maximum gap length to span. The unit of the value depends on the scale used.
   * @default false
   */
  spanGaps: boolean | number;
  /**
   * If false, the lines between points are not drawn.
   * @default true
   */
  showLines: boolean;
}

export interface LineController extends DatasetController {}
export const LineController: IChartComponent & {
  prototype: LineController;
  new (chart: Chart, datasetIndex: number): LineController;
};

export type IScatterControllerDatasetOptions = ILineControllerDatasetOptions;

export interface IScatterDataPoint {
  x: number;
  y: number;
}

export type IScatterControllerChartOptions = ILineControllerChartOptions;

export interface ScatterController extends LineController {}
export const ScatterController: IChartComponent & {
  prototype: ScatterController;
  new (chart: Chart, datasetIndex: number): ScatterController;
};

export interface IDoughnutControllerDatasetOptions
  extends IControllerDatasetOptions,
    ScriptableAndArrayOptions<IArcOptions>,
    ScriptableAndArrayOptions<IArcHoverOptions> {
  
  /**
   * Sweep to allow arcs to cover.
   * @default 2 * Math.PI
   */
  circumference: number;

  /**
   * Starting angle to draw this dataset from.
   * @default -0.5 * Math.PI
   */
  rotation: number;

  /**
   * The relative thickness of the dataset. Providing a value for weight will cause the pie or doughnut dataset to be drawn with a thickness relative to the sum of all the dataset weight values.
   * @default 1
   */
  weight: number;
}

export interface IDoughnutAnimationOptions {
  /**
   * 	If true, the chart will animate in with a rotation animation. This property is in the options.animation object.
   * @default true
   */
  animateRotate: boolean;

  /**
   * If true, will animate scaling the chart from the center outwards.
   * @default false
   */
  animateScale: boolean;
}

export interface IDoughnutControllerChartOptions {
  /**
   * The percentage of the chart that is cut out of the middle. (50 - for doughnut, 0 - for pie)
   * @default 50
   */
  cutoutPercentage: number;

  /**
   * Starting angle to draw arcs from.
   * @default -0.5 * Math.PI
   */
  rotation: number;

  /**
   * Sweep to allow arcs to cover.
   * @default 2 * Math.PI
   */
  circumference: number;

  animation: IDoughnutAnimationOptions;
}

export type IDoughnutDataPoint = number;

export interface DoughnutController extends DatasetController {
  readonly innerRadius: number;
  readonly outerRadius: number;
  readonly offsetX: number;
  readonly offsetY: number;

  getRingIndex(datasetIndex: number): number;
  calculateTotal(): number;
  calculateCircumference(value: number): number;
}

export const DoughnutController: IChartComponent & {
  prototype: DoughnutController;
  new (chart: Chart, datasetIndex: number): DoughnutController;
};

export type IPieControllerDatasetOptions = IDoughnutControllerDatasetOptions;
export type IPieControllerChartOptions = IDoughnutControllerChartOptions;
export type IPieAnimationOptions = IDoughnutAnimationOptions;

export type IPieDataPoint = IDoughnutDataPoint;

export interface PieController extends DoughnutController {}
export const PieController: IChartComponent & {
  prototype: PieController;
  new (chart: Chart, datasetIndex: number): PieController;
};

export interface IPolarAreaControllerDatasetOptions extends IDoughnutControllerDatasetOptions {
  /**
   * Arc angle to cover. - for polar only
   * @default circumference / (arc count)
   */
  angle: number;
}

export type IPolarAreaAnimationOptions = IDoughnutAnimationOptions;

export interface IPolarAreaControllerChartOptions {
  /**
   * Starting angle to draw arcs for the first item in a dataset. In degrees, 0 is at top.
   * @default 0
   */
  startAngle: number;

  animation: IPolarAreaAnimationOptions;
}

export interface PolarAreaController extends DoughnutController {
  countVisibleElements(): number;
}
export const PolarAreaController: IChartComponent & {
  prototype: PolarAreaController;
  new (chart: Chart, datasetIndex: number): PolarAreaController;
};

export interface IRadarControllerDatasetOptions
  extends IControllerDatasetOptions,
    ScriptableOptions<IPointPrefixedOptions>,
    ScriptableOptions<IPointPrefixedHoverOptions>,
    ScriptableOptions<ILineOptions>,
    ScriptableOptions<ILineHoverOptions> {
  /**
   * The ID of the x axis to plot this dataset on.
   */
  xAxisID: string;
  /**
   * The ID of the y axis to plot this dataset on.
   */
  yAxisID: string;

  /**
   * If true, lines will be drawn between points with no or null data. If false, points with NaN data will create a break in the line. Can also be a number specifying the maximum gap length to span. The unit of the value depends on the scale used.
   */
  spanGaps: boolean | number;

  /**
   * If false, the line is not drawn for this dataset.
   */
  showLine: boolean;
}

export type IRadarControllerChartOptions = ILineControllerChartOptions;

export interface RadarController extends DatasetController {}
export const RadarController: IChartComponent & {
  prototype: RadarController;
  new (chart: Chart, datasetIndex: number): RadarController;
};
