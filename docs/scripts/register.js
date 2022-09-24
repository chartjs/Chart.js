import {Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale} from '../../dist/chart.js';
import Log2Axis from './log2';
import './derived-bubble';
import analyzer from './analyzer';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);
Chart.register(Log2Axis);
Chart.register(analyzer);
