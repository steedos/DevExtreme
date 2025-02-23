/**
 * DevExtreme (viz/axes/tick.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var isDefined = require("../../core/utils/type").isDefined,
    extend = require("../../core/utils/extend").extend;

function getPathStyle(options) {
    return {
        stroke: options.color,
        "stroke-width": options.width,
        "stroke-opacity": options.opacity,
        opacity: 1
    }
}

function createTick(axis, renderer, tickOptions, gridOptions, skippedCategory, skipLabels, offset) {
    var tickOffset = offset || axis._tickOffset,
        lineGroup = axis._axisLineGroup,
        elementsGroup = axis._axisElementsGroup,
        tickStyle = getPathStyle(tickOptions),
        gridStyle = getPathStyle(gridOptions),
        emptyStrRegExp = /^\s+$/,
        axisOptions = axis.getOptions(),
        labelOptions = axisOptions.label,
        labelStyle = axis._textOptions;

    function getLabelFontStyle(tick) {
        var fontStyle = axis._textFontStyles,
            customizeColor = labelOptions.customizeColor;
        if (customizeColor && customizeColor.call) {
            fontStyle = extend({}, axis._textFontStyles, {
                fill: customizeColor.call(tick, tick)
            })
        }
        return fontStyle
    }

    function createLabelHint(tick, range) {
        var labelHint = axis.formatHint(tick.value, labelOptions, range);
        if (isDefined(labelHint) && "" !== labelHint) {
            tick.label.setTitle(labelHint)
        }
    }
    return function(value) {
        var tick = {
            value: value,
            updateValue: function(newValue) {
                this.value = value = newValue
            },
            initCoords: function() {
                this.coords = axis._getTranslatedValue(value, tickOffset);
                this.labelCoords = axis._getTranslatedValue(value)
            },
            saveCoords: function() {
                this._storedCoords = this.coords;
                this._storedLabelsCoords = this.labelCoords
            },
            drawMark: function() {
                if (!tickOptions.visible || skippedCategory === value) {
                    return
                }
                if (axis.areCoordsOutsideAxis(this.coords)) {
                    return
                }
                if (this.mark) {
                    this.mark.append(lineGroup);
                    this.updateTickPosition()
                } else {
                    this.mark = axis._createPathElement([], tickStyle).append(lineGroup);
                    this.updateTickPosition()
                }
            },
            setSkippedCategory: function(category) {
                skippedCategory = category
            },
            _updateLine: function(lineElement, settings, storedSettings, animate, isGridLine) {
                if (!lineElement) {
                    return
                }
                if (null === settings.points) {
                    lineElement.remove();
                    return
                }
                if (animate && storedSettings && null !== storedSettings.points) {
                    settings.opacity = 1;
                    lineElement.attr(storedSettings);
                    lineElement.animate(settings)
                } else {
                    settings.opacity = animate ? 0 : 1;
                    lineElement.attr(settings);
                    animate && lineElement.animate({
                        opacity: 1
                    }, {
                        delay: .5,
                        partitionDuration: .5
                    })
                }
                this.coords.angle && axis._rotateTick(lineElement, this.coords, isGridLine)
            },
            updateTickPosition: function(animate) {
                this._updateLine(this.mark, {
                    points: axis._getTickMarkPoints(tick.coords, tickOptions.length)
                }, this._storedCoords && {
                    points: axis._getTickMarkPoints(tick._storedCoords, tickOptions.length)
                }, animate, false)
            },
            drawLabel: function(range) {
                var labelIsVisible = labelOptions.visible && !skipLabels && !axis.getTranslator().getBusinessRange().isEmpty() && !axis.areCoordsOutsideAxis(this.labelCoords);
                if (!labelIsVisible) {
                    if (this.label) {
                        this.label.remove()
                    }
                    return
                }
                var text = axis.formatLabel(value, labelOptions, range);
                if (this.label) {
                    this.label.attr({
                        text: text,
                        rotate: 0
                    }).append(elementsGroup);
                    createLabelHint(this, range);
                    this.updateLabelPosition();
                    return
                }
                if (isDefined(text) && "" !== text && !emptyStrRegExp.test(text)) {
                    this.label = renderer.text(text).css(getLabelFontStyle(this)).attr(labelStyle).data("chart-data-argument", this.value).append(elementsGroup);
                    this.updateLabelPosition();
                    createLabelHint(this, range)
                }
            },
            fadeOutElements: function() {
                var startSettings = {
                    opacity: 1
                };
                var endSettings = {
                    opacity: 0
                };
                var animationSettings = {
                    partitionDuration: .5
                };
                if (this.label) {
                    this._fadeOutLabel()
                }
                if (this.grid) {
                    this.grid.append(axis._axisGridGroup).attr(startSettings).animate(endSettings, animationSettings)
                }
                if (this.mark) {
                    this.mark.append(axis._axisLineGroup).attr(startSettings).animate(endSettings, animationSettings)
                }
            },
            _fadeInLabel: function() {
                var group = axis._renderer.g().attr({
                    opacity: 0
                }).append(axis._axisElementsGroup).animate({
                    opacity: 1
                }, {
                    delay: .5,
                    partitionDuration: .5
                });
                this.label.append(group)
            },
            _fadeOutLabel: function() {
                var group = axis._renderer.g().attr({
                    opacity: 1
                }).animate({
                    opacity: 0
                }, {
                    partitionDuration: .5
                }).append(axis._axisElementsGroup);
                this.label.append(group)
            },
            updateLabelPosition: function(animate) {
                if (!this.label) {
                    return
                }
                if (animate && this._storedLabelsCoords) {
                    this.label.attr({
                        x: this._storedLabelsCoords.x,
                        y: this._storedLabelsCoords.y
                    });
                    this.label.animate({
                        x: this.labelCoords.x,
                        y: this.labelCoords.y
                    })
                } else {
                    this.label.attr({
                        x: this.labelCoords.x,
                        y: this.labelCoords.y
                    });
                    if (animate) {
                        this._fadeInLabel()
                    }
                }
            },
            drawGrid: function(drawLine) {
                if (gridOptions.visible && skippedCategory !== this.value) {
                    if (this.grid) {
                        this.grid.append(axis._axisGridGroup);
                        this.updateGridPosition()
                    } else {
                        this.grid = drawLine(this, gridStyle);
                        this.grid && this.grid.append(axis._axisGridGroup)
                    }
                }
            },
            updateGridPosition: function(animate) {
                this._updateLine(this.grid, axis._getGridPoints(tick.coords), this._storedCoords && axis._getGridPoints(this._storedCoords), animate, true)
            },
            removeLabel: function() {
                this.label.remove();
                this.label = null
            }
        };
        return tick
    }
}
exports.tick = createTick;
