'use strict';

import Color from 'chartjs-color';

export const color = !Color ?
	function(value) {
		console.error('Color.js not found!');
		return value;
	} :
	function(value) {
		if (value instanceof CanvasGradient || value instanceof CanvasPattern) {
			// TODO: figure out what this should be. Previously returned
			// the default color
			return value;
		}

		return Color(value);
	};

export function getHoverColor(colorValue) {
	return (colorValue instanceof CanvasPattern || colorValue instanceof CanvasGradient) ?
		colorValue :
		color(colorValue).saturate(0.5).darken(0.1).rgbString();
}
