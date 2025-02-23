/**
 * DevExtreme (ui/grid_core/ui.grid_core.grid_view.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _common = require("../../core/utils/common");
var _common2 = _interopRequireDefault(_common);
var _window = require("../../core/utils/window");
var _window2 = _interopRequireDefault(_window);
var _iterator = require("../../core/utils/iterator");
var _type = require("../../core/utils/type");
var _type2 = _interopRequireDefault(_type);
var _uiGrid_core3 = require("./ui.grid_core.utils");
var _uiGrid_core4 = _interopRequireDefault(_uiGrid_core3);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _deferred = require("../../core/utils/deferred");
var _dom_adapter = require("../../core/dom_adapter");
var _dom_adapter2 = _interopRequireDefault(_dom_adapter);
var _browser = require("../../core/utils/browser");
var _browser2 = _interopRequireDefault(_browser);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var TABLE_CLASS = "table",
    BORDERS_CLASS = "borders",
    TABLE_FIXED_CLASS = "table-fixed",
    IMPORTANT_MARGIN_CLASS = "important-margin",
    TEXT_CONTENT_CLASS = "text-content",
    HIDDEN_CLASS = "dx-hidden",
    GRIDBASE_CONTAINER_CLASS = "dx-gridbase-container",
    HIDDEN_COLUMNS_WIDTH = "adaptiveHidden",
    EDITORS_INPUT_SELECTOR = "input:not([type='hidden'])",
    VIEW_NAMES = ["columnsSeparatorView", "blockSeparatorView", "trackerView", "headerPanel", "columnHeadersView", "rowsView", "footerView", "columnChooserView", "filterPanelView", "pagerView", "draggingHeaderView", "contextMenuView", "errorView", "headerFilterView", "filterBuilderView"];
var isPercentWidth = function(width) {
    return _type2.default.isString(width) && "%" === width.slice(-1)
};
var mergeArraysByMaxValue = function(values1, values2) {
    var i, result = [];
    if (values1 && values2 && values1.length && values1.length === values2.length) {
        for (i = 0; i < values1.length; i++) {
            result.push(values1[i] > values2[i] ? values1[i] : values2[i])
        }
    } else {
        if (values1 && values1.length) {
            result = values1
        } else {
            if (values2) {
                result = values2
            }
        }
    }
    return result
};
var getContainerHeight = function($container) {
    var clientHeight = $container.get(0).clientHeight,
        paddingTop = parseFloat($container.css("paddingTop")),
        paddingBottom = parseFloat($container.css("paddingBottom"));
    return clientHeight - paddingTop - paddingBottom
};
var calculateFreeWidth = function(that, widths) {
    var contentWidth = that._rowsView.contentWidth(),
        totalWidth = that._getTotalWidth(widths, contentWidth);
    return contentWidth - totalWidth
};
var calculateFreeWidthWithCurrentMinWidth = function(that, columnIndex, currentMinWidth, widths) {
    return calculateFreeWidth(that, widths.map(function(width, index) {
        return index === columnIndex ? currentMinWidth : width
    }))
};
var restoreFocus = function(focusedElement, selectionRange) {
    focusedElement.focus();
    _uiGrid_core4.default.setSelectionRange(focusedElement, selectionRange)
};
var ResizingController = _uiGrid_core2.default.ViewController.inherit({
    _initPostRenderHandlers: function() {
        var that = this,
            dataController = that._dataController;
        if (!that._refreshSizesHandler) {
            that._refreshSizesHandler = function(e) {
                dataController.changed.remove(that._refreshSizesHandler);
                var resizeDeferred, changeType = e && e.changeType,
                    isDelayed = e && e.isDelayed,
                    items = dataController.items();
                if (!e || "refresh" === changeType || "prepend" === changeType || "append" === changeType) {
                    if (!isDelayed) {
                        resizeDeferred = that.resize()
                    }
                } else {
                    if ("update" === changeType && e.changeTypes) {
                        if ((items.length > 1 || "insert" !== e.changeTypes[0]) && !(0 === items.length && "remove" === e.changeTypes[0]) && !e.needUpdateDimensions) {
                            that._rowsView.resize()
                        } else {
                            resizeDeferred = that.resize()
                        }
                    }
                }
                if (changeType && "updateSelection" !== changeType && "updateFocusedRow" !== changeType && !isDelayed) {
                    (0, _deferred.when)(resizeDeferred).done(function() {
                        that._setAriaRowColCount();
                        that.component._fireContentReadyAction()
                    })
                }
            };
            that._dataController.changed.add(function() {
                that._dataController.changed.add(that._refreshSizesHandler)
            })
        }
    },
    _setAriaRowColCount: function() {
        var component = this.component;
        component.setAria({
            rowCount: this._dataController.totalItemsCount(),
            colCount: component.columnCount()
        }, component.$element().children("." + GRIDBASE_CONTAINER_CLASS))
    },
    _getBestFitWidths: function() {
        if (!this.option("legacyRendering")) {
            return this._rowsView.getColumnWidths()
        }
        var rowsColumnWidths, headerColumnWidths, footerColumnWidths, resultWidths, that = this;
        rowsColumnWidths = that._rowsView.getColumnWidths();
        headerColumnWidths = that._columnHeadersView && that._columnHeadersView.getColumnWidths();
        footerColumnWidths = that._footerView && that._footerView.getColumnWidths();
        resultWidths = mergeArraysByMaxValue(rowsColumnWidths, headerColumnWidths);
        resultWidths = mergeArraysByMaxValue(resultWidths, footerColumnWidths);
        return resultWidths
    },
    _setVisibleWidths: function(visibleColumns, widths) {
        var columnsController = this._columnsController;
        columnsController.beginUpdate();
        (0, _iterator.each)(visibleColumns, function(index, column) {
            var columnId = columnsController.getColumnId(column);
            columnsController.columnOption(columnId, "visibleWidth", widths[index])
        });
        columnsController.endUpdate()
    },
    _toggleBestFitModeForView: function(view, className, isBestFit) {
        if (!view || !view.isVisible()) {
            return
        }
        var $tableBody, $rowsTable = this._rowsView._getTableElement(),
            $viewTable = view._getTableElement();
        if ($viewTable) {
            if (isBestFit) {
                $tableBody = $viewTable.children("tbody").appendTo($rowsTable)
            } else {
                $tableBody = $rowsTable.children("." + className).appendTo($viewTable)
            }
            $tableBody.toggleClass(className, isBestFit);
            $tableBody.toggleClass(this.addWidgetPrefix("best-fit"), isBestFit)
        }
    },
    _toggleBestFitMode: function(isBestFit) {
        var $element = this.component.$element(),
            that = this;
        if (!that.option("legacyRendering")) {
            var $rowsTable = that._rowsView._getTableElement(),
                $rowsFixedTable = that._rowsView.getTableElements().eq(1);
            $rowsTable.css("tableLayout", isBestFit ? "auto" : "fixed");
            $rowsTable.children("colgroup").css("display", isBestFit ? "none" : "");
            $rowsFixedTable.toggleClass(this.addWidgetPrefix(TABLE_FIXED_CLASS), !isBestFit);
            that._toggleBestFitModeForView(that._columnHeadersView, "dx-header", isBestFit);
            that._toggleBestFitModeForView(that._footerView, "dx-footer", isBestFit);
            if (that._needStretch()) {
                $rowsTable.get(0).style.width = isBestFit ? "auto" : ""
            }
            if (_browser2.default.msie && 11 === parseInt(_browser2.default.version)) {
                $rowsTable.find("." + this.addWidgetPrefix(TABLE_FIXED_CLASS)).each(function() {
                    this.style.width = isBestFit ? "10px" : ""
                })
            }
        } else {
            $element.find("." + this.addWidgetPrefix(TABLE_CLASS)).toggleClass(this.addWidgetPrefix(TABLE_FIXED_CLASS), !isBestFit);
            $element.find(EDITORS_INPUT_SELECTOR).toggleClass(HIDDEN_CLASS, isBestFit);
            $element.find(".dx-group-cell").toggleClass(HIDDEN_CLASS, isBestFit);
            $element.find(".dx-header-row ." + this.addWidgetPrefix(TEXT_CONTENT_CLASS)).css("maxWidth", "")
        }
    },
    _synchronizeColumns: function() {
        var resetBestFitMode, focusedElement, isFocusOutsideWindow, selectionRange, that = this,
            columnsController = that._columnsController,
            visibleColumns = columnsController.getVisibleColumns(),
            columnAutoWidth = that.option("columnAutoWidth"),
            legacyRendering = that.option("legacyRendering"),
            needBestFit = that._needBestFit(),
            hasMinWidth = false,
            isColumnWidthsCorrected = false,
            resultWidths = [],
            normalizeWidthsByExpandColumns = function() {
                var expandColumnWidth;
                (0, _iterator.each)(visibleColumns, function(index, column) {
                    if ("groupExpand" === column.type) {
                        expandColumnWidth = resultWidths[index]
                    }
                });
                (0, _iterator.each)(visibleColumns, function(index, column) {
                    if ("groupExpand" === column.type && expandColumnWidth) {
                        resultWidths[index] = expandColumnWidth
                    }
                })
            };
        !needBestFit && (0, _iterator.each)(visibleColumns, function(index, column) {
            if ("auto" === column.width || legacyRendering && column.fixed) {
                needBestFit = true;
                return false
            }
        });
        (0, _iterator.each)(visibleColumns, function(index, column) {
            if (column.minWidth) {
                hasMinWidth = true;
                return false
            }
        });
        that._setVisibleWidths(visibleColumns, []);
        if (needBestFit) {
            focusedElement = _dom_adapter2.default.getActiveElement();
            selectionRange = _uiGrid_core4.default.getSelectionRange(focusedElement);
            that._toggleBestFitMode(true);
            resetBestFitMode = true
        }
        _common2.default.deferUpdate(function() {
            if (needBestFit) {
                resultWidths = that._getBestFitWidths();
                (0, _iterator.each)(visibleColumns, function(index, column) {
                    var columnId = columnsController.getColumnId(column);
                    columnsController.columnOption(columnId, "bestFitWidth", resultWidths[index], true)
                })
            } else {
                if (hasMinWidth) {
                    resultWidths = that._getBestFitWidths()
                }
            }(0, _iterator.each)(visibleColumns, function(index) {
                var width = this.width;
                if ("auto" !== width) {
                    if (_type2.default.isDefined(width)) {
                        resultWidths[index] = _type2.default.isNumeric(width) ? parseFloat(width) : width
                    } else {
                        if (!columnAutoWidth) {
                            resultWidths[index] = void 0
                        }
                    }
                }
            });
            if (resetBestFitMode) {
                that._toggleBestFitMode(false);
                resetBestFitMode = false;
                if (focusedElement && focusedElement !== _dom_adapter2.default.getActiveElement()) {
                    isFocusOutsideWindow = focusedElement.getBoundingClientRect().bottom < 0;
                    if (!isFocusOutsideWindow) {
                        if (_browser2.default.msie) {
                            setTimeout(function() {
                                restoreFocus(focusedElement, selectionRange)
                            })
                        } else {
                            restoreFocus(focusedElement, selectionRange)
                        }
                    }
                }
            }
            isColumnWidthsCorrected = that._correctColumnWidths(resultWidths, visibleColumns);
            if (columnAutoWidth) {
                normalizeWidthsByExpandColumns();
                if (that._needStretch()) {
                    that._processStretch(resultWidths, visibleColumns)
                }
            }
            _common2.default.deferRender(function() {
                if (needBestFit || isColumnWidthsCorrected) {
                    that._setVisibleWidths(visibleColumns, resultWidths)
                }
            })
        })
    },
    _needBestFit: function() {
        return this.option("columnAutoWidth")
    },
    _needStretch: function() {
        return this.option("legacyRendering") || this._columnsController.getVisibleColumns().some(function(c) {
            return "auto" === c.width && !c.command
        })
    },
    _getAverageColumnsWidth: function(resultWidths) {
        var freeWidth = calculateFreeWidth(this, resultWidths),
            columnCountWithoutWidth = resultWidths.filter(function(width) {
                return void 0 === width
            }).length;
        return freeWidth / columnCountWithoutWidth
    },
    _correctColumnWidths: function(resultWidths, visibleColumns) {
        var i, averageColumnsWidth, lastColumnIndex, that = this,
            hasPercentWidth = false,
            hasAutoWidth = false,
            isColumnWidthsCorrected = false,
            $element = that.component.$element(),
            hasWidth = that._hasWidth;
        for (i = 0; i < visibleColumns.length; i++) {
            var index = i,
                column = visibleColumns[index],
                isHiddenColumn = resultWidths[index] === HIDDEN_COLUMNS_WIDTH,
                width = resultWidths[index],
                minWidth = column.minWidth;
            if (minWidth) {
                if (void 0 === width) {
                    averageColumnsWidth = that._getAverageColumnsWidth(resultWidths);
                    width = averageColumnsWidth
                } else {
                    if (isPercentWidth(width)) {
                        var freeWidth = calculateFreeWidthWithCurrentMinWidth(that, index, minWidth, resultWidths);
                        if (freeWidth < 0) {
                            width = -1
                        }
                    }
                }
            }
            if (minWidth && that._getRealColumnWidth(width) < minWidth && !isHiddenColumn) {
                resultWidths[index] = minWidth;
                isColumnWidthsCorrected = true;
                i = -1
            }
            if (!_type2.default.isDefined(column.width)) {
                hasAutoWidth = true
            }
            if (isPercentWidth(column.width)) {
                hasPercentWidth = true
            }
        }
        if ($element && that._maxWidth) {
            delete that._maxWidth;
            $element.css("maxWidth", "")
        }
        if (!hasAutoWidth && resultWidths.length) {
            var contentWidth = that._rowsView.contentWidth(),
                scrollbarWidth = that._rowsView.getScrollbarWidth(),
                totalWidth = that._getTotalWidth(resultWidths, contentWidth);
            if (totalWidth < contentWidth) {
                lastColumnIndex = _uiGrid_core4.default.getLastResizableColumnIndex(visibleColumns, resultWidths);
                if (lastColumnIndex >= 0) {
                    resultWidths[lastColumnIndex] = "auto";
                    isColumnWidthsCorrected = true;
                    if (!hasWidth && !hasPercentWidth) {
                        that._maxWidth = totalWidth + scrollbarWidth + (that.option("showBorders") ? 2 : 0);
                        $element.css("maxWidth", that._maxWidth)
                    }
                }
            }
        }
        return isColumnWidthsCorrected
    },
    _processStretch: function(resultSizes, visibleColumns) {
        var diff, diffElement, onePixelElementsCount, i, groupSize = this._rowsView.contentWidth(),
            tableSize = this._getTotalWidth(resultSizes, groupSize),
            unusedIndexes = {
                length: 0
            };
        if (!resultSizes.length) {
            return
        }(0, _iterator.each)(visibleColumns, function(index) {
            if (this.width || resultSizes[index] === HIDDEN_COLUMNS_WIDTH) {
                unusedIndexes[index] = true;
                unusedIndexes.length++
            }
        });
        diff = groupSize - tableSize;
        diffElement = Math.floor(diff / (resultSizes.length - unusedIndexes.length));
        onePixelElementsCount = diff - diffElement * (resultSizes.length - unusedIndexes.length);
        if (diff >= 0) {
            for (i = 0; i < resultSizes.length; i++) {
                if (unusedIndexes[i]) {
                    continue
                }
                resultSizes[i] += diffElement;
                if (onePixelElementsCount > 0) {
                    if (onePixelElementsCount < 1) {
                        resultSizes[i] += onePixelElementsCount;
                        onePixelElementsCount = 0
                    } else {
                        resultSizes[i]++;
                        onePixelElementsCount--
                    }
                }
            }
        }
    },
    _getRealColumnWidth: function(width, groupWidth) {
        if (!isPercentWidth(width)) {
            return parseFloat(width)
        }
        groupWidth = groupWidth || this._rowsView.contentWidth();
        return parseFloat(width) * groupWidth / 100
    },
    _getTotalWidth: function(widths, groupWidth) {
        var width, i, result = 0;
        for (i = 0; i < widths.length; i++) {
            width = widths[i];
            if (width && width !== HIDDEN_COLUMNS_WIDTH) {
                result += this._getRealColumnWidth(width, groupWidth)
            }
        }
        return Math.round(result)
    },
    updateSize: function($rootElement) {
        var $groupElement, width, that = this,
            importantMarginClass = that.addWidgetPrefix(IMPORTANT_MARGIN_CLASS);
        if (void 0 === that._hasHeight && $rootElement && $rootElement.is(":visible")) {
            $groupElement = $rootElement.children("." + that.getWidgetContainerClass());
            if ($groupElement.length) {
                $groupElement.detach()
            }
            that._hasHeight = !!getContainerHeight($rootElement);
            width = $rootElement.width();
            $rootElement.addClass(importantMarginClass);
            that._hasWidth = $rootElement.width() === width;
            $rootElement.removeClass(importantMarginClass);
            if ($groupElement.length) {
                $groupElement.appendTo($rootElement)
            }
        }
    },
    publicMethods: function() {
        return ["resize", "updateDimensions"]
    },
    resize: function() {
        return !this.component._requireResize && this.updateDimensions()
    },
    updateDimensions: function(checkSize) {
        var that = this;
        that._initPostRenderHandlers();
        if (!that._checkSize(checkSize)) {
            return
        }
        var prevResult = that._resizeDeferred,
            result = that._resizeDeferred = new _deferred.Deferred;
        (0, _deferred.when)(prevResult).always(function() {
            _common2.default.deferRender(function() {
                if (that._dataController.isLoaded()) {
                    that._synchronizeColumns()
                }
                that._resetGroupElementHeight();
                _common2.default.deferUpdate(function() {
                    _common2.default.deferRender(function() {
                        _common2.default.deferUpdate(function() {
                            that._updateDimensionsCore()
                        })
                    })
                })
            }).done(result.resolve).fail(result.reject)
        });
        return result.promise()
    },
    _resetGroupElementHeight: function() {
        var groupElement = this.component.$element().children().get(0),
            scrollable = this._rowsView.getScrollable();
        if (groupElement.style.height && (!scrollable || !scrollable.scrollTop())) {
            groupElement.style.height = ""
        }
    },
    _checkSize: function(checkSize) {
        var $rootElement = this.component.$element();
        if (checkSize && (this._lastWidth === $rootElement.width() && this._lastHeight === $rootElement.height() || !$rootElement.is(":visible"))) {
            return false
        }
        return true
    },
    _setScrollerSpacingCore: function(hasHeight) {
        var that = this,
            vScrollbarWidth = hasHeight ? that._rowsView.getScrollbarWidth() : 0,
            hScrollbarWidth = that._rowsView.getScrollbarWidth(true);
        _common2.default.deferRender(function() {
            that._columnHeadersView && that._columnHeadersView.setScrollerSpacing(vScrollbarWidth);
            that._footerView && that._footerView.setScrollerSpacing(vScrollbarWidth);
            that._rowsView.setScrollerSpacing(vScrollbarWidth, hScrollbarWidth)
        })
    },
    _setScrollerSpacing: function(hasHeight) {
        var that = this,
            scrollable = that._rowsView.getScrollable();
        if (!scrollable && hasHeight) {
            _common2.default.deferRender(function() {
                _common2.default.deferUpdate(function() {
                    that._setScrollerSpacingCore(hasHeight)
                })
            })
        } else {
            that._setScrollerSpacingCore(hasHeight)
        }
    },
    _updateDimensionsCore: function() {
        var hasHeight, $testDiv, that = this,
            dataController = that._dataController,
            rowsView = that._rowsView,
            $rootElement = that.component.$element(),
            groupElement = $rootElement.children().get(0),
            rootElementHeight = $rootElement && ($rootElement.get(0).clientHeight || $rootElement.height()),
            maxHeight = parseFloat($rootElement.css("maxHeight")),
            maxHeightHappened = maxHeight && rootElementHeight >= maxHeight,
            height = that.option("height") || $rootElement.get(0).style.height,
            editorFactory = that.getController("editorFactory"),
            isMaxHeightApplied = maxHeightHappened && groupElement.scrollHeight === groupElement.offsetHeight;
        that.updateSize($rootElement);
        hasHeight = that._hasHeight || maxHeightHappened;
        if (height && that._hasHeight ^ "auto" !== height) {
            $testDiv = (0, _renderer2.default)("<div>").height(height).appendTo($rootElement);
            that._hasHeight = !!$testDiv.height();
            $testDiv.remove()
        }
        _common2.default.deferRender(function() {
            rowsView.height(null, hasHeight);
            if (maxHeightHappened && !isMaxHeightApplied) {
                (0, _renderer2.default)(groupElement).css("height", maxHeight)
            }
            if (!dataController.isLoaded()) {
                rowsView.setLoading(dataController.isLoading());
                return
            }
            _common2.default.deferUpdate(function() {
                that._updateLastSizes($rootElement);
                that._setScrollerSpacing(hasHeight);
                (0, _iterator.each)(VIEW_NAMES, function(index, viewName) {
                    var view = that.getView(viewName);
                    if (view) {
                        view.resize()
                    }
                });
                editorFactory && editorFactory.resize()
            })
        })
    },
    _updateLastSizes: function($rootElement) {
        this._lastWidth = $rootElement.width();
        this._lastHeight = $rootElement.height()
    },
    optionChanged: function(args) {
        switch (args.name) {
            case "width":
            case "height":
                this.component._renderDimensions();
                this.resize();
            case "legacyRendering":
            case "renderAsync":
                args.handled = true;
                return;
            default:
                this.callBase(args)
        }
    },
    init: function() {
        var that = this;
        that._dataController = that.getController("data");
        that._columnsController = that.getController("columns");
        that._columnHeadersView = that.getView("columnHeadersView");
        that._footerView = that.getView("footerView");
        that._rowsView = that.getView("rowsView")
    }
});
var SynchronizeScrollingController = _uiGrid_core2.default.ViewController.inherit({
    _scrollChangedHandler: function(views, pos, viewName) {
        for (var j = 0; j < views.length; j++) {
            if (views[j] && views[j].name !== viewName) {
                views[j].scrollTo({
                    left: pos.left,
                    top: pos.top
                })
            }
        }
    },
    init: function() {
        var view, i, views = [this.getView("columnHeadersView"), this.getView("footerView"), this.getView("rowsView")];
        for (i = 0; i < views.length; i++) {
            view = views[i];
            if (view) {
                view.scrollChanged.add(this._scrollChangedHandler.bind(this, views))
            }
        }
    }
});
var GridView = _uiGrid_core2.default.View.inherit({
    _endUpdateCore: function() {
        if (this.component._requireResize) {
            this.component._requireResize = false;
            this._resizingController.resize()
        }
    },
    _getWidgetAriaLabel: function() {
        return "dxDataGrid-ariaDataGrid"
    },
    init: function() {
        var that = this;
        that._resizingController = that.getController("resizing");
        that._dataController = that.getController("data")
    },
    getView: function(name) {
        return this.component._views[name]
    },
    element: function() {
        return this._groupElement
    },
    optionChanged: function(args) {
        var that = this;
        if (_type2.default.isDefined(that._groupElement) && "showBorders" === args.name) {
            that._groupElement.toggleClass(that.addWidgetPrefix(BORDERS_CLASS), !!args.value);
            args.handled = true
        } else {
            that.callBase(args)
        }
    },
    _renderViews: function($groupElement) {
        var that = this;
        (0, _iterator.each)(VIEW_NAMES, function(index, viewName) {
            var view = that.getView(viewName);
            if (view) {
                view.render($groupElement)
            }
        })
    },
    _getTableRoleName: function() {
        return "grid"
    },
    render: function($rootElement) {
        var that = this,
            isFirstRender = !that._groupElement,
            $groupElement = that._groupElement || (0, _renderer2.default)("<div>").addClass(that.getWidgetContainerClass());
        $groupElement.addClass(GRIDBASE_CONTAINER_CLASS);
        $groupElement.toggleClass(that.addWidgetPrefix(BORDERS_CLASS), !!that.option("showBorders"));
        that.setAria("role", "presentation", $rootElement);
        that.component.setAria({
            role: this._getTableRoleName(),
            label: _message2.default.format(that._getWidgetAriaLabel())
        }, $groupElement);
        that._rootElement = $rootElement || that._rootElement;
        if (isFirstRender) {
            that._groupElement = $groupElement;
            _window2.default.hasWindow() && that.getController("resizing").updateSize($rootElement);
            $groupElement.appendTo($rootElement)
        }
        that._renderViews($groupElement)
    },
    update: function() {
        var that = this,
            $rootElement = that._rootElement,
            $groupElement = that._groupElement,
            resizingController = that.getController("resizing");
        if ($rootElement && $groupElement) {
            resizingController.resize();
            if (that._dataController.isLoaded()) {
                that.component._fireContentReadyAction()
            }
        }
    }
});
module.exports = {
    defaultOptions: function() {
        return {
            showBorders: false,
            renderAsync: false,
            legacyRendering: false
        }
    },
    controllers: {
        resizing: ResizingController,
        synchronizeScrolling: SynchronizeScrollingController
    },
    views: {
        gridView: GridView
    }
};
