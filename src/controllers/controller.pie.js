import DoughnutController from './controller.doughnut';

// Pie charts are Doughnut chart with different defaults
export default class PieController extends DoughnutController {

}

PieController.id = 'pie';

/**
 * @type {any}
 */
PieController.defaults = {
  datasets: {
    // The percentage of the chart that we cut out of the middle.
    cutoutPercentage: 0,

    // The rotation of the chart, where the first data arc begins.
    rotation: 0,

    // The total circumference of the chart.
    circumference: 360
  }
};
