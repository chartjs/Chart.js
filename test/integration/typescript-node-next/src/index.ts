/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import {Chart} from 'chart.js';
import AutoChart from 'chart.js/auto';
import {debounce} from 'chart.js/helpers';
import {TypeOf, expectType} from 'ts-expect';

expectType<TypeOf<typeof Chart.register, any>>(false);
expectType<TypeOf<typeof AutoChart.register, any>>(false);
expectType<TypeOf<typeof debounce, any>>(false);
