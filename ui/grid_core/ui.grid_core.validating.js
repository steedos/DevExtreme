/**
 * DevExtreme (ui/grid_core/ui.grid_core.validating.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _uiGrid_core3 = require("./ui.grid_core.utils");
var _common = require("../../core/utils/common");
var _iterator = require("../../core/utils/iterator");
var _type = require("../../core/utils/type");
var _extend = require("../../core/utils/extend");
var _selectors = require("../widget/selectors");
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _button = require("../button");
var _button2 = _interopRequireDefault(_button);
var _pointer = require("../../events/pointer");
var _pointer2 = _interopRequireDefault(_pointer);
var _validation_engine = require("../validation_engine");
var _validation_engine2 = _interopRequireDefault(_validation_engine);
var _validator = require("../validator");
var _validator2 = _interopRequireDefault(_validator);
var _tooltip = require("../tooltip");
var _tooltip2 = _interopRequireDefault(_tooltip);
var _overlay = require("../overlay");
var _overlay2 = _interopRequireDefault(_overlay);
var _themes = require("../themes");
var _themes2 = _interopRequireDefault(_themes);
var _ui = require("../widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var INVALIDATE_CLASS = "invalid",
    REVERT_TOOLTIP_CLASS = "revert-tooltip",
    ROWS_VIEW_CLASS = "rowsview",
    INVALID_MESSAGE_CLASS = "dx-invalid-message",
    WIDGET_INVALID_MESSAGE_CLASS = "invalid-message",
    INVALID_MESSAGE_ALWAYS_CLASS = "dx-invalid-message-always",
    REVERT_BUTTON_CLASS = "dx-revert-button",
    CELL_HIGHLIGHT_OUTLINE = "dx-highlight-outline",
    VALIDATOR_CLASS = "validator",
    INSERT_INDEX = "__DX_INSERT_INDEX__",
    PADDING_BETWEEN_TOOLTIPS = 2,
    EDIT_MODE_ROW = "row",
    EDIT_MODE_FORM = "form",
    EDIT_MODE_BATCH = "batch",
    EDIT_MODE_CELL = "cell",
    EDIT_MODE_POPUP = "popup",
    GROUP_CELL_CLASS = "dx-group-cell",
    FORM_BASED_MODES = [EDIT_MODE_POPUP, EDIT_MODE_FORM],
    COMMAND_TRANSPARENT = "transparent";
var ValidatingController = _uiGrid_core2.default.Controller.inherit(function() {
    return {
        init: function() {
            this._editingController = this.getController("editing");
            this.createAction("onRowValidating")
        },
        _rowValidating: function(editData, validate) {
            var that = this,
                brokenRules = validate ? validate.brokenRules || validate.brokenRule && [validate.brokenRule] : [],
                isValid = validate ? validate.isValid : editData.isValid,
                parameters = {
                    brokenRules: brokenRules,
                    isValid: isValid,
                    key: editData.key,
                    newData: editData.data,
                    oldData: editData.oldData,
                    errorText: this.getHiddenValidatorsErrorText(brokenRules)
                };
            that.executeAction("onRowValidating", parameters);
            editData.isValid = parameters.isValid;
            editData.errorText = parameters.errorText;
            return parameters
        },
        getHiddenValidatorsErrorText: function(brokenRules) {
            var brokenRulesMessages = [];
            (0, _iterator.each)(brokenRules, function(_, brokenRule) {
                if (!brokenRule.validator.$element().parent().length) {
                    brokenRulesMessages.push(brokenRule.message)
                }
            });
            return brokenRulesMessages.join(", ")
        },
        validate: function(isFull) {
            var that = this,
                isValid = true,
                editingController = that._editingController;
            isFull = isFull || editingController.getEditMode() === EDIT_MODE_ROW;
            if (that._isValidationInProgress) {
                return false
            }
            that._isValidationInProgress = true;
            if (isFull) {
                (0, _iterator.each)(editingController._editData, function(index, editData) {
                    var validationResult;
                    if (editData.type && "remove" !== editData.type) {
                        validationResult = that.validateGroup(editData);
                        if (!validationResult.isValid) {
                            (0, _iterator.each)(validationResult.brokenRules, function() {
                                var value = this.validator.option("adapter").getValue();
                                if (void 0 === value) {
                                    value = null
                                }
                                if (this.column) {
                                    editingController.updateFieldValue({
                                        key: editData.key,
                                        column: this.column
                                    }, value, null, true)
                                }
                            })
                        }
                        isValid = isValid && validationResult.isValid
                    }
                })
            } else {
                if (that._currentCellValidator) {
                    isValid = that.validateGroup(that._currentCellValidator._findGroup()).isValid
                }
            }
            that._isValidationInProgress = false;
            return isValid
        },
        validateGroup: function validateGroup(editData) {
            var validationResults, that = this,
                validateGroup = _validation_engine2.default.getGroupConfig(editData);
            if (validateGroup && validateGroup.validators.length) {
                validationResults = _validation_engine2.default.validateGroup(editData)
            }
            return that._rowValidating(editData, validationResults)
        },
        updateEditData: function(editData) {
            var editMode = this._editingController.getEditMode();
            if (FORM_BASED_MODES.indexOf(editMode) === -1) {
                this.setDisableApplyValidationResults(true);
                editData.isValid = _validation_engine2.default.getGroupConfig(editData) ? _validation_engine2.default.validateGroup(editData).isValid : true;
                this.setDisableApplyValidationResults(false)
            } else {
                editData.isValid = true
            }
        },
        setValidator: function(validator) {
            this._currentCellValidator = validator
        },
        getValidator: function() {
            return this._currentCellValidator
        },
        createValidator: function(parameters, $container) {
            var editData, editIndex, visibleColumns, columnsController, that = this,
                editingController = that._editingController,
                column = parameters.column,
                defaultValidationResult = function(options) {
                    if (options.brokenRule) {
                        options.brokenRule.columnIndex = column.index;
                        options.brokenRule.column = column
                    }
                    if ($container && !that.getDisableApplyValidationResults()) {
                        if (!options.isValid) {
                            var $focus = $container.find(":focus");
                            editingController.showHighlighting($container, true);
                            if (!(0, _selectors.focused)($focus)) {
                                _events_engine2.default.trigger($focus, "focus");
                                _events_engine2.default.trigger($focus, _pointer2.default.down)
                            }
                        }
                        $container.toggleClass(that.addWidgetPrefix(INVALIDATE_CLASS), !options.isValid)
                    }
                },
                getValue = function() {
                    var value = column.calculateCellValue(editData.data || {});
                    return void 0 !== value ? value : parameters.value
                },
                showEditorAlways = column.showEditorAlways;
            if (!column.validationRules || !Array.isArray(column.validationRules) || !column.validationRules.length || (0, _type.isDefined)(column.command)) {
                return
            }
            editIndex = editingController.getIndexByKey(parameters.key, editingController._editData);
            if (editIndex < 0) {
                if (!showEditorAlways) {
                    columnsController = that.getController("columns");
                    visibleColumns = columnsController && columnsController.getVisibleColumns() || [];
                    showEditorAlways = visibleColumns.some(function(column) {
                        return column.showEditorAlways
                    })
                }
                if (showEditorAlways) {
                    editIndex = editingController._addEditData({
                        key: parameters.key,
                        oldData: parameters.data
                    })
                }
            }
            if (editIndex >= 0) {
                if ($container && !$container.length) {
                    _ui2.default.log("E1050");
                    return
                }
                editData = editingController._editData[editIndex];
                var useDefaultValidator = $container && $container.hasClass("dx-widget");
                $container && $container.addClass(that.addWidgetPrefix(VALIDATOR_CLASS));
                var validator = new _validator2.default($container || (0, _renderer2.default)("<div>"), {
                    name: column.caption,
                    validationRules: (0, _extend.extend)(true, [], column.validationRules),
                    validationGroup: editData,
                    adapter: useDefaultValidator ? null : {
                        getValue: getValue,
                        applyValidationResults: defaultValidationResult
                    },
                    dataGetter: function() {
                        return (0, _uiGrid_core3.createObjectWithChanges)(editData.oldData, editData.data)
                    }
                });
                if (useDefaultValidator) {
                    var adapter = validator.option("adapter");
                    if (adapter) {
                        adapter.getValue = getValue
                    }
                }
                return validator
            }
        },
        setDisableApplyValidationResults: function(flag) {
            this._disableApplyValidationResults = flag
        },
        getDisableApplyValidationResults: function() {
            return this._disableApplyValidationResults
        }
    }
}());
module.exports = {
    defaultOptions: function() {
        return {
            editing: {
                texts: {
                    validationCancelChanges: _message2.default.format("dxDataGrid-validationCancelChanges")
                }
            }
        }
    },
    controllers: {
        validating: ValidatingController
    },
    extenders: {
        controllers: {
            editing: {
                _addEditData: function(options, row) {
                    var editData, that = this,
                        validatingController = that.getController("validating"),
                        editDataIndex = that.callBase(options, row);
                    if (editDataIndex >= 0) {
                        editData = that._editData[editDataIndex];
                        validatingController.updateEditData(editData)
                    }
                    return editDataIndex
                },
                _updateRowAndPageIndices: function() {
                    var that = this,
                        startInsertIndex = that.getView("rowsView").getTopVisibleItemIndex(),
                        rowIndex = startInsertIndex;
                    (0, _iterator.each)(that._editData, function(_, editData) {
                        if (!editData.isValid && editData.pageIndex !== that._pageIndex) {
                            editData.pageIndex = that._pageIndex;
                            if ("insert" === editData.type) {
                                editData.rowIndex = startInsertIndex
                            } else {
                                editData.rowIndex = rowIndex
                            }
                            rowIndex++
                        }
                    })
                },
                _needInsertItem: function(editData) {
                    var result = this.callBase.apply(this, arguments);
                    if (result && !editData.isValid) {
                        result = editData.key.pageIndex === this._pageIndex
                    }
                    return result
                },
                processItems: function(items, changeType) {
                    var i, itemsCount, that = this,
                        editData = that._editData,
                        dataController = that.getController("data"),
                        getIndexByEditData = function(editData, items) {
                            var index = -1,
                                isInsert = "insert" === editData.type,
                                key = editData.key;
                            (0, _iterator.each)(items, function(i, item) {
                                if ((0, _common.equalByValue)(key, isInsert ? item : dataController.keyOf(item))) {
                                    index = i;
                                    return false
                                }
                            });
                            return index
                        },
                        addInValidItem = function(editData) {
                            var rowIndex, data = {
                                    key: editData.key
                                },
                                index = getIndexByEditData(editData, items);
                            if (index >= 0) {
                                return
                            }
                            editData.rowIndex = editData.rowIndex > itemsCount ? editData.rowIndex % itemsCount : editData.rowIndex;
                            rowIndex = editData.rowIndex;
                            data[INSERT_INDEX] = 1;
                            items.splice(rowIndex, 0, data)
                        };
                    items = that.callBase(items, changeType);
                    itemsCount = items.length;
                    if (that.getEditMode() === EDIT_MODE_BATCH && "prepend" !== changeType && "append" !== changeType) {
                        for (i = 0; i < editData.length; i++) {
                            if (editData[i].type && editData[i].pageIndex === that._pageIndex && editData[i].key.pageIndex !== that._pageIndex) {
                                addInValidItem(editData[i])
                            }
                        }
                    }
                    return items
                },
                processDataItem: function(item) {
                    var editIndex, editData, that = this,
                        isInserted = item.data[INSERT_INDEX],
                        key = isInserted ? item.data.key : item.key,
                        editMode = that.getEditMode();
                    if (editMode === EDIT_MODE_BATCH && isInserted && key) {
                        editIndex = (0, _uiGrid_core3.getIndexByKey)(key, that._editData);
                        if (editIndex >= 0) {
                            editData = that._editData[editIndex];
                            if ("insert" !== editData.type) {
                                item.data = (0, _extend.extend)(true, {}, editData.oldData, editData.data);
                                item.key = key
                            }
                        }
                    }
                    that.callBase.apply(that, arguments)
                },
                _createInvisibleColumnValidators: function(editData) {
                    var validatingController = this.getController("validating"),
                        invisibleColumns = (0, _common.grep)(this.getController("columns").getInvisibleColumns(), function(column) {
                            return !column.isBand
                        }),
                        invisibleColumnValidators = [];
                    if (FORM_BASED_MODES.indexOf(this.getEditMode()) === -1) {
                        (0, _iterator.each)(invisibleColumns, function(_, column) {
                            editData.forEach(function(options) {
                                var data;
                                if ("insert" === options.type) {
                                    data = options.data
                                } else {
                                    if ("update" === options.type) {
                                        data = (0, _uiGrid_core3.createObjectWithChanges)(options.oldData, options.data)
                                    }
                                }
                                if (data) {
                                    var validator = validatingController.createValidator({
                                        column: column,
                                        key: options.key,
                                        value: column.calculateCellValue(data)
                                    });
                                    if (validator) {
                                        invisibleColumnValidators.push(validator)
                                    }
                                }
                            })
                        })
                    }
                    return function() {
                        invisibleColumnValidators.forEach(function(validator) {
                            validator._dispose()
                        })
                    }
                },
                _beforeSaveEditData: function(editData, editIndex) {
                    var isValid, isFullValid, that = this,
                        result = that.callBase.apply(that, arguments),
                        validatingController = that.getController("validating");
                    if (editData) {
                        isValid = "remove" === editData.type || editData.isValid;
                        result = result || !isValid
                    } else {
                        var disposeValidators = that._createInvisibleColumnValidators(this._editData);
                        isFullValid = validatingController.validate(true);
                        disposeValidators();
                        that._updateRowAndPageIndices();
                        switch (that.getEditMode()) {
                            case EDIT_MODE_CELL:
                                if (!isFullValid) {
                                    that._focusEditingCell();
                                    result = true
                                }
                                break;
                            case EDIT_MODE_BATCH:
                                if (!isFullValid) {
                                    that._editRowIndex = -1;
                                    that._editColumnIndex = -1;
                                    that.getController("data").updateItems();
                                    result = true
                                }
                                break;
                            case EDIT_MODE_ROW:
                            case EDIT_MODE_POPUP:
                                result = !isFullValid
                        }
                    }
                    return result
                },
                _beforeEditCell: function(rowIndex, columnIndex, item) {
                    var result = this.callBase(rowIndex, columnIndex, item),
                        $cell = this._rowsView._getCellElement(rowIndex, columnIndex),
                        validator = $cell && $cell.data("dxValidator"),
                        value = validator && validator.option("adapter").getValue();
                    if (this.getEditMode(this) === EDIT_MODE_CELL && (!validator || void 0 !== value && validator.validate().isValid)) {
                        return result
                    }
                },
                _afterSaveEditData: function() {
                    var $firstErrorRow, that = this;
                    (0, _iterator.each)(that._editData, function(_, editData) {
                        var $errorRow = that._showErrorRow(editData);
                        $firstErrorRow = $firstErrorRow || $errorRow
                    });
                    if ($firstErrorRow) {
                        var scrollable = this._rowsView.getScrollable();
                        if (scrollable) {
                            scrollable.update();
                            scrollable.scrollToElement($firstErrorRow)
                        }
                    }
                },
                _showErrorRow: function(editData) {
                    var $popupContent, errorHandling = this.getController("errorHandling"),
                        items = this.getController("data").items(),
                        rowIndex = this.getIndexByKey(editData.key, items);
                    if (!editData.isValid && editData.errorText && rowIndex >= 0) {
                        $popupContent = this.getPopupContent();
                        return errorHandling && errorHandling.renderErrorRow(editData.errorText, rowIndex, $popupContent)
                    }
                },
                updateFieldValue: function(e) {
                    var that = this,
                        editMode = that.getEditMode();
                    that.callBase.apply(that, arguments);
                    if (editMode === EDIT_MODE_ROW || editMode === EDIT_MODE_BATCH && e.column.showEditorAlways) {
                        var currentValidator = that.getController("validating").getValidator();
                        currentValidator && currentValidator.validate()
                    }
                },
                showHighlighting: function($cell, skipValidation) {
                    var validator, isValid = true;
                    if (!skipValidation) {
                        validator = $cell.data("dxValidator");
                        if (validator) {
                            isValid = validator.validate().isValid
                        }
                    }
                    if (isValid) {
                        this.callBase($cell)
                    }
                },
                getEditDataByKey: function(key) {
                    return this._editData[(0, _uiGrid_core3.getIndexByKey)(key, this._editData)]
                }
            },
            editorFactory: function() {
                var getWidthOfVisibleCells = function(that, element) {
                    var rowIndex = (0, _renderer2.default)(element).closest("tr").index(),
                        $cellElements = (0, _renderer2.default)(that._rowsView.getRowElement(rowIndex)).first().children().filter(":not(.dx-hidden-cell)");
                    return that._rowsView._getWidths($cellElements).reduce(function(w1, w2) {
                        return w1 + w2
                    }, 0)
                };
                var getBoundaryNonFixedColumnsInfo = function(fixedColumns) {
                    var firstNonFixedColumnIndex = void 0,
                        lastNonFixedColumnIndex = void 0;
                    fixedColumns.some(function(column, index) {
                        if (column.command === COMMAND_TRANSPARENT) {
                            firstNonFixedColumnIndex = 0 === index ? -1 : index;
                            lastNonFixedColumnIndex = index === fixedColumns.length - 1 ? -1 : index + column.colspan - 1;
                            return true
                        }
                    });
                    return {
                        startColumnIndex: firstNonFixedColumnIndex,
                        endColumnIndex: lastNonFixedColumnIndex
                    }
                };
                return {
                    _showRevertButton: function($container, $targetElement) {
                        var _this = this;
                        if (!$targetElement || !$targetElement.length) {
                            return
                        }
                        var $tooltipElement = (0, _renderer2.default)("<div>").addClass(this.addWidgetPrefix(REVERT_TOOLTIP_CLASS)).appendTo($container);
                        var tooltipOptions = {
                            animation: null,
                            visible: true,
                            target: $targetElement,
                            container: $container,
                            closeOnOutsideClick: false,
                            closeOnTargetScroll: false,
                            contentTemplate: function() {
                                var $buttonElement = (0, _renderer2.default)("<div>").addClass(REVERT_BUTTON_CLASS);
                                var buttonOptions = {
                                    icon: "revert",
                                    hint: _this.option("editing.texts.validationCancelChanges"),
                                    onClick: function() {
                                        _this._editingController.cancelEditData()
                                    }
                                };
                                return new _button2.default($buttonElement, buttonOptions).$element()
                            },
                            position: {
                                my: "left top",
                                at: "right top",
                                of: $targetElement,
                                offset: "1 0",
                                collision: "flip",
                                boundary: this._rowsView.element()
                            },
                            onPositioned: this._positionedHandler.bind(this)
                        };
                        return new _tooltip2.default($tooltipElement, tooltipOptions)
                    },
                    _hideFixedGroupCell: function($cell, overlayOptions) {
                        var nextRowOptions, $nextFixedRowElement, $groupCellElement, isFixedColumns = this._rowsView.isFixedColumns(),
                            isFormEditMode = this._editingController.isFormEditMode();
                        if (isFixedColumns && !isFormEditMode) {
                            nextRowOptions = $cell.closest(".dx-row").next().data("options");
                            if (nextRowOptions && "group" === nextRowOptions.rowType) {
                                $nextFixedRowElement = (0, _renderer2.default)(this._rowsView.getRowElement(nextRowOptions.rowIndex)).last();
                                $groupCellElement = $nextFixedRowElement.find("." + GROUP_CELL_CLASS);
                                if ($groupCellElement.length && "hidden" !== $groupCellElement.get(0).style.visibility) {
                                    $groupCellElement.css("visibility", "hidden");
                                    overlayOptions.onDisposing = function() {
                                        $groupCellElement.css("visibility", "")
                                    }
                                }
                            }
                        }
                    },
                    _positionedHandler: function(e, isOverlayVisible) {
                        if (!e.component.__skipPositionProcessing) {
                            var isRevertButton = (0, _renderer2.default)(e.element).hasClass(this.addWidgetPrefix(REVERT_TOOLTIP_CLASS)),
                                needRepaint = !isRevertButton && this._rowsView.updateFreeSpaceRowHeight(),
                                normalizedPosition = this._normalizeValidationMessagePositionAndMaxWidth(e, isRevertButton, isOverlayVisible);
                            e.component.__skipPositionProcessing = !!(needRepaint || normalizedPosition);
                            if (normalizedPosition) {
                                e.component.option(normalizedPosition)
                            } else {
                                if (needRepaint) {
                                    e.component.repaint()
                                }
                            }
                        }
                    },
                    _showValidationMessage: function($cell, message, alignment, revertTooltip) {
                        var _this2 = this;
                        var $highlightContainer = $cell.find("." + CELL_HIGHLIGHT_OUTLINE),
                            isMaterial = _themes2.default.isMaterial(),
                            overlayTarget = $highlightContainer.length && !isMaterial ? $highlightContainer : $cell,
                            editorPopup = $cell.find(".dx-dropdowneditor-overlay").data("dxPopup"),
                            isOverlayVisible = editorPopup && editorPopup.option("visible"),
                            myPosition = isOverlayVisible ? "top right" : "top " + alignment,
                            atPosition = isOverlayVisible ? "top left" : "bottom " + alignment;
                        var $overlayElement = (0, _renderer2.default)("<div>").addClass(INVALID_MESSAGE_CLASS).addClass(INVALID_MESSAGE_ALWAYS_CLASS).addClass(this.addWidgetPrefix(WIDGET_INVALID_MESSAGE_CLASS)).text(message).appendTo($cell);
                        var overlayOptions = {
                            target: overlayTarget,
                            container: $cell,
                            shading: false,
                            width: "auto",
                            height: "auto",
                            visible: true,
                            animation: false,
                            propagateOutsideClick: true,
                            closeOnOutsideClick: false,
                            closeOnTargetScroll: false,
                            position: {
                                collision: "flip",
                                boundary: this._rowsView.element(),
                                boundaryOffset: "0 0",
                                my: myPosition,
                                at: atPosition
                            },
                            onPositioned: function(e) {
                                _this2._positionedHandler(e, isOverlayVisible);
                                _this2._shiftValidationMessageIfNeed(e.component.$content(), revertTooltip && revertTooltip.$content(), $cell)
                            }
                        };
                        this._hideFixedGroupCell($cell, overlayOptions);
                        new _overlay2.default($overlayElement, overlayOptions)
                    },
                    _normalizeValidationMessagePositionAndMaxWidth: function(options, isRevertButton, isOverlayVisible) {
                        var fixedColumns = this._columnsController.getFixedColumns();
                        if (!fixedColumns || !fixedColumns.length) {
                            return
                        }
                        var position = void 0,
                            visibleTableWidth = !isRevertButton && getWidthOfVisibleCells(this, options.element),
                            $overlayContentElement = isRevertButton ? options.component.overlayContent() : options.component.$content(),
                            validationMessageWidth = $overlayContentElement.outerWidth(true),
                            needMaxWidth = !isRevertButton && validationMessageWidth > visibleTableWidth,
                            columnIndex = this._rowsView.getCellIndex((0, _renderer2.default)(options.element).closest("td")),
                            boundaryNonFixedColumnsInfo = getBoundaryNonFixedColumnsInfo(fixedColumns);
                        if (!isRevertButton && (columnIndex === boundaryNonFixedColumnsInfo.startColumnIndex || needMaxWidth)) {
                            position = {
                                collision: "none flip",
                                my: "top left",
                                at: isOverlayVisible ? "top right" : "bottom left"
                            }
                        } else {
                            if (columnIndex === boundaryNonFixedColumnsInfo.endColumnIndex) {
                                position = {
                                    collision: "none flip",
                                    my: "top right",
                                    at: isRevertButton || isOverlayVisible ? "top left" : "bottom right"
                                };
                                if (isRevertButton) {
                                    position.offset = "-1 0"
                                }
                            }
                        }
                        return position && {
                            position: position,
                            maxWidth: needMaxWidth ? visibleTableWidth - 2 : void 0
                        }
                    },
                    _shiftValidationMessageIfNeed: function($content, $revertContent, $cell) {
                        if (!$revertContent) {
                            return
                        }
                        var contentOffset = $content.offset(),
                            revertContentOffset = $revertContent.offset();
                        if (contentOffset.top === revertContentOffset.top && contentOffset.left + $content.width() > revertContentOffset.left) {
                            var left = $revertContent.width() + PADDING_BETWEEN_TOOLTIPS;
                            $content.css("left", revertContentOffset.left < $cell.offset().left ? -left : left)
                        }
                    },
                    _getTooltipsSelector: function() {
                        var invalidMessageClass = this.addWidgetPrefix(WIDGET_INVALID_MESSAGE_CLASS),
                            revertTooltipClass = this.addWidgetPrefix(REVERT_TOOLTIP_CLASS);
                        return ".dx-editor-cell ." + revertTooltipClass + ", .dx-editor-cell ." + invalidMessageClass + ", .dx-cell-modified ." + invalidMessageClass
                    },
                    init: function() {
                        this.callBase();
                        this._editingController = this.getController("editing");
                        this._columnsController = this.getController("columns");
                        this._rowsView = this.getView("rowsView")
                    },
                    loseFocus: function(skipValidator) {
                        if (!skipValidator) {
                            this.getController("validating").setValidator(null)
                        }
                        this.callBase()
                    },
                    focus: function($element, hideBorder) {
                        var validationResult, revertTooltip, that = this,
                            $focus = $element && $element.closest(that._getFocusCellSelector()),
                            validator = $focus && ($focus.data("dxValidator") || $element.find("." + that.addWidgetPrefix(VALIDATOR_CLASS)).eq(0).data("dxValidator")),
                            rowOptions = $focus && $focus.closest(".dx-row").data("options"),
                            editData = rowOptions ? that.getController("editing").getEditDataByKey(rowOptions.key) : null,
                            $tooltips = $focus && $focus.closest("." + that.addWidgetPrefix(ROWS_VIEW_CLASS)).find(that._getTooltipsSelector()),
                            $cell = $focus && $focus.is("td") ? $focus : null,
                            showValidationMessage = false,
                            column = $cell && that.getController("columns").getVisibleColumns()[$cell.index()];
                        if (!arguments.length) {
                            return that.callBase()
                        }
                        $tooltips && $tooltips.remove();
                        if (validator) {
                            that.getController("validating").setValidator(validator);
                            if (void 0 !== validator.option("adapter").getValue()) {
                                validationResult = validator.validate();
                                if (!validationResult.isValid) {
                                    hideBorder = true;
                                    showValidationMessage = true
                                }
                            }
                        }
                        if (validationResult && !validationResult.isValid || editData && "update" === editData.type && !that._editingController.isSaving()) {
                            if (that._editingController.getEditMode() === EDIT_MODE_CELL) {
                                revertTooltip = that._showRevertButton($focus, $cell ? $focus.find("." + CELL_HIGHLIGHT_OUTLINE).first() : $focus)
                            }
                        }
                        if (showValidationMessage && $cell && column && validationResult.brokenRule.message) {
                            that._showValidationMessage($focus, validationResult.brokenRule.message, column.alignment || "left", revertTooltip)
                        }!hideBorder && that._rowsView.element() && that._rowsView.updateFreeSpaceRowHeight();
                        return that.callBase($element, hideBorder)
                    }
                }
            }()
        },
        views: {
            rowsView: {
                updateFreeSpaceRowHeight: function($table) {
                    var $rowElements, $freeSpaceRowElement, $freeSpaceRowElements, that = this,
                        $element = that.element(),
                        $tooltipContent = $element && $element.find("." + that.addWidgetPrefix(WIDGET_INVALID_MESSAGE_CLASS) + " .dx-overlay-content");
                    that.callBase($table);
                    if ($tooltipContent && $tooltipContent.length) {
                        $rowElements = that._getRowElements();
                        $freeSpaceRowElements = that._getFreeSpaceRowElements($table);
                        $freeSpaceRowElement = $freeSpaceRowElements.first();
                        if ($freeSpaceRowElement && 1 === $rowElements.length && (!$freeSpaceRowElement.is(":visible") || $tooltipContent.outerHeight() > $freeSpaceRowElement.outerHeight())) {
                            $freeSpaceRowElements.show();
                            $freeSpaceRowElements.height($tooltipContent.outerHeight());
                            return true
                        }
                    }
                },
                _formItemPrepared: function(cellOptions, $container) {
                    var _this3 = this;
                    this.callBase.apply(this, arguments);
                    (0, _common.deferUpdate)(function() {
                        var $editor = $container.find(".dx-widget").first(),
                            isEditorDisposed = $editor.length && !$editor.children().length;
                        if (!isEditorDisposed) {
                            _this3.getController("validating").createValidator(cellOptions, $editor)
                        }
                    })
                },
                _cellPrepared: function($cell, parameters) {
                    if (!this.getController("editing").isFormEditMode()) {
                        this.getController("validating").createValidator(parameters, $cell)
                    }
                    this.callBase.apply(this, arguments)
                }
            }
        }
    }
};
