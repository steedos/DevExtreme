/**
* DevExtreme (viz/sparkline.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxSparkline(): JQuery;
    dxSparkline(options: "instance"): DevExpress.viz.dxSparkline;
    dxSparkline(options: string): any;
    dxSparkline(options: string, ...params: any[]): any;
    dxSparkline(options: DevExpress.viz.dxSparklineOptions): JQuery;
}
}
export default DevExpress.viz.dxSparkline;
export type Options = DevExpress.viz.dxSparklineOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.viz.dxSparklineOptions;