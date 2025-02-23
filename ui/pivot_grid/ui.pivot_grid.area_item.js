/**
 * DevExtreme (ui/pivot_grid/ui.pivot_grid.area_item.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    Class = require("../../core/class"),
    getPublicElement = require("../../core/utils/dom").getPublicElement,
    extend = require("../../core/utils/extend").extend,
    isDefined = require("../../core/utils/type").isDefined;
var PIVOTGRID_EXPAND_CLASS = "dx-expand";
var getRealElementWidth = function(element) {
    var width = 0;
    var offsetWidth = element.offsetWidth;
    if (element.getBoundingClientRect) {
        var clientRect = element.getBoundingClientRect();
        width = clientRect.width;
        if (!width) {
            width = clientRect.right - clientRect.left
        }
        if (width <= offsetWidth - 1) {
            width = offsetWidth
        }
    }
    return width > 0 ? width : offsetWidth
};

function getFakeTableOffset(scrollPos, elementOffset, tableSize, viewPortSize) {
    var offset = 0,
        halfTableCount = 0,
        halfTableSize = tableSize / 2;
    if (scrollPos + viewPortSize - (elementOffset + tableSize) > 1) {
        if (scrollPos >= elementOffset + tableSize + halfTableSize) {
            halfTableCount = parseInt((scrollPos - (elementOffset + tableSize)) / halfTableSize, 10)
        }
        offset = elementOffset + tableSize + halfTableSize * halfTableCount
    } else {
        if (scrollPos < elementOffset) {
            if (scrollPos <= elementOffset - halfTableSize) {
                halfTableCount = parseInt((scrollPos - (elementOffset - halfTableSize)) / halfTableSize, 10)
            }
            offset = elementOffset - (tableSize - halfTableSize * halfTableCount)
        } else {
            offset = elementOffset
        }
    }
    return offset
}
exports.AreaItem = Class.inherit({
    _getRowElement: function(index) {
        var that = this;
        if (that._tableElement && that._tableElement.length > 0) {
            return that._tableElement[0].rows[index]
        }
        return null
    },
    _createGroupElement: function() {
        return $("<div>")
    },
    _createTableElement: function() {
        return $("<table>")
    },
    _getCellText: function(cell, encodeHtml) {
        var cellText = cell.isWhiteSpace ? "&nbsp" : cell.text || "&nbsp";
        if (encodeHtml && (cellText.indexOf("<") !== -1 || cellText.indexOf(">") !== -1)) {
            cellText = $("<div>").text(cellText).html()
        }
        return cellText
    },
    _getRowClassNames: function() {},
    _applyCustomStyles: function(options) {
        if (options.cell.width) {
            options.cssArray.push("min-width:" + options.cell.width + "px")
        }
        if (options.cell.sorted) {
            options.classArray.push("dx-pivotgrid-sorted")
        }
    },
    _getMainElementMarkup: function() {
        return "<tbody>"
    },
    _getCloseMainElementMarkup: function() {
        return "</tbody>"
    },
    _renderTableContent: function(tableElement, data) {
        var row, cell, i, j, rowElement, cellElement, cellText, rowClassNames, that = this,
            rowsCount = data.length,
            rtlEnabled = that.option("rtlEnabled"),
            markupArray = [],
            encodeHtml = that.option("encodeHtml"),
            colspan = "colspan='",
            rowspan = "rowspan='";
        tableElement.data("area", that._getAreaName());
        tableElement.data("data", data);
        tableElement.css("width", "");
        markupArray.push(that._getMainElementMarkup());
        for (i = 0; i < rowsCount; i++) {
            row = data[i];
            var columnMarkupArray = [];
            rowClassNames = [];
            markupArray.push("<tr ");
            for (j = 0; j < row.length; j++) {
                cell = row[j];
                this._getRowClassNames(i, cell, rowClassNames);
                columnMarkupArray.push("<td ");
                if (cell) {
                    cell.rowspan && columnMarkupArray.push(rowspan + (cell.rowspan || 1) + "'");
                    cell.colspan && columnMarkupArray.push(colspan + (cell.colspan || 1) + "'");
                    var styleOptions = {
                        cellElement: cellElement,
                        cell: cell,
                        cellsCount: row.length,
                        cellIndex: j,
                        rowElement: rowElement,
                        rowIndex: i,
                        rowsCount: rowsCount,
                        rtlEnabled: rtlEnabled,
                        classArray: [],
                        cssArray: []
                    };
                    that._applyCustomStyles(styleOptions);
                    if (styleOptions.cssArray.length) {
                        columnMarkupArray.push("style='");
                        columnMarkupArray.push(styleOptions.cssArray.join(";"));
                        columnMarkupArray.push("'")
                    }
                    if (styleOptions.classArray.length) {
                        columnMarkupArray.push("class='");
                        columnMarkupArray.push(styleOptions.classArray.join(" "));
                        columnMarkupArray.push("'")
                    }
                    columnMarkupArray.push(">");
                    if (isDefined(cell.expanded)) {
                        columnMarkupArray.push("<div class='dx-expand-icon-container'><span class='" + PIVOTGRID_EXPAND_CLASS + "'></span></div>")
                    }
                    cellText = this._getCellText(cell, encodeHtml)
                } else {
                    cellText = ""
                }
                columnMarkupArray.push("<span ");
                if (isDefined(cell.wordWrapEnabled)) {
                    columnMarkupArray.push("style='white-space:", cell.wordWrapEnabled ? "normal" : "nowrap", ";'")
                }
                columnMarkupArray.push(">" + cellText + "</span>");
                if (cell.sorted) {
                    columnMarkupArray.push("<span class='dx-icon-sorted'></span>")
                }
                columnMarkupArray.push("</td>")
            }
            if (rowClassNames.length) {
                markupArray.push("class='");
                markupArray.push(rowClassNames.join(" "));
                markupArray.push("'")
            }
            markupArray.push(">");
            markupArray.push(columnMarkupArray.join(""));
            markupArray.push("</tr>")
        }
        markupArray.push(this._getCloseMainElementMarkup());
        tableElement.append(markupArray.join(""));
        this._triggerOnCellPrepared(tableElement, data)
    },
    _triggerOnCellPrepared: function(tableElement, data) {
        var rowElement, $cellElement, onCellPreparedArgs, row, cell, rowIndex, columnIndex, that = this,
            rowElements = tableElement.find("tr"),
            areaName = that._getAreaName(),
            onCellPrepared = that.option("onCellPrepared"),
            hasEvent = that.component.hasEvent("cellPrepared"),
            defaultActionArgs = this.component._defaultActionArgs();
        if (onCellPrepared || hasEvent) {
            for (rowIndex = 0; rowIndex < data.length; rowIndex++) {
                row = data[rowIndex];
                rowElement = rowElements.eq(rowIndex);
                for (columnIndex = 0; columnIndex < row.length; columnIndex++) {
                    cell = row[columnIndex];
                    $cellElement = rowElement.children().eq(columnIndex);
                    onCellPreparedArgs = {
                        area: areaName,
                        rowIndex: rowIndex,
                        columnIndex: columnIndex,
                        cellElement: getPublicElement($cellElement),
                        cell: cell
                    };
                    if (hasEvent) {
                        that.component._trigger("onCellPrepared", onCellPreparedArgs)
                    } else {
                        onCellPrepared(extend(onCellPreparedArgs, defaultActionArgs))
                    }
                }
            }
        }
    },
    _getRowHeight: function(index) {
        var row = this._getRowElement(index);
        var height = 0;
        var offsetHeight = row.offsetHeight;
        if (row && row.lastChild) {
            if (row.getBoundingClientRect) {
                var clientRect = row.getBoundingClientRect();
                height = clientRect.height;
                if (height <= offsetHeight - 1) {
                    height = offsetHeight
                }
            }
            return height > 0 ? height : offsetHeight
        }
        return 0
    },
    _setRowHeight: function(index, value) {
        var row = this._getRowElement(index);
        if (row) {
            row.style.height = value + "px"
        }
    },
    ctor: function(component) {
        this.component = component
    },
    option: function() {
        return this.component.option.apply(this.component, arguments)
    },
    getRowsLength: function() {
        var that = this;
        if (that._tableElement && that._tableElement.length > 0) {
            return that._tableElement[0].rows.length
        }
        return 0
    },
    getRowsHeight: function() {
        var i, that = this,
            result = [],
            rowsLength = that.getRowsLength();
        for (i = 0; i < rowsLength; i++) {
            result.push(that._getRowHeight(i))
        }
        return result
    },
    setRowsHeight: function(values) {
        var i, that = this,
            totalHeight = 0,
            valuesLength = values.length;
        for (i = 0; i < valuesLength; i++) {
            totalHeight += values[i];
            that._setRowHeight(i, values[i])
        }
        this._tableHeight = totalHeight;
        this._tableElement[0].style.height = totalHeight + "px"
    },
    getColumnsWidth: function() {
        var rowIndex, row, i, columnIndex, rowsLength = this.getRowsLength(),
            processedCells = [],
            result = [],
            fillCells = function(cells, rowIndex, columnIndex, rowSpan, colSpan) {
                var rowOffset, columnOffset;
                for (rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
                    for (columnOffset = 0; columnOffset < colSpan; columnOffset++) {
                        cells[rowIndex + rowOffset] = cells[rowIndex + rowOffset] || [];
                        cells[rowIndex + rowOffset][columnIndex + columnOffset] = true
                    }
                }
            };
        if (rowsLength) {
            for (rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
                processedCells[rowIndex] = processedCells[rowIndex] || [];
                row = this._getRowElement(rowIndex);
                for (i = 0; i < row.cells.length; i++) {
                    for (columnIndex = 0; processedCells[rowIndex][columnIndex]; columnIndex++) {}
                    fillCells(processedCells, rowIndex, columnIndex, row.cells[i].rowSpan, row.cells[i].colSpan);
                    if (1 === row.cells[i].colSpan) {
                        result[columnIndex] = result[columnIndex] || getRealElementWidth(row.cells[i])
                    }
                }
            }
        }
        return result
    },
    setColumnsWidth: function(values) {
        var i, totalWidth = 0,
            tableElement = this._tableElement[0],
            colgroupElementHTML = "",
            columnsCount = this.getColumnsCount(),
            columnWidth = [];
        for (i = 0; i < columnsCount; i++) {
            columnWidth.push(values[i] || 0)
        }
        for (i = columnsCount; i < values.length && values; i++) {
            columnWidth[columnsCount - 1] += values[i]
        }
        for (i = 0; i < columnsCount; i++) {
            totalWidth += columnWidth[i];
            colgroupElementHTML += '<col style="width: ' + columnWidth[i] + 'px">'
        }
        this._colgroupElement.html(colgroupElementHTML);
        this._tableWidth = totalWidth - this._groupWidth > .01 ? Math.ceil(totalWidth) : totalWidth;
        tableElement.style.width = this._tableWidth + "px";
        tableElement.style.tableLayout = "fixed"
    },
    resetColumnsWidth: function() {
        this._colgroupElement.find("col").width("auto");
        this._tableElement.css({
            width: "",
            tableLayout: ""
        })
    },
    groupWidth: function(value) {
        if (void 0 === value) {
            return this._groupElement.width()
        } else {
            if (value >= 0) {
                this._groupWidth = value;
                return this._groupElement[0].style.width = value + "px"
            } else {
                return this._groupElement[0].style.width = value
            }
        }
    },
    groupHeight: function(value) {
        if (void 0 === value) {
            return this._groupElement.height()
        }
        this._groupHeight = null;
        if (value >= 0) {
            this._groupHeight = value;
            this._groupElement[0].style.height = value + "px"
        } else {
            this._groupElement[0].style.height = value
        }
    },
    groupElement: function() {
        return this._groupElement
    },
    tableElement: function() {
        return this._tableElement
    },
    element: function() {
        return this._rootElement
    },
    headElement: function() {
        return this._tableElement.find("thead")
    },
    _setTableCss: function(styles) {
        if (this.option("rtlEnabled")) {
            styles.right = styles.left;
            delete styles.left
        }
        this.tableElement().css(styles)
    },
    setVirtualContentParams: function(params) {
        this._virtualContent.css({
            width: params.width,
            height: params.height
        });
        this.groupElement().addClass("dx-virtual-mode")
    },
    disableVirtualMode: function() {
        this.groupElement().removeClass("dx-virtual-mode")
    },
    _renderVirtualContent: function() {
        var that = this;
        if (!that._virtualContent && "virtual" === that.option("scrolling.mode")) {
            that._virtualContent = $("<div>").addClass("dx-virtual-content").insertBefore(that._tableElement)
        }
    },
    reset: function() {
        var that = this,
            tableElement = that._tableElement[0];
        that._fakeTable && that._fakeTable.detach();
        that._fakeTable = null;
        that.disableVirtualMode();
        that.groupWidth("100%");
        that.groupHeight("auto");
        that.resetColumnsWidth();
        if (tableElement) {
            for (var i = 0; i < tableElement.rows.length; i++) {
                tableElement.rows[i].style.height = ""
            }
            tableElement.style.height = "";
            tableElement.style.width = "100%"
        }
    },
    _updateFakeTableVisibility: function() {
        var that = this,
            tableElement = that.tableElement()[0],
            horizontalOffsetName = that.option("rtlEnabled") ? "right" : "left",
            fakeTableElement = that._fakeTable[0];
        if (tableElement.style.top === fakeTableElement.style.top && fakeTableElement.style[horizontalOffsetName] === tableElement.style[horizontalOffsetName]) {
            that._fakeTable.addClass("dx-hidden")
        } else {
            that._fakeTable.removeClass("dx-hidden")
        }
    },
    _moveFakeTableHorizontally: function(scrollPos) {
        var that = this,
            rtlEnabled = that.option("rtlEnabled"),
            offsetStyleName = rtlEnabled ? "right" : "left",
            tableElementOffset = parseFloat(that.tableElement()[0].style[offsetStyleName]),
            offset = getFakeTableOffset(scrollPos, tableElementOffset, that._tableWidth, that._groupWidth);
        if (parseFloat(that._fakeTable[0].style[offsetStyleName]) !== offset) {
            that._fakeTable[0].style[offsetStyleName] = offset + "px"
        }
    },
    _moveFakeTableTop: function(scrollPos) {
        var that = this,
            tableElementOffsetTop = parseFloat(that.tableElement()[0].style.top),
            offsetTop = getFakeTableOffset(scrollPos, tableElementOffsetTop, that._tableHeight, that._groupHeight);
        if (parseFloat(that._fakeTable[0].style.top) !== offsetTop) {
            that._fakeTable[0].style.top = offsetTop + "px"
        }
    },
    _moveFakeTable: function() {
        this._updateFakeTableVisibility()
    },
    _createFakeTable: function() {
        var that = this;
        if (!that._fakeTable) {
            that._fakeTable = that.tableElement().clone().addClass("dx-pivot-grid-fake-table").appendTo(that._virtualContent)
        }
    },
    render: function(rootElement, data) {
        var that = this;
        if (that._tableElement) {
            try {
                that._tableElement[0].innerHTML = ""
            } catch (e) {
                that._tableElement.empty()
            }
            that._tableElement.attr("style", "")
        } else {
            that._groupElement = that._createGroupElement();
            that._tableElement = that._createTableElement();
            that._tableElement.appendTo(that._groupElement);
            that._groupElement.appendTo(rootElement);
            that._rootElement = rootElement
        }
        that._colgroupElement = $("<colgroup>").appendTo(that._tableElement);
        that._renderTableContent(that._tableElement, data);
        that._renderVirtualContent()
    },
    _getScrollable: function() {
        return this.groupElement().data("dxScrollable")
    },
    on: function(eventName, handler) {
        var that = this,
            scrollable = that._getScrollable();
        if (scrollable) {
            scrollable.on(eventName, function(e) {
                if (that.option("rtlEnabled") && isDefined(e.scrollOffset.left)) {
                    e.scrollOffset.left = scrollable.$content().width() - scrollable._container().width() - e.scrollOffset.left
                }
                handler(e)
            })
        }
        return this
    },
    off: function(eventName) {
        var scrollable = this._getScrollable();
        if (scrollable) {
            scrollable.off(eventName)
        }
        return this
    },
    scrollTo: function(pos) {
        var scrollable = this._getScrollable(),
            scrollablePos = pos;
        if (scrollable) {
            if (this.option("rtlEnabled")) {
                if ("column" === this._getAreaName()) {
                    scrollablePos = scrollable.$content().width() - scrollable._container().width() - pos
                } else {
                    if ("data" === this._getAreaName()) {
                        scrollablePos = {
                            x: scrollable.$content().width() - scrollable._container().width() - pos.x,
                            y: pos.y
                        }
                    }
                }
            }
            scrollable.scrollTo(scrollablePos);
            if (this._virtualContent) {
                this._createFakeTable();
                this._moveFakeTable(pos)
            }
        }
    },
    updateScrollable: function() {
        var scrollable = this._getScrollable();
        if (scrollable) {
            return scrollable.update()
        }
    },
    getColumnsCount: function() {
        var cells, columnCount = 0,
            row = this._getRowElement(0);
        if (row) {
            cells = row.cells;
            for (var i = 0, len = cells.length; i < len; ++i) {
                columnCount += cells[i].colSpan
            }
        }
        return columnCount
    },
    getData: function() {
        var tableElement = this._tableElement;
        return tableElement ? tableElement.data("data") : []
    }
});
