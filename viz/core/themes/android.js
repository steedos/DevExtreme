/**
 * DevExtreme (viz/core/themes/android.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var ANDROID5_LIGHT = "android5.light",
    themeModule = require("../../themes"),
    SECONDARY_TEXT_COLOR = "#767676",
    BORDER_COLOR = "#e8e8e8",
    BLACK = "#000000";
themeModule.registerTheme({
    name: ANDROID5_LIGHT,
    backgroundColor: "#ffffff",
    primaryTitleColor: "#232323",
    secondaryTitleColor: SECONDARY_TEXT_COLOR,
    axisColor: "#d3d3d3",
    axisLabelColor: SECONDARY_TEXT_COLOR,
    tooltip: {
        color: BORDER_COLOR,
        font: {
            color: SECONDARY_TEXT_COLOR
        }
    },
    legend: {
        font: {
            color: BLACK
        }
    },
    rangeSelector: {
        scale: {
            tick: {
                color: BLACK,
                opacity: .17
            },
            minorTick: {
                color: BLACK,
                opacity: .05
            }
        }
    },
    treeMap: {
        group: {
            label: {
                font: {
                    color: SECONDARY_TEXT_COLOR
                }
            }
        }
    }
}, "generic.light");
