import type {AnyObject} from '../types/basic.js';
import type {Merge} from '../types/utils.js';

export type ResolverObjectKey = string | boolean;

export interface ResolverCache<
  T extends AnyObject[] = AnyObject[],
  R extends AnyObject[] = T
> {
  [Symbol.toStringTag]: 'Object';
  _cacheable: boolean;
  _scopes: T;
  _rootScopes: T | R;
  _fallback: ResolverObjectKey;
  _keys?: string[];
  _scriptable?: boolean;
  _indexable?: boolean;
  _allKeys?: boolean;
  _storage?: T[number];
  _getTarget(): T[number];
  /**
   * The prefixes the options are resolved with. Every sub-resolver is created with them.
   * @private
   */
  _prefixes: string[];
  override<S extends AnyObject>(scope: S): ResolverProxy<(T[number] | S)[], T | R>
  /**
   * The same options, resolved with other prefixes.
   * @private
   */
  overridePrefixes(prefixes: string[]): ResolverProxy<T, R>
}

export type ResolverProxy<
  T extends AnyObject[] = AnyObject[],
  R extends AnyObject[] = T
> = Merge<T[number]> & ResolverCache<T, R>

export interface DescriptorDefaults {
  scriptable: boolean;
  indexable: boolean;
  allKeys?: boolean
}

export interface Descriptor {
  allKeys: boolean;
  scriptable: boolean;
  indexable: boolean;
  isScriptable(key: string): boolean;
  isIndexable(key: string): boolean;
}

export interface ContextCache<
  T extends AnyObject[] = AnyObject[],
  R extends AnyObject[] = T
> {
  _cacheable: boolean;
  _proxy: ResolverProxy<T, R>;
  _context: AnyObject;
  _subProxy: ContextProxy<T, R>;
  _stack: Set<string>;
  _descriptors: Descriptor
  /**
   * The same options with another context. With a non-empty list of prefixes, the options are
   * resolved with those prefixes at every depth, and a scriptable option gets the options as
   * they were before the call as its second argument. Left out or empty, the prefixes in effect
   * stay; `['']` resets them.
   */
  setContext(ctx: AnyObject, prefixes?: string[]): ContextProxy<T, R>
  override<S extends AnyObject>(scope: S): ContextProxy<(T[number] | S)[], T | R>
}

export type ContextProxy<
  T extends AnyObject[] = AnyObject[],
  R extends AnyObject[] = T
> = Merge<T[number]> & ContextCache<T, R>;
