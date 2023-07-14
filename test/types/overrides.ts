import { Chart, TitleOptions } from '../../src/types.js';

Chart.overrides.bar.scales.x.type = 'time';

(Chart.overrides.bar.plugins.title as TitleOptions).display = false;

Chart.overrides.line.datasets.bar.backgroundColor = 'red';

Chart.overrides.line.animation = false;
Chart.overrides.line.datasets.bar.animation = { duration: 100 };
