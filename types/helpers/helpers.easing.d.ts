import { EasingFunction } from '../index.esm';

export type EasingFunctionSignature = (t: number) => number;

export const easingEffects: Record<EasingFunction, EasingFunctionSignature>;
