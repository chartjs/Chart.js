/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import {Chart} from 'chart.js';
import AutoChart from 'chart.js/auto';
import {debounce} from 'chart.js/helpers';
import {TypeEqual, TypeOf, expectType} from 'ts-expect';
// Deep paths that consumers import; they resolve only under `moduleResolution: node`.
import type {DeepPartial} from 'chart.js/dist/types/utils';
import type {AnyObject} from 'chart.js/dist/types/basic';
import type {TRBL} from 'chart.js/dist/types/geometric';
import type {Tooltip} from 'chart.js/dist/plugins/plugin.tooltip';
import {isObject} from 'chart.js/dist/helpers/helpers.core';

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

const options: DeepPartial<TRBL> = {top: 1};
const object: AnyObject = {options};
const activeElements = (tooltip: Tooltip) => tooltip.getActiveElements();
console.log(isObject(object), activeElements);
