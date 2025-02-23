/**
 * DevExtreme (framework/html/view_engine_components.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var errors = require("../errors"),
    domUtils = require("../../core/utils/dom"),
    registerComponent = require("../../core/component_registrator"),
    MarkupComponent = require("./markup_component").MarkupComponent;
require("../../integration/knockout");
var View = MarkupComponent.inherit({
    _setDefaultOptions: function() {
        this.callBase();
        this.option({
            name: null,
            title: null
        })
    },
    ctor: function() {
        this._id = domUtils.uniqueId();
        this.callBase.apply(this, arguments)
    },
    _render: function() {
        this.callBase();
        this.element().addClass("dx-view");
        this.element().attr("dx-data-template-id", this._id)
    },
    getId: function() {
        return this._id
    }
});
var Layout = MarkupComponent.inherit({
    _setDefaultOptions: function() {
        this.callBase();
        this.option({
            name: null
        })
    },
    _render: function() {
        this.callBase();
        this.element().addClass("dx-layout")
    }
});
var ViewPlaceholder = MarkupComponent.inherit({
    _setDefaultOptions: function() {
        this.callBase();
        this.option({
            viewName: null
        })
    },
    _render: function() {
        this.callBase();
        this.element().addClass("dx-view-placeholder")
    }
});
var setupTransitionElement = function($element, transitionType, transitionName, contentCssPosition) {
    if ("absolute" === contentCssPosition) {
        $element.addClass("dx-transition-absolute")
    } else {
        $element.addClass("dx-transition-static")
    }
    $element.addClass("dx-transition").addClass("dx-transition-" + transitionName).addClass("dx-transition-" + transitionType).attr("data-dx-transition-type", transitionType).attr("data-dx-transition-name", transitionName)
};
var setupTransitionInnerElement = function($element) {
    $element.addClass("dx-transition-inner-wrapper")
};
var Transition = MarkupComponent.inherit({
    _setDefaultOptions: function() {
        this.callBase();
        this.option({
            name: null,
            type: void 0,
            animation: "slide"
        })
    },
    _render: function() {
        this.callBase();
        var element = this.element();
        setupTransitionElement(element, this.option("type") || this.option("animation"), this.option("name"), "absolute");
        element.wrapInner("<div>");
        setupTransitionInnerElement(element.children());
        if (this.option("type")) {
            errors.log("W0003", "dxTransition", "type", "15.1", "Use the 'animation' property instead")
        }
    },
    _clean: function() {
        this.callBase();
        this.element().empty()
    }
});
var ContentPlaceholder = MarkupComponent.inherit({
    _setDefaultOptions: function() {
        this.callBase();
        this.option({
            name: null,
            transition: void 0,
            animation: "none",
            contentCssPosition: "absolute"
        })
    },
    _render: function() {
        this.callBase();
        var $element = this.element();
        $element.addClass("dx-content-placeholder").addClass("dx-content-placeholder-" + this.option("name"));
        $element.attr("data-dx-content-placeholder-name", this.option("name"));
        setupTransitionElement($element, this.option("transition") || this.option("animation"), this.option("name"), this.option("contentCssPosition"));
        if (this.option("transition")) {
            errors.log("W0003", "dxContentPlaceholder", "transition", "15.1", "Use the 'animation' property instead")
        }
    }
});
var Content = MarkupComponent.inherit({
    _setDefaultOptions: function() {
        this.callBase();
        this.option({
            targetPlaceholder: null
        })
    },
    _optionChanged: function() {
        this._refresh()
    },
    _clean: function() {
        this.callBase();
        this.element().removeClass(this._currentClass)
    },
    _render: function() {
        this.callBase();
        var element = this.element();
        element.addClass("dx-content");
        this._currentClass = "dx-content-" + this.option("targetPlaceholder");
        element.attr("data-dx-target-placeholder-id", this.option("targetPlaceholder"));
        element.addClass(this._currentClass);
        setupTransitionInnerElement(element)
    }
});
registerComponent("dxView", View);
registerComponent("dxLayout", Layout);
registerComponent("dxViewPlaceholder", ViewPlaceholder);
registerComponent("dxContentPlaceholder", ContentPlaceholder);
registerComponent("dxTransition", Transition);
registerComponent("dxContent", Content);
exports.dxView = View;
exports.dxLayout = Layout;
exports.dxViewPlaceholder = ViewPlaceholder;
exports.dxContentPlaceholder = ContentPlaceholder;
exports.dxTransition = Transition;
exports.dxContent = Content;
