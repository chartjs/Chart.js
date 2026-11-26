import animator from './core.animator.js';
import Animation from './core.animation.js';
import defaults from './core.defaults.js';
import {isArray, isFunction, isObject} from '../helpers/helpers.core.js';
import {_descriptors} from '../helpers/helpers.config.js';

export default class Animations {
  constructor(chart, config) {
    this._chart = chart;
    this._properties = new Map();
    this.configure(config);
  }

  configure(config) {
    if (!isObject(config)) {
      return;
    }

    const animationOptions = Object.keys(defaults.animation);
    const animatedProps = this._properties;

    Object.getOwnPropertyNames(config).forEach(key => {
      const cfg = config[key];
      if (!isObject(cfg)) {
        return;
      }
      const resolved = {};
      for (const option of animationOptions) {
        resolved[option] = cfg[option];
      }

      (isArray(cfg.properties) && cfg.properties || [key]).forEach((prop) => {
        if (prop === key || !animatedProps.has(prop)) {
          animatedProps.set(prop, resolved);
        }
      });
    });
  }

  /**
	 * Utility to handle animation of `options`.
	 * @private
	 */
  _animateOptions(target, values) {
    const newOptions = values.options;
    const options = resolveTargetOptions(target, newOptions);
    if (!options) {
      return [];
    }

    const animations = this._createAnimations(options, newOptions);
    if (newOptions.$shared) {
      // Going to shared options:
      // After all animations are done, assign the shared options object to the element
      // So any new updates to the shared options are observed
      awaitAll(target.options.$animations, newOptions).then(() => {
        target.options = newOptions;
      }, () => {
        // rejected, noop
      });
    }

    return animations;
  }

  /**
	 * @private
	 */
  _createAnimations(target, values) {
    const animatedProps = this._properties;
    const animations = [];
    const running = target.$animations || (target.$animations = {});
    const props = Object.keys(values);
    const date = Date.now();
    let i;

    for (i = props.length - 1; i >= 0; --i) {
      const prop = props[i];
      if (prop.charAt(0) === '$') {
        continue;
      }

      if (prop === 'options') {
        animations.push(...this._animateOptions(target, values));
        continue;
      }
      const value = values[prop];
      let animation = running[prop];
      const cfg = animatedProps.get(prop);

      if (animation) {
        if (cfg && animation.active()) {
          // There is an existing active animation, let's update that
          animation.update(cfg, value, date);
          continue;
        } else {
          animation.cancel();
        }
      }
      if (!cfg || !cfg.duration) {
        // not animated, set directly to new value
        target[prop] = value;
        continue;
      }

      running[prop] = animation = new Animation(cfg, target, prop, value);
      animations.push(animation);
    }
    return animations;
  }


  /**
	 * Update `target` properties to new values, using configured animations
	 * @param {object} target - object to update
	 * @param {object} values - new target properties
	 * @returns {boolean|undefined} - `true` if animations were started
	 **/
  update(target, values) {
    if (this._properties.size === 0) {
      // Nothing is animated, just apply the new values.
      Object.assign(target, values);
      return;
    }

    const animations = this._createAnimations(target, values);

    if (animations.length) {
      animator.add(this._chart, animations);
      return true;
    }
  }
}

/**
 * Whether an option resolves through the context: a scriptable function or an indexable array
 */
function readsContext(descriptors, prop, value) {
  return (descriptors.isScriptable(prop) && isFunction(value))
    || (descriptors.isIndexable(prop) && isArray(value));
}

/**
 * Whether the `animations` of a resolver would resolve differently with an element's context.
 * Checks the options that `Animations.configure` reads, with the descriptors
 * that a resolver with a context would use for them. Not `needContext` of the config:
 * it counts any function in an object, so callbacks like `onComplete` would stop the sharing.
 * @param {object} resolver - options resolver without a context
 * @returns {boolean}
 * @private
 */
export function _animationsNeedContext(resolver) {
  const descriptors = _descriptors(resolver);
  const config = resolver.animations;
  if (readsContext(descriptors, 'animations', config)) {
    return true;
  }
  if (!isObject(config)) {
    return false;
  }

  const configDescriptors = _descriptors(/** @type {any} */ (config), descriptors);
  const options = [...Object.keys(defaults.animation), 'properties'];
  for (const key of Object.getOwnPropertyNames(config)) {
    const cfg = config[key];
    if (readsContext(configDescriptors, key, cfg)) {
      return true;
    }
    if (!isObject(cfg)) {
      continue;
    }
    const cfgDescriptors = _descriptors(/** @type {any} */ (cfg), configDescriptors);
    for (const option of options) {
      if (readsContext(cfgDescriptors, option, cfg[option])) {
        return true;
      }
    }
  }
  return false;
}

function awaitAll(animations, properties) {
  const running = [];
  const keys = Object.keys(properties);
  for (let i = 0; i < keys.length; i++) {
    const anim = animations[keys[i]];
    if (anim && anim.active()) {
      running.push(anim.wait());
    }
  }
  // @ts-ignore
  return Promise.all(running);
}

function resolveTargetOptions(target, newOptions) {
  if (!newOptions) {
    return;
  }
  let options = target.options;
  if (!options) {
    target.options = newOptions;
    return;
  }
  if (options.$shared) {
    // Going from shared options to distinct one:
    // Create new options object containing the old shared values and start updating that.
    target.options = options = Object.assign({}, options, {$shared: false, $animations: {}});
  }
  return options;
}
