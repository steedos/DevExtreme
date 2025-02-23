/**
 * DevExtreme (exporter/image_creator.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _color = require("../color");
var _color2 = _interopRequireDefault(_color);
var _type = require("../core/utils/type");
var _svg = require("../core/utils/svg");
var _svg2 = _interopRequireDefault(_svg);
var _iterator = require("../core/utils/iterator");
var _iterator2 = _interopRequireDefault(_iterator);
var _extend = require("../core/utils/extend");
var _dom_adapter = require("../core/dom_adapter");
var _dom_adapter2 = _interopRequireDefault(_dom_adapter);
var _dom = require("../core/utils/dom");
var _dom2 = _interopRequireDefault(_dom);
var _window = require("../core/utils/window");
var _window2 = _interopRequireDefault(_window);
var _inflector = require("../core/utils/inflector");
var _deferred = require("../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var window = _window2.default.getWindow();
var _math = Math;
var PI = _math.PI;
var _min = _math.min;
var _abs = _math.abs;
var _sqrt = _math.sqrt;
var _pow = _math.pow;
var _atan2 = _math.atan2;
var _cos = _math.cos;
var _sin = _math.sin;
var _each = _iterator2.default.each;
var _number = Number;
var IMAGE_QUALITY = 1;
var TEXT_DECORATION_LINE_WIDTH_COEFF = .05;
var DEFAULT_FONT_SIZE = "10px";
var DEFAULT_FONT_FAMILY = "sans-serif";
var DEFAULT_TEXT_COLOR = "#000";

function createCanvas(width, height, margin) {
    var canvas = (0, _renderer2.default)("<canvas>")[0];
    canvas.width = width + 2 * margin;
    canvas.height = height + 2 * margin;
    canvas.hidden = true;
    return canvas
}

function getStringFromCanvas(canvas, mimeType) {
    var dataURL = canvas.toDataURL(mimeType, IMAGE_QUALITY),
        imageData = window.atob(dataURL.substring(("data:" + mimeType + ";base64,").length));
    return imageData
}

function arcTo(x1, y1, x2, y2, radius, largeArcFlag, clockwise, context) {
    var opSide, adjSide, centerX, centerY, startAngle, endAngle, cBx = (x1 + x2) / 2,
        cBy = (y1 + y2) / 2,
        aB = _atan2(y1 - y2, x1 - x2),
        k = largeArcFlag ? 1 : -1;
    aB += 90 * (PI / 180) * (clockwise ? 1 : -1);
    opSide = _sqrt(_pow(x2 - x1, 2) + _pow(y2 - y1, 2)) / 2;
    adjSide = _sqrt(_abs(_pow(radius, 2) - _pow(opSide, 2)));
    centerX = cBx + k * (adjSide * _cos(aB));
    centerY = cBy + k * (adjSide * _sin(aB));
    startAngle = _atan2(y1 - centerY, x1 - centerX);
    endAngle = _atan2(y2 - centerY, x2 - centerX);
    context.arc(centerX, centerY, radius, startAngle, endAngle, !clockwise)
}

function getElementOptions(element) {
    var coords, attr = parseAttributes(element.attributes || {}),
        options = (0, _extend.extend)({}, attr, {
            text: element.textContent.replace(/\s+/g, " "),
            textAlign: "middle" === attr["text-anchor"] ? "center" : attr["text-anchor"]
        }),
        transform = attr.transform;
    if (transform) {
        coords = transform.match(/translate\(-*\d+([.]\d+)*(,*\s*-*\d+([.]\d+)*)*/);
        if (coords) {
            coords = coords[0].match(/-*\d+([.]\d+)*/g);
            options.translateX = _number(coords[0]);
            options.translateY = coords[1] ? _number(coords[1]) : 0
        }
        coords = transform.match(/rotate\(-*\d+([.]\d+)*(,*\s*-*\d+([.]\d+)*,*\s*-*\d+([.]\d+)*)*/);
        if (coords) {
            coords = coords[0].match(/-*\d+([.]\d+)*/g);
            options.rotationAngle = _number(coords[0]);
            options.rotationX = coords[1] && _number(coords[1]);
            options.rotationY = coords[2] && _number(coords[2])
        }
    }
    parseStyles(element, options);
    return options
}

function drawRect(context, options) {
    var x = options.x,
        y = options.y,
        width = options.width,
        height = options.height,
        cornerRadius = options.rx;
    if (!cornerRadius) {
        context.rect(options.x, options.y, options.width, options.height)
    } else {
        cornerRadius = _min(cornerRadius, width / 2, height / 2);
        context.save();
        context.translate(x, y);
        context.moveTo(width / 2, 0);
        context.arcTo(width, 0, width, height, cornerRadius);
        context.arcTo(width, height, 0, height, cornerRadius);
        context.arcTo(0, height, 0, 0, cornerRadius);
        context.arcTo(0, 0, cornerRadius, 0, cornerRadius);
        context.lineTo(width / 2, 0);
        context.restore()
    }
}

function drawImage(context, options, shared) {
    var d = new _deferred.Deferred,
        image = new window.Image;
    image.onload = function() {
        context.save();
        context.globalAlpha = options.globalAlpha;
        transformElement(context, options);
        clipElement(context, options, shared);
        context.drawImage(image, options.x, options.y, options.width, options.height);
        context.restore();
        d.resolve()
    };
    image.onerror = function() {
        d.resolve()
    };
    image.setAttribute("crossOrigin", "anonymous");
    image.src = options.href || options["xlink:href"];
    return d
}

function drawPath(context, dAttr) {
    var param1, param2, dArray = dAttr.split(" "),
        i = 0;
    do {
        param1 = _number(dArray[i + 1]);
        param2 = _number(dArray[i + 2]);
        switch (dArray[i]) {
            case "M":
                context.moveTo(param1, param2);
                i += 3;
                break;
            case "L":
                context.lineTo(param1, param2);
                i += 3;
                break;
            case "C":
                context.bezierCurveTo(param1, param2, _number(dArray[i + 3]), _number(dArray[i + 4]), _number(dArray[i + 5]), _number(dArray[i + 6]));
                i += 7;
                break;
            case "A":
                arcTo(_number(dArray[i - 2]), _number(dArray[i - 1]), _number(dArray[i + 6]), _number(dArray[i + 7]), param1, _number(dArray[i + 4]), _number(dArray[i + 5]), context);
                i += 8;
                break;
            case "Z":
                context.closePath();
                i += 1
        }
    } while (i < dArray.length)
}

function parseStyles(element, options) {
    var field, style = element.style || {};
    for (field in style) {
        if ("" !== style[field]) {
            options[(0, _inflector.camelize)(field)] = style[field]
        }
    }
    if (_dom_adapter2.default.isElementNode(element) && _dom2.default.contains(_dom_adapter2.default.getBody(), element)) {
        style = window.getComputedStyle(element);
        ["fill", "stroke", "stroke-width", "font-family", "font-size", "font-style", "font-weight"].forEach(function(prop) {
            if (prop in style && "" !== style[prop]) {
                options[(0, _inflector.camelize)(prop)] = style[prop]
            }
        });
        ["opacity", "fill-opacity", "stroke-opacity"].forEach(function(prop) {
            if (prop in style && "" !== style[prop] && "1" !== style[prop]) {
                options[prop] = _number(style[prop])
            }
        })
    }
    options.textDecoration = options.textDecoration || options.textDecorationLine;
    options.globalAlpha = options.opacity || options.globalAlpha
}

function parseUrl(urlString) {
    var matches = urlString && urlString.match(/url\(.*#(.*?)["']?\)/i);
    return matches && matches[1]
}

function setFontStyle(context, options) {
    var fontParams = [];
    options.fontSize = options.fontSize || DEFAULT_FONT_SIZE;
    options.fontFamily || DEFAULT_FONT_FAMILY;
    options.fill = options.fill || DEFAULT_TEXT_COLOR;
    options.fontStyle && fontParams.push(options.fontStyle);
    options.fontWeight && fontParams.push(options.fontWeight);
    fontParams.push(options.fontSize);
    fontParams.push(options.fontFamily);
    context.font = fontParams.join(" ");
    context.textAlign = options.textAlign;
    context.fillStyle = options.fill;
    context.globalAlpha = options.globalAlpha
}

function drawText(context, options, shared) {
    setFontStyle(context, options);
    applyFilter(context, options, shared);
    options.text && context.fillText(options.text, options.x || 0, options.y || 0);
    strokeElement(context, options, true);
    drawTextDecoration(context, options, shared)
}

function drawTextDecoration(context, options, shared) {
    if (!options.textDecoration || "none" === options.textDecoration) {
        return
    }
    var x = options.x,
        textWidth = context.measureText(options.text).width,
        textHeight = parseInt(options.fontSize, 10),
        lineHeight = textHeight * TEXT_DECORATION_LINE_WIDTH_COEFF < 1 ? 1 : textHeight * TEXT_DECORATION_LINE_WIDTH_COEFF,
        y = options.y;
    switch (options.textDecoration) {
        case "line-through":
            y -= textHeight / 3 + lineHeight / 2;
            break;
        case "overline":
            y -= textHeight - lineHeight;
            break;
        case "underline":
            y += lineHeight
    }
    context.rect(x, y, textWidth, lineHeight);
    fillElement(context, options, shared);
    strokeElement(context, options)
}

function aggregateOpacity(options) {
    options.strokeOpacity = void 0 !== options["stroke-opacity"] ? options["stroke-opacity"] : 1;
    options.fillOpacity = void 0 !== options["fill-opacity"] ? options["fill-opacity"] : 1;
    if (void 0 !== options.opacity) {
        options.strokeOpacity *= options.opacity;
        options.fillOpacity *= options.opacity
    }
}

function hasTspan(element) {
    var nodes = element.childNodes;
    for (var i = 0; i < nodes.length; i++) {
        if ("tspan" === nodes[i].tagName) {
            return true
        }
    }
    return false
}

function drawTextElement(childNodes, context, options, shared) {
    var line, lines = [],
        offset = 0;
    for (var i = 0; i < childNodes.length; i++) {
        var element = childNodes[i];
        if (void 0 === element.tagName) {
            drawElement(element, context, options, shared)
        } else {
            if ("tspan" === element.tagName || "text" === element.tagName) {
                var elementOptions = getElementOptions(element),
                    mergedOptions = (0, _extend.extend)({}, options, elementOptions);
                if ("tspan" === element.tagName && hasTspan(element)) {
                    drawTextElement(element.childNodes, context, mergedOptions, shared);
                    continue
                }
                mergedOptions.textAlign = "start";
                if (!line || void 0 !== elementOptions.x) {
                    line = {
                        elements: [],
                        options: [],
                        widths: [],
                        offsets: []
                    };
                    lines.push(line)
                }
                if (void 0 !== elementOptions.y) {
                    offset = 0
                }
                if (void 0 !== elementOptions.dy) {
                    offset += parseFloat(elementOptions.dy)
                }
                line.elements.push(element);
                line.options.push(mergedOptions);
                line.offsets.push(offset);
                setFontStyle(context, mergedOptions);
                line.widths.push(context.measureText(mergedOptions.text).width)
            }
        }
    }
    lines.forEach(function(line) {
        var commonWidth = line.widths.reduce(function(commonWidth, width) {
                return commonWidth + width
            }, 0),
            xDiff = 0,
            currentOffset = 0;
        if ("center" === options.textAlign) {
            xDiff = commonWidth / 2
        }
        if ("end" === options.textAlign) {
            xDiff = commonWidth
        }
        line.options.forEach(function(o, index) {
            var width = line.widths[index];
            o.x = o.x - xDiff + currentOffset;
            o.y += line.offsets[index];
            currentOffset += width
        });
        line.elements.forEach(function(element, index) {
            drawTextElement(element.childNodes, context, line.options[index], shared)
        })
    })
}

function drawElement(element, context, parentOptions, shared) {
    var tagName = element.tagName,
        isText = "text" === tagName || "tspan" === tagName || void 0 === tagName,
        isImage = "image" === tagName,
        options = (0, _extend.extend)({}, parentOptions, getElementOptions(element));
    if ("hidden" === options.visibility || options["hidden-for-export"]) {
        return
    }
    context.save();
    !isImage && transformElement(context, options);
    clipElement(context, options, shared);
    aggregateOpacity(options);
    var promise = void 0;
    context.beginPath();
    switch (element.tagName) {
        case void 0:
            drawText(context, options, shared);
            break;
        case "text":
        case "tspan":
            drawTextElement(element.childNodes, context, options, shared);
            break;
        case "image":
            promise = drawImage(context, options, shared);
            break;
        case "path":
            drawPath(context, options.d);
            break;
        case "rect":
            drawRect(context, options);
            context.closePath();
            break;
        case "circle":
            context.arc(options.cx, options.cy, options.r, 0, 2 * PI, 1)
    }
    if (!isText) {
        applyFilter(context, options, shared);
        fillElement(context, options, shared);
        strokeElement(context, options)
    }
    context.restore();
    return promise
}

function applyFilter(context, options, shared) {
    var filterOptions, id = parseUrl(options.filter);
    if (id) {
        filterOptions = shared.filters[id];
        if (!filterOptions) {
            filterOptions = {
                offsetX: 0,
                offsetY: 0,
                blur: 0,
                color: "#000"
            }
        }
        context.shadowOffsetX = filterOptions.offsetX;
        context.shadowOffsetY = filterOptions.offsetY;
        context.shadowColor = filterOptions.color;
        context.shadowBlur = filterOptions.blur
    }
}

function transformElement(context, options) {
    context.translate(options.translateX || 0, options.translateY || 0);
    delete options.translateX;
    delete options.translateY;
    if (options.rotationAngle) {
        context.translate(options.rotationX || 0, options.rotationY || 0);
        context.rotate(options.rotationAngle * PI / 180);
        context.translate(-(options.rotationX || 0), -(options.rotationY || 0));
        delete options.rotationAngle;
        delete options.rotationX;
        delete options.rotationY
    }
}

function clipElement(context, options, shared) {
    if (options["clip-path"]) {
        drawElement(shared.clipPaths[parseUrl(options["clip-path"])], context, {}, shared);
        context.clip();
        delete options["clip-path"]
    }
}

function hex2rgba(hexColor, alpha) {
    var color = new _color2.default(hexColor);
    return "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")"
}

function createFilter(element) {
    var color, opacity, filterOptions = {};
    _each(element.childNodes, function(_, node) {
        var attr = node.attributes;
        if (!attr.result) {
            return
        }
        switch (attr.result.value) {
            case "gaussianBlurResult":
                filterOptions.blur = _number(attr.stdDeviation.value);
                break;
            case "offsetResult":
                filterOptions.offsetX = _number(attr.dx.value);
                filterOptions.offsetY = _number(attr.dy.value);
                break;
            case "floodResult":
                color = attr["flood-color"] ? attr["flood-color"].value : "#000";
                opacity = attr["flood-opacity"] ? attr["flood-opacity"].value : 1;
                filterOptions.color = hex2rgba(color, opacity)
        }
    });
    return filterOptions
}

function asyncEach(array, callback) {
    var d = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : new _deferred.Deferred;
    if (0 === array.length) {
        return d.resolve()
    }
    var result = callback(array[0]);

    function next() {
        asyncEach(Array.prototype.slice.call(array, 1), callback, d)
    }
    if ((0, _type.isPromise)(result)) {
        result.then(next)
    } else {
        next()
    }
    return d
}

function drawCanvasElements(elements, context, parentOptions, shared) {
    return asyncEach(elements, function(element) {
        switch (element.tagName && element.tagName.toLowerCase()) {
            case "g":
                var options = (0, _extend.extend)({}, parentOptions, getElementOptions(element));
                context.save();
                transformElement(context, options);
                clipElement(context, options, shared);
                var onDone = function() {
                    context.restore()
                };
                var d = drawCanvasElements(element.childNodes, context, options, shared);
                if ((0, _type.isPromise)(d)) {
                    d.then(onDone)
                } else {
                    onDone()
                }
                return d;
            case "defs":
                return drawCanvasElements(element.childNodes, context, {}, shared);
            case "clippath":
                shared.clipPaths[element.attributes.id.textContent] = element.childNodes[0];
                break;
            case "pattern":
                shared.patterns[element.attributes.id.textContent] = element;
                break;
            case "filter":
                shared.filters[element.id] = createFilter(element);
                break;
            default:
                return drawElement(element, context, parentOptions, shared)
        }
    })
}

function setLineDash(context, options) {
    var matches = options["stroke-dasharray"] && options["stroke-dasharray"].match(/(\d+)/g);
    if (matches && matches.length) {
        matches = _iterator2.default.map(matches, function(item) {
            return _number(item)
        });
        context.setLineDash(matches)
    }
}

function strokeElement(context, options, isText) {
    var stroke = options.stroke;
    if (stroke && "none" !== stroke && 0 !== options["stroke-width"]) {
        setLineDash(context, options);
        context.lineJoin = options["stroke-linejoin"];
        context.lineWidth = options["stroke-width"];
        context.globalAlpha = options.strokeOpacity;
        context.strokeStyle = stroke;
        isText ? context.strokeText(options.text, options.x, options.y) : context.stroke();
        context.globalAlpha = 1
    }
}

function getPattern(context, fill, shared) {
    var pattern = shared.patterns[parseUrl(fill)],
        options = getElementOptions(pattern),
        patternCanvas = createCanvas(options.width, options.height, 0),
        patternContext = patternCanvas.getContext("2d");
    drawCanvasElements(pattern.childNodes, patternContext, options, shared);
    return context.createPattern(patternCanvas, "repeat")
}

function fillElement(context, options, shared) {
    var fill = options.fill;
    if (fill && "none" !== fill) {
        context.fillStyle = fill.search(/url/) === -1 ? fill : getPattern(context, fill, shared);
        context.globalAlpha = options.fillOpacity;
        context.fill();
        context.globalAlpha = 1
    }
}
var parseAttributes = function(attributes) {
    var attr, newAttributes = {};
    _iterator2.default.each(attributes, function(index, item) {
        attr = item.textContent;
        if (isFinite(attr)) {
            attr = _number(attr)
        }
        newAttributes[item.name.toLowerCase()] = attr
    });
    return newAttributes
};

function drawBackground(context, width, height, backgroundColor, margin) {
    context.fillStyle = backgroundColor || "#ffffff";
    context.fillRect(-margin, -margin, width + 2 * margin, height + 2 * margin)
}

function getCanvasFromSvg(markup, width, height, backgroundColor, margin) {
    var canvas = createCanvas(width, height, margin),
        context = canvas.getContext("2d"),
        svgElem = _svg2.default.getSvgElement(markup);
    context.translate(margin, margin);
    _dom_adapter2.default.getBody().appendChild(canvas);
    if (svgElem.attributes.direction) {
        canvas.dir = svgElem.attributes.direction.textContent
    }
    drawBackground(context, width, height, backgroundColor, margin);
    return drawCanvasElements(svgElem.childNodes, context, {}, {
        clipPaths: {},
        patterns: {},
        filters: {}
    }).then(function() {
        _dom_adapter2.default.getBody().removeChild(canvas);
        return canvas
    })
}
exports.imageCreator = {
    getImageData: function(markup, options) {
        var mimeType = "image/" + options.format,
            width = options.width,
            height = options.height,
            backgroundColor = options.backgroundColor;
        if ((0, _type.isFunction)(options.__parseAttributesFn)) {
            parseAttributes = options.__parseAttributesFn
        }
        var deferred = new _deferred.Deferred;
        getCanvasFromSvg(markup, width, height, backgroundColor, options.margin).then(function(canvas) {
            deferred.resolve(getStringFromCanvas(canvas, mimeType))
        });
        return deferred
    },
    getData: function(markup, options) {
        var that = this;
        var deferred = new _deferred.Deferred;
        exports.imageCreator.getImageData(markup, options).then(function(binaryData) {
            var mimeType = "image/" + options.format;
            var data = (0, _type.isFunction)(window.Blob) && !options.forceProxy ? that._getBlob(binaryData, mimeType) : that._getBase64(binaryData);
            deferred.resolve(data)
        });
        return deferred
    },
    _getBlob: function(binaryData, mimeType) {
        var i, dataArray = new Uint8Array(binaryData.length);
        for (i = 0; i < binaryData.length; i++) {
            dataArray[i] = binaryData.charCodeAt(i)
        }
        return new window.Blob([dataArray.buffer], {
            type: mimeType
        })
    },
    _getBase64: function(binaryData) {
        return window.btoa(binaryData)
    }
};
exports.getData = function(data, options, callback) {
    return exports.imageCreator.getData(data, options).then(callback)
};
exports.testFormats = function(formats) {
    var canvas = createCanvas(100, 100, 0);
    return formats.reduce(function(r, f) {
        var mimeType = ("image/" + f).toLowerCase();
        if (canvas.toDataURL(mimeType).indexOf(mimeType) !== -1) {
            r.supported.push(f)
        } else {
            r.unsupported.push(f)
        }
        return r
    }, {
        supported: [],
        unsupported: []
    })
};
