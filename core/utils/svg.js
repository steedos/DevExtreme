/**
 * DevExtreme (core/utils/svg.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var domAdapter = require("../../core/dom_adapter"),
    window = require("./window").getWindow(),
    $ = require("../../core/renderer");

function getMarkup(element, backgroundColor) {
    var temp = domAdapter.createElement("div");
    var clone = element.cloneNode(true);
    if (backgroundColor) {
        $(clone).css("backgroundColor", backgroundColor)
    }
    temp.appendChild(clone);
    return temp.innerHTML
}

function fixNamespaces(markup) {
    var first = true;
    if (markup.indexOf("xmlns:xlink") === -1) {
        markup = markup.replace("<svg", '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
    }
    markup = markup.replace(/xmlns="[\s\S]*?"/gi, function(match) {
        if (!first) {
            return ""
        }
        first = false;
        return match
    });
    return markup.replace(/xmlns:NS1="[\s\S]*?"/gi, "").replace(/NS1:xmlns:xlink="([\s\S]*?)"/gi, 'xmlns:xlink="$1"')
}

function decodeHtmlEntities(markup) {
    return markup.replace(/&quot;/gi, "&#34;").replace(/&amp;/gi, "&#38;").replace(/&apos;/gi, "&#39;").replace(/&lt;/gi, "&#60;").replace(/&gt;/gi, "&#62;").replace(/&nbsp;/gi, "&#160;").replace(/&shy;/gi, "&#173;")
}
exports.getSvgMarkup = function(element, backgroundColor) {
    return fixNamespaces(decodeHtmlEntities(getMarkup(element, backgroundColor)))
};
exports.getSvgElement = function(markup) {
    return domAdapter.isNode(markup) ? markup : (new window.DOMParser).parseFromString(markup, "image/svg+xml").childNodes[0]
};
