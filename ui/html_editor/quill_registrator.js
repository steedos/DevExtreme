/**
 * DevExtreme (ui/html_editor/quill_registrator.js)
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
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) {
                descriptor.writable = true
            }
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) {
            defineProperties(Constructor.prototype, protoProps)
        }
        if (staticProps) {
            defineProperties(Constructor, staticProps)
        }
        return Constructor
    }
}();
var _quill_importer = require("./quill_importer");

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
var QuillRegistrator = function() {
    function QuillRegistrator() {
        _classCallCheck(this, QuillRegistrator);
        if (QuillRegistrator.initialized) {
            return
        }
        var quill = this.getQuill();
        var BaseTheme = require("./themes/base").default;
        var Image = require("./formats/image").default;
        var Link = require("./formats/link").default;
        var FontStyle = require("./formats/font").default;
        var SizeStyle = require("./formats/size").default;
        var AlignStyle = require("./formats/align").default;
        var Toolbar = require("./modules/toolbar").default;
        var DropImage = require("./modules/dropImage").default;
        var Variables = require("./modules/variables").default;
        var DirectionStyle = quill.import("attributors/style/direction");
        quill.register({
            "formats/align": AlignStyle,
            "formats/direction": DirectionStyle,
            "formats/font": FontStyle,
            "formats/size": SizeStyle,
            "formats/extendedImage": Image,
            "formats/link": Link,
            "modules/toolbar": Toolbar,
            "modules/dropImage": DropImage,
            "modules/variables": Variables,
            "themes/basic": BaseTheme
        }, true);
        this._customModules = [];
        QuillRegistrator._initialized = true
    }
    _createClass(QuillRegistrator, [{
        key: "createEditor",
        value: function(container, config) {
            var quill = this.getQuill();
            return new quill(container, config)
        }
    }, {
        key: "registerModules",
        value: function(modulesConfig) {
            var isModule = RegExp("modules/*");
            var quill = this.getQuill();
            var isRegisteredModule = function(modulePath) {
                return !!quill.imports[modulePath]
            };
            for (var modulePath in modulesConfig) {
                if (isModule.test(modulePath) && !isRegisteredModule(modulePath)) {
                    this._customModules.push(modulePath.slice(8))
                }
            }
            quill.register(modulesConfig, true)
        }
    }, {
        key: "getRegisteredModuleNames",
        value: function() {
            return this._customModules
        }
    }, {
        key: "getQuill",
        value: function() {
            return (0, _quill_importer.getQuill)()
        }
    }]);
    return QuillRegistrator
}();
exports.default = QuillRegistrator;
