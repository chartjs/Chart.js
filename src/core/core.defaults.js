import {merge, isArray} from '../helpers/helpers.core';

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
		node = node[k] || (node[k] = {});
	}
	return node;
}

/**
 * Please use the module's default export which provides a singleton instance
 * Note: class is export for typedoc
 */
export class Defaults {
	constructor() {
		this.color = 'rgba(0,0,0,0.1)';
		this.elements = {};
		this.events = [
			'mousemove',
			'mouseout',
			'click',
			'touchstart',
			'touchmove'
		];
		this.font = {
			color: '#666',
			family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			size: 12,
			style: 'normal',
			lineHeight: 1.2,
			weight: null,
			lineWidth: 0,
			strokeStyle: undefined
		};
		this.hover = {
			onHover: null,
			mode: 'nearest',
			intersect: true
		};
		this.maintainAspectRatio = true;
		this.onClick = null;
		this.responsive = true;
		this.showLines = true;
		this.plugins = undefined;
		this.scale = undefined;
		this.legend = undefined;
		this.title = undefined;
		this.tooltips = undefined;
		this.doughnut = undefined;
		this._routes = {};
	}
	/**
	 * @param {string} scope
	 * @param {*} values
	 */
	set(scope, values) {
		return merge(getScope(this, scope), values);
	}

	/**
	 * Routes the named defaults to fallback to another scope/name
	 * Examples:
	 * 	defaults.route('elements.arc', 'backgroundColor', '', 'color')
	 * 	defaults.route('elements.line', ['backgroundColor', 'borderColor'], '', 'color')
	 * 	defaults.route('elements.customLine', ['borderWidth', 'tension'], 'elements.line', ['borderWidth', 'tension'])
	 * @param {string} scope
	 * @param {string[]} names
	 * @param {string} targetScope
	 * @param {string|string[]} targetNames
	 */
	route(scope, names, targetScope, targetNames) {
		const scopeObject = getScope(this, scope);
		const targetScopeObject = getScope(this, targetScope);
		const targetNamesIsArray = isArray(targetNames);
		names.forEach((name, index) => {
			const privateName = '_' + name;
			Object.defineProperties(scopeObject, {
				[privateName]: {
					writable: true
				},
				[name]: {
					enumerable: true,
					get() {
						// @ts-ignore
						return this[privateName] !== undefined ? this[privateName] : targetScopeObject[targetNamesIsArray ? targetNames[index] : targetNames];
					},
					set(value) {
						this[privateName] = value;
					}
				}
			});
		});
	}
}

// singleton instance
export default new Defaults();
