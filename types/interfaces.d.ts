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
import { IScaleChartOptions } from './scales';

export type DeepPartial<T> = T extends {}
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export enum ChartTypeEnum {
  bar = 'bar',
  bubble = 'bubble',
  doughnut = 'doughnut',
  line = 'line',
  pie = 'pie',
  polarArea = 'polarArea',
  radar = 'radar',
  scatter = 'scatter',
}

export type IChartType = keyof typeof ChartTypeEnum;

export type IChartDatasetBase<T, O> = DeepPartial<IControllerDatasetOptions & IParsingOptions & O> & {
  data: T[];
};

export type IBarControllerDataset<T = number> = IChartDatasetBase<T, IBarControllerDatasetOptions>;
export type ILineControllerDataset<T = IScatterDataPoint> = IChartDatasetBase<
  T,
  ILineControllerDatasetOptions & IFillerControllerDatasetOptions
>;
export type IScatterControllerDataset<T = IScatterDataPoint> = IChartDatasetBase<T, IScatterControllerDatasetOptions>;
export type IBubbleControllerDataset<T = IBubbleDataPoint> = IChartDatasetBase<T, IBubbleControllerDatasetOptions>;
export type IPieControllerDataset<T = IPieDataPoint> = IChartDatasetBase<T, IPieControllerDatasetOptions>;
export type IDoughnutControllerDataset<T = IDoughnutDataPoint> = IChartDatasetBase<T, IDoughnutControllerDatasetOptions>;
export type IPolarAreaControllerDataset<T = number> = IChartDatasetBase<T, IPolarAreaControllerDatasetOptions>;
export type IRadarControllerDataset<T = number> = IChartDatasetBase<T, IRadarControllerDatasetOptions>;

export interface IChartDatasetRegistry<T> {
  bar: IBarControllerDataset<T>;
  line: ILineControllerDataset<T>;
  scatter: IScatterControllerDataset<T>;
  bubble: IBubbleControllerDataset<T>;
  pie: IPieControllerDataset<T>;
  doughnut: IDoughnutControllerDataset<T>;
  polarArea: IPolarAreaControllerDataset<T>;
  radar: IRadarControllerDataset<T>;
}

export type IChartDataset<T = unknown> = IChartDatasetRegistry<T>[keyof IChartDatasetRegistry<T>]

export interface IChartData<
  TYPE extends IChartType = IChartType,
  T = unknown,
  L = string
> {
  labels: L[];
  // "data" property must be repeated here in order to help the compiler to infer the actual type of T
  datasets: ({ data: T[] } & IChartDatasetRegistry<T>[TYPE])[];
}

export type IChartOptionsBase<O> = DeepPartial<
  ICoreChartOptions &
    IParsingOptions &
    ITooltipChartOptions &
    ILegendChartOptions &
    ITitleChartOptions &
    IChartAnimationOptions &
    IScaleChartOptions &
    IElementChartOptions &
    O
>;

export interface IChartOptionsRegistry {
  bar: IChartOptionsBase<IBarControllerChartOptions>;
  line: IChartOptionsBase<ILineControllerChartOptions>;
  scatter: IChartOptionsBase<IScatterControllerChartOptions>;
  bubble: IChartOptionsBase<{}>;
  pie: IChartOptionsBase<IPieControllerChartOptions>;
  doughnut: IChartOptionsBase<IDoughnutControllerChartOptions>;
  polarArea: IChartOptionsBase<IPolarAreaControllerChartOptions>;
  radar: IChartOptionsBase<IRadarControllerChartOptions>;
}

export type IChartOptions = IChartOptionsRegistry[keyof IChartOptionsRegistry]

export interface IChartConfiguration<
  TYPE extends IChartType = IChartType,
  T = unknown,
  L = string
> {
  type: TYPE;
  data: IChartData<TYPE, T, L>;
  options?: IChartOptionsRegistry[TYPE];
  plugins?: IPlugin[];
}
