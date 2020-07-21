export interface IPoint {
    x: number;
    y: number;
}

export interface IChartComponent {
    id: string;
    defaults?: any;
    defaultRoutes?: { [property: string]: string };

    beforeRegister?(): void;
    afterRegister?(): void;
    beforeUnregister?(): void;
    afterUnregister?(): void;
}

export declare type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface IChartArea {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

export interface IChartDataset {
    // TODO
}

export interface IChartConfiguration {
    // TODO
}

export interface IChartData {
    // TODO
}

export interface IChartOptions {
    // TODO
}