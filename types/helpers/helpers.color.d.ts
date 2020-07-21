export function color(value: CanvasGradient): CanvasGradient;
export function color(value: CanvasPattern): CanvasPattern;

export interface Color {
  rgbString(): string;
  hexString(): string;
  hslString(): string;
  rgb: { r: number; g: number; b: number; a: number };
  valid: boolean;
  mix(color: Color, weight: number): this;
  clone(): Color;
  alpha(a: number): Color;
  clearer(ration: number): Color;
  greyscale(): Color;
  opaquer(ratio: number): Color;
  negate(): Color;
  lighten(ratio: number): Color;
  darken(ratio: number): Color;
  saturate(ratio: number): Color;
  desaturate(ratio: number): Color;
  rotate(deg: number): this;
}
export function color(
  value:
    | string
    | { r: number; g: number; b: number; a: number }
    | [number, number, number]
    | [number, number, number, number]
): Color;

export function getHoverColor(value: CanvasGradient): CanvasGradient;
export function getHoverColor(value: CanvasPattern): CanvasPattern;
export function getHoverColor(value: string): string;
