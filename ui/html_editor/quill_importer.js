/**
 * DevExtreme (ui/html_editor/quill_importer.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getQuill = void 0;
var _ui = require("../widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);
var _window = require("../../core/utils/window");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var Quill = void 0;

function getQuill() {
    if (!Quill) {
        Quill = requestQuill()
    }
    return Quill
}

function requestQuill() {
    var window = (0, _window.getWindow)();
    var quill = window && window.Quill || require("quill");
    if (!quill) {
        throw _ui2.default.Error("E1041", "Quill")
    }
    return quill
}
exports.getQuill = getQuill;
