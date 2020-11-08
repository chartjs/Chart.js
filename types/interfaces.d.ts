import {
  BarControllerDatasetOptions,
  LineControllerDatasetOptions,
  LineControllerChartOptions,
  ScatterDataPoint,
  ScatterControllerDatasetOptions,
  ScatterControllerChartOptions,
  BubbleControllerDatasetOptions,
  BubbleDataPoint,
  DoughnutControllerChartOptions,
  DoughnutControllerDatasetOptions,
  DoughnutDataPoint,
  PieControllerChartOptions,
  PieControllerDatasetOptions,
  PieDataPoint,
  ControllerDatasetOptions,
  BarControllerChartOptions,
  PolarAreaControllerChartOptions,
  PolarAreaControllerDatasetOptions,
  RadarControllerChartOptions,
  RadarControllerDatasetOptions,
} from './controllers';
import { CoreChartOptions } from './core/interfaces';
import { ElementChartOptions } from './elements';
import { FillerControllerDatasetOptions, PluginChartOptions } from './plugins';
import { Plugin } from './core';
import {
  LinearScaleOptions,
  LogarithmicScaleOptions,
  CategoryScaleOptions,
  RadialLinearScaleOptions as RadialLinearScaleOptions,
  TimeScaleOptions,
} from './scales';

export type DeepPartial<T> = T extends {}
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export type DistributiveArray<T> = T extends unknown ? T[] : never

export interface CartesianScaleTypeRegistry {
  linear: {
    options: LinearScaleOptions;
  };
  logarithmic: {
    options: LogarithmicScaleOptions;
  };
  category: {
    options: CategoryScaleOptions;
  };
  time: {
    options: TimeScaleOptions;
  };
  timeseries: {
    options: TimeScaleOptions;
  };
}

export interface RadialScaleTypeRegistry {
  radialLinear: {
    options: RadialLinearScaleOptions;
  };
}

export interface ScaleTypeRegistry extends CartesianScaleTypeRegistry, RadialScaleTypeRegistry {
}

export type ScaleType = keyof ScaleTypeRegistry;

export interface ChartTypeRegistry {
  bar: {
    chartOptions: BarControllerChartOptions;
    datasetOptions: BarControllerDatasetOptions;
    defaultDataPoint: number;
    scales: keyof CartesianScaleTypeRegistry;
  };
  line: {
    chartOptions: LineControllerChartOptions;
    datasetOptions: LineControllerDatasetOptions & FillerControllerDatasetOptions;
    defaultDataPoint: ScatterDataPoint;
    scales: keyof CartesianScaleTypeRegistry;
  };
  scatter: {
    chartOptions: ScatterControllerChartOptions;
    datasetOptions: ScatterControllerDatasetOptions;
    defaultDataPoint: ScatterDataPoint;
    scales: keyof CartesianScaleTypeRegistry;
  };
  bubble: {
    chartOptions: {};
    datasetOptions: BubbleControllerDatasetOptions;
    defaultDataPoint: BubbleDataPoint;
    scales: keyof CartesianScaleTypeRegistry;
  };
  pie: {
    chartOptions: PieControllerChartOptions;
    datasetOptions: PieControllerDatasetOptions;
    defaultDataPoint: PieDataPoint;
    scales: keyof CartesianScaleTypeRegistry;
  };
  doughnut: {
    chartOptions: DoughnutControllerChartOptions;
    datasetOptions: DoughnutControllerDatasetOptions;
    defaultDataPoint: DoughnutDataPoint;
    scales: keyof CartesianScaleTypeRegistry;
  };
  polarArea: {
    chartOptions: PolarAreaControllerChartOptions;
    datasetOptions: PolarAreaControllerDatasetOptions;
    defaultDataPoint: number;
    scales: keyof RadialScaleTypeRegistry;
  };
  radar: {
    chartOptions: RadarControllerChartOptions;
    datasetOptions: RadarControllerDatasetOptions;
    defaultDataPoint: number;
    scales: keyof RadialScaleTypeRegistry;
  };
}

export type ChartType = keyof ChartTypeRegistry;

export type ScaleOptions<SCALES extends ScaleType = ScaleType> = DeepPartial<
  { [key in ScaleType]: { type: key } & ScaleTypeRegistry[key]['options'] }[SCALES]
>;

export type DatasetChartOptions<TYPE extends ChartType = ChartType> = {
  [key in TYPE]: {
    datasets: ChartTypeRegistry[key]['datasetOptions'];
  };
};

export type ScaleChartOptions<TYPE extends ChartType = ChartType> = {
  scales: {
    [key: string]: ScaleOptions<ChartTypeRegistry[TYPE]['scales']>;
  };
};

export type ChartOptions<TYPE extends ChartType = ChartType> = DeepPartial<
  CoreChartOptions &
  PluginChartOptions &
  ElementChartOptions &
  DatasetChartOptions<TYPE> &
  ScaleChartOptions<TYPE> &
  ChartTypeRegistry[TYPE]['chartOptions']
>;

export type DefaultDataPoint<TYPE extends ChartType> = ChartType extends TYPE ? unknown[] : DistributiveArray<
  ChartTypeRegistry[TYPE]['defaultDataPoint']
>;

export interface ChartDatasetProperties<TYPE extends ChartType, DATA extends unknown[]> {
  type?: TYPE;
  data: DATA;
}

export type ChartDataset<
  TYPE extends ChartType = ChartType,
  DATA extends unknown[] = DefaultDataPoint<TYPE>
> = DeepPartial<
  { [key in ChartType]: { type: key } & ChartTypeRegistry[key]['datasetOptions'] }[TYPE]
> & ChartDatasetProperties<TYPE, DATA>;

export interface ChartData<
  TYPE extends ChartType = ChartType,
  DATA extends unknown[] = DefaultDataPoint<TYPE>,
  LABEL = unknown
> {
  labels: LABEL[];
  datasets: ChartDataset<TYPE, DATA>[];
}

export interface ChartConfiguration<
  TYPE extends ChartType = ChartType,
  DATA extends unknown[] = DefaultDataPoint<TYPE>,
  LABEL = unknown
> {
  type: TYPE;
  data: ChartData<TYPE, DATA, LABEL>;
  options?: ChartOptions<TYPE>;
  plugins?: Plugin[];
}
