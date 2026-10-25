import {
  Chart, ChartData, ChartConfiguration, Element
} from '../../src/types.js';

const data: ChartData<'line'> = { datasets: [] };
const chartItem = 'item';
const config: ChartConfiguration<'line'> = { type: 'line', data };
const chart: Chart = new Chart(chartItem, config);

type Item = {
  element: Element,
  datasetIndex: number,
  index: number,
  data: unknown
}

const elements: Item[] = [];
chart.updateHoverStyle(elements, 'dataset', true);

// ensure InteractionItem exposes the new `data` field
import type {InteractionItem} from '../../src/types.js';
const interactionItem: InteractionItem = {
  element: {} as Element,
  datasetIndex: 0,
  index: 0,
  data: {some: 'value'}
};

// onClick listener should expose data property on each element
chart.options.onClick = (e, elements, c) => {
  const val = elements[0].data; // should be allowed
};
