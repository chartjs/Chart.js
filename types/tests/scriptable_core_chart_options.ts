import { ChartConfiguration } from '../index.esm';

const getConfig = (): ChartConfiguration<'bar'> => {
  return {
    type: 'bar',
    data: {
      datasets: []
    },
    options: {
      backgroundColor: (context) => context.active ? '#fff' : undefined,
      font: (context) => context.datasetIndex === 1 ? { size: 10 } : { size: 12, family: 'arial' }
    }
  };
};

