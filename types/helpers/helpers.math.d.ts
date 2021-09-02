export function log10(x: number): number;
export function isNumber(v: unknown): boolean;
export function almostEquals(x: number, y: number, epsilon: number): boolean;
export function almostWhole(x: number, epsilon: number): number;
export function sign(x: number): number;
export function niceNum(range: number): number;
export function toRadians(degrees: number): number;
export function toDegrees(radians: number): number;
/**
 * Gets the angle from vertical upright to the point about a centre.
 */
export function getAngleFromPoint(
	centrePoint: { x: number; y: number },
	anglePoint: { x: number; y: number }
): { angle: number; distance: number };

export function distanceBetweenPoints(pt1: { x: number; y: number }, pt2: { x: number; y: number }): number;
