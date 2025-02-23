/**
 * DevExtreme (viz/core/themes/generic.darkviolet.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var themeModule = require("../../themes"),
    registerTheme = themeModule.registerTheme,
    ACCENT_COLOR = "#9c63ff",
    BACKGROUND_COLOR = "#17171f",
    TITLE_COLOR = "#f5f6f7",
    SUBTITLE_COLOR = "#fff",
    TEXT_COLOR = "#b2b2b6",
    BORDER_COLOR = "#343840";
registerTheme({
    name: "generic.darkviolet",
    defaultPalette: "Dark Violet",
    backgroundColor: BACKGROUND_COLOR,
    primaryTitleColor: TITLE_COLOR,
    secondaryTitleColor: SUBTITLE_COLOR,
    axisColor: BORDER_COLOR,
    axisLabelColor: TEXT_COLOR,
    "export": {
        backgroundColor: BACKGROUND_COLOR,
        font: {
            color: TITLE_COLOR
        },
        button: {
            "default": {
                color: TITLE_COLOR,
                borderColor: "#414152",
                backgroundColor: BACKGROUND_COLOR
            },
            hover: {
                color: TITLE_COLOR,
                borderColor: "#5c5c74",
                backgroundColor: "#2d2d3c"
            },
            focus: {
                color: TITLE_COLOR,
                borderColor: "#7c7c97",
                backgroundColor: "#2d2d3c"
            },
            active: {
                color: TITLE_COLOR,
                borderColor: "#7c7c97",
                backgroundColor: "#3c3c51"
            }
        }
    },
    legend: {
        font: {
            color: TEXT_COLOR
        }
    },
    tooltip: {
        color: BACKGROUND_COLOR,
        border: {
            color: "#414152"
        },
        font: {
            color: TITLE_COLOR
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
        },
        commonAxisSettings: {
            breakStyle: {
                color: "#575e6b"
            }
        }
    },
    funnel: {
        item: {
            border: {
                color: BACKGROUND_COLOR
            }
        }
    },
    sparkline: {
        pointColor: BACKGROUND_COLOR,
        minColor: "#f0ad4e",
        maxColor: "#d9534f"
    },
    treeMap: {
        group: {
            color: BORDER_COLOR,
            label: {
                font: {
                    color: SUBTITLE_COLOR
                }
            }
        }
    },
    rangeSelector: {
        shutter: {
            color: BACKGROUND_COLOR
        },
        scale: {
            breakStyle: {
                color: "#575e6b"
            },
            tick: {
                opacity: .2
            }
        },
        selectedRangeColor: ACCENT_COLOR,
        sliderMarker: {
            color: ACCENT_COLOR,
            font: {
                color: "#fff"
            }
        },
        sliderHandle: {
            color: ACCENT_COLOR,
            opacity: .5
        }
    },
    bullet: {
        color: ACCENT_COLOR
    },
    gauge: {
        valueIndicators: {
            rangebar: {
                color: ACCENT_COLOR
            },
            textcloud: {
                color: ACCENT_COLOR
            }
        }
    },
    sankey: {
        link: {
            border: {
                color: BACKGROUND_COLOR
            }
        },
        node: {
            border: {
                color: BACKGROUND_COLOR
            }
        }
    }
}, "generic.dark");
