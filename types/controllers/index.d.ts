import { IChartComponent } from "../core/interfaces";
import { Chart, DatasetController } from "../core";
import { ICategoryScaleOptions, ILinearScaleOptions } from "../scales";

export interface IDatasetControllerOptions {

    datasets: {

    }
}

export interface IBarControllerDatasetOptions {
    categoryPercentage: number;
    barPercentage: number;
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

export interface ILineControllerDatasetOptions {
    spanGap: boolean;
    showLine: boolean;

    pointRadius: number;
}

export interface ILineControllerOptions {
    spanGaps: boolean;
    showLines: boolean;

    pointRadius: number;
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

