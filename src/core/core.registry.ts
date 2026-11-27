import DatasetController from './core.datasetController.js';
import Element from './core.element.js';
import Scale from './core.scale.js';
import TypedRegistry from './core.typedRegistry.js';
import {callback as call, _capitalize} from '../helpers/helpers.core.js';

/**
 * Please use the module's default export which provides a singleton instance
 * Note: class is exported for typedoc
 */
export class Registry {
  declare controllers: TypedRegistry;
  declare elements: TypedRegistry;
  declare plugins: TypedRegistry;
  declare scales: TypedRegistry;
  declare _typedRegistries: TypedRegistry[];

  constructor() {
    this.controllers = new TypedRegistry(DatasetController, 'datasets', true);
    this.elements = new TypedRegistry(Element, 'elements');
    this.plugins = new TypedRegistry(Object, 'plugins');
    this.scales = new TypedRegistry(Scale, 'scales');
    // Order is important, Scale has Element in prototype chain,
    // so Scales must be before Elements. Plugins are a fallback, so not listed here.
    this._typedRegistries = [this.controllers, this.scales, this.elements];
  }

  add(...args: any[]): void {
    this._each('register', args);
  }

  remove(...args: any[]): void {
    this._each('unregister', args);
  }

  addControllers(...args: (typeof DatasetController)[]): void {
    this._each('register', args, this.controllers);
  }

  addElements(...args: (typeof Element)[]): void {
    this._each('register', args, this.elements);
  }

  addPlugins(...args: any[]): void {
    this._each('register', args, this.plugins);
  }

  addScales(...args: (typeof Scale)[]): void {
    this._each('register', args, this.scales);
  }

  getController(id: string): typeof DatasetController {
    return this._get(id, this.controllers, 'controller');
  }

  getElement(id: string): typeof Element {
    return this._get(id, this.elements, 'element');
  }

  getPlugin(id: string): object {
    return this._get(id, this.plugins, 'plugin');
  }

  getScale(id: string): typeof Scale {
    return this._get(id, this.scales, 'scale');
  }

  removeControllers(...args: (typeof DatasetController)[]): void {
    this._each('unregister', args, this.controllers);
  }

  removeElements(...args: (typeof Element)[]): void {
    this._each('unregister', args, this.elements);
  }

  removePlugins(...args: any[]): void {
    this._each('unregister', args, this.plugins);
  }

  removeScales(...args: (typeof Scale)[]): void {
    this._each('unregister', args, this.scales);
  }

  /**
   * @internal
   */
  _each(method: 'register' | 'unregister', args: any[], typedRegistry?: TypedRegistry): void {
    [...args].forEach(arg => {
      const reg = typedRegistry || this._getRegistryForType(arg);
      if (typedRegistry || reg.isForType(arg) || (reg === this.plugins && arg.id)) {
        this._exec(method, reg, arg);
      } else if (arg && typeof arg === 'object') {
        // Handle loopable args: arrays, plain objects and module namespaces
        // Use case:
        //  import * as plugins from './plugins.js';
        //  Chart.register(plugins);
        // A native module namespace is not an object to `each()` (it is tagged
        // `[object Module]`), so spread its values out here.
        Object.values(arg).forEach(item => {
          // If there are mixed types in the loopable, make sure those are
          // registered in correct registry
          // Use case: (treemap exporting controller, elements etc)
          //  import * as treemap from 'chartjs-chart-treemap.js';
          //  Chart.register(treemap);

          const itemReg = typedRegistry || this._getRegistryForType(item);
          this._exec(method, itemReg, item);
        });
      }
    });
  }

  /**
   * @internal
   */
  _exec(method: 'register' | 'unregister', registry: TypedRegistry, component: any): void {
    const camelMethod = _capitalize(method);
    call(component['before' + camelMethod], [], component); // beforeRegister / beforeUnregister
    registry[method](component);
    call(component['after' + camelMethod], [], component); // afterRegister / afterUnregister
  }

  /**
   * @internal
   */
  _getRegistryForType(type: any): TypedRegistry {
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
   * @internal
   */
  _get(id: string, typedRegistry: TypedRegistry, type: string): any {
    const item = typedRegistry.get(id);
    if (item === undefined) {
      throw new Error('"' + id + '" is not a registered ' + type + '.');
    }
    return item;
  }

}

// singleton instance
export default /* #__PURE__ */ new Registry();
