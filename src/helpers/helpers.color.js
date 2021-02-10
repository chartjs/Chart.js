import colorLib from '@kurkle/color';

const isPatternOrGradient = (value) => value instanceof CanvasGradient || value instanceof CanvasPattern;

export function color(value) {
  return isPatternOrGradient(value) ? value : colorLib(value);
}

export function getHoverColor(value) {
  return isPatternOrGradient(value)
    ? value
    : colorLib(value).saturate(0.5).darken(0.1).hexString();
}
