import { Chart, Animation } from '../../src/types.js';

const chart = new Chart('id', {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
  options: {
    animation: false,
    animations: {
      colors: false,
      numbers: {
        properties: ['a', 'b'],
        type: 'number',
        from: 0,
        to: 10,
        delay: (ctx) => ctx.dataIndex * 100,
        duration: (ctx) => ctx.datasetIndex * 1000,
        loop: true,
        easing: 'linear',
        fn: (from: any, to: any, factor: number) => ({size: Animation.interpolators.number(0, 32, factor)} as any)
      }
    },
    transitions: {
      show: {
        animation: {
          duration: 10
        },
        animations: {
          numbers: false
        }
      },
      custom: {
        animation: {
          duration: 10
        }
      }
    }
  },
});


const pie = new Chart('id', {
  type: 'pie',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
  options: {
    animation: false,
  }
});


const polarArea = new Chart('id', {
  type: 'polarArea',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
  options: {
    animation: false,
  }
});
