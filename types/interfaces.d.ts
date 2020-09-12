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

export interface IChartDatasetProperties<TYPE extends IChartType, DATA extends unknown[]> {
  type?: TYPE;
  data: DATA;
}

export type IChartDatasetBase<TYPE extends IChartType, DATA extends unknown[], O> = DeepPartial<
  IControllerDatasetOptions & IParsingOptions & O
> & IChartDatasetProperties<TYPE, DATA>;

export type IBarControllerDataset<DATA extends unknown[] = number[]> = IChartDatasetBase<
  'bar',
  DATA,
  IBarControllerDatasetOptions
>;
export type ILineControllerDataset<DATA extends unknown[] = IScatterDataPoint[]> = IChartDatasetBase<
  'line',
  DATA,
  ILineControllerDatasetOptions & IFillerControllerDatasetOptions
>;
export type IScatterControllerDataset<DATA extends unknown[] = IScatterDataPoint[]> = IChartDatasetBase<
  'scatter',
  DATA,
  IScatterControllerDatasetOptions
>;
export type IBubbleControllerDataset<DATA extends unknown[] = IBubbleDataPoint[]> = IChartDatasetBase<
  'bubble',
  DATA,
  IBubbleControllerDatasetOptions
>;
export type IPieControllerDataset<DATA extends unknown[] = IPieDataPoint[]> = IChartDatasetBase<
  'pie',
  DATA,
  IPieControllerDatasetOptions
>;
export type IDoughnutControllerDataset<DATA extends unknown[] = IDoughnutDataPoint[]> = IChartDatasetBase<
  'doughnut',
  DATA,
  IDoughnutControllerDatasetOptions
>;
export type IPolarAreaControllerDataset<DATA extends unknown[] = number[]> = IChartDatasetBase<
  'polarArea',
  DATA,
  IPolarAreaControllerDatasetOptions
>;
export type IRadarControllerDataset<DATA extends unknown[] = number[]> = IChartDatasetBase<
  'radar',
  DATA,
  IRadarControllerDatasetOptions
>;

export interface IChartDatasetRegistry<DATA extends unknown[]> {
  bar: IBarControllerDataset<DATA>;
  line: ILineControllerDataset<DATA>;
  scatter: IScatterControllerDataset<DATA>;
  bubble: IBubbleControllerDataset<DATA>;
  pie: IPieControllerDataset<DATA>;
  doughnut: IDoughnutControllerDataset<DATA>;
  polarArea: IPolarAreaControllerDataset<DATA>;
  radar: IRadarControllerDataset<DATA>;
}

export type IChartDataset<T extends unknown[] = unknown[]> = IChartDatasetRegistry<T>[keyof IChartDatasetRegistry<T>]

export interface IChartData<
  TYPE extends IChartType = IChartType,
  DATA extends unknown[] = unknown[],
  LABEL = string
> {
  labels: LABEL[];
  // IChartDatasetProperties is repeated here in order to help the compiler to infer the generic types
  datasets: (IChartDatasetProperties<TYPE, DATA> & IChartDatasetRegistry<DATA>[TYPE])[];
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
  DATA extends unknown[] = unknown[],
  LABEL = string
> {
  type: TYPE;
  data: IChartData<TYPE, DATA, LABEL>;
  options?: IChartOptionsRegistry[TYPE];
  plugins?: IPlugin[];
}
