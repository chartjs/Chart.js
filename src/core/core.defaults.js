import {getHoverColor} from '../helpers/helpers.color.js';
import {_merger, isObject, merge, valueOrDefault} from '../helpers/helpers.core.js';
import {applyAnimationsDefaults} from './core.animations.defaults.js';
import {applyLayoutsDefaults} from './core.layouts.defaults.js';
import {applyScaleDefaults} from './core.scale.defaults.js';

export const overrides = Object.create(null);
export const descriptors = Object.create(null);

// Rejected even where they are own properties: `prototype` is own on a
// function or class stored in the defaults, and the other two lead to a
// prototype on any node.
const UNSAFE_KEYS = ['__proto__', 'prototype', 'constructor'];

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

/**
 * A key may name an own property of the node or one it does not have yet, never
 * one it inherits: the walk would leave the defaults through it.
 * @param {*} node The node the key is read from, undefined when it does not exist yet
 * @param {string} key
 * @param {string} path The path to report
 */
function assertOwnOrNew(node, key, path) {
  // `in` throws on a primitive, such as the string a path `color.length` reads
  // `length` from; Object() wraps it.
  if (UNSAFE_KEYS.includes(key) || (node && !hasOwn(node, key) && key in Object(node))) {
    throw new Error(`Invalid defaults scope: ${path}`);
  }
}

/**
 * Checks every key of a path before anything is created, so that a rejected
 * path leaves no empty scope behind.
 * @param {object} node
 * @param {string[]} keys
 * @param {string} path
 */
function assertPath(node, keys, path) {
  for (const key of keys) {
    assertOwnOrNew(node, key, path);
    node = node && node[key];
  }
}

const splitScope = (scope) => (scope ? scope.split('.') : []);

/**
 * @param {object} node
 * @param {string} key
 * @return {object}
 */
function getScope(node, key) {
  const keys = splitScope(key);
  assertPath(node, keys, key);
  for (const k of keys) {
    node = node[k] || (node[k] = Object.create(null));
  }
  return node;
}

/**
 * Merges like `merge()`, but skips a key that the target inherits and does not
 * own, so that the values cannot replace a method of the defaults.
 */
function skipInherited(key, target, source, options) {
  if (hasOwn(target, key) || !(key in target)) {
    _merger(key, target, source, options);
  }
}

function set(root, scope, values) {
  if (typeof scope === 'string') {
    return merge(getScope(root, scope), values, {merger: skipInherited});
  }
  return merge(getScope(root, ''), scope, {merger: skipInherited});
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
    // The properties defined below cannot be removed, so check every name first.
    const privateName = '_' + name;
    const paths = [
      splitScope(scope).concat(name),
      splitScope(scope).concat(privateName),
      splitScope(targetScope).concat(targetName)
    ];
    paths.forEach((keys) => assertPath(this, keys, keys.join('.')));

    const scopeObject = getScope(this, scope);
    const targetScopeObject = getScope(this, targetScope);

    const get = function() {
      const local = this[privateName];
      const target = targetScopeObject[targetName];
      if (isObject(local)) {
        return Object.assign({}, target, local);
      }
      return valueOrDefault(local, target);
    };
    // The getter carries the route, so `getRoutes` finds it on the live scope.
    get.route = Object.freeze({scope, name, targetScope, targetName});

    Object.defineProperties(scopeObject, {
      // A private property is defined to hold the actual value, when this property is set in its scope (set in the setter)
      [privateName]: {
        value: scopeObject[name],
        writable: true
      },
      // The actual property is defined as getter/setter so we can do the routing when value is not locally set.
      [name]: {
        enumerable: true,
        get,
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
const defaults = /* #__PURE__ */ new Defaults({
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

export default defaults;

/**
 * The routes `route` defined on a scope of the defaults, read from the live
 * scope object, so a scope that was removed or replaced has none. `local`
 * returns the value set for the routed option itself, without its target: the
 * stored value, not a copy.
 * @param {string} scope
 * @return {{scope: string, name: string, targetScope: string, targetName: string, local: () => *}[]}
 * @private
 */
export function getRoutes(scope) {
  let node = defaults;
  for (const key of splitScope(scope)) {
    // Own properties only, and never create a scope.
    node = isObject(node) && hasOwn(node, key) ? node[key] : undefined;
  }
  if (!isObject(node)) {
    return [];
  }
  const scopeObject = node;
  return Object.values(Object.getOwnPropertyDescriptors(scopeObject))
    .filter((descriptor) => descriptor.get && descriptor.get.route)
    .map(({get: {route}}) => ({...route, local: () => scopeObject['_' + route.name]}));
}
