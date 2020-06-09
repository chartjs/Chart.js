import defaults from './core.defaults';
import {valueOrDefault} from '../helpers/helpers.core';

/**
 * @typedef {{id: string, defaults: any, defaultRoutes: any}} IChartComponent
 */

function routeDefaults(scope, routes) {
	if (!routes) {
		return;
	}
	const routesByTargetScope = {};
	Object.keys(routes).forEach(property => {
		const target = routes[property];
		const parts = target.split('.');
		const targetName = parts.pop();
		const targetScope = parts.join('.');
		const routeDef = routesByTargetScope[targetScope] || (routesByTargetScope[targetScope] = {names: [], targetNames: []});
		routeDef.names.push(property);
		routeDef.targetNames.push(targetName);
	});
	Object.keys(routesByTargetScope).forEach(targetScope => {
		const routeDef = routesByTargetScope[targetScope];
		defaults.route(scope, routeDef.names, targetScope, routeDef.targetNames);
	});
}

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
	 * @returns {string}
	 */
	register(item, scopeOverride) {
		const proto = Object.getPrototypeOf(item);
		let protoScope;
		if ('id' in proto && 'defaults' in proto) {
			protoScope = this.register(proto);
		}

		const items = this.items;
		const id = item.id;
		const baseScope = valueOrDefault(scopeOverride, this.scope);
		const scope = baseScope ? baseScope + '.' + id : id;
		if (!id) {
			throw new Error('class does not have id: ' + Object.getPrototypeOf(item));
		}
		if (id in items) {
			return scope;
		}
		items[id] = item;

		const itemDefaults = protoScope
			? Object.assign({}, defaults.get(protoScope), item.defaults)
			: item.defaults;

		defaults.set(scope, itemDefaults);
		routeDefaults(scope, item.defaultRoutes);
		return scope;
	}

	/**
	 * @param {string} id
	 * @returns {object?}
	 */
	get(id) {
		return this.items[id];
	}
}
