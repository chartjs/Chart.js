import { EasingFunction } from '../core/interfaces';

export type EasingFunctionSignature = (t: number) => number;

export const easing: Record<EasingFunction, EasingFunctionSignature>;
