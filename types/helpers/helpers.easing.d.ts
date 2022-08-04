import { EasingFunction } from '..';

export type EasingFunctionSignature = (t: number) => number;

export const easingEffects: Record<EasingFunction, EasingFunctionSignature>;
