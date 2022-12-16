import { Chart, DecimationAlgorithm } from '../../../../src/types.js';

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


const chart2 = new Chart('id', {
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
        algorithm: 'lttb',
      }
    }
  }
});


const chart3 = new Chart('id', {
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
        algorithm: DecimationAlgorithm.minmax,
      }
    }
  }
});


const chart4 = new Chart('id', {
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
        algorithm: 'min-max',
      }
    }
  }
});
