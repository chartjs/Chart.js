import Ticks from './core.ticks.js';

export function applyScaleDefaults(defaults) {
  defaults.set('scale', {
    display: true,
    offset: false,
    reverse: false,
    beginAtZero: false,

    /**
     * Scale boundary strategy (bypassed by min/max time options)
     * - `data`: make sure data are fully visible, ticks outside are removed
     * - `ticks`: make sure ticks are fully visible, data outside are truncated
     * @see https://github.com/chartjs/Chart.js/pull/4556
     * @since 3.0.0
     */
    bounds: 'ticks',

    clip: true,

    /**
     * Addition grace added to max and reduced from min data value.
     * @since 3.0.0
     */
    grace: 0,

    // grid line settings
    grid: {
      display: true,
      lineWidth: 1,
      drawOnChartArea: true,
      drawTicks: true,
      tickLength: 8,
      tickWidth: (_ctx, options) => options.lineWidth,
      tickColor: (_ctx, options) => options.color,
      offset: false,
    },

    border: {
      display: true,
      dash: [],
      dashOffset: 0.0,
      width: 1
    },

    // scale title
    title: {
      // display property
      display: false,

      // actual label
      text: '',

      // top/bottom padding
      padding: {
        top: 4,
        bottom: 4
      }
    },

    // label settings
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: false,
      textStrokeWidth: 0,
      textStrokeColor: '',
      padding: 3,
      display: true,
      autoSkip: true,
      autoSkipPadding: 3,
      labelOffset: 0,
      // We pass through arrays to be rendered as multiline labels, we convert Others to strings here.
      callback: Ticks.formatters.values,
      minor: {},
      major: {},
      align: 'center',
      crossAlign: 'near',

      showLabelBackdrop: false,
      backdropColor: 'rgba(255, 255, 255, 0.75)',
      backdropPadding: 2,
    }
  });

  defaults.route('scale.ticks', 'color', '', 'color');
  defaults.route('scale.grid', 'color', '', 'borderColor');
  defaults.route('scale.border', 'color', '', 'borderColor');
  defaults.route('scale.title', 'color', '', 'color');

  defaults.describe('scale', {
    _fallback: false,
    _scriptable: (name) => !name.startsWith('before') && !name.startsWith('after') && name !== 'callback' && name !== 'parser',
    _indexable: (name) => name !== 'borderDash' && name !== 'tickBorderDash' && name !== 'dash',
  });

  defaults.describe('scales', {
    _fallback: 'scale',
  });

  defaults.describe('scale.ticks', {
    _scriptable: (name) => name !== 'backdropPadding' && name !== 'callback',
    _indexable: (name) => name !== 'backdropPadding',
  });
}
