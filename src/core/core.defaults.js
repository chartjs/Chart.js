import {merge, isArray, valueOrDefault} from '../helpers/helpers.core';

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
 * Note: class is exported for typedoc
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
	 * Routes the named defaults to fallback to another scope/name.
	 * This routing is useful when those target values, like defaults.color, are changed runtime.
	 * If the values would be copied, the runtime change would not take effect. By routing, the
	 * fallback is evaluated at each access, so its always up to date.
	 *
	 * Examples:
	 *
	 * 	defaults.route('elements.arc', 'backgroundColor', '', 'color')
	 *   - reads the backgroundColor from defaults.color when undefined locally
	 *
	 * 	defaults.route('elements.line', ['backgroundColor', 'borderColor'], '', 'color')
	 *   - reads the backgroundColor and borderColor from defaults.color when undefined locally
	 *
	 * 	defaults.route('elements.customLine', ['borderWidth', 'tension'], 'elements.line', ['borderWidth', 'tension'])
	 *   - reads the borderWidth and tension from elements.line when those are not defined in elements.customLine
	 *
	 * @param {string} scope Scope this route applies to.
	 * @param {string[]} names Names of the properties that should be routed to different namespace when not defined here.
	 * @param {string} targetScope The namespace where those properties should be routed to. Empty string ('') is the root of defaults.
	 * @param {string|string[]} targetNames The target name/names in the target scope the properties should be routed to.
	 */
	route(scope, names, targetScope, targetNames) {
		const scopeObject = getScope(this, scope);
		const targetScopeObject = getScope(this, targetScope);
		const targetNamesIsArray = isArray(targetNames);
		names.forEach((name, index) => {
			const privateName = '_' + name;
			const targetName = targetNamesIsArray ? targetNames[index] : targetNames;
			Object.defineProperties(scopeObject, {
				// A private property is defined to hold the actual value, when this property is set in its scope (set in the setter)
				[privateName]: {
					writable: true
				},
				// The actual property is defined as getter/setter so we can do the routing when value is not locally set.
				[name]: {
					enumerable: true,
					get() {
						// @ts-ignore
						return valueOrDefault(this[privateName], targetScopeObject[targetName]);
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
