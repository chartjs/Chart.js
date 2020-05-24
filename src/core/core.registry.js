import DatasetController from './core.datasetController';
import Element from './core.element';
import Scale from './core.scale';
import TypedRegistry from './core.typedRegistry';
import {each} from '../helpers/helpers.core';

class Registry {
	constructor() {
		this.controllers = new TypedRegistry(DatasetController, '');
		this.elements = new TypedRegistry(Element, 'elements');
		this.plugins = new TypedRegistry(Object, 'plugins');
		this.scales = new TypedRegistry(Scale, 'scales');
		// Order is important, Scale has Element in prototype chain,
		// so Scales must be before Elements. Plugins are a fallback, so not listed here.
		this._typedRegistries = [this.controllers, this.scales, this.elements];
	}

	_process(args, typedRegistry) {
		const me = this;
		[...args].forEach(arg => {
			const reg = typedRegistry || me._getRegistryForType(arg);
			if (reg.isForType(arg)) {
				reg.register(arg);
			} else {
				each(arg, item => {
					(typedRegistry || me._getRegistryForType(item)).register(item);
				});
			}
		});
	}

	/**
	 * @param  {...any} args
	 */
	add(...args) {
		this._process(args);
	}

	/**
	 * @param  {...typeof DatasetController} args
	 */
	addControllers(...args) {
		this._process(args, this.controllers);
	}

	/**
	 * @param  {...typeof Element} args
	 */
	addElements(...args) {
		this._process(args, this.elements);
	}

	/**
	 * @param  {...any} args
	 */
	addPlugins(...args) {
		this._process(args, this.plugins);
	}

	/**
	 * @param  {...typeof Scale} args
	 */
	addScales(...args) {
		this._process(args, this.scales);
	}

	/**
	 * @param {string} id
	 * @returns {typeof DatasetController}
	 */
	getController(id) {
		return this._get(id, this.controllers, 'controller');
	}

	/**
	 * @param {string} id
	 * @returns {typeof Element}
	 */
	getElement(id) {
		return this._get(id, this.elements, 'element');
	}

	/**
	 * @param {string} id
	 * @returns {object}
	 */
	getPlugin(id) {
		return this._get(id, this.plugins, 'plugin');
	}

	/**
	 * @param {string} id
	 * @returns {typeof Scale}
	 */
	getScale(id) {
		return this._get(id, this.scales, 'scale');
	}

	/**
	 * @private
	 */
	_getRegistryForType(type) {
		for (let i = 0; i < this._typedRegistries.length; i++) {
			const reg = this._typedRegistries[i];
			if (reg.isForType(type)) {
				return reg;
			}
		}
		// plugins is the fallback registry
		return this.plugins;
	}

	/**
	 * @private
	 */
	_get(id, typedRegistry, type) {
		const item = typedRegistry.get(id);
		if (item === undefined) {
			throw new Error('"' + id + '" is not a registered ' + type + '.');
		}
		return item;
	}

}

const registry = new Registry();
export default registry;
