import {Chart, registerables} from '../../dist/chart.esm';
import Log2Axis from './log2';

Chart.register(...registerables);
Chart.register(Log2Axis);
