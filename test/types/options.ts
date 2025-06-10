import { Chart, ChartOptions, ChartType, DoughnutControllerChartOptions } from '../../src/types.js';

const chart = new Chart('test', {
  type: 'bar',
  data: {
    labels: ['a'],
    datasets: [{
      data: [1],
    }, {
      type: 'line',
      data: [{ x: 1, y: 1 }]
    }]
  },
  options: {
    animation: {
      duration: 500
    },
    backgroundColor: 'red',
    datasets: {
      line: {
        animation: {
          duration: 600
        },
        backgroundColor: 'blue',
      }
    },
    elements: {
      point: {
        backgroundColor: 'red'
      }
    }
  }
});

const doughnutOptions: DoughnutControllerChartOptions = {
  circumference: 360,
  cutout: '50%',
  offset: 0,
  radius: 100,
  rotation: 0,
  spacing: 0,
  animation: false,
};

const chartOptions: ChartOptions<ChartType> = doughnutOptions;
