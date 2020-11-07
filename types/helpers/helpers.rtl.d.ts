export interface RTLAdapter {
  x(x: number): number;
  setWidth(w: number): void;
  textAlign(align: 'center' | 'left' | 'right'): 'center' | 'left' | 'right';
  xPlus(x: number, value: number): number;
  leftForLtr(x: number, itemWidth: number): number;
}
export function getRtlAdapter(rtl: boolean, rectX: number, width: number): RTLAdapter;

export function overrideTextDirection(ctx: CanvasRenderingContext2D, direction: 'ltr' | 'rtl'): void;

export function restoreTextDirection(ctx: CanvasRenderingContext2D, original?: [string, string]): void;
