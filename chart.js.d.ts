
declare module "chart.js" {
  export = Chart
}

declare namespace Chart {

  function Line(context: CanvasRenderingContext2D, args: {data: LineChartData, options?: LineChartOptions}): LineChartInstance;

  function Bar(context: CanvasRenderingContext2D, args: {data: BarChartData, options?: BarChartOptions}): BarChartInstance;

  function Radar(context: CanvasRenderingContext2D, args: {data: RadarChartData, options?: RadarChartOptions}): RadarChartInstance;

  function PolarArea(context: CanvasRenderingContext2D, args: {data: PolarAreaChartData, options?: PolarAreaChartOptions}): PolarAreaChartInstance;

  function Bubble(context: CanvasRenderingContext2D, args: {data: CircularChartData, options?: CircularChartOptions}): CircularChartInstance;

  function Doughnut(context: CanvasRenderingContext2D, args: {data: CircularChartData, options?: CircularChartOptions}): CircularChartInstance;

  const defaults: {
    global: ChartOptions
    line: LineChartOptions
    bar: BarChartOptions
    radar: RadarChartOptions
    polarArea: PolarAreaChartOptions
    doughnut: CircularChartOptions
    pie: CircularChartOptions
  };

  // Check required, what fields does the defaultConfig object contain?
  const scaleService: {
    registerScaleType<T extends Scale>(key: string, scale: T, defaultConfig: Object): void
  };

  interface ChartData {
    labels: Array<string>
    datasets?: Array<ChartDataSet>
  }

  interface ChartDataSet {
    data: Array<number>
  }

  interface ChartOptions {
    responsive?: boolean
    responsiveAnimationDuration?: number
    maintainAspectRatio?: boolean
    events?: Array<string>
    hover?: {
      onHover?: (activeElements: Array<Element>) => void // Check required, what fields does an element contain? element interface?
      mode?: string
      animationDuration?: number
    }
    onClick?: (activeElements: Array<Element>) => void // Check required
    defaultColor?: string
    defaultFontColor?: string
    defaultFontFamily?: string
    defaultFontSize?: number
    defaultFontStyle?: string
    legendCallback?: (chart: ChartInstance) => string // Check required
    title?: ChartTitleOptions
    legend?: ChartLegendOptions
    tooltips?: ChartTooltipsOptions
    animation?: ChartAnimationOptions
    elements?: ChartElementsOptions
  }

  interface ChartTitleOptions {
    display?: boolean
    position?: string
    fullWidth?: boolean
    fontColor?: string
    fontFamily?: string
    fontSize?: number
    fontStyle?: string
    padding?: number
    text?: string
  }

  interface ChartLegendOptions {
    display?: boolean
    position?: string
    fullWidth?: boolean
    onClick?: (event: Event, legendItem: LegendItem) => void // Check required, is Event the correct type here?
    labels?: {
      labelsboxWidth?: number
      labelsfontSize?: number
      labelsfontStyle?: string
      labelsfontColor?: string
      labelsfontFamily?: string
      labelspadding?: number
      labelsgenerateLabels?: (data: ChartData) => Array<LegendItem> // Check required
    }
  }

  // Check required, which fields are optional?
  interface LegendItem {
    text: string
    fillStyle: string
    hidden: boolean
    lineCap: string
    lineDash: Array<number>
    lineDashOffset: number
    lineJoin: string
    lineWidth: number | Array<number>
    strokeStyle: string | Array<string>
    datasetIndex: number
  }

  interface ChartTooltipsOptions {
    enabled?: boolean
    custom?: (tooltip: Tooltip) => void // Check required, see Tooltip interface
    mode?: string
    backgroundColor?: string
    titleFontFamily?: string
    titleFontSize?: number
    titleFontStyle?: string
    titleSpacing?: number
    titleColor?: string
    titleAlign?: string
    bodyFontFamily?: string
    bodyFontSize?: number
    bodyFontStyle?: string
    bodySpacing?: number
    bodyColor?: string
    bodyAlign?: string
    footerFontFamily?: string
    footerFontSize?: number
    footerFontStyle?: string
    footerSpacing?: number
    footerColor?: string
    footerAlign?: string
    titleMarginBottom?: number
    footerMarginTop?: number
    xPadding?: number
    yPadding?: number
    caretSize?: number
    cornerRadius?: number
    multiKeyBackground?: string
    callbacks?: {
      // @formatter:off
      // Checks required, correct args? title and label specify own args in docs, which are required?
      beforeTitle?:   (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      title?:         (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      afterTitle?:    (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      beforeBody?:    (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      beforeLabel?:   (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      label?:         (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      afterLabel?:    (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      afterBody?:     (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      beforeFooter?:  (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      footer?:        (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      afterFooter?:   (xLabel: string | Array<string>, yLabel: string | Array<string>, index: number, data: Object) => string | Array<string>
      // @formatter:on
    }
  }

  // What fields does a tooltip object passed to custom contain?
  interface Tooltip {

  }

  interface ChartAnimationOptions {
    duration?: number
    easing?: string
    onProgress?: (args: {chart: ChartInstance, animationDetails: AnimationDetails}) => void // Check required, what fields should animationDetails have?
    onComplete?: (args: {chart: ChartInstance, animationDetails: AnimationDetails}) => void // Check required
  }

  // Check required. Fields?
  interface AnimationDetails {

  }

  interface ChartElementsOptions {
    arc?: {
      backgroundColor?: string
      borderColor?: string
      borderWidth?: number
    }
    line?: {
      tension?: number
      backgroundColor?: string
      borderWidth?: number
      borderColor?: string
      borderCapStyle?: string
      borderDash?: Array<number>
      borderDashOffset?: number
      borderJoinStyle?: string
      fill?: boolean
    }
    fill?: {
      radius?: number
      pointStyle?: string
      backgroundColor?: string
      borderWidth?: number
      borderColor?: string
      hitRadius?: number
      hoverRadius?: number
      hoverBorderWidth?: number
    }
    rectangle?: {
      backgroundColor?: string
      borderWidth?: number
      borderColor?: string
      borderSkipped?: string
    }
  }

  interface Element {

  }

  class ChartInstance {
    destroy(): void;
    update(duration?: number, lazy?: boolean): void;
    render(duration?: number, lazy?: boolean): void;
    stop(): void;
    resize(): void;
    clear(): void;
    toBase64Image(): string;
    generateLegend(): string;
    getElementAtEvent(e: Event): Element; // Check required. What does element return type contain? is Event correct here?
    getElementsAtEvent(e: Event): Array<Element>; // Check required
    getDatasetAtEvent(e: Event): Array<Element>; // Check required
  }

  interface LineChartData extends ChartData {
    datasets?: Array<ChartDataSet & {
      label?: string
      fill?: boolean
      backgroundColor?: string
      borderColor?: string | Array<string>
      borderCapStyle?: string
      borderDash?: Array<number>
      borderDashOffset?: number
      borderJoinStyle?: string
      pointBorderColor?: string | Array<string>
      pointBackgroundColor?: string | Array<string>
      pointBorderWidth?: number | Array<number>
      pointHoverRadius?: number | Array<number>
      pointHoverBackgroundColor?: string | Array<string>
      pointHoverBorderColor?: string | Array<string>
      pointHoverBorderWidth?: number | Array<number>
      tension?: number
      yAxisID?: string
    }>
  }

  interface LineChartOptions extends ChartOptions {
    showLines?: boolean
    stacked?: boolean
    scales?: {
      xAxes?: Array<ScaleOptions & {
        id?: string
      }>
      yAxes?: Array<ScaleOptions & {
        id?: string
      }>
    }
  }

  class LineChartInstance extends ChartInstance {
    data: LineChartData;
    options: LineChartOptions;
  }

  interface BarChartData extends ChartData {
    datasets?: Array<ChartDataSet & {
      label?: string
      backgroundColor?: string | Array<string>
      borderColor?: string | Array<string>
      borderWidth?: number | Array<number>
      hoverBackgroundColor?: string | Array<string>
      hoverBorderColor?: string | Array<string>
      yAxisID?: string
    }>
  }

  interface BarChartOptions extends ChartOptions {
    stacked?: boolean
    scales?: Array<{
      xAxes?: Array<ScaleOptions & {
        position?: string
        id?: string
        categoryPercentage?: number
        barPercentage?: number
        gridLines?: Array<ScaleGridLinesOptions & {
          offsetGridLines?: boolean
        }>
      }>
      yAxes?: Array<ScaleOptions & {
        position?: string
        id?: string
      }>
    }>
  }

  class BarChartInstance extends ChartInstance {
    data: BarChartInstance;
    options: BarChartOptions;
  }

  interface RadarChartData extends ChartData {
    datasets?: Array<ChartDataSet & {
      label?: string
      backgroundColor?: string
      borderColor?: string
      pointBackgroundColor?: string
      pointBorderColor?: string
      pointHoverBackgroundColor?: string
      pointHoverBorderColor?: string
    }>
  }

  interface RadarChartOptions extends ChartOptions {
    scale?: Array<ScaleOptions>
  }

  class RadarChartInstance extends ChartInstance {
    data: RadarChartData;
    options: RadarChartOptions;
  }

  interface PolarAreaChartData extends ChartData {
    datasets?: Array<ChartDataSet & {
      label?: string
      backgroundColor?: Array<string>
    }>
  }

  interface PolarAreaChartOptions extends ChartOptions {
    scale?: Array<ScaleOptions & {
      lineArc?: boolean
    }>
    animation?: {
      animateRotate?: boolean
      animateScale?: boolean
    }
  }

  class PolarAreaChartInstance extends ChartInstance {
    data: PolarAreaChartData;
    options: PolarAreaChartOptions;
  }

  interface CircularChartData extends ChartData {
    datasets?: Array<ChartDataSet & {
      backgroundColor?: Array<string>
      hoverBackgroundColor?: Array<string>
    }>
  }

  interface CircularChartOptions extends ChartOptions {
    cutoutPercentage?: number
    scale?: Array<ScaleOptions & {
      lineArc: boolean
    }>
    animation?: {
      animateRotate?: boolean
      animateScale?: boolean
    }
  }

  class CircularChartInstance extends ChartInstance {
    data: CircularChartData;
    options: CircularChartOptions;
  }


  interface ScaleOptions {
    type?: string;
    display?: boolean;
    //  @formatter:off
    beforeUpdate?:                (scale: Scale) => void; // Check required
    beforeSetDimensions?:         (scale: Scale) => void; // Check required
    afterSetDimensions?:          (scale: Scale) => void; // Check required
    beforeDataLimits?:            (scale: Scale) => void; // Check required
    afterDataLimits?:             (scale: Scale) => void; // Check required
    beforeBuildTicks?:            (scale: Scale) => void; // Check required
    afterBuildTicks?:             (scale: Scale) => void; // Check required
    beforeTickToLabelConversion?: (scale: Scale) => void; // Check required
    afterTickToLabelConversion?:  (scale: Scale) => void; // Check required
    beforeCalculateTickRotation?: (scale: Scale) => void; // Check required
    afterCalculateTickRotation?:  (scale: Scale) => void; // Check required
    beforeFit?:                   (scale: Scale) => void; // Check required
    afterFit?:                    (scale: Scale) => void; // Check required
    afterUpdate?:                 (scale: Scale) => void; // Check required
    // @formatter:on
    gridLines?: Array<ScaleGridLinesOptions>;
    scaleLabel?: Array<ScaleLabelOptions>;
    ticks?: Array<ScaleTickOptions>;
  }

  interface ScaleGridLinesOptions {
    display?: boolean
    color?: string
    lineWidth?: number
    drawOnChartArea?: boolean
    drawTicks?: boolean
    zeroLineWidth?: number
    zeroLineColor?: string
    offsetGridLines?: boolean
  }

  interface ScaleLabelOptions {
    display?: boolean
    labelString?: string
    fontColor?: string
    fontFamily?: string
    fontSize?: number
    fontStyle?: string
  }

  interface ScaleTickOptions {
    beginAtZero?: boolean
    fontColor?: string
    fontFamily?: string
    fontSize?: number
    fontStyle?: string
    maxRotation?: number
    minRotation?: number
    maxTicksLimit?: number
    padding?: number
    mirror?: boolean
    reverse?: boolean
    display?: boolean
    suggestedMin?: number
    suggestedMax?: number
    min?: number
    max?: number
    autoSkip?: boolean
    callback?: (value: number) => string // Check required
  }

  interface LinearScaleOptions extends ScaleOptions {
    ticks?: Array<ScaleTickOptions & {
      stepSize?: number
    }>
  }

  // Check Required, do the properties (starting at left) belong in Scale class and top level?
  abstract class Scale {

    abstract determineDataLimits(): void;

    abstract buildTicks(): void

    abstract getLabelForIndex(index: number, dataSetIndex: number): number

    abstract getPixelForTick(index: number, includeOffset: boolean): number

    abstract getPixelForValue(value: number, index: number, datasetIndex: number, includeOffset: boolean): number

    convertTicksToLabels(): void

    calculateTickRotation(): void

    fit(): void

    draw(chartArea: ChartArea): void // Is ChartArea independent object or part of ChartInstance?

    isHorizontal(): boolean

    getRightValue(dataValue: Object): any // NaN is a possibility here (is a more constricting type possible?)

    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;

    margins: {
      left: number
      right: number
      top: number
      bottom: number
    };

    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
  }

  interface ChartArea {
    left: number
    right: number
    top: number
    bottom: number
  }

  // Check Required, element needs to be replaced with correct interface (fields?)
  abstract class DatasetController {

    abstract addElements(): void

    abstract addElementAndReset(index: number): void

    abstract draw(ease: number): void

    abstract removeHoverStyle(element: Element): void

    abstract setHoverStyle(element: Element): void

    abstract update(reset: boolean): void

    initialize(): void

    linkScales(): void

    buildOrUpdateElements(): void
  }

  namespace controllers {

    class line extends DatasetController {
      addElements(): void

      addElementAndReset(index: number): void

      draw(ease: number): void

      removeHoverStyle(element: Element): void

      setHoverStyle(element: Element): void

      update(reset: boolean): void
    }

    class bar extends DatasetController {
      addElements(): void

      addElementAndReset(index: number): void

      draw(ease: number): void

      removeHoverStyle(element: Element): void

      setHoverStyle(element: Element): void

      update(reset: boolean): void
    }

    class radar extends DatasetController {
      addElements(): void

      addElementAndReset(index: number): void

      draw(ease: number): void

      removeHoverStyle(element: Element): void

      setHoverStyle(element: Element): void

      update(reset: boolean): void
    }

    class doughnut extends DatasetController {
      addElements(): void

      addElementAndReset(index: number): void

      draw(ease: number): void

      removeHoverStyle(element: Element): void

      setHoverStyle(element: Element): void

      update(reset: boolean): void
    }

    class polarArea extends DatasetController {
      addElements(): void

      addElementAndReset(index: number): void

      draw(ease: number): void

      removeHoverStyle(element: Element): void

      setHoverStyle(element: Element): void

      update(reset: boolean): void
    }

    class bubble extends DatasetController {
      addElements(): void

      addElementAndReset(index: number): void

      draw(ease: number): void

      removeHoverStyle(element: Element): void

      setHoverStyle(element: Element): void

      update(reset: boolean): void
    }
  }

}


