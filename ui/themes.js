/**
 * DevExtreme (ui/themes.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../core/renderer"),
    domAdapter = require("../core/dom_adapter"),
    windowUtils = require("../core/utils/window"),
    window = windowUtils.getWindow(),
    Deferred = require("../core/utils/deferred").Deferred,
    errors = require("./widget/ui.errors"),
    domUtils = require("../core/utils/dom"),
    readyCallbacks = require("../core/utils/ready_callbacks"),
    ready = readyCallbacks.add,
    each = require("../core/utils/iterator").each,
    devices = require("../core/devices"),
    viewPortUtils = require("../core/utils/view_port"),
    themeReadyCallback = require("./themes_callback"),
    viewPort = viewPortUtils.value,
    viewPortChanged = viewPortUtils.changeCallback;
var DX_LINK_SELECTOR = "link[rel=dx-theme]",
    THEME_ATTR = "data-theme",
    ACTIVE_ATTR = "data-active",
    DX_HAIRLINES_CLASS = "dx-hairlines";
var context, $activeThemeLink, knownThemes, currentThemeName, pendingThemeName;
var timerId;
var THEME_MARKER_PREFIX = "dx.";

function readThemeMarker() {
    if (!windowUtils.hasWindow()) {
        return null
    }
    var result, element = $("<div>", context).addClass("dx-theme-marker").appendTo(context.documentElement);
    try {
        result = element.css("fontFamily");
        if (!result) {
            return null
        }
        result = result.replace(/["']/g, "");
        if (result.substr(0, THEME_MARKER_PREFIX.length) !== THEME_MARKER_PREFIX) {
            return null
        }
        return result.substr(THEME_MARKER_PREFIX.length)
    } finally {
        element.remove()
    }
}

function waitForThemeLoad(themeName) {
    var waitStartTime;
    pendingThemeName = themeName;

    function handleLoaded() {
        pendingThemeName = null;
        themeReadyCallback.fire();
        themeReadyCallback.empty()
    }
    if (isPendingThemeLoaded()) {
        handleLoaded()
    } else {
        waitStartTime = Date.now();
        timerId = setInterval(function() {
            var isLoaded = isPendingThemeLoaded(),
                isTimeout = !isLoaded && Date.now() - waitStartTime > 15e3;
            if (isTimeout) {
                errors.log("W0004", pendingThemeName)
            }
            if (isLoaded || isTimeout) {
                clearInterval(timerId);
                timerId = void 0;
                handleLoaded()
            }
        }, 10)
    }
}

function isPendingThemeLoaded() {
    return !pendingThemeName || readThemeMarker() === pendingThemeName
}

function processMarkup() {
    var $allThemeLinks = $(DX_LINK_SELECTOR, context);
    if (!$allThemeLinks.length) {
        return
    }
    knownThemes = {};
    $activeThemeLink = $(domUtils.createMarkupFromString("<link rel=stylesheet>"), context);
    $allThemeLinks.each(function() {
        var link = $(this, context),
            fullThemeName = link.attr(THEME_ATTR),
            url = link.attr("href"),
            isActive = "true" === link.attr(ACTIVE_ATTR);
        knownThemes[fullThemeName] = {
            url: url,
            isActive: isActive
        }
    });
    $allThemeLinks.last().after($activeThemeLink);
    $allThemeLinks.remove()
}

function resolveFullThemeName(desiredThemeName) {
    var desiredThemeParts = desiredThemeName.split("."),
        result = null;
    if (knownThemes) {
        if (desiredThemeName in knownThemes) {
            return desiredThemeName
        }
        each(knownThemes, function(knownThemeName, themeData) {
            var knownThemeParts = knownThemeName.split(".");
            if (knownThemeParts[0] !== desiredThemeParts[0]) {
                return
            }
            if (desiredThemeParts[1] && desiredThemeParts[1] !== knownThemeParts[1]) {
                return
            }
            if (desiredThemeParts[2] && desiredThemeParts[2] !== knownThemeParts[2]) {
                return
            }
            if (!result || themeData.isActive) {
                result = knownThemeName
            }
            if (themeData.isActive) {
                return false
            }
        })
    }
    return result
}

function initContext(newContext) {
    try {
        if (newContext !== context) {
            knownThemes = null
        }
    } catch (x) {
        knownThemes = null
    }
    context = newContext
}

function init(options) {
    options = options || {};
    initContext(options.context || domAdapter.getDocument());
    if (!context) {
        return
    }
    processMarkup();
    currentThemeName = void 0;
    current(options)
}

function current(options) {
    if (!arguments.length) {
        currentThemeName = currentThemeName || readThemeMarker();
        return currentThemeName
    }
    detachCssClasses(viewPort());
    options = options || {};
    if ("string" === typeof options) {
        options = {
            theme: options
        }
    }
    var currentThemeData, isAutoInit = options._autoInit,
        loadCallback = options.loadCallback;
    currentThemeName = options.theme || currentThemeName;
    if (isAutoInit && !currentThemeName) {
        currentThemeName = themeNameFromDevice(devices.current())
    }
    currentThemeName = resolveFullThemeName(currentThemeName);
    if (currentThemeName) {
        currentThemeData = knownThemes[currentThemeName]
    }
    if (loadCallback) {
        themeReadyCallback.add(loadCallback)
    }
    if (currentThemeData) {
        $activeThemeLink.attr("href", knownThemes[currentThemeName].url);
        if ((themeReadyCallback.has() || options._forceTimeout) && !timerId) {
            waitForThemeLoad(currentThemeName)
        } else {
            if (pendingThemeName) {
                pendingThemeName = currentThemeName
            }
        }
    } else {
        if (isAutoInit) {
            themeReadyCallback.fire();
            themeReadyCallback.empty()
        } else {
            throw errors.Error("E0021", currentThemeName)
        }
    }
    checkThemeDeprecation();
    attachCssClasses(viewPortUtils.originalViewPort(), currentThemeName)
}

function themeNameFromDevice(device) {
    var themeName = device.platform;
    var majorVersion = device.version && device.version[0];
    switch (themeName) {
        case "ios":
            themeName += "7";
            break;
        case "android":
            themeName += "5";
            break;
        case "win":
            themeName += majorVersion && 8 === majorVersion ? "8" : "10"
    }
    return themeName
}

function getCssClasses(themeName) {
    themeName = themeName || current();
    var result = [],
        themeNameParts = themeName && themeName.split(".");
    if (themeNameParts) {
        result.push("dx-theme-" + themeNameParts[0], "dx-theme-" + themeNameParts[0] + "-typography");
        if (themeNameParts.length > 1) {
            result.push("dx-color-scheme-" + themeNameParts[1] + (isMaterial(themeName) ? "-" + themeNameParts[2] : ""))
        }
    }
    return result
}
var themeClasses;

function attachCssClasses(element, themeName) {
    themeClasses = getCssClasses(themeName).join(" ");
    $(element).addClass(themeClasses);
    var activateHairlines = function() {
        var pixelRatio = windowUtils.hasWindow() && window.devicePixelRatio;
        if (!pixelRatio || pixelRatio < 2) {
            return
        }
        var $tester = $("<div>");
        $tester.css("border", ".5px solid transparent");
        $("body").append($tester);
        if (1 === $tester.outerHeight()) {
            $(element).addClass(DX_HAIRLINES_CLASS);
            themeClasses += " " + DX_HAIRLINES_CLASS
        }
        $tester.remove()
    };
    activateHairlines()
}

function detachCssClasses(element) {
    $(element).removeClass(themeClasses)
}

function themeReady(callback) {
    themeReadyCallback.add(callback)
}

function isTheme(themeRegExp, themeName) {
    if (!themeName) {
        themeName = currentThemeName || readThemeMarker()
    }
    return new RegExp(themeRegExp).test(themeName)
}

function isMaterial(themeName) {
    return isTheme("material", themeName)
}

function isAndroid5(themeName) {
    return isTheme("android5", themeName)
}

function isIos7(themeName) {
    return isTheme("ios7", themeName)
}

function isGeneric(themeName) {
    return isTheme("generic", themeName)
}

function isWin8(themeName) {
    return isTheme("win8", themeName)
}

function isWin10(themeName) {
    return isTheme("win10", themeName)
}

function checkThemeDeprecation() {
    if (isWin8()) {
        errors.log("W0010", "The 'win8' theme", "16.1", "Use the 'generic' theme instead.")
    }
    if (isWin10()) {
        errors.log("W0010", "The 'win10' theme", "17.2", "Use the 'generic' theme instead.")
    }
    if (isAndroid5()) {
        errors.log("W0010", "The 'android5' theme", "18.1", "Use the 'material' theme instead.")
    }
}
var initDeferred = new Deferred;

function autoInit() {
    init({
        _autoInit: true,
        _forceTimeout: true
    });
    if ($(DX_LINK_SELECTOR, context).length) {
        throw errors.Error("E0022")
    }
    initDeferred.resolve()
}
if (windowUtils.hasWindow()) {
    autoInit()
} else {
    ready(autoInit)
}
viewPortChanged.add(function(viewPort, prevViewPort) {
    initDeferred.done(function() {
        detachCssClasses(prevViewPort);
        attachCssClasses(viewPort)
    })
});
devices.changed.add(function() {
    init({
        _autoInit: true
    })
});
exports.current = current;
exports.ready = themeReady;
exports.init = init;
exports.attachCssClasses = attachCssClasses;
exports.detachCssClasses = detachCssClasses;
exports.themeNameFromDevice = themeNameFromDevice;
exports.waitForThemeLoad = waitForThemeLoad;
exports.isMaterial = isMaterial;
exports.isAndroid5 = isAndroid5;
exports.isIos7 = isIos7;
exports.isGeneric = isGeneric;
exports.isWin8 = isWin8;
exports.isWin10 = isWin10;
exports.resetTheme = function() {
    $activeThemeLink && $activeThemeLink.attr("href", "about:blank");
    currentThemeName = null;
    pendingThemeName = null
};
module.exports.default = module.exports;
