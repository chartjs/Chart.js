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
import { FillerControllerDatasetOptions } from './plugins';
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

export type ScaleOptions<TScale extends ScaleType = ScaleType> = DeepPartial<
  { [key in ScaleType]: { type: key } & ScaleTypeRegistry[key]['options'] }[TScale]
>;

export type DatasetChartOptions<TType extends ChartType = ChartType> = {
  [key in TType]: {
    datasets: ChartTypeRegistry[key]['datasetOptions'];
  };
};

export type ScaleChartOptions<TType extends ChartType = ChartType> = {
  scales: {
    [key: string]: ScaleOptions<ChartTypeRegistry[TType]['scales']>;
  };
};

export type ChartOptions<TType extends ChartType = ChartType> = DeepPartial<
  CoreChartOptions &
  ElementChartOptions &
  DatasetChartOptions<TType> &
  ScaleChartOptions<TType> &
  ChartTypeRegistry[TType]['chartOptions']
>;

export type DefaultDataPoint<TType extends ChartType> = ChartType extends TType ? unknown[] : DistributiveArray<
  ChartTypeRegistry[TType]['defaultDataPoint']
>;

export interface ChartDatasetProperties<TType extends ChartType, TData extends unknown[]> {
  type?: TType;
  data: TData;
}

export type ChartDataset<
  TType extends ChartType = ChartType,
  TData extends unknown[] = DefaultDataPoint<TType>
> = DeepPartial<
  { [key in ChartType]: { type: key } & ChartTypeRegistry[key]['datasetOptions'] }[TType]
> & ChartDatasetProperties<TType, TData>;

export interface ChartData<
  TType extends ChartType = ChartType,
  TData extends unknown[] = DefaultDataPoint<TType>,
  TLabel = unknown
> {
  labels: TLabel[];
  datasets: ChartDataset<TType, TData>[];
}

export interface ChartConfiguration<
  TType extends ChartType = ChartType,
  TData extends unknown[] = DefaultDataPoint<TType>,
  TLabel = unknown
> {
  type: TType;
  data: ChartData<TType, TData, TLabel>;
  options?: ChartOptions<TType>;
  plugins?: Plugin[];
}
