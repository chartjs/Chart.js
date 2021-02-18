import {defined, isArray, isFunction, isObject, resolveObjectKey, _capitalize} from './helpers.core';

/**
 * Creates a Proxy for resolving raw values for options.
 * @param {object[]} scopes - The option scopes to look for values, in resolution order
 * @param {string[]} [prefixes] - The prefixes for values, in resolution order.
 * @returns Proxy
 * @private
 */
export function _createResolver(scopes, prefixes = ['']) {
  const cache = {
    [Symbol.toStringTag]: 'Object',
    _cacheable: true,
    _scopes: scopes,
    override: (scope) => _createResolver([scope].concat(scopes), prefixes),
  };
  return new Proxy(cache, {
    get(target, prop) {
      return _cached(target, prop,
        () => _resolveWithPrefixes(prop, prefixes, scopes));
    },

    ownKeys(target) {
      return getKeysFromAllScopes(target);
    },

    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
    },

    set(target, prop, value) {
      scopes[0][prop] = value;
      return delete target[prop];
    }
  });
}

/**
 * Returns an Proxy for resolving option values with context.
 * @param {object} proxy - The Proxy returned by `_createResolver`
 * @param {object} context - Context object for scriptable/indexable options
 * @param {object} [subProxy] - The proxy provided for scriptable options
 * @private
 */
export function _attachContext(proxy, context, subProxy) {
  const cache = {
    _cacheable: false,
    _proxy: proxy,
    _context: context,
    _subProxy: subProxy,
    _stack: new Set(),
    _descriptors: _descriptors(proxy),
    setContext: (ctx) => _attachContext(proxy, ctx, subProxy),
    override: (scope) => _attachContext(proxy.override(scope), context, subProxy)
  };
  return new Proxy(cache, {
    get(target, prop, receiver) {
      return _cached(target, prop,
        () => _resolveWithContext(target, prop, receiver));
    },

    ownKeys() {
      return Reflect.ownKeys(proxy);
    },

    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(proxy._scopes[0], prop);
    },

    set(target, prop, value) {
      proxy[prop] = value;
      return delete target[prop];
    }
  });
}

/**
 * @private
 */
export function _descriptors(proxy) {
  const {_scriptable = true, _indexable = true} = proxy;
  return {
    isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable,
    isIndexable: isFunction(_indexable) ? _indexable : () => _indexable
  };
}

const readKey = (prefix, name) => prefix ? prefix + _capitalize(name) : name;
const needsSubResolver = (prop, value) => isObject(value);

function _cached(target, prop, resolve) {
  let value = target[prop]; // cached value
  if (defined(value)) {
    return value;
  }

  value = resolve();

  if (defined(value)) {
    // cache the resolved value
    target[prop] = value;
  }
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
    // if the resolved value is an object, crate a sub resolver for it
    value = _attachContext(value, _context, _subProxy && _subProxy[prop]);
  }
  return value;
}

function _resolveScriptable(prop, value, target, receiver) {
  const {_proxy, _context, _subProxy, _stack} = target;
  if (_stack.has(prop)) {
    // @ts-ignore
    throw new Error('Recursion detected: ' + [..._stack].join('->') + '->' + prop);
  }
  _stack.add(prop);
  value = value(_context, _subProxy || receiver);
  _stack.delete(prop);
  if (isObject(value)) {
    // When scriptable option returns an object, create a resolver on that.
    value = createSubResolver([value].concat(_proxy._scopes), prop, value);
  }
  return value;
}

function _resolveArray(prop, value, target, isIndexable) {
  const {_proxy, _context, _subProxy} = target;

  if (defined(_context.index) && isIndexable(prop)) {
    value = value[_context.index % value.length];
  } else if (isObject(value[0])) {
    // Array of objects, return array or resolvers
    const arr = value;
    const scopes = _proxy._scopes.filter(s => s !== arr);
    value = [];
    for (const item of arr) {
      const resolver = createSubResolver([item].concat(scopes), prop, item);
      value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop]));
    }
  }
  return value;
}

function createSubResolver(parentScopes, prop, value) {
  const set = new Set([value]);
  const {keys, includeParents} = _resolveSubKeys(parentScopes, prop, value);
  for (const key of keys) {
    for (const item of parentScopes) {
      const scope = resolveObjectKey(item, key);
      if (scope) {
        set.add(scope);
      } else if (key !== prop && scope === false) {
        // If any of the fallback scopes is explicitly false, return false
        // For example, options.hover falls back to options.interaction, when
        // options.interaction is false, options.hover will also resolve as false.
        return false;
      }
    }
  }
  if (includeParents) {
    parentScopes.forEach(set.add, set);
  }
  return _createResolver([...set]);
}

function _resolveSubKeys(parentScopes, prop, value) {
  const fallback = _resolve('_fallback', parentScopes.map(scope => scope[prop] || scope));
  const keys = [prop];
  if (defined(fallback)) {
    const resolved = isFunction(fallback) ? fallback(prop, value) : fallback;
    keys.push(...(isArray(resolved) ? resolved : [resolved]));
  }
  return {keys: keys.filter(v => v), includeParents: fallback !== prop};
}

function _resolveWithPrefixes(prop, prefixes, scopes) {
  let value;
  for (const prefix of prefixes) {
    value = _resolve(readKey(prefix, prop), scopes);
    if (defined(value)) {
      return (needsSubResolver(prop, value))
        ? createSubResolver(scopes, prop, value)
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
  return [...set];
}
