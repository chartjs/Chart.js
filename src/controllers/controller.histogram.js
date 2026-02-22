import BarController from './controller.bar.js';

/**
 * @typedef { import('../types.js').ChartMeta } ChartMeta
 * @typedef { import('../types.js').Point } Point
 */

export default class HistogramController extends BarController {

  static id = 'histogram';

  /**
   * @type {any}
   */
  static defaults = {
    datasetElementType: false,
    dataElementType: 'bar',

    // Bars fill the entire category width with no gaps between them,
    // which is the expected appearance for a histogram.
    barPercentage: 1,
    categoryPercentage: 1,

    grouped: false,

    animations: {
      numbers: {
        type: 'number',
        properties: ['x', 'y', 'base', 'width', 'height']
      }
    }
  };

  /**
   * @type {any}
   */
  static overrides = {
    scales: {
      // A linear index axis is required so bars are positioned and sized
      // according to their numeric x values rather than by category index.
      _index_: {
        type: 'linear',
        offset: false,
        grid: {
          offset: false
        }
      },
      _value_: {
        type: 'linear',
        beginAtZero: true,
      }
    }
  };

}
