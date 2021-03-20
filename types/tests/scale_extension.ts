import { Chart, Scale } from '../index.esm';

export class TestScale extends Scale {
  static id: 'test';

  getBasePixel(): number {
    return 0;
  }

  testMethod(): void {
    //
  }
}

Chart.register(TestScale);
Chart.unregister([TestScale]);
