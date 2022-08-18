import type {AnyObject} from '../../types/basic';
import type {Point} from '../../types/geometric';
import type {Animation} from '../../types/animation';
import {isNumber} from '../helpers/helpers.math';

export default class Element<T extends AnyObject = AnyObject, O extends AnyObject = AnyObject> {

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
  getProps<P extends (keyof T)[]>(props: P, final?: boolean): Pick<T, P[number]> {
    const anims = this.$animations;
    if (!final || !anims) {
      // let's not create an object, if not needed
      return this as Pick<T, P[number]>;
    }
    const ret: Partial<Pick<T, P[number]>> = {};
    props.forEach((prop) => {
      ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop as string];
    });
    return ret as Pick<T, P[number]>;
  }
}
