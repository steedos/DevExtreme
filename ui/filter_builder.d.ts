/**
* DevExtreme (ui/filter_builder.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxFilterBuilder(): JQuery;
    dxFilterBuilder(options: "instance"): DevExpress.ui.dxFilterBuilder;
    dxFilterBuilder(options: string): any;
    dxFilterBuilder(options: string, ...params: any[]): any;
    dxFilterBuilder(options: DevExpress.ui.dxFilterBuilderOptions): JQuery;
}
}
export default DevExpress.ui.dxFilterBuilder;
export type Options = DevExpress.ui.dxFilterBuilderOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxFilterBuilderOptions;