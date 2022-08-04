/* eslint-disable es/no-dynamic-import */
Promise.all([
  import('chart.js'),
  import('chart.js/helpers')
]).then(([{Chart}, {valueOrDefault}]) => {
  Chart.register({
    id: 'TEST_PLUGIN',
    dummyValue: valueOrDefault(0, 1)
  });
});
