import {Chart} from 'chart.js';
import {valueOrDefault} from 'chart.js/helpers';

Chart.register({
  id: 'TEST_PLUGIN',
  dummyValue: valueOrDefault(0, 1)
});
