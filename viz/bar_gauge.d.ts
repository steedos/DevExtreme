/**
* DevExtreme (viz/bar_gauge.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxBarGauge(): JQuery;
    dxBarGauge(options: "instance"): DevExpress.viz.dxBarGauge;
    dxBarGauge(options: string): any;
    dxBarGauge(options: string, ...params: any[]): any;
    dxBarGauge(options: DevExpress.viz.dxBarGaugeOptions): JQuery;
}
}
export default DevExpress.viz.dxBarGauge;
export type Options = DevExpress.viz.dxBarGaugeOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.viz.dxBarGaugeOptions;