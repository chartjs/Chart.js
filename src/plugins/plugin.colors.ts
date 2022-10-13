import type {Chart, ChartDataset} from '../types';

type DatasetColorizer = (dataset: ChartDataset, i: number) => void;

const BORDER_COLORS = [
  'rgb(54, 162, 235)', // blue
  'rgb(255, 99, 132)', // red
  'rgb(255, 159, 64)', // orange
  'rgb(255, 205, 86)', // yellow
  'rgb(75, 192, 192)', // green
  'rgb(153, 102, 255)', // purple
  'rgb(201, 203, 207)' // grey
];

// Primary colors with 50% transparency
const BACKGROUND_COLORS = BORDER_COLORS.map(_ => _.replace(')', ', 0.5)'));

function getBorderColor(i: number) {
  return BORDER_COLORS[i % BORDER_COLORS.length];
}

function getBackgroundColor(i: number) {
  return BACKGROUND_COLORS[i % BACKGROUND_COLORS.length];
}

function createDefaultDatasetColorizer() {
  return (dataset: ChartDataset, i: number) => {
    if (!dataset.borderColor && !dataset.backgroundColor) {
      dataset.borderColor = getBorderColor(i);
      dataset.backgroundColor = getBackgroundColor(i);
    }
  };
}

function createDoughnutDatasetColorizer() {
  let i = 0;

  return (dataset: ChartDataset) => {
    if (!dataset.borderColor && !dataset.backgroundColor) {
      dataset.backgroundColor = dataset.data.map(() => getBorderColor(i++));
    }
  };
}

function createPolarAreaDatasetColorizer() {
  let i = 0;

  return (dataset: ChartDataset) => {
    if (!dataset.borderColor && !dataset.backgroundColor) {
      dataset.backgroundColor = dataset.data.map(() => getBackgroundColor(i++));
    }
  };
}

export default {
  id: 'colors',

  beforeLayout(chart: Chart) {
    const {type} = chart.config;
    let colorizer: DatasetColorizer;

    if (type === 'doughnut') {
      colorizer = createDoughnutDatasetColorizer();
    } else if (type === 'polarArea') {
      colorizer = createPolarAreaDatasetColorizer();
    } else {
      colorizer = createDefaultDatasetColorizer();
    }

    chart.data.datasets.forEach(colorizer);
  },
};
