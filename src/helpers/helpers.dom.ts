import type {ChartArea, Scale} from '../types/index.js';
import type Chart from '../core/core.controller.js';
import type {ChartEvent} from '../types.js';
import {INFINITY} from './helpers.math.js';

/**
 * Note: typedefs are auto-exported, so use a made-up `dom` namespace where
 * necessary to avoid duplicates with `export * from './helpers`; see
 * https://github.com/microsoft/TypeScript/issues/46011
 * @typedef { import('../core/core.controller.js').default } dom.Chart
 * @typedef { import('../../types').ChartEvent } ChartEvent
 */

/**
 * @private
 */
export function _isDomSupported(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * @private
 */
export function _getParentNode(domNode: HTMLCanvasElement): HTMLCanvasElement {
  let parent = domNode.parentNode;
  if (parent && parent.toString() === '[object ShadowRoot]') {
    parent = (parent as ShadowRoot).host;
  }
  return parent as HTMLCanvasElement;
}

/**
 * convert max-width/max-height values that may be percentages into a number
 * @private
 */

function parseMaxStyle(styleValue: string | number, node: HTMLElement, parentProperty: string) {
  let valueInPixels: number;
  if (typeof styleValue === 'string') {
    valueInPixels = parseInt(styleValue, 10);

    if (styleValue.indexOf('%') !== -1) {
      // percentage * size in dimension
      valueInPixels = (valueInPixels / 100) * node.parentNode[parentProperty];
    }
  } else {
    valueInPixels = styleValue;
  }

  return valueInPixels;
}

const getComputedStyle = (element: HTMLElement): CSSStyleDeclaration =>
  element.ownerDocument.defaultView.getComputedStyle(element, null);

export function getStyle(el: HTMLElement, property: string): string {
  return getComputedStyle(el).getPropertyValue(property);
}

const positions = ['top', 'right', 'bottom', 'left'];
function getPositionedStyle(styles: CSSStyleDeclaration, style: string, suffix?: string): ChartArea {
  const result = {} as ChartArea;
  suffix = suffix ? '-' + suffix : '';
  for (let i = 0; i < 4; i++) {
    const pos = positions[i];
    result[pos] = parseFloat(styles[style + '-' + pos + suffix]) || 0;
  }
  result.width = result.left + result.right;
  result.height = result.top + result.bottom;
  return result;
}

const useOffsetPos = (x: number, y: number, target: HTMLElement | EventTarget) =>
  (x > 0 || y > 0) && (!target || !(target as HTMLElement).shadowRoot);

/**
 * @param e
 * @param canvas
 * @returns Canvas position
 */
function getCanvasPosition(
  e: Event | TouchEvent | MouseEvent,
  canvas: HTMLCanvasElement
): {
    x: number;
    y: number;
    box: boolean;
  } {
  const touches = (e as TouchEvent).touches;
  const source = (touches && touches.length ? touches[0] : e) as MouseEvent;
  const {offsetX, offsetY} = source as MouseEvent;
  let box = false;
  let x, y;
  if (useOffsetPos(offsetX, offsetY, e.target)) {
    x = offsetX;
    y = offsetY;
  } else {
    const rect = canvas.getBoundingClientRect();
    x = source.clientX - rect.left;
    y = source.clientY - rect.top;
    box = true;
  }
  return {x, y, box};
}

/**
 * Gets an event's x, y coordinates, relative to the chart area
 * @param event
 * @param chart
 * @returns x and y coordinates of the event
 */

export function getRelativePosition(
  event: Event | ChartEvent | TouchEvent | MouseEvent,
  chart: Chart
): { x: number; y: number } {
  if ('native' in event) {
    return event;
  }

  const {canvas, currentDevicePixelRatio} = chart;
  const style = getComputedStyle(canvas);
  const borderBox = style.boxSizing === 'border-box';
  const paddings = getPositionedStyle(style, 'padding');
  const borders = getPositionedStyle(style, 'border', 'width');
  const {x, y, box} = getCanvasPosition(event, canvas);
  const xOffset = paddings.left + (box && borders.left);
  const yOffset = paddings.top + (box && borders.top);

  let {width, height} = chart;
  if (borderBox) {
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  return {
    x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio),
    y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio)
  };
}

function getContainerSize(canvas: HTMLCanvasElement, width: number, height: number): Partial<Scale> {
  let maxWidth: number, maxHeight: number;

  if (width === undefined || height === undefined) {
    const container = _getParentNode(canvas);
    if (!container) {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
    } else {
      const rect = container.getBoundingClientRect(); // this is the border box of the container
      const containerStyle = getComputedStyle(container);
      const containerBorder = getPositionedStyle(containerStyle, 'border', 'width');
      const containerPadding = getPositionedStyle(containerStyle, 'padding');
      width = rect.width - containerPadding.width - containerBorder.width;
      height = rect.height - containerPadding.height - containerBorder.height;
      maxWidth = parseMaxStyle(containerStyle.maxWidth, container, 'clientWidth');
      maxHeight = parseMaxStyle(containerStyle.maxHeight, container, 'clientHeight');
    }
  }
  return {
    width,
    height,
    maxWidth: maxWidth || INFINITY,
    maxHeight: maxHeight || INFINITY
  };
}

const round1 = (v: number) => Math.round(v * 10) / 10;

// eslint-disable-next-line complexity
export function getMaximumSize(
  canvas: HTMLCanvasElement,
  bbWidth?: number,
  bbHeight?: number,
  aspectRatio?: number
): { width: number; height: number } {
  const style = getComputedStyle(canvas);
  const margins = getPositionedStyle(style, 'margin');
  const maxWidth = parseMaxStyle(style.maxWidth, canvas, 'clientWidth') || INFINITY;
  const maxHeight = parseMaxStyle(style.maxHeight, canvas, 'clientHeight') || INFINITY;
  const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
  let {width, height} = containerSize;

  if (style.boxSizing === 'content-box') {
    const borders = getPositionedStyle(style, 'border', 'width');
    const paddings = getPositionedStyle(style, 'padding');
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  width = Math.max(0, width - margins.width);
  height = Math.max(0, aspectRatio ? width / aspectRatio : height - margins.height);
  width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
  height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
  if (width && !height) {
    // https://github.com/chartjs/Chart.js/issues/4659
    // If the canvas has width, but no height, default to aspectRatio of 2 (canvas default)
    height = round1(width / 2);
  }

  const maintainHeight = bbWidth !== undefined || bbHeight !== undefined;

  if (maintainHeight && aspectRatio && containerSize.height && height > containerSize.height) {
    height = containerSize.height;
    width = round1(Math.floor(height * aspectRatio));
  }

  return {width, height};
}

/**
 * @param chart
 * @param forceRatio
 * @param forceStyle
 * @returns True if the canvas context size or transformation has changed.
 */
export function retinaScale(
  chart: Chart,
  forceRatio: number,
  forceStyle?: boolean
): boolean | void {
  const pixelRatio = forceRatio || 1;
  const deviceHeight = Math.floor(chart.height * pixelRatio);
  const deviceWidth = Math.floor(chart.width * pixelRatio);

  chart.height = Math.floor(chart.height);
  chart.width = Math.floor(chart.width);

  const canvas = chart.canvas;

  // If no style has been set on the canvas, the render size is used as display size,
  // making the chart visually bigger, so let's enforce it to the "correct" values.
  // See https://github.com/chartjs/Chart.js/issues/3575
  if (canvas.style && (forceStyle || (!canvas.style.height && !canvas.style.width))) {
    canvas.style.height = `${chart.height}px`;
    canvas.style.width = `${chart.width}px`;
  }

  if (chart.currentDevicePixelRatio !== pixelRatio
      || canvas.height !== deviceHeight
      || canvas.width !== deviceWidth) {
    chart.currentDevicePixelRatio = pixelRatio;
    canvas.height = deviceHeight;
    canvas.width = deviceWidth;
    chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return true;
  }
  return false;
}

/**
 * Detects support for options object argument in addEventListener.
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
 * @private
 */
export const supportsEventListenerOptions = (function() {
  let passiveSupported = false;
  try {
    const options = {
      get passive() { // This function will be called when the browser attempts to access the passive property.
        passiveSupported = true;
        return false;
      }
    } as EventListenerOptions;

    window.addEventListener('test', null, options);
    window.removeEventListener('test', null, options);
  } catch (e) {
    // continue regardless of error
  }
  return passiveSupported;
}());

/**
 * The "used" size is the final value of a dimension property after all calculations have
 * been performed. This method uses the computed style of `element` but returns undefined
 * if the computed style is not expressed in pixels. That can happen in some cases where
 * `element` has a size relative to its parent and this last one is not yet displayed,
 * for example because of `display: none` on a parent node.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 * @returns Size in pixels or undefined if unknown.
 */

export function readUsedSize(
  element: HTMLElement,
  property: 'width' | 'height'
): number | undefined {
  const value = getStyle(element, property);
  const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
  return matches ? +matches[1] : undefined;
}
