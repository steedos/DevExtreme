/**
* DevExtreme (ui/data_grid.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxDataGrid(): JQuery;
    dxDataGrid(options: "instance"): DevExpress.ui.dxDataGrid;
    dxDataGrid(options: string): any;
    dxDataGrid(options: string, ...params: any[]): any;
    dxDataGrid(options: DevExpress.ui.dxDataGridOptions): JQuery;
}
}
export default DevExpress.ui.dxDataGrid;
export type Options = DevExpress.ui.dxDataGridOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxDataGridOptions;
export type Column = DevExpress.ui.dxDataGridColumn;