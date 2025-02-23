/**
 * DevExtreme (ui/form/ui.form.layout_manager.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
    return typeof obj
} : function(obj) {
    return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
};
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _guid = require("../../core/guid");
var _guid2 = _interopRequireDefault(_guid);
var _uiForm = require("./ui.form.items_runtime_info");
var _uiForm2 = _interopRequireDefault(_uiForm);
var _component_registrator = require("../../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _type = require("../../core/utils/type");
var _type2 = _interopRequireDefault(_type);
var _dom = require("../../core/utils/dom");
var _dom2 = _interopRequireDefault(_dom);
var _variable_wrapper = require("../../core/utils/variable_wrapper");
var _window = require("../../core/utils/window");
var _window2 = _interopRequireDefault(_window);
var _string = require("../../core/utils/string");
var _string2 = _interopRequireDefault(_string);
var _iterator = require("../../core/utils/iterator");
var _extend = require("../../core/utils/extend");
var _array = require("../../core/utils/array");
var _data = require("../../core/utils/data");
var _data2 = _interopRequireDefault(_data);
var _remove_event = require("../../core/remove_event");
var _remove_event2 = _interopRequireDefault(_remove_event);
var _click = require("../../events/click");
var _click2 = _interopRequireDefault(_click);
var _ui = require("../widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _style = require("../../core/utils/style");
var _style2 = _interopRequireDefault(_style);
var _inflector = require("../../core/utils/inflector");
var _inflector2 = _interopRequireDefault(_inflector);
var _ui3 = require("../widget/ui.widget");
var _ui4 = _interopRequireDefault(_ui3);
var _validator = require("../validator");
var _validator2 = _interopRequireDefault(_validator);
var _responsive_box = require("../responsive_box");
var _responsive_box2 = _interopRequireDefault(_responsive_box);
var _themes = require("../themes");
var _themes2 = _interopRequireDefault(_themes);
require("../text_box");
require("../number_box");
require("../check_box");
require("../date_box");
require("../button");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var FORM_EDITOR_BY_DEFAULT = "dxTextBox";
var FIELD_ITEM_CLASS = "dx-field-item";
var FIELD_EMPTY_ITEM_CLASS = "dx-field-empty-item";
var FIELD_BUTTON_ITEM_CLASS = "dx-field-button-item";
var FIELD_ITEM_REQUIRED_CLASS = "dx-field-item-required";
var FIELD_ITEM_OPTIONAL_CLASS = "dx-field-item-optional";
var FIELD_ITEM_REQUIRED_MARK_CLASS = "dx-field-item-required-mark";
var FIELD_ITEM_OPTIONAL_MARK_CLASS = "dx-field-item-optional-mark";
var FIELD_ITEM_LABEL_CLASS = "dx-field-item-label";
var FIELD_ITEM_LABEL_ALIGN_CLASS = "dx-field-item-label-align";
var FIELD_ITEM_LABEL_CONTENT_CLASS = "dx-field-item-label-content";
var FIELD_ITEM_LABEL_TEXT_CLASS = "dx-field-item-label-text";
var FIELD_ITEM_LABEL_LOCATION_CLASS = "dx-field-item-label-location-";
var FIELD_ITEM_CONTENT_CLASS = "dx-field-item-content";
var FIELD_ITEM_CONTENT_LOCATION_CLASS = "dx-field-item-content-location-";
var FIELD_ITEM_CONTENT_WRAPPER_CLASS = "dx-field-item-content-wrapper";
var FIELD_ITEM_HELP_TEXT_CLASS = "dx-field-item-help-text";
var SINGLE_COLUMN_ITEM_CONTENT = "dx-single-column-item-content";
var LABEL_HORIZONTAL_ALIGNMENT_CLASS = "dx-label-h-align";
var LABEL_VERTICAL_ALIGNMENT_CLASS = "dx-label-v-align";
var FORM_LAYOUT_MANAGER_CLASS = "dx-layout-manager";
var LAYOUT_MANAGER_FIRST_ROW_CLASS = "dx-first-row";
var LAYOUT_MANAGER_FIRST_COL_CLASS = "dx-first-col";
var LAYOUT_MANAGER_LAST_COL_CLASS = "dx-last-col";
var LAYOUT_MANAGER_ONE_COLUMN = "dx-layout-manager-one-col";
var FLEX_LAYOUT_CLASS = "dx-flex-layout";
var INVALID_CLASS = "dx-invalid";
var LAYOUT_STRATEGY_FLEX = "flex";
var LAYOUT_STRATEGY_FALLBACK = "fallback";
var SIMPLE_ITEM_TYPE = "simple";
var TEMPLATE_WRAPPER_CLASS = "dx-template-wrapper";
var DATA_OPTIONS = ["dataSource", "items"];
var EDITORS_WITH_ARRAY_VALUE = ["dxTagBox", "dxRangeSlider"];
var LayoutManager = _ui4.default.inherit({
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            layoutData: {},
            readOnly: false,
            colCount: 1,
            colCountByScreen: void 0,
            labelLocation: "left",
            onFieldDataChanged: null,
            onEditorEnterKey: null,
            customizeItem: null,
            alignItemLabels: true,
            minColWidth: 200,
            showRequiredMark: true,
            screenByWidth: null,
            showOptionalMark: false,
            requiredMark: "*",
            optionalMark: _message2.default.format("dxForm-optionalMark"),
            requiredMessage: _message2.default.getFormatter("dxForm-requiredMessage")
        })
    },
    _setOptionsByReference: function() {
        this.callBase();
        (0, _extend.extend)(this._optionsByReference, {
            layoutData: true,
            validationGroup: true
        })
    },
    _init: function() {
        var layoutData = this.option("layoutData");
        this.callBase();
        this._itemWatchers = [];
        this._itemsRunTimeInfo = new _uiForm2.default;
        this._updateReferencedOptions(layoutData);
        this._initDataAndItems(layoutData)
    },
    _dispose: function() {
        this.callBase();
        this._cleanItemWatchers()
    },
    _initDataAndItems: function(initialData) {
        this._syncDataWithItems();
        this._updateItems(initialData)
    },
    _syncDataWithItems: function() {
        var that = this,
            userItems = that.option("items");
        if (_type2.default.isDefined(userItems)) {
            (0, _iterator.each)(userItems, function(index, item) {
                var value;
                if (item.dataField && void 0 === that._getDataByField(item.dataField)) {
                    if (item.editorOptions) {
                        value = item.editorOptions.value
                    }
                    that._updateFieldValue(item.dataField, value)
                }
            })
        }
    },
    _getDataByField: function(dataField) {
        return dataField ? this.option("layoutData." + dataField) : null
    },
    _updateFieldValue: function(dataField, value) {
        var layoutData = this.option("layoutData"),
            newValue = value;
        if (!(0, _variable_wrapper.isWrapped)(layoutData[dataField]) && _type2.default.isDefined(dataField)) {
            this.option("layoutData." + dataField, newValue)
        } else {
            if ((0, _variable_wrapper.isWritableWrapped)(layoutData[dataField])) {
                newValue = _type2.default.isFunction(newValue) ? newValue() : newValue;
                layoutData[dataField](newValue)
            }
        }
        this._triggerOnFieldDataChanged({
            dataField: dataField,
            value: newValue
        })
    },
    _triggerOnFieldDataChanged: function(args) {
        this._createActionByOption("onFieldDataChanged")(args)
    },
    _updateItems: function(layoutData) {
        var items, processedItems, that = this,
            userItems = this.option("items"),
            isUserItemsExist = _type2.default.isDefined(userItems),
            customizeItem = that.option("customizeItem");
        items = isUserItemsExist ? userItems : this._generateItemsByData(layoutData);
        if (_type2.default.isDefined(items)) {
            processedItems = [];
            (0, _iterator.each)(items, function(index, item) {
                if (that._isAcceptableItem(item)) {
                    item = that._processItem(item);
                    customizeItem && customizeItem(item);
                    if (_type2.default.isObject(item) && false !== (0, _variable_wrapper.unwrap)(item.visible)) {
                        processedItems.push(item)
                    }
                }
            });
            if (!that._itemWatchers.length || !isUserItemsExist) {
                that._updateItemWatchers(items)
            }
            this._items = processedItems;
            this._sortItems()
        }
    },
    _cleanItemWatchers: function() {
        this._itemWatchers.forEach(function(dispose) {
            dispose()
        });
        this._itemWatchers = []
    },
    _updateItemWatchers: function(items) {
        var that = this,
            watch = that._getWatch();
        items.forEach(function(item) {
            if (_type2.default.isObject(item) && _type2.default.isDefined(item.visible) && _type2.default.isFunction(watch)) {
                that._itemWatchers.push(watch(function() {
                    return (0, _variable_wrapper.unwrap)(item.visible)
                }, function() {
                    that._updateItems(that.option("layoutData"));
                    that.repaint()
                }, {
                    skipImmediate: true
                }))
            }
        })
    },
    _generateItemsByData: function(layoutData) {
        var result = [];
        if (_type2.default.isDefined(layoutData)) {
            (0, _iterator.each)(layoutData, function(dataField) {
                result.push({
                    dataField: dataField
                })
            })
        }
        return result
    },
    _isAcceptableItem: function(item) {
        var itemField = item.dataField || item,
            itemData = this._getDataByField(itemField);
        return !(_type2.default.isFunction(itemData) && !(0, _variable_wrapper.isWrapped)(itemData))
    },
    _processItem: function(item) {
        if ("string" === typeof item) {
            item = {
                dataField: item
            }
        }
        if ("object" === ("undefined" === typeof item ? "undefined" : _typeof(item)) && !item.itemType) {
            item.itemType = SIMPLE_ITEM_TYPE
        }
        if (!_type2.default.isDefined(item.editorType) && _type2.default.isDefined(item.dataField)) {
            var value = this._getDataByField(item.dataField);
            item.editorType = _type2.default.isDefined(value) ? this._getEditorTypeByDataType(_type2.default.type(value)) : FORM_EDITOR_BY_DEFAULT
        }
        return item
    },
    _getEditorTypeByDataType: function(dataType) {
        switch (dataType) {
            case "number":
                return "dxNumberBox";
            case "date":
                return "dxDateBox";
            case "boolean":
                return "dxCheckBox";
            default:
                return "dxTextBox"
        }
    },
    _sortItems: function() {
        (0, _array.normalizeIndexes)(this._items, "visibleIndex");
        this._sortIndexes()
    },
    _sortIndexes: function() {
        this._items.sort(function(itemA, itemB) {
            var result, indexA = itemA.visibleIndex,
                indexB = itemB.visibleIndex;
            if (indexA > indexB) {
                result = 1
            } else {
                if (indexA < indexB) {
                    result = -1
                } else {
                    result = 0
                }
            }
            return result
        })
    },
    _initMarkup: function() {
        this._itemsRunTimeInfo.clear();
        this.$element().addClass(FORM_LAYOUT_MANAGER_CLASS);
        this.callBase();
        this._renderResponsiveBox()
    },
    _hasBrowserFlex: function() {
        return _style2.default.styleProp(LAYOUT_STRATEGY_FLEX) === LAYOUT_STRATEGY_FLEX
    },
    _renderResponsiveBox: function() {
        var that = this,
            templatesInfo = [];
        if (that._items && that._items.length) {
            var layoutItems, colCount = that._getColCount(),
                $container = (0, _renderer2.default)("<div>").appendTo(that.$element());
            that._prepareItemsWithMerging(colCount);
            layoutItems = that._generateLayoutItems();
            that._extendItemsWithDefaultTemplateOptions(layoutItems, that._items);
            that._responsiveBox = that._createComponent($container, _responsive_box2.default, that._getResponsiveBoxConfig(layoutItems, colCount, templatesInfo));
            if (!_window2.default.hasWindow()) {
                that._renderTemplates(templatesInfo)
            }
        }
    },
    _extendItemsWithDefaultTemplateOptions: function(targetItems, sourceItems) {
        sourceItems.forEach(function(item) {
            if (!item.merged) {
                if (_type2.default.isDefined(item.disabled)) {
                    targetItems[item.visibleIndex].disabled = item.disabled
                }
                if (_type2.default.isDefined(item.visible)) {
                    targetItems[item.visibleIndex].visible = item.visible
                }
            }
        })
    },
    _itemStateChangedHandler: function(e) {
        this._refresh()
    },
    _renderTemplate: function($container, item) {
        switch (item.itemType) {
            case "empty":
                this._renderEmptyItem($container);
                break;
            case "button":
                this._renderButtonItem(item, $container);
                break;
            default:
                this._renderFieldItem(item, $container)
        }
    },
    _renderTemplates: function(templatesInfo) {
        var that = this;
        (0, _iterator.each)(templatesInfo, function(index, info) {
            that._renderTemplate(info.container, info.formItem)
        })
    },
    _getResponsiveBoxConfig: function(layoutItems, colCount, templatesInfo) {
        var that = this,
            colCountByScreen = that.option("colCountByScreen"),
            xsColCount = colCountByScreen && colCountByScreen.xs;
        return {
            onItemStateChanged: this._itemStateChangedHandler.bind(this),
            _layoutStrategy: that._hasBrowserFlex() ? LAYOUT_STRATEGY_FLEX : LAYOUT_STRATEGY_FALLBACK,
            onLayoutChanged: function onLayoutChanged() {
                var onLayoutChanged = that.option("onLayoutChanged"),
                    isSingleColumnMode = that.isSingleColumnMode();
                if (onLayoutChanged) {
                    that.$element().toggleClass(LAYOUT_MANAGER_ONE_COLUMN, isSingleColumnMode);
                    onLayoutChanged(isSingleColumnMode)
                }
            },
            onContentReady: function(e) {
                if (_window2.default.hasWindow()) {
                    that._renderTemplates(templatesInfo)
                }
                if (that.option("onLayoutChanged")) {
                    that.$element().toggleClass(LAYOUT_MANAGER_ONE_COLUMN, that.isSingleColumnMode(e.component))
                }
                that._fireContentReadyAction()
            },
            itemTemplate: function(e, itemData, itemElement) {
                if (!e.location) {
                    return
                }
                var $itemElement = (0, _renderer2.default)(itemElement),
                    itemRenderedCountInPreviousRows = e.location.row * colCount,
                    item = that._items[e.location.col + itemRenderedCountInPreviousRows],
                    $fieldItem = (0, _renderer2.default)("<div>").addClass(item.cssClass).appendTo($itemElement);
                templatesInfo.push({
                    container: $fieldItem,
                    formItem: item
                });
                $itemElement.toggleClass(SINGLE_COLUMN_ITEM_CONTENT, that.isSingleColumnMode(this));
                if (0 === e.location.row) {
                    $fieldItem.addClass(LAYOUT_MANAGER_FIRST_ROW_CLASS)
                }
                if (0 === e.location.col) {
                    $fieldItem.addClass(LAYOUT_MANAGER_FIRST_COL_CLASS)
                }
                if (e.location.col === colCount - 1 || e.location.col + e.location.colspan === colCount) {
                    $fieldItem.addClass(LAYOUT_MANAGER_LAST_COL_CLASS)
                }
            },
            cols: that._generateRatio(colCount),
            rows: that._generateRatio(that._getRowsCount(), true),
            dataSource: layoutItems,
            screenByWidth: that.option("screenByWidth"),
            singleColumnScreen: xsColCount ? false : "xs"
        }
    },
    _getColCount: function() {
        var colCount = this.option("colCount"),
            colCountByScreen = this.option("colCountByScreen");
        if (colCountByScreen) {
            var screenFactor = this.option("form").getTargetScreenFactor();
            if (!screenFactor) {
                screenFactor = _window2.default.hasWindow() ? _window2.default.getCurrentScreenFactor(this.option("screenByWidth")) : "lg"
            }
            colCount = colCountByScreen[screenFactor] || colCount
        }
        if ("auto" === colCount) {
            if (this._cashedColCount) {
                return this._cashedColCount
            }
            this._cashedColCount = colCount = this._getMaxColCount()
        }
        return colCount < 1 ? 1 : colCount
    },
    _getMaxColCount: function() {
        if (!_window2.default.hasWindow()) {
            return 1
        }
        var minColWidth = this.option("minColWidth"),
            width = this.$element().width(),
            itemsCount = this._items.length,
            maxColCount = Math.floor(width / minColWidth) || 1;
        return itemsCount < maxColCount ? itemsCount : maxColCount
    },
    isCachedColCountObsolete: function() {
        return this._cashedColCount && this._getMaxColCount() !== this._cashedColCount
    },
    _prepareItemsWithMerging: function(colCount) {
        var item, itemsMergedByCol, j, i, items = this._items.slice(0),
            result = [];
        for (i = 0; i < items.length; i++) {
            item = items[i];
            result.push(item);
            if (this.option("alignItemLabels") || item.alignItemLabels || item.colSpan) {
                item.col = this._getColByIndex(result.length - 1, colCount)
            }
            if (item.colSpan > 1 && item.col + item.colSpan <= colCount) {
                itemsMergedByCol = [];
                for (j = 0; j < item.colSpan - 1; j++) {
                    itemsMergedByCol.push({
                        merged: true
                    })
                }
                result = result.concat(itemsMergedByCol)
            } else {
                delete item.colSpan
            }
        }
        this._items = result
    },
    _getColByIndex: function(index, colCount) {
        return index % colCount
    },
    _generateLayoutItems: function() {
        var item, i, items = this._items,
            colCount = this._getColCount(),
            result = [];
        for (i = 0; i < items.length; i++) {
            item = items[i];
            if (!item.merged) {
                var generatedItem = {
                    location: {
                        row: parseInt(i / colCount),
                        col: this._getColByIndex(i, colCount)
                    }
                };
                if (_type2.default.isDefined(item.colSpan)) {
                    generatedItem.location.colspan = item.colSpan
                }
                if (_type2.default.isDefined(item.rowSpan)) {
                    generatedItem.location.rowspan = item.rowSpan
                }
                result.push(generatedItem)
            }
        }
        return result
    },
    _renderEmptyItem: function($container) {
        return $container.addClass(FIELD_EMPTY_ITEM_CLASS).html("&nbsp;")
    },
    _getButtonHorizontalAlignment: function(item) {
        if (_type2.default.isDefined(item.horizontalAlignment)) {
            return item.horizontalAlignment
        }
        if (_type2.default.isDefined(item.alignment)) {
            _ui2.default.log("W0001", "dxForm", "alignment", "18.1", "Use the 'horizontalAlignment' option in button items instead.");
            return item.alignment
        }
        return "right"
    },
    _getButtonVerticalAlignment: function(item) {
        switch (item.verticalAlignment) {
            case "center":
                return "center";
            case "bottom":
                return "flex-end";
            default:
                return "flex-start"
        }
    },
    _renderButtonItem: function(item, $container) {
        var $button = (0, _renderer2.default)("<div>").appendTo($container),
            defaultOptions = {
                validationGroup: this.option("validationGroup")
            };
        $container.addClass(FIELD_BUTTON_ITEM_CLASS).css("textAlign", this._getButtonHorizontalAlignment(item));
        $container.parent().css("justifyContent", this._getButtonVerticalAlignment(item));
        var instance = this._createComponent($button, "dxButton", (0, _extend.extend)(defaultOptions, item.buttonOptions));
        this._itemsRunTimeInfo.add(item, instance, item.guid, $container);
        this._addItemClasses($container, item.col);
        return $button
    },
    _addItemClasses: function($item, column) {
        $item.addClass(FIELD_ITEM_CLASS).addClass(this.option("cssItemClass")).addClass(_type2.default.isDefined(column) ? "dx-col-" + column : "")
    },
    _renderFieldItem: function(item, $container) {
        var $label, that = this,
            name = that._getName(item),
            id = that.getItemID(name),
            isRequired = _type2.default.isDefined(item.isRequired) ? item.isRequired : !!that._hasRequiredRuleInSet(item.validationRules),
            labelOptions = that._getLabelOptions(item, id, isRequired),
            $editor = (0, _renderer2.default)("<div>"),
            helpID = item.helpText ? "dx-" + new _guid2.default : null;
        this._addItemClasses($container, item.col);
        $container.addClass(isRequired ? FIELD_ITEM_REQUIRED_CLASS : FIELD_ITEM_OPTIONAL_CLASS);
        if (labelOptions.visible && labelOptions.text) {
            $label = that._renderLabel(labelOptions).appendTo($container)
        }
        if (item.itemType === SIMPLE_ITEM_TYPE) {
            if (that._isLabelNeedBaselineAlign(item) && "top" !== labelOptions.location) {
                $container.addClass(FIELD_ITEM_LABEL_ALIGN_CLASS)
            }
            that._hasBrowserFlex() && $container.addClass(FLEX_LAYOUT_CLASS)
        }
        $editor.data("dx-form-item", item);
        that._appendEditorToField({
            $fieldItem: $container,
            $label: $label,
            $editor: $editor,
            labelOptions: labelOptions
        });
        var instance = that._renderEditor({
            $container: $editor,
            dataField: item.dataField,
            name: name,
            editorType: item.editorType,
            editorOptions: item.editorOptions,
            template: that._getTemplateByFieldItem(item),
            isRequired: isRequired,
            helpID: helpID,
            id: id,
            validationBoundary: that.option("validationBoundary")
        });
        this._itemsRunTimeInfo.add(item, instance, item.guid, $container);
        var editorElem = $editor.children().first();
        var $validationTarget = editorElem.hasClass(TEMPLATE_WRAPPER_CLASS) ? editorElem.children().first() : editorElem;
        if ($validationTarget && $validationTarget.data("dx-validation-target")) {
            that._renderValidator($validationTarget, item)
        }
        that._renderHelpText(item, $editor, helpID);
        that._attachClickHandler($label, $editor, item.editorType)
    },
    _hasRequiredRuleInSet: function(rules) {
        var hasRequiredRule;
        if (rules && rules.length) {
            (0, _iterator.each)(rules, function(index, rule) {
                if ("required" === rule.type) {
                    hasRequiredRule = true;
                    return false
                }
            })
        }
        return hasRequiredRule
    },
    _getName: function(item) {
        return item.dataField || item.name
    },
    _isLabelNeedBaselineAlign: function(item) {
        var largeEditors = ["dxTextArea", "dxRadioGroup", "dxCalendar"];
        return !!item.helpText && !this._hasBrowserFlex() || (0, _array.inArray)(item.editorType, largeEditors) !== -1
    },
    _getLabelOptions: function(item, id, isRequired) {
        var labelOptions = (0, _extend.extend)({
            showColon: this.option("showColonAfterLabel"),
            location: this.option("labelLocation"),
            id: id,
            visible: true,
            isRequired: isRequired
        }, item ? item.label : {});
        if (!labelOptions.text && item.dataField) {
            labelOptions.text = _inflector2.default.captionize(item.dataField)
        }
        if (labelOptions.text) {
            labelOptions.text += labelOptions.showColon ? ":" : ""
        }
        return labelOptions
    },
    _renderLabel: function(options) {
        if (_type2.default.isDefined(options.text) && options.text.length > 0) {
            var labelClasses = FIELD_ITEM_LABEL_CLASS + " " + FIELD_ITEM_LABEL_LOCATION_CLASS + options.location,
                $label = (0, _renderer2.default)("<label>").addClass(labelClasses).attr("for", options.id),
                $labelContent = (0, _renderer2.default)("<span>").addClass(FIELD_ITEM_LABEL_CONTENT_CLASS).appendTo($label);
            (0, _renderer2.default)("<span>").addClass(FIELD_ITEM_LABEL_TEXT_CLASS).text(options.text).appendTo($labelContent);
            if (options.alignment) {
                $label.css("textAlign", options.alignment)
            }
            $labelContent.append(this._renderLabelMark(options.isRequired));
            return $label
        }
    },
    _renderLabelMark: function(isRequired) {
        var $mark, requiredMarksConfig = this._getRequiredMarksConfig(),
            isRequiredMark = requiredMarksConfig.showRequiredMark && isRequired,
            isOptionalMark = requiredMarksConfig.showOptionalMark && !isRequired;
        if (isRequiredMark || isOptionalMark) {
            var markClass = isRequiredMark ? FIELD_ITEM_REQUIRED_MARK_CLASS : FIELD_ITEM_OPTIONAL_MARK_CLASS,
                markText = isRequiredMark ? requiredMarksConfig.requiredMark : requiredMarksConfig.optionalMark;
            $mark = (0, _renderer2.default)("<span>").addClass(markClass).html("&nbsp" + markText)
        }
        return $mark
    },
    _getRequiredMarksConfig: function() {
        if (!this._cashedRequiredConfig) {
            this._cashedRequiredConfig = {
                showRequiredMark: this.option("showRequiredMark"),
                showOptionalMark: this.option("showOptionalMark"),
                requiredMark: this.option("requiredMark"),
                optionalMark: this.option("optionalMark")
            }
        }
        return this._cashedRequiredConfig
    },
    _renderEditor: function(options) {
        var editorOptions, dataValue = this._getDataByField(options.dataField),
            defaultEditorOptions = void 0 !== dataValue ? {
                value: dataValue
            } : {},
            isDeepExtend = true;
        if (EDITORS_WITH_ARRAY_VALUE.indexOf(options.editorType) !== -1) {
            defaultEditorOptions.value = defaultEditorOptions.value || []
        }
        var formInstance = this.option("form");
        editorOptions = (0, _extend.extend)(isDeepExtend, defaultEditorOptions, options.editorOptions, {
            inputAttr: {
                id: options.id
            },
            validationBoundary: options.validationBoundary,
            stylingMode: formInstance && formInstance.option("stylingMode")
        });
        this._replaceDataOptions(options.editorOptions, editorOptions);
        var renderOptions = {
            editorType: options.editorType,
            dataField: options.dataField,
            template: options.template,
            name: options.name,
            helpID: options.helpID,
            isRequired: options.isRequired
        };
        return this._createEditor(options.$container, renderOptions, editorOptions)
    },
    _replaceDataOptions: function(originalOptions, resultOptions) {
        if (originalOptions) {
            DATA_OPTIONS.forEach(function(item) {
                if (resultOptions[item]) {
                    resultOptions[item] = originalOptions[item]
                }
            })
        }
    },
    _renderValidator: function($editor, item) {
        var fieldName = this._getFieldLabelName(item),
            validationRules = this._prepareValidationRules(item.validationRules, item.isRequired, item.itemType, fieldName);
        if (Array.isArray(validationRules) && validationRules.length) {
            this._createComponent($editor, _validator2.default, {
                validationRules: validationRules,
                validationGroup: this.option("validationGroup")
            })
        }
    },
    _getFieldLabelName: function(item) {
        var isItemHaveCustomLabel = item.label && item.label.text,
            itemName = isItemHaveCustomLabel ? null : this._getName(item);
        return isItemHaveCustomLabel ? item.label.text : itemName && _inflector2.default.captionize(itemName)
    },
    _prepareValidationRules: function(userValidationRules, isItemRequired, itemType, itemName) {
        var validationRules, isSimpleItem = itemType === SIMPLE_ITEM_TYPE;
        if (isSimpleItem) {
            if (userValidationRules) {
                validationRules = userValidationRules
            } else {
                var requiredMessage = _string2.default.format(this.option("requiredMessage"), itemName || "");
                validationRules = isItemRequired ? [{
                    type: "required",
                    message: requiredMessage
                }] : null
            }
        }
        return validationRules
    },
    _addWrapperInvalidClass: function(editorInstance) {
        var wrapperClass = "." + FIELD_ITEM_CONTENT_WRAPPER_CLASS,
            toggleInvalidClass = function(e) {
                (0, _renderer2.default)(e.element).parents(wrapperClass).toggleClass(INVALID_CLASS, e.component._isFocused() && false === e.component.option("isValid"))
            };
        editorInstance.on("focusIn", toggleInvalidClass).on("focusOut", toggleInvalidClass).on("enterKey", toggleInvalidClass)
    },
    _createEditor: function($container, renderOptions, editorOptions) {
        var editorInstance, that = this,
            template = renderOptions.template;
        if (renderOptions.dataField && !editorOptions.name) {
            editorOptions.name = renderOptions.dataField
        }
        that._addItemContentClasses($container);
        if (template) {
            var data = {
                dataField: renderOptions.dataField,
                editorType: renderOptions.editorType,
                editorOptions: editorOptions,
                component: that._getComponentOwner()
            };
            template.render({
                model: data,
                container: _dom2.default.getPublicElement($container)
            })
        } else {
            var $editor = (0, _renderer2.default)("<div>").appendTo($container);
            try {
                editorInstance = that._createComponent($editor, renderOptions.editorType, editorOptions);
                editorInstance.setAria("describedby", renderOptions.helpID);
                editorInstance.setAria("required", renderOptions.isRequired);
                if (_themes2.default.isMaterial()) {
                    that._addWrapperInvalidClass(editorInstance)
                }
                if (renderOptions.dataField) {
                    that._bindDataField(editorInstance, renderOptions, $container)
                }
            } catch (e) {
                _ui2.default.log("E1035", e.message)
            }
        }
        return editorInstance
    },
    _getComponentOwner: function() {
        return this.option("form") || this
    },
    _bindDataField: function(editorInstance, renderOptions, $container) {
        var componentOwner = this._getComponentOwner();
        editorInstance.on("enterKey", function(args) {
            componentOwner._createActionByOption("onEditorEnterKey")((0, _extend.extend)(args, {
                dataField: renderOptions.dataField
            }))
        });
        this._createWatcher(editorInstance, $container, renderOptions);
        this.linkEditorToDataField(editorInstance, renderOptions.dataField, renderOptions.editorType)
    },
    _createWatcher: function(editorInstance, $container, renderOptions) {
        var that = this,
            watch = that._getWatch();
        if (!_type2.default.isFunction(watch)) {
            return
        }
        var dispose = watch(function() {
            return that._getDataByField(renderOptions.dataField)
        }, function() {
            editorInstance.option("value", that._getDataByField(renderOptions.dataField))
        }, {
            deep: true,
            skipImmediate: true
        });
        _events_engine2.default.on($container, _remove_event2.default, dispose)
    },
    _getWatch: function() {
        if (!_type2.default.isDefined(this._watch)) {
            var formInstance = this.option("form");
            this._watch = formInstance && formInstance.option("integrationOptions.watchMethod")
        }
        return this._watch
    },
    _addItemContentClasses: function($itemContent) {
        var locationSpecificClass = this._getItemContentLocationSpecificClass();
        $itemContent.addClass([FIELD_ITEM_CONTENT_CLASS, locationSpecificClass].join(" "))
    },
    _getItemContentLocationSpecificClass: function() {
        var labelLocation = this.option("labelLocation"),
            oppositeClasses = {
                right: "left",
                left: "right",
                top: "bottom"
            };
        return FIELD_ITEM_CONTENT_LOCATION_CLASS + oppositeClasses[labelLocation]
    },
    _createComponent: function($editor, type, editorOptions) {
        var instance, that = this,
            readOnlyState = this.option("readOnly");
        instance = that.callBase($editor, type, editorOptions);
        readOnlyState && instance.option("readOnly", readOnlyState);
        that.on("optionChanged", function(args) {
            if ("readOnly" === args.name && !_type2.default.isDefined(editorOptions.readOnly)) {
                instance.option(args.name, args.value)
            }
        });
        return instance
    },
    _getTemplateByFieldItem: function(fieldItem) {
        return fieldItem.template ? this._getTemplate(fieldItem.template) : null
    },
    _appendEditorToField: function(params) {
        if (params.$label) {
            var location = params.labelOptions.location;
            if ("top" === location || "left" === location) {
                params.$fieldItem.append(params.$editor)
            }
            if ("right" === location) {
                params.$fieldItem.prepend(params.$editor)
            }
            this._addInnerItemAlignmentClass(params.$fieldItem, location)
        } else {
            params.$fieldItem.append(params.$editor)
        }
    },
    _addInnerItemAlignmentClass: function($fieldItem, location) {
        if ("top" === location) {
            $fieldItem.addClass(LABEL_VERTICAL_ALIGNMENT_CLASS)
        } else {
            $fieldItem.addClass(LABEL_HORIZONTAL_ALIGNMENT_CLASS)
        }
    },
    _renderHelpText: function(fieldItem, $editor, helpID) {
        var helpText = fieldItem.helpText,
            isSimpleItem = fieldItem.itemType === SIMPLE_ITEM_TYPE;
        if (helpText && isSimpleItem) {
            var $editorWrapper = (0, _renderer2.default)("<div>").addClass(FIELD_ITEM_CONTENT_WRAPPER_CLASS);
            $editor.wrap($editorWrapper);
            (0, _renderer2.default)("<div>").addClass(FIELD_ITEM_HELP_TEXT_CLASS).attr("id", helpID).text(helpText).appendTo($editor.parent())
        }
    },
    _attachClickHandler: function($label, $editor, editorType) {
        var isBooleanEditors = "dxCheckBox" === editorType || "dxSwitch" === editorType;
        if ($label && isBooleanEditors) {
            _events_engine2.default.on($label, _click2.default.name, function() {
                _events_engine2.default.trigger($editor.children(), _click2.default.name)
            })
        }
    },
    _generateRatio: function(count, isAutoSize) {
        var ratio, i, result = [];
        for (i = 0; i < count; i++) {
            ratio = {
                ratio: 1
            };
            if (isAutoSize) {
                ratio.baseSize = "auto"
            }
            result.push(ratio)
        }
        return result
    },
    _getRowsCount: function() {
        return Math.ceil(this._items.length / this._getColCount())
    },
    _updateReferencedOptions: function(newLayoutData) {
        var _this = this;
        var layoutData = this.option("layoutData");
        if (_type2.default.isObject(layoutData)) {
            Object.getOwnPropertyNames(layoutData).forEach(function(property) {
                return delete _this._optionsByReference["layoutData." + property]
            })
        }
        if (_type2.default.isObject(newLayoutData)) {
            Object.getOwnPropertyNames(newLayoutData).forEach(function(property) {
                return _this._optionsByReference["layoutData." + property] = true
            })
        }
    },
    _resetWidget: function(instance) {
        var defaultOptions = instance._getDefaultOptions();
        instance._setOptionSilent("value", defaultOptions.value);
        instance.option("isValid", true)
    },
    _optionChanged: function(args) {
        var _this2 = this;
        if (0 === args.fullName.search("layoutData.")) {
            return
        }
        switch (args.name) {
            case "showRequiredMark":
            case "showOptionalMark":
            case "requiredMark":
            case "optionalMark":
                this._cashedRequiredConfig = null;
                this._invalidate();
                break;
            case "layoutData":
                this._updateReferencedOptions(args.value);
                if (this.option("items")) {
                    if (!_type2.default.isEmptyObject(args.value)) {
                        this._itemsRunTimeInfo.each(function(_, itemRunTimeInfo) {
                            if (_type2.default.isDefined(itemRunTimeInfo.item)) {
                                var dataField = itemRunTimeInfo.item.dataField;
                                if (dataField && _type2.default.isDefined(itemRunTimeInfo.widgetInstance)) {
                                    var valueGetter = _data2.default.compileGetter(dataField);
                                    var dataValue = valueGetter(args.value);
                                    if (void 0 === dataValue) {
                                        _this2._resetWidget(itemRunTimeInfo.widgetInstance)
                                    } else {
                                        itemRunTimeInfo.widgetInstance.option("value", dataValue)
                                    }
                                }
                            }
                        })
                    }
                } else {
                    this._initDataAndItems(args.value);
                    this._invalidate()
                }
                break;
            case "items":
                this._cleanItemWatchers();
                this._initDataAndItems(args.value);
                this._invalidate();
                break;
            case "alignItemLabels":
            case "labelLocation":
            case "requiredMessage":
                this._invalidate();
                break;
            case "customizeItem":
                this._updateItems(this.option("layoutData"));
                this._invalidate();
                break;
            case "colCount":
                this._resetColCount();
                break;
            case "minColWidth":
                if ("auto" === this.option("colCount")) {
                    this._resetColCount()
                }
                break;
            case "readOnly":
                break;
            case "width":
                this.callBase(args);
                if ("auto" === this.option("colCount")) {
                    this._resetColCount()
                }
                break;
            case "onFieldDataChanged":
                break;
            default:
                this.callBase(args)
        }
    },
    _resetColCount: function() {
        this._cashedColCount = null;
        this._invalidate()
    },
    linkEditorToDataField: function(editorInstance, dataField, editorType) {
        var isDataUpdating, fullFieldName = "layoutData." + dataField,
            that = this;
        that.on("optionChanged", function(args) {
            if (args.fullName === fullFieldName) {
                isDataUpdating = true;
                if ("object" === _typeof(args.value)) {
                    that._managedUpdateEditorOption(editorInstance, "value", args.value)
                } else {
                    editorInstance.option("value", args.value)
                }
                isDataUpdating = false
            }
        });
        editorInstance.on("valueChanged", function(args) {
            var isObjectValue = "object" === _typeof(args.value),
                isSameObjectValue = isObjectValue && args.value === args.previousValue;
            if (!isDataUpdating && !isSameObjectValue) {
                if (isObjectValue) {
                    that._managedUpdateFieldValue(dataField, args.value)
                } else {
                    that._updateFieldValue(dataField, args.value)
                }
            }
        })
    },
    _managedUpdateEditorOption: function(editorInstance, optionName, value) {
        if (!this._isValueChangedCalled) {
            this._isFieldValueChanged = true;
            editorInstance.option(optionName, value);
            this._isFieldValueChanged = false
        }
    },
    _managedUpdateFieldValue: function(dataField, value) {
        this._isValueChangedCalled = true;
        if (!this._isFieldValueChanged) {
            this._updateFieldValue(dataField, value)
        }
        this._isValueChangedCalled = false
    },
    _dimensionChanged: function() {
        if ("auto" === this.option("colCount") && this.isCachedColCountObsolete()) {
            this.fireEvent("autoColCountChanged")
        }
    },
    getItemID: function(name) {
        var formInstance = this.option("form");
        return formInstance && formInstance.getItemID(name)
    },
    updateData: function(data, value) {
        var that = this;
        if (_type2.default.isObject(data)) {
            (0, _iterator.each)(data, function(dataField, fieldValue) {
                that._updateFieldValue(dataField, fieldValue)
            })
        } else {
            if ("string" === typeof data) {
                that._updateFieldValue(data, value)
            }
        }
    },
    getEditor: function(field) {
        return this._itemsRunTimeInfo.findWidgetInstanceByDataField(field) || this._itemsRunTimeInfo.findWidgetInstanceByName(field)
    },
    isSingleColumnMode: function(component) {
        var responsiveBox = this._responsiveBox || component;
        if (responsiveBox) {
            return responsiveBox.option("currentScreenFactor") === responsiveBox.option("singleColumnScreen")
        }
    }
});
(0, _component_registrator2.default)("dxLayoutManager", LayoutManager);
module.exports = LayoutManager;
