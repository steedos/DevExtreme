/**
 * DevExtreme (ui/grid_core/ui.grid_core.error_handling.js)
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
var _click = require("../../events/click");
var _click2 = _interopRequireDefault(_click);
var _iterator = require("../../core/utils/iterator");
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var ERROR_ROW_CLASS = "dx-error-row",
    ERROR_MESSAGE_CLASS = "dx-error-message",
    ERROR_CLOSEBUTTON_CLASS = "dx-closebutton",
    ACTION_CLASS = "action";
var ErrorHandlingController = _uiGrid_core2.default.ViewController.inherit({
    init: function() {
        var that = this;
        that._columnHeadersView = that.getView("columnHeadersView");
        that._rowsView = that.getView("rowsView")
    },
    _createErrorRow: function(error, $tableElements) {
        var $errorRow, $closeButton, that = this,
            $errorMessage = this._renderErrorMessage(error);
        if ($tableElements) {
            $errorRow = (0, _renderer2.default)("<tr>").addClass(ERROR_ROW_CLASS);
            $closeButton = (0, _renderer2.default)("<div>").addClass(ERROR_CLOSEBUTTON_CLASS).addClass(that.addWidgetPrefix(ACTION_CLASS));
            _events_engine2.default.on($closeButton, _click2.default.name, that.createAction(function(args) {
                var $errorRow, e = args.event,
                    errorRowIndex = (0, _renderer2.default)(e.currentTarget).closest("." + ERROR_ROW_CLASS).index();
                e.stopPropagation();
                (0, _iterator.each)($tableElements, function(_, tableElement) {
                    $errorRow = (0, _renderer2.default)(tableElement).children("tbody").children("tr").eq(errorRowIndex);
                    that.removeErrorRow($errorRow)
                });
                that.component._fireContentReadyAction()
            }));
            (0, _renderer2.default)("<td>").attr({
                colSpan: that.getController("columns").getVisibleColumns().length,
                role: "presentation"
            }).prepend($closeButton).append($errorMessage).appendTo($errorRow);
            return $errorRow
        }
        return $errorMessage
    },
    _renderErrorMessage: function(error) {
        var message = error.url ? error.message.replace(error.url, "") : error.message || error,
            $message = (0, _renderer2.default)("<div>").addClass(ERROR_MESSAGE_CLASS).text(message);
        if (error.url) {
            (0, _renderer2.default)("<a>").attr("href", error.url).text(error.url).appendTo($message)
        }
        return $message
    },
    renderErrorRow: function(error, rowIndex, $popupContent) {
        var $row, $errorMessageElement, $firstErrorRow, rowElements, viewElement, $tableElements, that = this;
        if ($popupContent) {
            $popupContent.find("." + ERROR_MESSAGE_CLASS).remove();
            $errorMessageElement = that._createErrorRow(error);
            $popupContent.prepend($errorMessageElement);
            return $errorMessageElement
        }
        viewElement = rowIndex >= 0 || !that._columnHeadersView.isVisible() ? that._rowsView : that._columnHeadersView, $tableElements = $popupContent || viewElement.getTableElements();
        (0, _iterator.each)($tableElements, function(_, tableElement) {
            $errorMessageElement = that._createErrorRow(error, $tableElements);
            $firstErrorRow = $firstErrorRow || $errorMessageElement;
            if (rowIndex >= 0) {
                $row = viewElement._getRowElements((0, _renderer2.default)(tableElement)).eq(rowIndex);
                that.removeErrorRow($row.next());
                $errorMessageElement.insertAfter($row)
            } else {
                var $tbody = (0, _renderer2.default)(tableElement).children("tbody");
                rowElements = $tbody.children("tr");
                if (that._columnHeadersView.isVisible()) {
                    that.removeErrorRow(rowElements.last());
                    (0, _renderer2.default)(tableElement).append($errorMessageElement)
                } else {
                    that.removeErrorRow(rowElements.first());
                    $tbody.first().prepend($errorMessageElement)
                }
            }
        });
        return $firstErrorRow
    },
    removeErrorRow: function($row) {
        if (!$row) {
            var $columnHeaders = this._columnHeadersView && this._columnHeadersView.element();
            $row = $columnHeaders && $columnHeaders.find("." + ERROR_ROW_CLASS);
            if (!$row || !$row.length) {
                var $rowsViewElement = this._rowsView.element();
                $row = $rowsViewElement && $rowsViewElement.find("." + ERROR_ROW_CLASS)
            }
        }
        $row && $row.hasClass(ERROR_ROW_CLASS) && $row.remove()
    },
    optionChanged: function(args) {
        var that = this;
        switch (args.name) {
            case "errorRowEnabled":
                args.handled = true;
                break;
            default:
                that.callBase(args)
        }
    }
});
module.exports = {
    defaultOptions: function() {
        return {
            errorRowEnabled: true
        }
    },
    controllers: {
        errorHandling: ErrorHandlingController
    },
    extenders: {
        controllers: {
            data: {
                init: function() {
                    var that = this,
                        errorHandlingController = that.getController("errorHandling");
                    that.callBase();
                    that.dataErrorOccurred.add(function(error, $popupContent) {
                        if (that.option("errorRowEnabled")) {
                            errorHandlingController.renderErrorRow(error, void 0, $popupContent)
                        }
                    });
                    that.changed.add(function(e) {
                        if (e && "loadError" === e.changeType) {
                            return
                        }
                        var errorHandlingController = that.getController("errorHandling"),
                            editingController = that.getController("editing");
                        if (editingController && !editingController.hasChanges()) {
                            errorHandlingController && errorHandlingController.removeErrorRow()
                        }
                    })
                }
            }
        }
    }
};
