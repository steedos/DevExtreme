/**
* DevExtreme (ui/nav_bar.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxNavBar(): JQuery;
    dxNavBar(options: "instance"): DevExpress.ui.dxNavBar;
    dxNavBar(options: string): any;
    dxNavBar(options: string, ...params: any[]): any;
    dxNavBar(options: DevExpress.ui.dxNavBarOptions): JQuery;
}
}
export default DevExpress.ui.dxNavBar;
export type Options = DevExpress.ui.dxNavBarOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxNavBarOptions;