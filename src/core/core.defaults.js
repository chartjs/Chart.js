import {merge, valueOrDefault} from '../helpers/helpers.core';

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
		node = node[k] || (node[k] = Object.create(null));
	}
	return node;
}

/**
 * Please use the module's default export which provides a singleton instance
 * Note: class is exported for typedoc
 */
export class Defaults {
	constructor() {
		this.backgroundColor = 'rgba(0,0,0,0.1)';
		this.borderColor = 'rgba(0,0,0,0.1)';
		this.color = '#666';
		this.controllers = {};
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
		this.hover = {
			onHover: null
		};
		this.interaction = {
			mode: 'nearest',
			intersect: true
		};
		this.maintainAspectRatio = true;
		this.onHover = null;
		this.onClick = null;
		this.plugins = {};
		this.responsive = true;
		this.scale = undefined;
		this.scales = {};
		this.showLine = true;
	}

	/**
	 * @param {string|object} scope
	 * @param {object} [values]
	 */
	set(scope, values) {
		if (typeof scope === 'string') {
			return merge(getScope(this, scope), values);
		}
		return merge(getScope(this, ''), scope);
	}

	/**
	 * @param {string} scope
	 */
	get(scope) {
		return getScope(this, scope);
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
	 * @param {string} scope Scope this route applies to.
	 * @param {string} name Property name that should be routed to different namespace when not defined here.
	 * @param {string} targetScope The namespace where those properties should be routed to.
	 * Empty string ('') is the root of defaults.
	 * @param {string} targetName The target name in the target scope the property should be routed to.
	 */
	route(scope, name, targetScope, targetName) {
		const scopeObject = getScope(this, scope);
		const targetScopeObject = getScope(this, targetScope);
		const privateName = '_' + name;

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
	}
}

// singleton instance
export default new Defaults();
