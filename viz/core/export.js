/**
 * DevExtreme (viz/core/export.js)
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
exports.plugin = exports.ExportMenu = exports.getMarkup = exports.exportFromMarkup = void 0;
var _extend = require("../../core/utils/extend");
var _window = require("../../core/utils/window");
var _utils = require("./utils");
var _exporter = require("../../exporter");
var _exporter2 = _interopRequireDefault(_exporter);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _type = require("../../core/utils/type");
var _themes = require("../themes");
var _themes2 = _interopRequireDefault(_themes);
var _hover = require("../../events/hover");
var _hover2 = _interopRequireDefault(_hover);
var _pointer = require("../../events/pointer");
var _pointer2 = _interopRequireDefault(_pointer);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var imageExporter = _exporter2.default.image;
var svgExporter = _exporter2.default.svg;
var pdfExporter = _exporter2.default.pdf;
var pointerActions = [_pointer2.default.down, _pointer2.default.move].join(" ");
var BUTTON_SIZE = 35;
var ICON_COORDS = [
    [9, 12, 26, 12, 26, 14, 9, 14],
    [9, 17, 26, 17, 26, 19, 9, 19],
    [9, 22, 26, 22, 26, 24, 9, 24]
];
var LIST_PADDING_TOP = 4;
var LIST_WIDTH = 120;
var VERTICAL_TEXT_MARGIN = 8;
var HORIZONTAL_TEXT_MARGIN = 15;
var MENU_ITEM_HEIGHT = 30;
var LIST_STROKE_WIDTH = 1;
var MARGIN = 10;
var SHADOW_OFFSET = 2;
var SHADOW_BLUR = 3;
var DEFAULT_EXPORT_FORMAT = "PNG";
var ALLOWED_IMAGE_FORMATS = [DEFAULT_EXPORT_FORMAT, "JPEG", "GIF"];
var ALLOWED_EXTRA_FORMATS = ["PDF", "SVG"];
var EXPORT_CSS_CLASS = "dx-export-menu";
var EXPORT_DATA_KEY = "export-element-type";
var FORMAT_DATA_KEY = "export-element-format";
var GET_COLOR_REGEX = /data-backgroundcolor="([^"]*)"/;

function getValidFormats() {
    var imageFormats = imageExporter.testFormats(ALLOWED_IMAGE_FORMATS);
    return {
        unsupported: imageFormats.unsupported,
        supported: imageFormats.supported.concat(ALLOWED_EXTRA_FORMATS)
    }
}

function validateFormat(format, incidentOccurred, validFormats) {
    validFormats = validFormats || getValidFormats();
    format = String(format).toUpperCase();
    if (validFormats.supported.indexOf(format) !== -1) {
        return format
    }
    if (validFormats.unsupported.indexOf(format) !== -1) {
        incidentOccurred && incidentOccurred("W2108", [format])
    }
}

function getCreatorFunc(format) {
    if ("SVG" === format) {
        return svgExporter.getData
    } else {
        if ("PDF" === format) {
            return pdfExporter.getData
        } else {
            return imageExporter.getData
        }
    }
}

function _print(imageSrc, options) {
    var document = (0, _window.getWindow)().document;
    var iFrame = document.createElement("iframe");
    iFrame.onload = setPrint(imageSrc, options);
    iFrame.style.visibility = "hidden";
    iFrame.style.position = "fixed";
    iFrame.style.right = "0";
    iFrame.style.bottom = "0";
    document.body.appendChild(iFrame)
}

function setPrint(imageSrc, options) {
    return function() {
        var _this = this;
        var window = this.contentWindow;
        var img = window.document.createElement("img");
        window.document.body.appendChild(img);
        var removeFrame = function() {
            _this.parentElement.removeChild(_this)
        };
        img.addEventListener("load", function() {
            window.focus();
            window.print();
            removeFrame()
        });
        img.addEventListener("error", removeFrame);
        img.src = imageSrc
    }
}

function getItemAttributes(options, type, itemIndex) {
    var x = BUTTON_SIZE - LIST_WIDTH;
    var y = BUTTON_SIZE + LIST_PADDING_TOP + LIST_STROKE_WIDTH + itemIndex * MENU_ITEM_HEIGHT;
    var attr = {
        rect: {
            width: LIST_WIDTH - 2 * LIST_STROKE_WIDTH,
            height: MENU_ITEM_HEIGHT,
            x: x + LIST_STROKE_WIDTH,
            y: y
        },
        text: {
            x: x + (options.rtl ? LIST_WIDTH - HORIZONTAL_TEXT_MARGIN : HORIZONTAL_TEXT_MARGIN),
            y: y + MENU_ITEM_HEIGHT - VERTICAL_TEXT_MARGIN
        }
    };
    if ("printing" === type) {
        attr.separator = {
            stroke: options.button.default.borderColor,
            "stroke-width": LIST_STROKE_WIDTH,
            cursor: "pointer",
            sharp: "v",
            d: "M " + x + " " + (y + MENU_ITEM_HEIGHT - LIST_STROKE_WIDTH) + " L " + (x + LIST_WIDTH) + " " + (y + MENU_ITEM_HEIGHT - LIST_STROKE_WIDTH)
        }
    }
    return attr
}

function createMenuItem(renderer, options, settings) {
    var itemData = {};
    var type = settings.type;
    var format = settings.format;
    var attr = getItemAttributes(options, type, settings.itemIndex);
    var fontStyle = (0, _utils.patchFontOptions)(options.font);
    fontStyle["pointer-events"] = "none";
    var menuItem = renderer.g().attr({
        "class": EXPORT_CSS_CLASS + "-list-item"
    });
    itemData[EXPORT_DATA_KEY] = type;
    if (format) {
        itemData[FORMAT_DATA_KEY] = format
    }
    var rect = renderer.rect();
    rect.attr(attr.rect).css({
        cursor: "pointer",
        "pointer-events": "all"
    }).data(itemData);
    rect.on(_hover2.default.start + ".export", function() {
        return rect.attr({
            fill: options.button.hover.backgroundColor
        })
    }).on(_hover2.default.end + ".export", function() {
        return rect.attr({
            fill: null
        })
    });
    rect.append(menuItem);
    var text = renderer.text(settings.text).css(fontStyle).attr(attr.text).append(menuItem);
    if ("printing" === type) {
        renderer.path(null, "line").attr(attr.separator).append(menuItem)
    }
    return {
        g: menuItem,
        rect: rect,
        resetState: function() {
            return rect.attr({
                fill: null
            })
        },
        fixPosition: function() {
            var textBBox = text.getBBox();
            text.move(attr.text.x - textBBox.x - (options.rtl ? textBBox.width : 0))
        }
    }
}

function createMenuItems(renderer, options) {
    var items = [];
    if (options.printingEnabled) {
        items.push(createMenuItem(renderer, options, {
            type: "printing",
            text: _message2.default.format("vizExport-printingButtonText"),
            itemIndex: items.length
        }))
    }
    items = options.formats.reduce(function(r, format) {
        r.push(createMenuItem(renderer, options, {
            type: "exporting",
            text: _message2.default.getFormatter("vizExport-exportButtonText")(format),
            format: format,
            itemIndex: r.length
        }));
        return r
    }, items);
    return items
}

function getBackgroundColorFromMarkup(markup) {
    var parsedMarkup = GET_COLOR_REGEX.exec(markup);
    return parsedMarkup ? parsedMarkup[1] : void 0
}
var exportFromMarkup = exports.exportFromMarkup = function(markup, options) {
    options.format = validateFormat(options.format) || DEFAULT_EXPORT_FORMAT;
    options.fileName = options.fileName || "file";
    options.exportingAction = options.onExporting;
    options.exportedAction = options.onExported;
    options.fileSavingAction = options.onFileSaving;
    options.margin = (0, _type.isDefined)(options.margin) ? options.margin : MARGIN;
    options.backgroundColor = (0, _type.isDefined)(options.backgroundColor) ? options.backgroundColor : getBackgroundColorFromMarkup(markup);
    _exporter2.default.export(markup, options, getCreatorFunc(options.format))
};
var getMarkup = exports.getMarkup = function(widgets) {
    var svgArr = [];
    var height = 0;
    var width = 0;
    var backgroundColors = [];
    var backgroundColorStr = "";
    widgets.forEach(function(widget) {
        var size = widget.getSize(),
            backgroundColor = widget.option("backgroundColor") || _themes2.default.getTheme(widget.option("theme")).backgroundColor;
        backgroundColor && backgroundColors.indexOf(backgroundColor) === -1 && backgroundColors.push(backgroundColor);
        svgArr.push(widget.svg().replace("<svg", '<g transform="translate(0,' + height + ')" ').replace("</svg>", "</g>"));
        height += size.height;
        width = Math.max(width, size.width)
    });
    if (1 === backgroundColors.length) {
        backgroundColorStr = 'data-backgroundcolor="' + backgroundColors[0] + '" '
    }
    return "<svg " + backgroundColorStr + 'height="' + height + '" width="' + width + '" version="1.1" xmlns="http://www.w3.org/2000/svg">' + svgArr.join("") + "</svg>"
};
var ExportMenu = exports.ExportMenu = function(params) {
    var renderer = this._renderer = params.renderer;
    this._incidentOccurred = params.incidentOccurred;
    this._exportTo = params.exportTo;
    this._print = params.print;
    this._shadow = renderer.shadowFilter("-50%", "-50%", "200%", "200%", SHADOW_OFFSET, 6, SHADOW_BLUR);
    this._shadow.attr({
        opacity: .8
    });
    this._group = renderer.g().attr({
        "class": EXPORT_CSS_CLASS,
        "hidden-for-export": true
    }).linkOn(renderer.root, {
        name: "export-menu",
        after: "peripheral"
    });
    this._buttonGroup = renderer.g().attr({
        "class": EXPORT_CSS_CLASS + "-button"
    }).append(this._group);
    this._listGroup = renderer.g().attr({
        "class": EXPORT_CSS_CLASS + "-list"
    }).append(this._group);
    this._overlay = renderer.rect(-LIST_WIDTH + BUTTON_SIZE, BUTTON_SIZE + LIST_PADDING_TOP, LIST_WIDTH, 0);
    this._overlay.attr({
        "stroke-width": LIST_STROKE_WIDTH,
        cursor: "pointer",
        rx: 4,
        ry: 4,
        filter: this._shadow.id
    });
    this._overlay.data({
        "export-element-type": "list"
    });
    this.validFormats = getValidFormats();
    this._subscribeEvents()
};
(0, _extend.extend)(ExportMenu.prototype, {
    getLayoutOptions: function() {
        if (this._hiddenDueToLayout) {
            return {
                width: 0,
                height: 0,
                cutSide: "vertical",
                cutLayoutSide: "top"
            }
        }
        var bBox = this._buttonGroup.getBBox();
        bBox.cutSide = "vertical";
        bBox.cutLayoutSide = "top";
        bBox.height += MARGIN;
        bBox.position = {
            vertical: "top",
            horizontal: "right"
        };
        bBox.verticalAlignment = "top";
        bBox.horizontalAlignment = "right";
        return bBox
    },
    probeDraw: function() {
        this._fillSpace();
        this.show()
    },
    shift: function(_, y) {
        this._group.attr({
            translateY: this._group.attr("translateY") + y
        })
    },
    draw: function(width, height, canvas) {
        this._group.move(width - BUTTON_SIZE - SHADOW_OFFSET - SHADOW_BLUR + canvas.left, Math.floor(height / 2 - BUTTON_SIZE / 2));
        var layoutOptions = this.getLayoutOptions();
        if (layoutOptions.width > width || layoutOptions.height > height) {
            this.freeSpace()
        }
        return this
    },
    show: function() {
        this._group.linkAppend()
    },
    hide: function() {
        this._group.linkRemove()
    },
    setOptions: function(options) {
        var _this2 = this;
        this._options = options;
        if (options.formats) {
            options.formats = options.formats.reduce(function(r, format) {
                format = validateFormat(format, _this2._incidentOccurred, _this2.validFormats);
                format && r.push(format);
                return r
            }, [])
        } else {
            options.formats = this.validFormats.supported.slice()
        }
        options.printingEnabled = void 0 === options.printingEnabled ? true : options.printingEnabled;
        if (options.enabled && (options.formats.length || options.printingEnabled)) {
            this.show();
            this._updateButton();
            this._updateList();
            this._hideList()
        } else {
            this.hide()
        }
    },
    dispose: function() {
        this._unsubscribeEvents();
        this._group.linkRemove().linkOff();
        this._group.dispose();
        this._shadow.dispose()
    },
    layoutOptions: function() {
        return this._options.enabled && {
            horizontalAlignment: "right",
            verticalAlignment: "top",
            weak: true
        }
    },
    measure: function() {
        this._fillSpace();
        return [BUTTON_SIZE + SHADOW_OFFSET, BUTTON_SIZE]
    },
    move: function(rect) {
        this._group.attr({
            translateX: Math.round(rect[0]),
            translateY: Math.round(rect[1])
        })
    },
    _fillSpace: function() {
        this._hiddenDueToLayout = false;
        this.show()
    },
    freeSpace: function() {
        this._incidentOccurred("W2107");
        this._hiddenDueToLayout = true;
        this.hide()
    },
    _hideList: function() {
        this._listGroup.remove();
        this._listShown = false;
        this._setButtonState("default");
        this._menuItems.forEach(function(item) {
            return item.resetState()
        })
    },
    _showList: function() {
        this._listGroup.append(this._group);
        this._listShown = true;
        this._menuItems.forEach(function(item) {
            return item.fixPosition()
        })
    },
    _setButtonState: function(state) {
        var style = this._options.button[state];
        this._button.attr({
            stroke: style.borderColor,
            fill: style.backgroundColor
        });
        this._icon.attr({
            fill: style.color
        })
    },
    _subscribeEvents: function() {
        var _this3 = this;
        this._renderer.root.on(_pointer2.default.up + ".export", function(e) {
            var elementType = e.target[EXPORT_DATA_KEY];
            if (!elementType) {
                if (_this3._button) {
                    _this3._hideList()
                }
                return
            }
            if ("button" === elementType) {
                if (_this3._listShown) {
                    _this3._setButtonState("default");
                    _this3._hideList()
                } else {
                    _this3._setButtonState("focus");
                    _this3._showList()
                }
            } else {
                if ("printing" === elementType) {
                    _this3._print();
                    _this3._hideList()
                } else {
                    if ("exporting" === elementType) {
                        _this3._exportTo(e.target[FORMAT_DATA_KEY]);
                        _this3._hideList()
                    }
                }
            }
        });
        this._listGroup.on(pointerActions, function(e) {
            return e.stopPropagation()
        });
        this._buttonGroup.on(_pointer2.default.enter, function() {
            return _this3._setButtonState("hover")
        });
        this._buttonGroup.on(_pointer2.default.leave, function() {
            return _this3._setButtonState(_this3._listShown ? "focus" : "default")
        });
        this._buttonGroup.on(_pointer2.default.down + ".export", function() {
            return _this3._setButtonState("active")
        })
    },
    _unsubscribeEvents: function() {
        this._renderer.root.off(".export");
        this._listGroup.off();
        this._buttonGroup.off()
    },
    _updateButton: function() {
        var renderer = this._renderer;
        var options = this._options;
        var exportData = {
            "export-element-type": "button"
        };
        if (!this._button) {
            this._button = renderer.rect(0, 0, BUTTON_SIZE, BUTTON_SIZE).append(this._buttonGroup);
            this._button.attr({
                rx: 4,
                ry: 4,
                fill: options.button.default.backgroundColor,
                stroke: options.button.default.borderColor,
                "stroke-width": 1,
                cursor: "pointer"
            });
            this._button.data(exportData);
            this._icon = renderer.path(ICON_COORDS).append(this._buttonGroup);
            this._icon.attr({
                fill: options.button.default.color,
                cursor: "pointer"
            });
            this._icon.data(exportData);
            this._buttonGroup.setTitle(_message2.default.format("vizExport-titleMenuText"))
        }
    },
    _updateList: function() {
        var options = this._options;
        var buttonDefault = options.button.default;
        var listGroup = this._listGroup;
        var items = createMenuItems(this._renderer, options);
        this._shadow.attr({
            color: options.shadowColor
        });
        this._overlay.attr({
            height: items.length * MENU_ITEM_HEIGHT + 2 * LIST_STROKE_WIDTH,
            fill: buttonDefault.backgroundColor,
            stroke: buttonDefault.borderColor
        });
        listGroup.clear();
        this._overlay.append(listGroup);
        items.forEach(function(item) {
            return item.g.append(listGroup)
        });
        this._menuItems = items
    }
});

function getExportOptions(widget, exportOptions, fileName, format) {
    if (format || exportOptions.format) {
        format = validateFormat(format || exportOptions.format, widget._incidentOccurred)
    }
    return {
        format: format || DEFAULT_EXPORT_FORMAT,
        fileName: fileName || exportOptions.fileName || "file",
        proxyUrl: exportOptions.proxyUrl,
        backgroundColor: exportOptions.backgroundColor,
        width: widget._canvas.width,
        height: widget._canvas.height,
        margin: exportOptions.margin,
        forceProxy: exportOptions.forceProxy,
        exportingAction: widget._createActionByOption("onExporting"),
        exportedAction: widget._createActionByOption("onExported"),
        fileSavingAction: widget._createActionByOption("onFileSaving")
    }
}
var plugin = exports.plugin = {
    name: "export",
    init: function() {
        var _this4 = this;
        this._exportMenu = new exports.ExportMenu({
            renderer: this._renderer,
            incidentOccurred: this._incidentOccurred,
            print: function() {
                return _this4.print()
            },
            exportTo: function(format) {
                return _this4.exportTo(void 0, format)
            }
        });
        this._layout.add(this._exportMenu)
    },
    dispose: function() {
        this._exportMenu.dispose()
    },
    members: {
        _getExportMenuOptions: function() {
            return (0, _extend.extend)({}, this._getOption("export"), {
                rtl: this._getOption("rtlEnabled", true)
            })
        },
        _disablePointerEvents: function() {
            var pointerEventsValue = this._renderer.root.attr("pointer-events");
            this._renderer.root.attr({
                "pointer-events": "none"
            });
            return pointerEventsValue
        },
        exportTo: function(fileName, format) {
            var _this5 = this;
            var menu = this._exportMenu;
            var options = getExportOptions(this, this._getOption("export") || {}, fileName, format);
            menu && menu.hide();
            var pointerEventsValue = this._disablePointerEvents();
            _exporter2.default.export(this._renderer.root.element, options, getCreatorFunc(options.format)).done(function() {
                _this5._renderer.root.attr({
                    "pointer-events": pointerEventsValue
                })
            });
            menu && menu.show()
        },
        print: function() {
            var _this6 = this;
            var menu = this._exportMenu;
            var options = getExportOptions(this, this._getOption("export") || {});
            options.exportingAction = null;
            options.exportedAction = null;
            options.margin = 0;
            options.format = "PNG";
            options.forceProxy = true;
            options.fileSavingAction = function(eventArgs) {
                _print("data:image/png;base64," + eventArgs.data, {
                    __test: options.__test
                });
                eventArgs.cancel = true
            };
            var pointerEventsValue = this._disablePointerEvents();
            menu && menu.hide();
            _exporter2.default.export(this._renderer.root.element, options, getCreatorFunc(options.format)).done(function() {
                _this6._renderer.root.attr({
                    "pointer-events": pointerEventsValue
                })
            });
            menu && menu.show()
        }
    },
    customize: function(constructor) {
        var proto = constructor.prototype;
        constructor.addChange({
            code: "EXPORT",
            handler: function() {
                this._exportMenu.setOptions(this._getExportMenuOptions());
                this._change(["LAYOUT"])
            },
            isThemeDependent: true,
            isOptionChange: true,
            option: "export"
        });
        proto._optionChangesMap.onExporting = "EXPORT";
        proto._optionChangesMap.onExported = "EXPORT";
        proto._optionChangesMap.onFileSaving = "EXPORT"
    }
};
