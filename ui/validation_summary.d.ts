/**
* DevExtreme (ui/validation_summary.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxValidationSummary(): JQuery;
    dxValidationSummary(options: "instance"): DevExpress.ui.dxValidationSummary;
    dxValidationSummary(options: string): any;
    dxValidationSummary(options: string, ...params: any[]): any;
    dxValidationSummary(options: DevExpress.ui.dxValidationSummaryOptions): JQuery;
}
}
export default DevExpress.ui.dxValidationSummary;
export type Options = DevExpress.ui.dxValidationSummaryOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxValidationSummaryOptions;