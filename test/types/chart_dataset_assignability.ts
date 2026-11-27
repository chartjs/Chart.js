import type {ChartDataset, ChartTypeRegistry} from '../../src/types.js';

const scatter = {} as ChartDataset<'scatter'>;
const line = {} as ChartDataset<'line'>;
const bar = {} as ChartDataset<'bar', number[]>;

export const anyScatter: ChartDataset<keyof ChartTypeRegistry> = scatter;
export const anyLine: ChartDataset<keyof ChartTypeRegistry> = line;
export const anyBar: ChartDataset = bar;
export const datasets: ChartDataset[] = [scatter, line, bar];
