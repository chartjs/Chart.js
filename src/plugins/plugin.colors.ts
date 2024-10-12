import {DoughnutController, PolarAreaController, defaults} from '../index.js';
import type {Chart, ChartDataset} from '../types.js';

export interface ColorsPluginOptions {
  enabled?: boolean;
  forceOverride?: boolean;
}

interface ColorsDescriptor {
  backgroundColor?: unknown;
  borderColor?: unknown;
}

const BORDER_COLORS = [
  'rgb(54, 162, 235)', // blue
  'rgb(255, 99, 132)', // red
  'rgb(255, 159, 64)', // orange
  'rgb(255, 205, 86)', // yellow
  'rgb(75, 192, 192)', // green
  'rgb(153, 102, 255)', // purple
  'rgb(201, 203, 207)' // grey
];

// Border colors with 50% transparency
const BACKGROUND_COLORS = /* #__PURE__ */ BORDER_COLORS.map(color => color.replace('rgb(', 'rgba(').replace(')', ', 0.5)'));

function getBorderColor(i: number) {
  return BORDER_COLORS[i % BORDER_COLORS.length];
}

function getBackgroundColor(i: number) {
  return BACKGROUND_COLORS[i % BACKGROUND_COLORS.length];
}

function colorizeDefaultDataset(dataset: ChartDataset, i: number) {
  dataset.borderColor = getBorderColor(i);
  dataset.backgroundColor = getBackgroundColor(i);

  return ++i;
}

function colorizeDoughnutDataset(dataset: ChartDataset, i: number) {
  dataset.backgroundColor = dataset.data.map(() => getBorderColor(i++));

  return i;
}

function colorizePolarAreaDataset(dataset: ChartDataset, i: number) {
  dataset.backgroundColor = dataset.data.map(() => getBackgroundColor(i++));

  return i;
}

function getColorizer(chart: Chart) {
  let i = 0;

  return (dataset: ChartDataset, datasetIndex: number) => {
    const controller = chart.getDatasetMeta(datasetIndex).controller;

    if (controller instanceof DoughnutController) {
      i = colorizeDoughnutDataset(dataset, i);
    } else if (controller instanceof PolarAreaController) {
      i = colorizePolarAreaDataset(dataset, i);
    } else if (controller) {
      i = colorizeDefaultDataset(dataset, i);
    }
  };
}

function containsColorsDefinitions(
  descriptors: ColorsDescriptor[] | Record<string, ColorsDescriptor>
) {
  let k: number | string;

  for (k in descriptors) {
    if (descriptors[k].borderColor || descriptors[k].backgroundColor) {
      return true;
    }
  }

  return false;
}

function containsColorsDefinition(
  descriptor: ColorsDescriptor
) {
  return descriptor && (descriptor.borderColor || descriptor.backgroundColor);
}

function containsDefaultColorsDefenitions() {
  return defaults.borderColor !== 'rgba(0,0,0,0.1)' || defaults.backgroundColor !== 'rgba(0,0,0,0.1)';
}

export default {
  id: 'colors',

  defaults: {
    enabled: true,
    forceOverride: false
  } as ColorsPluginOptions,

  beforeLayout(chart: Chart, _args, options: ColorsPluginOptions) {
    if (!options.enabled) {
      return;
    }

    const {
      data: {datasets},
      options: chartOptions
    } = chart.config;
    const {elements} = chartOptions;

    const containsColorDefenition = (
      containsColorsDefinitions(datasets) ||
      containsColorsDefinition(chartOptions) ||
      (elements && containsColorsDefinitions(elements)) ||
      containsDefaultColorsDefenitions());

    if (!options.forceOverride && containsColorDefenition) {
      return;
    }

    const colorizer = getColorizer(chart);

    datasets.forEach(colorizer);
  }
};
