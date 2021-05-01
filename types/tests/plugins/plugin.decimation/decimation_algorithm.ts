import { Chart, DecimationAlgorithm } from '../../../index.esm';

const chart = new Chart('id', {
  type: 'bubble',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
  options: {
    plugins: {
      decimation: {
        algorithm: DecimationAlgorithm.lttb,
      }
    }
  }
});
