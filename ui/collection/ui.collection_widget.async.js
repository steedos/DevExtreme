/**
 * DevExtreme (ui/collection/ui.collection_widget.async.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiCollection_widget = require("./ui.collection_widget.edit");
var _uiCollection_widget2 = _interopRequireDefault(_uiCollection_widget);
var _deferred = require("../../core/utils/deferred");
var _common = require("../../core/utils/common");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var AsyncCollectionWidget = _uiCollection_widget2.default.inherit({
    _initMarkup: function() {
        this._deferredItems = [];
        this.callBase()
    },
    _renderItemContent: function(args) {
        var renderContentDeferred = new _deferred.Deferred,
            itemDeferred = new _deferred.Deferred,
            that = this;
        this._deferredItems[args.index] = itemDeferred;
        var $itemContent = this.callBase.call(that, args);
        itemDeferred.done(function() {
            renderContentDeferred.resolve($itemContent)
        });
        return renderContentDeferred.promise()
    },
    _createItemByTemplate: function(itemTemplate, renderArgs) {
        var _this = this;
        return itemTemplate.render({
            model: renderArgs.itemData,
            container: renderArgs.container,
            index: renderArgs.index,
            onRendered: function() {
                _this._deferredItems[renderArgs.index].resolve()
            }
        })
    },
    _postProcessRenderItems: _common.noop,
    _renderItemsAsync: function() {
        var _this2 = this;
        var d = new _deferred.Deferred;
        _deferred.when.apply(this, this._deferredItems).done(function() {
            _this2._postProcessRenderItems();
            d.resolve()
        });
        return d.promise()
    },
    _clean: function() {
        this.callBase();
        this._deferredItems = []
    }
});
module.exports = AsyncCollectionWidget;
