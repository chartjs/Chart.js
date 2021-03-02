import { LayoutPosition } from '../../index.esm';

export const left: LayoutPosition = 'left';
export const right: LayoutPosition = 'right';
export const top: LayoutPosition = 'top';
export const bottom: LayoutPosition = 'bottom';
export const center: LayoutPosition = 'center';
export const axis: LayoutPosition = { x: 10 };

// @ts-expect-error invalid position
export const invalid: LayoutPosition = 'none';
