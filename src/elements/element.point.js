import Element from '../core/core.element';
import {drawPoint, _isPointInArea} from '../helpers/helpers.canvas';

function inRange(el, pos, axis, useFinalPosition) {
  const options = el.options;
  const {[axis]: value} = el.getProps([axis], useFinalPosition);

  return (Math.abs(pos - value) < options.radius + options.hitRadius);
}

export default class PointElement extends Element {

  constructor(cfg) {
    super();

    this.options = undefined;
    this.parsed = undefined;
    this.skip = undefined;
    this.stop = undefined;

    if (cfg) {
      Object.assign(this, cfg);
    }
  }

  inRange(mouseX, mouseY, useFinalPosition) {
    const options = this.options;
    const {x, y} = this.getProps(['x', 'y'], useFinalPosition);
    return ((Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)) < Math.pow(options.hitRadius + options.radius, 2));
  }

  inXRange(mouseX, useFinalPosition) {
    return inRange(this, mouseX, 'x', useFinalPosition);
  }

  inYRange(mouseY, useFinalPosition) {
    return inRange(this, mouseY, 'y', useFinalPosition);
  }

  getCenterPoint(useFinalPosition) {
    const {x, y} = this.getProps(['x', 'y'], useFinalPosition);
    return {x, y};
  }

  size(options) {
    options = options || this.options || {};
    let radius = options.radius || 0;
    radius = Math.max(radius, radius && options.hoverRadius || 0);
    const borderWidth = radius && options.borderWidth || 0;
    return (radius + borderWidth) * 2;
  }

  draw(ctx, area) {
    const options = this.options;

    if (this.skip || options.radius < 0.1 || !_isPointInArea(this, area, this.size(options) / 2)) {
      return;
    }

    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.fillStyle = options.backgroundColor;
    drawPoint(ctx, options, this.x, this.y);
  }

  getRange() {
    const options = this.options || {};
    return options.radius + options.hitRadius;
  }
}

PointElement.id = 'point';

/**
 * @type {any}
 */
PointElement.defaults = {
  borderWidth: 1,
  hitRadius: 1,
  hoverBorderWidth: 1,
  hoverRadius: 4,
  pointStyle: 'circle',
  radius: 3,
  rotation: 0
};

/**
 * @type {any}
 */
PointElement.defaultRoutes = {
  backgroundColor: 'backgroundColor',
  borderColor: 'borderColor'
};
