import { EasingFunction } from '../index.shakeable.esm';

export type EasingFunctionSignature = (t: number) => number;

export const easingEffects: Record<EasingFunction, EasingFunctionSignature>;
