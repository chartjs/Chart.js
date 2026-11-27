import type Chart from '../core/core.controller.js';
import type Config from '../core/core.config.js';

export type {Chart};

/**
 * Abstract class that allows abstracting platform dependencies away from the chart.
 */
export default class BasePlatform {
  /**
	 * Called at chart construction time, returns a context2d instance implementing
	 * the [W3C Canvas 2D Context API standard]{@link https://www.w3.org/TR/2dcontext/}.
	 * @param canvas - The canvas from which to acquire context (platform specific)
	 * @param aspectRatio - The chart options
	 */
  acquireContext(_canvas: HTMLCanvasElement, _aspectRatio?: number): CanvasRenderingContext2D | null {
    return undefined;
  }

  /**
	 * Called at chart destruction time, releases any resources associated to the context
	 * previously returned by the acquireContext() method.
	 * @param context - The context2d instance
	 * @returns true if the method succeeded, else false
	 */
  releaseContext(_context: CanvasRenderingContext2D): boolean {
    return false;
  }

  /**
	 * Registers the specified listener on the given chart.
	 * @param chart - Chart from which to listen for event
	 * @param type - The ({@link ChartEvent}) type to listen for
	 * @param listener - Receives a notification (an object that implements
	 * the {@link ChartEvent} interface) when an event of the specified type occurs.
	 */
  // The listeners take different arguments per event type, so `Function` is kept from the JSDoc.
  // eslint-disable-next-line @typescript-eslint/ban-types
  addEventListener(_chart: Chart, _type: string, _listener: Function): void {}

  /**
	 * Removes the specified listener previously registered with addEventListener.
	 * @param chart - Chart from which to remove the listener
	 * @param type - The ({@link ChartEvent}) type to remove
	 * @param listener - The listener function to remove from the event target.
	 */
  // eslint-disable-next-line @typescript-eslint/ban-types
  removeEventListener(_chart: Chart, _type: string, _listener: Function): void {}

  /**
	 * @returns the current devicePixelRatio of the device this platform is connected to.
	 */
  getDevicePixelRatio(): number {
    return 1;
  }

  /**
	 * Returns the maximum size in pixels of given canvas element.
	 * @param element
	 * @param width - content width of parent element
	 * @param height - content height of parent element
	 * @param aspectRatio - aspect ratio to maintain
	 */
  getMaximumSize(element: HTMLCanvasElement, width?: number, height?: number, aspectRatio?: number): {width: number, height: number} {
    width = Math.max(0, width || element.width);
    height = height || element.height;
    return {
      width,
      height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
    };
  }

  /**
	 * @param canvas
	 * @returns true if the canvas is attached to the platform, false if not.
	 */
  isAttached(_canvas: HTMLCanvasElement): boolean {
    return true;
  }

  /**
   * Updates config with platform specific requirements
   * @param config
   */
  updateConfig(_config: Config): void {
    // no-op
  }
}
