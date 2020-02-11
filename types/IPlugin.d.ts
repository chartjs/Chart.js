export type Chart = import("../src/core/core.controller").default;
export type IEvent = import("../src/platform/platform.base").IEvent;
export type Tooltip = import("../src/plugins/plugin.tooltip").Tooltip;

/**
 * Plugin extension hooks.
 * @since 2.1.0
 */
export default interface IPlugin {
	/**
	 * Called before initializing `chart`.
 	 * @param {Chart} chart - The chart instance.
 	 * @param {object} options - The plugin options.
	 */
	beforeInit?(chart: Chart, options: object): void;

	/**
	 * Called after `chart` has been initialized and before the first update.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterInit?(chart: Chart, options?: any): void;

	/**
	 * Called before updating `chart`. If any plugin returns `false`, the update
	 * is cancelled (and thus subsequent render(s)) until another `update` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart update.
	 */
	beforeUpdate?(chart: Chart, options?: any): boolean;

	/**
	 * Called after `chart` has been updated and before rendering. Note that this
	 * hook will not be called if the chart update has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterUpdate?(chart: Chart, options?: any): void;

	/**
	 * Called during chart reset
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @since version 3.0.0
	 */
	reset?(chart: Chart, options?: any): void;

	/**
	 * Called before updating the `chart` datasets. If any plugin returns `false`,
	 * the datasets update is cancelled until another `update` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} false to cancel the datasets update.
	 * @since version 2.1.5
	 */
	beforeDatasetsUpdate?(chart: Chart, options?: any): boolean;

	/**
	 * Called after the `chart` datasets have been updated. Note that this hook
	 * will not be called if the datasets update has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @since version 2.1.5
 	 */
	afterDatasetsUpdate?(chart: Chart, options?: any): void;

	/**
	 * Called before updating the `chart` dataset at the given `ctx.index`. If any plugin
	 * returns `false`, the datasets update is cancelled until another `update` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} ctx - The call arguments.
	 * @param {number} ctx.index - The dataset index.
	 * @param {object} ctx.meta - The dataset metadata.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart datasets drawing.
	 */
	beforeDatasetUpdate?(chart: Chart, ctx: {index: number, meta: any}, options?: any): boolean;

	/**
	 * Called after the `chart` datasets at the given `ctx.index` has been updated. Note
	 * that this hook will not be called if the datasets update has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} ctx - The call arguments.
	 * @param {number} ctx.index - The dataset index.
	 * @param {object} ctx.meta - The dataset metadata.
	 * @param {object} options - The plugin options.
	 */
	afterDatasetUpdate?(chart: Chart, ctx: {index: number, meta: any}, options?: any): void;

	/**
	 * Called before laying out `chart`. If any plugin returns `false`,
	 * the layout update is cancelled until another `update` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart layout.
	 */
	beforeLayout?(chart: Chart, options?: any): boolean;

	/**
	 * Called after the `chart` has been layed out. Note that this hook will not
	 * be called if the layout update has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterLayout?(chart: Chart, options?: any): boolean;

	/**
	 * Called before rendering `chart`. If any plugin returns `false`,
	 * the rendering is cancelled until another `render` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart rendering.
	 */
	beforeRender?(chart: Chart, options?: any): boolean;

	/**
	 * Called after the `chart` has been fully rendered (and animation completed). Note
	 * that this hook will not be called if the rendering has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterRender?(chart: Chart, options?: any): void;

	/**
	 * Called before drawing `chart` at every animation frame. If any plugin returns `false`,
	 * the frame drawing is cancelled untilanother `render` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart drawing.
	 */
	beforeDraw?(chart: Chart, options?: any): boolean;

	/**
	 * Called after the `chart` has been drawn. Note that this hook will not be called
	 * if the drawing has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	afterDraw?(chart: Chart, options?: any): void;

	/**
	 * Called before drawing the `chart` datasets. If any plugin returns `false`,
	 * the datasets drawing is cancelled until another `render` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart datasets drawing.
	 */
	beforeDatasetsDraw?(chart: Chart, options?: any): boolean;

	/**
	* Called after the `chart` datasets have been drawn. Note that this hook
	* will not be called if the datasets drawing has been previously cancelled.
	* @param {Chart} chart - The chart instance.
	*/
	afterDatasetsDraw?(chart: Chart, options?: any): void;

	/**
	 * Called before drawing the `chart` dataset at the given `ctx.index` (datasets
	 * are drawn in the reverse order). If any plugin returns `false`, the datasets drawing
	 * is cancelled until another `render` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} ctx - The call arguments.
	 * @param {number} ctx.index - The dataset index.
	 * @param {object} ctx.meta - The dataset metadata.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart datasets drawing.
	 */
	beforeDatasetDraw?(chart: Chart, ctx: { index: number, meta: any }, options?: any): boolean;


	/**
	 * @desc Called after the `chart` datasets at the given `args.index` have been drawn
	 * (datasets are drawn in the reverse order). Note that this hook will not be called
	 * if the datasets drawing has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} ctx - The call arguments.
	 * @param {number} ctx.index - The dataset index.
	 * @param {object} ctx.meta - The dataset metadata.
	 * @param {object} options - The plugin options.
	 *
	 */
	afterDatasetDraw?(chart: Chart, ctx: {index: number, meta: any}, options?: any): void;

	/**
	 * Called before drawing the `tooltip`. If any plugin returns `false`,
	 * the tooltip drawing is cancelled until another `render` is triggered.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} ctx - The call arguments.
	 * @param {Tooltip} ctx.tooltip - The tooltip.
	 * @param {object} options - The plugin options.
	 * @returns {boolean} `false` to cancel the chart tooltip drawing.
	 */
	beforeTooltipDraw?(chart: Chart, ctx: {tooltip: Tooltip}, options?: any): boolean;

	/**
	 * Called after drawing the `tooltip`. Note that this hook will not
	 * be called if the tooltip drawing has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} ctx - The call arguments.
	 * @param {Tooltip} ctx.tooltip - The tooltip.
	 * @param {object} options - The plugin options.
	 */
	afterTooltipDraw?(chart: Chart, ctx: {tooltip: Tooltip}, options?: any): void;

	/**
	 * Called before processing the specified `event`. If any plugin returns `false`,
 	 * the event will be discarded.
	 * @param {Chart} chart - The chart instance.
	 * @param {IEvent} event - The event object.
	 * @param {object} options - The plugin options.
 	 * @param {boolean} replay - True if this event is replayed from `Chart.update`
	 */
	beforeEvent?(chart: Chart, event: IEvent, options?: any, replay?: boolean): void;

	/**
	 * Called after the `event` has been consumed. Note that this hook
	 * will not be called if the `event` has been previously discarded.
	 * @param {Chart} chart - The chart instance.
	 * @param {IEvent} event - The event object.
	 * @param {object} options - The plugin options.
	 * @param {boolean} replay - True if this event is replayed from `Chart.update`
	 */
	afterEvent?(chart: Chart, event: IEvent, options?: any): void;

	/**
 	 * Called after the chart as been resized.
	 * @param {Chart} chart - The chart instance.
	 * @param {{width: number, height: number}} size - The new canvas display size (eq. canvas.style width & height).
	 * @param {object} options - The plugin options.
	 */
	resize?(chart: Chart, size: {width: number, height: number}, options?: any): void;

	/**
	 * @method IPlugin#destroy
	 * Called after the chart as been destroyed.
	 * @param {Chart} chart - The chart instance.
	 * @param {object} options - The plugin options.
	 */
	destroy?(chart: Chart): void;
}
