import { Chart, Element, IAnimationSpecContainer, InteractionMode, LayoutPosition, IPlugin } from '../core';
import { Color, IChartArea, IFontSpec, Scriptable, TextAlign, IEvent } from '../core/interfaces';
import { PointStyle } from '../elements';
import { IChartData } from '../interfaces';

export const Filler: IPlugin;

export interface IFillerOptions {
  propagate: boolean;
}

export type FillTarget = number | string | 'start' | 'end' | 'origin' | false;

export interface IFillTarget {
  /**
   * The accepted values are the same as the filling mode values, so you may use absolute and relative dataset indexes and/or boundaries.
   */
  target: FillTarget;
  /**
   * If no color is set, the default color will be the background color of the chart.
   */
  above: Color;
  /**
   * Same as the above.
   */
  below: Color;
}

export interface IFillerControllerDatasetOptions {
  /**
   * Both line and radar charts support a fill option on the dataset object which can be used to create area between two datasets or a dataset and a boundary, i.e. the scale origin, start or end
   */
  fill: FillTarget | IFillTarget;
}

export const Legend: IPlugin;

export interface ILegendItem {
  // Label that will be displayed
  text: string;

  // Fill style of the legend box
  fillStyle: CanvasLineCap;

  // If true, this item represents a hidden dataset. Label will be rendered with a strike-through effect
  hidden: boolean;

  // For box border. See https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap
  lineCap: CanvasLineCap;

  // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
  lineDash: number[];

  // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
  lineDashOffset: number;

  // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
  lineJoin: CanvasLineJoin;

  // Width of box border
  lineWidth: number;

  // Stroke style of the legend box
  strokeStyle: Color;

  // Point style of the legend box (only used if usePointStyle is true)
  pointStyle: PointStyle;

  // Rotation of the point in degrees (only used if usePointStyle is true)
  rotation: number;
}

export interface LegendElement extends Element {}

export interface ILegendOptions {
  /**
   * 	Is the legend shown?
   * @default true
   */
  display: boolean;
  /**
   * Position of the legend. more...
   * @default 'top'
   */
  position: LayoutPosition;
  /**
   * Alignment of the legend. more...
   * @default 'center'
   */
  align: TextAlign;
  /**
   * Marks that this box should take the full width of the canvas (pushing down other boxes). This is unlikely to need to be changed in day-to-day use.
   * @default true
   */
  fullWidth: boolean;
  /**
   * Legend will show datasets in reverse order.
   * @default false
   */
  reverse: boolean;
  /**
   * A callback that is called when a click event is registered on a label item.
   */
  onClick(this: LegendElement, e: IEvent, legendItem: ILegendItem, legend: LegendElement): void;
  /**
   *	A callback that is called when a 'mousemove' event is registered on top of a label item
   */
  onHover(this: LegendElement, e: IEvent, legendItem: ILegendItem, legend: LegendElement): void;
  /**
   *	A callback that is called when a 'mousemove' event is registered outside of a previously hovered label item.
   */
  onLeave(this: LegendElement, e: IEvent, legendItem: ILegendItem, legend: LegendElement): void;

  labels: {
    /**
     * Width of colored box.
     * @default 40
     */
    boxWidth: number;
    /**
     * Height of the coloured box.
     * @default fontSize
     */
    boxHeight: number;

    font: IFontSpec;
    /**
     * Padding between rows of colored boxes.
     * @default 10
     */
    padding: number;
    /**
     * Generates legend items for each thing in the legend. Default implementation returns the text + styling for the color box. See Legend Item for details.
     */
    generateLabels(chart: Chart): ILegendItem[];

    /**
     * Filters legend items out of the legend. Receives 2 parameters, a Legend Item and the chart data
     */
    filter(item: ILegendItem, data: IChartData): boolean;

    /**
     * Label style will match corresponding point style (size is based on the mimimum value between boxWidth and font.size).
     * @default false
     */
    usePointStyle: boolean;
  };

  title: {
    /**
     * Is the legend title displayed.
     * @default false
     */
    display: boolean;
    /**
     * see Fonts
     */
    font: IFontSpec;
    position: 'center' | 'start' | 'end';
    padding?: number | IChartArea;
    /**
     * The string title.
     */
    text: string;
  };
}

export const Title: IPlugin;

export interface ITitleOptions {
  /**
   * Alignment of the title.
   * @default 'center'
   */
  align: 'start' | 'center' | 'end';
  /**
   * Is the title shown?
   * @default false
   */
  display: boolean;
  /**
   * Position of title
   * @default 'top'
   */
  position: 'top' | 'left' | 'bottom' | 'right';
  font: IFontSpec;
  // fullWidth: boolean;
  /**
   * 	Adds padding above and below the title text if a single number is specified. It is also possible to change top and bottom padding separately.
   */
  padding: number | { top: number; bottom: number };
  /**
   * 	Title text to display. If specified as an array, text is rendered on multiple lines.
   */
  text: string | string[];
}

export interface TooltipModel {
  // The items that we are rendering in the tooltip. See Tooltip Item Interface section
  dataPoints: ITooltipItem[];

  // Positioning
  xAlign: 'start' | 'center' | 'end';
  yAlign: 'start' | 'center' | 'end';

  // X and Y properties are the top left of the tooltip
  x: number;
  y: number;
  width: number;
  height: number;
  // Where the tooltip points to
  caretX: number;
  caretY: number;

  // Body
  // The body lines that need to be rendered
  // Each object contains 3 parameters
  // before: string[] // lines of text before the line with the color square
  // lines: string[]; // lines of text to render as the main item with color square
  // after: string[]; // lines of text to render after the main lines
  body: { before: string[]; lines: string[]; after: string[] }[];
  // lines of text that appear after the title but before the body
  beforeBody: string[];
  // line of text that appear after the body and before the footer
  afterBody: string[];

  // Title
  // lines of text that form the title
  title: string[];

  // Footer
  // lines of text that form the footer
  footer: string[];

  // colors to render for each item in body[]. This is the color of the squares in the tooltip
  labelColors: Color[];
  labelTextColors: Color[];

  // 0 opacity is a hidden tooltip
  opacity: number;

  // tooltip options
  options: ITooltipOptions;
}

export const Tooltip: IPlugin & {
  readonly positioners: {
    [key: string]: (items: readonly Element[], eventPosition: { x: number; y: number }) => { x: number; y: number };
  };
};

export interface ITooltipCallbacks {
  beforeTitle(this: TooltipModel, tooltipItems: ITooltipItem[]): string | string[];
  title(this: TooltipModel, tooltipItems: ITooltipItem[]): string | string[];
  afterTitle(this: TooltipModel, tooltipItems: ITooltipItem[]): string | string[];

  beforeBody(this: TooltipModel, tooltipItems: ITooltipItem[]): string | string[];
  afterBody(this: TooltipModel, tooltipItems: ITooltipItem[]): string | string[];

  beforeLabel(this: TooltipModel, tooltipItem: ITooltipItem): string | string[];
  label(this: TooltipModel, tooltipItem: ITooltipItem): string | string[];
  afterLabel(this: TooltipModel, tooltipItem: ITooltipItem): string | string[];

  labelColor(this: TooltipModel, tooltipItem: ITooltipItem): { borderColor: Color; backgroundColor: Color };
  labelTextColor(this: TooltipModel, tooltipItem: ITooltipItem): Color;

  beforeFooter(this: TooltipModel, tooltipItems: ITooltipItem[]): string | string[];
  footer(this: TooltipModel, tooltipItems: ITooltipItem[]): string | string[];
  afterFooter(this: TooltipModel, tooltipItems: ITooltipItem[]): string | string[];
}

export interface ITooltipPlugin<O = {}> {
  /**
   * @desc Called before drawing the `tooltip`. If any plugin returns `false`,
   * the tooltip drawing is cancelled until another `render` is triggered.
   * @param {Chart} chart - The chart instance.
   * @param {object} args - The call arguments.
   * @param {Tooltip} args.tooltip - The tooltip.
   * @param {object} options - The plugin options.
   * @returns {boolean} `false` to cancel the chart tooltip drawing.
   */
  beforeTooltipDraw?(chart: Chart, args: { tooltip: TooltipModel }, options: O): boolean | void;
  /**
   * @desc Called after drawing the `tooltip`. Note that this hook will not
   * be called if the tooltip drawing has been previously cancelled.
   * @param {Chart} chart - The chart instance.
   * @param {object} args - The call arguments.
   * @param {Tooltip} args.tooltip - The tooltip.
   * @param {object} options - The plugin options.
   */
  afterTooltipDraw?(chart: Chart, args: { tooltip: TooltipModel }, options: O): void;
}

export interface ITooltipOptions {
  /**
   * Are on-canvas tooltips enabled?
   * @default true
   */
  enabled: boolean;
  /**
   * 	See custom tooltip section.
   */
  custom(this: TooltipModel, args: { chart: Chart; tooltip: TooltipModel }): void;
  /**
   * Sets which elements appear in the tooltip. more....
   */
  mode: InteractionMode;
  /**
   * The mode for positioning the tooltip
   */
  position: 'average' | 'nearest';
  /**
   * If true, the tooltip mode applies only when the mouse position intersects with an element. If false, the mode will be applied at all times.
   */
  intersect: boolean;

  /**
   * Sort tooltip items.
   */
  itemSort: (a: ITooltipItem, b: ITooltipItem) => number;

  filter: (e: ITooltipItem) => boolean;

  /**
   * Background color of the tooltip.
   * @default 'rgba(0, 0, 0, 0.8)'
   */
  backgroundColor: Color;
  /**
   * See Fonts
   * @default {style: 'bold', color: '#fff'}
   */
  titleFont: IFontSpec;
  /**
   * Spacing to add to top and bottom of each title line.
   * @default 2
   */
  titleSpacing: number;
  /**
   * Margin to add on bottom of title section.
   * @default 6
   */
  titleMarginBottom: number;
  /**
   * Horizontal alignment of the title text lines. more...
   * @default 'left'
   */
  titleAlign: TextAlign;
  /**
   * Spacing to add to top and bottom of each tooltip item.
   * @default 2
   */
  bodySpacing: number;
  /**
   * 	See Fonts.
   * @default {color: '#fff'}
   */
  bodyFont: IFontSpec;
  /**
   * Horizontal alignment of the body text lines. more...
   * @default 'left'
   */
  bodyAlign: TextAlign;
  /**
   * Spacing to add to top and bottom of each footer line.
   * @default 2
   */
  footerSpacing: number;
  /**
   * Margin to add before drawing the footer.
   * @default 6
   */
  footerMarginTop: number;
  /**
   * See Fonts
   * @default {style: 'bold', color: '#fff'}
   */
  footerFont: IFontSpec;
  /**
   * Horizontal alignment of the footer text lines. more...
   * @default 'left'
   */
  footerAlign: TextAlign;
  /**
   * Padding to add on left and right of tooltip.
   * @default 6
   */
  xPadding: number;
  /**
   * Padding to add on top and bottom of tooltip.
   * @default 6
   */
  yPadding: number;
  /**
   * 	Extra distance to move the end of the tooltip arrow away from the tooltip point.
   * @default 2
   */
  caretPadding: number;
  /**
   * Size, in px, of the tooltip arrow.
   * @default 5
   */
  caretSize: number;
  /**
   * Radius of tooltip corner curves.
   * @default 6
   */
  cornerRadius: number;
  /**
   * Color to draw behind the colored boxes when multiple items are in the tooltip.
   * @default '#fff'
   */
  multiKeyBackground: Color;
  /**
   * If true, color boxes are shown in the tooltip.
   * @default true
   */
  displayColors: boolean;
  /**
   * Width of the color box if displayColors is true.
   * @default bodyFont.size
   */
  boxWidth: number;
  /**
   * Height of the color box if displayColors is true.
   * @default bodyFont.size
   */
  boxHeight: number;
  /**
   * Color of the border.
   * @default 'rgba(0, 0, 0, 0)'
   */
  borderColor: Color;
  /**
   * Size of the border.
   * @default 0
   */
  borderWidth: number;
  /**
   * true for rendering the legends from right to left.
   */
  rtl: boolean;

  /**
   * This will force the text direction 'rtl' or 'ltr on the canvas for rendering the tooltips, regardless of the css specified on the canvas
   * @default canvas's default
   */
  textDirection: string;

  animation: Scriptable<IAnimationSpecContainer>;

  callbacks: ITooltipCallbacks;
}

export interface ITooltipChartOptions {
  tooltips: ITooltipOptions;
}

export interface ITooltipItem {
  /**
   * The chart the tooltip is being shown on
   */
  chart: Chart;

  /**
   * Label for the tooltip
   */
  label: string;

  /**
   * Parsed data values for the given `dataIndex` and `datasetIndex`
   */
  dataPoint: any;

  /**
   * Formatted value for the tooltip
   */
  formattedValue: string;

  /**
   * The dataset the item comes from
   */
  dataset: object;

  /**
   * Index of the dataset the item comes from
   */
  datasetIndex: number;

  /**
   * Index of this data item in the dataset
   */
  dataIndex: number;

  /**
   * The chart element (point, arc, bar, etc.) for this tooltip item
   */
  element: Element;
}
