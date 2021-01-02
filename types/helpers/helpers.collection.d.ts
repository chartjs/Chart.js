export interface ArrayListener<T> {
	_onDataPush?(...item: T[]): void;
	_onDataPop?(): void;
	_onDataShift?(): void;
	_onDataSplice?(index: number, deleteCount: number, ...items: T[]): void;
	_onDataUnshift?(...item: T[]): void;
}

/**
 * Hooks the array methods that add or remove values ('push', pop', 'shift', 'splice',
 * 'unshift') and notify the listener AFTER the array has been altered. Listeners are
 * called on the '_onData*' callbacks (e.g. _onDataPush, etc.) with same arguments.
 */
export function listenArrayEvents<T>(array: T[], listener: ArrayListener<T>): void;

/**
 * Removes the given array event listener and cleanup extra attached properties (such as
 * the _chartjs stub and overridden methods) if array doesn't have any more listeners.
 */
export function unlistenArrayEvents<T>(array: T[], listener: ArrayListener<T>): void;
