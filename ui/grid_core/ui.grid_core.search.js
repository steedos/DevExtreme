/**
 * DevExtreme (ui/grid_core/ui.grid_core.search.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _dom_adapter = require("../../core/dom_adapter");
var _dom_adapter2 = _interopRequireDefault(_dom_adapter);
var _type = require("../../core/utils/type");
var _data = require("../../core/utils/data");
var _iterator = require("../../core/utils/iterator");
var _uiGrid_core = require("./ui.grid_core.utils");
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _query = require("../../data/query");
var _query2 = _interopRequireDefault(_query);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var SEARCH_PANEL_CLASS = "search-panel",
    SEARCH_TEXT_CLASS = "search-text",
    FILTERING_TIMEOUT = 700;

function allowSearch(column) {
    return (0, _type.isDefined)(column.allowSearch) ? column.allowSearch : column.allowFiltering
}

function parseValue(column, text) {
    var lookup = column.lookup;
    if (lookup) {
        return column.parseValue.call(lookup, text)
    } else {
        return column.parseValue ? column.parseValue(text) : text
    }
}
module.exports = {
    defaultOptions: function() {
        return {
            searchPanel: {
                visible: false,
                width: 160,
                placeholder: _message2.default.format("dxDataGrid-searchPanelPlaceholder"),
                highlightSearchText: true,
                highlightCaseSensitive: false,
                text: "",
                searchVisibleColumnsOnly: false
            }
        }
    },
    extenders: {
        controllers: {
            data: function() {
                var calculateSearchFilter = function(that, text) {
                    var i, column, filterValue, lookup, columns = that._columnsController.getColumns(),
                        searchVisibleColumnsOnly = that.option("searchPanel.searchVisibleColumnsOnly"),
                        filters = [];
                    if (!text) {
                        return null
                    }

                    function onQueryDone(items) {
                        var i, value, valueGetter = (0, _data.compileGetter)(lookup.valueExpr);
                        for (i = 0; i < items.length; i++) {
                            value = valueGetter(items[i]);
                            filters.push(column.createFilterExpression(value, null, "search"))
                        }
                    }
                    for (i = 0; i < columns.length; i++) {
                        column = columns[i];
                        if (searchVisibleColumnsOnly && !column.visible) {
                            continue
                        }
                        if (allowSearch(column) && column.calculateFilterExpression) {
                            lookup = column.lookup;
                            filterValue = parseValue(column, text);
                            if (lookup && lookup.items) {
                                (0, _query2.default)(lookup.items).filter(column.createFilterExpression.call({
                                    dataField: lookup.displayExpr,
                                    dataType: lookup.dataType,
                                    calculateFilterExpression: column.calculateFilterExpression
                                }, filterValue, null, "search")).enumerate().done(onQueryDone)
                            } else {
                                if (void 0 !== filterValue) {
                                    filters.push(column.createFilterExpression(filterValue, null, "search"))
                                }
                            }
                        }
                    }
                    return (0, _uiGrid_core.combineFilters)(filters, "or")
                };
                return {
                    publicMethods: function() {
                        return this.callBase().concat(["searchByText"])
                    },
                    _calculateAdditionalFilter: function() {
                        var that = this,
                            filter = that.callBase(),
                            searchFilter = calculateSearchFilter(that, that.option("searchPanel.text"));
                        return (0, _uiGrid_core.combineFilters)([filter, searchFilter])
                    },
                    searchByText: function(text) {
                        this.option("searchPanel.text", text)
                    },
                    optionChanged: function(args) {
                        var that = this;
                        switch (args.fullName) {
                            case "searchPanel.text":
                            case "searchPanel":
                                that._applyFilter();
                                args.handled = true;
                                break;
                            default:
                                that.callBase(args)
                        }
                    }
                }
            }()
        },
        views: {
            headerPanel: function() {
                var getSearchPanelOptions = function(that) {
                    return that.option("searchPanel")
                };
                return {
                    _getToolbarItems: function() {
                        var items = this.callBase();
                        return this._prepareSearchItem(items)
                    },
                    _prepareSearchItem: function(items) {
                        var that = this,
                            dataController = that.getController("data"),
                            searchPanelOptions = getSearchPanelOptions(that);
                        if (searchPanelOptions && searchPanelOptions.visible) {
                            var toolbarItem = {
                                template: function(data, index, container) {
                                    var $search = (0, _renderer2.default)("<div>").addClass(that.addWidgetPrefix(SEARCH_PANEL_CLASS)).appendTo(container);
                                    that.getController("editorFactory").createEditor($search, {
                                        width: searchPanelOptions.width,
                                        placeholder: searchPanelOptions.placeholder,
                                        parentType: "searchPanel",
                                        value: that.option("searchPanel.text"),
                                        updateValueTimeout: FILTERING_TIMEOUT,
                                        setValue: function(value) {
                                            dataController.searchByText(value)
                                        },
                                        editorOptions: {
                                            inputAttr: {
                                                "aria-label": _message2.default.format("dxDataGrid-ariaSearchInGrid")
                                            }
                                        }
                                    });
                                    that.resize()
                                },
                                name: "searchPanel",
                                location: "after",
                                locateInMenu: "never",
                                sortIndex: 40
                            };
                            items.push(toolbarItem)
                        }
                        return items
                    },
                    _getSearchTextEditor: function() {
                        var $element = this.element(),
                            $searchPanel = $element.find("." + this.addWidgetPrefix(SEARCH_PANEL_CLASS)).filter(function() {
                                return (0, _renderer2.default)(this).closest(".dx-datagrid-header-panel").is($element)
                            });
                        if ($searchPanel.length) {
                            return $searchPanel.dxTextBox("instance")
                        }
                        return null
                    },
                    isVisible: function() {
                        var searchPanelOptions = getSearchPanelOptions(this);
                        return this.callBase() || searchPanelOptions && searchPanelOptions.visible
                    },
                    optionChanged: function(args) {
                        if ("searchPanel" === args.name) {
                            if ("searchPanel.text" === args.fullName) {
                                var editor = this._getSearchTextEditor();
                                if (editor) {
                                    editor.option("value", args.value)
                                }
                            } else {
                                this._invalidate()
                            }
                            args.handled = true
                        } else {
                            this.callBase(args)
                        }
                    }
                }
            }(),
            rowsView: {
                init: function() {
                    this.callBase.apply(this, arguments);
                    this._searchParams = []
                },
                _getFormattedSearchText: function(column, searchText) {
                    var value = parseValue(column, searchText),
                        formatOptions = (0, _uiGrid_core.getFormatOptionsByColumn)(column, "search");
                    return (0, _uiGrid_core.formatValue)(value, formatOptions)
                },
                _getStringNormalizer: function() {
                    var isCaseSensitive = this.option("searchPanel.highlightCaseSensitive");
                    return function(str) {
                        return isCaseSensitive ? str : str.toLowerCase()
                    }
                },
                _findHighlightingTextNodes: function(column, cellElement, searchText) {
                    var $items, columnIndex, that = this,
                        $parent = cellElement.parent(),
                        stringNormalizer = this._getStringNormalizer(),
                        normalizedSearchText = stringNormalizer(searchText);
                    if (!$parent.length) {
                        $parent = (0, _renderer2.default)("<div>").append(cellElement)
                    } else {
                        if (column) {
                            columnIndex = that._columnsController.getVisibleIndex(column.index);
                            $items = $parent.children("td").eq(columnIndex).find("*")
                        }
                    }
                    $items = $items && $items.length ? $items : $parent.find("*");
                    $items = $items.filter(function(_, element) {
                        var $contents = (0, _renderer2.default)(element).contents();
                        for (var i = 0; i < $contents.length; i++) {
                            var node = $contents.get(i);
                            if (3 === node.nodeType) {
                                return stringNormalizer(node.textContent || node.nodeValue).indexOf(normalizedSearchText) > -1
                            }
                            return false
                        }
                    });
                    return $items
                },
                _highlightSearchTextCore: function($textNode, searchText) {
                    var that = this,
                        $searchTextSpan = (0, _renderer2.default)("<span>").addClass(that.addWidgetPrefix(SEARCH_TEXT_CLASS)),
                        text = $textNode.text(),
                        firstContentElement = $textNode[0],
                        stringNormalizer = this._getStringNormalizer(),
                        index = stringNormalizer(text).indexOf(stringNormalizer(searchText));
                    if (index >= 0) {
                        if (firstContentElement.textContent) {
                            firstContentElement.textContent = text.substr(0, index)
                        } else {
                            firstContentElement.nodeValue = text.substr(0, index)
                        }
                        $textNode.after($searchTextSpan.text(text.substr(index, searchText.length)));
                        $textNode = (0, _renderer2.default)(_dom_adapter2.default.createTextNode(text.substr(index + searchText.length))).insertAfter($searchTextSpan);
                        return that._highlightSearchTextCore($textNode, searchText)
                    }
                },
                _highlightSearchText: function(cellElement, isEquals, column) {
                    var that = this,
                        stringNormalizer = this._getStringNormalizer(),
                        searchText = that.option("searchPanel.text");
                    if (isEquals && column) {
                        searchText = searchText && that._getFormattedSearchText(column, searchText)
                    }
                    if (searchText && that.option("searchPanel.highlightSearchText")) {
                        var textNodes = that._findHighlightingTextNodes(column, cellElement, searchText);
                        (0, _iterator.each)(textNodes, function(_, element) {
                            (0, _iterator.each)((0, _renderer2.default)(element).contents(), function(_, textNode) {
                                if (isEquals) {
                                    if (stringNormalizer((0, _renderer2.default)(textNode).text()) === stringNormalizer(searchText)) {
                                        (0, _renderer2.default)(this).replaceWith((0, _renderer2.default)("<span>").addClass(that.addWidgetPrefix(SEARCH_TEXT_CLASS)).text((0, _renderer2.default)(textNode).text()))
                                    }
                                } else {
                                    that._highlightSearchTextCore((0, _renderer2.default)(textNode), searchText)
                                }
                            })
                        })
                    }
                },
                _renderCore: function() {
                    this.callBase.apply(this, arguments);
                    if (this.option("rowTemplate")) {
                        if (this.option("templatesRenderAsynchronously")) {
                            clearTimeout(this._highlightTimer);
                            this._highlightTimer = setTimeout(function() {
                                this._highlightSearchText(this._getTableElement())
                            }.bind(this))
                        } else {
                            this._highlightSearchText(this._getTableElement())
                        }
                    }
                },
                _updateCell: function($cell, parameters) {
                    var column = parameters.column,
                        dataType = column.lookup && column.lookup.dataType || column.dataType,
                        isEquals = "string" !== dataType;
                    if (allowSearch(column)) {
                        if (this.option("templatesRenderAsynchronously")) {
                            if (!this._searchParams.length) {
                                clearTimeout(this._highlightTimer);
                                this._highlightTimer = setTimeout(function() {
                                    this._searchParams.forEach(function(params) {
                                        this._highlightSearchText.apply(this, params)
                                    }.bind(this));
                                    this._searchParams = []
                                }.bind(this))
                            }
                            this._searchParams.push([$cell, isEquals, column])
                        } else {
                            this._highlightSearchText($cell, isEquals, column)
                        }
                    }
                    this.callBase($cell, parameters)
                },
                dispose: function() {
                    clearTimeout(this._highlightTimer);
                    this.callBase()
                }
            }
        }
    }
};
