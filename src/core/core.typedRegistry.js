import defaults from './core.defaults';
import {valueOrDefault} from '../helpers/helpers.core';

/**
 * @typedef {{id: string, defaults: any, defaultRoutes: any}} IChartComponent
 */

export default class TypedRegistry {
	constructor(type, scope) {
		this.type = type;
		this.scope = scope;
		this.items = Object.create(null);
	}

	isForType(type) {
		return Object.prototype.isPrototypeOf.call(this.type, type);
	}

	/**
	 * @param {IChartComponent} item
	 * @param {string} [scopeOverride]
	 * @returns {string} The scope where items defaults were registered to.
	 */
	register(item, scopeOverride) {
		const proto = Object.getPrototypeOf(item);
		let parentScope;

		if (isIChartComponent(proto)) {
			// Make sure the parent is registered and note the scope where its defaults are.
			parentScope = this.register(proto);
		}

		const items = this.items;
		const id = item.id;
		const baseScope = valueOrDefault(scopeOverride, this.scope);
		const scope = baseScope ? baseScope + '.' + id : id;

		if (!id) {
			throw new Error('class does not have id: ' + Object.getPrototypeOf(item));
		}

		if (id in items) {
			// already registered
			return scope;
		}

		items[id] = item;
		registerDefaults(item, scope, parentScope);

		return scope;
	}

	/**
	 * @param {string} id
	 * @returns {object?}
	 */
	get(id) {
		return this.items[id];
	}

	/**
	 * @param {IChartComponent} item
	 */
	unregister(item) {
		const items = this.items;
		const id = item.id;

		if (id in items) {
			delete items[id];
		}

		if (id in defaults[this.scope]) {
			delete defaults[this.scope][id];
		} else if (id in defaults) {
			delete defaults[id];
		}
	}
}

function registerDefaults(item, scope, parentScope) {
	// Inherit the parent's defaults
	const itemDefaults = parentScope
		? Object.assign({}, defaults.get(parentScope), item.defaults)
		: item.defaults;

	defaults.set(scope, itemDefaults);

	if (item.defaultRoutes) {
		routeDefaults(scope, item.defaultRoutes);
	}
}

function routeDefaults(scope, routes) {
	Object.keys(routes).forEach(property => {
		const parts = routes[property].split('.');
		const targetName = parts.pop();
		const targetScope = parts.join('.');
		defaults.route(scope, property, targetScope, targetName);
	});
}

function isIChartComponent(proto) {
	return 'id' in proto && 'defaults' in proto;
}
