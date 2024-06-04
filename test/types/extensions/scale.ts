import { AnyObject } from '../../../src/types/basic.js';
import { CartesianScaleOptions, Chart, Scale } from '../../../src/types.js';

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
