/**
 * DevExtreme (exporter/excel_creator.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
    return typeof obj
} : function(obj) {
    return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
};
var Class = require("../core/class"),
    window = require("../core/utils/window").getWindow(),
    typeUtils = require("../core/utils/type"),
    extend = require("../core/utils/extend").extend,
    errors = require("../ui/widget/ui.errors"),
    stringUtils = require("../core/utils/string"),
    JSZip = require("jszip"),
    fileSaver = require("./file_saver"),
    excelFormatConverter = require("./excel_format_converter"),
    ExcelFile = require("./excel/excel.file"),
    isDefined = typeUtils.isDefined,
    XML_TAG = '<?xml version="1.0" encoding="utf-8"?>',
    GROUP_SHEET_PR_XML = '<sheetPr><outlinePr summaryBelow="0"/></sheetPr>',
    SINGLE_SHEET_PR_XML = "<sheetPr/>",
    BASE_STYLE_XML2 = '<borders count="1"><border><left style="thin"><color rgb="FFD3D3D3"/></left><right style="thin"><color rgb="FFD3D3D3"/></right><top style="thin"><color rgb="FFD3D3D3"/></top><bottom style="thin"><color rgb="FFD3D3D3"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>',
    OPEN_XML_FORMAT_URL = "http://schemas.openxmlformats.org",
    RELATIONSHIP_PART_NAME = "rels",
    XL_FOLDER_NAME = "xl",
    WORKBOOK_FILE_NAME = "workbook.xml",
    CONTENTTYPES_FILE_NAME = "[Content_Types].xml",
    SHAREDSTRING_FILE_NAME = "sharedStrings.xml",
    STYLE_FILE_NAME = "styles.xml",
    WORKSHEETS_FOLDER = "worksheets",
    WORKSHEET_FILE_NAME = "sheet1.xml",
    WORKSHEET_HEADER_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">',
    VALID_TYPES = {
        "boolean": "b",
        date: "d",
        number: "n",
        string: "s"
    },
    EXCEL_START_TIME = Date.UTC(1899, 11, 30),
    DAYS_COUNT_BEFORE_29_FEB_1900 = 60,
    MAX_DIGIT_WIDTH_IN_PIXELS = 7;
var ExcelCreator = Class.inherit({
    _getXMLTag: function(tagName, attributes, content) {
        var i, attr, result = "<" + tagName,
            length = attributes.length;
        for (i = 0; i < length; i++) {
            attr = attributes[i];
            if (void 0 !== attr.value) {
                result = result + " " + attr.name + '="' + attr.value + '"'
            }
        }
        return typeUtils.isDefined(content) ? result + ">" + content + "</" + tagName + ">" : result + " />"
    },
    _convertToExcelCellRef: function(zeroBasedRowIndex, zeroBasedCellIndex) {
        var charCode, isCellIndexFound, columnName = "",
            max = 26;
        while (!isCellIndexFound) {
            charCode = 65 + (zeroBasedCellIndex >= max ? zeroBasedCellIndex % max : Math.ceil(zeroBasedCellIndex));
            columnName = String.fromCharCode(charCode) + columnName;
            if (zeroBasedCellIndex >= max) {
                zeroBasedCellIndex = Math.floor(zeroBasedCellIndex / max) - 1
            } else {
                isCellIndexFound = true
            }
        }
        return columnName + (zeroBasedRowIndex + 1)
    },
    _convertToExcelCellRefAndTrackMaxIndex: function(rowIndex, cellIndex) {
        if (this._maxRowIndex < Number(rowIndex)) {
            this._maxRowIndex = Number(rowIndex)
        }
        if (this._maxColumnIndex < Number(cellIndex)) {
            this._maxColumnIndex = Number(cellIndex)
        }
        return this._convertToExcelCellRef(rowIndex, cellIndex)
    },
    _getDataType: function(dataType) {
        return VALID_TYPES[dataType] || VALID_TYPES.string
    },
    _tryGetExcelCellDataType: function(object) {
        if (typeUtils.isDefined(object)) {
            if ("number" === typeof object) {
                if (isFinite(object)) {
                    return VALID_TYPES.number
                } else {
                    return VALID_TYPES.string
                }
            } else {
                if (typeUtils.isString(object)) {
                    return VALID_TYPES.string
                } else {
                    if (typeUtils.isDate(object)) {
                        return VALID_TYPES.number
                    } else {
                        if (typeUtils.isBoolean(object)) {
                            return VALID_TYPES.boolean
                        }
                    }
                }
            }
        }
    },
    _formatObjectConverter: function(format, dataType) {
        var result = {
            format: format,
            precision: format && format.precision,
            dataType: dataType
        };
        if (typeUtils.isObject(format)) {
            return extend(result, format, {
                format: format.formatter || format.type,
                currency: format.currency
            })
        }
        return result
    },
    _tryConvertToExcelNumberFormat: function(format, dataType) {
        var currency, newFormat = this._formatObjectConverter(format, dataType);
        format = newFormat.format;
        currency = newFormat.currency;
        dataType = newFormat.dataType;
        return excelFormatConverter.convertFormat(format, newFormat.precision, dataType, currency)
    },
    _appendString: function(value) {
        if (typeUtils.isDefined(value)) {
            value = String(value);
            if (value.length) {
                value = stringUtils.encodeHtml(value);
                if (void 0 === this._stringHash[value]) {
                    this._stringHash[value] = this._stringArray.length;
                    this._stringArray.push(value)
                }
                return this._stringHash[value]
            }
        }
    },
    _tryGetExcelDateValue: function(date) {
        var days, totalTime;
        if (typeUtils.isDate(date)) {
            days = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - EXCEL_START_TIME) / 864e5);
            if (days < DAYS_COUNT_BEFORE_29_FEB_1900) {
                days--
            }
            totalTime = (3600 * date.getHours() + 60 * date.getMinutes() + date.getSeconds()) / 86400;
            return days + totalTime
        }
    },
    _prepareValue: function(rowIndex, cellIndex) {
        var sourceValue, dataProvider = this._dataProvider,
            _ref = dataProvider.getCellData(rowIndex, cellIndex) || {},
            value = _ref.value,
            cellSourceData = _ref.cellSourceData,
            type = this._getDataType(dataProvider.getCellType(rowIndex, cellIndex));
        if (type === VALID_TYPES.date && !typeUtils.isDate(value)) {
            type = VALID_TYPES.string
        }
        switch (type) {
            case VALID_TYPES.string:
                sourceValue = value;
                value = this._appendString(value);
                break;
            case VALID_TYPES.date:
                sourceValue = value;
                value = this._tryGetExcelDateValue(value);
                type = VALID_TYPES.number
        }
        return {
            value: value,
            type: type,
            sourceValue: sourceValue,
            cellSourceData: cellSourceData
        }
    },
    _callCustomizeExcelCell: function(_ref2) {
        var dataProvider = _ref2.dataProvider,
            value = _ref2.value,
            style = _ref2.style,
            sourceData = _ref2.sourceData;
        var styleCopy = ExcelFile.copyCellFormat(style);
        var args = {
            value: value,
            numberFormat: styleCopy.numberFormat,
            clearStyle: function() {
                this.horizontalAlignment = null;
                this.verticalAlignment = null;
                this.wrapTextEnabled = null;
                this.font = null;
                this.numberFormat = null
            }
        };
        if (isDefined(styleCopy)) {
            if (isDefined(styleCopy.alignment)) {
                args.horizontalAlignment = styleCopy.alignment.horizontal;
                args.verticalAlignment = styleCopy.alignment.vertical;
                args.wrapTextEnabled = styleCopy.alignment.wrapText
            }
            args.backgroundColor = styleCopy.backgroundColor;
            args.fillPatternType = styleCopy.fillPatternType;
            args.fillPatternColor = styleCopy.fillPatternColor;
            args.font = styleCopy.font
        }
        dataProvider.customizeExcelCell(args, sourceData);
        var newStyle = styleCopy || {};
        newStyle.font = args.font;
        newStyle.alignment = newStyle.alignment || {};
        newStyle.alignment.horizontal = args.horizontalAlignment;
        newStyle.alignment.vertical = args.verticalAlignment;
        newStyle.alignment.wrapText = args.wrapTextEnabled;
        newStyle.backgroundColor = args.backgroundColor;
        newStyle.fillPatternType = args.fillPatternType;
        newStyle.fillPatternColor = args.fillPatternColor;
        newStyle.numberFormat = args.numberFormat;
        return {
            value: args.value,
            style: newStyle
        }
    },
    _getDataArray: function() {
        var rowIndex, cellIndex, cellsArray, cellData, cellsLength, that = this,
            result = [],
            dataProvider = that._dataProvider,
            rowsLength = dataProvider.getRowsCount(),
            columns = dataProvider.getColumns();
        for (rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
            cellsArray = [];
            cellsLength = columns.length;
            for (cellIndex = 0; cellIndex !== cellsLength; cellIndex++) {
                cellData = that._prepareValue(rowIndex, cellIndex);
                var styleArrayIndex = dataProvider.getStyleId(rowIndex, cellIndex);
                var cellStyleId = this._styleArrayIndexToCellStyleIdMap[styleArrayIndex];
                if (dataProvider.hasCustomizeExcelCell && dataProvider.hasCustomizeExcelCell()) {
                    var value = cellData.sourceValue || cellData.value;
                    var modifiedExcelCell = this._callCustomizeExcelCell({
                        dataProvider: dataProvider,
                        value: value,
                        style: that._styleArray[styleArrayIndex],
                        sourceData: cellData.cellSourceData
                    });
                    if (modifiedExcelCell.value !== value) {
                        if (_typeof(modifiedExcelCell.value) !== ("undefined" === typeof value ? "undefined" : _typeof(value)) || "number" === typeof modifiedExcelCell.value && !isFinite(modifiedExcelCell.value)) {
                            var cellDataType = this._tryGetExcelCellDataType(modifiedExcelCell.value);
                            if (typeUtils.isDefined(cellDataType)) {
                                cellData.type = cellDataType
                            }
                        }
                        switch (cellData.type) {
                            case VALID_TYPES.string:
                                cellData.value = this._appendString(modifiedExcelCell.value);
                                break;
                            case VALID_TYPES.date:
                                cellData.value = modifiedExcelCell.value;
                                break;
                            case VALID_TYPES.number:
                                var newValue = modifiedExcelCell.value;
                                var excelDateValue = this._tryGetExcelDateValue(newValue);
                                if (typeUtils.isDefined(excelDateValue)) {
                                    newValue = excelDateValue
                                }
                                cellData.value = newValue;
                                break;
                            default:
                                cellData.value = modifiedExcelCell.value
                        }
                    }
                    cellStyleId = this._excelFile.registerCellFormat(modifiedExcelCell.style)
                }
                cellsArray.push({
                    style: cellStyleId,
                    value: cellData.value,
                    type: cellData.type
                })
            }
            if (!that._needSheetPr && dataProvider.getGroupLevel(rowIndex) > 0) {
                that._needSheetPr = true
            }
            result.push(cellsArray)
        }
        return result
    },
    _calculateWidth: function(pixelsWidth) {
        pixelsWidth = parseInt(pixelsWidth, 10);
        if (!pixelsWidth || pixelsWidth < 5) {
            pixelsWidth = 100
        }
        return Math.min(255, Math.floor((pixelsWidth - 5) / MAX_DIGIT_WIDTH_IN_PIXELS * 100 + .5) / 100)
    },
    _prepareStyleData: function() {
        var _this = this;
        var that = this,
            styles = that._dataProvider.getStyles();
        that._dataProvider.getColumns().forEach(function(column) {
            that._colsArray.push(that._calculateWidth(column.width))
        });
        var fonts = [{
            size: 11,
            color: {
                theme: 1
            },
            name: "Calibri",
            family: 2,
            scheme: "minor",
            bold: false
        }, {
            size: 11,
            color: {
                theme: 1
            },
            name: "Calibri",
            family: 2,
            scheme: "minor",
            bold: true
        }];
        this._excelFile.registerFont(fonts[0]);
        this._excelFile.registerFont(fonts[1]);
        styles.forEach(function(style) {
            var numberFormat = that._tryConvertToExcelNumberFormat(style.format, style.dataType);
            if (!typeUtils.isDefined(numberFormat)) {
                numberFormat = 0
            }
            that._styleArray.push({
                font: fonts[Number(!!style.bold)],
                numberFormat: numberFormat,
                alignment: {
                    vertical: "top",
                    wrapText: !!style.wrapText,
                    horizontal: style.alignment || "left"
                }
            })
        });
        that._styleArrayIndexToCellStyleIdMap = that._styleArray.map(function(item) {
            return _this._excelFile.registerCellFormat(item)
        })
    },
    _prepareCellData: function() {
        this._cellsArray = this._getDataArray()
    },
    _createXMLRelationships: function(xmlRelationships) {
        return this._getXMLTag("Relationships", [{
            name: "xmlns",
            value: OPEN_XML_FORMAT_URL + "/package/2006/relationships"
        }], xmlRelationships)
    },
    _createXMLRelationship: function(id, type, target) {
        return this._getXMLTag("Relationship", [{
            name: "Id",
            value: "rId" + id
        }, {
            name: "Type",
            value: OPEN_XML_FORMAT_URL + "/officeDocument/2006/relationships/" + type
        }, {
            name: "Target",
            value: target
        }])
    },
    _getWorkbookContent: function() {
        var content = '<bookViews><workbookView xWindow="0" yWindow="0" windowWidth="0" windowHeight="0"/></bookViews><sheets><sheet name="Sheet" sheetId="1" r:id="rId1" /></sheets><definedNames><definedName name="_xlnm.Print_Titles" localSheetId="0">Sheet!$1:$1</definedName><definedName name="_xlnm._FilterDatabase" hidden="0" localSheetId="0">Sheet!$A$1:$F$6332</definedName></definedNames>';
        return XML_TAG + this._getXMLTag("workbook", [{
            name: "xmlns:r",
            value: OPEN_XML_FORMAT_URL + "/officeDocument/2006/relationships"
        }, {
            name: "xmlns",
            value: OPEN_XML_FORMAT_URL + "/spreadsheetml/2006/main"
        }], content)
    },
    _getContentTypesContent: function() {
        return XML_TAG + '<Types xmlns="' + OPEN_XML_FORMAT_URL + '/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" /><Default Extension="xml" ContentType="application/xml" /><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" /><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" /><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml" /><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" /></Types>'
    },
    _generateStylesXML: function() {
        var that = this,
            folder = that._zip.folder(XL_FOLDER_NAME),
            XML = "";
        XML += this._excelFile.generateNumberFormatsXml();
        XML += this._excelFile.generateFontsXml();
        XML += this._excelFile.generateFillsXml();
        XML += BASE_STYLE_XML2;
        XML += this._excelFile.generateCellFormatsXml();
        XML += that._getXMLTag("cellStyles", [{
            name: "count",
            value: 1
        }], that._getXMLTag("cellStyle", [{
            name: "name",
            value: "Normal"
        }, {
            name: "xfId",
            value: 0
        }, {
            name: "builtinId",
            value: 0
        }]));
        XML = XML_TAG + that._getXMLTag("styleSheet", [{
            name: "xmlns",
            value: OPEN_XML_FORMAT_URL + "/spreadsheetml/2006/main"
        }], XML);
        folder.file(STYLE_FILE_NAME, XML);
        that._styleArray = []
    },
    _generateStringsXML: function() {
        var stringIndex, folder = this._zip.folder(XL_FOLDER_NAME),
            stringsLength = this._stringArray.length,
            sharedStringXml = XML_TAG;
        for (stringIndex = 0; stringIndex < stringsLength; stringIndex++) {
            this._stringArray[stringIndex] = this._getXMLTag("si", [], this._getXMLTag("t", [], this._stringArray[stringIndex]))
        }
        sharedStringXml += this._getXMLTag("sst", [{
            name: "xmlns",
            value: OPEN_XML_FORMAT_URL + "/spreadsheetml/2006/main"
        }, {
            name: "count",
            value: this._stringArray.length
        }, {
            name: "uniqueCount",
            value: this._stringArray.length
        }], this._stringArray.join(""));
        folder.file(SHAREDSTRING_FILE_NAME, sharedStringXml);
        this._stringArray = []
    },
    _getPaneXML: function() {
        var attributes = [{
                name: "activePane",
                value: "bottomLeft"
            }, {
                name: "state",
                value: "frozen"
            }],
            frozenArea = this._dataProvider.getFrozenArea();
        if (!(frozenArea.x || frozenArea.y)) {
            return ""
        }
        if (frozenArea.x) {
            attributes.push({
                name: "xSplit",
                value: frozenArea.x
            })
        }
        if (frozenArea.y) {
            attributes.push({
                name: "ySplit",
                value: frozenArea.y
            })
        }
        attributes.push({
            name: "topLeftCell",
            value: this._convertToExcelCellRefAndTrackMaxIndex(frozenArea.y, frozenArea.x)
        });
        return this._getXMLTag("pane", attributes)
    },
    _getAutoFilterXML: function(maxCellIndex) {
        if (this._options.autoFilterEnabled) {
            return '<autoFilter ref="A' + this._dataProvider.getHeaderRowCount() + ":" + maxCellIndex + '" />'
        }
        return ""
    },
    _getIgnoredErrorsXML: function(maxCellIndex) {
        if (this._options.ignoreErrors) {
            return '<ignoredErrors><ignoredError sqref="A1:' + maxCellIndex + '" numberStoredAsText="1" /></ignoredErrors>'
        }
        return ""
    },
    _generateWorksheetXML: function() {
        var colIndex, rowIndex, cellData, xmlCells, rightBottomCellRef, cellsLength, xmlRows = [],
            rowsLength = this._cellsArray.length,
            colsLength = this._colsArray.length,
            rSpans = "1:" + colsLength,
            headerRowCount = this._dataProvider.getHeaderRowCount ? this._dataProvider.getHeaderRowCount() : 1,
            xmlResult = [WORKSHEET_HEADER_XML];
        xmlResult.push(this._needSheetPr ? GROUP_SHEET_PR_XML : SINGLE_SHEET_PR_XML);
        xmlResult.push('<dimension ref="A1:C1"/>');
        xmlResult.push("<sheetViews><sheetView ");
        xmlResult.push(this._rtlEnabled ? 'rightToLeft="1" ' : "");
        xmlResult.push('tabSelected="1" workbookViewId="0">');
        xmlResult.push(this._getPaneXML());
        xmlResult.push("</sheetView></sheetViews>");
        xmlResult.push('<sheetFormatPr defaultRowHeight="15"');
        xmlResult.push(' outlineLevelRow="' + (this._dataProvider.getRowsCount() > 0 ? this._dataProvider.getGroupLevel(0) : 0) + '"');
        xmlResult.push(' x14ac:dyDescent="0.25"/>');
        for (colIndex = 0; colIndex < colsLength; colIndex++) {
            this._colsArray[colIndex] = this._getXMLTag("col", [{
                name: "width",
                value: this._colsArray[colIndex]
            }, {
                name: "min",
                value: Number(colIndex) + 1
            }, {
                name: "max",
                value: Number(colIndex) + 1
            }])
        }
        xmlResult.push(this._getXMLTag("cols", [], this._colsArray.join("")) + "<sheetData>");
        for (rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
            xmlCells = [];
            cellsLength = this._cellsArray[rowIndex].length;
            for (colIndex = 0; colIndex < cellsLength; colIndex++) {
                rowIndex = Number(rowIndex);
                cellData = this._cellsArray[rowIndex][colIndex];
                xmlCells.push(this._getXMLTag("c", [{
                    name: "r",
                    value: this._convertToExcelCellRefAndTrackMaxIndex(rowIndex, colIndex)
                }, {
                    name: "s",
                    value: cellData.style
                }, {
                    name: "t",
                    value: cellData.type
                }], typeUtils.isDefined(cellData.value) ? this._getXMLTag("v", [], cellData.value) : null))
            }
            xmlRows.push(this._getXMLTag("row", [{
                name: "r",
                value: Number(rowIndex) + 1
            }, {
                name: "spans",
                value: rSpans
            }, {
                name: "outlineLevel",
                value: rowIndex >= headerRowCount ? this._dataProvider.getGroupLevel(rowIndex) : 0
            }, {
                name: "x14ac:dyDescent",
                value: "0.25"
            }], xmlCells.join("")));
            this._cellsArray[rowIndex] = null;
            if (xmlRows.length > 1e4) {
                xmlResult.push(xmlRows.join(""));
                xmlRows = []
            }
        }
        xmlResult.push(xmlRows.join(""));
        xmlRows = [];
        rightBottomCellRef = this._convertToExcelCellRef(this._maxRowIndex, this._maxColumnIndex);
        xmlResult.push("</sheetData>" + this._getAutoFilterXML(rightBottomCellRef) + this._generateMergingXML() + this._getIgnoredErrorsXML(rightBottomCellRef) + "</worksheet>");
        this._zip.folder(XL_FOLDER_NAME).folder(WORKSHEETS_FOLDER).file(WORKSHEET_FILE_NAME, xmlResult.join(""));
        this._colsArray = [];
        this._cellsArray = [];
        xmlResult = []
    },
    _generateMergingXML: function() {
        var k, l, cellIndex, rowIndex, mergeArrayLength, mergeIndex, rowsLength = typeUtils.isDefined(this._dataProvider.getHeaderRowCount) ? this._dataProvider.getHeaderRowCount() : this._dataProvider.getRowsCount(),
            columnsLength = this._dataProvider.getColumns().length,
            usedArea = [],
            mergeArray = [],
            mergeXML = "";
        for (rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
            for (cellIndex = 0; cellIndex !== columnsLength; cellIndex++) {
                if (!typeUtils.isDefined(usedArea[rowIndex]) || !typeUtils.isDefined(usedArea[rowIndex][cellIndex])) {
                    var cellMerge = this._dataProvider.getCellMerging(rowIndex, cellIndex);
                    if (cellMerge.colspan || cellMerge.rowspan) {
                        mergeArray.push({
                            start: this._convertToExcelCellRefAndTrackMaxIndex(rowIndex, cellIndex),
                            end: this._convertToExcelCellRefAndTrackMaxIndex(rowIndex + (cellMerge.rowspan || 0), cellIndex + (cellMerge.colspan || 0))
                        });
                        for (k = rowIndex; k <= rowIndex + cellMerge.rowspan || 0; k++) {
                            for (l = cellIndex; l <= cellIndex + cellMerge.colspan || 0; l++) {
                                if (!typeUtils.isDefined(usedArea[k])) {
                                    usedArea[k] = []
                                }
                                usedArea[k][l] = true
                            }
                        }
                    }
                }
            }
        }
        mergeArrayLength = mergeArray.length;
        for (mergeIndex = 0; mergeIndex < mergeArrayLength; mergeIndex++) {
            mergeXML += this._getXMLTag("mergeCell", [{
                name: "ref",
                value: mergeArray[mergeIndex].start + ":" + mergeArray[mergeIndex].end
            }])
        }
        return mergeXML.length ? this._getXMLTag("mergeCells", [{
            name: "count",
            value: mergeArrayLength
        }], mergeXML) : ""
    },
    _generateCommonXML: function() {
        var xmlRelationships, relsFileContent = XML_TAG + this._createXMLRelationships(this._createXMLRelationship(1, "officeDocument", "xl/" + WORKBOOK_FILE_NAME)),
            folder = this._zip.folder(XL_FOLDER_NAME),
            relsXML = XML_TAG;
        this._zip.folder("_" + RELATIONSHIP_PART_NAME).file("." + RELATIONSHIP_PART_NAME, relsFileContent);
        xmlRelationships = this._createXMLRelationship(1, "worksheet", "worksheets/" + WORKSHEET_FILE_NAME) + this._createXMLRelationship(2, "styles", STYLE_FILE_NAME) + this._createXMLRelationship(3, "sharedStrings", SHAREDSTRING_FILE_NAME);
        relsXML += this._createXMLRelationships(xmlRelationships);
        folder.folder("_" + RELATIONSHIP_PART_NAME).file(WORKBOOK_FILE_NAME + ".rels", relsXML);
        folder.file(WORKBOOK_FILE_NAME, this._getWorkbookContent());
        this._zip.file(CONTENTTYPES_FILE_NAME, this._getContentTypesContent())
    },
    _generateContent: function() {
        this._prepareStyleData();
        this._prepareCellData();
        this._generateWorkXML();
        this._generateCommonXML()
    },
    _generateWorkXML: function() {
        this._generateStylesXML();
        this._generateStringsXML();
        this._generateWorksheetXML()
    },
    ctor: function(dataProvider, options) {
        this._rtlEnabled = options && !!options.rtlEnabled;
        this._options = options;
        this._maxRowIndex = 0;
        this._maxColumnIndex = 0;
        this._stringArray = [];
        this._stringHash = {};
        this._styleArray = [];
        this._colsArray = [];
        this._cellsArray = [];
        this._needSheetPr = false;
        this._dataProvider = dataProvider;
        this._excelFile = new ExcelFile;
        if (typeUtils.isDefined(ExcelCreator.JSZip)) {
            this._zip = new ExcelCreator.JSZip
        } else {
            this._zip = null
        }
    },
    _checkZipState: function() {
        if (!this._zip) {
            throw errors.Error("E1041", "JSZip")
        }
    },
    ready: function() {
        return this._dataProvider.ready()
    },
    getData: function(isBlob) {
        var options = {
            type: isBlob ? "blob" : "base64",
            compression: "DEFLATE",
            mimeType: fileSaver.MIME_TYPES.EXCEL
        };
        this._checkZipState();
        this._generateContent();
        return this._zip.generateAsync ? this._zip.generateAsync(options) : this._zip.generate(options)
    }
});
ExcelCreator.JSZip = JSZip;
exports.ExcelCreator = ExcelCreator;
exports.getData = function(data, options, callback) {
    var excelCreator = new exports.ExcelCreator(data, options);
    excelCreator._checkZipState();
    excelCreator.ready().done(function() {
        if (excelCreator._zip.generateAsync) {
            excelCreator.getData(typeUtils.isFunction(window.Blob)).then(callback)
        } else {
            callback(excelCreator.getData(typeUtils.isFunction(window.Blob)))
        }
    })
};
