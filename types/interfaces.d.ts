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
import { IChartAnimationOptions, IParsingOptions } from './core';
import { IScaleChartOptions } from './scales';

export type DeepPartial<T> = T extends {}
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export type IChartDataset<T = number, O = {}> = DeepPartial<IControllerDatasetOptions & IParsingOptions & O> & {
  data: T[];
};

export type IBarControllerDataset<T = number> = IChartDataset<T, IBarControllerDatasetOptions>;
export type ILineControllerDataset<T = IScatterDataPoint> = IChartDataset<
  T,
  ILineControllerDatasetOptions & IFillerControllerDatasetOptions
>;
export type IScatterControllerDataset<T = IScatterDataPoint> = IChartDataset<T, IScatterControllerDatasetOptions>;
export type IBubbleControllerDataset<T = IBubbleDataPoint> = IChartDataset<T, IBubbleControllerDatasetOptions>;
export type IPieControllerDataset<T = IPieDataPoint> = IChartDataset<T, IPieControllerDatasetOptions>;
export type IDoughnutControllerDataset<T = IDoughnutDataPoint> = IChartDataset<T, IDoughnutControllerDatasetOptions>;
export type IPolarAreaControllerDataset<T = number> = IChartDataset<T, IPolarAreaControllerDatasetOptions>;
export type IRadarControllerDataset<T = number> = IChartDataset<T, IRadarControllerDatasetOptions>;

export interface IChartData<T = number, L = string, DS extends IChartDataset<T> = IChartDataset<T>>
  extends DeepPartial<IParsingOptions> {
  labels: L[];
  datasets: DS[];
}

export type IChartOptions<O = {}> = DeepPartial<
  ICoreChartOptions &
    ITooltipChartOptions &
    ILegendChartOptions &
    ITitleChartOptions &
    IChartAnimationOptions &
    IScaleChartOptions &
    IElementChartOptions &
    O
>;

export interface IChartConfiguration<
  TYPE = string,
  T = number,
  L = string,
  DS extends IChartDataset<T> = IChartDataset<T>,
  O = {}
> {
  type: TYPE;
  data: IChartData<T, L, DS>;
  options?: IChartOptions<O>;
}

export type IBarControllerConfiguration<T = number, L = string> = IChartConfiguration<
  'bar',
  T,
  L,
  IBarControllerDataset<T>,
  IBarControllerChartOptions
>;
export type ILineControllerConfiguration<T = IScatterDataPoint, L = string> = IChartConfiguration<
  'line',
  T,
  L,
  ILineControllerDataset<T>,
  ILineControllerChartOptions
>;
export type IScatterControllerConfiguration<T = IScatterDataPoint, L = string> = IChartConfiguration<
  'scatter',
  T,
  L,
  IScatterControllerDataset<T>,
  IScatterControllerChartOptions
>;
export type IBubbleControllerConfiguration<T = IBubbleDataPoint, L = string> = IChartConfiguration<
  'bubble',
  T,
  L,
  IBubbleControllerDataset<T>
>;
export type IPieControllerConfiguration<T = IPieDataPoint, L = string> = IChartConfiguration<
  'pie',
  T,
  L,
  IPieControllerDataset<T>,
  IPieControllerChartOptions
>;
export type IDoughnutControllerConfiguration<T = IDoughnutDataPoint, L = string> = IChartConfiguration<
  'doughnut',
  T,
  L,
  IDoughnutControllerDataset<T>,
  IDoughnutControllerChartOptions
>;
export type IPolarAreaControllerConfiguration<T = number, L = string> = IChartConfiguration<
  'polarArea',
  T,
  L,
  IPolarAreaControllerDataset<T>,
  IPolarAreaControllerChartOptions
>;
export type IRadarControllerConfiguration<T = number, L = string> = IChartConfiguration<
  'radar',
  T,
  L,
  IRadarControllerDataset<T>,
  IRadarControllerChartOptions
>;

export type ConfigurationOptions<O> = O extends IChartConfiguration<unknown, unknown, unknown, infer O> ? O : never;
export type ConfigurationData<O> = O extends IChartConfiguration<unknown, infer T, infer L, infer DS, unknown>
  ? IChartData<T, L, DS>
  : never;
export type ConfigurationDataset<O> = O extends IChartConfiguration<unknown, unknown, unknown, infer DS, unknown>
  ? DS
  : never;
