/**
 * DevExtreme (ui/widget/template_engines.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _dom = require("../../core/utils/dom");
var _template_engine_registry = require("./template_engine_registry");
(0, _template_engine_registry.registerTemplateEngine)("jquery-tmpl", {
    compile: function(element) {
        return (0, _dom.extractTemplateMarkup)(element)
    },
    render: function(template, data) {
        return jQuery.tmpl(template, data)
    }
});
(0, _template_engine_registry.registerTemplateEngine)("jsrender", {
    compile: function(element) {
        return (jQuery ? jQuery : jsrender).templates((0, _dom.extractTemplateMarkup)(element))
    },
    render: function(template, data) {
        return template.render(data)
    }
});
(0, _template_engine_registry.registerTemplateEngine)("mustache", {
    compile: function(element) {
        return (0, _dom.extractTemplateMarkup)(element)
    },
    render: function(template, data) {
        return Mustache.render(template, data)
    }
});
(0, _template_engine_registry.registerTemplateEngine)("hogan", {
    compile: function(element) {
        return Hogan.compile((0, _dom.extractTemplateMarkup)(element))
    },
    render: function(template, data) {
        return template.render(data)
    }
});
(0, _template_engine_registry.registerTemplateEngine)("underscore", {
    compile: function(element) {
        return _.template((0, _dom.extractTemplateMarkup)(element))
    },
    render: function(template, data) {
        return template(data)
    }
});
(0, _template_engine_registry.registerTemplateEngine)("handlebars", {
    compile: function(element) {
        return Handlebars.compile((0, _dom.extractTemplateMarkup)(element))
    },
    render: function(template, data) {
        return template(data)
    }
});
(0, _template_engine_registry.registerTemplateEngine)("doT", {
    compile: function(element) {
        return doT.template((0, _dom.extractTemplateMarkup)(element))
    },
    render: function(template, data) {
        return template(data)
    }
});
