const Chart = require('chart.js/auto');
const {valueOrDefault} = require('chart.js/helpers');

Chart.register({
  id: 'TEST_PLUGIN',
  dummyValue: valueOrDefault(0, 1)
});
