/**
 * DevExtreme (ui/grid_core/ui.grid_core.keyboard_navigation.js)
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
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _type = require("../../core/utils/type");
var _array = require("../../core/utils/array");
var _selectors = require("../widget/selectors");
var _iterator = require("../../core/utils/iterator");
var _ui = require("../widget/ui.keyboard_processor");
var _ui2 = _interopRequireDefault(_ui);
var _utils = require("../../events/utils");
var _utils2 = _interopRequireDefault(_utils);
var _pointer = require("../../events/pointer");
var _pointer2 = _interopRequireDefault(_pointer);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var ROWS_VIEW_CLASS = "rowsview",
    EDIT_FORM_CLASS = "edit-form",
    GROUP_FOOTER_CLASS = "group-footer",
    ROW_CLASS = "dx-row",
    DATA_ROW_CLASS = "dx-data-row",
    GROUP_ROW_CLASS = "dx-group-row",
    EDIT_FORM_ITEM_CLASS = "edit-form-item",
    MASTER_DETAIL_ROW_CLASS = "dx-master-detail-row",
    FREESPACE_ROW_CLASS = "dx-freespace-row",
    VIRTUAL_ROW_CLASS = "dx-virtual-row",
    MASTER_DETAIL_CELL_CLASS = "dx-master-detail-cell",
    DROPDOWN_EDITOR_OVERLAY_CLASS = "dx-dropdowneditor-overlay",
    COMMAND_EXPAND_CLASS = "dx-command-expand",
    CELL_FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled",
    EDITOR_CELL_CLASS = "dx-editor-cell",
    INTERACTIVE_ELEMENTS_SELECTOR = "input:not([type='hidden']), textarea, a, [tabindex]",
    VIEWS = ["rowsView"],
    EDIT_MODE_ROW = "row",
    EDIT_MODE_FORM = "form",
    EDIT_MODE_BATCH = "batch",
    EDIT_MODE_CELL = "cell",
    FOCUS_TYPE_ROW = "row",
    FOCUS_TYPE_CELL = "cell";

function isGroupRow($row) {
    return $row && $row.hasClass(GROUP_ROW_CLASS)
}

function isDetailRow($row) {
    return $row && $row.hasClass(MASTER_DETAIL_ROW_CLASS)
}

function isDataRow($row) {
    return $row && !isGroupRow($row) && !isDetailRow($row)
}

function isNotFocusedRow($row) {
    return !$row || $row.hasClass(FREESPACE_ROW_CLASS) || $row.hasClass(VIRTUAL_ROW_CLASS)
}

function isCellElement($element) {
    return $element.length && "TD" === $element[0].tagName
}
var KeyboardNavigationController = _uiGrid_core2.default.ViewController.inherit({
    _isRowEditMode: function() {
        var editMode = this._editingController.getEditMode();
        return editMode === EDIT_MODE_ROW || editMode === EDIT_MODE_FORM
    },
    _isCellEditMode: function() {
        var editMode = this._editingController.getEditMode();
        return editMode === EDIT_MODE_CELL || editMode === EDIT_MODE_BATCH
    },
    _focusView: function(view, viewIndex) {
        this._focusedViews.viewIndex = viewIndex;
        this._focusedView = view
    },
    _getInteractiveElement: function($cell, isLast) {
        var $focusedElement = $cell.find(INTERACTIVE_ELEMENTS_SELECTOR).filter(":visible");
        return isLast ? $focusedElement.last() : $focusedElement.first()
    },
    _focusInteractiveElement: function($cell, isLast) {
        if (!$cell) {
            return
        }
        var $focusedElement = this._getInteractiveElement($cell, isLast);
        _events_engine2.default.trigger($focusedElement, "focus")
    },
    _updateFocus: function() {
        var that = this;
        setTimeout(function() {
            var $cell = that._getFocusedCell(),
                $cellEditingCell = that._isCellEditMode() && $cell;
            if ($cell && !(that._isMasterDetailCell($cell) && !that._isRowEditMode())) {
                if (that._hasSkipRow($cell.parent())) {
                    $cell = that._getNextCell(that._focusedCellPosition && that._focusedCellPosition.rowIndex > 0 ? "upArrow" : "downArrow")
                }
                if ($cell && $cell.length > 0) {
                    if ($cell.is("td") || $cell.hasClass(that.addWidgetPrefix(EDIT_FORM_ITEM_CLASS))) {
                        if (that.getController("editorFactory").focus() || $cellEditingCell) {
                            that._focus($cell)
                        } else {
                            if (that._isHiddenFocus) {
                                that._focus($cell, true)
                            }
                        }
                        if (that._editingController.isEditing()) {
                            that._focusInteractiveElement.bind(that)($cell)
                        }
                    } else {
                        _events_engine2.default.trigger($cell, "focus")
                    }
                }
            }
        })
    },
    _applyTabIndexToElement: function($element) {
        var tabIndex = this.option("tabIndex");
        $element.attr("tabIndex", (0, _type.isDefined)(tabIndex) ? tabIndex : 0)
    },
    _isEventInCurrentGrid: function(event) {
        var $grid = (0, _renderer2.default)(event.target).closest("." + this.getWidgetContainerClass()).parent();
        return $grid.is(this.component.$element())
    },
    _clickHandler: function(e) {
        var event = e.event,
            $target = (0, _renderer2.default)(event.currentTarget),
            isEditingCell = $target.hasClass(EDITOR_CELL_CLASS),
            data = event.data;
        if (this._isEventInCurrentGrid(event) && this._isCellValid($target)) {
            $target = this._isInsideEditForm($target) ? (0, _renderer2.default)(event.target) : $target;
            this._focusView(data.view, data.viewIndex);
            if ($target.parent().hasClass(FREESPACE_ROW_CLASS)) {
                this._updateFocusedCellPosition($target);
                this._focusedView.element().attr("tabindex", 0);
                this._focusedView.focus()
            } else {
                if (!isEditingCell && !this._isMasterDetailCell($target)) {
                    this._clickTargetCellHandler(event, $target)
                } else {
                    this._updateFocusedCellPosition($target)
                }
            }
        } else {
            if ($target.is("td")) {
                this._resetFocusedCell()
            }
        }
    },
    _allowRowUpdating: function() {
        var rowIndex = this.getVisibleRowIndex(),
            row = this._dataController.items()[rowIndex];
        return this._editingController.allowUpdating({
            row: row
        })
    },
    _clickTargetCellHandler: function(event, $cell) {
        var args, columnIndex = this.getView("rowsView").getCellIndex($cell),
            column = this._columnsController.getVisibleColumns()[columnIndex],
            isCellEditMode = this._isCellEditMode();
        this.setCellFocusType();
        args = this._fireFocusChangingEvents(event, $cell, true);
        $cell = args.$newCellElement;
        if (!args.cancel) {
            if (args.resetFocusedRow) {
                this.getController("focus")._resetFocusedRow();
                return
            }
            if (args.rowIndexChanged) {
                $cell = this._getFocusedCell()
            }
            if (!args.isHighlighted && !isCellEditMode) {
                this.setRowFocusType()
            }
            this._updateFocusedCellPosition($cell);
            if (this._allowRowUpdating() && isCellEditMode && column && column.allowEditing) {
                this._isHiddenFocus = false
            } else {
                var $target = event && (0, _renderer2.default)(event.target),
                    isInteractiveTarget = $target && $target.not($cell).is(INTERACTIVE_ELEMENTS_SELECTOR),
                    isDisabled = !args.isHighlighted || isInteractiveTarget;
                this._focus($cell, isDisabled, isInteractiveTarget)
            }
        } else {
            this.setRowFocusType();
            this.setFocusedRowIndex(args.prevRowIndex);
            $cell = this._getFocusedCell();
            if (this._editingController.isEditing() && isCellEditMode) {
                this._editingController.closeEditCell()
            }
        }
    },
    _initFocusedViews: function() {
        var that = this,
            clickAction = that.createAction(that._clickHandler);
        that._focusedViews = [];
        (0, _iterator.each)(VIEWS, function(key, viewName) {
            var view = that.getView(viewName);
            if (view && view.isVisible()) {
                that._focusedViews.push(view)
            }
        });
        (0, _iterator.each)(that._focusedViews, function(index, view) {
            if (view) {
                view.renderCompleted.add(function(e) {
                    var $element = view.element(),
                        isFullUpdate = !e || "refresh" === e.changeType,
                        isFocusedViewCorrect = that._focusedView && that._focusedView.name === view.name,
                        needUpdateFocus = false,
                        isAppend = e && ("append" === e.changeType || "prepend" === e.changeType);
                    _events_engine2.default.off($element, _utils2.default.addNamespace(_pointer2.default.down, "dxDataGridKeyboardNavigation"), clickAction);
                    _events_engine2.default.on($element, _utils2.default.addNamespace(_pointer2.default.down, "dxDataGridKeyboardNavigation"), "." + ROW_CLASS + " > td, ." + ROW_CLASS, {
                        viewIndex: index,
                        view: view
                    }, clickAction);
                    that._initKeyDownProcessor(that, $element, that._keyDownHandler);
                    if (isFocusedViewCorrect) {
                        needUpdateFocus = that._isNeedFocus ? !isAppend : that._isHiddenFocus && isFullUpdate;
                        needUpdateFocus && that._updateFocus()
                    }
                })
            }
        })
    },
    _initKeyDownProcessor: function(context, element, handler) {
        if (this._keyDownProcessor) {
            this._keyDownProcessor.dispose();
            this._keyDownProcessor = null
        }
        this._keyDownProcessor = new _ui2.default({
            element: element,
            context: context,
            handler: handler
        })
    },
    _getCell: function(cellPosition) {
        if (this._focusedView && cellPosition) {
            return this._focusedView.getCell({
                rowIndex: cellPosition.rowIndex - this._dataController.getRowIndexOffset(),
                columnIndex: cellPosition.columnIndex
            })
        }
    },
    _getFocusedCell: function() {
        return this._getCell(this._focusedCellPosition)
    },
    _getRowIndex: function($row) {
        var that = this,
            focusedView = that._focusedView,
            rowIndex = -1;
        if (focusedView) {
            rowIndex = focusedView.getRowIndex($row)
        }
        if (rowIndex >= 0) {
            rowIndex += that._dataController.getRowIndexOffset()
        }
        return rowIndex
    },
    _updateFocusedCellPosition: function($cell, direction) {
        var position = this._getCellPosition($cell, direction);
        if (position) {
            if (!$cell.length || position.rowIndex >= 0 && position.columnIndex >= 0) {
                this.setFocusedCellPosition(position.rowIndex, position.columnIndex)
            }
        }
    },
    _getCellPosition: function($cell, direction) {
        var rowIndex, columnIndex, that = this,
            $rowElement = $cell.closest("tr");
        if ($rowElement.length > 0 && that._focusedView) {
            rowIndex = $rowElement.length > 0 && that._getRowIndex($rowElement);
            columnIndex = that._focusedView.getCellIndex($cell, rowIndex);
            if (direction) {
                columnIndex = "previous" === direction ? columnIndex - 1 : columnIndex + 1;
                columnIndex = that._applyColumnIndexBoundaries(columnIndex)
            }
            return {
                rowIndex: rowIndex,
                columnIndex: columnIndex
            }
        }
    },
    setFocusedCellPosition: function(rowIndex, columnIndex) {
        this.setFocusedRowIndex(rowIndex);
        this.setFocusedColumnIndex(columnIndex)
    },
    setFocusedRowIndex: function(rowIndex) {
        if (!this._focusedCellPosition) {
            this._focusedCellPosition = {}
        }
        this._focusedCellPosition.rowIndex = rowIndex
    },
    setFocusedColumnIndex: function(columnIndex) {
        if (!this._focusedCellPosition) {
            this._focusedCellPosition = {}
        }
        this._focusedCellPosition.columnIndex = columnIndex
    },
    getVisibleRowIndex: function() {
        if (this._focusedCellPosition) {
            if (!this._focusedCellPosition.rowIndex) {
                return this._focusedCellPosition.rowIndex
            }
            return this._focusedCellPosition.rowIndex - this._dataController.getRowIndexOffset()
        }
        return null
    },
    getVisibleColumnIndex: function() {
        if (this._focusedCellPosition) {
            return (0, _type.isDefined)(this._focusedCellPosition.columnIndex) ? this._focusedCellPosition.columnIndex : -1
        }
        return -1
    },
    getFocusedColumnIndex: function() {
        return this._focusedCellPosition ? this._focusedCellPosition.columnIndex : null
    },
    _applyColumnIndexBoundaries: function(columnIndex) {
        var visibleColumnsCount = this._getVisibleColumnCount();
        if (columnIndex < 0) {
            columnIndex = 0
        } else {
            if (columnIndex >= visibleColumnsCount) {
                columnIndex = visibleColumnsCount - 1
            }
        }
        return columnIndex
    },
    _isCellValid: function($cell) {
        if ((0, _type.isDefined)($cell)) {
            var rowsView = this.getView("rowsView"),
                $row = $cell.parent(),
                visibleColumns = this._columnsController.getVisibleColumns(),
                columnIndex = rowsView.getCellIndex($cell),
                column = visibleColumns[columnIndex],
                visibleColumnCount = this._getVisibleColumnCount(),
                editingController = this._editingController,
                isMasterDetailRow = isDetailRow($row),
                isShowWhenGrouped = column && column.showWhenGrouped,
                isDataCell = column && !$cell.hasClass(COMMAND_EXPAND_CLASS) && isDataRow($row),
                isValidGroupSpaceColumn = function() {
                    return !isMasterDetailRow && column && (!(0, _type.isDefined)(column.groupIndex) || isShowWhenGrouped && isDataCell) || parseInt($cell.attr("colspan")) > 1
                };
            if (this._isMasterDetailCell($cell)) {
                return true
            }
            if (visibleColumnCount > columnIndex && isValidGroupSpaceColumn()) {
                var rowItems = this._dataController.items(),
                    visibleRowIndex = rowsView.getRowIndex($row),
                    row = rowItems[visibleRowIndex],
                    isCellEditing = editingController && this._isCellEditMode() && editingController.isEditing(),
                    isRowEditingInCurrentRow = editingController && editingController.isEditRow(visibleRowIndex),
                    isEditing = isRowEditingInCurrentRow || isCellEditing;
                if (column.command) {
                    return !isEditing && "expand" === column.command
                }
                if (isCellEditing && row && "data" !== row.rowType) {
                    return false
                }
                return !isEditing || column.allowEditing
            }
        }
    },
    _isCellByPositionValid: function(cellPosition) {
        var $cell = this._getCell(cellPosition);
        return this._isCellValid($cell)
    },
    _focus: function($cell, disableFocus, isInteractiveElement) {
        var $row = $cell && $cell.is("td") ? $cell.parent() : $cell;
        if ($row && isNotFocusedRow($row)) {
            return
        }
        var $focusElement, $prevFocusedCell = this._getFocusedCell(),
            focusedView = this._focusedView,
            $focusViewElement = focusedView && focusedView.element();
        this._isHiddenFocus = disableFocus;
        if (isGroupRow($row) || this.isRowFocusType()) {
            $focusElement = $row;
            if (focusedView) {
                this.setFocusedRowIndex(this._getRowIndex($row))
            }
        } else {
            if (isCellElement($cell)) {
                $focusElement = $cell;
                this._updateFocusedCellPosition($cell)
            }
        }
        $prevFocusedCell && $prevFocusedCell.is("td") && $prevFocusedCell.not($focusElement).removeAttr("tabIndex");
        if ($focusElement) {
            if (!isInteractiveElement) {
                this._applyTabIndexToElement($focusElement);
                _events_engine2.default.trigger($focusElement, "focus")
            }
            if (disableFocus) {
                $focusViewElement && $focusViewElement.find("." + CELL_FOCUS_DISABLED_CLASS + "[tabIndex]").not($focusElement).removeClass(CELL_FOCUS_DISABLED_CLASS).removeAttr("tabIndex");
                $focusElement.addClass(CELL_FOCUS_DISABLED_CLASS)
            } else {
                $focusViewElement && $focusViewElement.find("." + CELL_FOCUS_DISABLED_CLASS + ":not(." + MASTER_DETAIL_CELL_CLASS + ")").removeClass(CELL_FOCUS_DISABLED_CLASS);
                this.getController("editorFactory").focus($focusElement)
            }
        }
    },
    _hasSkipRow: function($row) {
        var row = $row && $row.get(0);
        return row && ("none" === row.style.display || $row.hasClass(this.addWidgetPrefix(GROUP_FOOTER_CLASS)) || isDetailRow($row) && !$row.hasClass(this.addWidgetPrefix(EDIT_FORM_CLASS)))
    },
    _enterKeyHandler: function(eventArgs, isEditing) {
        var $cell = this._getFocusedCell(),
            rowIndex = this.getVisibleRowIndex(),
            $row = this._focusedView && this._focusedView.getRow(rowIndex);
        if (this.option("grouping.allowCollapsing") && isGroupRow($row) || this.option("masterDetail.enabled") && $cell && $cell.hasClass(COMMAND_EXPAND_CLASS)) {
            var key = this._dataController.getKeyByRowIndex(rowIndex),
                item = this._dataController.items()[rowIndex];
            if (void 0 !== key && item && item.data && !item.data.isContinuation) {
                this._dataController.changeRowExpand(key)
            }
        } else {
            if (isEditing) {
                $cell = this._getCellElementFromTarget(eventArgs.originalEvent.target);
                this._updateFocusedCellPosition($cell);
                if (this._isRowEditMode()) {
                    this._focusEditFormCell($cell);
                    setTimeout(this._editingController.saveEditData.bind(this._editingController))
                } else {
                    var $target = (0, _renderer2.default)(eventArgs.originalEvent.target);
                    _events_engine2.default.trigger($target, "blur");
                    this._editingController.closeEditCell();
                    eventArgs.originalEvent.preventDefault()
                }
            } else {
                var column = this._columnsController.getVisibleColumns()[this._focusedCellPosition.columnIndex],
                    row = this._dataController.items()[rowIndex];
                if (this._editingController.allowUpdating({
                        row: row
                    }) && column && column.allowEditing) {
                    if (this._isRowEditMode()) {
                        this._editingController.editRow(rowIndex)
                    } else {
                        this._focusedCellPosition && this._editingController.editCell(rowIndex, this._focusedCellPosition.columnIndex)
                    }
                }
            }
        }
    },
    _leftRightKeysHandler: function(eventArgs, isEditing) {
        var directionCode, rowIndex = this.getVisibleRowIndex(),
            $event = eventArgs.originalEvent,
            $row = this._focusedView && this._focusedView.getRow(rowIndex);
        if (!isEditing && isDataRow($row)) {
            this.setCellFocusType();
            directionCode = this._getDirectionCodeByKey(eventArgs.keyName);
            this._arrowKeysHandlerFocusCell($event, this._getNextCell(directionCode));
            if ($event) {
                $event.preventDefault()
            }
        }
    },
    _getDirectionCodeByKey: function(key) {
        var directionCode;
        if (this.option("rtlEnabled")) {
            directionCode = "leftArrow" === key ? "nextInRow" : "previousInRow"
        } else {
            directionCode = "leftArrow" === key ? "previousInRow" : "nextInRow"
        }
        return directionCode
    },
    _upDownKeysHandler: function(eventArgs, isEditing) {
        var $cell, rowHeight, rowIndex = this.getVisibleRowIndex(),
            $row = this._focusedView && this._focusedView.getRow(rowIndex),
            $event = eventArgs.originalEvent,
            isUpArrow = "upArrow" === eventArgs.keyName,
            dataSource = this._dataController.dataSource();
        if (!isEditing && $row && !isDetailRow($row)) {
            $cell = this._getNextCell(eventArgs.keyName);
            if ($cell && this._isCellValid($cell)) {
                this._arrowKeysHandlerFocusCell($event, $cell, true)
            } else {
                if (this._isVirtualScrolling() && isUpArrow && dataSource && !dataSource.isLoading()) {
                    rowHeight = $row.outerHeight();
                    rowIndex = this._focusedCellPosition.rowIndex - 1;
                    this._scrollBy(-rowHeight, rowIndex, $event)
                }
            }
            if ($event) {
                $event.preventDefault()
            }
        }
    },
    _arrowKeysHandlerFocusCell: function($event, $cell, upDown) {
        var args = this._fireFocusChangingEvents($event, $cell, upDown, true);
        $cell = args.$newCellElement;
        if (!args.cancel && this._isCellValid($cell)) {
            this._focus($cell, !args.isHighlighted)
        }
    },
    _fireFocusChangingEvents: function($event, $cell, fireRowEvent, isHighlighted) {
        var args = {},
            cellPosition = this._getCellPosition($cell) || {};
        if (this.isCellFocusType()) {
            args = this._fireFocusedCellChanging($event, $cell, isHighlighted);
            if (!args.cancel) {
                cellPosition.columnIndex = args.newColumnIndex;
                cellPosition.rowIndex = args.newRowIndex;
                isHighlighted = args.isHighlighted
            }
        }
        if (!args.cancel && fireRowEvent) {
            args = this._fireFocusedRowChanging($event, $cell.parent());
            if (!args.cancel) {
                cellPosition.rowIndex = args.newRowIndex;
                args.isHighlighted = isHighlighted
            }
        }
        args.$newCellElement = this._getCell(cellPosition);
        if (!args.$newCellElement || !args.$newCellElement.length) {
            args.$newCellElement = $cell
        }
        return args
    },
    _isVirtualScrolling: function() {
        var scrollingMode = this.option("scrolling.mode");
        return "virtual" === scrollingMode || "infinite" === scrollingMode
    },
    _scrollBy: function(top, rowIndex, $event) {
        var that = this,
            scrollable = this.getView("rowsView").getScrollable();
        if (that._focusedCellPosition) {
            var scrollHandler = function scrollHandler() {
                scrollable.off("scroll", scrollHandler);
                setTimeout(that.restoreFocusableElement.bind(that, rowIndex, $event))
            };
            scrollable.on("scroll", scrollHandler)
        }
        scrollable.scrollBy({
            left: 0,
            top: top
        })
    },
    restoreFocusableElement: function(rowIndex, $event) {
        var args, $rowElement, that = this,
            isUpArrow = (0, _type.isDefined)(rowIndex),
            rowsView = that.getView("rowsView"),
            $rowsViewElement = rowsView.element(),
            columnIndex = that._focusedCellPosition.columnIndex,
            rowIndexOffset = that._dataController.getRowIndexOffset();
        rowIndex = isUpArrow ? rowIndex : rowsView.getTopVisibleItemIndex() + rowIndexOffset;
        if (!isUpArrow) {
            that.getController("editorFactory").loseFocus();
            that._applyTabIndexToElement($rowsViewElement);
            _events_engine2.default.trigger($rowsViewElement, "focus")
        } else {
            $rowElement = rowsView.getRow(rowIndex - rowIndexOffset);
            args = that._fireFocusedRowChanging($event, $rowElement);
            if (!args.cancel && args.rowIndexChanged) {
                rowIndex = args.newRowIndex
            }
        }
        if (!isUpArrow || !args.cancel) {
            that.setFocusedCellPosition(rowIndex, columnIndex)
        }
        isUpArrow && that._updateFocus()
    },
    _pageUpDownKeyHandler: function(eventArgs) {
        var pageIndex = this._dataController.pageIndex(),
            pageCount = this._dataController.pageCount(),
            pagingEnabled = this.option("paging.enabled"),
            isPageUp = "pageUp" === eventArgs.keyName,
            pageStep = isPageUp ? -1 : 1,
            scrollable = this.getView("rowsView").getScrollable();
        if (pagingEnabled && !this._isVirtualScrolling()) {
            if ((isPageUp ? pageIndex > 0 : pageIndex < pageCount - 1) && !this._isVirtualScrolling()) {
                this._dataController.pageIndex(pageIndex + pageStep);
                eventArgs.originalEvent.preventDefault()
            }
        } else {
            if (scrollable && scrollable._container().height() < scrollable.$content().height()) {
                this._scrollBy(scrollable._container().height() * pageStep);
                eventArgs.originalEvent.preventDefault()
            }
        }
    },
    _spaceKeyHandler: function(eventArgs, isEditing) {
        var isFocusedRowElement, rowIndex = this.getVisibleRowIndex(),
            $target = (0, _renderer2.default)(eventArgs.originalEvent && eventArgs.originalEvent.target);
        if (this.option("selection") && "none" !== this.option("selection").mode && !isEditing) {
            isFocusedRowElement = "row" === this._getElementType($target) && this.isRowFocusType() && isDataRow($target);
            if (isFocusedRowElement) {
                this._selectionController.startSelectionWithCheckboxes()
            }
            if (isFocusedRowElement || $target.parent().hasClass(DATA_ROW_CLASS) || $target.hasClass(this.addWidgetPrefix(ROWS_VIEW_CLASS))) {
                this._selectionController.changeItemSelection(rowIndex, {
                    shift: eventArgs.shift,
                    control: eventArgs.ctrl
                });
                eventArgs.originalEvent.preventDefault()
            }
        }
    },
    _ctrlAKeyHandler: function(eventArgs, isEditing) {
        if (!isEditing && eventArgs.ctrl && !eventArgs.alt && "multiple" === this.option("selection.mode") && this.option("selection.allowSelectAll")) {
            this._selectionController.selectAll();
            eventArgs.originalEvent.preventDefault()
        }
    },
    _isInsideEditForm: function(element) {
        return (0, _renderer2.default)(element).closest("." + this.addWidgetPrefix(EDIT_FORM_CLASS)).length > 0
    },
    _isMasterDetailCell: function(element) {
        var $masterDetailCell = (0, _renderer2.default)(element).closest("." + MASTER_DETAIL_CELL_CLASS),
            $masterDetailGrid = $masterDetailCell.closest("." + this.getWidgetContainerClass()).parent();
        return $masterDetailCell.length && $masterDetailGrid.is(this.component.$element())
    },
    _processNextCellInMasterDetail: function($nextCell) {
        if (!this._isInsideEditForm($nextCell) && $nextCell) {
            this._applyTabIndexToElement($nextCell)
        }
    },
    _handleTabKeyOnMasterDetailCell: function(target, direction) {
        if (this._isMasterDetailCell(target)) {
            this._updateFocusedCellPosition((0, _renderer2.default)(target), direction);
            var $nextCell = this._getNextCell(direction, "row");
            this._processNextCellInMasterDetail($nextCell);
            return true
        }
        return false
    },
    _tabKeyHandler: function(eventArgs, isEditing) {
        var editingOptions = this.option("editing"),
            direction = eventArgs.shift ? "previous" : "next",
            isOriginalHandlerRequired = !eventArgs.shift && this._isLastValidCell(this._focusedCellPosition) || eventArgs.shift && this._isFirstValidCell(this._focusedCellPosition),
            eventTarget = eventArgs.originalEvent.target;
        if (this._handleTabKeyOnMasterDetailCell(eventTarget, direction)) {
            return
        }
        if (editingOptions && eventTarget && !isOriginalHandlerRequired) {
            if ((0, _renderer2.default)(eventTarget).hasClass(this.addWidgetPrefix(ROWS_VIEW_CLASS))) {
                this._resetFocusedCell()
            }
            if (isEditing) {
                if (!this._editingCellTabHandler(eventArgs, direction)) {
                    return
                }
            } else {
                if (this._targetCellTabHandler(eventArgs, direction)) {
                    isOriginalHandlerRequired = true
                }
            }
        }
        if (isOriginalHandlerRequired) {
            this.getController("editorFactory").loseFocus();
            if (this._editingController.isEditing() && !this._isRowEditMode()) {
                this._resetFocusedCell();
                this._editingController.closeEditCell()
            }
        } else {
            eventArgs.originalEvent.preventDefault()
        }
    },
    _editingCellTabHandler: function(eventArgs, direction) {
        var column, row, $cell, isEditingAllowed, editingOptions = this.option("editing"),
            eventTarget = eventArgs.originalEvent.target;
        this._updateFocusedCellPosition(this._getCellElementFromTarget(eventTarget));
        $cell = this._getNextCell(direction);
        if (!$cell || this._handleTabKeyOnMasterDetailCell($cell, direction)) {
            return false
        }
        column = this._columnsController.getVisibleColumns()[this.getView("rowsView").getCellIndex($cell)];
        row = this._dataController.items()[this._getRowIndex($cell && $cell.parent())];
        if (column.allowEditing) {
            var _isDataRow = !row || "data" === row.rowType;
            isEditingAllowed = editingOptions.allowUpdating ? _isDataRow : row && row.inserted
        }
        if (!isEditingAllowed) {
            this._editingController.closeEditCell()
        }
        if (this._focusCell($cell)) {
            if (!this._isRowEditMode() && isEditingAllowed) {
                this._editingController.editCell(this.getVisibleRowIndex(), this._focusedCellPosition.columnIndex)
            } else {
                this._focusInteractiveElement($cell, eventArgs.shift)
            }
        }
        return true
    },
    _targetCellTabHandler: function(eventArgs, direction) {
        var elementType, $event = eventArgs.originalEvent,
            eventTarget = $event.target,
            $cell = this._getCellElementFromTarget(eventTarget),
            $lastInteractiveElement = this._getInteractiveElement($cell, !eventArgs.shift),
            isOriginalHandlerRequired = false;
        if ($lastInteractiveElement.length && eventTarget !== $lastInteractiveElement.get(0)) {
            isOriginalHandlerRequired = true
        } else {
            if (void 0 === this._focusedCellPosition.rowIndex && (0, _renderer2.default)(eventTarget).hasClass(ROW_CLASS)) {
                this._updateFocusedCellPosition((0, _renderer2.default)(eventTarget).children().first())
            }
            elementType = this._getElementType(eventTarget);
            if (this.isRowFocusType()) {
                this.setCellFocusType();
                if ("row" === elementType && isDataRow((0, _renderer2.default)(eventTarget))) {
                    eventTarget = this.getFirstValidCellInRow((0, _renderer2.default)(eventTarget));
                    elementType = this._getElementType(eventTarget)
                }
            }
            $cell = this._getNextCellByTabKey($event, direction, elementType);
            if (!$cell) {
                return false
            }
            $cell = this._checkNewLineTransition($event, $cell);
            if (!$cell) {
                return false
            }
            this._focusCell($cell);
            this._focusInteractiveElement($cell, eventArgs.shift)
        }
        return isOriginalHandlerRequired
    },
    _getNextCellByTabKey: function($event, direction, elementType) {
        var $cell = this._getNextCell(direction, elementType),
            args = this._fireFocusedCellChanging($event, $cell, true);
        if (args.cancel) {
            return
        }
        if (args.$newCellElement) {
            $cell = args.$newCellElement
        }
        return $cell
    },
    _checkNewLineTransition: function($event, $cell) {
        var rowIndex = this.getVisibleRowIndex(),
            $row = $cell.parent();
        if (rowIndex !== this._getRowIndex($row)) {
            var cellPosition = this._getCellPosition($cell),
                args = this._fireFocusedRowChanging($event, $row);
            if (args.cancel) {
                return
            }
            if (args.rowIndexChanged) {
                this.setFocusedColumnIndex(cellPosition.columnIndex);
                $cell = this._getFocusedCell()
            }
        }
        return $cell
    },
    getFirstValidCellInRow: function($row, columnIndex) {
        var $cell, $result, that = this,
            $cells = $row.find("> td");
        columnIndex = columnIndex || 0;
        for (var i = columnIndex; i < $cells.length; ++i) {
            $cell = $cells.eq(i);
            if (that._isCellValid($cell)) {
                $result = $cell;
                break
            }
        }
        return $result
    },
    _focusCell: function($cell) {
        if (this._isCellValid($cell)) {
            this._focus($cell);
            return true
        }
    },
    _getElementType: function(target) {
        return (0, _renderer2.default)(target).is("tr") ? "row" : "cell"
    },
    _focusEditFormCell: function($cell) {
        if ($cell.hasClass(MASTER_DETAIL_CELL_CLASS)) {
            this.getController("editorFactory").focus($cell, true)
        }
    },
    _escapeKeyHandler: function(eventArgs, isEditing) {
        var $cell = this._getCellElementFromTarget(eventArgs.originalEvent.target);
        if (isEditing) {
            this._updateFocusedCellPosition($cell);
            if (!this._isRowEditMode()) {
                if ("cell" === this._editingController.getEditMode()) {
                    this._editingController.cancelEditData()
                } else {
                    this._editingController.closeEditCell()
                }
            } else {
                this._focusEditFormCell($cell);
                this._editingController.cancelEditData()
            }
            eventArgs.originalEvent.preventDefault()
        }
    },
    _ctrlFKeyHandler: function(eventArgs) {
        if (eventArgs.ctrl && this.option("searchPanel") && this.option("searchPanel").visible) {
            this._headerPanel.focus();
            eventArgs.originalEvent.preventDefault()
        }
    },
    _keyDownHandler: function(e) {
        var isEditing = this._editingController.isEditing(),
            needStopPropagation = true,
            originalEvent = e.originalEvent,
            args = {
                handled: false,
                event: originalEvent
            };
        this.executeAction("onKeyDown", args);
        if (originalEvent.isDefaultPrevented()) {
            return
        }
        this._isNeedFocus = true;
        this._isNeedScroll = true;
        this._updateFocusedCellPosition(this._getCellElementFromTarget(args.event.target));
        if (!args.handled) {
            switch (e.keyName) {
                case "leftArrow":
                case "rightArrow":
                    this._leftRightKeysHandler(e, isEditing);
                    break;
                case "upArrow":
                case "downArrow":
                    this._upDownKeysHandler(e, isEditing);
                    break;
                case "pageUp":
                case "pageDown":
                    this._pageUpDownKeyHandler(e);
                    break;
                case "space":
                    this._spaceKeyHandler(e, isEditing);
                    break;
                case "A":
                    this._ctrlAKeyHandler(e, isEditing);
                    break;
                case "tab":
                    this._tabKeyHandler(e, isEditing);
                    break;
                case "enter":
                    this._enterKeyHandler(e, isEditing);
                    break;
                case "escape":
                    this._escapeKeyHandler(e, isEditing);
                    break;
                case "F":
                    this._ctrlFKeyHandler(e);
                    break;
                default:
                    this._isNeedFocus = false;
                    this._isNeedScroll = false;
                    needStopPropagation = false
            }
            if (needStopPropagation) {
                originalEvent.stopPropagation()
            }
        }
    },
    _isLastRow: function(rowIndex) {
        if (this._isVirtualScrolling()) {
            return rowIndex >= this._dataController.totalItemsCount() - 1
        }
        return rowIndex === this.getController("data").items().length - 1
    },
    _getNextCell: function(keyCode, elementType, cellPosition) {
        var rowIndex, newFocusedCellPosition, $cell, $row, focusedCellPosition = cellPosition || this._focusedCellPosition,
            isRowFocusType = this.isRowFocusType(),
            includeCommandCells = isRowFocusType || (0, _array.inArray)(keyCode, ["next", "previous"]) > -1,
            isLastCellOnDirection = "previous" === keyCode ? this._isFirstValidCell(focusedCellPosition) : this._isLastValidCell(focusedCellPosition);
        if (this._focusedView && focusedCellPosition) {
            newFocusedCellPosition = this._getNewPositionByCode(focusedCellPosition, elementType, keyCode);
            $cell = this._getCell(newFocusedCellPosition);
            if ($cell && !this._isCellValid($cell) && this._isCellInRow(newFocusedCellPosition, includeCommandCells) && !isLastCellOnDirection) {
                if (isRowFocusType) {
                    $cell = this.getFirstValidCellInRow($cell.parent(), newFocusedCellPosition.columnIndex)
                } else {
                    $cell = this._getNextCell(keyCode, "cell", newFocusedCellPosition)
                }
            }
            $row = $cell && $cell.parent();
            if (this._hasSkipRow($row)) {
                rowIndex = this._getRowIndex($row);
                if (!this._isLastRow(rowIndex)) {
                    $cell = this._getNextCell(keyCode, "row", {
                        columnIndex: focusedCellPosition.columnIndex,
                        rowIndex: rowIndex
                    })
                } else {
                    return null
                }
            }
            return $cell
        }
        return null
    },
    _getNewPositionByCode: function(cellPosition, elementType, code) {
        var visibleColumnsCount, columnIndex = cellPosition.columnIndex,
            rowIndex = cellPosition.rowIndex;
        if (void 0 === cellPosition.rowIndex && "next" === code) {
            return {
                columnIndex: 0,
                rowIndex: 0
            }
        }
        switch (code) {
            case "nextInRow":
            case "next":
                visibleColumnsCount = this._getVisibleColumnCount();
                if (columnIndex < visibleColumnsCount - 1 && !this._isLastValidCell({
                        columnIndex: columnIndex,
                        rowIndex: rowIndex
                    }) && "row" !== elementType) {
                    columnIndex++
                } else {
                    if (!this._isLastRow(rowIndex) && "next" === code) {
                        columnIndex = 0;
                        rowIndex++
                    }
                }
                break;
            case "previousInRow":
            case "previous":
                if (columnIndex > 0 && !this._isFirstValidCell({
                        columnIndex: columnIndex,
                        rowIndex: rowIndex
                    }) && "row" !== elementType) {
                    columnIndex--
                } else {
                    if (rowIndex > 0 && "previous" === code) {
                        rowIndex--;
                        visibleColumnsCount = this._getVisibleColumnCount();
                        columnIndex = visibleColumnsCount - 1
                    }
                }
                break;
            case "upArrow":
                rowIndex = rowIndex > 0 ? rowIndex - 1 : rowIndex;
                break;
            case "downArrow":
                rowIndex = !this._isLastRow(rowIndex) ? rowIndex + 1 : rowIndex
        }
        return {
            columnIndex: columnIndex,
            rowIndex: rowIndex
        }
    },
    _isFirstValidCell: function(cellPosition) {
        var isFirstValidCell = false;
        if (0 === cellPosition.rowIndex && cellPosition.columnIndex >= 0) {
            isFirstValidCell = isFirstValidCell || !this._haveValidCellBeforePosition(cellPosition)
        }
        return isFirstValidCell
    },
    _haveValidCellBeforePosition: function(cellPosition) {
        var columnIndex = cellPosition.columnIndex,
            hasValidCells = false;
        while (columnIndex > 0 && !hasValidCells) {
            var checkingPosition = {
                columnIndex: --columnIndex,
                rowIndex: cellPosition.rowIndex
            };
            hasValidCells = this._isCellByPositionValid(checkingPosition)
        }
        return hasValidCells
    },
    _isLastValidCell: function(cellPosition) {
        var nextColumnIndex = cellPosition.columnIndex >= 0 ? cellPosition.columnIndex + 1 : 0,
            checkingPosition = {
                columnIndex: nextColumnIndex,
                rowIndex: cellPosition.rowIndex
            },
            visibleColumnsCount = this._getVisibleColumnCount(),
            isCheckingCellValid = this._isCellByPositionValid(checkingPosition);
        if (!this._isLastRow(cellPosition.rowIndex)) {
            return false
        }
        if (cellPosition.columnIndex === visibleColumnsCount - 1) {
            return true
        }
        if (isCheckingCellValid) {
            return false
        }
        return this._isLastValidCell(checkingPosition)
    },
    _getVisibleColumnCount: function() {
        return this.getController("columns").getVisibleColumns().length
    },
    _isCellInRow: function(cellPosition, includeCommandCells) {
        var columnIndex = cellPosition.columnIndex,
            visibleColumnsCount = this._getVisibleColumnCount();
        return includeCommandCells ? columnIndex >= 0 && columnIndex <= visibleColumnsCount - 1 : columnIndex > 0 && columnIndex < visibleColumnsCount - 1
    },
    _resetFocusedCell: function() {
        var that = this,
            $cell = that._getFocusedCell();
        $cell && $cell.removeAttr("tabIndex");
        that._focusedView && that._focusedView.renderFocusState && that._focusedView.renderFocusState();
        that._isNeedFocus = false;
        that._isNeedScroll = false;
        that._focusedCellPosition = {}
    },
    _getCellElementFromTarget: function(target) {
        return (0, _renderer2.default)(target).closest("." + ROW_CLASS + "> td")
    },
    init: function() {
        var that = this;
        if (that.option("useKeyboard")) {
            that._dataController = that.getController("data");
            that._selectionController = that.getController("selection");
            that._editingController = that.getController("editing");
            that._headerPanel = that.getView("headerPanel");
            that._columnsController = that.getController("columns");
            that.getController("editorFactory").focused.add(function($element) {
                that.setupFocusedView();
                if (that._isNeedScroll) {
                    if ($element.is(":visible") && that._focusedView && that._focusedView.getScrollable) {
                        that._scrollToElement($element);
                        that._isNeedScroll = false
                    }
                }
            });
            that._focusedCellPosition = {};
            that._canceledCellPosition = null;
            that._initFocusedViews();
            that._documentClickHandler = that.createAction(function(e) {
                var $target = (0, _renderer2.default)(e.event.target),
                    isCurrentRowsViewClick = that._isEventInCurrentGrid(e.event) && $target.closest("." + that.addWidgetPrefix(ROWS_VIEW_CLASS)).length,
                    isEditorOverlay = $target.closest("." + DROPDOWN_EDITOR_OVERLAY_CLASS).length;
                if (!isCurrentRowsViewClick && !isEditorOverlay) {
                    that._resetFocusedCell()
                }
            });
            that.createAction("onKeyDown");
            _events_engine2.default.on(_dom_adapter2.default.getDocument(), _utils2.default.addNamespace(_pointer2.default.down, "dxDataGridKeyboardNavigation"), that._documentClickHandler)
        }
    },
    _scrollToElement: function($element, offset) {
        var scrollable = this._focusedView.getScrollable();
        scrollable && scrollable.update();
        scrollable && scrollable.scrollToElement($element, offset);
    },
    focus: function(element) {
        var activeElementSelector, focusedRowEnabled = this.option("focusedRowEnabled"),
            isHighlighted = isCellElement((0, _renderer2.default)(element));
        if (!element) {
            activeElementSelector = focusedRowEnabled ? ".dx-row[tabindex]" : ".dx-row[tabIndex], .dx-row > td[tabindex]";
            element = this.component.$element().find(activeElementSelector).first()
        }
        element && this._focusElement((0, _renderer2.default)(element), isHighlighted)
    },
    _focusElement: function($element, isHighlighted) {
        var focusView = this._getFocusedViewByElement($element),
            isRowFocusType = this.isRowFocusType(),
            args = {};
        if (!focusView || isCellElement($element) && !this._isCellValid($element)) {
            return
        }
        this._focusView(focusView.view, focusView.viewIndex);
        this._isNeedFocus = true;
        this._isNeedScroll = true;
        if (isCellElement($element) || isGroupRow($element)) {
            this.setCellFocusType();
            args = this._fireFocusChangingEvents(null, $element, false, isHighlighted);
            $element = args.$newCellElement;
            if (isRowFocusType && !args.isHighlighted) {
                this.setRowFocusType()
            }
        }
        this._focus($element, !args.isHighlighted);
        this._focusInteractiveElement($element)
    },
    getFocusedView: function() {
        return this._focusedView
    },
    _getFocusedViewByElement: function($element) {
        var condition = function(view) {
            return $element.closest(view._$element).length
        };
        return this._getFocusedViewByCondition(condition)
    },
    _getFocusedViewByCondition: function(conditionFunction) {
        var focusView;
        (0, _iterator.each)(this._focusedViews, function(index, view) {
            if (conditionFunction(view)) {
                focusView = {
                    viewIndex: index,
                    view: view
                };
                return false
            }
        });
        return focusView
    },
    isRowFocusType: function() {
        return this.focusType === FOCUS_TYPE_ROW
    },
    isCellFocusType: function() {
        return this.focusType === FOCUS_TYPE_CELL
    },
    setRowFocusType: function() {
        if (this.option("focusedRowEnabled")) {
            this.focusType = FOCUS_TYPE_ROW
        }
    },
    setCellFocusType: function() {
        this.focusType = FOCUS_TYPE_CELL
    },
    focusViewByName: function(viewName) {
        var view = this._getFocusedViewByName(viewName);
        this._focusView(view.view, view.viewIndex)
    },
    setupFocusedView: function() {
        if (this.option("useKeyboard") && !(0, _type.isDefined)(this._focusedView)) {
            this.focusViewByName("rowsView")
        }
    },
    _getFocusedViewByName: function(viewName) {
        var condition = function(view) {
            return view.name === viewName
        };
        return this._getFocusedViewByCondition(condition)
    },
    optionChanged: function(args) {
        var that = this;
        switch (args.name) {
            case "useKeyboard":
                args.handled = true;
                break;
            default:
                that.callBase(args)
        }
    },
    dispose: function() {
        this.callBase();
        this._focusedView = null;
        this._focusedViews = null;
        this._keyDownProcessor && this._keyDownProcessor.dispose();
        _events_engine2.default.off(_dom_adapter2.default.getDocument(), _utils2.default.addNamespace(_pointer2.default.down, "dxDataGridKeyboardNavigation"), this._documentClickHandler)
    },
    _fireFocusedCellChanging: function($event, $cellElement, isHighlighted) {
        var that = this,
            prevCellIndex = that.option("focusedColumnIndex"),
            prevRowIndex = that.option("focusedRowIndex"),
            cellPosition = that._getCellPosition($cellElement),
            columnIndex = cellPosition ? cellPosition.columnIndex : -1,
            rowIndex = cellPosition ? cellPosition.rowIndex : -1,
            args = {
                cellElement: $cellElement,
                prevColumnIndex: prevCellIndex,
                prevRowIndex: prevRowIndex,
                newColumnIndex: columnIndex,
                newRowIndex: rowIndex,
                rows: that.getController("data").getVisibleRows(),
                columns: that.getController("columns").getVisibleColumns(),
                event: $event,
                isHighlighted: isHighlighted || false,
                cancel: false
            };
        this._canceledCellPosition = null;
        that.executeAction("onFocusedCellChanging", args);
        if (args.newColumnIndex !== columnIndex || args.newRowIndex !== rowIndex) {
            args.$newCellElement = this._getCell({
                columnIndex: args.newColumnIndex,
                rowIndex: args.newRowIndex
            })
        }
        if (args.cancel) {
            this._canceledCellPosition = {
                rowIndex: rowIndex,
                columnIndex: columnIndex
            }
        }
        return args
    },
    _fireFocusedCellChanged: function($cellElement, prevCellIndex, prevRowIndex) {
        var that = this,
            dataController = that.getController("data"),
            columnIndex = that.getView("rowsView").getCellIndex($cellElement),
            rowIndex = this._getRowIndex($cellElement && $cellElement.parent()),
            isEditingCell = that.getController("editing").isEditCell(rowIndex, columnIndex),
            row = dataController.items()[rowIndex];
        if (!isEditingCell && (prevCellIndex !== columnIndex || prevRowIndex !== rowIndex)) {
            dataController = that.getController("data");
            that.executeAction("onFocusedCellChanged", {
                cellElement: $cellElement,
                columnIndex: columnIndex,
                rowIndex: rowIndex,
                row: row,
                column: that.getController("columns").getVisibleColumns()[columnIndex]
            })
        }
    },
    _fireFocusedRowChanging: function(eventArgs, $newFocusedRow) {
        var newRowIndex = this._getRowIndex($newFocusedRow),
            dataController = this.getController("data"),
            prevFocusedRowIndex = this.getVisibleRowIndex(),
            args = {
                rowElement: $newFocusedRow,
                prevRowIndex: prevFocusedRowIndex,
                newRowIndex: newRowIndex,
                event: eventArgs,
                rows: this.getController("data").getVisibleRows(),
                cancel: false
            };
        if (!dataController || dataController.isLoading()) {
            args.cancel = true;
            return args
        }
        if (this.option("focusedRowEnabled")) {
            this.executeAction("onFocusedRowChanging", args);
            if (!args.cancel && args.newRowIndex !== newRowIndex) {
                args.resetFocusedRow = args.newRowIndex < 0;
                if (!args.resetFocusedRow) {
                    this.setFocusedRowIndex(args.newRowIndex)
                }
                args.rowIndexChanged = true
            }
        }
        return args
    },
    _fireFocusedRowChanged: function($rowElement) {
        var row, dataController, focusedRowIndex = this.option("focusedRowIndex");
        if (this.option("focusedRowEnabled")) {
            if (focusedRowIndex >= 0) {
                dataController = this.getController("data");
                row = focusedRowIndex >= 0 && dataController.getVisibleRows()[focusedRowIndex - dataController.getRowIndexOffset()]
            }
            this.executeAction("onFocusedRowChanged", {
                rowElement: $rowElement,
                rowIndex: focusedRowIndex,
                row: row
            })
        }
    },
    _processCanceledEditCellPosition: function(rowIndex, columnIndex) {
        if (this._canceledCellPosition) {
            var isCanceled = this._canceledCellPosition.rowIndex === rowIndex && this._canceledCellPosition.columnIndex === columnIndex;
            this._canceledCellPosition = null;
            return isCanceled
        }
    }
});
module.exports = {
    defaultOptions: function() {
        return {
            useKeyboard: true
        }
    },
    controllers: {
        keyboardNavigation: KeyboardNavigationController
    },
    extenders: {
        views: {
            rowsView: {
                renderFocusState: function() {
                    var cellElements, dataController = this._dataController,
                        rowIndex = this.option("focusedRowIndex") || 0,
                        $element = this.element();
                    if ($element && !(0, _selectors.focused)($element)) {
                        $element.attr("tabIndex", null)
                    }
                    if (rowIndex < 0 || rowIndex >= dataController.getVisibleRows().length) {
                        rowIndex = 0
                    }
                    cellElements = this.getCellElements(rowIndex);
                    if (this.option("useKeyboard") && cellElements) {
                        this.updateFocusElementTabIndex(cellElements)
                    }
                },
                updateFocusElementTabIndex: function(cellElements) {
                    var that = this,
                        $row = cellElements.eq(0).parent(),
                        columnIndex = that.option("focusedColumnIndex"),
                        tabIndex = that.option("tabIndex");
                    if (!columnIndex || columnIndex < 0) {
                        columnIndex = 0
                    }
                    if (isGroupRow($row)) {
                        $row.attr("tabIndex", tabIndex)
                    } else {
                        that._updateFocusedCellTabIndex(cellElements, columnIndex)
                    }
                },
                _updateFocusedCellTabIndex: function(cellElements, columnIndex) {
                    var $cell, that = this,
                        tabIndex = that.option("tabIndex"),
                        keyboardNavigation = that.getController("keyboardNavigation"),
                        oldFocusedView = keyboardNavigation._focusedView,
                        cellElementsLength = cellElements ? cellElements.length : -1;
                    keyboardNavigation._focusedView = that;
                    if (cellElementsLength > 0) {
                        if (cellElementsLength <= columnIndex) {
                            columnIndex = cellElementsLength - 1
                        }
                        for (var i = columnIndex; i < cellElementsLength; ++i) {
                            $cell = (0, _renderer2.default)(cellElements[i]);
                            if (!keyboardNavigation._isMasterDetailCell($cell)) {
                                if (keyboardNavigation._isCellValid($cell) && isCellElement($cell)) {
                                    $cell.attr("tabIndex", tabIndex);
                                    keyboardNavigation.setCellFocusType();
                                    break
                                }
                            }
                        }
                    }
                    keyboardNavigation._focusedView = oldFocusedView
                },
                renderDelayedTemplates: function(change) {
                    this.callBase.apply(this, arguments);
                    if (!change || !change.repaintChangesOnly) {
                        this.renderFocusState()
                    }
                },
                _renderCore: function(change) {
                    this.callBase(change);
                    if (!change || !change.repaintChangesOnly) {
                        this.renderFocusState()
                    }
                }
            }
        },
        controllers: {
            editing: {
                editCell: function(rowIndex, columnIndex) {
                    var keyboardController = this.getController("keyboardNavigation");
                    if (keyboardController._processCanceledEditCellPosition(rowIndex, columnIndex)) {
                        return false
                    }
                    var isCellEditing = this.callBase(rowIndex, columnIndex);
                    if (isCellEditing) {
                        keyboardController.setupFocusedView()
                    }
                    return isCellEditing
                },
                editRow: function(rowIndex) {
                    if (this.option("editing.mode") === EDIT_MODE_FORM) {
                        this._keyboardNavigationController._resetFocusedCell()
                    }
                    this.callBase(rowIndex)
                },
                addRow: function(parentKey) {
                    this.getController("keyboardNavigation").setupFocusedView();
                    this.callBase.apply(this, arguments)
                },
                getFocusedCellInRow: function(rowIndex) {
                    var keyboardNavigationController = this.getController("keyboardNavigation"),
                        $cell = this.callBase(rowIndex);
                    if (this.option("useKeyboard") && keyboardNavigationController._focusedCellPosition.rowIndex === rowIndex) {
                        $cell = keyboardNavigationController._getFocusedCell() || $cell
                    }
                    return $cell
                },
                _processCanceledEditingCell: function() {
                    var _this = this;
                    this.closeEditCell().done(function() {
                        var keyboardNavigation = _this.getController("keyboardNavigation");
                        keyboardNavigation._updateFocus()
                    })
                },
                init: function() {
                    this.callBase();
                    this._keyboardNavigationController = this.getController("keyboardNavigation")
                }
            },
            data: {
                _correctRowIndices: function(getRowIndexCorrection) {
                    var that = this,
                        keyboardNavigationController = that.getController("keyboardNavigation"),
                        editorFactory = that.getController("editorFactory"),
                        focusedCellPosition = keyboardNavigationController._focusedCellPosition;
                    that.callBase.apply(that, arguments);
                    if (focusedCellPosition && focusedCellPosition.rowIndex >= 0) {
                        var focusedRowIndexCorrection = getRowIndexCorrection(focusedCellPosition.rowIndex);
                        if (focusedRowIndexCorrection) {
                            focusedCellPosition.rowIndex += focusedRowIndexCorrection;
                            editorFactory.focus(editorFactory.focus())
                        }
                    }
                }
            }
        }
    }
};
