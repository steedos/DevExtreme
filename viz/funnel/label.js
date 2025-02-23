/**
 * DevExtreme (viz/funnel/label.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var labelModule = require("../series/points/label"),
    _normalizeEnum = require("../core/utils").normalizeEnum,
    extend = require("../../core/utils/extend").extend,
    noop = require("../../core/utils/common").noop,
    OUTSIDE_POSITION = "outside",
    INSIDE_POSITION = "inside",
    OUTSIDE_LABEL_INDENT = 5,
    COLUMNS_LABEL_INDENT = 20,
    CONNECTOR_INDENT = 4,
    PREVENT_EMPTY_PIXEL_OFFSET = 1;

function getLabelIndent(pos) {
    pos = _normalizeEnum(pos);
    if (pos === OUTSIDE_POSITION) {
        return OUTSIDE_LABEL_INDENT
    } else {
        if (pos === INSIDE_POSITION) {
            return 0
        }
    }
    return COLUMNS_LABEL_INDENT
}

function isOutsidePosition(pos) {
    pos = _normalizeEnum(pos);
    return pos === OUTSIDE_POSITION || pos !== INSIDE_POSITION
}

function correctYForInverted(y, bBox, inverted) {
    return inverted ? y - bBox.height : y
}

function getOutsideRightLabelPosition(coords, bBox, options, inverted) {
    return {
        x: coords[2] + options.horizontalOffset + OUTSIDE_LABEL_INDENT,
        y: correctYForInverted(coords[3] + options.verticalOffset, bBox, inverted)
    }
}

function getOutsideLeftLabelPosition(coords, bBox, options, inverted) {
    return {
        x: coords[0] - bBox.width - options.horizontalOffset - OUTSIDE_LABEL_INDENT,
        y: correctYForInverted(coords[1] + options.verticalOffset, bBox, inverted)
    }
}

function getInsideLabelPosition(coords, bBox, options) {
    var width = coords[2] - coords[0],
        height = coords[7] - coords[1];
    return {
        x: coords[0] + width / 2 + options.horizontalOffset - bBox.width / 2,
        y: coords[1] + options.verticalOffset + height / 2 - bBox.height / 2
    }
}

function getColumnLabelRightPosition(labelRect, rect, textAlignment) {
    return function(coords, bBox, options, inverted) {
        return {
            x: "left" === textAlignment ? rect[2] + options.horizontalOffset + COLUMNS_LABEL_INDENT : labelRect[2] - bBox.width,
            y: correctYForInverted(coords[3] + options.verticalOffset, bBox, inverted)
        }
    }
}

function getColumnLabelLeftPosition(labelRect, rect, textAlignment) {
    return function(coords, bBox, options, inverted) {
        return {
            x: "left" === textAlignment ? labelRect[0] : rect[0] - bBox.width - options.horizontalOffset - COLUMNS_LABEL_INDENT,
            y: correctYForInverted(coords[3] + options.verticalOffset, bBox, inverted)
        }
    }
}

function getConnectorStrategy(options, inverted) {
    var isLeftPos = "left" === options.horizontalAlignment,
        connectorIndent = isLeftPos ? CONNECTOR_INDENT : -CONNECTOR_INDENT,
        verticalCorrection = inverted ? -PREVENT_EMPTY_PIXEL_OFFSET : 0;

    function getFigureCenter(figure) {
        return isLeftPos ? [figure[0] + PREVENT_EMPTY_PIXEL_OFFSET, figure[1] + verticalCorrection] : [figure[2] - PREVENT_EMPTY_PIXEL_OFFSET, figure[3] + verticalCorrection]
    }
    return {
        isLabelInside: function() {
            return !isOutsidePosition(options.position)
        },
        getFigureCenter: getFigureCenter,
        prepareLabelPoints: function(bBox) {
            var x = bBox.x + connectorIndent,
                y = bBox.y + verticalCorrection,
                x1 = x + bBox.width,
                y1 = y + bBox.height;
            return [
                [x, y],
                [x1, y],
                [x1, y1],
                [x, y1]
            ]
        },
        isHorizontal: function() {
            return true
        },
        findFigurePoint: function(figure) {
            return getFigureCenter(figure)
        },
        adjustPoints: function(points) {
            return points
        }
    }
}

function getLabelOptions(labelOptions, defaultColor, defaultTextAlignment) {
    var opt = labelOptions || {},
        labelFont = extend({}, opt.font) || {},
        labelBorder = opt.border || {},
        labelConnector = opt.connector || {},
        backgroundAttr = {
            fill: opt.backgroundColor || defaultColor,
            "stroke-width": labelBorder.visible ? labelBorder.width || 0 : 0,
            stroke: labelBorder.visible && labelBorder.width ? labelBorder.color : "none",
            dashStyle: labelBorder.dashStyle
        },
        connectorAttr = {
            stroke: labelConnector.visible && labelConnector.width ? labelConnector.color || defaultColor : "none",
            "stroke-width": labelConnector.visible ? labelConnector.width || 0 : 0,
            opacity: labelConnector.opacity
        };
    labelFont.color = "none" === opt.backgroundColor && "#ffffff" === _normalizeEnum(labelFont.color) && "inside" !== opt.position ? defaultColor : labelFont.color;
    return {
        format: opt.format,
        textAlignment: opt.textAlignment || (isOutsidePosition(opt.position) ? defaultTextAlignment : "center"),
        customizeText: opt.customizeText,
        attributes: {
            font: labelFont
        },
        visible: 0 !== labelFont.size ? opt.visible : false,
        showForZeroValues: opt.showForZeroValues,
        horizontalOffset: opt.horizontalOffset,
        verticalOffset: opt.verticalOffset,
        background: backgroundAttr,
        connector: connectorAttr
    }
}

function correctLabelPosition(pos, bBox, rect) {
    if (pos.x < rect[0]) {
        pos.x = rect[0]
    }
    if (pos.x + bBox.width > rect[2]) {
        pos.x = rect[2] - bBox.width
    }
    if (pos.y < rect[1]) {
        pos.y = rect[1]
    }
    if (pos.y + bBox.height > rect[3]) {
        pos.y = rect[3] - bBox.height
    }
    return pos
}
exports.plugin = {
    name: "lables",
    init: noop,
    dispose: noop,
    extenders: {
        _initCore: function() {
            this._labelsGroup = this._renderer.g().attr({
                "class": this._rootClassPrefix + "-labels"
            }).append(this._renderer.root);
            this._labels = []
        },
        _applySize: function() {
            var groupWidth, options = this._getOption("label"),
                adaptiveLayout = this._getOption("adaptiveLayout"),
                rect = this._rect,
                labelWidth = 0,
                width = rect[2] - rect[0];
            this._labelRect = rect.slice();
            if (!this._labels.length || !isOutsidePosition(options.position)) {
                return
            }
            groupWidth = this._labels.map(function(label) {
                label.resetEllipsis();
                return label.getBoundingRect().width
            }).reduce(function(max, width) {
                return Math.max(max, width)
            }, 0);
            labelWidth = groupWidth + options.horizontalOffset + getLabelIndent(options.position);
            if (!adaptiveLayout.keepLabels && width - labelWidth < adaptiveLayout.width) {
                this._labels.forEach(function(label) {
                    label.draw(false)
                });
                return
            } else {
                if (width - labelWidth < adaptiveLayout.width) {
                    labelWidth = width - adaptiveLayout.width;
                    labelWidth = labelWidth > 0 ? labelWidth : 0
                }
                this._labels.forEach(function(label) {
                    label.draw(true)
                })
            }
            if ("left" === options.horizontalAlignment) {
                rect[0] += labelWidth
            } else {
                rect[2] -= labelWidth
            }
        },
        _buildNodes: function() {
            this._createLabels()
        },
        _change_TILING: function() {
            var textAlignment, that = this,
                options = that._getOption("label"),
                getCoords = getInsideLabelPosition,
                inverted = that._getOption("inverted", true);
            if (isOutsidePosition(options.position)) {
                if (_normalizeEnum(options.position) === OUTSIDE_POSITION) {
                    getCoords = "left" === options.horizontalAlignment ? getOutsideLeftLabelPosition : getOutsideRightLabelPosition
                } else {
                    textAlignment = this._defaultLabelTextAlignment();
                    getCoords = "left" === options.horizontalAlignment ? getColumnLabelLeftPosition(this._labelRect, this._rect, textAlignment) : getColumnLabelRightPosition(this._labelRect, this._rect, textAlignment)
                }
            }
            that._labels.forEach(function(label, index) {
                var bBox, pos, item = that._items[index],
                    borderWidth = item.getNormalStyle()["stroke-width"],
                    halfBorderWidth = inverted ? borderWidth / 2 : -borderWidth / 2,
                    coords = halfBorderWidth ? item.coords.map(function(coord, index) {
                        if (1 === index || 3 === index) {
                            return coord - halfBorderWidth
                        } else {
                            if (2 === index) {
                                return coord - borderWidth
                            } else {
                                if (0 === index) {
                                    return coord + borderWidth
                                }
                            }
                        }
                        return coord
                    }) : item.coords;
                if (!options.showForZeroValues && 0 === item.value) {
                    label.draw(false);
                    return
                }
                if (isOutsidePosition(options.position)) {
                    that._correctLabelWidth(label, item.coords, options)
                }
                bBox = label.getBoundingRect();
                pos = correctLabelPosition(getCoords(coords, bBox, options, inverted), bBox, that._labelRect);
                label.setFigureToDrawConnector(coords);
                label.shift(pos.x, pos.y)
            })
        }
    },
    members: {
        _defaultLabelTextAlignment: function() {
            return this._getOption("rtlEnabled", true) ? "right" : "left"
        },
        _correctLabelWidth: function(label, item, options) {
            var isLeftPos = "left" === options.horizontalAlignment,
                minX = isLeftPos ? this._labelRect[0] : item[2],
                maxX = isLeftPos ? item[0] : this._labelRect[2],
                maxWidth = maxX - minX;
            if (label.getBoundingRect().width > maxWidth) {
                label.fit(maxWidth)
            }
        },
        _createLabels: function() {
            var that = this,
                labelOptions = that._getOption("label"),
                connectorStrategy = getConnectorStrategy(labelOptions, that._getOption("inverted", true));
            this._labelsGroup.clear();
            if (!labelOptions.visible) {
                return
            }
            this._labels = that._items.map(function(item) {
                var label = new labelModule.Label({
                    renderer: that._renderer,
                    labelsGroup: that._labelsGroup,
                    strategy: connectorStrategy
                });
                label.setOptions(getLabelOptions(labelOptions, item.color, that._defaultLabelTextAlignment()));
                label.setData({
                    item: item,
                    value: item.value,
                    percent: item.percent
                });
                label.draw(true);
                return label
            });
            if (this._labels.length && isOutsidePosition(labelOptions.position)) {
                this._requestChange(["LAYOUT"])
            }
        }
    },
    customize: function(constructor) {
        constructor.prototype._proxyData.push(function(x, y) {
            var data, that = this;
            that._labels.forEach(function(label, index) {
                var rect = label.getBoundingRect();
                if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
                    var pos = isOutsidePosition(that._getOption("label").position) ? "outside" : "inside";
                    data = {
                        id: index,
                        type: pos + "-label"
                    };
                    return true
                }
            });
            return data
        });
        constructor.addChange({
            code: "LABEL",
            handler: function() {
                this._createLabels();
                this._requestChange(["LAYOUT"])
            },
            isThemeDependent: true,
            isOptionChange: true,
            option: "label"
        })
    }
};
