import { IBarControllerDatasetOptions, ILineControllerDatasetOptions, ILineControllerOptions, IScatterDataPoint, IScatterControllerDatasetOptions, IScatterControllerOptions } from "./controllers";
import { IChartOptions } from "./core/interfaces";
import { ITooltipChartOptions, IFillerControllerDatasetOptions } from "./plugins";
import { IChartAnimationOptions, IParsingOptions } from "./core";
import { IScaleChartOptions } from "./scales";

export type DeepPartial<T> = T extends {}
? {
    [K in keyof T]?: DeepPartial<T[K]>;
  }
: T;


export interface ICommonChartOptions extends DeepPartial<IChartOptions & ITooltipChartOptions & IChartAnimationOptions & IScaleChartOptions> {

}


export interface IBarControllerDataset<T = number> extends DeepPartial<IBarControllerDatasetOptions>, DeepPartial<IParsingOptions> {
    label: string;
    data: T[];
}

export interface ILineControllerDataset<T = IScatterDataPoint> extends DeepPartial<ILineControllerDatasetOptions & IFillerControllerDatasetOptions>, DeepPartial<IParsingOptions> {
    label: string;
    data: T[];
}

export interface IScatterControllerDataset<T = IScatterDataPoint> extends DeepPartial<IScatterControllerDatasetOptions>, DeepPartial<IParsingOptions> {
    label: string;
    data: T[];
}


export type IMixedControllerDataset<T> = ({type: 'bar' & IBarControllerDataset<T>}) | ({type: 'line' & ILineControllerDataset<T>}) | ({type: 'scatter' & IScatterControllerDataset<T>});


export interface IBarControllerConfiguration<T = number, L=string> {
  type: 'bar',
  data: {
    labels: L[],
    datasets: (IBarControllerDataset<T> | IMixedControllerDataset<T>)[]
  } & DeepPartial<IParsingOptions>;
  options?: ICommonChartOptions;
}


export interface ILineControllerConfiguration<T = IScatterDataPoint, L=string> {
    type: 'line',
    data: {
        labels: L[],
        datasets: (ILineControllerDataset<T> | IMixedControllerDataset<T>)[]
    } & DeepPartial<IParsingOptions>;
    options?: ICommonChartOptions & Partial<ILineControllerOptions>;
}


export interface IScatterControllerConfiguration<T = IScatterDataPoint, L=string>{
    type: 'scatter',
    data: {
        labels: L[],
        datasets: (IScatterControllerDataset<T> | IMixedControllerDataset<T>)[]
    } & DeepPartial<IParsingOptions>;
    options?: ICommonChartOptions & Partial<IScatterControllerOptions>;
}
