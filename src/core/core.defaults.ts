import {getHoverColor} from '../helpers/helpers.color.js';
import {_hasOwn, _merger, isObject, merge, valueOrDefault} from '../helpers/helpers.core.js';
import {applyAnimationsDefaults} from './core.animations.defaults.js';
import {applyLayoutsDefaults} from './core.layouts.defaults.js';
import {applyScaleDefaults} from './core.scale.defaults.js';
import type {AnyObject} from '../types/basic.js';

export const overrides = Object.create(null);
export const descriptors = Object.create(null);

// Rejected even where they are own properties: `prototype` is own on a
// function or class stored in the defaults, and the other two lead to a
// prototype on any node.
const UNSAFE_KEYS = ['__proto__', 'prototype', 'constructor'];

export type DefaultsRoute = {scope: string, name: string, targetScope: string, targetName: string};

/**
 * The getter `route` defines, tagged with its route
 */
export type RoutedGetter = (() => any) & {route?: DefaultsRoute};

/**
 * A key may name an own property of the node or one it does not have yet, never
 * one it inherits: the walk would leave the defaults through it.
 * @param node The node the key is read from, undefined when it does not exist yet
 * @param key
 * @param path The path to report
 */
function assertOwnOrNew(node: any, key: string, path: string) {
  // `in` throws on a primitive, such as the string a path `color.length` reads
  // `length` from; Object() wraps it.
  if (UNSAFE_KEYS.includes(key) || (node && !_hasOwn(node, key) && key in Object(node))) {
    throw new Error(`Invalid defaults scope: ${path}`);
  }
}

/**
 * Checks every key of a path before anything is created, so that a rejected
 * path leaves no empty scope behind.
 */
function assertPath(node: any, keys: string[], path: string) {
  for (const key of keys) {
    assertOwnOrNew(node, key, path);
    node = node && node[key];
  }
}

const splitScope = (scope: string): string[] => (scope ? scope.split('.') : []);

function getScope(node: any, key: string): any {
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
function skipInherited(key: string, target: AnyObject, source: AnyObject, options?: AnyObject) {
  if (_hasOwn(target, key) || !(key in target)) {
    _merger(key, target, source, options);
  }
}

function set(root: object, scope: string | object, values?: object): any {
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
  // The fields keep the types they are published with. The `{}` scopes are
  // filled at runtime; the public `Defaults` interface types them.
  declare animation: any;
  declare backgroundColor: string;
  declare borderColor: string;
  declare color: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  declare datasets: {};
  declare devicePixelRatio: (context: any) => any;
  // eslint-disable-next-line @typescript-eslint/ban-types
  declare elements: {};
  declare events: string[];
  declare font: {
    family: string;
    size: number;
    style: string;
    lineHeight: number;
    weight: any;
  };
  // eslint-disable-next-line @typescript-eslint/ban-types
  declare hover: {};
  declare hoverBackgroundColor: (ctx: any, options: any) => CanvasGradient;
  declare hoverBorderColor: (ctx: any, options: any) => CanvasGradient;
  declare hoverColor: (ctx: any, options: any) => CanvasGradient;
  declare indexAxis: string;
  declare interaction: {
    mode: string;
    intersect: boolean;
    includeInvisible: boolean;
  };
  declare maintainAspectRatio: boolean;
  declare onHover: any;
  declare onClick: any;
  declare parsing: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  declare plugins: {};
  declare responsive: boolean;
  declare scale: any;
  // eslint-disable-next-line @typescript-eslint/ban-types
  declare scales: {};
  declare showLine: boolean;
  declare drawActiveElementsOnTop: boolean;

  constructor(_descriptors: object, _appliers: Array<(defaults: Defaults) => void>) {
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
    this.hoverBackgroundColor = (_ctx, options) => getHoverColor(options.backgroundColor);
    this.hoverBorderColor = (_ctx, options) => getHoverColor(options.borderColor);
    this.hoverColor = (_ctx, options) => getHoverColor(options.color);
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

  set(scope: string | object, values?: object): any {
    return set(this, scope, values);
  }

  get(scope: string): any {
    return getScope(this, scope);
  }

  describe(scope: string | object, values?: object): any {
    return set(descriptors, scope, values);
  }

  override(scope: string | object, values?: object): any {
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
	 * @param scope Scope this route applies to.
	 * @param name Property name that should be routed to different namespace when not defined here.
	 * @param targetScope The namespace where those properties should be routed to.
	 * Empty string ('') is the root of defaults.
	 * @param targetName The target name in the target scope the property should be routed to.
	 */
  route(scope: string, name: string, targetScope: string, targetName: string): void {
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

    const get: RoutedGetter = function() {
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

  apply(appliers: Array<(defaults: Defaults) => void>): void {
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
 * @private
 */
export function getRoutes(scope: string): Array<DefaultsRoute & {local: () => any}> {
  let node: any = defaults;
  for (const key of splitScope(scope)) {
    // Own properties only, and never create a scope.
    node = isObject(node) && _hasOwn(node, key) ? node[key] : undefined;
  }
  if (!isObject(node)) {
    return [];
  }
  const scopeObject = node;
  const routes = [];
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(scopeObject))) {
    const route = descriptor.get && (descriptor.get as RoutedGetter).route;
    if (route) {
      routes.push({...route, local: () => scopeObject['_' + route.name]});
    }
  }
  return routes;
}
