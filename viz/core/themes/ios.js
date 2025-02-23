/**
 * DevExtreme (viz/core/themes/ios.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var themeModule = require("../../themes"),
    IOS7_DEFAULT = "ios7.default",
    SECONDARY_TEXT_COLOR = "#767676",
    BORDER_COLOR = "#d3d3d3",
    BLACK = "#000000";
themeModule.registerTheme({
    name: IOS7_DEFAULT,
    backgroundColor: "#ffffff",
    primaryTitleColor: BLACK,
    secondaryTitleColor: SECONDARY_TEXT_COLOR,
    axisColor: "#ececec",
    axisLabelColor: SECONDARY_TEXT_COLOR,
    legend: {
        font: {
            color: BLACK
        }
    },
    tooltip: {
        font: {
            color: SECONDARY_TEXT_COLOR
        }
    },
    "chart:common": {
        commonSeriesSettings: {
            label: {
                border: {
                    color: BORDER_COLOR
                }
            }
        }
    },
    chart: {
        commonPaneSettings: {
            border: {
                color: BORDER_COLOR
            }
        }
    },
    rangeSelector: {
        scale: {
            tick: {
                color: BLACK,
                opacity: .1
            },
            minorTick: {
                color: BLACK,
                opacity: .03
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
