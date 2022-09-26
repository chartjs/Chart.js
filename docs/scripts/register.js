import {Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler} from '../../dist/chart.js';
import Log2Axis from './log2';
import './derived-bubble';
import analyzer from './analyzer';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler);
Chart.register(Log2Axis);
Chart.register(analyzer);
