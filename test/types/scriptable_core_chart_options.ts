import type { ChartConfiguration } from '../../src/types.js';

const getConfig = (): ChartConfiguration<'bar'> => {
  return {
    type: 'bar',
    data: {
      datasets: []
    },
    options: {
      backgroundColor: (context) => context.active ? '#fff' : undefined,
    }
  };
};

