/**
 * DevExtreme (exporter.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var fileSaver = require("./exporter/file_saver").fileSaver,
    excelCreator = require("./exporter/excel_creator"),
    imageCreator = require("./exporter/image_creator"),
    svgCreator = require("./exporter/svg_creator"),
    _isFunction = require("./core/utils/type").isFunction,
    Deferred = require("./core/utils/deferred").Deferred;
exports.export = function(data, options, getData) {
    if (!data) {
        return (new Deferred).resolve()
    }
    var exportingAction = options.exportingAction,
        exportedAction = options.exportedAction,
        fileSavingAction = options.fileSavingAction,
        eventArgs = {
            fileName: options.fileName,
            format: options.format,
            cancel: false
        };
    _isFunction(exportingAction) && exportingAction(eventArgs);
    if (!eventArgs.cancel) {
        return getData(data, options, function(blob) {
            _isFunction(exportedAction) && exportedAction();
            if (_isFunction(fileSavingAction)) {
                eventArgs.data = blob;
                fileSavingAction(eventArgs)
            }
            if (!eventArgs.cancel) {
                fileSaver.saveAs(eventArgs.fileName, options.format, blob, options.proxyUrl, void 0, options.forceProxy)
            }
        })
    }
    return (new Deferred).resolve()
};
exports.fileSaver = fileSaver;
exports.excel = {
    creator: excelCreator.ExcelCreator,
    getData: excelCreator.getData,
    formatConverter: require("./exporter/excel_format_converter")
};
exports.image = {
    creator: imageCreator.imageCreator,
    getData: imageCreator.getData,
    testFormats: imageCreator.testFormats
};
exports.pdf = {
    getData: require("./exporter/pdf_creator").getData
};
exports.svg = {
    creator: svgCreator.svgCreator,
    getData: svgCreator.getData
};
