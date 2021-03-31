import {Chart, registerables} from '../../dist/chart.esm';
import Log2Axis from './log2';
import './derived-bubble';

Chart.register(...registerables);
Chart.register(Log2Axis);
