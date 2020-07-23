import { IChartComponent, Color, ScriptableAndArray, ScriptableOptions, IChartArea } from "../core/interfaces";
import { Chart, DatasetController } from "../core";
import { ICategoryScaleOptions, ILinearScaleOptions } from "../scales";
import { PointStyle } from "../helpers";
import { ILineOptions, IRectangleOptions } from '../elements';


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

export interface IBarControllerDatasetOptions extends IControllerDatasetOptions, ScriptableAndArray<IRectangleOptions> {
    /**
     * The bar background color when hovered.
     */
    hoverBackgroundColor: ScriptableAndArray<Color>;
    /**
     * The bar border color when hovered.
     */
    hoverBorderColor: ScriptableAndArray<Color>;
    /**
     * The bar border width when hovered (in pixels).
     */
    hoverBorderWidth: ScriptableAndArray<number>;
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
     * Percent (0-1) of the available width each bar should be within the category width. 1.0 will take the whole category width and put the bars right next to each other. more...
     * @default 0.9
     */
    barPercentage: number;
    /**
     * Percent (0-1) of the available width each category should be within the sample width. more...
     * @default 0.8
     */
    categoryPercentage: number;

    /**
     * Manually set width of each bar in pixels. If set to 'flex', it computes "optimal" sample widths that globally arrange bars side by side. If not set (default), bars are equally sized based on the smallest interval. more...
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

export interface IBarControllerScales {
    _index_: ICategoryScaleOptions;
    _value_: ILinearScaleOptions;
}

export interface BarController extends DatasetController { }
export const BarController: IChartComponent & {
    prototype: BarController;
    new(chart: Chart, datasetIndex: number): BarController;
};

export interface BubbleController extends DatasetController { }
export const BubbleController: IChartComponent & {
    prototype: BubbleController;
    new(chart: Chart, datasetIndex: number): BubbleController;
};

export interface DoughnutController extends DatasetController {
    readonly innerRadius: number;
    readonly outerRadius: number;
    readonly offsetX: number;
    readonly offsetY: number;

    getRingIndex(datasetIndex): number;
    calculateTotal(): number;
    calculateCircumference(value: number): number;
}
export const DoughnutController: IChartComponent & {
    prototype: DoughnutController;
    new(chart: Chart, datasetIndex: number): DoughnutController;
};

export interface IPointControllerOptions {
    /**
     * The fill color for points.
     */
    pointBackgroundColor: ScriptableAndArray<Color>;
    /**
     * The border color for points.
     */
    pointBorderColor: ScriptableAndArray<Color>;
    /**
     * The width of the point border in pixels.
     */
    pointBorderWidth: ScriptableAndArray<number>;
    /**
     * The pixel size of the non-displayed point that reacts to mouse events.
     */
    pointHitRadius: ScriptableAndArray<number>;
    /**
     * The radius of the point shape. If set to 0, the point is not rendered.
     */
    pointRadius: ScriptableAndArray<number>;
    /**
     * The rotation of the point in degrees.
     */
    pointRotation: ScriptableAndArray<number>;
    /**
     * Style of the point. more...
     */
    pointStyle: ScriptableAndArray<PointStyle>;
    /**
     * Point background color when hovered.
     */
    pointHoverBackgroundColor: ScriptableAndArray<Color>;
    /**
     * Point border color when hovered.
     */
    pointHoverBorderColor: ScriptableAndArray<Color>;
    /**
     * Border width of point when hovered.
     */
    pointHoverBorderWidth: ScriptableAndArray<number>;
    /**
     * The radius of the point when hovered.
     */
    pointHoverRadius: ScriptableAndArray<number>;
}

export interface ILineControllerDatasetOrGeneralOptions extends IPointControllerOptions {

}


export interface ILineControllerDatasetOptions extends IControllerDatasetOptions, ILineControllerDatasetOrGeneralOptions, ScriptableOptions<ILineOptions> {
    /**
     * The ID of the x axis to plot this dataset on.
     */
    xAxisID: string;
    /**
     * The ID of the y axis to plot this dataset on.
     */
    yAxisID: string;

    spanGap: boolean;
    showLine: boolean;
}

export interface ILineControllerOptions extends ILineControllerDatasetOrGeneralOptions{
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

export interface LineController extends DatasetController { }
export const LineController: IChartComponent & {
    prototype: LineController;
    new(chart: Chart, datasetIndex: number): LineController;
};
export interface PolarAreaController extends DoughnutController {
    countVisibleElements(): number;
}
export const PolarAreaController: IChartComponent & {
    prototype: PolarAreaController;
    new(chart: Chart, datasetIndex: number): PolarAreaController;
};

export interface PieController extends DoughnutController { }
export const PieController: IChartComponent & {
    prototype: PieController;
    new(chart: Chart, datasetIndex: number): PieController;
};

export interface RadarController extends DatasetController { }
export const RadarController: IChartComponent & {
    prototype: RadarController;
    new(chart: Chart, datasetIndex: number): RadarController;
};
export interface ScatterController extends LineController { }
export const ScatterController: IChartComponent & {
    prototype: ScatterController;
    new(chart: Chart, datasetIndex: number): ScatterController;
};

