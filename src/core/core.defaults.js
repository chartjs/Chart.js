import {getHoverColor} from '../helpers/helpers.color.js';
import {isObject, merge, valueOrDefault} from '../helpers/helpers.core.js';
import {applyAnimationsDefaults} from './core.animations.defaults.js';
import {applyLayoutsDefaults} from './core.layouts.defaults.js';
import {applyScaleDefaults} from './core.scale.defaults.js';

export const overrides = Object.create(null);
export const descriptors = Object.create(null);

/**
 * @param {object} node
 * @param {string} key
 * @return {object}
 */
function getScope(node, key) {
  if (!key) {
    return node;
  }
  const keys = key.split('.');
  for (let i = 0, n = keys.length; i < n; ++i) {
    const k = keys[i];
    node = node[k] || (node[k] = Object.create(null));
  }
  return node;
}

function set(root, scope, values) {
  if (typeof scope === 'string') {
    return merge(getScope(root, scope), values);
  }
  return merge(getScope(root, ''), scope);
}

/**
 * Please use the module's default export which provides a singleton instance
 * Note: class is exported for typedoc
 */
export class Defaults {
  constructor(_descriptors, _appliers) {
    this.animation = undefined;
    this.backgroundColor = 'rgba(0,0,0,0.1)';
    this.borderColor = 'rgba(0,0,0,0.1)';
    this.color = '#666';
    this.datasets = {};
    this.devicePixelRatio = (context) => context.chart.platform.getDevicePixelRatio();
    this.elements = {};
    this.events = [
      'mousemove',
      'mouseout',
      'click',
      'touchstart',
      'touchmove'
    ];
    this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: 'normal',
      lineHeight: 1.2,
      weight: null
    };
    this.hover = {};
    this.hoverBackgroundColor = (ctx, options) => getHoverColor(options.backgroundColor);
    this.hoverBorderColor = (ctx, options) => getHoverColor(options.borderColor);
    this.hoverColor = (ctx, options) => getHoverColor(options.color);
    this.indexAxis = 'x';
    this.interaction = {
      mode: 'nearest',
      intersect: true,
      includeInvisible: false
    };
    this.maintainAspectRatio = true;
    this.onHover = null;
    this.onClick = null;
    this.parsing = true;
    this.plugins = {};
    this.responsive = true;
    this.scale = undefined;
    this.scales = {};
    this.showLine = true;
    this.drawActiveElementsOnTop = true;

    this.describe(_descriptors);
    this.apply(_appliers);
  }

  /**
	 * @param {string|object} scope
	 * @param {object} [values]
	 */
  set(scope, values) {
    return set(this, scope, values);
  }

  /**
	 * @param {string} scope
	 */
  get(scope) {
    return getScope(this, scope);
  }

  /**
	 * @param {string|object} scope
	 * @param {object} [values]
	 */
  describe(scope, values) {
    return set(descriptors, scope, values);
  }

  override(scope, values) {
    return set(overrides, scope, values);
  }

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
	 * @param {string} scope Scope this route applies to.
	 * @param {string} name Property name that should be routed to different namespace when not defined here.
	 * @param {string} targetScope The namespace where those properties should be routed to.
	 * Empty string ('') is the root of defaults.
	 * @param {string} targetName The target name in the target scope the property should be routed to.
	 */
  route(scope, name, targetScope, targetName) {
    const scopeObject = getScope(this, scope);
    const targetScopeObject = getScope(this, targetScope);
    const privateName = '_' + name;

    Object.defineProperties(scopeObject, {
      // A private property is defined to hold the actual value, when this property is set in its scope (set in the setter)
      [privateName]: {
        value: scopeObject[name],
        writable: true
      },
      // The actual property is defined as getter/setter so we can do the routing when value is not locally set.
      [name]: {
        enumerable: true,
        get() {
          const local = this[privateName];
          const target = targetScopeObject[targetName];
          if (isObject(local)) {
            return Object.assign({}, target, local);
          }
          return valueOrDefault(local, target);
        },
        set(value) {
          this[privateName] = value;
        }
      }
    });
  }

  apply(appliers) {
    appliers.forEach((apply) => apply(this));
  }
}

// singleton instance
export default /* #__PURE__ */ new Defaults({
  _scriptable: (name) => !name.startsWith('on'),
  _indexable: (name) => name !== 'events',
  hover: {
    _fallback: 'interaction'
  },
  interaction: {
    _scriptable: false,
    _indexable: false,
  }
}, [applyAnimationsDefaults, applyLayoutsDefaults, applyScaleDefaults]);
