'use strict';

import colorLib from 'chartjs-color';

export function color(value) {
	if (value instanceof CanvasGradient || value instanceof CanvasPattern) {
		// TODO: figure out what this should be. Previously returned
		// the default color
		return value;
	}

	return colorLib(value);
}

export function getHoverColor(colorValue) {
	return (colorValue instanceof CanvasPattern || colorValue instanceof CanvasGradient) ?
		colorValue :
		colorLib(colorValue).saturate(0.5).darken(0.1).rgbString();
}

export default color;
