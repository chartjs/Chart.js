import { ChartConfiguration } from '../index.esm';

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

