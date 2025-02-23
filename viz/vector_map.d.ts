/**
* DevExtreme (viz/vector_map.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxVectorMap(): JQuery;
    dxVectorMap(options: "instance"): DevExpress.viz.dxVectorMap;
    dxVectorMap(options: string): any;
    dxVectorMap(options: string, ...params: any[]): any;
    dxVectorMap(options: DevExpress.viz.dxVectorMapOptions): JQuery;
}
}
export default DevExpress.viz.dxVectorMap;
export type Options = DevExpress.viz.dxVectorMapOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.viz.dxVectorMapOptions;