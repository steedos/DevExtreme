/**
 * DevExtreme (ui/text_box/ui.text_editor.base.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    domAdapter = require("../../core/dom_adapter"),
    eventsEngine = require("../../events/core/events_engine"),
    domUtils = require("../../core/utils/dom"),
    focused = require("../widget/selectors").focused,
    isDefined = require("../../core/utils/type").isDefined,
    extend = require("../../core/utils/extend").extend,
    inArray = require("../../core/utils/array").inArray,
    each = require("../../core/utils/iterator").each,
    themes = require("../themes"),
    Editor = require("../editor/editor"),
    eventUtils = require("../../events/utils"),
    pointerEvents = require("../../events/pointer"),
    clickEvent = require("../../events/click"),
    config = require("../../core/config"),
    Deferred = require("../../core/utils/deferred").Deferred;
var TEXTEDITOR_CLASS = "dx-texteditor",
    TEXTEDITOR_INPUT_CLASS = "dx-texteditor-input",
    TEXTEDITOR_INPUT_SELECTOR = "." + TEXTEDITOR_INPUT_CLASS,
    TEXTEDITOR_CONTAINER_CLASS = "dx-texteditor-container",
    TEXTEDITOR_BUTTONS_CONTAINER_CLASS = "dx-texteditor-buttons-container",
    TEXTEDITOR_PLACEHOLDER_CLASS = "dx-placeholder",
    TEXTEDITOR_SHOW_CLEAR_BUTTON_CLASS = "dx-show-clear-button",
    TEXTEDITOR_ICON_CLASS = "dx-icon",
    TEXTEDITOR_CLEAR_ICON_CLASS = "dx-icon-clear",
    TEXTEDITOR_CLEAR_BUTTON_CLASS = "dx-clear-button-area",
    TEXTEDITOR_EMPTY_INPUT_CLASS = "dx-texteditor-empty",
    TEXTEDITOR_STYLING_MODE_PREFIX = "dx-editor-",
    ALLOWED_STYLE_CLASSES = [TEXTEDITOR_STYLING_MODE_PREFIX + "outlined", TEXTEDITOR_STYLING_MODE_PREFIX + "filled", TEXTEDITOR_STYLING_MODE_PREFIX + "underlined"],
    STATE_INVISIBLE_CLASS = "dx-state-invisible";
var EVENTS_LIST = ["KeyDown", "KeyPress", "KeyUp", "Change", "Cut", "Copy", "Paste", "Input"];
var CONTROL_KEYS = ["tab", "enter", "shift", "control", "alt", "escape", "pageUp", "pageDown", "end", "home", "leftArrow", "upArrow", "rightArrow", "downArrow"];
var TextEditorBase = Editor.inherit({
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            value: "",
            spellcheck: false,
            showClearButton: false,
            valueChangeEvent: "change",
            placeholder: "",
            inputAttr: {},
            onFocusIn: null,
            onFocusOut: null,
            onKeyDown: null,
            onKeyPress: null,
            onKeyUp: null,
            onChange: null,
            onInput: null,
            onCut: null,
            onCopy: null,
            onPaste: null,
            onEnterKey: null,
            mode: "text",
            hoverStateEnabled: true,
            focusStateEnabled: true,
            text: void 0,
            valueFormat: function(value) {
                return isDefined(value) && false !== value ? value : ""
            },
            stylingMode: config().editorStylingMode || "outlined"
        })
    },
    _defaultOptionsRules: function() {
        var themeName = themes.current();
        return this.callBase().concat([{
            device: function() {
                return themes.isAndroid5(themeName)
            },
            options: {
                validationMessageOffset: {
                    v: -8
                }
            }
        }, {
            device: function() {
                return themes.isMaterial(themeName)
            },
            options: {
                stylingMode: config().editorStylingMode || "underlined"
            }
        }])
    },
    _input: function() {
        return this.$element().find(TEXTEDITOR_INPUT_SELECTOR).first()
    },
    _isFocused: function() {
        return focused(this._input()) || this.callBase()
    },
    _inputWrapper: function() {
        return this.$element()
    },
    _buttonsContainer: function() {
        return this._inputWrapper().find("." + TEXTEDITOR_BUTTONS_CONTAINER_CLASS).eq(0)
    },
    _isControlKey: function(key) {
        return CONTROL_KEYS.indexOf(key) !== -1
    },
    _renderStylingMode: function() {
        var _this = this;
        var optionName = "stylingMode";
        ALLOWED_STYLE_CLASSES.forEach(function(className) {
            return _this.$element().removeClass(className)
        });
        var stylingModeClass = TEXTEDITOR_STYLING_MODE_PREFIX + this.option(optionName);
        if (ALLOWED_STYLE_CLASSES.indexOf(stylingModeClass) === -1) {
            var defaultOptionValue = this._getDefaultOptions()[optionName];
            var platformOptionValue = this._convertRulesToOptions(this._defaultOptionsRules())[optionName];
            stylingModeClass = TEXTEDITOR_STYLING_MODE_PREFIX + (platformOptionValue || defaultOptionValue)
        }
        this.$element().addClass(stylingModeClass)
    },
    _initMarkup: function() {
        this.$element().addClass(TEXTEDITOR_CLASS);
        this._renderStylingMode();
        this._renderInput();
        this._renderInputType();
        this._renderPlaceholder();
        this._renderProps();
        this.callBase();
        this._renderValue()
    },
    _render: function() {
        this._renderPlaceholder();
        this._refreshValueChangeEvent();
        this._renderEvents();
        this._renderEnterKeyAction();
        this._renderEmptinessEvent();
        this.callBase()
    },
    _renderInput: function() {
        $("<div>").addClass(TEXTEDITOR_CONTAINER_CLASS).append(this._createInput()).append($("<div>").addClass(TEXTEDITOR_BUTTONS_CONTAINER_CLASS)).appendTo(this.$element())
    },
    _createInput: function() {
        var $input = $("<input>");
        this._applyInputAttributes($input, this.option("inputAttr"));
        return $input
    },
    _setSubmitElementName: function(name) {
        var inputAttrName = this.option("inputAttr.name");
        return this.callBase(name || inputAttrName || "")
    },
    _applyInputAttributes: function($input, customAttributes) {
        $input.attr("autocomplete", "off").attr(customAttributes).addClass(TEXTEDITOR_INPUT_CLASS).css("minHeight", this.option("height") ? "0" : "")
    },
    _renderValue: function() {
        var renderInputPromise = this._renderInputValue();
        renderInputPromise.always(this._renderInputAddons.bind(this))
    },
    _renderInputValue: function(value) {
        value = value || this.option("value");
        var text = this.option("text"),
            displayValue = this.option("displayValue"),
            valueFormat = this.option("valueFormat");
        if (void 0 !== displayValue && null !== value) {
            text = valueFormat(displayValue)
        } else {
            if (!isDefined(text)) {
                text = valueFormat(value)
            }
        }
        this.option("text", text);
        if (this._input().val() !== (isDefined(text) ? text : "")) {
            this._renderDisplayText(text)
        } else {
            this._toggleEmptinessEventHandler()
        }
        return (new Deferred).resolve()
    },
    _renderDisplayText: function(text) {
        this._input().val(text);
        this._toggleEmptinessEventHandler()
    },
    _isValueValid: function() {
        if (this._input().length) {
            var validity = this._input().get(0).validity;
            if (validity) {
                return validity.valid
            }
        }
        return true
    },
    _toggleEmptiness: function(isEmpty) {
        this.$element().toggleClass(TEXTEDITOR_EMPTY_INPUT_CLASS, isEmpty);
        this._togglePlaceholder(isEmpty)
    },
    _togglePlaceholder: function(isEmpty) {
        if (!this._$placeholder) {
            return
        }
        this._$placeholder.toggleClass(STATE_INVISIBLE_CLASS, !isEmpty)
    },
    _renderProps: function() {
        this._toggleReadOnlyState();
        this._toggleSpellcheckState();
        this._toggleTabIndex()
    },
    _toggleDisabledState: function(value) {
        this.callBase.apply(this, arguments);
        var $input = this._input();
        if (value) {
            $input.attr("disabled", true)
        } else {
            $input.removeAttr("disabled")
        }
    },
    _toggleTabIndex: function() {
        var $input = this._input(),
            disabled = this.option("disabled"),
            focusStateEnabled = this.option("focusStateEnabled");
        if (disabled || !focusStateEnabled) {
            $input.attr("tabIndex", -1)
        } else {
            $input.removeAttr("tabIndex")
        }
    },
    _toggleReadOnlyState: function() {
        this._input().prop("readOnly", this._readOnlyPropValue());
        this.callBase()
    },
    _readOnlyPropValue: function() {
        return this.option("readOnly")
    },
    _toggleSpellcheckState: function() {
        this._input().prop("spellcheck", this.option("spellcheck"))
    },
    _renderPlaceholder: function() {
        this._renderPlaceholderMarkup();
        this._attachPlaceholderEvents()
    },
    _renderPlaceholderMarkup: function() {
        if (this._$placeholder) {
            this._$placeholder.remove();
            this._$placeholder = null
        }
        var $input = this._input(),
            placeholderText = this.option("placeholder"),
            $placeholder = this._$placeholder = $("<div>").attr("data-dx_placeholder", placeholderText);
        $placeholder.insertAfter($input);
        $placeholder.addClass(TEXTEDITOR_PLACEHOLDER_CLASS)
    },
    _attachPlaceholderEvents: function() {
        var that = this,
            startEvent = eventUtils.addNamespace(pointerEvents.up, that.NAME);
        eventsEngine.on(that._$placeholder, startEvent, function() {
            eventsEngine.trigger(that._input(), "focus")
        });
        that._toggleEmptinessEventHandler()
    },
    _placeholder: function() {
        return this._$placeholder || $()
    },
    _renderInputAddons: function() {
        this._renderClearButton()
    },
    _renderClearButton: function() {
        var clearButtonVisibility = this._clearButtonVisibility();
        this.$element().toggleClass(TEXTEDITOR_SHOW_CLEAR_BUTTON_CLASS, clearButtonVisibility);
        if (clearButtonVisibility) {
            if (!this._$clearButton || this._$clearButton && !this._$clearButton.closest(this.$element()).length) {
                this._$clearButton = this._createClearButton()
            }
            this._$clearButton.prependTo(this._buttonsContainer())
        }
        if (this._$clearButton) {
            this._$clearButton.toggleClass(STATE_INVISIBLE_CLASS, !clearButtonVisibility)
        }
    },
    _clearButtonVisibility: function() {
        return this.option("showClearButton") && !this.option("readOnly")
    },
    _createClearButton: function() {
        var $clearButton = $("<span>").addClass(TEXTEDITOR_CLEAR_BUTTON_CLASS).append($("<span>").addClass(TEXTEDITOR_ICON_CLASS).addClass(TEXTEDITOR_CLEAR_ICON_CLASS));
        eventsEngine.on($clearButton, eventUtils.addNamespace(pointerEvents.down, this.NAME), function(e) {
            if ("mouse" === e.pointerType) {
                e.preventDefault()
            }
        });
        eventsEngine.on($clearButton, eventUtils.addNamespace(clickEvent.name, this.NAME), this._clearValueHandler.bind(this));
        return $clearButton
    },
    _clearValueHandler: function(e) {
        var $input = this._input();
        e.stopPropagation();
        this._saveValueChangeEvent(e);
        this.reset();
        !this._isFocused() && eventsEngine.trigger($input, "focus");
        eventsEngine.trigger($input, "input")
    },
    _renderEvents: function() {
        var that = this,
            $input = that._input();
        each(EVENTS_LIST, function(_, event) {
            if (that.hasActionSubscription("on" + event)) {
                var action = that._createActionByOption("on" + event, {
                    excludeValidators: ["readOnly"]
                });
                eventsEngine.on($input, eventUtils.addNamespace(event.toLowerCase(), that.NAME), function(e) {
                    if (that._disposed) {
                        return
                    }
                    action({
                        event: e
                    })
                })
            }
        })
    },
    _refreshEvents: function() {
        var that = this,
            $input = this._input();
        each(EVENTS_LIST, function(_, event) {
            eventsEngine.off($input, eventUtils.addNamespace(event.toLowerCase(), that.NAME))
        });
        this._renderEvents()
    },
    _keyPressHandler: function() {
        this.option("text", this._input().val())
    },
    _renderValueChangeEvent: function() {
        var keyPressEvent = eventUtils.addNamespace(this._renderValueEventName(), this.NAME + "TextChange"),
            valueChangeEvent = eventUtils.addNamespace(this.option("valueChangeEvent"), this.NAME + "ValueChange");
        eventsEngine.on(this._input(), keyPressEvent, this._keyPressHandler.bind(this));
        eventsEngine.on(this._input(), valueChangeEvent, this._valueChangeEventHandler.bind(this))
    },
    _cleanValueChangeEvent: function() {
        var eventNamespace = this.NAME + "ValueChange",
            keyPressEvent = eventUtils.addNamespace(this._renderValueEventName(), this.NAME + "TextChange");
        eventsEngine.off(this._input(), "." + eventNamespace);
        eventsEngine.off(this._input(), keyPressEvent)
    },
    _refreshValueChangeEvent: function() {
        this._cleanValueChangeEvent();
        this._renderValueChangeEvent()
    },
    _renderValueEventName: function() {
        return "input change keypress"
    },
    _focusTarget: function() {
        return this._input()
    },
    _focusClassTarget: function() {
        return this.$element()
    },
    _toggleFocusClass: function(isFocused, $element) {
        this.callBase(isFocused, this._focusClassTarget($element))
    },
    _hasFocusClass: function(element) {
        return this.callBase($(element || this.$element()))
    },
    _renderEmptinessEvent: function() {
        var $input = this._input();
        eventsEngine.on($input, "input blur", this._toggleEmptinessEventHandler.bind(this))
    },
    _toggleEmptinessEventHandler: function() {
        var text = this._input().val(),
            isEmpty = ("" === text || null === text) && this._isValueValid();
        this._toggleEmptiness(isEmpty)
    },
    _valueChangeEventHandler: function(e, formattedValue) {
        this._saveValueChangeEvent(e);
        this.option("value", arguments.length > 1 ? formattedValue : this._input().val());
        this._saveValueChangeEvent(void 0)
    },
    _renderEnterKeyAction: function() {
        this._enterKeyAction = this._createActionByOption("onEnterKey", {
            excludeValidators: ["readOnly"]
        });
        eventsEngine.off(this._input(), "keyup.onEnterKey.dxTextEditor");
        eventsEngine.on(this._input(), "keyup.onEnterKey.dxTextEditor", this._enterKeyHandlerUp.bind(this))
    },
    _enterKeyHandlerUp: function(e) {
        if (this._disposed) {
            return
        }
        if ("enter" === eventUtils.normalizeKeyName(e)) {
            this._enterKeyAction({
                event: e
            })
        }
    },
    _updateValue: function() {
        this.option("text", void 0);
        this._renderValue()
    },
    _dispose: function() {
        this._enterKeyAction = void 0;
        this.callBase()
    },
    _getSubmitElement: function() {
        return this._input()
    },
    _optionChanged: function(args) {
        var name = args.name;
        if (inArray(name.replace("on", ""), EVENTS_LIST) > -1) {
            this._refreshEvents();
            return
        }
        switch (name) {
            case "valueChangeEvent":
                this._refreshValueChangeEvent();
                this._refreshFocusEvent();
                this._refreshEvents();
                break;
            case "onValueChanged":
                this._createValueChangeAction();
                break;
            case "readOnly":
                this.callBase(args);
                this._renderInputAddons();
                break;
            case "focusStateEnabled":
                this.callBase(args);
                this._toggleTabIndex();
                break;
            case "spellcheck":
                this._toggleSpellcheckState();
                break;
            case "mode":
                this._renderInputType();
                break;
            case "onEnterKey":
                this._renderEnterKeyAction();
                break;
            case "placeholder":
                this._renderPlaceholder();
                break;
            case "showClearButton":
                this._renderInputAddons();
                break;
            case "text":
                break;
            case "value":
                this._updateValue();
                this.callBase(args);
                break;
            case "inputAttr":
                this._applyInputAttributes(this._input(), args.value);
                break;
            case "stylingMode":
                this._renderStylingMode();
                break;
            case "valueFormat":
                this._invalidate();
                break;
            default:
                this.callBase(args)
        }
    },
    _renderInputType: function() {
        this._setInputType(this.option("mode"))
    },
    _setInputType: function(type) {
        var input = this._input();
        if ("search" === type) {
            type = "text"
        }
        try {
            input.prop("type", type)
        } catch (e) {
            input.prop("type", "text")
        }
    },
    focus: function() {
        eventsEngine.trigger(this._input(), "focus")
    },
    blur: function() {
        if (this._input().is(domAdapter.getActiveElement())) {
            domUtils.resetActiveElement()
        }
    },
    reset: function() {
        var defaultOptions = this._getDefaultOptions();
        if (this.option("value") === defaultOptions.value) {
            this.option("text", "");
            this._renderValue()
        } else {
            this.option("value", defaultOptions.value)
        }
    },
    on: function(eventName, eventHandler) {
        var result = this.callBase(eventName, eventHandler),
            event = eventName.charAt(0).toUpperCase() + eventName.substr(1);
        if (EVENTS_LIST.indexOf(event) >= 0) {
            this._refreshEvents()
        }
        return result
    }
});
module.exports = TextEditorBase;
