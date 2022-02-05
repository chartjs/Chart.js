import {
  Chart, ChartData, ChartConfiguration, Element
} from '../index.esm';

const data: ChartData<'line'> = { datasets: [] };
const chartItem = 'item';
const config: ChartConfiguration<'line'> = { type: 'line', data };
const chart: Chart = new Chart(chartItem, config);

type Item = {
  element: Element,
  datasetIndex: number,
  index: number
}

const elements: Item[] = [];
chart.updateHoverStyle(elements, 'dataset', true);
