import LineController from './controller.line';

export default class ScatterController extends LineController {

}

ScatterController.id = 'scatter';

/**
 * @type {any}
 */
ScatterController.defaults = {
  showLine: false,
  fill: false
};

/**
 * @type {any}
 */
ScatterController.overrides = {

  interaction: {
    mode: 'point'
  },

  plugins: {
    tooltip: {
      callbacks: {
        title() {
          return '';     // doesn't make sense for scatter since data are formatted as a point
        },
        label(item) {
          return '(' + item.label + ', ' + item.formattedValue + ')';
        }
      }
    }
  },

  scales: {
    x: {
      type: 'linear'
    },
    y: {
      type: 'linear'
    }
  }
};
