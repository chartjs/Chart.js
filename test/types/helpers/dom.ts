import { getRelativePosition } from '../../../src/helpers/helpers.dom.js';
import { Chart, ChartOptions } from '../../../src/types.js';

const chart = new Chart('test', {
  type: 'line',
  data: {
    datasets: []
  }
});

getRelativePosition(new MouseEvent('click'), chart);
