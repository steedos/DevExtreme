/**
* DevExtreme (ui/toast.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxToast(): JQuery;
    dxToast(options: "instance"): DevExpress.ui.dxToast;
    dxToast(options: string): any;
    dxToast(options: string, ...params: any[]): any;
    dxToast(options: DevExpress.ui.dxToastOptions): JQuery;
}
}
export default DevExpress.ui.dxToast;
export type Options = DevExpress.ui.dxToastOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxToastOptions;