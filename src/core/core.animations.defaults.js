const numbers = ['x', 'y', 'borderWidth', 'radius', 'tension'];
const colors = ['color', 'borderColor', 'backgroundColor'];

export function applyAnimationsDefaults(defaults) {
  defaults.set('animation', {
    delay: undefined,
    duration: 1000,
    easing: 'easeOutQuart',
    fn: undefined,
    from: undefined,
    loop: undefined,
    to: undefined,
    type: undefined,
  });

  defaults.describe('animation', {
    _fallback: false,
    _indexable: false,
    _scriptable: (name) => name !== 'onProgress' && name !== 'onComplete' && name !== 'fn',
  });

  defaults.set('animations', {
    colors: {
      type: 'color',
      properties: colors
    },
    numbers: {
      type: 'number',
      properties: numbers
    },
  });

  defaults.describe('animations', {
    _fallback: 'animation',
  });

  defaults.set('transitions', {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: 'transparent'
        },
        visible: {
          type: 'boolean',
          duration: 0 // show immediately
        },
      }
    },
    hide: {
      animations: {
        colors: {
          to: 'transparent'
        },
        visible: {
          type: 'boolean',
          easing: 'linear',
          fn: v => v | 0 // for keeping the dataset visible all the way through the animation
        },
      }
    }
  });
}
