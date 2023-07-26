import { defaults } from '../../../src/types.js';

// https://github.com/chartjs/Chart.js/issues/8711
const original = defaults.plugins.legend.labels.generateLabels;

defaults.plugins.legend.labels.generateLabels = function(chart) {
  return [{
    datasetIndex: 0,
    text: 'test'
  }];
};
