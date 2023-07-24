import { defaults, LegendOptions } from '../../../src/types.js';

// https://github.com/chartjs/Chart.js/issues/8711
const original = (defaults.plugins.legend as LegendOptions<"line">).labels.generateLabels;

// @ts-ignore
defaults.plugins.legend.labels.generateLabels = function(chart) {
  return [{
    datasetIndex: 0,
    text: 'test'
  }];
};
