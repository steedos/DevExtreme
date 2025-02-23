/**
 * DevExtreme (ui/autocomplete.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../core/renderer"),
    noop = require("../core/utils/common").noop,
    registerComponent = require("../core/component_registrator"),
    extend = require("../core/utils/extend").extend,
    DropDownList = require("./drop_down_editor/ui.drop_down_list"),
    themes = require("./themes"),
    Deferred = require("../core/utils/deferred").Deferred;
var AUTOCOMPLETE_CLASS = "dx-autocomplete",
    AUTOCOMPLETE_POPUP_WRAPPER_CLASS = "dx-autocomplete-popup-wrapper";
var Autocomplete = DropDownList.inherit({
    _supportedKeys: function() {
        var item = this._list ? this._list.option("focusedElement") : null,
            parent = this.callBase();
        item = item && $(item);
        return extend({}, parent, {
            upArrow: function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (item && !this._calcNextItem(-1)) {
                    this._clearFocusedItem();
                    return false
                }
                return true
            },
            downArrow: function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (item && !this._calcNextItem(1)) {
                    this._clearFocusedItem();
                    return false
                }
                return true
            },
            enter: function() {
                if (!item) {
                    this.close()
                }
                parent.enter.apply(this, arguments);
                return this.option("opened")
            }
        })
    },
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            minSearchLength: 1,
            maxItemCount: 10,
            noDataText: "",
            showDropDownButton: false,
            searchEnabled: true
        })
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: function() {
                return themes.isAndroid5()
            },
            options: {
                popupPosition: {
                    offset: {
                        h: -16,
                        v: -8
                    }
                }
            }
        }])
    },
    _initMarkup: function() {
        this.callBase();
        this.$element().addClass(AUTOCOMPLETE_CLASS);
        this.setAria("autocomplete", "inline")
    },
    _loadValue: function() {
        return (new Deferred).resolve(this.option("value"))
    },
    _displayGetterExpr: function() {
        return this.option("valueExpr")
    },
    _setSelectedItem: function(item) {
        this.callBase(item);
        this.option("displayValue", this.option("value"))
    },
    _popupConfig: function() {
        return extend(this.callBase(), {
            closeOnOutsideClick: function(e) {
                return !$(e.target).closest(this.$element()).length
            }.bind(this)
        })
    },
    _renderDimensions: function() {
        this.callBase();
        this._setPopupOption("width")
    },
    _popupWrapperClass: function() {
        return this.callBase() + " " + AUTOCOMPLETE_POPUP_WRAPPER_CLASS
    },
    _listConfig: function() {
        return extend(this.callBase(), {
            pageLoadMode: "none",
            indicateLoading: false
        })
    },
    _listItemClickHandler: function(e) {
        var value = this._displayGetter(e.itemData);
        this.option("value", value);
        this.close()
    },
    _setListDataSource: function() {
        if (!this._list) {
            return
        }
        this._list.option("selectedItems", []);
        this.callBase()
    },
    _refreshSelected: noop,
    _searchCanceled: function() {
        this.callBase();
        this.close()
    },
    _dataSourceOptions: function() {
        return {
            paginate: true
        }
    },
    _searchDataSource: function() {
        this._dataSource.pageSize(this.option("maxItemCount"));
        this.callBase();
        this._clearFocusedItem()
    },
    _clearFocusedItem: function() {
        if (this._list) {
            this._list.option("focusedElement", null);
            this._list.option("selectedIndex", -1)
        }
    },
    _renderValueEventName: function() {
        return "input keyup"
    },
    _valueChangeEventHandler: function(e) {
        var value = this._input().val() || null;
        return this.callBase(e, value)
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "maxItemCount":
                this._searchDataSource();
                break;
            case "valueExpr":
                this._compileDisplayGetter();
                this._setListOption("displayExpr", this._displayGetterExpr());
                this.callBase(args);
                break;
            default:
                this.callBase(args)
        }
    },
    reset: function() {
        this.callBase();
        this.close()
    }
});
registerComponent("dxAutocomplete", Autocomplete);
module.exports = Autocomplete;
module.exports.default = module.exports;
