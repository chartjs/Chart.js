const Chart = require('chart.js');
const valueOrDefault = Chart.helpers.valueOrDefault;

Chart.register({
  id: 'TEST_PLUGIN',
  dummyValue: valueOrDefault(0, 1)
});
