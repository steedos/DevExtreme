/**
 * DevExtreme (ui/html_editor/modules/dropImage.js)
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
var _quill_importer = require("../quill_importer");
var _events_engine = require("../../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _utils = require("../../../events/utils");
var _iterator = require("../../../core/utils/iterator");
var _browser = require("../../../core/utils/browser");
var _browser2 = _interopRequireDefault(_browser);
var _window = require("../../../core/utils/window");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && ("object" === typeof call || "function" === typeof call) ? call : self
}

function _inherits(subClass, superClass) {
    if ("function" !== typeof superClass && null !== superClass) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) {
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
    }
}
var BaseModule = (0, _quill_importer.getQuill)().import("core/module");
var DropImageModule = function(_BaseModule) {
    _inherits(DropImageModule, _BaseModule);

    function DropImageModule(quill, options) {
        _classCallCheck(this, DropImageModule);
        var _this = _possibleConstructorReturn(this, (DropImageModule.__proto__ || Object.getPrototypeOf(DropImageModule)).call(this, quill, options));
        _this.editorInstance = options.editorInstance;
        var widgetName = _this.editorInstance.NAME;
        _events_engine2.default.on(_this.quill.root, (0, _utils.addNamespace)("dragover", widgetName), _this._dragOverHandler.bind(_this));
        _events_engine2.default.on(_this.quill.root, (0, _utils.addNamespace)("drop", widgetName), _this._dropHandler.bind(_this));
        _events_engine2.default.on(_this.quill.root, (0, _utils.addNamespace)("paste", widgetName), _this._pasteHandler.bind(_this));
        return _this
    }
    _createClass(DropImageModule, [{
        key: "_dragOverHandler",
        value: function(e) {
            if (_browser2.default.msie) {
                e.preventDefault()
            }
        }
    }, {
        key: "_dropHandler",
        value: function(e) {
            var dataTransfer = e.originalEvent.dataTransfer;
            var hasFiles = dataTransfer && dataTransfer.files && dataTransfer.files.length;
            e.preventDefault();
            if (hasFiles) {
                this._getImage(dataTransfer.files, this._addImage.bind(this))
            }
        }
    }, {
        key: "_pasteHandler",
        value: function(_ref) {
            var _this2 = this;
            var originalEvent = _ref.originalEvent;
            var clipboardData = originalEvent.clipboardData;
            if (!clipboardData) {
                return
            }
            var hasDataItems = clipboardData.items && clipboardData.items.length;
            var isHtmlData = clipboardData.getData("text/html");
            if (!isHtmlData && hasDataItems) {
                this._getImage(clipboardData.items, function(imageData) {
                    if (_browser2.default.mozilla) {
                        return
                    }
                    if (_browser2.default.msie) {
                        setTimeout(function() {
                            _this2._addImage(imageData)
                        })
                    } else {
                        _this2._addImage(imageData)
                    }
                })
            }
        }
    }, {
        key: "_isImage",
        value: function(file) {
            return !!file.type.match(/^image\/(a?png|bmp|gif|p?jpe?g|svg|vnd\.microsoft\.icon|webp)/i)
        }
    }, {
        key: "_getImage",
        value: function(files, callback) {
            var _this3 = this;
            var window = (0, _window.getWindow)();
            (0, _iterator.each)(files, function(index, file) {
                if (!_this3._isImage(file)) {
                    return
                }
                var reader = new window.FileReader;
                reader.onload = function(_ref2) {
                    var target = _ref2.target;
                    callback(target.result)
                };
                var readableFile = file.getAsFile ? file.getAsFile() : file;
                if (readableFile instanceof window.Blob) {
                    reader.readAsDataURL(readableFile)
                }
            })
        }
    }, {
        key: "_addImage",
        value: function(data) {
            var selection = this.quill.getSelection();
            var pasteIndex = selection ? selection.index : this.quill.getLength();
            this.quill.insertEmbed(pasteIndex, "extendedImage", data, "user")
        }
    }]);
    return DropImageModule
}(BaseModule);
exports.default = DropImageModule;
