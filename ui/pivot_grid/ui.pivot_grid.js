/**
 * DevExtreme (ui/pivot_grid/ui.pivot_grid.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    windowUtils = require("../../core/utils/window"),
    window = windowUtils.getWindow(),
    browser = require("../../core/utils/browser"),
    eventsEngine = require("../../events/core/events_engine"),
    registerComponent = require("../../core/component_registrator"),
    getPublicElement = require("../../core/utils/dom").getPublicElement,
    stringUtils = require("../../core/utils/string"),
    commonUtils = require("../../core/utils/common"),
    each = require("../../core/utils/iterator").each,
    isDefined = require("../../core/utils/type").isDefined,
    extend = require("../../core/utils/extend").extend,
    clickEvent = require("../../events/click"),
    messageLocalization = require("../../localization/message"),
    Widget = require("../widget/ui.widget"),
    eventUtils = require("../../events/utils"),
    gridCoreUtils = require("../grid_core/ui.grid_core.utils"),
    pivotGridUtils = require("./ui.pivot_grid.utils"),
    pivotGridDataController = require("./ui.pivot_grid.data_controller"),
    PivotGridDataSource = require("./data_source"),
    dataAreaNamespace = require("./ui.pivot_grid.data_area"),
    headersArea = require("./ui.pivot_grid.headers_area"),
    getSize = require("../../core/utils/size").getSize,
    fieldsArea = require("./ui.pivot_grid.fields_area"),
    PivotGridFieldChooser = require("./ui.pivot_grid.field_chooser"),
    PivotGridFieldChooserBase = require("./ui.pivot_grid.field_chooser_base"),
    ExportMixin = require("./ui.pivot_grid.export").ExportMixin,
    chartIntegrationMixin = require("./ui.pivot_grid.chart_integration"),
    Popup = require("../popup"),
    ContextMenu = require("../context_menu"),
    deferredUtils = require("../../core/utils/deferred"),
    when = deferredUtils.when,
    Deferred = deferredUtils.Deferred,
    DATA_AREA_CELL_CLASS = "dx-area-data-cell",
    ROW_AREA_CELL_CLASS = "dx-area-row-cell",
    COLUMN_AREA_CELL_CLASS = "dx-area-column-cell",
    DESCRIPTION_AREA_CELL_CLASS = "dx-area-description-cell",
    BORDERS_CLASS = "dx-pivotgrid-border",
    PIVOTGRID_CLASS = "dx-pivotgrid",
    ROW_LINES_CLASS = "dx-row-lines",
    BOTTOM_ROW_CLASS = "dx-bottom-row",
    BOTTOM_BORDER_CLASS = "dx-bottom-border",
    FIELDS_CONTAINER_CLASS = "dx-pivotgrid-fields-container",
    FIELDS_CLASS = "dx-area-fields",
    FIELD_CHOOSER_POPUP_CLASS = "dx-fieldchooser-popup",
    INCOMPRESSIBLE_FIELDS_CLASS = "dx-incompressible-fields",
    OVERFLOW_HIDDEN_CLASS = "dx-overflow-hidden",
    TR = "<tr>",
    TD = "<td>",
    DIV = "<div>",
    TEST_HEIGHT = 66666;

function getArraySum(array) {
    var sum = 0;
    each(array, function(_, value) {
        sum += value || 0
    });
    return sum
}

function adjustSizeArray(sizeArray, space) {
    var delta = space / sizeArray.length;
    for (var i = 0; i < sizeArray.length; i++) {
        sizeArray[i] -= delta
    }
}

function unsubscribeScrollEvents(area) {
    area.off("scroll").off("stop")
}

function subscribeToScrollEvent(area, handler) {
    unsubscribeScrollEvents(area);
    area.on("scroll", handler).on("stop", handler)
}
var scrollBarInfoCache = {};

function getScrollBarInfo(useNativeScrolling) {
    if (scrollBarInfoCache[useNativeScrolling]) {
        return scrollBarInfoCache[useNativeScrolling]
    }
    var scrollBarUseNative, scrollBarWidth = 0,
        options = {};
    var container = $(DIV).css({
        position: "absolute",
        visibility: "hidden",
        top: -1e3,
        left: -1e3,
        width: 100,
        height: 100
    }).appendTo("body");
    var content = $("<p>").css({
        width: "100%",
        height: 200
    }).appendTo(container);
    if ("auto" !== useNativeScrolling) {
        options.useNative = !!useNativeScrolling;
        options.useSimulatedScrollbar = !useNativeScrolling
    }
    container.dxScrollable(options);
    scrollBarUseNative = container.dxScrollable("instance").option("useNative");
    scrollBarWidth = scrollBarUseNative ? container.width() - content.width() : 0;
    container.remove();
    scrollBarInfoCache[useNativeScrolling] = {
        scrollBarWidth: scrollBarWidth,
        scrollBarUseNative: scrollBarUseNative
    };
    return scrollBarInfoCache[useNativeScrolling]
}

function getCommonBorderWidth(elements, direction) {
    var borderStyleNames = "width" === direction ? ["borderLeftWidth", "borderRightWidth"] : ["borderTopWidth", "borderBottomWidth"],
        width = 0;
    each(elements, function(_, elem) {
        var computedStyle = window.getComputedStyle(elem.get(0));
        borderStyleNames.forEach(function(borderStyleName) {
            width += parseFloat(computedStyle[borderStyleName]) || 0
        })
    });
    return width
}

function clickedOnFieldsArea($targetElement) {
    return $targetElement.closest("." + FIELDS_CLASS).length || $targetElement.find("." + FIELDS_CLASS).length
}
var PivotGrid = Widget.inherit({
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            scrolling: {
                timeout: 300,
                renderingThreshold: 150,
                minTimeout: 10,
                mode: "standard",
                useNative: "auto",
                removeInvisiblePages: true
            },
            encodeHtml: true,
            dataSource: null,
            activeStateEnabled: false,
            fieldChooser: {
                minWidth: 250,
                minHeight: 250,
                enabled: true,
                allowSearch: false,
                searchTimeout: 500,
                layout: 0,
                title: messageLocalization.format("dxPivotGrid-fieldChooserTitle"),
                width: 600,
                height: 600,
                applyChangesMode: "instantly"
            },
            onContextMenuPreparing: null,
            allowSorting: false,
            allowSortingBySummary: false,
            allowFiltering: false,
            allowExpandAll: false,
            wordWrapEnabled: true,
            fieldPanel: {
                showColumnFields: true,
                showFilterFields: true,
                showDataFields: true,
                showRowFields: true,
                allowFieldDragging: true,
                visible: false,
                texts: {
                    columnFieldArea: messageLocalization.format("dxPivotGrid-columnFieldArea"),
                    rowFieldArea: messageLocalization.format("dxPivotGrid-rowFieldArea"),
                    filterFieldArea: messageLocalization.format("dxPivotGrid-filterFieldArea"),
                    dataFieldArea: messageLocalization.format("dxPivotGrid-dataFieldArea")
                }
            },
            dataFieldArea: "column",
            "export": {
                enabled: false,
                fileName: "PivotGrid",
                proxyUrl: void 0,
                ignoreExcelErrors: true
            },
            showRowTotals: true,
            showRowGrandTotals: true,
            showColumnTotals: true,
            showColumnGrandTotals: true,
            hideEmptySummaryCells: true,
            showTotalsPrior: "none",
            rowHeaderLayout: "standard",
            loadPanel: {
                enabled: true,
                text: messageLocalization.format("Loading"),
                width: 200,
                height: 70,
                showIndicator: true,
                indicatorSrc: "",
                showPane: true
            },
            texts: {
                grandTotal: messageLocalization.format("dxPivotGrid-grandTotal"),
                total: messageLocalization.getFormatter("dxPivotGrid-total"),
                noData: messageLocalization.format("dxDataGrid-noDataText"),
                showFieldChooser: messageLocalization.format("dxPivotGrid-showFieldChooser"),
                expandAll: messageLocalization.format("dxPivotGrid-expandAll"),
                collapseAll: messageLocalization.format("dxPivotGrid-collapseAll"),
                sortColumnBySummary: messageLocalization.getFormatter("dxPivotGrid-sortColumnBySummary"),
                sortRowBySummary: messageLocalization.getFormatter("dxPivotGrid-sortRowBySummary"),
                removeAllSorting: messageLocalization.format("dxPivotGrid-removeAllSorting"),
                exportToExcel: messageLocalization.format("dxDataGrid-exportToExcel"),
                dataNotAvailable: messageLocalization.format("dxPivotGrid-dataNotAvailable")
            },
            onCellClick: null,
            onCellPrepared: null,
            showBorders: false,
            stateStoring: {
                enabled: false,
                storageKey: null,
                type: "localStorage",
                customLoad: null,
                customSave: null,
                savingTimeout: 2e3
            },
            onExpandValueChanging: null,
            renderCellCountLimit: 2e4,
            onExporting: null,
            onExported: null,
            onFileSaving: null,
            headerFilter: {
                width: 252,
                height: 325,
                allowSearch: false,
                searchTimeout: 500,
                texts: {
                    emptyValue: messageLocalization.format("dxDataGrid-headerFilterEmptyValue"),
                    ok: messageLocalization.format("dxDataGrid-headerFilterOK"),
                    cancel: messageLocalization.format("dxDataGrid-headerFilterCancel")
                }
            }
        })
    },
    _getDataControllerOptions: function() {
        var that = this;
        return {
            component: that,
            dataSource: that.option("dataSource"),
            texts: that.option("texts"),
            showRowTotals: that.option("showRowTotals"),
            showRowGrandTotals: that.option("showRowGrandTotals"),
            showColumnTotals: that.option("showColumnTotals"),
            showTotalsPrior: that.option("showTotalsPrior"),
            showColumnGrandTotals: that.option("showColumnGrandTotals"),
            dataFieldArea: that.option("dataFieldArea"),
            rowHeaderLayout: that.option("rowHeaderLayout"),
            hideEmptySummaryCells: that.option("hideEmptySummaryCells"),
            onFieldsPrepared: function(fields) {
                each(fields, function(index, field) {
                    each(["allowSorting", "allowSortingBySummary", "allowFiltering", "allowExpandAll"], function(_, optionName) {
                        if (void 0 === field[optionName]) {
                            pivotGridUtils.setFieldProperty(field, optionName, that.option(optionName))
                        }
                    })
                })
            }
        }
    },
    _initDataController: function() {
        var that = this;
        that._dataController && that._dataController.dispose();
        that._dataController = new pivotGridDataController.DataController(that._getDataControllerOptions());
        if (windowUtils.hasWindow()) {
            that._dataController.changed.add(function() {
                that._render()
            })
        }
        that._dataController.scrollChanged.add(function(options) {
            that._scrollLeft = options.left;
            that._scrollTop = options.top
        });
        that._dataController.loadingChanged.add(function(isLoading) {
            that._updateLoading()
        });
        that._dataController.progressChanged.add(that._updateLoading.bind(that));
        that._dataController.dataSourceChanged.add(function() {
            that._trigger("onChanged")
        });
        var expandValueChanging = that.option("onExpandValueChanging");
        if (expandValueChanging) {
            that._dataController.expandValueChanging.add(function(e) {
                expandValueChanging(e)
            })
        }
    },
    _init: function() {
        var that = this;
        that.callBase();
        that._initDataController();
        that._scrollLeft = that._scrollTop = null;
        that._initActions()
    },
    _initActions: function() {
        var that = this;
        that._actions = {
            onChanged: that._createActionByOption("onChanged"),
            onContextMenuPreparing: that._createActionByOption("onContextMenuPreparing"),
            onCellClick: that._createActionByOption("onCellClick"),
            onExporting: that._createActionByOption("onExporting"),
            onExported: that._createActionByOption("onExported"),
            onFileSaving: that._createActionByOption("onFileSaving"),
            onCellPrepared: that._createActionByOption("onCellPrepared")
        }
    },
    _trigger: function(eventName, eventArg) {
        this._actions[eventName](eventArg)
    },
    _optionValuesEqual: function(name, oldValue, newValue) {
        if ("dataSource" === name && newValue instanceof PivotGridDataSource && oldValue instanceof PivotGridDataSource) {
            return newValue === oldValue
        }
        return this.callBase.apply(this, arguments)
    },
    _optionChanged: function(args) {
        var that = this;
        switch (args.name) {
            case "dataSource":
            case "allowSorting":
            case "allowFiltering":
            case "allowExpandAll":
            case "allowSortingBySummary":
            case "scrolling":
            case "stateStoring":
                that._initDataController();
                that._fieldChooserPopup.hide();
                that._renderFieldChooser();
                that._invalidate();
                break;
            case "texts":
            case "showTotalsPrior":
            case "showRowTotals":
            case "showRowGrandTotals":
            case "showColumnTotals":
            case "showColumnGrandTotals":
            case "hideEmptySummaryCells":
            case "dataFieldArea":
                that._dataController.updateViewOptions(that._getDataControllerOptions());
                break;
            case "useNativeScrolling":
            case "encodeHtml":
            case "renderCellCountLimit":
                break;
            case "rtlEnabled":
                that.callBase(args);
                that._renderFieldChooser();
                that._renderContextMenu();
                windowUtils.hasWindow() && that._renderLoadPanel(that._dataArea.groupElement(), that.$element());
                that._invalidate();
                break;
            case "export":
                that._renderDescriptionArea();
                break;
            case "onExpandValueChanging":
                break;
            case "onCellClick":
            case "onContextMenuPreparing":
            case "onExporting":
            case "onExported":
            case "onFileSaving":
            case "onCellPrepared":
                that._actions[args.name] = that._createActionByOption(args.name);
                break;
            case "fieldChooser":
                that._renderFieldChooser();
                that._renderDescriptionArea();
                break;
            case "loadPanel":
                if (windowUtils.hasWindow()) {
                    that._renderLoadPanel(that._dataArea.groupElement(), that.$element());
                    that._invalidate()
                }
                break;
            case "fieldPanel":
                that._renderDescriptionArea();
                that._invalidate();
                break;
            case "headerFilter":
                that._renderFieldChooser();
                that._invalidate();
                break;
            case "showBorders":
                that._tableElement().toggleClass(BORDERS_CLASS, !!args.value);
                that.updateDimensions();
                break;
            case "wordWrapEnabled":
                that._tableElement().toggleClass("dx-word-wrap", !!args.value);
                that.updateDimensions();
                break;
            case "rowHeaderLayout":
                that._tableElement().find("." + ROW_AREA_CELL_CLASS).toggleClass("dx-area-tree-view", "tree" === args.value);
                that._dataController.updateViewOptions(that._getDataControllerOptions());
                break;
            case "height":
            case "width":
                that._hasHeight = null;
                that.callBase(args);
                that.resize();
                break;
            default:
                that.callBase(args)
        }
    },
    _updateScrollPosition: function(columnsArea, rowsArea, dataArea) {
        var scrollTop, scrollLeft, that = this,
            scrolled = that._scrollTop || that._scrollLeft;
        if (that._scrollUpdating) {
            return
        }
        that._scrollUpdating = true;
        if (rowsArea && !rowsArea.hasScroll() && that._hasHeight) {
            that._scrollTop = null
        }
        if (columnsArea && !columnsArea.hasScroll()) {
            that._scrollLeft = null
        }
        if (null !== that._scrollTop || null !== that._scrollLeft || scrolled || that.option("rtlEnabled")) {
            scrollTop = that._scrollTop || 0;
            scrollLeft = that._scrollLeft || 0;
            dataArea.scrollTo({
                x: scrollLeft,
                y: scrollTop
            });
            columnsArea.scrollTo(scrollLeft);
            rowsArea.scrollTo(scrollTop);
            that._dataController.updateWindowScrollPosition(that._scrollTop)
        }
        that._scrollUpdating = false
    },
    _subscribeToEvents: function(columnsArea, rowsArea, dataArea) {
        var that = this,
            scrollHandler = function(e) {
                var scrollOffset = e.scrollOffset,
                    leftOffset = isDefined(scrollOffset.left) ? scrollOffset.left : that._scrollLeft,
                    topOffset = isDefined(scrollOffset.top) && that._hasHeight ? scrollOffset.top : that._scrollTop;
                if ((that._scrollLeft || 0) !== (leftOffset || 0) || (that._scrollTop || 0) !== (topOffset || 0)) {
                    that._scrollLeft = leftOffset;
                    that._scrollTop = topOffset;
                    that._updateScrollPosition(columnsArea, rowsArea, dataArea);
                    if ("virtual" === that.option("scrolling.mode")) {
                        that._dataController.setViewportPosition(that._scrollLeft, that._scrollTop)
                    }
                }
            };
        each([columnsArea, rowsArea, dataArea], function(_, area) {
            subscribeToScrollEvent(area, scrollHandler)
        });
        !that._hasHeight && that._dataController.subscribeToWindowScrollEvents(dataArea.groupElement())
    },
    _clean: commonUtils.noop,
    _needDelayResizing: function(cellsInfo) {
        var cellsCount = cellsInfo.length * (cellsInfo.length ? cellsInfo[0].length : 0);
        return cellsCount > this.option("renderCellCountLimit")
    },
    _renderFieldChooser: function() {
        var that = this,
            container = that._pivotGridContainer,
            fieldChooserOptions = that.option("fieldChooser") || {},
            toolbarItems = "onDemand" === fieldChooserOptions.applyChangesMode ? [{
                toolbar: "bottom",
                location: "after",
                widget: "dxButton",
                options: {
                    text: messageLocalization.format("OK"),
                    onClick: function(e) {
                        that._fieldChooserPopup.$content().dxPivotGridFieldChooser("applyChanges");
                        that._fieldChooserPopup.hide()
                    }
                }
            }, {
                toolbar: "bottom",
                location: "after",
                widget: "dxButton",
                options: {
                    text: messageLocalization.format("Cancel"),
                    onClick: function(e) {
                        that._fieldChooserPopup.hide()
                    }
                }
            }] : [],
            fieldChooserComponentOptions = {
                layout: fieldChooserOptions.layout,
                texts: fieldChooserOptions.texts || {},
                dataSource: that.getDataSource(),
                allowSearch: fieldChooserOptions.allowSearch,
                searchTimeout: fieldChooserOptions.searchTimeout,
                width: void 0,
                height: void 0,
                headerFilter: that.option("headerFilter"),
                encodeHtml: that.option("encodeHtml"),
                applyChangesMode: fieldChooserOptions.applyChangesMode
            },
            popupOptions = {
                shading: false,
                title: fieldChooserOptions.title,
                width: fieldChooserOptions.width,
                height: fieldChooserOptions.height,
                showCloseButton: true,
                resizeEnabled: true,
                minWidth: fieldChooserOptions.minWidth,
                minHeight: fieldChooserOptions.minHeight,
                toolbarItems: toolbarItems,
                onResize: function(e) {
                    e.component.$content().dxPivotGridFieldChooser("updateDimensions")
                },
                onShown: function(e) {
                    that._createComponent(e.component.content(), PivotGridFieldChooser, fieldChooserComponentOptions)
                },
                onHidden: function(e) {
                    var fieldChooser = e.component.$content().dxPivotGridFieldChooser("instance");
                    fieldChooser.resetTreeView();
                    fieldChooser.cancelChanges()
                }
            };
        if (that._fieldChooserPopup) {
            that._fieldChooserPopup.option(popupOptions);
            that._fieldChooserPopup.$content().dxPivotGridFieldChooser(fieldChooserComponentOptions)
        } else {
            that._fieldChooserPopup = that._createComponent($(DIV).addClass(FIELD_CHOOSER_POPUP_CLASS).appendTo(container), Popup, popupOptions)
        }
    },
    _renderContextMenu: function() {
        var that = this,
            $container = that._pivotGridContainer;
        if (that._contextMenu) {
            that._contextMenu.$element().remove()
        }
        that._contextMenu = that._createComponent($(DIV).appendTo($container), ContextMenu, {
            onPositioning: function(actionArgs) {
                var targetElement, args, items, event = actionArgs.event;
                actionArgs.cancel = true;
                if (!event) {
                    return
                }
                targetElement = event.target.cellIndex >= 0 ? event.target : $(event.target).closest("td").get(0);
                if (!targetElement) {
                    return
                }
                args = that._createEventArgs(targetElement, event);
                items = that._getContextMenuItems(args);
                if (items) {
                    actionArgs.component.option("items", items);
                    actionArgs.cancel = false;
                    return
                }
            },
            onItemClick: function(params) {
                params.itemData.onItemClick && params.itemData.onItemClick(params)
            },
            cssClass: PIVOTGRID_CLASS,
            target: that.$element()
        })
    },
    _getContextMenuItems: function(e) {
        var that = this,
            items = [],
            texts = that.option("texts");
        if ("row" === e.area || "column" === e.area) {
            var areaFields = e[e.area + "Fields"],
                oppositeAreaFields = e["column" === e.area ? "rowFields" : "columnFields"],
                field = e.cell.path && areaFields[e.cell.path.length - 1],
                dataSource = that.getDataSource();
            if (field && field.allowExpandAll && e.cell.path.length < e[e.area + "Fields"].length) {
                items.push({
                    beginGroup: true,
                    icon: "none",
                    text: texts.expandAll,
                    onItemClick: function() {
                        dataSource.expandAll(field.index)
                    }
                });
                items.push({
                    text: texts.collapseAll,
                    icon: "none",
                    onItemClick: function() {
                        dataSource.collapseAll(field.index)
                    }
                })
            }
            if (e.cell.isLast) {
                var sortingBySummaryItemCount = 0;
                each(oppositeAreaFields, function(index, field) {
                    if (!field.allowSortingBySummary) {
                        return
                    }
                    each(e.dataFields, function(dataIndex, dataField) {
                        if (isDefined(e.cell.dataIndex) && e.cell.dataIndex !== dataIndex) {
                            return
                        }
                        var showDataFieldCaption = !isDefined(e.cell.dataIndex) && e.dataFields.length > 1,
                            textFormat = "column" === e.area ? texts.sortColumnBySummary : texts.sortRowBySummary,
                            checked = pivotGridUtils.findField(e.dataFields, field.sortBySummaryField) === dataIndex && (e.cell.path || []).join("/") === (field.sortBySummaryPath || []).join("/"),
                            text = stringUtils.format(textFormat, showDataFieldCaption ? field.caption + " - " + dataField.caption : field.caption);
                        items.push({
                            beginGroup: 0 === sortingBySummaryItemCount,
                            icon: checked ? "desc" === field.sortOrder ? "sortdowntext" : "sortuptext" : "none",
                            text: text,
                            onItemClick: function() {
                                dataSource.field(field.index, {
                                    sortBySummaryField: dataField.name || dataField.caption || dataField.dataField,
                                    sortBySummaryPath: e.cell.path,
                                    sortOrder: "desc" === field.sortOrder ? "asc" : "desc"
                                });
                                dataSource.load()
                            }
                        });
                        sortingBySummaryItemCount++
                    })
                });
                each(oppositeAreaFields, function(index, field) {
                    if (!field.allowSortingBySummary || !isDefined(field.sortBySummaryField)) {
                        return
                    }
                    items.push({
                        beginGroup: 0 === sortingBySummaryItemCount,
                        icon: "none",
                        text: texts.removeAllSorting,
                        onItemClick: function() {
                            each(oppositeAreaFields, function(index, field) {
                                dataSource.field(field.index, {
                                    sortBySummaryField: void 0,
                                    sortBySummaryPath: void 0,
                                    sortOrder: void 0
                                })
                            });
                            dataSource.load()
                        }
                    });
                    return false
                })
            }
        }
        if (that.option("fieldChooser.enabled")) {
            items.push({
                beginGroup: true,
                icon: "columnchooser",
                text: texts.showFieldChooser,
                onItemClick: function() {
                    that._fieldChooserPopup.show()
                }
            })
        }
        if (that.option("export.enabled")) {
            items.push({
                beginGroup: true,
                icon: "exportxlsx",
                text: texts.exportToExcel,
                onItemClick: function() {
                    that.exportToExcel()
                }
            })
        }
        e.items = items;
        that._trigger("onContextMenuPreparing", e);
        items = e.items;
        if (items && items.length) {
            return items
        }
    },
    _createEventArgs: function(targetElement, dxEvent) {
        var that = this,
            dataSource = that.getDataSource(),
            args = {
                rowFields: dataSource.getAreaFields("row"),
                columnFields: dataSource.getAreaFields("column"),
                dataFields: dataSource.getAreaFields("data"),
                event: dxEvent
            };
        if (clickedOnFieldsArea($(targetElement))) {
            return extend(that._createFieldArgs(targetElement), args)
        } else {
            return extend(that._createCellArgs(targetElement), args)
        }
    },
    _createFieldArgs: function(targetElement) {
        var field = $(targetElement).children().data("field"),
            args = {
                field: field
            };
        return isDefined(field) ? args : {}
    },
    _createCellArgs: function(cellElement) {
        var $cellElement = $(cellElement),
            columnIndex = cellElement.cellIndex,
            rowIndex = cellElement.parentElement.rowIndex,
            $table = $cellElement.closest("table"),
            data = $table.data("data"),
            cell = data && data[rowIndex] && data[rowIndex][columnIndex],
            args = {
                area: $table.data("area"),
                rowIndex: rowIndex,
                columnIndex: columnIndex,
                cellElement: getPublicElement($cellElement),
                cell: cell
            };
        return args
    },
    _handleCellClick: function(e) {
        var that = this,
            args = that._createEventArgs(e.currentTarget, e),
            cell = args.cell;
        if (!cell || !args.area && (args.rowIndex || args.columnIndex)) {
            return
        }
        that._trigger("onCellClick", args);
        cell && !args.cancel && isDefined(cell.expanded) && setTimeout(function() {
            that._dataController[cell.expanded ? "collapseHeaderItem" : "expandHeaderItem"](args.area, cell.path)
        })
    },
    _getNoDataText: function() {
        return this.option("texts.noData")
    },
    _renderNoDataText: gridCoreUtils.renderNoDataText,
    _renderLoadPanel: gridCoreUtils.renderLoadPanel,
    _updateLoading: function(progress) {
        var loadPanelVisible, that = this,
            isLoading = that._dataController.isLoading();
        if (!that._loadPanel) {
            return
        }
        loadPanelVisible = that._loadPanel.option("visible");
        if (!loadPanelVisible) {
            that._startLoadingTime = new Date
        }
        if (isLoading) {
            if (progress) {
                if (new Date - that._startLoadingTime >= 1e3) {
                    that._loadPanel.option("message", Math.floor(100 * progress) + "%")
                }
            } else {
                that._loadPanel.option("message", that.option("loadPanel.text"))
            }
        }
        clearTimeout(that._hideLoadingTimeoutID);
        if (loadPanelVisible && !isLoading) {
            that._hideLoadingTimeoutID = setTimeout(function() {
                that._loadPanel.option("visible", false);
                that.$element().removeClass(OVERFLOW_HIDDEN_CLASS)
            })
        } else {
            that._loadPanel.option("visible", isLoading);
            that.$element().toggleClass(OVERFLOW_HIDDEN_CLASS, !isLoading)
        }
    },
    _renderDescriptionArea: function() {
        var _this = this;
        var $element = this.$element(),
            $descriptionCell = $element.find("." + DESCRIPTION_AREA_CELL_CLASS),
            $toolbarContainer = $(DIV).addClass("dx-pivotgrid-toolbar"),
            fieldPanel = this.option("fieldPanel"),
            $filterHeader = $element.find(".dx-filter-header"),
            $columnHeader = $element.find(".dx-column-header");
        var $targetContainer = void 0;
        if (fieldPanel.visible && fieldPanel.showFilterFields) {
            $targetContainer = $filterHeader
        } else {
            if (fieldPanel.visible && (fieldPanel.showDataFields || fieldPanel.showColumnFields)) {
                $targetContainer = $columnHeader
            } else {
                $targetContainer = $descriptionCell
            }
        }
        $columnHeader.toggleClass(BOTTOM_BORDER_CLASS, !!(fieldPanel.visible && (fieldPanel.showDataFields || fieldPanel.showColumnFields)));
        $filterHeader.toggleClass(BOTTOM_BORDER_CLASS, !!(fieldPanel.visible && fieldPanel.showFilterFields));
        $descriptionCell.toggleClass("dx-pivotgrid-background", fieldPanel.visible && (fieldPanel.showDataFields || fieldPanel.showColumnFields || fieldPanel.showRowFields));
        this.$element().find(".dx-pivotgrid-toolbar").remove();
        $toolbarContainer.prependTo($targetContainer);
        if (this.option("fieldChooser.enabled")) {
            var $buttonElement = $(DIV).appendTo($toolbarContainer).addClass("dx-pivotgrid-field-chooser-button");
            var buttonOptions = {
                icon: "columnchooser",
                hint: this.option("texts.showFieldChooser"),
                onClick: function() {
                    _this.getFieldChooserPopup().show()
                }
            };
            this._createComponent($buttonElement, "dxButton", buttonOptions)
        }
        if (this.option("export.enabled")) {
            var _$buttonElement = $(DIV).appendTo($toolbarContainer).addClass("dx-pivotgrid-export-button");
            var _buttonOptions = {
                icon: "exportxlsx",
                hint: this.option("texts.exportToExcel"),
                onClick: function() {
                    _this.exportToExcel()
                }
            };
            this._createComponent(_$buttonElement, "dxButton", _buttonOptions)
        }
    },
    _detectHasContainerHeight: function() {
        var testElement, that = this,
            element = that.$element();
        if (isDefined(that._hasHeight) || element.is(":hidden")) {
            return
        }
        that._pivotGridContainer.addClass("dx-hidden");
        testElement = $(DIV).height(TEST_HEIGHT);
        element.append(testElement);
        that._hasHeight = element.height() !== TEST_HEIGHT;
        that._pivotGridContainer.removeClass("dx-hidden");
        testElement.remove()
    },
    _renderHeaders: function(rowHeaderContainer, columnHeaderContainer, filterHeaderContainer, dataHeaderContainer) {
        var that = this,
            dataSource = that.getDataSource(),
            FieldsArea = fieldsArea.FieldsArea;
        that._rowFields = that._rowFields || new FieldsArea(that, "row");
        that._rowFields.render(rowHeaderContainer, dataSource.getAreaFields("row"));
        that._columnFields = that._columnFields || new FieldsArea(that, "column");
        that._columnFields.render(columnHeaderContainer, dataSource.getAreaFields("column"));
        that._filterFields = that._filterFields || new FieldsArea(that, "filter");
        that._filterFields.render(filterHeaderContainer, dataSource.getAreaFields("filter"));
        that._dataFields = that._dataFields || new FieldsArea(that, "data");
        that._dataFields.render(dataHeaderContainer, dataSource.getAreaFields("data"));
        that.$element().dxPivotGridFieldChooserBase("instance").renderSortable()
    },
    _createTableElement: function() {
        var that = this;
        var $table = $("<table>").css({
            width: "100%"
        }).toggleClass(BORDERS_CLASS, !!that.option("showBorders")).toggleClass("dx-word-wrap", !!that.option("wordWrapEnabled"));
        eventsEngine.on($table, eventUtils.addNamespace(clickEvent.name, "dxPivotGrid"), "td", that._handleCellClick.bind(that));
        return $table
    },
    _renderDataArea: function(dataAreaElement) {
        var that = this,
            dataArea = that._dataArea || new dataAreaNamespace.DataArea(that);
        that._dataArea = dataArea;
        dataArea.render(dataAreaElement, that._dataController.getCellsInfo());
        return dataArea
    },
    _renderRowsArea: function(rowsAreaElement) {
        var that = this,
            rowsArea = that._rowsArea || new headersArea.VerticalHeadersArea(that);
        that._rowsArea = rowsArea;
        rowsArea.render(rowsAreaElement, that._dataController.getRowsInfo());
        return rowsArea
    },
    _renderColumnsArea: function(columnsAreaElement) {
        var that = this,
            columnsArea = that._columnsArea || new headersArea.HorizontalHeadersArea(that);
        that._columnsArea = columnsArea;
        columnsArea.render(columnsAreaElement, that._dataController.getColumnsInfo());
        return columnsArea
    },
    _initMarkup: function() {
        var that = this;
        that.callBase.apply(this, arguments);
        that.$element().addClass(PIVOTGRID_CLASS)
    },
    _renderContentImpl: function() {
        var columnsAreaElement, rowsAreaElement, dataAreaElement, tableElement, dataArea, rowsArea, columnsArea, rowHeaderContainer, columnHeaderContainer, filterHeaderContainer, dataHeaderContainer, that = this,
            isFirstDrawing = !that._pivotGridContainer;
        tableElement = !isFirstDrawing && that._tableElement();
        if (!tableElement) {
            that.$element().addClass(ROW_LINES_CLASS).addClass(FIELDS_CONTAINER_CLASS);
            that._pivotGridContainer = $(DIV).addClass("dx-pivotgrid-container");
            that._renderFieldChooser();
            that._renderContextMenu();
            columnsAreaElement = $(TD).addClass(COLUMN_AREA_CELL_CLASS);
            rowsAreaElement = $(TD).addClass(ROW_AREA_CELL_CLASS);
            dataAreaElement = $(TD).addClass(DATA_AREA_CELL_CLASS);
            tableElement = that._createTableElement();
            dataHeaderContainer = $(TD).addClass("dx-data-header");
            filterHeaderContainer = $("<td>").attr("colspan", "2").addClass("dx-filter-header");
            columnHeaderContainer = $(TD).addClass("dx-column-header");
            rowHeaderContainer = $(TD).addClass(DESCRIPTION_AREA_CELL_CLASS);
            $(TR).append(filterHeaderContainer).appendTo(tableElement);
            $(TR).append(dataHeaderContainer).append(columnHeaderContainer).appendTo(tableElement);
            $(TR).toggleClass("dx-ie", true === browser.msie).append(rowHeaderContainer).append(columnsAreaElement).appendTo(tableElement);
            $(TR).addClass(BOTTOM_ROW_CLASS).append(rowsAreaElement).append(dataAreaElement).appendTo(tableElement);
            that._pivotGridContainer.append(tableElement);
            that.$element().append(that._pivotGridContainer);
            if ("tree" === that.option("rowHeaderLayout")) {
                rowsAreaElement.addClass("dx-area-tree-view")
            }
        }
        that.$element().addClass(OVERFLOW_HIDDEN_CLASS);
        that._createComponent(that.$element(), PivotGridFieldChooserBase, {
            dataSource: that.getDataSource(),
            encodeHtml: that.option("encodeHtml"),
            allowFieldDragging: that.option("fieldPanel.allowFieldDragging"),
            headerFilter: that.option("headerFilter"),
            visible: that.option("visible")
        });
        dataArea = that._renderDataArea(dataAreaElement);
        rowsArea = that._renderRowsArea(rowsAreaElement);
        columnsArea = that._renderColumnsArea(columnsAreaElement);
        dataArea.tableElement().prepend(columnsArea.headElement());
        if (isFirstDrawing) {
            that._renderLoadPanel(dataArea.groupElement().parent(), that.$element());
            that._renderDescriptionArea();
            rowsArea.processScroll();
            columnsArea.processScroll()
        } [dataArea, rowsArea, columnsArea].forEach(function(area) {
            unsubscribeScrollEvents(area)
        });
        that._renderHeaders(rowHeaderContainer, columnHeaderContainer, filterHeaderContainer, dataHeaderContainer);
        that._update(isFirstDrawing)
    },
    _update: function(isFirstDrawing) {
        var updateHandler, that = this;
        updateHandler = function() {
            that.updateDimensions().done(function() {
                that._subscribeToEvents(that._columnsArea, that._rowsArea, that._dataArea)
            })
        };
        if (that._needDelayResizing(that._dataArea.getData()) && isFirstDrawing) {
            setTimeout(updateHandler)
        } else {
            updateHandler()
        }
    },
    _fireContentReadyAction: function() {
        if (!this._dataController.isLoading()) {
            this.callBase()
        }
    },
    getScrollPath: function(area) {
        var that = this;
        if ("column" === area) {
            return that._columnsArea.getScrollPath(that._scrollLeft)
        } else {
            return that._rowsArea.getScrollPath(that._scrollTop)
        }
    },
    getDataSource: function() {
        return this._dataController.getDataSource()
    },
    getFieldChooserPopup: function() {
        return this._fieldChooserPopup
    },
    hasScroll: function(area) {
        var that = this;
        return "column" === area ? that._columnsArea.hasScroll() : that._rowsArea.hasScroll()
    },
    _dimensionChanged: function() {
        this.updateDimensions()
    },
    _visibilityChanged: function(visible) {
        if (visible) {
            this.updateDimensions()
        }
    },
    _dispose: function() {
        var that = this;
        clearTimeout(that._hideLoadingTimeoutID);
        that.callBase.apply(that, arguments);
        if (that._dataController) {
            that._dataController.dispose()
        }
    },
    _tableElement: function() {
        return this.$element().find("table").first()
    },
    addWidgetPrefix: function(className) {
        return "dx-pivotgrid-" + className
    },
    resize: function() {
        this.updateDimensions()
    },
    isReady: function() {
        return this.callBase() && !this._dataController.isLoading()
    },
    updateDimensions: function() {
        var groupWidth, groupHeight, dataAreaHeights, rowsAreaHeights, resultHeights, resultWidths, rowsAreaColumnWidths, bordersWidth, hasRowsScroll, hasColumnsScroll, elementWidth, columnsAreaHeight, descriptionCellHeight, columnsAreaRowHeights, rowHeights, columnsAreaRowCount, needSynchronizeFieldPanel, that = this,
            tableElement = that._tableElement(),
            rowsArea = that._rowsArea,
            columnsArea = that._columnsArea,
            dataArea = that._dataArea,
            totalWidth = 0,
            totalHeight = 0,
            rowsAreaWidth = 0,
            scrollBarInfo = getScrollBarInfo(that.option("scrolling.useNative")),
            scrollBarWidth = scrollBarInfo.scrollBarWidth,
            dataAreaCell = tableElement.find("." + DATA_AREA_CELL_CLASS),
            rowAreaCell = tableElement.find("." + ROW_AREA_CELL_CLASS),
            columnAreaCell = tableElement.find("." + COLUMN_AREA_CELL_CLASS),
            descriptionCell = tableElement.find("." + DESCRIPTION_AREA_CELL_CLASS),
            filterHeaderCell = tableElement.find(".dx-filter-header"),
            columnHeaderCell = tableElement.find(".dx-column-header"),
            rowFieldsHeader = that._rowFields,
            d = new Deferred;
        if (!windowUtils.hasWindow()) {
            return
        }
        needSynchronizeFieldPanel = rowFieldsHeader.isVisible() && "tree" !== that.option("rowHeaderLayout"), that._detectHasContainerHeight();
        if (!dataArea.headElement().length) {
            dataArea.tableElement().prepend(columnsArea.headElement())
        }
        if (needSynchronizeFieldPanel) {
            rowsArea.updateColspans(rowFieldsHeader.getColumnsCount());
            rowsArea.tableElement().prepend(rowFieldsHeader.headElement())
        }
        tableElement.addClass(INCOMPRESSIBLE_FIELDS_CLASS);
        dataArea.reset();
        rowsArea.reset();
        columnsArea.reset();
        rowFieldsHeader.reset();
        commonUtils.deferUpdate(function() {
            resultWidths = dataArea.getColumnsWidth();
            rowHeights = rowsArea.getRowsHeight();
            rowsAreaHeights = needSynchronizeFieldPanel ? rowHeights.slice(1) : rowHeights;
            dataAreaHeights = dataArea.getRowsHeight();
            descriptionCellHeight = getSize(descriptionCell[0], "height", {
                paddings: true,
                borders: true,
                margins: true
            }) + (needSynchronizeFieldPanel ? rowHeights[0] : 0);
            columnsAreaRowCount = that._dataController.getColumnsInfo().length;
            resultHeights = pivotGridUtils.mergeArraysByMaxValue(rowsAreaHeights, dataAreaHeights.slice(columnsAreaRowCount));
            columnsAreaRowHeights = dataAreaHeights.slice(0, columnsAreaRowCount);
            columnsAreaHeight = getArraySum(columnsAreaRowHeights);
            rowsAreaColumnWidths = rowsArea.getColumnsWidth();
            if (that._hasHeight) {
                bordersWidth = getCommonBorderWidth([columnAreaCell, dataAreaCell, tableElement, columnHeaderCell, filterHeaderCell], "height");
                groupHeight = that.$element().height() - filterHeaderCell.height() - tableElement.find(".dx-data-header").height() - (Math.max(dataArea.headElement().height(), columnAreaCell.height(), descriptionCellHeight) + bordersWidth)
            }
            totalWidth = dataArea.tableElement().width();
            totalHeight = getArraySum(resultHeights);
            if (!totalWidth || !totalHeight) {
                d.resolve();
                return
            }
            rowsAreaWidth = getArraySum(rowsAreaColumnWidths);
            elementWidth = that.$element().width();
            bordersWidth = getCommonBorderWidth([rowAreaCell, dataAreaCell, tableElement], "width");
            groupWidth = elementWidth - rowsAreaWidth - bordersWidth;
            groupWidth = groupWidth > 0 ? groupWidth : totalWidth;
            hasRowsScroll = that._hasHeight && totalHeight - groupHeight >= 1;
            hasColumnsScroll = totalWidth - groupWidth >= 1;
            if (!hasRowsScroll) {
                groupHeight = totalHeight + (hasColumnsScroll ? scrollBarWidth : 0)
            }
            commonUtils.deferRender(function() {
                columnsArea.tableElement().append(dataArea.headElement());
                rowFieldsHeader.tableElement().append(rowsArea.headElement());
                if (!hasColumnsScroll && hasRowsScroll && scrollBarWidth) {
                    adjustSizeArray(resultWidths, scrollBarWidth);
                    totalWidth -= scrollBarWidth
                }
                if (descriptionCellHeight > columnsAreaHeight) {
                    adjustSizeArray(columnsAreaRowHeights, columnsAreaHeight - descriptionCellHeight);
                    columnsArea.setRowsHeight(columnsAreaRowHeights)
                }
                tableElement.removeClass(INCOMPRESSIBLE_FIELDS_CLASS);
                columnHeaderCell.children().css("maxWidth", groupWidth);
                columnsArea.groupWidth(groupWidth);
                columnsArea.processScrollBarSpacing(hasRowsScroll ? scrollBarWidth : 0);
                columnsArea.setColumnsWidth(resultWidths);
                rowsArea.groupHeight(that._hasHeight ? groupHeight : "auto");
                rowsArea.processScrollBarSpacing(hasColumnsScroll ? scrollBarWidth : 0);
                rowsArea.setColumnsWidth(rowsAreaColumnWidths);
                rowsArea.setRowsHeight(resultHeights);
                dataArea.setColumnsWidth(resultWidths);
                dataArea.setRowsHeight(resultHeights);
                dataArea.groupWidth(groupWidth);
                dataArea.groupHeight(that._hasHeight ? groupHeight : "auto");
                needSynchronizeFieldPanel && rowFieldsHeader.setColumnsWidth(rowsAreaColumnWidths);
                dataAreaCell.toggleClass(BOTTOM_BORDER_CLASS, !hasRowsScroll);
                rowAreaCell.toggleClass(BOTTOM_BORDER_CLASS, !hasRowsScroll);
                if (!that._hasHeight && elementWidth !== that.$element().width()) {
                    var diff = elementWidth - that.$element().width();
                    if (!hasColumnsScroll) {
                        adjustSizeArray(resultWidths, diff);
                        columnsArea.setColumnsWidth(resultWidths);
                        dataArea.setColumnsWidth(resultWidths)
                    }
                    dataArea.groupWidth(groupWidth - diff);
                    columnsArea.groupWidth(groupWidth - diff)
                }
                if ("virtual" === that.option("scrolling.mode") && !that._dataController.isEmpty()) {
                    var virtualContentParams = that._dataController.calculateVirtualContentParams({
                        contentWidth: totalWidth,
                        contentHeight: totalHeight,
                        rowCount: resultHeights.length,
                        columnCount: resultWidths.length,
                        viewportWidth: groupWidth,
                        viewportHeight: that._hasHeight ? groupHeight : $(window).outerHeight()
                    });
                    dataArea.setVirtualContentParams({
                        top: virtualContentParams.contentTop,
                        left: virtualContentParams.contentLeft,
                        width: virtualContentParams.width,
                        height: virtualContentParams.height
                    });
                    rowsArea.setVirtualContentParams({
                        top: virtualContentParams.contentTop,
                        width: rowsAreaWidth,
                        height: virtualContentParams.height
                    });
                    columnsArea.setVirtualContentParams({
                        left: virtualContentParams.contentLeft,
                        width: virtualContentParams.width,
                        height: columnsArea.groupElement().height()
                    })
                }
                var updateScrollableResults = [];
                dataArea.processScroll(scrollBarInfo.scrollBarUseNative, hasColumnsScroll, hasRowsScroll);
                each([columnsArea, rowsArea, dataArea], function(_, area) {
                    updateScrollableResults.push(area && area.updateScrollable())
                });
                that._updateLoading();
                that._renderNoDataText(dataAreaCell);
                when.apply($, updateScrollableResults).done(function() {
                    that._updateScrollPosition(columnsArea, rowsArea, dataArea);
                    d.resolve()
                })
            })
        });
        return d
    },
    applyPartialDataSource: function(area, path, dataSource) {
        this._dataController.applyPartialDataSource(area, path, dataSource)
    }
}).inherit(ExportMixin).include(chartIntegrationMixin);
registerComponent("dxPivotGrid", PivotGrid);
module.exports = PivotGrid;
