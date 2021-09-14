import {isNumber} from '../helpers/helpers.math';

export default class Element {

  constructor() {
    this.x = undefined;
    this.y = undefined;
    this.active = false;
    this.options = undefined;
    this.$animations = undefined;
  }

  /**
	 * @param {boolean} [useFinalPosition]
	 */
  tooltipPosition(useFinalPosition) {
    const {x, y} = this.getProps(['x', 'y'], useFinalPosition);
    return {x, y};
  }

  hasValue() {
    return isNumber(this.x) && isNumber(this.y);
  }

  /**
	 * Gets the current or final value of each prop. Can return extra properties (whole object).
	 * @param {string[]} props - properties to get
	 * @param {boolean} [final] - get the final value (animation target)
	 * @return {object}
	 */
  getProps(props, final) {
    const anims = this.$animations;
    if (!final || !anims) {
      // let's not create an object, if not needed
      return this;
    }
    const ret = {};
    props.forEach(prop => {
      ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop];
    });
    return ret;
  }
}

/**
 * @type any
 */
Element.defaults = {};

/**
 * @type any
 */
Element.defaultRoutes = undefined;
