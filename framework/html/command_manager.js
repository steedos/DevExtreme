/**
 * DevExtreme (framework/html/command_manager.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
require("../../integration/jquery");
var $ = require("jquery"),
    Class = require("../../core/class"),
    noop = require("../../core/utils/common").noop,
    iteratorUtils = require("../../core/utils/iterator"),
    errors = require("../errors"),
    CommandMapping = require("../command_mapping"),
    commandToDXWidgetAdapters = require("./widget_command_adapters"),
    when = require("../../core/utils/deferred").when;
require("../command");
require("./command_container");
var CommandManager = Class.inherit({
    ctor: function(options) {
        options = options || {};
        this.defaultWidgetAdapter = options.defaultWidgetAdapter || this._getDefaultWidgetAdapter();
        this.commandMapping = options.commandMapping || new CommandMapping
    },
    _getDefaultWidgetAdapter: function() {
        return {
            addCommand: noop,
            clearContainer: noop
        }
    },
    _getContainerAdapter: function($container) {
        var componentNames = $container.data("dxComponents"),
            adapters = commandToDXWidgetAdapters;
        if (componentNames) {
            for (var i = 0; i < componentNames.length; i++) {
                var widgetName = componentNames[i];
                if (widgetName in adapters) {
                    return adapters[widgetName]
                }
            }
        }
        return this.defaultWidgetAdapter
    },
    findCommands: function($items) {
        var items = $items.find(".dx-command").add($items.filter(".dx-command"));
        var result = [].slice.call(items).map(function(element) {
            return $(element).dxCommand("instance")
        });
        return result
    },
    findCommandContainers: function($markup) {
        var result = [].slice.call($markup.find(".dx-command-container")).map(function(element) {
            return $(element).dxCommandContainer("instance")
        });
        return result
    },
    _checkCommandId: function(id, command) {
        if (null === id) {
            throw errors.Error("E3010", command.$element().get(0).outerHTML)
        }
    },
    renderCommandsToContainers: function(commands, containers) {
        var that = this,
            commandHash = {},
            commandIds = [],
            deferreds = [];
        iteratorUtils.each(commands, function(i, command) {
            var id = command.option("id");
            that._checkCommandId(id, command);
            commandIds.push(id);
            commandHash[id] = command
        });
        that.commandMapping.checkCommandsExist(commandIds);
        iteratorUtils.each(containers, function(k, container) {
            var commandInfos = [];
            iteratorUtils.each(commandHash, function(id, command) {
                var commandId = id;
                var commandOptions = that.commandMapping.getCommandMappingForContainer(commandId, container.option("id"));
                if (commandOptions) {
                    commandInfos.push({
                        command: command,
                        options: commandOptions
                    })
                }
            });
            if (commandInfos.length) {
                var deferred = that._attachCommandsToContainer(container.element(), commandInfos);
                if (deferred) {
                    deferreds.push(deferred)
                }
            }
        });
        return when.apply($, deferreds)
    },
    clearContainer: function(container) {
        var $container = container.element(),
            adapter = this._getContainerAdapter($container);
        adapter.clearContainer($container)
    },
    _arrangeCommandsToContainers: function(commands, containers) {
        errors.log("W0002", "CommandManager", "_arrangeCommandsToContainers", "14.1", "Use the 'renderCommandsToContainers' method instead.");
        this.renderCommandsToContainers(commands, containers)
    },
    _attachCommandsToContainer: function($container, commandInfos) {
        var result, adapter = this._getContainerAdapter($container);
        if (adapter.beginUpdate) {
            adapter.beginUpdate($container)
        }
        iteratorUtils.each(commandInfos, function(index, commandInfo) {
            adapter.addCommand($container, commandInfo.command, commandInfo.options)
        });
        if (adapter.endUpdate) {
            result = adapter.endUpdate($container)
        }
        return result
    }
});
module.exports = CommandManager;
