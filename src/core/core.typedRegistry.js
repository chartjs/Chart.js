import defaults from './core.defaults';

/**
 * @typedef {{id: string, defaults: any}} IChartComponent
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
	 */
	register(item) {
		const items = this.items;
		const id = item.id;
		if (!id) {
			throw new Error('class does not have id: ' + Object.getPrototypeOf(item));
		}
		if (id in items) {
			throw new Error(id + ' is already registered');
		}
		items[id] = item;
		if (this.scope) {
			defaults.set(this.scope, {[id]: item.defaults});
		} else {
			defaults.set(id, item.defaults);
		}
	}

	/**
	 * @param {string} id
	 * @returns {object?}
	 */
	get(id) {
		return this.items[id];
	}
}
