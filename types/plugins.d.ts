import { IEvent } from './platform';
import { Chart, IChartMeta } from './core';

export interface IPlugin<O = {}> {
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
    beforeUpdate?(chart: Chart, options: O): boolean | void;
    /**
     * @desc Called after `chart` has been updated and before rendering. Note that this
     * hook will not be called if the chart update has been previously cancelled.
     * @param {Chart} chart - The chart instance.
     * @param {object} options - The plugin options.
     */
    afterUpdate?(chart: Chart, options: O): void;
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
     * @param {object} options - The plugin options.
     * @returns {boolean} false to cancel the datasets update.
     * @since version 2.1.5
    */
    beforeDatasetsUpdate?(chart: Chart, options: O): boolean | void;
    /**
     * @desc Called after the `chart` datasets have been updated. Note that this hook
     * will not be called if the datasets update has been previously cancelled.
     * @param {Chart} chart - The chart instance.
     * @param {object} options - The plugin options.
     * @since version 2.1.5
     */
    afterDatasetsUpdate?(chart: Chart, options: O): void;
    /**
     * @desc Called before updating the `chart` dataset at the given `args.index`. If any plugin
     * returns `false`, the datasets update is cancelled until another `update` is triggered.
     * @param {Chart} chart - The chart instance.
     * @param {object} args - The call arguments.
     * @param {number} args.index - The dataset index.
     * @param {object} args.meta - The dataset metadata.
     * @param {object} options - The plugin options.
     * @returns {boolean} `false` to cancel the chart datasets drawing.
     */
    beforeDatasetUpdate?(chart: Chart, args: { index: number, meta: IChartMeta }, options: O): boolean | void;
    /**
     * @desc Called after the `chart` datasets at the given `args.index` has been updated. Note
     * that this hook will not be called if the datasets update has been previously cancelled.
     * @param {Chart} chart - The chart instance.
     * @param {object} args - The call arguments.
     * @param {number} args.index - The dataset index.
     * @param {object} args.meta - The dataset metadata.
     * @param {object} options - The plugin options.
     */
    afterDatasetUpdate?(chart: Chart, args: { index: number, meta: IChartMeta }, options: O): void;
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
    beforeDatasetDraw?(chart: Chart, args: { index: number, meta: IChartMeta }, options: O): boolean | void;
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
    afterDatasetDraw?(chart: Chart, args: { index: number, meta: IChartMeta }, options: O): void;
    /**
     * @desc Called before drawing the `tooltip`. If any plugin returns `false`,
     * the tooltip drawing is cancelled until another `render` is triggered.
     * @param {Chart} chart - The chart instance.
     * @param {object} args - The call arguments.
     * @param {Tooltip} args.tooltip - The tooltip.
     * @param {object} options - The plugin options.
     * @returns {boolean} `false` to cancel the chart tooltip drawing.
     */
    beforeTooltipDraw?(chart: Chart, args: { tooltip: TooltipObject }, options: O): boolean | void;
    /**
     * @desc Called after drawing the `tooltip`. Note that this hook will not
     * be called if the tooltip drawing has been previously cancelled.
     * @param {Chart} chart - The chart instance.
     * @param {object} args - The call arguments.
     * @param {Tooltip} args.tooltip - The tooltip.
     * @param {object} options - The plugin options.
     */
    afterTooltipDraw?(chart: Chart, args: { tooltip: TooltipObject }, options: O): void;
    /**
     * @desc Called before processing the specified `event`. If any plugin returns `false`,
     * the event will be discarded.
     * @param {Chart} chart - The chart instance.
     * @param {IEvent} event - The event object.
     * @param {object} options - The plugin options.
     * @param {boolean} replay - True if this event is replayed from `Chart.update`
     */
    beforeEvent?(chart: Chart, event: IEvent, options: O, replay: boolean): void;
    /**
     * @desc Called after the `event` has been consumed. Note that this hook
     * will not be called if the `event` has been previously discarded.
     * @param {Chart} chart - The chart instance.
     * @param {IEvent} event - The event object.
     * @param {object} options - The plugin options.
     * @param {boolean} replay - True if this event is replayed from `Chart.update`
     */
    afterEvent?(chart: Chart, event: IEvent, options: O, replay: boolean): void;
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

export const Filler: IPlugin;
export const Legend: IPlugin;
export const Title: IPlugin;

export class TooltipObject {

}

export const Tooltip: IPlugin & {
    readonly positioners: { [key: string]: (items: readonly Element[], eventPosition: { x: number; y: number }) => { x: number; y: number } };
};



export interface ITooltipItem {
    chart: Chart;
    datasetIndex: number;
    element: Element;
    dataIndex: number;
    dataPoint: any;
    label: string;
    formattedValue: string;
}
