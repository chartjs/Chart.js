import DoughnutController from './controller.doughnut.js';

// Pie charts are Doughnut chart with different defaults
export default class PieController extends DoughnutController {

  static id = 'pie';

  /**
   * @type {any}
   */
  static defaults = {
    // The percentage of the chart that we cut out of the middle.
    cutout: 0,

    // The rotation of the chart, where the first data arc begins.
    rotation: 0,

    // The total circumference of the chart.
    circumference: 360,

    // The outer radius of the chart
    radius: '100%'
  };
}
