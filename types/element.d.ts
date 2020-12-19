import { Point } from './geometric';

export interface Element<T = {}, O = {}> {
	readonly x: number;
	readonly y: number;
	readonly active: boolean;
	readonly options: O;

	tooltipPosition(useFinalPosition?: boolean): Point;
	hasValue(): boolean;
	getProps<P extends keyof T>(props: [P], final?: boolean): Pick<T, P>;
	getProps<P extends keyof T, P2 extends keyof T>(props: [P, P2], final?: boolean): Pick<T, P | P2>;
	getProps<P extends keyof T, P2 extends keyof T, P3 extends keyof T>(
		props: [P, P2, P3],
		final?: boolean
	): Pick<T, P | P2 | P3>;
	getProps<P extends keyof T, P2 extends keyof T, P3 extends keyof T, P4 extends keyof T>(
		props: [P, P2, P3, P4],
		final?: boolean
	): Pick<T, P | P2 | P3 | P4>;
	getProps<P extends keyof T, P2 extends keyof T, P3 extends keyof T, P4 extends keyof T, P5 extends keyof T>(
		props: [P, P2, P3, P4, P5],
		final?: boolean
	): Pick<T, P | P2 | P3 | P4 | P5>;
	getProps(props: (keyof T)[], final?: boolean): T;
}
export const Element: {
	prototype: Element;
	new <T = {}, O = {}>(): Element<T, O>;
};
