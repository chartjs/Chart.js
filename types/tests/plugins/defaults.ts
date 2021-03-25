import { defaults } from '../../index.esm';

// https://github.com/chartjs/Chart.js/issues/8711
const original = defaults.plugins.legend.labels.generateLabels;

defaults.plugins.legend.labels.generateLabels = function(chart) {
  return [{
    datasetIndex: 0,
    text: 'test'
  }];
};

// @ts-expect-error Type '{ text: string; }[]' is not assignable to type 'LegendItem[]'.
defaults.plugins.legend.labels.generateLabels = function(chart) {
  return [{
    text: 'test'
  }];
};
