/**
* DevExtreme (ui/slide_out.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxSlideOut(): JQuery;
    dxSlideOut(options: "instance"): DevExpress.ui.dxSlideOut;
    dxSlideOut(options: string): any;
    dxSlideOut(options: string, ...params: any[]): any;
    dxSlideOut(options: DevExpress.ui.dxSlideOutOptions): JQuery;
}
}
export default DevExpress.ui.dxSlideOut;
export type Options = DevExpress.ui.dxSlideOutOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxSlideOutOptions;