/**
* DevExtreme (ui/defer_rendering.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxDeferRendering(): JQuery;
    dxDeferRendering(options: "instance"): DevExpress.ui.dxDeferRendering;
    dxDeferRendering(options: string): any;
    dxDeferRendering(options: string, ...params: any[]): any;
    dxDeferRendering(options: DevExpress.ui.dxDeferRenderingOptions): JQuery;
}
}
export default DevExpress.ui.dxDeferRendering;
export type Options = DevExpress.ui.dxDeferRenderingOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxDeferRenderingOptions;