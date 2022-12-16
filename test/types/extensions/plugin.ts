import { Chart } from '../../../src/types.js';

Chart.register({
  id: 'my-plugin',
  afterDraw: (chart: Chart) => {
    // noop
  }
});

Chart.register([{
  id: 'my-plugin',
  afterDraw: (chart: Chart) => {
    // noop
  },
}]);

// @ts-expect-error not assignable
Chart.register({
  id: 'fail',
  noComponentHasThisMethod: () => 'test'
});

// @ts-expect-error missing id
Chart.register([{
  afterDraw: (chart: Chart) => {
    // noop
  },
}]);
