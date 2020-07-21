import { TimeUnit, IChartComponent } from "./interfaces";
import { IScaleOptions, Scale } from "./core";

export interface ICategoryScaleOptions extends IScaleOptions { }

export interface CategoryScale<O extends ICategoryScaleOptions = ICategoryScaleOptions> extends Scale<O> { }
export const CategoryScale: IChartComponent & {
  prototype: CategoryScale;
  new <O extends ICategoryScaleOptions = ICategoryScaleOptions>(): CategoryScale<O>;
};
export interface LinearScale extends Scale { }
export const LinearScale: IChartComponent & {
  prototype: LinearScale;
  new(): LinearScale;
};
export interface LogarithmicScale extends Scale { }
export const LogarithmicScale: IChartComponent & {
  prototype: LogarithmicScale;
  new(): LogarithmicScale;
};

export type IRadialLinearScaleOptions = IScaleOptions & {
  animate: boolean;

  angleLines: {
    display: boolean;
    color: string;
    lineWidth: number;
    borderDash: number[];
    borderDashOffset: number;
  }

  gridLines: {
    circular: boolean;
  }

  ticks: {
    showLabelBackdrop: boolean;
    backdropColor: string;
    backdropPaddingY: number;
    backdropPaddingX: number;
  }

  pointLabels: {
    display: boolean;
    font: {
      size: number;
    }

    callback: (label: string) => string;
  }

}

export interface RadialLinearScale<O extends IRadialLinearScaleOptions = IRadialLinearScaleOptions> extends Scale<O> {
  setCenterPoint(leftMovement: number, rightMovement: number, topMovement: number, bottomMovement: number): void;
  getIndexAngle(index: number): number;
  getDistanceFromCenterForValue(value: number): number;
  getValueForDistanceFromCenter(distance: number): number;
  getPointPosition(index: number, distanceFromCenter: number): { x: number, y: number, angle: number };
  getPointPositionForValue(index: number, value: number): { x: number, y: number, angle: number };
  getBasePosition(index: number): { x: number, y: number, angle: number };
}
export const RadialLinearScale: IChartComponent & {
  prototype: RadialLinearScale;
  new <O extends IRadialLinearScaleOptions = IRadialLinearScaleOptions>(): RadialLinearScale<O>;
};



export type ITimeScaleOptions = IScaleOptions & {
  /**
   * Scale boundary strategy (bypassed by min/max time options)
   * - `data`: make sure data are fully visible, ticks outside are removed
   * - `ticks`: make sure ticks are fully visible, data outside are truncated
   * @see https://github.com/chartjs/Chart.js/pull/4556
   * @since 2.7.0
   */
  bounds: 'ticks' | 'data';

  /**
   * options for creating a new adapter instance
   */
  adapters: {};
  time: {
    /**
     * false == a pattern string from or a custom callback that converts its argument to a timestamp
     */
    parser: false,
    /**
     * false == automatic or override with week, month, year, etc.
     */
    unit: false | TimeUnit,
    /**
     * none, or override with week, month, year, etc.
     */
    round: false | TimeUnit,
    /**
     * override week start day
     */
    isoWeekday: false | string;
    minUnit: | TimeUnit,
    displayFormats: {
      [key: string]: string;
    }
  };
  ticks: {
    /**
     * Ticks generation input values:
     * - 'auto': generates "optimal" ticks based on scale size and time options.
     * - 'data': generates ticks from data (including labels from data {t|x|y} objects).
     * - 'labels': generates ticks from user given `data.labels` values ONLY.
     * @see https://github.com/chartjs/Chart.js/pull/4507
     * @since 2.7.0
     */
    source: 'labels' | 'auto' | 'data';

    autoSkip: boolean;

    major: {
      enabled: boolean;
    }
  }
}

export interface TimeScale<O extends ITimeScaleOptions = ITimeScaleOptions> extends Scale<O> {
  getDataTimestamps(): number[];
  getLabelTimestamps(): string[];
  normalize(values: number[]): number[];
}

export const TimeScale: IChartComponent & {
  prototype: TimeScale;
  new <O extends ITimeScaleOptions = ITimeScaleOptions>(): TimeScale<O>;
};

export interface TimeSeriesScale<O extends ITimeScaleOptions = ITimeScaleOptions> extends TimeScale<O> { }
export const TimeSeriesScale: IChartComponent & {
  prototype: TimeSeriesScale;
  new <O extends ITimeScaleOptions = ITimeScaleOptions>(): TimeSeriesScale<O>;
};
