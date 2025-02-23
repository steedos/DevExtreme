/**
 * DevExtreme (ui/pivot_grid/ui.pivot_grid.field_chooser.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    iconUtils = require("../../core/utils/icon"),
    hasWindow = require("../../core/utils/window").hasWindow(),
    isDefined = require("../../core/utils/type").isDefined,
    extend = require("../../core/utils/extend").extend,
    inArray = require("../../core/utils/array").inArray,
    iteratorUtils = require("../../core/utils/iterator"),
    messageLocalization = require("../../localization/message"),
    registerComponent = require("../../core/component_registrator"),
    pivotGridUtils = require("./ui.pivot_grid.utils"),
    TreeView = require("../tree_view"),
    ContextMenu = require("../context_menu"),
    BaseFieldChooser = require("./ui.pivot_grid.field_chooser_base"),
    each = iteratorUtils.each,
    DIV = "<div>";
require("./data_source");
var FIELDCHOOSER_CLASS = "dx-pivotgridfieldchooser",
    FIELDCHOOSER_CONTAINER_CLASS = "dx-pivotgridfieldchooser-container",
    FIELDS_CONTAINER_CLASS = "dx-pivotgrid-fields-container",
    AREA_DRAG_CLASS = "dx-pivotgrid-drag-action";

function getDimensionFields(item, fields) {
    var result = [];
    if (item.items) {
        for (var i = 0; i < item.items.length; i++) {
            result.push.apply(result, getDimensionFields(item.items[i], fields))
        }
    } else {
        if (isDefined(item.index)) {
            result.push(fields[item.index])
        }
    }
    return result
}

function getFirstItem(item, condition) {
    if (item.items) {
        for (var i = 0; i < item.items.length; i++) {
            var childrenItem = getFirstItem(item.items[i], condition);
            if (childrenItem) {
                return childrenItem
            }
        }
    }
    if (condition(item)) {
        return item
    }
}
var compareOrder = [function(a, b) {
    var aValue = -!!a.isMeasure,
        bValue = +!!b.isMeasure;
    return aValue + bValue
}, function(a, b) {
    var aValue = -!!(a.items && a.items.length),
        bValue = +!!(b.items && b.items.length);
    return aValue + bValue
}, function(a, b) {
    var aValue = +!!(false === a.isMeasure && a.field && a.field.levels && a.field.levels.length),
        bValue = -!!(false === b.isMeasure && b.field && b.field.levels && b.field.levels.length);
    return aValue + bValue
}, pivotGridUtils.getCompareFunction(function(item) {
    return item.text
})];

function compareItems(a, b) {
    var result = 0,
        i = 0;
    while (!result && compareOrder[i]) {
        result = compareOrder[i++](a, b)
    }
    return result
}

function getScrollable(container) {
    return container.find(".dx-scrollable").dxScrollable("instance")
}
var FieldChooser = BaseFieldChooser.inherit({
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            height: 400,
            layout: 0,
            dataSource: null,
            onContextMenuPreparing: null,
            allowSearch: false,
            searchTimeout: 500,
            texts: {
                columnFields: messageLocalization.format("dxPivotGrid-columnFields"),
                rowFields: messageLocalization.format("dxPivotGrid-rowFields"),
                dataFields: messageLocalization.format("dxPivotGrid-dataFields"),
                filterFields: messageLocalization.format("dxPivotGrid-filterFields"),
                allFields: messageLocalization.format("dxPivotGrid-allFields")
            }
        })
    },
    _refreshDataSource: function() {
        var that = this;
        that._expandedPaths = [];
        that._changedHandler = that._changedHandler || function() {
            each(that._dataChangedHandlers, function(_, func) {
                func()
            });
            that._fireContentReadyAction();
            that._skipStateChange = true;
            that.option("state", that._dataSource.state());
            that._skipStateChange = false
        };
        if (that._dataSource) {
            that._dataSource.off("changed", that._changedHandler);
            that._dataSource = void 0
        }
        that.callBase();
        that._dataSource && that._dataSource.on("changed", that._changedHandler)
    },
    _init: function() {
        this.callBase();
        this._refreshDataSource();
        this._dataChangedHandlers = [];
        this._initActions()
    },
    _initActions: function() {
        this._actions = {
            onContextMenuPreparing: this._createActionByOption("onContextMenuPreparing")
        }
    },
    _trigger: function(eventName, eventArg) {
        this._actions[eventName](eventArg)
    },
    _setOptionsByReference: function() {
        this.callBase();
        extend(this._optionsByReference, {
            dataSource: true
        })
    },
    _optionChanged: function(args) {
        var that = this;
        switch (args.name) {
            case "dataSource":
                that._refreshDataSource();
                that._invalidate();
                break;
            case "layout":
            case "texts":
            case "allowSearch":
            case "searchTimeout":
                that._invalidate();
                break;
            case "onContextMenuPreparing":
                that._actions[args.name] = that._createActionByOption(args.name);
                break;
            default:
                that.callBase(args)
        }
    },
    _clean: function(skipStateSetting) {
        !skipStateSetting && this._dataSource && this.option("state", this._dataSource.state());
        this.$element().children("." + FIELDCHOOSER_CONTAINER_CLASS).remove()
    },
    _renderLayout0: function($container) {
        var $col1, $col2, $col3, $col4, $row1, $row2, that = this;
        $container.addClass("dx-layout-0");
        $row1 = $(DIV).addClass("dx-row").appendTo($container);
        $row2 = $(DIV).addClass("dx-row").appendTo($container);
        $col1 = $(DIV).addClass("dx-col").appendTo($row1);
        $col2 = $(DIV).addClass("dx-col").appendTo($row1);
        $col3 = $(DIV).addClass("dx-col").appendTo($row2);
        $col4 = $(DIV).addClass("dx-col").appendTo($row2);
        that._renderArea($col1, "all");
        that._renderArea($col2, "row");
        that._renderArea($col2, "column");
        that._renderArea($col3, "filter");
        that._renderArea($col4, "data")
    },
    _renderLayout1: function($container) {
        var $col1, $col2, that = this;
        $col1 = $(DIV).addClass("dx-col").appendTo($container);
        $col2 = $(DIV).addClass("dx-col").appendTo($container);
        that._renderArea($col1, "all");
        that._renderArea($col2, "filter");
        that._renderArea($col2, "row");
        that._renderArea($col2, "column");
        that._renderArea($col2, "data")
    },
    _renderLayout2: function($container) {
        var $col1, $col2, $row1, $row2, that = this;
        $container.addClass("dx-layout-2");
        $row1 = $(DIV).addClass("dx-row").appendTo($container);
        that._renderArea($row1, "all");
        $row2 = $(DIV).addClass("dx-row").appendTo($container);
        $col1 = $(DIV).addClass("dx-col").appendTo($row2);
        $col2 = $(DIV).addClass("dx-col").appendTo($row2);
        that._renderArea($col1, "filter");
        that._renderArea($col1, "row");
        that._renderArea($col2, "column");
        that._renderArea($col2, "data")
    },
    _initMarkup: function() {
        var that = this,
            $element = this.$element(),
            $container = $(DIV).addClass(FIELDCHOOSER_CONTAINER_CLASS).appendTo($element),
            layout = that.option("layout");
        that.callBase();
        $element.addClass(FIELDCHOOSER_CLASS).addClass(FIELDS_CONTAINER_CLASS);
        that._dataChangedHandlers = [];
        var dataSource = this._dataSource;
        var currentState = "instantly" !== that.option("applyChangesMode") && dataSource && dataSource.state();
        currentState && that.option("state") && dataSource.state(that.option("state"), true);
        if (0 === layout) {
            that._renderLayout0($container)
        } else {
            if (1 === layout) {
                that._renderLayout1($container)
            } else {
                that._renderLayout2($container)
            }
        }
        currentState && dataSource.state(currentState, true)
    },
    _renderContentImpl: function() {
        this.callBase();
        this.renderSortable();
        this._renderContextMenu();
        this.updateDimensions()
    },
    _fireContentReadyAction: function() {
        if (!this._dataSource || !this._dataSource.isLoading()) {
            this.callBase()
        }
    },
    _getContextMenuArgs: function(dxEvent) {
        var field, area, targetFieldElement = $(dxEvent.target).closest(".dx-area-field"),
            targetGroupElement = $(dxEvent.target).closest(".dx-area-fields");
        if (targetFieldElement.length) {
            field = targetFieldElement.data("field")
        }
        if (targetGroupElement.length) {
            area = targetGroupElement.attr("group")
        }
        return {
            event: dxEvent,
            field: field,
            area: area,
            items: []
        }
    },
    _renderContextMenu: function() {
        var that = this,
            $container = that.$element();
        if (that._contextMenu) {
            that._contextMenu.$element().remove()
        }
        that._contextMenu = that._createComponent($(DIV).appendTo($container), ContextMenu, {
            onPositioning: function(actionArgs) {
                var args, event = actionArgs.event;
                if (!event) {
                    return
                }
                args = that._getContextMenuArgs(event);
                that._trigger("onContextMenuPreparing", args);
                if (args.items && args.items.length) {
                    actionArgs.component.option("items", args.items)
                } else {
                    actionArgs.cancel = true
                }
            },
            target: $container,
            onItemClick: function(params) {
                params.itemData.onItemClick && params.itemData.onItemClick(params)
            },
            cssClass: "dx-pivotgridfieldchooser-context-menu"
        })
    },
    _createTreeItems: function(fields, groupFieldNames, path) {
        var isMeasure, that = this,
            resultItems = [],
            groupedItems = [],
            groupFieldName = groupFieldNames[0],
            fieldsByGroup = {};
        if (!groupFieldName) {
            each(fields, function(index, field) {
                var icon;
                if (true === field.isMeasure) {
                    icon = "measure"
                }
                if (false === field.isMeasure) {
                    icon = field.groupName ? "hierarchy" : "dimension"
                }
                resultItems.push({
                    index: field.index,
                    field: field,
                    key: field.dataField,
                    selected: isDefined(field.area),
                    text: field.caption || field.dataField,
                    icon: icon,
                    isMeasure: field.isMeasure,
                    isDefault: field.isDefault
                })
            })
        } else {
            each(fields, function(index, field) {
                var groupName = field[groupFieldName] || "";
                fieldsByGroup[groupName] = fieldsByGroup[groupName] || [];
                fieldsByGroup[groupName].push(field);
                if (void 0 === isMeasure) {
                    isMeasure = true
                }
                isMeasure = isMeasure && true === field.isMeasure
            });
            each(fieldsByGroup, function(groupName, fields) {
                var currentPath = path ? path + "." + groupName : groupName;
                var items = that._createTreeItems(fields, groupFieldNames.slice(1), currentPath);
                if (groupName) {
                    groupedItems.push({
                        key: groupName,
                        text: groupName,
                        path: currentPath,
                        isMeasure: items.isMeasure,
                        expanded: inArray(currentPath, that._expandedPaths) >= 0,
                        items: items
                    })
                } else {
                    resultItems = items
                }
            });
            resultItems = groupedItems.concat(resultItems);
            resultItems.isMeasure = isMeasure
        }
        return resultItems
    },
    _createFieldsDataSource: function(dataSource) {
        var treeItems, fields = dataSource && dataSource.fields() || [];
        fields = fields.filter(function(field) {
            return false !== field.visible && !isDefined(field.groupIndex)
        });
        treeItems = this._createTreeItems(fields, ["dimension", "displayFolder"]);
        pivotGridUtils.foreachDataLevel(treeItems, function(items) {
            items.sort(compareItems)
        }, 0, "items");
        return treeItems
    },
    _renderFieldsTreeView: function(container) {
        var that = this,
            dataSource = that._dataSource,
            treeView = that._createComponent(container, TreeView, {
                dataSource: that._createFieldsDataSource(dataSource),
                showCheckBoxesMode: "normal",
                searchEnabled: that.option("allowSearch"),
                searchTimeout: that.option("searchTimeout"),
                itemTemplate: function(itemData, itemIndex, itemElement) {
                    if (itemData.icon) {
                        iconUtils.getImageContainer(itemData.icon).appendTo(itemElement)
                    }
                    $("<span>").toggleClass("dx-area-field", !itemData.items).data("field", itemData.field).text(itemData.text).appendTo(itemElement)
                },
                onItemCollapsed: function(e) {
                    var index = inArray(e.itemData.path, that._expandedPaths);
                    if (index >= 0) {
                        that._expandedPaths.splice(index, 1)
                    }
                },
                onItemExpanded: function(e) {
                    var index = inArray(e.itemData.path, that._expandedPaths);
                    if (index < 0) {
                        that._expandedPaths.push(e.itemData.path)
                    }
                },
                onItemSelectionChanged: function(e) {
                    var field, fields, area, data = e.itemData,
                        needSelectDefaultItem = true;
                    if (data.items) {
                        if (data.selected) {
                            treeView.unselectItem(data);
                            return
                        }
                        that._processDemandState(function() {
                            fields = getDimensionFields(data, dataSource.fields());
                            for (var i = 0; i < fields.length; i++) {
                                if (fields[i].area) {
                                    needSelectDefaultItem = false;
                                    break
                                }
                            }
                        });
                        if (needSelectDefaultItem) {
                            var item = getFirstItem(data, function(item) {
                                return item.isDefault
                            }) || getFirstItem(data, function(item) {
                                return isDefined(item.index)
                            });
                            item && treeView.selectItem(item);
                            return
                        }
                    } else {
                        field = dataSource.fields()[data.index];
                        if (data.selected) {
                            area = field.isMeasure ? "data" : "column"
                        }
                        if (field) {
                            fields = [field]
                        }
                    }
                    that._applyChanges(fields, {
                        area: area,
                        areaIndex: void 0
                    })
                }
            }),
            dataChanged = function() {
                var scrollable = getScrollable(container),
                    scrollTop = scrollable ? scrollable.scrollTop() : 0;
                treeView.option({
                    dataSource: that._createFieldsDataSource(dataSource)
                });
                scrollable = getScrollable(container);
                if (scrollable) {
                    scrollable.scrollTo({
                        y: scrollTop
                    });
                    scrollable.update()
                }
            };
        that._dataChangedHandlers.push(dataChanged)
    },
    _renderAreaFields: function($container, area) {
        var that = this,
            dataSource = that._dataSource,
            fields = dataSource ? extend(true, [], dataSource.getAreaFields(area, true)) : [];
        $container.empty();
        each(fields, function(_, field) {
            if (false !== field.visible) {
                that.renderField(field, true).appendTo($container)
            }
        })
    },
    _renderArea: function(container, area) {
        var $fieldsContainer, $fieldsContent, render, that = this,
            $areaContainer = $(DIV).addClass("dx-area").appendTo(container),
            $fieldsHeaderContainer = $(DIV).addClass("dx-area-fields-header").appendTo($areaContainer),
            caption = that.option("texts." + area + "Fields");
        $("<span>").addClass("dx-area-icon").addClass("dx-area-icon-" + area).appendTo($fieldsHeaderContainer);
        $("<span>").html("&nbsp;").appendTo($fieldsHeaderContainer);
        $("<span>").addClass("dx-area-caption").text(caption).appendTo($fieldsHeaderContainer);
        $fieldsContainer = $(DIV).addClass("dx-area-fields").addClass(AREA_DRAG_CLASS).appendTo($areaContainer);
        if ("all" !== area) {
            $fieldsContainer.attr("group", area).attr("allow-scrolling", true);
            $fieldsContent = $(DIV).addClass("dx-area-field-container").appendTo($fieldsContainer);
            render = function() {
                that._renderAreaFields($fieldsContent, area)
            };
            that._dataChangedHandlers.push(render);
            render();
            $fieldsContainer.dxScrollable()
        } else {
            $areaContainer.addClass("dx-all-fields");
            $fieldsContainer.addClass("dx-treeview-border-visible");
            that._renderFieldsTreeView($fieldsContainer)
        }
    },
    _getSortableOptions: function() {
        return {}
    },
    _adjustSortableOnChangedArgs: function() {},
    resetTreeView: function() {
        var treeView = this.$element().find(".dx-treeview").dxTreeView("instance");
        if (treeView) {
            treeView.option("searchValue", "");
            treeView.collapseAll()
        }
    },
    applyChanges: function() {
        var state = this.option("state");
        if (isDefined(state)) {
            this._dataSource.state(state)
        }
    },
    cancelChanges: function() {
        this.option("state", this._dataSource.state())
    },
    getDataSource: function() {
        return this._dataSource
    },
    updateDimensions: function() {
        var $scrollableElements = this.$element().find(".dx-area .dx-scrollable");
        $scrollableElements.dxScrollable("update")
    },
    _visibilityChanged: function(visible) {
        if (visible && hasWindow) {
            this.updateDimensions()
        }
    }
});
registerComponent("dxPivotGridFieldChooser", FieldChooser);
module.exports = FieldChooser;
