import colorLib from '@kurkle/color';

/**
 * @param {string | CanvasGradient | CanvasPattern} value
 */
const isPatternOrGradiend = (value) => value instanceof CanvasGradient || value instanceof CanvasPattern;

/**
 * @param {string|CanvasGradient|CanvasPattern} value
 * @return {CanvasGradient|CanvasPattern|colorLib}
 */
export function color(value) {
	return isPatternOrGradiend(value) ? value : colorLib(value);
}

/**
 * @param {string|CanvasGradient|CanvasPattern} value
 * @return {string|CanvasGradient|CanvasPattern}
 */
export function getHoverColor(value) {
	return isPatternOrGradiend(value)
		? value
		: colorLib(value).saturate(0.5).darken(0.1).hexString();
}
