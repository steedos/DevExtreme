/**
 * DevExtreme (ui/collection/ui.collection_widget.live_update.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _uiCollection_widget = require("./ui.collection_widget.edit");
var _uiCollection_widget2 = _interopRequireDefault(_uiCollection_widget);
var _extend = require("../../core/utils/extend");
var _type = require("../../core/utils/type");
var _array_utils = require("../../data/array_utils");
var _array_utils2 = _interopRequireDefault(_array_utils);
var _utils = require("../../data/utils");
var _deferred = require("../../core/utils/deferred");
var _array_compare = require("../../core/utils/array_compare");
var _dom_adapter = require("../../core/dom_adapter");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
exports.default = _uiCollection_widget2.default.inherit({
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            repaintChangesOnly: false
        })
    },
    ctor: function() {
        var _this = this;
        this.callBase.apply(this, arguments);
        this._customizeStoreLoadOptions = function(e) {
            var dataSource = _this._dataSource;
            if (dataSource && !dataSource.isLoaded()) {
                _this._correctionIndex = 0
            }
            if (_this._correctionIndex && e.storeLoadOptions) {
                e.storeLoadOptions.skip += _this._correctionIndex
            }
        }, this._dataSource && this._dataSource.on("customizeStoreLoadOptions", this._customizeStoreLoadOptions)
    },
    reload: function() {
        this._correctionIndex = 0
    },
    _init: function() {
        this.callBase();
        this._refreshItemsCache();
        this._correctionIndex = 0
    },
    _findItemElementByKey: function(key) {
        var _this2 = this;
        var result = (0, _renderer2.default)();
        var keyExpr = this.key();
        this.itemElements().each(function(_, item) {
            var $item = (0, _renderer2.default)(item),
                itemData = _this2._getItemData($item);
            if (keyExpr ? (0, _utils.keysEqual)(keyExpr, _this2.keyOf(itemData), key) : _this2._isItemEquals(itemData, key)) {
                result = $item;
                return false
            }
        });
        return result
    },
    _dataSourceChangedHandler: function(newItems, e) {
        e && e.changes ? this._modifyByChanges(e.changes) : this.callBase(newItems, e)
    },
    _isItemEquals: function(item1, item2) {
        try {
            return JSON.stringify(item1) === JSON.stringify(item2)
        } catch (e) {
            return item1 === item2
        }
    },
    _partialRefresh: function() {
        if (this.option("repaintChangesOnly")) {
            var result = (0, _array_compare.findChanges)(this._itemsCache, this._editStrategy.itemsGetter(), this.keyOf.bind(this), this._isItemEquals);
            if (result) {
                this._modifyByChanges(result, true);
                this._renderEmptyMessage();
                return true
            } else {
                this._refreshItemsCache()
            }
        }
        return false
    },
    _refreshItemsCache: function() {
        if (this.option("repaintChangesOnly")) {
            try {
                this._itemsCache = (0, _extend.extend)(true, [], this._editStrategy.itemsGetter())
            } catch (e) {
                this._itemsCache = (0, _extend.extend)([], this._editStrategy.itemsGetter())
            }
        }
    },
    _dispose: function() {
        this._dataSource && this._dataSource.off("customizeStoreLoadOptions", this._customizeStoreLoadOptions);
        this.callBase()
    },
    _updateByChange: function(keyInfo, items, change, isPartialRefresh) {
        var _this3 = this;
        if (isPartialRefresh) {
            this._renderItem(change.index, change.data, null, this._findItemElementByKey(change.key))
        } else {
            var changedItem = items[_array_utils2.default.indexByKey(keyInfo, items, change.key)];
            if (changedItem) {
                _array_utils2.default.update(keyInfo, items, change.key, change.data).done(function() {
                    _this3._renderItem(items.indexOf(changedItem), changedItem, null, _this3._findItemElementByKey(change.key))
                })
            }
        }
    },
    _insertByChange: function(keyInfo, items, change, isPartialRefresh) {
        var _this4 = this;
        (0, _deferred.when)(isPartialRefresh || _array_utils2.default.insert(keyInfo, items, change.data, change.index)).done(function() {
            _this4._renderItem((0, _type.isDefined)(change.index) ? change.index : items.length, change.data);
            _this4._correctionIndex++
        })
    },
    _removeByChange: function(keyInfo, items, change, isPartialRefresh) {
        var _this5 = this;
        var index = isPartialRefresh ? change.index : _array_utils2.default.indexByKey(keyInfo, items, change.key),
            removedItem = isPartialRefresh ? change.oldItem : items[index];
        if (removedItem) {
            var $removedItemElement = this._findItemElementByKey(change.key),
                deletedActionArgs = this._extendActionArgs($removedItemElement);
            this._waitDeletingPrepare($removedItemElement).done(function() {
                if (isPartialRefresh) {
                    _this5._updateIndicesAfterIndex(index - 1);
                    _this5._afterItemElementDeleted($removedItemElement, deletedActionArgs);
                    _this5._normalizeSelectedItems()
                } else {
                    _this5._deleteItemElementByIndex(index);
                    _this5._afterItemElementDeleted($removedItemElement, deletedActionArgs)
                }
            });
            this._correctionIndex--
        }
    },
    _modifyByChanges: function(changes, isPartialRefresh) {
        var _this6 = this;
        var items = this._editStrategy.itemsGetter(),
            keyInfo = {
                key: this.key.bind(this),
                keyOf: this.keyOf.bind(this)
            },
            dataSource = this._dataSource,
            paginate = dataSource && dataSource.paginate(),
            group = dataSource && dataSource.group();
        if (paginate || group) {
            changes = changes.filter(function(item) {
                return "insert" !== item.type || void 0 !== item.index
            })
        }
        changes.forEach(function(change) {
            return _this6["_" + change.type + "ByChange"](keyInfo, items, change, isPartialRefresh)
        });
        this._renderedItemsCount = items.length;
        this._refreshItemsCache();
        this._fireContentReadyAction()
    },
    _appendItemToContainer: function($container, $itemFrame, index) {
        var nextSiblingElement = $container.children(this._itemSelector()).get(index);
        (0, _dom_adapter.insertElement)($container.get(0), $itemFrame.get(0), nextSiblingElement)
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "items":
                var isItemsUpdated = this._partialRefresh(args.value);
                if (!isItemsUpdated) {
                    this.callBase(args)
                }
                break;
            case "dataSource":
                if (!this.option("repaintChangesOnly") || !args.value) {
                    this.option("items", [])
                }
                this.callBase(args);
                break;
            case "repaintChangesOnly":
                break;
            default:
                this.callBase(args)
        }
    }
});
