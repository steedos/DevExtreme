/**
 * DevExtreme (framework/errors.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var errorUtils = require("../core/utils/error"),
    errors = require("../core/errors");
module.exports = errorUtils(errors.ERROR_MESSAGES, {
    E3001: "Routing rule is not found for the '{0}' URI.",
    E3002: "The passed object cannot be formatted into a URI string by the application's router. An appropriate route should be registered.",
    E3003: "Unable to navigate. Application is being initialized.",
    E3004: "Cannot execute the command: {0}.",
    E3005: "The '{0}' command {1} is not registered in the application's command mapping. Go to http://dxpr.es/1bTjfj1 for more details.",
    E3006: "Unknown navigation target: '{0}'. Use the 'current', 'back' or 'blank' values.",
    E3007: "Error while restoring the application state. The state has been cleared. Refresh the page.",
    E3008: "Unable to go back.",
    E3009: "Unable to go forward.",
    E3010: "The command's 'id' option should be specified.\r\nProcessed markup: {0}\n",
    E3011: "Layout controller cannot be resolved. There are no appropriate layout controllers for the current context. Check browser console for details.",
    E3012: "Layout controller cannot be resolved. Two or more layout controllers suit the current context. Check browser console for details.",
    E3013: "The '{0}' template with the '{1}' name is not found. Make sure the case is correct in the specified view name and the template fits the current context.",
    E3014: "All the children of the dxView element should be either of the dxCommand or dxContent type.\r\nProcessed markup: {0}",
    E3015: "The 'exec' method should be called before the 'finalize' method.",
    E3016: "Unknown transition type '{0}'.",
    E3018: "Unable to parse options.\nMessage: {0};\nOptions value: {1}.",
    E3019: "View templates should be updated according to the 13.1 changes. Go to http://dxpr.es/15ikrJA for more details.",
    E3020: "Concurrent templates are found:\r\n{0}Target device:\r\n{1}.",
    E3021: "Remote template cannot be loaded.\r\nUrl:{0}\r\nError:{1}.",
    E3022: "Cannot initialize the HtmlApplication component.",
    E3023: "Navigation item is not found",
    E3024: "Layout controller is not initialized",
    W3001: "A view with the '{0}' key doesn't exist.",
    W3002: "A view with the '{0}' key has already been released.",
    W3003: "Layout resolving context:\n{0}\nAvailable layout controller registrations:\n{1}\n",
    W3004: "Layout resolving context:\n{0}\nConcurent layout controller registrations for the context:\n{1}\n",
    W3005: 'Direct hash-based navigation is detected in a mobile application. Use data-bind="dxAction: url" instead of href="#url" to avoid navigation issues.\nFound markup:\n{0}\n'
});
