import {Chart, registerables} from '../../dist/chart.js';
import Log2Axis from './log2';
import './derived-bubble';
import analyzer from './analyzer';

Chart.register(...registerables);
Chart.register(Log2Axis);
Chart.register(analyzer);
