import {defined, isArray, isFunction, isObject, resolveObjectKey, _capitalize} from './helpers.core';

/**
 * Creates a Proxy for resolving raw values for options.
 * @param {object[]} scopes - The option scopes to look for values, in resolution order
 * @param {string[]} [prefixes] - The prefixes for values, in resolution order.
 * @param {object[]} [rootScopes] - The root option scopes
 * @param {string|boolean} [fallback] - Parent scopes fallback
 * @param {function} [getTarget] - callback for getting the target for changed values
 * @returns Proxy
 * @private
 */
export function _createResolver(scopes, prefixes = [''], rootScopes = scopes, fallback, getTarget = () => scopes[0]) {
  if (!defined(fallback)) {
    fallback = _resolve('_fallback', scopes);
  }
  const cache = {
    [Symbol.toStringTag]: 'Object',
    _cacheable: true,
    _scopes: scopes,
    _rootScopes: rootScopes,
    _fallback: fallback,
    _getTarget: getTarget,
    override: (scope) => _createResolver([scope, ...scopes], prefixes, rootScopes, fallback),
  };
  return new Proxy(cache, {
    /**
     * A trap for the delete operator.
     */
    deleteProperty(target, prop) {
      delete target[prop]; // remove from cache
      delete target._keys; // remove cached keys
      delete scopes[0][prop]; // remove from top level scope
      return true;
    },

    /**
     * A trap for getting property values.
     */
    get(target, prop) {
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
    has(target, prop) {
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
    set(target, prop, value) {
      const storage = target._storage || (target._storage = getTarget());
      target[prop] = storage[prop] = value; // set to top level scope + cache
      delete target._keys; // remove cached keys
      return true;
    }
  });
}

/**
 * Returns an Proxy for resolving option values with context.
 * @param {object} proxy - The Proxy returned by `_createResolver`
 * @param {object} context - Context object for scriptable/indexable options
 * @param {object} [subProxy] - The proxy provided for scriptable options
 * @param {{scriptable: boolean, indexable: boolean, allKeys?: boolean}} [descriptorDefaults] - Defaults for descriptors
 * @private
 */
export function _attachContext(proxy, context, subProxy, descriptorDefaults) {
  const cache = {
    _cacheable: false,
    _proxy: proxy,
    _context: context,
    _subProxy: subProxy,
    _stack: new Set(),
    _descriptors: _descriptors(proxy, descriptorDefaults),
    setContext: (ctx) => _attachContext(proxy, ctx, subProxy, descriptorDefaults),
    override: (scope) => _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
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
    get(target, prop, receiver) {
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
  });
}

/**
 * @private
 */
export function _descriptors(proxy, defaults = {scriptable: true, indexable: true}) {
  const {_scriptable = defaults.scriptable, _indexable = defaults.indexable, _allKeys = defaults.allKeys} = proxy;
  return {
    allKeys: _allKeys,
    scriptable: _scriptable,
    indexable: _indexable,
    isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable,
    isIndexable: isFunction(_indexable) ? _indexable : () => _indexable
  };
}

const readKey = (prefix, name) => prefix ? prefix + _capitalize(name) : name;
const needsSubResolver = (prop, value) => isObject(value) && prop !== 'adapters' &&
  (Object.getPrototypeOf(value) === null || value.constructor === Object);

function _cached(target, prop, resolve) {
  if (Object.prototype.hasOwnProperty.call(target, prop)) {
    return target[prop];
  }

  const value = resolve();
  // cache the resolved value
  target[prop] = value;
  return value;
}

function _resolveWithContext(target, prop, receiver) {
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

function _resolveScriptable(prop, value, target, receiver) {
  const {_proxy, _context, _subProxy, _stack} = target;
  if (_stack.has(prop)) {
    // @ts-ignore
    throw new Error('Recursion detected: ' + Array.from(_stack).join('->') + '->' + prop);
  }
  _stack.add(prop);
  value = value(_context, _subProxy || receiver);
  _stack.delete(prop);
  if (needsSubResolver(prop, value)) {
    // When scriptable option returns an object, create a resolver on that.
    value = createSubResolver(_proxy._scopes, _proxy, prop, value);
  }
  return value;
}

function _resolveArray(prop, value, target, isIndexable) {
  const {_proxy, _context, _subProxy, _descriptors: descriptors} = target;

  if (defined(_context.index) && isIndexable(prop)) {
    value = value[_context.index % value.length];
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

function resolveFallback(fallback, prop, value) {
  return isFunction(fallback) ? fallback(prop, value) : fallback;
}

const getScope = (key, parent) => key === true ? parent
  : typeof key === 'string' ? resolveObjectKey(parent, key) : undefined;

function addScopes(set, parentScopes, key, parentFallback, value) {
  for (const parent of parentScopes) {
    const scope = getScope(key, parent);
    if (scope) {
      set.add(scope);
      const fallback = resolveFallback(scope._fallback, key, value);
      if (defined(fallback) && fallback !== key && fallback !== parentFallback) {
        // When we reach the descriptor that defines a new _fallback, return that.
        // The fallback will resume to that new scope.
        return fallback;
      }
    } else if (scope === false && defined(parentFallback) && key !== parentFallback) {
      // Fallback to `false` results to `false`, when falling back to different key.
      // For example `interaction` from `hover` or `plugins.tooltip` and `animation` from `animations`
      return null;
    }
  }
  return false;
}

function createSubResolver(parentScopes, resolver, prop, value) {
  const rootScopes = resolver._rootScopes;
  const fallback = resolveFallback(resolver._fallback, prop, value);
  const allScopes = [...parentScopes, ...rootScopes];
  const set = new Set();
  set.add(value);
  let key = addScopesFromKey(set, allScopes, prop, fallback || prop, value);
  if (key === null) {
    return false;
  }
  if (defined(fallback) && fallback !== prop) {
    key = addScopesFromKey(set, allScopes, fallback, key, value);
    if (key === null) {
      return false;
    }
  }
  return _createResolver(Array.from(set), [''], rootScopes, fallback,
    () => subGetTarget(resolver, prop, value));
}

function addScopesFromKey(set, allScopes, key, fallback, item) {
  while (key) {
    key = addScopes(set, allScopes, key, fallback, item);
  }
  return key;
}

function subGetTarget(resolver, prop, value) {
  const parent = resolver._getTarget();
  if (!(prop in parent)) {
    parent[prop] = {};
  }
  const target = parent[prop];
  if (isArray(target) && isObject(value)) {
    // For array of objects, the object is used to store updated values
    return value;
  }
  return target;
}

function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
  let value;
  for (const prefix of prefixes) {
    value = _resolve(readKey(prefix, prop), scopes);
    if (defined(value)) {
      return needsSubResolver(prop, value)
        ? createSubResolver(scopes, proxy, prop, value)
        : value;
    }
  }
}

function _resolve(key, scopes) {
  for (const scope of scopes) {
    if (!scope) {
      continue;
    }
    const value = scope[key];
    if (defined(value)) {
      return value;
    }
  }
}

function getKeysFromAllScopes(target) {
  let keys = target._keys;
  if (!keys) {
    keys = target._keys = resolveKeysFromAllScopes(target._scopes);
  }
  return keys;
}

function resolveKeysFromAllScopes(scopes) {
  const set = new Set();
  for (const scope of scopes) {
    for (const key of Object.keys(scope).filter(k => !k.startsWith('_'))) {
      set.add(key);
    }
  }
  return Array.from(set);
}
