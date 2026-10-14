import { RadarController, RadialLinearScale, UpdateMode, Element } from '../../../src/types.js';

class CustomRadarController extends RadarController {
  override updateElements(points: Element[], start: number, count: number, mode: UpdateMode) {
    const scale = this.getScaleForId('r') as RadialLinearScale;

    for (let i = start; i < start + count; i++) {
      const r: number = this.getParsed(i).r;
      const position = scale.getPointPositionForValue(i, r);
      this.updateElement(points[i], i, { x: position.x, y: position.y }, mode);
    }
  }
}

export default CustomRadarController;
