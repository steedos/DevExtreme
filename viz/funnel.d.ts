/**
* DevExtreme (viz/funnel.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxFunnel(): JQuery;
    dxFunnel(options: "instance"): DevExpress.viz.dxFunnel;
    dxFunnel(options: string): any;
    dxFunnel(options: string, ...params: any[]): any;
    dxFunnel(options: DevExpress.viz.dxFunnelOptions): JQuery;
}
}
export default DevExpress.viz.dxFunnel;
export type Options = DevExpress.viz.dxFunnelOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.viz.dxFunnelOptions;