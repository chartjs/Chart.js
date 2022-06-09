import { AnyObject } from '../basic';

export function color(value: CanvasGradient): CanvasGradient;
export function color(value: CanvasPattern): CanvasPattern;
export function color(
  value:
  | string
  | { r: number; g: number; b: number; a: number }
  | [number, number, number]
  | [number, number, number, number]
): ColorModel;

export function isPatternOrGradient(value: string | AnyObject): boolean;

export interface ColorModel {
  rgbString(): string;
  hexString(): string;
  hslString(): string;
  rgb: { r: number; g: number; b: number; a: number };
  valid: boolean;
  mix(color: ColorModel, weight: number): this;
  clone(): ColorModel;
  alpha(a: number): ColorModel;
  clearer(ration: number): ColorModel;
  greyscale(): ColorModel;
  opaquer(ratio: number): ColorModel;
  negate(): ColorModel;
  lighten(ratio: number): ColorModel;
  darken(ratio: number): ColorModel;
  saturate(ratio: number): ColorModel;
  desaturate(ratio: number): ColorModel;
  rotate(deg: number): this;
}

export function getHoverColor(value: CanvasGradient): CanvasGradient;
export function getHoverColor(value: CanvasPattern): CanvasPattern;
export function getHoverColor(value: string): string;
