/**
 * DevExtreme (ui/html_editor/converters/delta.js)
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
var _slicedToArray = function() {
    function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = void 0;
        try {
            for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i) {
                    break
                }
            }
        } catch (err) {
            _d = true;
            _e = err
        } finally {
            try {
                if (!_n && _i.return) {
                    _i.return()
                }
            } finally {
                if (_d) {
                    throw _e
                }
            }
        }
        return _arr
    }
    return function(arr, i) {
        if (Array.isArray(arr)) {
            return arr
        } else {
            if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i)
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance")
            }
        }
    }
}();
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
var _converterController = require("../converterController");
var _converterController2 = _interopRequireDefault(_converterController);
var _quill_importer = require("../quill_importer");
var _type = require("../../../core/utils/type");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i]
        }
        return arr2
    } else {
        return Array.from(arr)
    }
}

function _toArray(arr) {
    return Array.isArray(arr) ? arr : Array.from(arr)
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
var ESCAPING_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
};
var LIST_BLOT_NAME = "list";
var LIST_ITEM_BLOT_NAME = "list-item";
var DeltaConverter = function() {
    function DeltaConverter() {
        _classCallCheck(this, DeltaConverter);
        this.TextBlot = (0, _quill_importer.getQuill)().import("blots/text");
        this.BreakBlot = (0, _quill_importer.getQuill)().import("blots/break")
    }
    _createClass(DeltaConverter, [{
        key: "setQuillInstance",
        value: function(quillInstance) {
            this.quillInstance = quillInstance
        }
    }, {
        key: "toHtml",
        value: function() {
            if (!this.quillInstance) {
                return
            }
            return this._isQuillEmpty() ? "" : this._convertHTML(this.quillInstance.scroll, 0, this.quillInstance.getLength(), true)
        }
    }, {
        key: "_isQuillEmpty",
        value: function() {
            var delta = this.quillInstance.getContents();
            return 1 === delta.length() && this._isDeltaEmpty(delta)
        }
    }, {
        key: "_isDeltaEmpty",
        value: function(delta) {
            return delta.reduce(function(__, _ref) {
                var insert = _ref.insert;
                return insert.indexOf("\n") !== -1
            })
        }
    }, {
        key: "_convertHTML",
        value: function(blot, index, length) {
            var _this = this;
            var isRoot = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : false;
            if ((0, _type.isFunction)(blot.html)) {
                return blot.html(index, length)
            }
            if (blot instanceof this.TextBlot) {
                return this._escapeText(blot.value().slice(index, index + length))
            }
            if (blot.children) {
                if (blot.statics.blotName === LIST_BLOT_NAME) {
                    return this._convertList(blot, index, length)
                }
                var parts = [];
                blot.children.forEachAt(index, length, function(child, offset, childLength) {
                    parts.push(_this._convertHTML(child, offset, childLength))
                });
                this._handleBreakLine(blot.children, parts);
                if (isRoot || blot.statics.blotName === LIST_ITEM_BLOT_NAME) {
                    return parts.join("")
                }
                var _blot$domNode = blot.domNode,
                    outerHTML = _blot$domNode.outerHTML,
                    innerHTML = _blot$domNode.innerHTML;
                var _outerHTML$split = outerHTML.split(">" + innerHTML + "<"),
                    _outerHTML$split2 = _slicedToArray(_outerHTML$split, 2),
                    start = _outerHTML$split2[0],
                    end = _outerHTML$split2[1];
                return start + ">" + parts.join("") + "<" + end
            }
            return blot.domNode.outerHTML
        }
    }, {
        key: "_handleBreakLine",
        value: function(linkedList, parts) {
            if (1 === linkedList.length && linkedList.head instanceof this.BreakBlot) {
                parts.push("<br>")
            }
        }
    }, {
        key: "_convertList",
        value: function(blot, index, length) {
            var items = [];
            var parentFormats = blot.formats();
            blot.children.forEachAt(index, length, function(child, offset, childLength) {
                var childFormats = child.formats();
                items.push({
                    child: child,
                    offset: offset,
                    length: childLength,
                    indent: childFormats.indent || 0,
                    type: parentFormats.list
                })
            });
            return this._getListMarkup(items, -1, [])
        }
    }, {
        key: "_getListMarkup",
        value: function(items, lastIndent, listTypes) {
            if (0 === items.length) {
                var _endTag = this._getListType(listTypes.pop());
                if (lastIndent <= 0) {
                    return "</li></" + _endTag + ">"
                }
                return this._processListMarkup([
                    [], lastIndent - 1, listTypes
                ], _endTag)
            }
            var _items = _toArray(items),
                _items$ = _items[0],
                child = _items$.child,
                offset = _items$.offset,
                length = _items$.length,
                indent = _items$.indent,
                type = _items$.type,
                rest = _items.slice(1);
            var tag = this._getListType(type);
            var childItemArgs = [child, offset, length];
            var restItemsArgs = [rest, indent, listTypes];
            if (indent > lastIndent) {
                listTypes.push(type);
                var multiLevelTags = this._correctListMultiIndent(listTypes, type, tag, indent - lastIndent - 1);
                return multiLevelTags + this._processIndentListMarkup(childItemArgs, restItemsArgs, tag)
            }
            if (indent === lastIndent) {
                return this._processIndentListMarkup(childItemArgs, restItemsArgs)
            }
            var endTag = this._getListType(listTypes.pop());
            return this._processListMarkup([items, lastIndent - 1, listTypes], endTag)
        }
    }, {
        key: "_correctListMultiIndent",
        value: function(listTypes, type, tag, indent) {
            var markup = "";
            while (indent) {
                markup += "<" + tag + ">";
                listTypes.push(type);
                indent--
            }
            return markup
        }
    }, {
        key: "_processListMarkup",
        value: function(childItemArgs, tag) {
            return "</li></" + tag + ">" + this._getListMarkup.apply(this, _toConsumableArray(childItemArgs))
        }
    }, {
        key: "_processIndentListMarkup",
        value: function(childItemArgs, restItemsArgs) {
            var tag = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "/li";
            var itemAttrs = this._getListItemAttributes(childItemArgs[0]);
            return "<" + tag + "><li" + itemAttrs + ">" + this._convertHTML.apply(this, _toConsumableArray(childItemArgs)) + this._getListMarkup.apply(this, _toConsumableArray(restItemsArgs))
        }
    }, {
        key: "_getListItemAttributes",
        value: function(_ref2) {
            var domNode = _ref2.domNode;
            if (!domNode.hasAttributes()) {
                return ""
            }
            var attributes = domNode.attributes;
            var attributesString = " ";
            for (var i = 0; i < attributes.length; i++) {
                var _attributes$i = attributes[i],
                    name = _attributes$i.name,
                    value = _attributes$i.value;
                if ("class" === name) {
                    value = this._removeIndentClass(value)
                }
                if (value.length) {
                    attributesString += name + '="' + value + '"'
                }
            }
            return attributesString.length > 1 ? attributesString : ""
        }
    }, {
        key: "_getListType",
        value: function(type) {
            return "ordered" === type ? "ol" : "ul"
        }
    }, {
        key: "_removeIndentClass",
        value: function(classString) {
            return classString.replace(/ql-indent-\d/g, "").trim()
        }
    }, {
        key: "_escapeText",
        value: function(text) {
            return text.replace(/[&<>"']/g, function(char) {
                return ESCAPING_MAP[char]
            })
        }
    }]);
    return DeltaConverter
}();
_converterController2.default.addConverter("delta", DeltaConverter);
exports.default = DeltaConverter;
