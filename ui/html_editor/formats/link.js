/**
 * DevExtreme (ui/html_editor/formats/link.js)
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
var _type = require("../../../core/utils/type");

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
var Link = quill.import("formats/link");
var ExtLink = function(_Link) {
    _inherits(ExtLink, _Link);

    function ExtLink() {
        _classCallCheck(this, ExtLink);
        return _possibleConstructorReturn(this, (ExtLink.__proto__ || Object.getPrototypeOf(ExtLink)).apply(this, arguments))
    }
    _createClass(ExtLink, [{
        key: "formats",
        value: function() {
            var href = ExtLink.formats(this.domNode);
            return {
                link: href,
                target: this.domNode.getAttribute("target")
            }
        }
    }, {
        key: "format",
        value: function(name, value) {
            if ("link" === name && (0, _type.isObject)(value)) {
                if (value.text) {
                    this.domNode.innerText = value.text
                }
                if (value.target) {
                    this.domNode.removeAttribute("target")
                } else {
                    this.domNode.setAttribute("target", "_blank")
                }
                this.domNode.setAttribute("href", value.href)
            } else {
                _get(ExtLink.prototype.__proto__ || Object.getPrototypeOf(ExtLink.prototype), "format", this).call(this, name, value)
            }
        }
    }], [{
        key: "create",
        value: function(data) {
            var HREF = data && data.href || data;
            var node = _get(ExtLink.__proto__ || Object.getPrototypeOf(ExtLink), "create", this).call(this, HREF);
            if ((0, _type.isObject)(data)) {
                if (data.text) {
                    node.innerText = data.text
                }
                if (!data.target) {
                    node.removeAttribute("target")
                }
            }
            return node
        }
    }, {
        key: "value",
        value: function(domNode) {
            return {
                href: domNode.getAttribute("href"),
                text: domNode.innerText,
                target: !!domNode.getAttribute("target")
            }
        }
    }]);
    return ExtLink
}(Link);
exports.default = ExtLink;
