import colorLib from '@kurkle/color';

let hue = 0;
const VRATE = 137;

const isPatternOrGradient = (value) => value instanceof CanvasGradient || value instanceof CanvasPattern;

export function color(value) {
	return isPatternOrGradient(value) ? value : colorLib(value);
}

export function getHoverColor(value) {
	return isPatternOrGradient(value)
		? value
		: colorLib(value).saturate(0.5).darken(0.1).hexString();
}

export function generatedColor(index = -1) {
	let h;
	if (index < 0) {
		h = hue;
		hue = (hue + VRATE) % 360;
	} else {
		h = (index * VRATE) % 360;
	}
	return color(`hsl(${h}, 80%, 60%)`).rgbString();
}
