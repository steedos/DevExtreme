/**
 * DevExtreme (ui/grid_core/ui.grid_core.columns_resizing_reordering.js)
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
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _callbacks = require("../../core/utils/callbacks");
var _callbacks2 = _interopRequireDefault(_callbacks);
var _type = require("../../core/utils/type");
var _type2 = _interopRequireDefault(_type);
var _iterator = require("../../core/utils/iterator");
var _extend = require("../../core/utils/extend");
var _utils = require("../../events/utils");
var _pointer = require("../../events/pointer");
var _pointer2 = _interopRequireDefault(_pointer);
var _drag = require("../../events/drag");
var _drag2 = _interopRequireDefault(_drag);
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _uiGrid_core3 = require("./ui.grid_core.utils");
var _uiGrid_core4 = _interopRequireDefault(_uiGrid_core3);
var _fx = require("../../animation/fx");
var _fx2 = _interopRequireDefault(_fx);
var _swatch_container = require("../widget/swatch_container");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var COLUMNS_SEPARATOR_CLASS = "columns-separator",
    COLUMNS_SEPARATOR_TRANSPARENT = "columns-separator-transparent",
    DRAGGING_HEADER_CLASS = "drag-header",
    CELL_CONTENT_CLASS = "text-content",
    HEADERS_DRAG_ACTION_CLASS = "drag-action",
    TRACKER_CLASS = "tracker",
    HEADERS_DROP_HIGHLIGHT_CLASS = "drop-highlight",
    BLOCK_SEPARATOR_CLASS = "dx-block-separator",
    HEADER_ROW_CLASS = "dx-header-row",
    WIDGET_CLASS = "dx-widget",
    DRAGGING_COMMAND_CELL_CLASS = "dx-drag-command-cell",
    MODULE_NAMESPACE = "dxDataGridResizingReordering",
    COLUMNS_SEPARATOR_TOUCH_TRACKER_WIDTH = 10,
    DRAGGING_DELTA = 5,
    COLUMN_OPACITY = .5;
var allowResizing = function(that) {
    return that.option("allowColumnResizing") || that.getController("columns").isColumnOptionUsed("allowResizing")
};
var allowReordering = function(that) {
    return that.option("allowColumnReordering") || that.getController("columns").isColumnOptionUsed("allowReordering")
};
var TrackerView = _uiGrid_core2.default.View.inherit({
    _renderCore: function() {
        this.callBase();
        this.element().addClass(this.addWidgetPrefix(TRACKER_CLASS));
        this.hide()
    },
    _unsubscribeFromCallback: function() {
        if (this._positionChanged) {
            this._tablePositionController.positionChanged.remove(this._positionChanged)
        }
    },
    _subscribeToCallback: function() {
        var that = this;
        that._positionChanged = function(position) {
            var $element = that.element();
            if ($element && $element.hasClass(that.addWidgetPrefix(TRACKER_CLASS))) {
                $element.css({
                    top: position.top
                });
                $element.height(position.height)
            }
        };
        this._tablePositionController.positionChanged.add(that._positionChanged)
    },
    optionChanged: function(args) {
        if ("allowColumnResizing" === args.name) {
            this._unsubscribeFromCallback();
            if (args.value) {
                this._subscribeToCallback();
                this._invalidate()
            }
        }
        this.callBase(args)
    },
    init: function() {
        this.callBase();
        this._tablePositionController = this.getController("tablePosition");
        this._subscribeToCallback()
    },
    isVisible: function() {
        return allowResizing(this)
    },
    show: function() {
        this.element().show()
    },
    hide: function() {
        this.element() && this.element().hide()
    },
    setHeight: function(value) {
        this.element().height(value)
    },
    dispose: function() {
        this._unsubscribeFromCallback();
        this.callBase()
    }
});
var SeparatorView = _uiGrid_core2.default.View.inherit({
    _renderSeparator: function() {},
    _renderCore: function(options) {
        this.callBase(options);
        this._isShown = true;
        this._renderSeparator();
        this.hide()
    },
    show: function() {
        this._isShown = true
    },
    hide: function() {
        this._isShown = false
    },
    height: function(value) {
        var $element = this.element();
        if ($element) {
            if (_type2.default.isDefined(value)) {
                $element.height(value)
            } else {
                return $element.height()
            }
        }
    },
    width: function(value) {
        var $element = this.element();
        if ($element) {
            if (_type2.default.isDefined(value)) {
                $element.width(value)
            } else {
                return $element.width()
            }
        }
    }
});
var ColumnsSeparatorView = SeparatorView.inherit({
    _renderSeparator: function() {
        this.callBase();
        var $element = this.element();
        $element.addClass(this.addWidgetPrefix(COLUMNS_SEPARATOR_CLASS))
    },
    _subscribeToCallback: function() {
        var $element, that = this;
        that._positionChanged = function(position) {
            $element = that.element();
            if ($element) {
                $element.css({
                    top: position.top
                });
                $element.height(position.height)
            }
        };
        that._tablePositionController.positionChanged.add(that._positionChanged)
    },
    _unsubscribeFromCallback: function() {
        this._positionChanged && this._tablePositionController.positionChanged.remove(this._positionChanged)
    },
    _init: function() {
        this._isTransparent = allowResizing(this);
        if (this.isVisible()) {
            this._subscribeToCallback()
        }
    },
    isVisible: function() {
        return this.option("showColumnHeaders") && (allowReordering(this) || allowResizing(this))
    },
    optionChanged: function(args) {
        if ("allowColumnResizing" === args.name) {
            if (args.value) {
                this._init();
                this._invalidate();
                this.hide(true)
            } else {
                this._unsubscribeFromCallback();
                this._isTransparent = allowResizing(this);
                this.hide(true)
            }
        }
        this.callBase(args)
    },
    init: function() {
        this.callBase();
        this._tablePositionController = this.getController("tablePosition");
        this._init()
    },
    show: function() {
        var that = this,
            $element = this.element();
        if ($element && !that._isShown) {
            if (that._isTransparent) {
                $element.removeClass(that.addWidgetPrefix(COLUMNS_SEPARATOR_TRANSPARENT))
            } else {
                $element.show()
            }
        }
        this.callBase()
    },
    hide: function(force) {
        var $element = this.element(),
            columnsSeparatorTransparent = this.addWidgetPrefix(COLUMNS_SEPARATOR_TRANSPARENT);
        if ($element && (this._isShown || force)) {
            if (this._isTransparent) {
                $element.addClass(columnsSeparatorTransparent);
                $element.css("left", "");
                $element.show()
            } else {
                if ($element.hasClass(columnsSeparatorTransparent)) {
                    $element.removeClass(columnsSeparatorTransparent)
                }
                $element.hide()
            }
        }
        this.callBase()
    },
    moveByX: function(outerX) {
        var $element = this.element();
        if ($element) {
            $element.css("left", outerX - this._parentElement().offset().left)
        }
    },
    changeCursor: function(cursorName) {
        cursorName = _type2.default.isDefined(cursorName) ? cursorName : "";
        var $element = this.element();
        if ($element) {
            $element.css("cursor", cursorName)
        }
    },
    dispose: function() {
        this._unsubscribeFromCallback();
        this.callBase()
    }
});
var BlockSeparatorView = SeparatorView.inherit({
    init: function() {
        var that = this;
        this.callBase();
        this.getController("data").loadingChanged.add(function(isLoading) {
            if (!isLoading) {
                that.hide()
            }
        })
    },
    _renderSeparator: function() {
        this.callBase();
        this.element().addClass(BLOCK_SEPARATOR_CLASS).html("&nbsp;")
    },
    hide: function() {
        var that = this,
            $parent = this._parentElement(),
            $element = this.element();
        if ($element && this._isShown) {
            $element.css("display", "none")
        }
        if ($parent && !$parent.children("." + BLOCK_SEPARATOR_CLASS).length) {
            $parent.prepend(that.element())
        }
        that.callBase()
    },
    isVisible: function() {
        var groupPanelOptions = this.option("groupPanel"),
            columnChooserOptions = this.option("columnChooser");
        return groupPanelOptions && groupPanelOptions.visible || columnChooserOptions && columnChooserOptions.enabled
    },
    show: function(targetLocation) {
        var that = this,
            $element = this.element(),
            startAnimate = function(toOptions) {
                _fx2.default.stop($element, true);
                _fx2.default.animate($element, {
                    type: "slide",
                    from: {
                        width: 0,
                        display: toOptions.display
                    },
                    to: toOptions,
                    duration: 300,
                    easing: "swing"
                })
            };
        if ($element && !that._isShown) {
            switch (targetLocation) {
                case "group":
                    startAnimate({
                        width: "50px",
                        display: "inline-block"
                    });
                    break;
                case "columnChooser":
                    startAnimate({
                        width: "100%",
                        display: "block"
                    });
                    break;
                default:
                    $element.css("display", "")
            }
        }
        that.callBase()
    }
});
var DraggingHeaderView = _uiGrid_core2.default.View.inherit({
    _isDragging: false,
    _getDraggingPanelByPos: function(pos) {
        var result, that = this;
        (0, _iterator.each)(that._dragOptions.draggingPanels, function(index, draggingPanel) {
            if (draggingPanel) {
                var boundingRect = draggingPanel.getBoundingRect();
                if (boundingRect && (void 0 === boundingRect.bottom || pos.y < boundingRect.bottom) && (void 0 === boundingRect.top || pos.y > boundingRect.top) && (void 0 === boundingRect.left || pos.x > boundingRect.left) && (void 0 === boundingRect.right || pos.x < boundingRect.right)) {
                    result = draggingPanel;
                    return false
                }
            }
        });
        return result
    },
    _renderCore: function() {
        this.element().addClass(this.addWidgetPrefix(DRAGGING_HEADER_CLASS) + " " + this.addWidgetPrefix(CELL_CONTENT_CLASS) + " " + WIDGET_CLASS).hide()
    },
    _resetTargetColumnOptions: function() {
        var params = this._dropOptions;
        params.targetColumnIndex = -1;
        delete params.targetColumnElement;
        delete params.isLast;
        delete params.posX;
        delete params.posY
    },
    _getVisibleIndexObject: function(rowIndex, visibleIndex) {
        if (_type2.default.isDefined(rowIndex)) {
            return {
                columnIndex: visibleIndex,
                rowIndex: rowIndex
            }
        }
        return visibleIndex
    },
    dispose: function() {
        var element = this.element();
        this._dragOptions = null;
        element && element.parent().find("." + this.addWidgetPrefix(DRAGGING_HEADER_CLASS)).remove()
    },
    isVisible: function() {
        var columnsController = this.getController("columns"),
            commonColumnSettings = columnsController.getCommonSettings();
        return this.option("showColumnHeaders") && (allowReordering(this) || commonColumnSettings.allowGrouping || commonColumnSettings.allowHiding)
    },
    init: function() {
        var that = this;
        this.callBase();
        this._controller = this.getController("draggingHeader");
        this._columnsResizerViewController = this.getController("columnsResizer");
        this.getController("data").loadingChanged.add(function(isLoading) {
            var element = that.element();
            if (!isLoading && element) {
                element.hide()
            }
        })
    },
    dragHeader: function(options) {
        var that = this,
            columnElement = options.columnElement,
            isCommandColumn = !!options.sourceColumn.type;
        that._isDragging = true;
        that._dragOptions = options;
        that._dropOptions = {
            sourceIndex: options.index,
            sourceColumnIndex: that._getVisibleIndexObject(options.rowIndex, options.columnIndex),
            sourceColumnElement: options.columnElement,
            sourceLocation: options.sourceLocation
        };
        var document = _dom_adapter2.default.getDocument();
        that._onSelectStart = document.onselectstart;
        document.onselectstart = function() {
            return false
        };
        that._controller.drag(that._dropOptions);
        that.element().css({
            textAlign: columnElement && columnElement.css("textAlign"),
            height: columnElement && (isCommandColumn && columnElement.get(0).clientHeight || columnElement.height()),
            width: columnElement && (isCommandColumn && columnElement.get(0).clientWidth || columnElement.width()),
            whiteSpace: columnElement && columnElement.css("whiteSpace")
        }).addClass(that.addWidgetPrefix(HEADERS_DRAG_ACTION_CLASS)).toggleClass(DRAGGING_COMMAND_CELL_CLASS, isCommandColumn).text(isCommandColumn ? "" : options.sourceColumn.caption);
        that.element().appendTo((0, _swatch_container.getSwatchContainer)(columnElement))
    },
    moveHeader: function(args) {
        var newLeft, newTop, moveDeltaX, moveDeltaY, e = args.event,
            that = e.data.that,
            eventData = (0, _utils.eventData)(e),
            isResizing = that._columnsResizerViewController ? that._columnsResizerViewController.isResizing() : false,
            dragOptions = that._dragOptions;
        if (that._isDragging && !isResizing) {
            var $element = that.element();
            moveDeltaX = Math.abs(eventData.x - dragOptions.columnElement.offset().left - dragOptions.deltaX);
            moveDeltaY = Math.abs(eventData.y - dragOptions.columnElement.offset().top - dragOptions.deltaY);
            if ($element.is(":visible") || moveDeltaX > DRAGGING_DELTA || moveDeltaY > DRAGGING_DELTA) {
                $element.show();
                newLeft = eventData.x - dragOptions.deltaX;
                newTop = eventData.y - dragOptions.deltaY;
                $element.css({
                    left: newLeft,
                    top: newTop
                });
                that.dockHeader(eventData)
            }
            e.preventDefault()
        }
    },
    dockHeader: function(eventData) {
        var i, centerPosition, that = this,
            targetDraggingPanel = that._getDraggingPanelByPos(eventData),
            controller = that._controller,
            params = that._dropOptions,
            dragOptions = that._dragOptions;
        if (targetDraggingPanel) {
            var rtlEnabled = that.option("rtlEnabled"),
                isVerticalOrientation = "columnChooser" === targetDraggingPanel.getName(),
                axisName = isVerticalOrientation ? "y" : "x",
                targetLocation = targetDraggingPanel.getName(),
                rowIndex = "headers" === targetLocation ? dragOptions.rowIndex : void 0,
                sourceColumn = dragOptions.sourceColumn,
                columnElements = targetDraggingPanel.getColumnElements(rowIndex, sourceColumn && sourceColumn.ownerBand) || [],
                pointsByTarget = dragOptions.pointsByTarget = dragOptions.pointsByTarget || {},
                pointsByColumns = "columnChooser" === targetLocation ? [] : pointsByTarget[targetLocation] || controller._generatePointsByColumns((0, _extend.extend)({}, dragOptions, {
                    targetDraggingPanel: targetDraggingPanel,
                    columns: targetDraggingPanel.getColumns(rowIndex),
                    columnElements: columnElements,
                    isVerticalOrientation: isVerticalOrientation,
                    startColumnIndex: "headers" === targetLocation && (0, _renderer2.default)(columnElements[0]).index()
                }));
            pointsByTarget[targetLocation] = pointsByColumns;
            params.targetLocation = targetLocation;
            if (pointsByColumns.length > 0) {
                for (i = 0; i < pointsByColumns.length; i++) {
                    centerPosition = pointsByColumns[i + 1] && (pointsByColumns[i][axisName] + pointsByColumns[i + 1][axisName]) / 2;
                    if (void 0 === centerPosition || (rtlEnabled && "x" === axisName ? eventData[axisName] > centerPosition : eventData[axisName] < centerPosition)) {
                        params.targetColumnIndex = that._getVisibleIndexObject(rowIndex, pointsByColumns[i].columnIndex);
                        if (columnElements[i]) {
                            params.targetColumnElement = columnElements.eq(i);
                            params.isLast = false
                        } else {
                            params.targetColumnElement = columnElements.last();
                            params.isLast = true
                        }
                        params.posX = pointsByColumns[i].x;
                        params.posY = pointsByColumns[i].y;
                        controller.dock(params);
                        break
                    }
                }
            } else {
                that._resetTargetColumnOptions();
                controller.dock(params)
            }
        }
    },
    dropHeader: function(args) {
        var e = args.event,
            that = e.data.that,
            controller = that._controller;
        that.element().hide();
        if (controller && that._isDragging) {
            controller.drop(that._dropOptions)
        }
        that.element().appendTo(that._parentElement());
        that._dragOptions = null;
        that._dropOptions = null;
        that._isDragging = false;
        _dom_adapter2.default.getDocument().onselectstart = that._onSelectStart || null
    }
});
var isNextColumnResizingMode = function(that) {
    return "widget" !== that.option("columnResizingMode")
};
var ColumnsResizerViewController = _uiGrid_core2.default.ViewController.inherit({
    _isHeadersRowArea: function(posY) {
        if (this._columnHeadersView) {
            var headersRowHeight, offsetTop, element = this._columnHeadersView.element();
            if (element) {
                offsetTop = element.offset().top;
                headersRowHeight = this._columnHeadersView.getHeadersRowHeight();
                return posY >= offsetTop && posY <= offsetTop + headersRowHeight
            }
        }
        return false
    },
    _pointCreated: function(point, cellsLength, columns) {
        var currentColumn, nextColumn, isNextColumnMode = isNextColumnResizingMode(this),
            rtlEnabled = this.option("rtlEnabled"),
            firstPointColumnIndex = !isNextColumnMode && rtlEnabled ? 0 : 1;
        if (point.index >= firstPointColumnIndex && point.index < cellsLength + (!isNextColumnMode && !rtlEnabled ? 1 : 0)) {
            point.columnIndex -= firstPointColumnIndex;
            currentColumn = columns[point.columnIndex] || {};
            nextColumn = columns[point.columnIndex + 1] || {};
            return !(isNextColumnMode ? currentColumn.allowResizing && nextColumn.allowResizing : currentColumn.allowResizing)
        }
        return true
    },
    _getTargetPoint: function(pointsByColumns, currentX, deltaX) {
        if (pointsByColumns) {
            for (var i = 0; i < pointsByColumns.length; i++) {
                if (pointsByColumns[i].x === pointsByColumns[0].x && pointsByColumns[i + 1] && pointsByColumns[i].x === pointsByColumns[i + 1].x) {
                    continue
                }
                if (pointsByColumns[i].x - deltaX <= currentX && currentX <= pointsByColumns[i].x + deltaX) {
                    return pointsByColumns[i]
                }
            }
        }
        return null
    },
    _moveSeparator: function(args) {
        var e = args.event,
            that = e.data,
            columnsSeparatorWidth = that._columnsSeparatorView.width(),
            columnsSeparatorOffset = that._columnsSeparatorView.element().offset(),
            isNextColumnMode = isNextColumnResizingMode(that),
            deltaX = columnsSeparatorWidth / 2,
            parentOffset = that._$parentContainer.offset(),
            parentOffsetLeft = parentOffset.left,
            eventData = (0, _utils.eventData)(e);
        if (that._isResizing && that._resizingInfo) {
            if (parentOffsetLeft <= eventData.x && (!isNextColumnMode || eventData.x <= parentOffsetLeft + that._$parentContainer.width())) {
                if (that._updateColumnsWidthIfNeeded(eventData.x)) {
                    var $cell = that._columnHeadersView.getColumnElements().eq(that._resizingInfo.currentColumnIndex);
                    that._columnsSeparatorView.moveByX($cell.offset().left + (isNextColumnMode && that.option("rtlEnabled") ? 0 : $cell.outerWidth()));
                    that._tablePositionController.update(that._targetPoint.y);
                    e.preventDefault()
                }
            }
        } else {
            if (that._isHeadersRowArea(eventData.y)) {
                if (that._previousParentOffset) {
                    if (that._previousParentOffset.left !== parentOffset.left || that._previousParentOffset.top !== parentOffset.top) {
                        that.pointsByColumns(null)
                    }
                }
                that._targetPoint = that._getTargetPoint(that.pointsByColumns(), eventData.x, columnsSeparatorWidth);
                that._previousParentOffset = parentOffset;
                that._isReadyResizing = false;
                if (that._targetPoint && that._targetPoint.y <= eventData.y && columnsSeparatorOffset.top + that._columnsSeparatorView.height() >= eventData.y) {
                    that._columnsSeparatorView.changeCursor("col-resize");
                    that._columnsSeparatorView.moveByX(that._targetPoint.x - deltaX);
                    that._tablePositionController.update(that._targetPoint.y);
                    that._isReadyResizing = true;
                    e.preventDefault()
                } else {
                    that._columnsSeparatorView.changeCursor()
                }
            } else {
                that.pointsByColumns(null);
                that._isReadyResizing = false;
                that._columnsSeparatorView.changeCursor()
            }
        }
    },
    _endResizing: function(args) {
        var e = args.event,
            that = e.data;
        if (that._isResizing) {
            that.pointsByColumns(null);
            that._resizingInfo = null;
            that._columnsSeparatorView.hide();
            that._columnsSeparatorView.changeCursor();
            that._trackerView.hide();
            if (!isNextColumnResizingMode(that)) {
                var pageIndex = that.component.pageIndex();
                that.component.updateDimensions();
                if (that.option("wordWrapEnabled") && "virtual" === that.option("scrolling.mode")) {
                    that.component.refresh().done(function() {
                        that._rowsView.scrollToPage(pageIndex)
                    })
                }
            }
            that._isReadyResizing = false;
            that._isResizing = false
        }
    },
    _getNextColumnIndex: function(currentColumnIndex) {
        return currentColumnIndex + 1
    },
    _setupResizingInfo: function(posX) {
        var that = this,
            currentColumnIndex = that._targetPoint.columnIndex,
            nextColumnIndex = that._getNextColumnIndex(currentColumnIndex),
            currentHeader = that._columnHeadersView.getHeaderElement(currentColumnIndex),
            nextHeader = that._columnHeadersView.getHeaderElement(nextColumnIndex);
        that._resizingInfo = {
            startPosX: posX,
            currentColumnIndex: currentColumnIndex,
            currentColumnWidth: currentHeader && currentHeader.length > 0 ? currentHeader[0].getBoundingClientRect().width : 0,
            nextColumnIndex: nextColumnIndex,
            nextColumnWidth: nextHeader && nextHeader.length > 0 ? nextHeader[0].getBoundingClientRect().width : 0
        }
    },
    _startResizing: function(args) {
        var e = args.event,
            that = e.data,
            eventData = (0, _utils.eventData)(e),
            editingController = that.getController("editing"),
            editingMode = that.option("editing.mode"),
            isCellEditing = editingController.isEditing() && ("batch" === editingMode || "cell" === editingMode);
        if ((0, _utils.isTouchEvent)(e)) {
            if (that._isHeadersRowArea(eventData.y)) {
                that._targetPoint = that._getTargetPoint(that.pointsByColumns(), eventData.x, COLUMNS_SEPARATOR_TOUCH_TRACKER_WIDTH);
                if (that._targetPoint) {
                    that._columnsSeparatorView.moveByX(that._targetPoint.x - that._columnsSeparatorView.width() / 2);
                    that._isReadyResizing = true
                }
            } else {
                that._isReadyResizing = false
            }
        }
        if (that._isReadyResizing && !isCellEditing) {
            that._setupResizingInfo(eventData.x);
            that._tablePositionController.update(that._targetPoint.y);
            that._columnsSeparatorView.show();
            that._trackerView.show();
            that._isResizing = true;
            e.preventDefault();
            e.stopPropagation()
        }
    },
    _generatePointsByColumns: function() {
        var that = this,
            columns = that._columnsController ? that._columnsController.getVisibleColumns() : [],
            cells = that._columnHeadersView.getColumnElements(),
            pointsByColumns = [];
        if (cells && cells.length > 0) {
            pointsByColumns = _uiGrid_core4.default.getPointsByColumns(cells, function(point) {
                return that._pointCreated(point, cells.length, columns)
            })
        }
        that._pointsByColumns = pointsByColumns
    },
    _unsubscribeFromEvents: function() {
        this._moveSeparatorHandler && _events_engine2.default.off(_dom_adapter2.default.getDocument(), (0, _utils.addNamespace)(_pointer2.default.move, MODULE_NAMESPACE), this._moveSeparatorHandler);
        this._startResizingHandler && _events_engine2.default.off(this._$parentContainer, (0, _utils.addNamespace)(_pointer2.default.down, MODULE_NAMESPACE), this._startResizingHandler);
        if (this._endResizingHandler) {
            _events_engine2.default.off(this._columnsSeparatorView.element(), (0, _utils.addNamespace)(_pointer2.default.up, MODULE_NAMESPACE), this._endResizingHandler);
            _events_engine2.default.off(_dom_adapter2.default.getDocument(), (0, _utils.addNamespace)(_pointer2.default.up, MODULE_NAMESPACE), this._endResizingHandler)
        }
    },
    _subscribeToEvents: function() {
        this._moveSeparatorHandler = this.createAction(this._moveSeparator);
        this._startResizingHandler = this.createAction(this._startResizing);
        this._endResizingHandler = this.createAction(this._endResizing);
        _events_engine2.default.on(_dom_adapter2.default.getDocument(), (0, _utils.addNamespace)(_pointer2.default.move, MODULE_NAMESPACE), this, this._moveSeparatorHandler);
        _events_engine2.default.on(this._$parentContainer, (0, _utils.addNamespace)(_pointer2.default.down, MODULE_NAMESPACE), this, this._startResizingHandler);
        _events_engine2.default.on(this._columnsSeparatorView.element(), (0, _utils.addNamespace)(_pointer2.default.up, MODULE_NAMESPACE), this, this._endResizingHandler);
        _events_engine2.default.on(_dom_adapter2.default.getDocument(), (0, _utils.addNamespace)(_pointer2.default.up, MODULE_NAMESPACE), this, this._endResizingHandler)
    },
    _updateColumnsWidthIfNeeded: function(posX) {
        var deltaX, nextCellWidth, column, minWidth, nextColumn, cellWidth, needUpdate = false,
            resizingInfo = this._resizingInfo,
            columnsController = this._columnsController,
            visibleColumns = columnsController.getVisibleColumns(),
            columnsSeparatorWidth = this._columnsSeparatorView.width(),
            contentWidth = this._rowsView.contentWidth(),
            isNextColumnMode = isNextColumnResizingMode(this),
            adaptColumnWidthByRatio = isNextColumnMode && this.option("adaptColumnWidthByRatio") && !this.option("columnAutoWidth");

        function isPercentWidth(width) {
            return _type2.default.isString(width) && "%" === width.slice(-1)
        }

        function setColumnWidth(column, columnWidth, contentWidth, adaptColumnWidthByRatio) {
            if (column) {
                var oldColumnWidth = column.width;
                if (oldColumnWidth) {
                    adaptColumnWidthByRatio = isPercentWidth(oldColumnWidth)
                }
                if (adaptColumnWidthByRatio) {
                    column && columnsController.columnOption(column.index, "visibleWidth", columnWidth);
                    column && columnsController.columnOption(column.index, "width", (columnWidth / contentWidth * 100).toFixed(3) + "%")
                } else {
                    column && columnsController.columnOption(column.index, "visibleWidth", null);
                    column && columnsController.columnOption(column.index, "width", columnWidth)
                }
            }
        }

        function correctContentWidth(contentWidth, visibleColumns) {
            var totalPercent, allColumnsHaveWidth = visibleColumns.every(function(column) {
                return column.width
            });
            if (allColumnsHaveWidth) {
                totalPercent = visibleColumns.reduce(function(sum, column) {
                    if (isPercentWidth(column.width)) {
                        sum += parseFloat(column.width)
                    }
                    return sum
                }, 0);
                if (totalPercent > 100) {
                    contentWidth = contentWidth / totalPercent * 100
                }
            }
            return contentWidth
        }
        deltaX = posX - resizingInfo.startPosX;
        if (isNextColumnMode && this.option("rtlEnabled")) {
            deltaX = -deltaX
        }
        cellWidth = resizingInfo.currentColumnWidth + deltaX;
        column = visibleColumns[resizingInfo.currentColumnIndex];
        minWidth = column && column.minWidth || columnsSeparatorWidth;
        needUpdate = cellWidth >= minWidth;
        if (isNextColumnMode) {
            nextCellWidth = resizingInfo.nextColumnWidth - deltaX;
            nextColumn = visibleColumns[resizingInfo.nextColumnIndex];
            minWidth = nextColumn && nextColumn.minWidth || columnsSeparatorWidth;
            needUpdate = needUpdate && nextCellWidth >= minWidth
        }
        if (needUpdate) {
            columnsController.beginUpdate();
            cellWidth = Math.floor(cellWidth);
            contentWidth = correctContentWidth(contentWidth, visibleColumns);
            setColumnWidth(column, cellWidth, contentWidth, adaptColumnWidthByRatio);
            if (isNextColumnMode) {
                nextCellWidth = Math.floor(nextCellWidth);
                setColumnWidth(nextColumn, nextCellWidth, contentWidth, adaptColumnWidthByRatio)
            } else {
                var columnWidths = this._columnHeadersView.getColumnWidths();
                columnWidths[resizingInfo.currentColumnIndex] = cellWidth;
                var hasScroll = columnWidths.reduce(function(totalWidth, width) {
                    return totalWidth + width
                }, 0) > this._rowsView.contentWidth();
                if (!hasScroll) {
                    var lastColumnIndex = _uiGrid_core4.default.getLastResizableColumnIndex(visibleColumns);
                    if (lastColumnIndex >= 0) {
                        columnsController.columnOption(visibleColumns[lastColumnIndex].index, "visibleWidth", "auto")
                    }
                }
                for (var i = 0; i < columnWidths.length; i++) {
                    if (visibleColumns[i] && visibleColumns[i] !== column && void 0 === visibleColumns[i].width) {
                        columnsController.columnOption(visibleColumns[i].index, "width", columnWidths[i])
                    }
                }
            }
            columnsController.endUpdate()
        }
        return needUpdate
    },
    _subscribeToCallback: function(callback, handler) {
        callback.add(handler);
        this._subscribesToCallbacks.push({
            callback: callback,
            handler: handler
        })
    },
    _unsubscribeFromCallbacks: function() {
        var i, subscribe;
        for (i = 0; i < this._subscribesToCallbacks.length; i++) {
            subscribe = this._subscribesToCallbacks[i];
            subscribe.callback.remove(subscribe.handler)
        }
        this._subscribesToCallbacks = []
    },
    _unsubscribes: function() {
        this._unsubscribeFromEvents();
        this._unsubscribeFromCallbacks()
    },
    _init: function() {
        var that = this,
            generatePointsByColumnsHandler = function() {
                if (!that._isResizing) {
                    that.pointsByColumns(null)
                }
            },
            generatePointsByColumnsScrollHandler = function(offset) {
                if (that._scrollLeft !== offset.left) {
                    that._scrollLeft = offset.left;
                    that.pointsByColumns(null)
                }
            };
        that._columnsSeparatorView = that.getView("columnsSeparatorView");
        that._columnHeadersView = that.getView("columnHeadersView");
        that._trackerView = that.getView("trackerView");
        that._rowsView = that.getView("rowsView");
        that._columnsController = that.getController("columns");
        that._tablePositionController = that.getController("tablePosition");
        that._$parentContainer = that._columnsSeparatorView.component.$element();
        that._subscribeToCallback(that._columnHeadersView.renderCompleted, generatePointsByColumnsHandler);
        that._subscribeToCallback(that._columnHeadersView.resizeCompleted, generatePointsByColumnsHandler);
        that._subscribeToCallback(that._columnsSeparatorView.renderCompleted, function() {
            that._unsubscribeFromEvents();
            that._subscribeToEvents()
        });
        that._subscribeToCallback(that._rowsView.renderCompleted, function() {
            that._rowsView.scrollChanged.remove(generatePointsByColumnsScrollHandler);
            that._rowsView.scrollChanged.add(generatePointsByColumnsScrollHandler)
        });
        var previousScrollbarVisibility = 0 !== that._rowsView.getScrollbarWidth();
        var previousTableHeight = 0;
        that._subscribeToCallback(that.getController("tablePosition").positionChanged, function(e) {
            if (that._isResizing && !that._rowsView.isResizing) {
                var scrollbarVisibility = 0 !== that._rowsView.getScrollbarWidth();
                if (previousScrollbarVisibility !== scrollbarVisibility || previousTableHeight && previousTableHeight !== e.height) {
                    previousScrollbarVisibility = scrollbarVisibility;
                    previousTableHeight = e.height;
                    that.component.updateDimensions()
                } else {
                    that._rowsView.updateFreeSpaceRowHeight()
                }
            }
            previousTableHeight = e.height
        })
    },
    optionChanged: function(args) {
        this.callBase(args);
        if ("allowColumnResizing" === args.name) {
            if (args.value) {
                this._init();
                this._subscribeToEvents()
            } else {
                this._unsubscribes()
            }
        }
    },
    isResizing: function() {
        return this._isResizing
    },
    init: function() {
        this._subscribesToCallbacks = [];
        if (allowResizing(this)) {
            this._init()
        }
    },
    pointsByColumns: function(value) {
        if (void 0 !== value) {
            this._pointsByColumns = value
        } else {
            if (!this._pointsByColumns) {
                this._generatePointsByColumns()
            }
            return this._pointsByColumns
        }
    },
    dispose: function() {
        this._unsubscribes();
        this.callBase()
    }
});
var TablePositionViewController = _uiGrid_core2.default.ViewController.inherit({
    update: function(top) {
        var that = this,
            params = {},
            $element = that._columnHeadersView.element(),
            offset = $element && $element.offset(),
            offsetTop = offset && offset.top || 0,
            diffOffsetTop = _type2.default.isDefined(top) ? Math.abs(top - offsetTop) : 0,
            columnsHeadersHeight = that._columnHeadersView ? that._columnHeadersView.getHeight() : 0,
            rowsHeight = that._rowsView ? that._rowsView.height() - that._rowsView.getScrollbarWidth(true) : 0;
        params.height = columnsHeadersHeight + rowsHeight - diffOffsetTop;
        if (null !== top && $element && $element.length) {
            params.top = $element[0].offsetTop + diffOffsetTop
        }
        that.positionChanged.fire(params)
    },
    init: function() {
        var that = this;
        that.callBase();
        that._columnHeadersView = this.getView("columnHeadersView");
        that._rowsView = this.getView("rowsView");
        that._pagerView = this.getView("pagerView");
        that._rowsView.resizeCompleted.add(function() {
            if (that.option("allowColumnResizing")) {
                that.update(null)
            }
        })
    },
    ctor: function(component) {
        this.callBase(component);
        this.positionChanged = (0, _callbacks2.default)()
    }
});
var DraggingHeaderViewController = _uiGrid_core2.default.ViewController.inherit({
    _generatePointsByColumns: function(options) {
        var that = this;
        return _uiGrid_core4.default.getPointsByColumns(options.columnElements, function(point) {
            return that._pointCreated(point, options.columns, options.targetDraggingPanel.getName(), options.sourceColumn)
        }, options.isVerticalOrientation, options.startColumnIndex)
    },
    _pointCreated: function(point, columns, location, sourceColumn) {
        var targetColumn = columns[point.columnIndex],
            prevColumn = columns[point.columnIndex - 1];
        switch (location) {
            case "columnChooser":
                return true;
            case "headers":
                return sourceColumn && !sourceColumn.allowReordering || (!targetColumn || !targetColumn.allowReordering) && (!prevColumn || !prevColumn.allowReordering);
            default:
                return 0 === columns.length
        }
    },
    _subscribeToEvents: function(draggingHeader, draggingPanels) {
        var that = this;
        (0, _iterator.each)(draggingPanels, function(_, draggingPanel) {
            if (draggingPanel) {
                var i, columns, columnElements, rowCount = draggingPanel.getRowCount ? draggingPanel.getRowCount() : 1,
                    nameDraggingPanel = draggingPanel.getName(),
                    subscribeToEvents = function(index, columnElement) {
                        if (!columnElement) {
                            return
                        }
                        var $columnElement = (0, _renderer2.default)(columnElement),
                            column = columns[index];
                        if (draggingPanel.allowDragging(column, nameDraggingPanel, draggingPanels)) {
                            $columnElement.addClass(that.addWidgetPrefix(HEADERS_DRAG_ACTION_CLASS));
                            _events_engine2.default.on($columnElement, (0, _utils.addNamespace)(_drag2.default.start, MODULE_NAMESPACE), that.createAction(function(args) {
                                var e = args.event,
                                    eventData = (0, _utils.eventData)(e);
                                draggingHeader.dragHeader({
                                    deltaX: eventData.x - (0, _renderer2.default)(e.currentTarget).offset().left,
                                    deltaY: eventData.y - (0, _renderer2.default)(e.currentTarget).offset().top,
                                    sourceColumn: column,
                                    index: column.index,
                                    columnIndex: index,
                                    columnElement: $columnElement,
                                    sourceLocation: nameDraggingPanel,
                                    draggingPanels: draggingPanels,
                                    rowIndex: that._columnsController.getRowIndex(column.index, true)
                                })
                            }));
                            _events_engine2.default.on($columnElement, (0, _utils.addNamespace)(_drag2.default.move, MODULE_NAMESPACE), {
                                that: draggingHeader
                            }, that.createAction(draggingHeader.moveHeader));
                            _events_engine2.default.on($columnElement, (0, _utils.addNamespace)(_drag2.default.end, MODULE_NAMESPACE), {
                                that: draggingHeader
                            }, that.createAction(draggingHeader.dropHeader))
                        }
                    };
                for (i = 0; i < rowCount; i++) {
                    columnElements = draggingPanel.getColumnElements(i) || [];
                    if (columnElements.length) {
                        columns = draggingPanel.getColumns(i) || [];
                        (0, _iterator.each)(columnElements, subscribeToEvents)
                    }
                }
            }
        })
    },
    _unsubscribeFromEvents: function(draggingHeader, draggingPanels) {
        var that = this;
        (0, _iterator.each)(draggingPanels, function(_, draggingPanel) {
            if (draggingPanel) {
                var columnElements = draggingPanel.getColumnElements() || [];
                (0, _iterator.each)(columnElements, function(index, columnElement) {
                    var $columnElement = (0, _renderer2.default)(columnElement);
                    _events_engine2.default.off($columnElement, (0, _utils.addNamespace)(_drag2.default.start, MODULE_NAMESPACE));
                    _events_engine2.default.off($columnElement, (0, _utils.addNamespace)(_drag2.default.move, MODULE_NAMESPACE));
                    _events_engine2.default.off($columnElement, (0, _utils.addNamespace)(_drag2.default.end, MODULE_NAMESPACE));
                    $columnElement.removeClass(that.addWidgetPrefix(HEADERS_DRAG_ACTION_CLASS))
                })
            }
        })
    },
    _getSeparator: function(targetLocation) {
        return "headers" === targetLocation ? this._columnsSeparatorView : this._blockSeparatorView
    },
    hideSeparators: function(type) {
        var blockSeparator = this._blockSeparatorView,
            columnsSeparator = this._columnsSeparatorView;
        this._animationColumnIndex = null;
        blockSeparator && blockSeparator.hide();
        "block" !== type && columnsSeparator && columnsSeparator.hide()
    },
    init: function() {
        var subscribeToEvents, that = this;
        that.callBase();
        that._columnsController = that.getController("columns");
        that._columnHeadersView = that.getView("columnHeadersView");
        that._columnsSeparatorView = that.getView("columnsSeparatorView");
        that._draggingHeaderView = that.getView("draggingHeaderView");
        that._rowsView = that.getView("rowsView");
        that._blockSeparatorView = that.getView("blockSeparatorView");
        that._headerPanelView = that.getView("headerPanel");
        that._columnChooserView = that.getView("columnChooserView");
        subscribeToEvents = function() {
            if (that._draggingHeaderView) {
                var draggingPanels = [that._columnChooserView, that._columnHeadersView, that._headerPanelView];
                that._unsubscribeFromEvents(that._draggingHeaderView, draggingPanels);
                that._subscribeToEvents(that._draggingHeaderView, draggingPanels)
            }
        };
        that._columnHeadersView.renderCompleted.add(subscribeToEvents);
        that._headerPanelView && that._headerPanelView.renderCompleted.add(subscribeToEvents);
        that._columnChooserView && that._columnChooserView.renderCompleted.add(subscribeToEvents)
    },
    allowDrop: function(parameters) {
        return this._columnsController.allowMoveColumn(parameters.sourceColumnIndex, parameters.targetColumnIndex, parameters.sourceLocation, parameters.targetLocation)
    },
    drag: function(parameters) {
        var sourceIndex = parameters.sourceIndex,
            sourceLocation = parameters.sourceLocation,
            sourceColumnElement = parameters.sourceColumnElement,
            headersView = this._columnHeadersView,
            rowsView = this._rowsView;
        if (sourceColumnElement) {
            sourceColumnElement.css({
                opacity: COLUMN_OPACITY
            });
            if ("headers" === sourceLocation) {
                headersView && headersView.setRowsOpacity(sourceIndex, COLUMN_OPACITY);
                rowsView && rowsView.setRowsOpacity(sourceIndex, COLUMN_OPACITY)
            }
        }
    },
    dock: function(parameters) {
        var that = this,
            targetColumnIndex = _type2.default.isObject(parameters.targetColumnIndex) ? parameters.targetColumnIndex.columnIndex : parameters.targetColumnIndex,
            sourceLocation = parameters.sourceLocation,
            targetLocation = parameters.targetLocation,
            separator = that._getSeparator(targetLocation),
            hasTargetVisibleIndex = targetColumnIndex >= 0;
        var showSeparator = function() {
            if (that._animationColumnIndex !== targetColumnIndex) {
                that.hideSeparators();
                separator.element()[parameters.isLast ? "insertAfter" : "insertBefore"](parameters.targetColumnElement);
                that._animationColumnIndex = targetColumnIndex;
                separator.show(targetLocation)
            }
        };
        that._columnHeadersView.element().find("." + HEADER_ROW_CLASS).toggleClass(that.addWidgetPrefix(HEADERS_DROP_HIGHLIGHT_CLASS), "headers" !== sourceLocation && "headers" === targetLocation && !hasTargetVisibleIndex);
        if (separator) {
            if (that.allowDrop(parameters) && hasTargetVisibleIndex) {
                if ("group" === targetLocation || "columnChooser" === targetLocation) {
                    showSeparator()
                } else {
                    that.hideSeparators("block");
                    that.getController("tablePosition").update(parameters.posY);
                    separator.moveByX(parameters.posX - separator.width());
                    separator.show()
                }
            } else {
                that.hideSeparators()
            }
        }
    },
    drop: function(parameters) {
        var sourceColumnElement = parameters.sourceColumnElement;
        if (sourceColumnElement) {
            sourceColumnElement.css({
                opacity: ""
            });
            this._columnHeadersView.setRowsOpacity(parameters.sourceIndex, "");
            this._rowsView.setRowsOpacity(parameters.sourceIndex, "");
            this._columnHeadersView.element().find("." + HEADER_ROW_CLASS).removeClass(this.addWidgetPrefix(HEADERS_DROP_HIGHLIGHT_CLASS))
        }
        if (this.allowDrop(parameters)) {
            var separator = this._getSeparator(parameters.targetLocation);
            if (separator) {
                separator.hide()
            }
            this._columnsController.moveColumn(parameters.sourceColumnIndex, parameters.targetColumnIndex, parameters.sourceLocation, parameters.targetLocation)
        }
    },
    dispose: function() {
        if (this._draggingHeaderView) {
            this._unsubscribeFromEvents(this._draggingHeaderView, [this._columnChooserView, this._columnHeadersView, this._headerPanelView])
        }
    }
});
module.exports = {
    views: {
        columnsSeparatorView: ColumnsSeparatorView,
        blockSeparatorView: BlockSeparatorView,
        draggingHeaderView: DraggingHeaderView,
        trackerView: TrackerView
    },
    controllers: {
        draggingHeader: DraggingHeaderViewController,
        tablePosition: TablePositionViewController,
        columnsResizer: ColumnsResizerViewController
    },
    extenders: {
        views: {
            rowsView: {
                _needUpdateRowHeight: function(itemCount) {
                    var wordWrapEnabled = this.option("wordWrapEnabled"),
                        columnsResizerController = this.getController("columnsResizer"),
                        isResizing = columnsResizerController.isResizing();
                    return this.callBase.apply(this, arguments) || itemCount > 0 && wordWrapEnabled && isResizing
                }
            }
        }
    }
};
