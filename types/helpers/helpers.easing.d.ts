import { EasingFunction } from '..';

export type EasingFunctionSignature = (t: number) => number;

export declare const easingEffects: Record<EasingFunction, EasingFunctionSignature>;
