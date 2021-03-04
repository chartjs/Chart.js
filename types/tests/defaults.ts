import { Chart } from '../index.esm';

Chart.defaults.scales.time.time.minUnit = 'day';

Chart.defaults.plugins.title.display = false;

Chart.defaults.datasets.bar.backgroundColor = 'red';

Chart.defaults.animation = { duration: 500 };
