import { EasingFunction } from '../core/interfaces';

export type EasingFunctionSignature = (t: number) => number;

export const easingEffects: Record<EasingFunction, EasingFunctionSignature>;
