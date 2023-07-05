import animator from './core.animator.js';
import Animation from './core.animation.js';
import defaults from './core.defaults.js';
import {isArray, isObject, _splitKey} from '../helpers/helpers.core.js';

export default class Animations {
  constructor(chart, config) {
    this._chart = chart;
    this._properties = new Map();
    this._pathProperties = new Map();
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

    const pathAnimatedProps = this._pathProperties;
    loadPathOptions(animatedProps, pathAnimatedProps);
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
    const pathAnimatedProps = this._pathProperties;
    const animations = [];
    const running = target.$animations || (target.$animations = {});
    const props = Object.keys(values);
    const date = Date.now();

    const manageItem = function(tgt, vals, prop, subProp) {
      const key = subProp || prop;
      const value = vals[key];
      let animation = running[prop];
      const cfg = animatedProps.get(prop);

      if (animation) {
        if (cfg && animation.active()) {
          // There is an existing active animation, let's update that
          animation.update(cfg, value, date);
          return;
        }
        animation.cancel();
      }
      if (!cfg || !cfg.duration) {
        // not animated, set directly to new value
        tgt[key] = value;
        return;
      }
      running[prop] = animation = new Animation(cfg, tgt, key, value);
      animations.push(animation);
    };

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
      const item = pathAnimatedProps.get(prop);
      if (item) {
        const newTarget = getInnerObject(target, item);
        const newValues = newTarget && getInnerObject(values, item);
        if (newValues) {
          manageItem(newTarget, newValues, item.prop, item.key);
        }
      } else {
        manageItem(target, values, prop);
      }
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

function loadPathOptions(props, pathProps) {
  props.forEach(function(v, k) {
    const value = parserPathOptions(k);
    if (value) {
      const mapKey = value.path[0];
      const mapValue = pathProps.get(mapKey) || [];
      mapValue.push(value);
      pathProps.set(mapKey, value);
    }
  });
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

function parserPathOptions(key) {
  if (key.includes('.')) {
    return parseKeys(key, _splitKey(key));
  }
}

function parseKeys(key, keys) {
  const result = {
    prop: key,
    path: []
  };
  for (let i = 0, n = keys.length; i < n; i++) {
    const k = keys[i];
    if (!k.trim().length) { // empty string
      return;
    }
    if (i === (n - 1)) {
      result.key = k;
    } else {
      result.path.push(k);
    }
  }
  return result;
}

function getInnerObject(target, pathOpts) {
  let obj = target;
  for (const p of pathOpts.path) {
    obj = obj[p];
    if (!isObject(obj)) {
      return;
    }
  }
  return obj;
}
