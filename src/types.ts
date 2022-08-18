/**
 * Temporary entry point of the types at the time of the transition.
 * After transition done need to remove it in favor of index.ts
 */

export * from '.';
/**
 * Explicitly re-exporting to resolve the ambiguity.
 */
export {
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  Animation,
  Animations,
  Chart,
  DatasetController,
  Interaction,
  Scale,
  Ticks,
  defaults,
  layouts,
  registry,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  BasePlatform,
  BasicPlatform,
  DomPlatform,
  Decimation,
  Filler,
  Legend,
  SubTitle,
  Title,
  Tooltip,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  registerables
} from '../types';
export * from '../types';
