import type {AnyObject} from '../types/basic.js';
import type {Point} from '../types/geometric.js';
import type {Animation} from '../types/animation.js';
import {isNumber} from '../helpers/helpers.math.js';

export default class Element<T = AnyObject, O = AnyObject> {

  static defaults = {};
  static defaultRoutes = undefined;

  x: number;
  y: number;
  active = false;
  options: O;
  $animations: Record<keyof T, Animation>;

  tooltipPosition(useFinalPosition: boolean): Point {
    const {x, y} = this.getProps(['x', 'y'], useFinalPosition);
    return {x, y} as Point;
  }

  hasValue() {
    return isNumber(this.x) && isNumber(this.y);
  }

  /**
   * Gets the current or final value of each prop. Can return extra properties (whole object).
   * @param props - properties to get
   * @param [final] - get the final value (animation target)
   */
  getProps<P extends (keyof T)[]>(props: P, final?: boolean): Pick<T, P[number]>;
  getProps<P extends string>(props: P[], final?: boolean): Partial<Record<P, unknown>>;
  getProps(props: string[], final?: boolean): Partial<Record<string, unknown>> {
    const anims = this.$animations;
    if (!final || !anims) {
      // let's not create an object, if not needed
      return this as Record<string, unknown>;
    }
    const ret: Record<string, unknown> = {};
    props.forEach((prop) => {
      ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop as string];
    });
    return ret;
  }
}
