import { Chart, RadialLinearScale } from '../../../src/types.js';

const chart = new Chart('test', {
  type: 'radar',
  data: {
    labels: ['a', 'b'],
    datasets: [{
      data: [1, 2]
    }]
  }
});

const scale = chart.scales.r as RadialLinearScale;

const position: { x: number; y: number; angle: number } = scale.getPointPosition(0, 100);
const shiftedPosition: { x: number; y: number; angle: number } = scale.getPointPosition(0, 100, Math.PI / 2);

// @ts-expect-error additionalAngle must be a number
scale.getPointPosition(0, 100, '1');
