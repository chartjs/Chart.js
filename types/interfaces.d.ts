import {
  IBarControllerDatasetOptions,
  ILineControllerDatasetOptions,
  ILineControllerChartOptions,
  IScatterDataPoint,
  IScatterControllerDatasetOptions,
  IScatterControllerChartOptions,
  IBubbleControllerDatasetOptions,
  IBubbleDataPoint,
  IDoughnutControllerChartOptions,
  IDoughnutControllerDatasetOptions,
  IDoughnutDataPoint,
  IPieControllerChartOptions,
  IPieControllerDatasetOptions,
  IPieDataPoint,
  IControllerDatasetOptions,
  IBarControllerChartOptions,
  IPolarAreaControllerChartOptions,
  IPolarAreaControllerDatasetOptions,
  IRadarControllerChartOptions,
  IRadarControllerDatasetOptions,
} from './controllers';
import { ICoreChartOptions } from './core/interfaces';
import { IElementChartOptions } from './elements';
import {
  ITooltipChartOptions,
  IFillerControllerDatasetOptions,
  ILegendChartOptions,
  ITitleChartOptions,
} from './plugins';
import { IChartAnimationOptions, IParsingOptions, IPlugin } from './core';
import {
  ILinearScaleOptions,
  ILogarithmicScaleOptions,
  ICategoryScaleOptions,
  IRadialLinearScaleOptions,
  ITimeScaleOptions,
} from './scales';

export type DeepPartial<T> = T extends {}
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export type DistributiveArray<T> = T extends unknown ? T[] : never

export interface ICartesianScaleTypeRegistry {
  linear: {
    options: ILinearScaleOptions;
  };
  logarithmic: {
    options: ILogarithmicScaleOptions;
  };
  category: {
    options: ICategoryScaleOptions;
  };
  time: {
    options: ITimeScaleOptions;
  };
  timeseries: {
    options: ITimeScaleOptions;
  };
}

export interface IRadialScaleTypeRegistry {
  radialLinear: {
    options: IRadialLinearScaleOptions;
  };
}

export interface IScaleTypeRegistry extends ICartesianScaleTypeRegistry, IRadialScaleTypeRegistry {
}

export type IScaleType = keyof IScaleTypeRegistry;

export interface IChartTypeRegistry {
  bar: {
    chartOptions: IBarControllerChartOptions;
    datasetOptions: IBarControllerDatasetOptions;
    defaultDataPoint: number;
    scales: keyof ICartesianScaleTypeRegistry;
  };
  line: {
    chartOptions: ILineControllerChartOptions;
    datasetOptions: ILineControllerDatasetOptions & IFillerControllerDatasetOptions;
    defaultDataPoint: IScatterDataPoint;
    scales: keyof ICartesianScaleTypeRegistry;
  };
  scatter: {
    chartOptions: IScatterControllerChartOptions;
    datasetOptions: IScatterControllerDatasetOptions;
    defaultDataPoint: IScatterDataPoint;
    scales: keyof ICartesianScaleTypeRegistry;
  };
  bubble: {
    chartOptions: {};
    datasetOptions: IBubbleControllerDatasetOptions;
    defaultDataPoint: IBubbleDataPoint;
    scales: keyof ICartesianScaleTypeRegistry;
  };
  pie: {
    chartOptions: IPieControllerChartOptions;
    datasetOptions: IPieControllerDatasetOptions;
    defaultDataPoint: IPieDataPoint;
    scales: keyof ICartesianScaleTypeRegistry;
  };
  doughnut: {
    chartOptions: IDoughnutControllerChartOptions;
    datasetOptions: IDoughnutControllerDatasetOptions;
    defaultDataPoint: IDoughnutDataPoint;
    scales: keyof ICartesianScaleTypeRegistry;
  };
  polarArea: {
    chartOptions: IPolarAreaControllerChartOptions;
    datasetOptions: IPolarAreaControllerDatasetOptions;
    defaultDataPoint: number;
    scales: keyof IRadialScaleTypeRegistry;
  };
  radar: {
    chartOptions: IRadarControllerChartOptions;
    datasetOptions: IRadarControllerDatasetOptions;
    defaultDataPoint: number;
    scales: keyof IRadialScaleTypeRegistry;
  };
}

export type IChartType = keyof IChartTypeRegistry;

export type IScaleOptions<SCALES extends IScaleType = IScaleType> = DeepPartial<
  { [key in IScaleType]: { type: key } & IScaleTypeRegistry[key]['options'] }[SCALES]
>;

export type IDatasetChartOptions<TYPE extends IChartType = IChartType> = {
  [key in TYPE]: {
    datasets: IChartTypeRegistry[key]['datasetOptions'];
  };
};

export type IScaleChartOptions<TYPE extends IChartType = IChartType> = {
  scales: {
    [key: string]: IScaleOptions<IChartTypeRegistry[TYPE]['scales']>;
  };
};

export type IChartOptions<TYPE extends IChartType = IChartType> = DeepPartial<
  ICoreChartOptions &
  IParsingOptions &
  ITooltipChartOptions &
  ILegendChartOptions &
  ITitleChartOptions &
  IChartAnimationOptions &
  IElementChartOptions &
  IDatasetChartOptions<TYPE> &
  IScaleChartOptions<TYPE> &
  IChartTypeRegistry[TYPE]['chartOptions']
>;

export type DefaultDataPoint<TYPE extends IChartType> = IChartType extends TYPE ? unknown[] : DistributiveArray<
  IChartTypeRegistry[TYPE]['defaultDataPoint']
>;

export interface IChartDatasetProperties<TYPE extends IChartType, DATA extends unknown[]> {
  type?: TYPE;
  data: DATA;
}

export type IChartDataset<
  TYPE extends IChartType = IChartType,
  DATA extends unknown[] = DefaultDataPoint<TYPE>
> = DeepPartial<
  IParsingOptions &
  { [key in IChartType]: { type: key } & IChartTypeRegistry[key]['datasetOptions'] }[TYPE]
> & IChartDatasetProperties<TYPE, DATA>;

export interface IChartData<
  TYPE extends IChartType = IChartType,
  DATA extends unknown[] = DefaultDataPoint<TYPE>,
  LABEL = string
> {
  labels: LABEL[];
  datasets: IChartDataset<TYPE, DATA>[];
}

export interface IChartConfiguration<
  TYPE extends IChartType = IChartType,
  DATA extends unknown[] = DefaultDataPoint<TYPE>,
  LABEL = string
> {
  type: TYPE;
  data: IChartData<TYPE, DATA, LABEL>;
  options?: IChartOptions<TYPE>;
  plugins?: IPlugin[];
}
