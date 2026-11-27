/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import {Chart} from 'chart.js';
import AutoChart from 'chart.js/auto';
import {debounce} from 'chart.js/helpers';
import {TypeEqual, TypeOf, expectType} from 'ts-expect';

declare module 'chart.js' {
  interface PluginOptionsByType<TType> {
    integration: {size: number};
  }
}

expectType<TypeOf<typeof Chart.register, any>>(false);
expectType<TypeOf<typeof AutoChart.register, any>>(false);
expectType<TypeOf<typeof debounce, any>>(false);

const chart = new Chart('id', {
  type: 'line',
  data: {datasets: []},
  options: {plugins: {integration: {size: 1}}}
});
const size = chart.options.plugins?.integration?.size;
expectType<TypeEqual<NonNullable<typeof size>, number>>(true);

new Chart('id', {
  type: 'bar',
  data: {datasets: []},
  // @ts-expect-error the augmentation types `size` as a number
  options: {plugins: {integration: {size: 'x'}}}
});
