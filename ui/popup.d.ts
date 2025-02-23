/**
* DevExtreme (ui/popup.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxPopup(): JQuery;
    dxPopup(options: "instance"): DevExpress.ui.dxPopup;
    dxPopup(options: string): any;
    dxPopup(options: string, ...params: any[]): any;
    dxPopup(options: DevExpress.ui.dxPopupOptions): JQuery;
}
}
export default DevExpress.ui.dxPopup;
export type Options = DevExpress.ui.dxPopupOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxPopupOptions;
export type ToolbarItem = DevExpress.ui.dxPopupToolbarItem;