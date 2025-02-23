/**
 * DevExtreme (ui/html_editor/formats/variable.js)
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
var _get = function get(object, property, receiver) {
    if (null === object) {
        object = Function.prototype
    }
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (void 0 === desc) {
        var parent = Object.getPrototypeOf(object);
        if (null === parent) {
            return
        } else {
            return get(parent, property, receiver)
        }
    } else {
        if ("value" in desc) {
            return desc.value
        } else {
            var getter = desc.get;
            if (void 0 === getter) {
                return
            }
            return getter.call(receiver)
        }
    }
};
var _quill_importer = require("../quill_importer");
var _common = require("../../../core/utils/common");
var _extend = require("../../../core/utils/extend");

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
var quill = (0, _quill_importer.getQuill)();
var Embed = quill.import("blots/embed");
var VARIABLE_CLASS = "dx-variable";
var Variable = function(_Embed) {
    _inherits(Variable, _Embed);

    function Variable() {
        _classCallCheck(this, Variable);
        return _possibleConstructorReturn(this, (Variable.__proto__ || Object.getPrototypeOf(Variable)).apply(this, arguments))
    }
    _createClass(Variable, null, [{
        key: "create",
        value: function(data) {
            var node = _get(Variable.__proto__ || Object.getPrototypeOf(Variable), "create", this).call(this),
                startEscapeChar = void 0,
                endEscapeChar = void 0,
                text = data.value;
            if (Array.isArray(data.escapeChar)) {
                startEscapeChar = (0, _common.ensureDefined)(data.escapeChar[0], "");
                endEscapeChar = (0, _common.ensureDefined)(data.escapeChar[1], "")
            } else {
                startEscapeChar = endEscapeChar = data.escapeChar
            }
            node.innerText = startEscapeChar + text + endEscapeChar;
            node.dataset.varStartEscChar = startEscapeChar;
            node.dataset.varEndEscChar = endEscapeChar;
            node.dataset.varValue = data.value;
            return node
        }
    }, {
        key: "value",
        value: function(node) {
            return (0, _extend.extend)({}, {
                value: node.dataset.varValue,
                escapeChar: [node.dataset.varStartEscChar || "", node.dataset.varEndEscChar || ""]
            })
        }
    }]);
    return Variable
}(Embed);
Variable.blotName = "variable";
Variable.tagName = "span";
Variable.className = VARIABLE_CLASS;
exports.default = Variable;
