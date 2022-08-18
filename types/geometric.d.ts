export interface ChartArea {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export type TRBL = {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type TRBLCorners = {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
};

export type CornerRadius = number | Partial<TRBLCorners>;

export type RoundedRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: CornerRadius
}

export type Padding = Partial<TRBL> | number | Point;
