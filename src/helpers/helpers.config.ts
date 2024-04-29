/* eslint-disable @typescript-eslint/no-use-before-define */
import type {AnyObject} from '../types/basic.js';
import type {ChartMeta} from '../types/index.js';
import type {
  ResolverObjectKey,
  ResolverCache,
  ResolverProxy,
  DescriptorDefaults,
  Descriptor,
  ContextCache,
  ContextProxy
} from './helpers.config.types.js';
import {isArray, isFunction, isObject, resolveObjectKey, _capitalize} from './helpers.core.js';

export * from './helpers.config.types.js';

/**
 * Creates a Proxy for resolving raw values for options.
 * @param scopes - The option scopes to look for values, in resolution order
 * @param prefixes - The prefixes for values, in resolution order.
 * @param rootScopes - The root option scopes
 * @param fallback - Parent scopes fallback
 * @param getTarget - callback for getting the target for changed values
 * @returns Proxy
 * @private
 */
export function _createResolver<
  T extends AnyObject[] = AnyObject[],
  R extends AnyObject[] = T
>(
  scopes: T,
  prefixes = [''],
  rootScopes?: R,
  fallback?: ResolverObjectKey,
  getTarget = () => scopes[0]
) {
  const finalRootScopes = rootScopes || scopes;
  if (typeof fallback === 'undefined') {
    fallback = _resolve('_fallback', scopes);
  }
  const cache: ResolverCache<T, R> = {
    [Symbol.toStringTag]: 'Object',
    _cacheable: true,
    _scopes: scopes,
    _rootScopes: finalRootScopes,
    _fallback: fallback,
    _getTarget: getTarget,
    override: (scope: AnyObject) => _createResolver([scope, ...scopes], prefixes, finalRootScopes, fallback),
  };
  return new Proxy(cache, {
    /**
     * A trap for the delete operator.
     */
    deleteProperty(target, prop: string) {
      delete target[prop]; // remove from cache
      delete target._keys; // remove cached keys
      delete scopes[0][prop]; // remove from top level scope
      return true;
    },

    /**
     * A trap for getting property values.
     */
    get(target, prop: string) {
      return _cached(target, prop,
        () => _resolveWithPrefixes(prop, prefixes, scopes, target));
    },

    /**
     * A trap for Object.getOwnPropertyDescriptor.
     * Also used by Object.hasOwnProperty.
     */
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
    },

    /**
     * A trap for Object.getPrototypeOf.
     */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(scopes[0]);
    },

    /**
     * A trap for the in operator.
     */
    has(target, prop: string) {
      return getKeysFromAllScopes(target).includes(prop);
    },

    /**
     * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
     */
    ownKeys(target) {
      return getKeysFromAllScopes(target);
    },

    /**
     * A trap for setting property values.
     */
    set(target, prop: string, value) {
      const storage = target._storage || (target._storage = getTarget());
      target[prop] = storage[prop] = value; // set to top level scope + cache
      delete target._keys; // remove cached keys
      return true;
    }
  }) as ResolverProxy<T, R>;
}

/**
 * Returns an Proxy for resolving option values with context.
 * @param proxy - The Proxy returned by `_createResolver`
 * @param context - Context object for scriptable/indexable options
 * @param subProxy - The proxy provided for scriptable options
 * @param descriptorDefaults - Defaults for descriptors
 * @private
 */
export function _attachContext<
  T extends AnyObject[] = AnyObject[],
  R extends AnyObject[] = T
>(
  proxy: ResolverProxy<T, R>,
  context: AnyObject,
  subProxy?: ResolverProxy<T, R>,
  descriptorDefaults?: DescriptorDefaults
) {
  const cache: ContextCache<T, R> = {
    _cacheable: false,
    _proxy: proxy,
    _context: context,
    _subProxy: subProxy,
    _stack: new Set(),
    _descriptors: _descriptors(proxy, descriptorDefaults),
    setContext: (ctx: AnyObject) => _attachContext(proxy, ctx, subProxy, descriptorDefaults),
    override: (scope: AnyObject) => _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
  };
  return new Proxy(cache, {
    /**
     * A trap for the delete operator.
     */
    deleteProperty(target, prop) {
      delete target[prop]; // remove from cache
      delete proxy[prop]; // remove from proxy
      return true;
    },

    /**
     * A trap for getting property values.
     */
    get(target, prop: string, receiver) {
      return _cached(target, prop,
        () => _resolveWithContext(target, prop, receiver));
    },

    /**
     * A trap for Object.getOwnPropertyDescriptor.
     * Also used by Object.hasOwnProperty.
     */
    getOwnPropertyDescriptor(target, prop) {
      return target._descriptors.allKeys
        ? Reflect.has(proxy, prop) ? {enumerable: true, configurable: true} : undefined
        : Reflect.getOwnPropertyDescriptor(proxy, prop);
    },

    /**
     * A trap for Object.getPrototypeOf.
     */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(proxy);
    },

    /**
     * A trap for the in operator.
     */
    has(target, prop) {
      return Reflect.has(proxy, prop);
    },

    /**
     * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
     */
    ownKeys() {
      return Reflect.ownKeys(proxy);
    },

    /**
     * A trap for setting property values.
     */
    set(target, prop, value) {
      proxy[prop] = value; // set to proxy
      delete target[prop]; // remove from cache
      return true;
    }
  }) as ContextProxy<T, R>;
}

/**
 * @private
 */
export function _descriptors(
  proxy: ResolverCache,
  defaults: DescriptorDefaults = {scriptable: true, indexable: true}
): Descriptor {
  const {_scriptable = defaults.scriptable, _indexable = defaults.indexable, _allKeys = defaults.allKeys} = proxy;
  return {
    allKeys: _allKeys,
    scriptable: _scriptable,
    indexable: _indexable,
    isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable,
    isIndexable: isFunction(_indexable) ? _indexable : () => _indexable
  };
}

const readKey = (prefix: string, name: string) => prefix ? prefix + _capitalize(name) : name;
const needsSubResolver = (prop: string, value: unknown) => isObject(value) && prop !== 'adapters' &&
  (Object.getPrototypeOf(value) === null || value.constructor === Object);

function _cached(
  target: AnyObject,
  prop: string,
  resolve: () => unknown
) {
  if (Object.prototype.hasOwnProperty.call(target, prop) || prop === 'constructor') {
    return target[prop];
  }

  const value = resolve();
  // cache the resolved value
  target[prop] = value;
  return value;
}

function _resolveWithContext(
  target: ContextCache,
  prop: string,
  receiver: AnyObject
) {
  const {_proxy, _context, _subProxy, _descriptors: descriptors} = target;
  let value = _proxy[prop]; // resolve from proxy

  // resolve with context
  if (isFunction(value) && descriptors.isScriptable(prop)) {
    value = _resolveScriptable(prop, value, target, receiver);
  }
  if (isArray(value) && value.length) {
    value = _resolveArray(prop, value, target, descriptors.isIndexable);
  }
  if (needsSubResolver(prop, value)) {
    // if the resolved value is an object, create a sub resolver for it
    value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors);
  }
  return value;
}

function _resolveScriptable(
  prop: string,
  getValue: (ctx: AnyObject, sub: AnyObject) => unknown,
  target: ContextCache,
  receiver: AnyObject
) {
  const {_proxy, _context, _subProxy, _stack} = target;
  if (_stack.has(prop)) {
    throw new Error('Recursion detected: ' + Array.from(_stack).join('->') + '->' + prop);
  }
  _stack.add(prop);
  let value = getValue(_context, _subProxy || receiver);
  _stack.delete(prop);
  if (needsSubResolver(prop, value)) {
    // When scriptable option returns an object, create a resolver on that.
    value = createSubResolver(_proxy._scopes, _proxy, prop, value);
  }
  return value;
}

function _resolveArray(
  prop: string,
  value: unknown[],
  target: ContextCache,
  isIndexable: (key: string) => boolean
) {
  const {_proxy, _context, _subProxy, _descriptors: descriptors} = target;

  if (typeof _context.index !== 'undefined' && isIndexable(prop)) {
    return value[_context.index % value.length];
  } else if (isObject(value[0])) {
    // Array of objects, return array or resolvers
    const arr = value;
    const scopes = _proxy._scopes.filter(s => s !== arr);
    value = [];
    for (const item of arr) {
      const resolver = createSubResolver(scopes, _proxy, prop, item);
      value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors));
    }
  }
  return value;
}

function resolveFallback(
  fallback: ResolverObjectKey | ((prop: ResolverObjectKey, value: unknown) => ResolverObjectKey),
  prop: ResolverObjectKey,
  value: unknown
) {
  return isFunction(fallback) ? fallback(prop, value) : fallback;
}

const getScope = (key: ResolverObjectKey, parent: AnyObject) => key === true ? parent
  : typeof key === 'string' ? resolveObjectKey(parent, key) : undefined;

function addScopes(
  set: Set<AnyObject>,
  parentScopes: AnyObject[],
  key: ResolverObjectKey,
  parentFallback: ResolverObjectKey,
  value: unknown
) {
  for (const parent of parentScopes) {
    const scope = getScope(key, parent);
    if (scope) {
      set.add(scope);
      const fallback = resolveFallback(scope._fallback, key, value);
      if (typeof fallback !== 'undefined' && fallback !== key && fallback !== parentFallback) {
        // When we reach the descriptor that defines a new _fallback, return that.
        // The fallback will resume to that new scope.
        return fallback;
      }
    } else if (scope === false && typeof parentFallback !== 'undefined' && key !== parentFallback) {
      // Fallback to `false` results to `false`, when falling back to different key.
      // For example `interaction` from `hover` or `plugins.tooltip` and `animation` from `animations`
      return null;
    }
  }
  return false;
}

function createSubResolver(
  parentScopes: AnyObject[],
  resolver: ResolverCache,
  prop: ResolverObjectKey,
  value: unknown
) {
  const rootScopes = resolver._rootScopes;
  const fallback = resolveFallback(resolver._fallback, prop, value);
  const allScopes = [...parentScopes, ...rootScopes];
  const set = new Set<AnyObject>();
  set.add(value);
  let key = addScopesFromKey(set, allScopes, prop, fallback || prop, value);
  if (key === null) {
    return false;
  }
  if (typeof fallback !== 'undefined' && fallback !== prop) {
    key = addScopesFromKey(set, allScopes, fallback, key, value);
    if (key === null) {
      return false;
    }
  }
  return _createResolver(Array.from(set), [''], rootScopes, fallback,
    () => subGetTarget(resolver, prop as string, value));
}

function addScopesFromKey(
  set: Set<AnyObject>,
  allScopes: AnyObject[],
  key: ResolverObjectKey,
  fallback: ResolverObjectKey,
  item: unknown
) {
  while (key) {
    key = addScopes(set, allScopes, key, fallback, item);
  }
  return key;
}

function subGetTarget(
  resolver: ResolverCache,
  prop: string,
  value: unknown
) {
  const parent = resolver._getTarget();
  if (!(prop in parent)) {
    parent[prop] = {};
  }
  const target = parent[prop];
  if (isArray(target) && isObject(value)) {
    // For array of objects, the object is used to store updated values
    return value;
  }
  return target || {};
}

function _resolveWithPrefixes(
  prop: string,
  prefixes: string[],
  scopes: AnyObject[],
  proxy: ResolverProxy
) {
  let value: unknown;
  for (const prefix of prefixes) {
    value = _resolve(readKey(prefix, prop), scopes);
    if (typeof value !== 'undefined') {
      return needsSubResolver(prop, value)
        ? createSubResolver(scopes, proxy, prop, value)
        : value;
    }
  }
}

function _resolve(key: string, scopes: AnyObject[]) {
  for (const scope of scopes) {
    if (!scope) {
      continue;
    }
    const value = scope[key];
    if (typeof value !== 'undefined') {
      return value;
    }
  }
}

function getKeysFromAllScopes(target: ResolverCache) {
  let keys = target._keys;
  if (!keys) {
    keys = target._keys = resolveKeysFromAllScopes(target._scopes);
  }
  return keys;
}

function resolveKeysFromAllScopes(scopes: AnyObject[]) {
  const set = new Set<string>();
  for (const scope of scopes) {
    for (const key of Object.keys(scope).filter(k => !k.startsWith('_'))) {
      set.add(key);
    }
  }
  return Array.from(set);
}

export function _parseObjectDataRadialScale(
  meta: ChartMeta<'line' | 'scatter'>,
  data: AnyObject[],
  start: number,
  count: number
) {
  const {iScale} = meta;
  const {key = 'r'} = this._parsing;
  const parsed = new Array<{r: unknown}>(count);
  let i: number, ilen: number, index: number, item: AnyObject;

  for (i = 0, ilen = count; i < ilen; ++i) {
    index = i + start;
    item = data[index];
    parsed[i] = {
      r: iScale.parse(resolveObjectKey(item, key), index)
    };
  }
  return parsed;
}
