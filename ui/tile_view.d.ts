/**
* DevExtreme (ui/tile_view.d.ts)
* Version: 18.2.10
* Build date: Mon Jul 29 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxTileView(): JQuery;
    dxTileView(options: "instance"): DevExpress.ui.dxTileView;
    dxTileView(options: string): any;
    dxTileView(options: string, ...params: any[]): any;
    dxTileView(options: DevExpress.ui.dxTileViewOptions): JQuery;
}
}
export default DevExpress.ui.dxTileView;
export type Options = DevExpress.ui.dxTileViewOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxTileViewOptions;