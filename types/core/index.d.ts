import { BasePlatform } from '../platform';
import {
	Color,
	CoreChartOptions,
	ChartArea,
	ChartComponent,
	FontSpec,
	Point,
	Scriptable,
	TimeUnit,
	ChartEvent,
} from './interfaces';
import {
	DeepPartial,
	DefaultDataPoint,
	ChartConfiguration,
	ChartData,
	ChartDataset,
	ChartOptions,
	ChartType,
	ChartTypeRegistry,
	DatasetChartOptions,
	ScaleChartOptions,
	ScaleOptions,
	ScaleType
} from '../interfaces';
import { ElementChartOptions } from '../elements';
import { PluginOptions, PluginChartOptions } from '../plugins';

export interface DateAdapterBase {
	/**
	 * Returns a map of time formats for the supported formatting units defined
	 * in Unit as well as 'datetime' representing a detailed date/time string.
	 * @returns {{string: string}}
	 */
	formats(): { [key: string]: string };
	/**
	 * Parses the given `value` and return the associated timestamp.
	 * @param {any} value - the value to parse (usually comes from the data)
	 * @param {string} [format] - the expected data format
	 */
	parse(value: any, format?: TimeUnit): number | null;
	/**
	 * Returns the formatted date in the specified `format` for a given `timestamp`.
	 * @param {number} timestamp - the timestamp to format
	 * @param {string} format - the date/time token
	 * @return {string}
	 */
	format(timestamp: number, format: TimeUnit): string;
	/**
	 * Adds the specified `amount` of `unit` to the given `timestamp`.
	 * @param {number} timestamp - the input timestamp
	 * @param {number} amount - the amount to add
	 * @param {Unit} unit - the unit as string
	 * @return {number}
	 */
	add(timestamp: number, amount: number, unit: TimeUnit): number;
	/**
	 * Returns the number of `unit` between the given timestamps.
	 * @param {number} a - the input timestamp (reference)
	 * @param {number} b - the timestamp to subtract
	 * @param {Unit} unit - the unit as string
	 * @return {number}
	 */
	diff(a: number, b: number, unit: TimeUnit): number;
	/**
	 * Returns start of `unit` for the given `timestamp`.
	 * @param {number} timestamp - the input timestamp
	 * @param {Unit|'isoWeek'} unit - the unit as string
	 * @param {number} [weekday] - the ISO day of the week with 1 being Monday
	 * and 7 being Sunday (only needed if param *unit* is `isoWeek`).
	 * @return {number}
	 */
	startOf(timestamp: number, unit: TimeUnit | 'isoWeek', weekday?: number): number;
	/**
	 * Returns end of `unit` for the given `timestamp`.
	 * @param {number} timestamp - the input timestamp
	 * @param {Unit|'isoWeek'} unit - the unit as string
	 * @return {number}
	 */
	endOf(timestamp: number, unit: TimeUnit | 'isoWeek'): number;
}

export interface DateAdapter extends DateAdapterBase {
	readonly options: any;
}

export const DateAdapter: {
	prototype: DateAdapter;
	new(options: any): DateAdapter;
	override(members: Partial<DateAdapter>): void;
};

export const _adapters: {
	_date: DateAdapter;
};

export class Animation {
	constructor(cfg: any, target: any, prop: string, to?: any);
	active(): boolean;
	update(cfg: any, to: any, date: number): void;
	cancel(): void;
	tick(date: number): void;
}

export interface AnimationEvent {
	chart: Chart;
	numSteps: number;
	currentState: number;
}

export class Animator {
	listen(chart: Chart, event: 'complete' | 'progress', cb: (event: AnimationEvent) => void): void;
	add(chart: Chart, items: readonly Animation[]): void;
	has(chart: Chart): boolean;
	start(chart: Chart): void;
	running(chart: Chart): boolean;
	stop(chart: Chart): void;
	remove(chart: Chart): boolean;
}

export class Animations {
	constructor(chart: Chart, animations: {});
	configure(animations: {}): void;
	update(target: any, values: any): undefined | boolean;
}

export interface ChartMeta<E extends Element = Element, DSE extends Element = Element> {
	type: string;
	controller: DatasetController;
	order: number;

	label: string;
	index: number;
	visible: boolean;

	stack: number;

	indexAxis: 'x' | 'y';

	data: E[];
	dataset?: DSE;

	hidden: boolean;

	xAxisID?: string;
	yAxisID?: string;
	rAxisID?: string;
	iAxisID: string;
	vAxisID: string;

	xScale?: Scale;
	yScale?: Scale;
	rScale?: Scale;
	iScale?: Scale;
	vScale?: Scale;

	_sorted: boolean;
	_stacked: boolean;
	_parsed: any[];
}

export interface ActiveDataPoint {
	datasetIndex: number;
	index: number;
}

export interface ActiveElement extends ActiveDataPoint {
	element: Element;
}

export declare class Chart<
	TYPE extends ChartType = ChartType,
	DATA extends unknown[] = DefaultDataPoint<TYPE>,
	LABEL = unknown
	> {
	readonly platform: BasePlatform;
	readonly id: string;
	readonly canvas: HTMLCanvasElement;
	readonly ctx: CanvasRenderingContext2D;
	readonly config: ChartConfiguration<TYPE, DATA, LABEL>
	readonly width: number;
	readonly height: number;
	readonly aspectRatio: number;
	readonly boxes: LayoutItem[];
	readonly currentDevicePixelRatio: number;
	readonly chartArea: ChartArea;
	readonly scales: { [key: string]: Scale };
	readonly scale: Scale | undefined;
	readonly attached: boolean;

	data: ChartData<TYPE, DATA, LABEL>;
	options: ChartOptions<TYPE>;

	constructor(item: ChartItem, config: ChartConfiguration<TYPE, DATA, LABEL>);

	clear(): this;
	stop(): this;

	resize(width: number, height: number): void;
	ensureScalesHaveIDs(): void;
	buildOrUpdateScales(): void;
	buildOrUpdateControllers(): void;
	reset(): void;
	update(mode?: UpdateMode): void;
	render(): void;
	draw(): void;

	getElementsAtEventForMode(e: Event, mode: string, options: InteractionOptions, useFinalPosition: boolean): InteractionItem[];

	getSortedVisibleDatasetMetas(): ChartMeta[];
	getDatasetMeta(datasetIndex: number): ChartMeta;
	getVisibleDatasetCount(): number;
	isDatasetVisible(datasetIndex: number): boolean;
	setDatasetVisibility(datasetIndex: number, visible: boolean): void;
	toggleDataVisibility(index: number): void;
	getDataVisibility(index: number): boolean;
	hide(datasetIndex: number): void;
	show(datasetIndex: number): void;

	getActiveElements(): ActiveElement[];
	setActiveElements(active: ActiveDataPoint[]): void;

	destroy(): void;
	toBase64Image(type?: string, quality?: any): string;
	bindEvents(): void;
	unbindEvents(): void;
	updateHoverStyle(items: Element, mode: 'dataset', enabled: boolean): void;

	static readonly version: string;
	static readonly instances: { [key: string]: Chart };
	static readonly registry: Registry;
	static getChart(key: string | CanvasRenderingContext2D | HTMLCanvasElement): Chart | undefined;
	static register(...items: ChartComponentLike[]): void;
	static unregister(...items: ChartComponentLike[]): void;
}

export declare type ChartItem =
	| string
	| CanvasRenderingContext2D
	| OffscreenCanvasRenderingContext2D
	| HTMLCanvasElement
	| OffscreenCanvas
	| { canvas: HTMLCanvasElement | OffscreenCanvas }
	| ArrayLike<CanvasRenderingContext2D | HTMLCanvasElement | OffscreenCanvas>;

export declare enum UpdateModeEnum {
	resize = 'resize',
	reset = 'reset',
	none = 'none',
	hide = 'hide',
	show = 'show',
	normal = 'normal',
	active = 'active'
}

export type UpdateMode = keyof typeof UpdateModeEnum;

export class DatasetController<E extends Element = Element, DSE extends Element = Element> {
	constructor(chart: Chart, datasetIndex: number);

	readonly chart: Chart;
	readonly index: number;
	readonly _cachedMeta: ChartMeta<E, DSE>;
	enableOptionSharing: boolean;

	linkScales(): void;
	getAllParsedValues(scale: Scale): number[];
	protected getLabelAndValue(index: number): { label: string; value: string };
	updateElements(elements: E[], start: number, count: number, mode: UpdateMode): void;
	update(mode: UpdateMode): void;
	updateIndex(datasetIndex: number): void;
	protected getMaxOverflow(): boolean | number;
	draw(): void;
	reset(): void;
	getDataset(): ChartDataset;
	getMeta(): ChartMeta<E, DSE>;
	getScaleForId(scaleID: string): Scale | undefined;
	configure(): void;
	initialize(): void;
	addElements(): void;
	buildOrUpdateElements(): void;

	getStyle(index: number, active: boolean): any;
	protected resolveDatasetElementOptions(active: boolean): any;
	protected resolveDataElementOptions(index: number, mode: UpdateMode): any;
	/**
	 * Utility for checking if the options are shared and should be animated separately.
	 * @protected
	 */
	protected getSharedOptions(options: any): undefined | any;
	/**
	 * Utility for determining if `options` should be included in the updated properties
	 * @protected
	 */
	protected includeOptions(mode: UpdateMode, sharedOptions: any): boolean;
	/**
	 * Utility for updating an element with new properties, using animations when appropriate.
	 * @protected
	 */

	protected updateElement(element: E | DSE, index: number | undefined, properties: any, mode: UpdateMode): void;
	/**
	 * Utility to animate the shared options, that are potentially affecting multiple elements.
	 * @protected
	 */

	protected updateSharedOptions(sharedOptions: any, mode: UpdateMode, newOptions: any): void;
	removeHoverStyle(element: E, datasetIndex: number, index: number): void;
	setHoverStyle(element: E, datasetIndex: number, index: number): void;

	parse(start: number, count: number): void;
	protected parsePrimitiveData(meta: ChartMeta<E, DSE>, data: any[], start: number, count: number): any[];
	protected parseArrayData(meta: ChartMeta<E, DSE>, data: any[], start: number, count: number): any[];
	protected parseObjectData(meta: ChartMeta<E, DSE>, data: any[], start: number, count: number): any[];
	protected getParsed(index: number): any;
	protected applyStack(scale: Scale, parsed: any[]): number;
	protected updateRangeFromParsed(
		range: { min: number; max: number },
		scale: Scale,
		parsed: any[],
		stack: boolean
	): void;
	protected getMinMax(scale: Scale, canStack?: boolean): { min: number; max: number };
}

export interface DatasetControllerChartComponent extends ChartComponent {
	defaults: {
		datasetElementType?: string | null | false;
		dataElementType?: string | null | false;
		dataElementOptions?: string[];
		datasetElementOptions?: string[] | { [key: string]: string };
	};
}

export interface Defaults extends CoreChartOptions, ElementChartOptions {
	controllers: {
		[key in ChartType]: DeepPartial<
			CoreChartOptions &
			PluginChartOptions &
			ElementChartOptions &
			DatasetChartOptions<key>[key] &
			ScaleChartOptions<key> &
			ChartTypeRegistry[key]['chartOptions']
			>;
	};

	scale: ScaleOptions;
	scales: {
		[key in ScaleType]: ScaleOptions<key>;
	};

	plugins: PluginOptions;

	set(scope: string, values: any): any;
	get(scope: string): any;

	/**
	 * Routes the named defaults to fallback to another scope/name.
	 * This routing is useful when those target values, like defaults.color, are changed runtime.
	 * If the values would be copied, the runtime change would not take effect. By routing, the
	 * fallback is evaluated at each access, so its always up to date.
	 *
	 * Example:
	 *
	 * 	defaults.route('elements.arc', 'backgroundColor', '', 'color')
	 *   - reads the backgroundColor from defaults.color when undefined locally
	 *
	 * @param scope Scope this route applies to.
	 * @param name Property name that should be routed to different namespace when not defined here.
	 * @param targetScope The namespace where those properties should be routed to.
	 * Empty string ('') is the root of defaults.
	 * @param targetName The target name in the target scope the property should be routed to.
	 */
	route(scope: string, name: string, targetScope: string, targetName: string): void;
}

export const defaults: Defaults & DeepPartial<PluginChartOptions>;

export interface Element<T = {}, O = {}> {
	readonly x: number;
	readonly y: number;
	readonly active: boolean;
	readonly options: O;

	tooltipPosition(useFinalPosition?: boolean): Point;
	hasValue(): boolean;
	getProps<P extends keyof T>(props: [P], final?: boolean): Pick<T, P>;
	getProps<P extends keyof T, P2 extends keyof T>(props: [P, P2], final?: boolean): Pick<T, P | P2>;
	getProps<P extends keyof T, P2 extends keyof T, P3 extends keyof T>(
		props: [P, P2, P3],
		final?: boolean
	): Pick<T, P | P2 | P3>;
	getProps<P extends keyof T, P2 extends keyof T, P3 extends keyof T, P4 extends keyof T>(
		props: [P, P2, P3, P4],
		final?: boolean
	): Pick<T, P | P2 | P3 | P4>;
	getProps<P extends keyof T, P2 extends keyof T, P3 extends keyof T, P4 extends keyof T, P5 extends keyof T>(
		props: [P, P2, P3, P4, P5],
		final?: boolean
	): Pick<T, P | P2 | P3 | P4 | P5>;
	getProps(props: (keyof T)[], final?: boolean): T;
}
export const Element: {
	prototype: Element;
	new <T = {}, O = {}>(): Element<T, O>;
};

export interface InteractionOptions {
	axis?: string;
	intersect?: boolean;
}

export interface InteractionItem {
	element: Element;
	datasetIndex: number;
	index: number;
}

export type InteractionModeFunction = (
	chart: Chart,
	e: ChartEvent,
	options: InteractionOptions,
	useFinalPosition?: boolean
) => InteractionItem[];

export interface InteractionModeMap {
	/**
	 * Returns items at the same index. If the options.intersect parameter is true, we only return items if we intersect something
	 * If the options.intersect mode is false, we find the nearest item and return the items at the same index as that item
	 */
	index: InteractionModeFunction;

	/**
	 * Returns items in the same dataset. If the options.intersect parameter is true, we only return items if we intersect something
	 * If the options.intersect is false, we find the nearest item and return the items in that dataset
	 */
	dataset: InteractionModeFunction;
	/**
	 * Point mode returns all elements that hit test based on the event position
	 * of the event
	 */
	point: InteractionModeFunction;
	/**
	 * nearest mode returns the element closest to the point
	 */
	nearest: InteractionModeFunction;
	/**
	 * x mode returns the elements that hit-test at the current x coordinate
	 */
	x: InteractionModeFunction;
	/**
	 * y mode returns the elements that hit-test at the current y coordinate
	 */
	y: InteractionModeFunction;
}

export type InteractionMode = keyof InteractionModeMap;

export const Interaction: {
	modes: InteractionModeMap;
};

export type LayoutPosition = 'left' | 'top' | 'right' | 'bottom' | 'chartArea';

export interface LayoutItem {
	/**
	 * The position of the item in the chart layout. Possible values are
	 */
	position: LayoutPosition;
	/**
	 * The weight used to sort the item. Higher weights are further away from the chart area
	 */
	weight: number;
	/**
	 * if true, and the item is horizontal, then push vertical boxes down
	 */
	fullWidth: boolean;
	/**
	 * returns true if the layout item is horizontal (ie. top or bottom)
	 */
	isHorizontal(): boolean;
	/**
	 * Takes two parameters: width and height. Returns size of item
	 * @param width
	 * @param height
	 */
	update(width: number, height: number): number;

	/**
	 * Draws the element
	 */
	draw(): void;

	/**
	 * Returns an object with padding on the edges
	 */
	getPadding?(): ChartArea;

	/**
	 *  Width of item. Must be valid after update()
	 */
	width: number;
	/**
	 * Height of item. Must be valid after update()
	 */
	height: number;
	/**
	 * Left edge of the item. Set by layout system and cannot be used in update
	 */
	left: number;
	/**
	 * Top edge of the item. Set by layout system and cannot be used in update
	 */
	top: number;
	/**
	 * Right edge of the item. Set by layout system and cannot be used in update
	 */
	right: number;
	/**
	 *  Bottom edge of the item. Set by layout system and cannot be used in update
	 */
	bottom: number;
}

export const layouts: {
	/**
	 * Register a box to a chart.
	 * A box is simply a reference to an object that requires layout. eg. Scales, Legend, Title.
	 * @param {Chart} chart - the chart to use
	 * @param {LayoutItem} item - the item to add to be laid out
	 */
	addBox(chart: Chart, item: LayoutItem): void;

	/**
	 * Remove a layoutItem from a chart
	 * @param {Chart} chart - the chart to remove the box from
	 * @param {LayoutItem} layoutItem - the item to remove from the layout
	 */
	removeBox(chart: Chart, layoutItem: LayoutItem): void;

	/**
	 * Sets (or updates) options on the given `item`.
	 * @param {Chart} chart - the chart in which the item lives (or will be added to)
	 * @param {LayoutItem} item - the item to configure with the given options
	 * @param options - the new item options.
	 */
	configure(
		chart: Chart,
		item: LayoutItem,
		options: { fullWidth?: number; position?: LayoutPosition; weight?: number }
	): void;

	/**
	 * Fits boxes of the given chart into the given size by having each box measure itself
	 * then running a fitting algorithm
	 * @param {Chart} chart - the chart
	 * @param {number} width - the width to fit into
	 * @param {number} height - the height to fit into
	 */
	update(chart: Chart, width: number, height: number): void;
};

export interface PluginService {
	/**
	 * Calls enabled plugins for `chart` on the specified hook and with the given args.
	 * This method immediately returns as soon as a plugin explicitly returns false. The
	 * returned value can be used, for instance, to interrupt the current action.
	 * @param {Chart} chart - The chart instance for which plugins should be called.
	 * @param {string} hook - The name of the plugin method to call (e.g. 'beforeUpdate').
	 * @param {Array} [args] - Extra arguments to apply to the hook call.
	 * @returns {boolean} false if any of the plugins return false, else returns true.
	 */
	notify(chart: Chart, hook: string, args: any[]): boolean;
	invalidate(): void;
}

export interface Plugin<O = {}> {
	id: string;

	/**
	 * @desc Called before initializing `chart`.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	beforeInit?(chart: Chart, options: O): void;
	/**
	 * @desc Called after `chart` has been initialized and before the first update.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterInit?(chart: Chart, options: O): void;
	/**
	 * @desc Called before updating `chart`. If any plugin returns `false`, the update
	 * is cancelled (and thus subsequent render(s)) until another `update` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart update.
	 */
	beforeUpdate?(chart: Chart, args: { mode: UpdateMode }, options: O): boolean | void;
	/**
	 * @desc Called after `chart` has been updated and before rendering. Note that this
	 * hook will not be called if the chart update has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterUpdate?(chart: Chart, args: { mode: UpdateMode }, options: O): void;
	/**
	 * @desc Called during chart reset
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @since version 3.0.0
	 */
	reset?(chart: Chart, options: O): void;
	/**
	 * @desc Called before updating the `chart` datasets. If any plugin returns `false`,
	 * the datasets update is cancelled until another `update` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} args - The call arguments.
	 * @param {UpdateMode} args.mode - The update mode.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} false to cancel the datasets update.
	 * @since version 2.1.5
	 */
	beforeDatasetsUpdate?(chart: Chart, args: { mode: UpdateMode }, options: O): boolean | void;
	/**
	 * @desc Called after the `chart` datasets have been updated. Note that this hook
	 * will not be called if the datasets update has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} args - The call arguments.
	 * @param {UpdateMode} args.mode - The update mode.
	 * @param {object} options - The plugin options.
	 * @since version 2.1.5
	 */
	afterDatasetsUpdate?(chart: Chart, args: { mode: UpdateMode }, options: O): void;
	/**
	 * @desc Called before updating the `chart` dataset at the given `args.index`. If any plugin
	 * returns `false`, the datasets update is cancelled until another `update` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} args - The call arguments.
	 * @param {number} args.index - The dataset index.
	 * @param {object} args.meta - The dataset metadata.
	 * @param {UpdateMode} args.mode - The update mode.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart datasets drawing.
	 */
	beforeDatasetUpdate?(chart: Chart, args: { index: number; meta: ChartMeta, mode: UpdateMode }, options: O): boolean | void;
	/**
	 * @desc Called after the `chart` datasets at the given `args.index` has been updated. Note
	 * that this hook will not be called if the datasets update has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} args - The call arguments.
	 * @param {number} args.index - The dataset index.
	 * @param {object} args.meta - The dataset metadata.
	 * @param {UpdateMode} args.mode - The update mode.
	 * @param {object} options - The plugin options.
	 */
	afterDatasetUpdate?(chart: Chart, args: { index: number; meta: ChartMeta, mode: UpdateMode }, options: O): void;
	/**
	 * @desc Called before laying out `chart`. If any plugin returns `false`,
	 * the layout update is cancelled until another `update` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart layout.
	 */
	beforeLayout?(chart: Chart, options: O): boolean | void;
	/**
	 * @desc Called after the `chart` has been laid out. Note that this hook will not
	 * be called if the layout update has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterLayout?(chart: Chart, options: O): void;
	/**
	 * @desc Called before rendering `chart`. If any plugin returns `false`,
	 * the rendering is cancelled until another `render` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart rendering.
	 */
	beforeRender?(chart: Chart, options: O): boolean | void;
	/**
	 * @desc Called after the `chart` has been fully rendered (and animation completed). Note
	 * that this hook will not be called if the rendering has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterRender?(chart: Chart, options: O): void;
	/**
	 * @desc Called before drawing `chart` at every animation frame. If any plugin returns `false`,
	 * the frame drawing is cancelled untilanother `render` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart drawing.
	 */
	beforeDraw?(chart: Chart, options: O): boolean | void;
	/**
	 * @desc Called after the `chart` has been drawn. Note that this hook will not be called
	 * if the drawing has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterDraw?(chart: Chart, options: O): void;
	/**
	 * @desc Called before drawing the `chart` datasets. If any plugin returns `false`,
	 * the datasets drawing is cancelled until another `render` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart datasets drawing.
	 */
	beforeDatasetsDraw?(chart: Chart, options: O): boolean | void;
	/**
	 * @desc Called after the `chart` datasets have been drawn. Note that this hook
	 * will not be called if the datasets drawing has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterDatasetsDraw?(chart: Chart, options: O): void;
	/**
	 * @desc Called before drawing the `chart` dataset at the given `args.index` (datasets
	 * are drawn in the reverse order). If any plugin returns `false`, the datasets drawing
	 * is cancelled until another `render` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} args - The call arguments.
	 * @param {number} args.index - The dataset index.
	 * @param {object} args.meta - The dataset metadata.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart datasets drawing.
	 */
	beforeDatasetDraw?(chart: Chart, args: { index: number; meta: ChartMeta }, options: O): boolean | void;
	/**
	 * @desc Called after the `chart` datasets at the given `args.index` have been drawn
	 * (datasets are drawn in the reverse order). Note that this hook will not be called
	 * if the datasets drawing has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} args - The call arguments.
	 * @param {number} args.index - The dataset index.
	 * @param {object} args.meta - The dataset metadata.
	 * @param {object} options - The plugin options.
	 */
	afterDatasetDraw?(chart: Chart, args: { index: number; meta: ChartMeta }, options: O): void;
	/**
	 * @desc Called before processing the specified `event`. If any plugin returns `false`,
	 * the event will be discarded.
	 * @param {Chart} chart - The chart instance.
	 * @param {ChartEvent} event - The event object.
	 * @param {object} options - The plugin options.
	 * @param {boolean} replay - True if this event is replayed from `Chart.update`
	 */
	beforeEvent?(chart: Chart, event: ChartEvent, options: O, replay: boolean): void;
	/**
	 * @desc Called after the `event` has been consumed. Note that this hook
	 * will not be called if the `event` has been previously discarded.
	 * @param {Chart} chart - The chart instance.
	 * @param {ChartEvent} event - The event object.
	 * @param {object} options - The plugin options.
	 * @param {boolean} replay - True if this event is replayed from `Chart.update`
	 */
	afterEvent?(chart: Chart, event: ChartEvent, options: O, replay: boolean): void;
	/**
	 * @desc Called after the chart as been resized.
	 * @param {Chart} chart - The chart instance.
	 * @param {number} size - The new canvas display size (eq. canvas.style width & height).
	 * @param {object} options - The plugin options.
	 */
	resize?(chart: Chart, size: number, options: O): void;
	/**
	 * Called after the chart as been destroyed.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	destroy?(chart: Chart, options: O): void;
}

export declare type ChartComponentLike = ChartComponent | ChartComponent[] | { [key: string]: ChartComponent };

/**
 * Please use the module's default export which provides a singleton instance
 * Note: class is exported for typedoc
 */
export interface Registry {
	readonly controllers: TypedRegistry<DatasetController>;
	readonly elements: TypedRegistry<Element>;
	readonly plugins: TypedRegistry<Plugin>;
	readonly scales: TypedRegistry<Scale>;

	add(...args: ChartComponentLike[]): void;
	remove(...args: ChartComponentLike[]): void;

	addControllers(...args: ChartComponentLike[]): void;
	addElements(...args: ChartComponentLike[]): void;
	addPlugins(...args: ChartComponentLike[]): void;
	addScales(...args: ChartComponentLike[]): void;

	getController(id: string): DatasetController | undefined;
	getElement(id: string): Element | undefined;
	getPlugin(id: string): Plugin | undefined;
	getScale(id: string): Scale | undefined;
}

export const registry: Registry;

export interface Tick {
	value: number;
	label?: string;
	major?: boolean;
}

export interface CoreScaleOptions {
	/**
	 * Controls the axis global visibility (visible when true, hidden when false). When display: 'auto', the axis is visible only if at least one associated dataset is visible.
	 * @default true
	 */
	display: boolean | 'auto';
	/**
	 * Reverse the scale.
	 * @default false
	 */
	reverse: boolean;
	/**
	 * The weight used to sort the axis. Higher weights are further away from the chart area.
	 * @default true
	 */
	weight: number;
	/**
	 * Callback called before the update process starts.
	 */
	beforeUpdate(axis: Scale): void;
	/**
	 * Callback that runs before dimensions are set.
	 */
	beforeSetDimensions(axis: Scale): void;
	/**
	 * Callback that runs after dimensions are set.
	 */
	afterSetDimensions(axis: Scale): void;
	/**
	 * Callback that runs before data limits are determined.
	 */
	beforeDataLimits(axis: Scale): void;
	/**
	 * Callback that runs after data limits are determined.
	 */
	afterDataLimits(axis: Scale): void;
	/**
	 * Callback that runs before ticks are created.
	 */
	beforeBuildTicks(axis: Scale): void;
	/**
	 * Callback that runs after ticks are created. Useful for filtering ticks.
	 */
	afterBuildTicks(axis: Scale): void;
	/**
	 * Callback that runs before ticks are converted into strings.
	 */
	beforeTickToLabelConversion(axis: Scale): void;
	/**
	 * Callback that runs after ticks are converted into strings.
	 */
	afterTickToLabelConversion(axis: Scale): void;
	/**
	 * Callback that runs before tick rotation is determined.
	 */
	beforeCalculateTickRotation(axis: Scale): void;
	/**
	 * Callback that runs after tick rotation is determined.
	 */
	afterCalculateTickRotation(axis: Scale): void;
	/**
	 * Callback that runs before the scale fits to the canvas.
	 */
	beforeFit(axis: Scale): void;
	/**
	 * Callback that runs after the scale fits to the canvas.
	 */
	afterFit(axis: Scale): void;
	/**
	 * Callback that runs at the end of the update process.
	 */
	afterUpdate(axis: Scale): void;
}

export interface Scale<O extends CoreScaleOptions = CoreScaleOptions> extends Element<{}, O>, ChartArea {
	readonly id: string;
	readonly type: string;
	readonly ctx: CanvasRenderingContext2D;
	readonly chart: Chart;

	width: number;
	height: number;

	maxWidth: number;
	maxHeight: number;

	paddingTop: number;
	paddingBottom: number;
	paddingLeft: number;
	paddingRight: number;

	axis: string;
	labelRotation: number;
	min: number;
	max: number;
	ticks: Tick[];
	getMatchingVisibleMetas(type?: string): ChartMeta[];

	draw(chartArea: ChartArea): void;
	drawTitle(chartArea: ChartArea): void;
	drawLabels(chartArea: ChartArea): void;
	drawGrid(chartArea: ChartArea): void;

	/**
	 * @param {number} pixel
	 * @return {number}
	 */
	getDecimalForPixel(pixel: number): number;
	/**
	 * Utility for getting the pixel location of a percentage of scale
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param {number} decimal
	 * @return {number}
	 */
	getPixelForDecimal(decimal: number): number;
	/**
	 * Returns the location of the tick at the given index
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param {number} index
	 * @return {number}
	 */
	getPixelForTick(index: number): number;
	/**
	 * Used to get the label to display in the tooltip for the given value
	 * @param {*} value
	 * @return {string}
	 */
	getLabelForValue(value: number): string;
	/**
	 * Returns the location of the given data point. Value can either be an index or a numerical value
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param {*} value
	 * @param {number} [index]
	 * @return {number}
	 */
	getPixelForValue(value: number, index: number): number;

	/**
	 * Used to get the data value from a given pixel. This is the inverse of getPixelForValue
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param {number} pixel
	 * @return {*}
	 */
	getValueForPixel(pixel: number): number | undefined;

	getBaseValue(): number;
	/**
	 * Returns the pixel for the minimum chart value
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @return {number}
	 */
	getBasePixel(): number;

	init(options: O): void;
	parse(raw: any, index: number): any;
	getUserBounds(): { min: number; max: number; minDefined: boolean; maxDefined: boolean };
	getMinMax(canStack: boolean): { min: number; max: number };
	invalidateCaches(): void;
	getPadding(): ChartArea;
	getTicks(): Tick[];
	getLabels(): string[];
	beforeUpdate(): void;
	update(maxWidth: number, maxHeight: number, margins: any): void;
	configure(): void;
	afterUpdate(): void;
	beforeSetDimensions(): void;
	setDimensions(): void;
	afterSetDimensions(): void;
	beforeDataLimits(): void;
	determineDataLimits(): void;
	afterDataLimits(): void;
	beforeBuildTicks(): void;
	buildTicks(): Tick[];
	afterBuildTicks(): void;
	beforeTickToLabelConversion(): void;
	generateTickLabels(ticks: Tick[]): void;
	afterTickToLabelConversion(): void;
	beforeCalculateLabelRotation(): void;
	calculateLabelRotation(): void;
	afterCalculateLabelRotation(): void;
	beforeFit(): void;
	fit(): void;
	afterFit(): void;

	isHorizontal(): boolean;
	isFullWidth(): boolean;
}
export const Scale: {
	prototype: Scale;
	new <O extends CoreScaleOptions = CoreScaleOptions>(cfg: any): Scale<O>;
};

export interface ScriptAbleScaleContext {
	chart: Chart;
	scale: Scale;
	index: number;
	tick: Tick;
}

export type ScriptAbleScale<T> = T | ((ctx: ScriptAbleScaleContext) => T);

export const Ticks: {
	formatters: {
		/**
		 * Formatter for value labels
		 * @param value the value to display
		 * @return {string|string[]} the label to display
		 */
		values(value: any): string | string[];
		/**
		 * Formatter for numeric ticks
		 * @param tickValue the value to be formatted
		 * @param index the position of the tickValue parameter in the ticks array
		 * @param ticks the list of ticks being converted
		 * @return string representation of the tickValue parameter
		 */
		numeric(tickValue: number, index: number, ticks: { value: number }[]): string;
		/**
		 * Formatter for logarithmic ticks
		 * @param tickValue the value to be formatted
		 * @param index the position of the tickValue parameter in the ticks array
		 * @param ticks the list of ticks being converted
		 * @return string representation of the tickValue parameter
		 */
		logarithmic(tickValue: number, index: number, ticks: { value: number }[]): string;
	};
};

export interface TypedRegistry<T> {
	/**
	 * @param {ChartComponent} item
	 * @returns {string} The scope where items defaults were registered to.
	 */
	register(item: ChartComponent): string;
	get(id: string): T | undefined;
	unregister(item: ChartComponent): void;
}
