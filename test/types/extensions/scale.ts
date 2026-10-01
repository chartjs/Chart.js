import { AnyObject } from '../../../src/types/basic.js';
import { CartesianScaleOptions, Chart, Scale } from '../../../src/types.js';
import type { ChartArea } from '../../../src/types/geometric.js';

export type TestScaleOptions = CartesianScaleOptions & {
  testOption?: boolean
}

export class TestScale<O extends TestScaleOptions = TestScaleOptions> extends Scale<O> {
  static id: 'test';

  getBasePixel(): number {
    return 0;
  }

  testMethod(): void {
    //
  }

  // The draw stages `Scale#draw` dispatches to, in order, each delegating to
  // the base implementation. See docs/developers/axes.md.
  drawBackground(): void {
    super.drawBackground();
  }

  drawGrid(chartArea: ChartArea): void {
    super.drawGrid(chartArea);
  }

  drawBorder(): void {
    super.drawBorder();
  }

  drawTitle(): void {
    super.drawTitle();
  }

  drawLabels(chartArea: ChartArea): void {
    super.drawLabels(chartArea);
  }
}

declare module '../../../src/types/index.js' {
  interface CartesianScaleTypeRegistry {
    test: {
      options: TestScaleOptions
    }
  }
}


Chart.register(TestScale);

const chart = new Chart('id', {
  type: 'line',
  data: {
    datasets: []
  },
  options: {
    scales: {
      x: {
        type: 'test',
        position: 'bottom',
        testOption: true,
        min: 0
      }
    }
  }
});

Chart.unregister([TestScale]);
