
export interface IEvent {
	/**
	 * The event type name.
	 */
	type: ('contextmenu' | 'mouseenter' | 'mousedown' | 'mousemove' | 'mouseup' | 'mouseout' | 'click' | 'dblclick' | 'keydown' | 'keypress' | 'keyup' | 'resize'),

	/**
	 * The original native event (null for emulated events, e.g. 'resize')
	 */
	native: Event,

	/**
	 * The mouse x position, relative to the canvas (null for incompatible events)
	 */
	x: number,

	/**
	 * The mouse y position, relative to the canvas (null for incompatible events)
	 */
	y: number
}