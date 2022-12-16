import type { LayoutPosition } from '../../../src/types.js';

const left: LayoutPosition = 'left';
const right: LayoutPosition = 'right';
const top: LayoutPosition = 'top';
const bottom: LayoutPosition = 'bottom';
const center: LayoutPosition = 'center';
const axis: LayoutPosition = { x: 10 };

// @ts-expect-error invalid position
const invalid: LayoutPosition = 'none';
