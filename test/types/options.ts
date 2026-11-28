import { Chart, ChartOptions, ChartType, DoughnutControllerChartOptions, Plugin } from '../../src/types.js';

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
  spacingMode: 'angular',
};

const chartOptions: ChartOptions<ChartType> = doughnutOptions;

// https://github.com/chartjs/Chart.js/issues/11608
const genericPlugin: Plugin = {
  id: 'centerText',
  beforeDraw(c) {}
};

const doughnutWithPlugin: Chart<'doughnut'> = new Chart('doughnut-plugin', {
  type: 'doughnut',
  data: {
    labels: ['a'],
    datasets: [{
      data: [1],
    }]
  },
  options: {
    maintainAspectRatio: false,
    cutout: '80%',
  },
  plugins: [genericPlugin],
});

const doughnutWithInlinePlugin: Chart<'doughnut'> = new Chart('doughnut-inline-plugin', {
  type: 'doughnut',
  data: {
    labels: ['a'],
    datasets: [{
      data: [1],
    }]
  },
  options: {
    cutout: '70%',
  },
  plugins: [{
    id: 'inlinePlugin',
    beforeDraw(c) {
      const typed: Chart<'doughnut'> = c;
      return Boolean(typed);
    }
  }],
});

const doughnutSpecificPlugin: Plugin<'doughnut'> = {
  id: 'doughnutOnly',
  beforeDraw(c) {}
};

const doughnutWithTypedPlugin: Chart<'doughnut'> = new Chart('doughnut-typed-plugin', {
  type: 'doughnut',
  data: {
    labels: ['a'],
    datasets: [{
      data: [1],
    }]
  },
  options: {
    cutout: '60%',
  },
  plugins: [doughnutSpecificPlugin],
});

const barOnlyPlugin: Plugin<'bar'> = {
  id: 'barOnly',
  beforeDraw(c) {}
};

const mismatchedPluginChart = new Chart('doughnut-mismatched-plugin', {
  type: 'doughnut',
  data: {
    labels: ['a'],
    datasets: [{
      data: [1],
    }]
  },
  options: {
    cutout: '50%',
  },
  // @ts-expect-error Plugin<'bar'> is not assignable to Plugin<NoInferType<'doughnut'>>
  plugins: [barOnlyPlugin],
});

const perDatasetDoughnutWithPlugin = new Chart('per-dataset-doughnut-plugin', {
  data: {
    labels: ['a'],
    datasets: [{
      type: 'doughnut' as const,
      data: [1],
    }]
  },
  options: {
    cutout: '80%',
  },
  plugins: [genericPlugin],
});
