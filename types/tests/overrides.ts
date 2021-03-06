import { Chart } from '../index.esm';

Chart.overrides.bar.scales.x.type = 'time';

Chart.overrides.bar.plugins.title.display = false;

Chart.overrides.line.datasets.bar.backgroundColor = 'red';

Chart.overrides.line.animation = false;
Chart.overrides.line.datasets.bar.animation = { duration: 100 };
