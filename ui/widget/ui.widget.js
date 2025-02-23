/**
 * DevExtreme (ui/widget/ui.widget.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    eventsEngine = require("../../events/core/events_engine"),
    errors = require("./ui.errors"),
    Action = require("../../core/action"),
    extend = require("../../core/utils/extend").extend,
    inArray = require("../../core/utils/array").inArray,
    each = require("../../core/utils/iterator").each,
    commonUtils = require("../../core/utils/common"),
    typeUtils = require("../../core/utils/type"),
    domUtils = require("../../core/utils/dom"),
    domAdapter = require("../../core/dom_adapter"),
    devices = require("../../core/devices"),
    DOMComponent = require("../../core/dom_component"),
    Template = require("./template"),
    TemplateBase = require("./ui.template_base"),
    FunctionTemplate = require("./function_template"),
    EmptyTemplate = require("./empty_template"),
    ChildDefaultTemplate = require("./child_default_template"),
    KeyboardProcessor = require("./ui.keyboard_processor"),
    selectors = require("./selectors"),
    eventUtils = require("../../events/utils"),
    hoverEvents = require("../../events/hover"),
    feedbackEvents = require("../../events/core/emitter.feedback"),
    clickEvent = require("../../events/click"),
    inflector = require("../../core/utils/inflector");
var UI_FEEDBACK = "UIFeedback",
    WIDGET_CLASS = "dx-widget",
    ACTIVE_STATE_CLASS = "dx-state-active",
    DISABLED_STATE_CLASS = "dx-state-disabled",
    INVISIBLE_STATE_CLASS = "dx-state-invisible",
    HOVER_STATE_CLASS = "dx-state-hover",
    FOCUSED_STATE_CLASS = "dx-state-focused",
    FEEDBACK_SHOW_TIMEOUT = 30,
    FEEDBACK_HIDE_TIMEOUT = 400,
    FOCUS_NAMESPACE = "Focus",
    ANONYMOUS_TEMPLATE_NAME = "template",
    TEXT_NODE = 3,
    TEMPLATE_SELECTOR = "[data-options*='dxTemplate']",
    TEMPLATE_WRAPPER_CLASS = "dx-template-wrapper";
var DX_POLYMORPH_WIDGET_TEMPLATE = new FunctionTemplate(function(options) {
    var widgetName = options.model.widget;
    if (widgetName) {
        var widgetElement = $("<div>"),
            widgetOptions = options.model.options || {};
        if ("button" === widgetName || "tabs" === widgetName || "dropDownMenu" === widgetName) {
            var deprecatedName = widgetName;
            widgetName = inflector.camelize("dx-" + widgetName);
            errors.log("W0001", "dxToolbar - 'widget' item field", deprecatedName, "16.1", "Use: '" + widgetName + "' instead")
        }
        if (options.parent) {
            options.parent._createComponent(widgetElement, widgetName, widgetOptions)
        } else {
            widgetElement[widgetName](widgetOptions)
        }
        return widgetElement
    }
    return $()
});
var Widget = DOMComponent.inherit({
    _supportedKeys: function() {
        return {}
    },
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            disabled: false,
            visible: true,
            hint: void 0,
            activeStateEnabled: false,
            onContentReady: null,
            hoverStateEnabled: false,
            focusStateEnabled: false,
            tabIndex: 0,
            accessKey: null,
            onFocusIn: null,
            onFocusOut: null,
            integrationOptions: {
                watchMethod: function(fn, callback, options) {
                    options = options || {};
                    if (!options.skipImmediate) {
                        callback(fn())
                    }
                    return commonUtils.noop
                },
                templates: {
                    "dx-polymorph-widget": DX_POLYMORPH_WIDGET_TEMPLATE
                },
                createTemplate: function(element) {
                    return new Template(element)
                }
            },
            _keyboardProcessor: void 0
        })
    },
    _feedbackShowTimeout: FEEDBACK_SHOW_TIMEOUT,
    _feedbackHideTimeout: FEEDBACK_HIDE_TIMEOUT,
    _init: function() {
        this.callBase();
        this._tempTemplates = [];
        this._defaultTemplates = {};
        this._initTemplates();
        this._initContentReadyAction()
    },
    _initTemplates: function() {
        this._extractTemplates();
        this._extractAnonymousTemplate()
    },
    _clearInnerOptionCache: function(optionContainer) {
        this[optionContainer + "Cache"] = {}
    },
    _cacheInnerOptions: function(optionContainer, optionValue) {
        var cacheName = optionContainer + "Cache";
        this[cacheName] = extend(this[cacheName], optionValue)
    },
    _getInnerOptionsCache: function(optionContainer) {
        return this[optionContainer + "Cache"]
    },
    _initInnerOptionCache: function(optionContainer) {
        this._clearInnerOptionCache(optionContainer);
        this._cacheInnerOptions(optionContainer, this.option(optionContainer))
    },
    _bindInnerWidgetOptions: function(innerWidget, optionsContainer) {
        this._options[optionsContainer] = extend({}, innerWidget.option());
        innerWidget.on("optionChanged", function(e) {
            this._options[optionsContainer] = extend({}, e.component.option())
        }.bind(this))
    },
    _extractTemplates: function() {
        var templateElements = this.$element().contents().filter(TEMPLATE_SELECTOR);
        var templatesMap = {};
        templateElements.each(function(_, template) {
            var templateOptions = domUtils.getElementOptions(template).dxTemplate;
            if (!templateOptions) {
                return
            }
            if (!templateOptions.name) {
                throw errors.Error("E0023")
            }
            $(template).addClass(TEMPLATE_WRAPPER_CLASS).detach();
            templatesMap[templateOptions.name] = templatesMap[templateOptions.name] || [];
            templatesMap[templateOptions.name].push(template)
        });
        each(templatesMap, function(templateName, value) {
            var deviceTemplate = this._findTemplateByDevice(value);
            if (deviceTemplate) {
                this._saveTemplate(templateName, deviceTemplate)
            }
        }.bind(this))
    },
    _saveTemplate: function(name, template) {
        var templates = this.option("integrationOptions.templates");
        templates[name] = this._createTemplate(template)
    },
    _findTemplateByDevice: function(templates) {
        var suitableTemplate = commonUtils.findBestMatches(devices.current(), templates, function(template) {
            return domUtils.getElementOptions(template).dxTemplate
        })[0];
        each(templates, function(index, template) {
            if (template !== suitableTemplate) {
                $(template).remove()
            }
        });
        return suitableTemplate
    },
    _extractAnonymousTemplate: function() {
        var templates = this.option("integrationOptions.templates"),
            anonymousTemplateName = this._getAnonymousTemplateName(),
            $anonymousTemplate = this.$element().contents().detach();
        var $notJunkTemplateContent = $anonymousTemplate.filter(function(_, element) {
                var isTextNode = element.nodeType === TEXT_NODE,
                    isEmptyText = $(element).text().trim().length < 1;
                return !(isTextNode && isEmptyText)
            }),
            onlyJunkTemplateContent = $notJunkTemplateContent.length < 1;
        if (!templates[anonymousTemplateName] && !onlyJunkTemplateContent) {
            templates[anonymousTemplateName] = this._createTemplate($anonymousTemplate)
        }
    },
    _getAriaTarget: function() {
        return this._focusTarget()
    },
    _getAnonymousTemplateName: function() {
        return ANONYMOUS_TEMPLATE_NAME
    },
    _getTemplateByOption: function(optionName) {
        return this._getTemplate(this.option(optionName))
    },
    _getTemplate: function(templateSource) {
        if (typeUtils.isFunction(templateSource)) {
            return new FunctionTemplate(function(options) {
                var templateSourceResult = templateSource.apply(this, this._getNormalizedTemplateArgs(options));
                if (!typeUtils.isDefined(templateSourceResult)) {
                    return new EmptyTemplate
                }
                var dispose = false;
                var template = this._acquireTemplate(templateSourceResult, function(templateSource) {
                    if (templateSource.nodeType || typeUtils.isRenderer(templateSource) && !$(templateSource).is("script")) {
                        return new FunctionTemplate(function() {
                            return templateSource
                        })
                    }
                    dispose = true;
                    return this._createTemplate(templateSource)
                }.bind(this));
                var result = template.render(options);
                dispose && template.dispose && template.dispose();
                return result
            }.bind(this))
        }
        return this._acquireTemplate(templateSource, this._createTemplateIfNeeded.bind(this))
    },
    _acquireTemplate: function(templateSource, createTemplate) {
        if (null == templateSource) {
            return new EmptyTemplate
        }
        if (templateSource instanceof ChildDefaultTemplate) {
            return this._defaultTemplates[templateSource.name]
        }
        if (templateSource instanceof TemplateBase) {
            return templateSource
        }
        if (typeUtils.isFunction(templateSource.render) && !typeUtils.isRenderer(templateSource)) {
            return this._addOneRenderedCall(templateSource)
        }
        if (templateSource.nodeType || typeUtils.isRenderer(templateSource)) {
            return createTemplate($(templateSource))
        }
        if ("string" === typeof templateSource) {
            return this._renderIntegrationTemplate(templateSource) || this._defaultTemplates[templateSource] || createTemplate(templateSource)
        }
        return this._acquireTemplate(templateSource.toString(), createTemplate)
    },
    _addOneRenderedCall: function(template) {
        var _render = template.render.bind(template);
        return extend({}, template, {
            render: function(options) {
                var templateResult = _render(options);
                options && options.onRendered && options.onRendered();
                return templateResult
            }
        })
    },
    _renderIntegrationTemplate: function(templateSource) {
        var integrationTemplate = this.option("integrationOptions.templates")[templateSource];
        if (integrationTemplate && !(integrationTemplate instanceof TemplateBase)) {
            var isAsyncTemplate = this.option("templatesRenderAsynchronously");
            if (!isAsyncTemplate) {
                return this._addOneRenderedCall(integrationTemplate)
            }
        }
        return integrationTemplate
    },
    _createTemplateIfNeeded: function(templateSource) {
        var templateKey = function(templateSource) {
            return typeUtils.isRenderer(templateSource) && templateSource[0] || templateSource
        };
        var cachedTemplate = this._tempTemplates.filter(function(t) {
            templateSource = templateKey(templateSource);
            return t.source === templateSource
        })[0];
        if (cachedTemplate) {
            return cachedTemplate.template
        }
        var template = this._createTemplate(templateSource);
        this._tempTemplates.push({
            template: template,
            source: templateKey(templateSource)
        });
        return template
    },
    _createTemplate: function(templateSource) {
        templateSource = "string" === typeof templateSource ? domUtils.normalizeTemplateElement(templateSource) : templateSource;
        return this.option("integrationOptions.createTemplate")(templateSource)
    },
    _getNormalizedTemplateArgs: function(options) {
        var args = [];
        if ("model" in options) {
            args.push(options.model)
        }
        if ("index" in options) {
            args.push(options.index)
        }
        args.push(options.container);
        return args
    },
    _cleanTemplates: function() {
        this._tempTemplates.forEach(function(t) {
            t.template.dispose && t.template.dispose()
        });
        this._tempTemplates = []
    },
    _initContentReadyAction: function() {
        this._contentReadyAction = this._createActionByOption("onContentReady", {
            excludeValidators: ["designMode", "disabled", "readOnly"]
        })
    },
    _initMarkup: function() {
        this.$element().addClass(WIDGET_CLASS);
        this._toggleDisabledState(this.option("disabled"));
        this._toggleVisibility(this.option("visible"));
        this._renderHint();
        if (this._isFocusable()) {
            this._renderFocusTarget()
        }
        this.callBase()
    },
    _render: function() {
        this.callBase();
        this._renderContent();
        this._renderFocusState();
        this._attachFeedbackEvents();
        this._attachHoverEvents()
    },
    _renderHint: function() {
        domUtils.toggleAttr(this.$element(), "title", this.option("hint"))
    },
    _renderContent: function() {
        var _this = this;
        commonUtils.deferRender(function() {
            if (_this._disposed) {
                return
            }
            return _this._renderContentImpl()
        }).done(function() {
            if (_this._disposed) {
                return
            }
            _this._fireContentReadyAction()
        })
    },
    _renderContentImpl: commonUtils.noop,
    _fireContentReadyAction: commonUtils.deferRenderer(function() {
        this._contentReadyAction()
    }),
    _dispose: function() {
        this._cleanTemplates();
        this._contentReadyAction = null;
        this.callBase()
    },
    _resetActiveState: function() {
        this._toggleActiveState(this._eventBindingTarget(), false)
    },
    _clean: function() {
        this._cleanFocusState();
        this._resetActiveState();
        this.callBase();
        this.$element().empty()
    },
    _toggleVisibility: function(visible) {
        this.$element().toggleClass(INVISIBLE_STATE_CLASS, !visible);
        this.setAria("hidden", !visible || void 0)
    },
    _renderFocusState: function() {
        this._attachKeyboardEvents();
        if (!this._isFocusable()) {
            return
        }
        this._renderFocusTarget();
        this._attachFocusEvents();
        this._renderAccessKey()
    },
    _renderAccessKey: function() {
        var focusTarget = this._focusTarget();
        focusTarget.attr("accesskey", this.option("accessKey"));
        var clickNamespace = eventUtils.addNamespace(clickEvent.name, UI_FEEDBACK);
        eventsEngine.off(focusTarget, clickNamespace);
        this.option("accessKey") && eventsEngine.on(focusTarget, clickNamespace, function(e) {
            if (eventUtils.isFakeClickEvent(e)) {
                e.stopImmediatePropagation();
                this.focus()
            }
        }.bind(this))
    },
    _isFocusable: function() {
        return this.option("focusStateEnabled") && !this.option("disabled")
    },
    _eventBindingTarget: function() {
        return this.$element()
    },
    _focusTarget: function() {
        return this._getActiveElement()
    },
    _getActiveElement: function() {
        var activeElement = this._eventBindingTarget();
        if (this._activeStateUnit) {
            activeElement = activeElement.find(this._activeStateUnit).not("." + DISABLED_STATE_CLASS)
        }
        return activeElement
    },
    _renderFocusTarget: function() {
        this._focusTarget().attr("tabIndex", this.option("tabIndex"))
    },
    _keyboardEventBindingTarget: function() {
        return this._eventBindingTarget()
    },
    _detachFocusEvents: function() {
        var $element = this._focusTarget(),
            namespace = this.NAME + FOCUS_NAMESPACE,
            focusEvents = eventUtils.addNamespace("focusin", namespace);
        focusEvents = focusEvents + " " + eventUtils.addNamespace("focusout", namespace);
        if (domAdapter.hasDocumentProperty("onbeforeactivate")) {
            focusEvents = focusEvents + " " + eventUtils.addNamespace("beforeactivate", namespace)
        }
        eventsEngine.off($element, focusEvents)
    },
    _attachFocusEvents: function() {
        var namespace = this.NAME + FOCUS_NAMESPACE,
            focusInEvent = eventUtils.addNamespace("focusin", namespace),
            focusOutEvent = eventUtils.addNamespace("focusout", namespace);
        var $focusTarget = this._focusTarget();
        eventsEngine.on($focusTarget, focusInEvent, this._focusInHandler.bind(this));
        eventsEngine.on($focusTarget, focusOutEvent, this._focusOutHandler.bind(this));
        if (domAdapter.hasDocumentProperty("onbeforeactivate")) {
            var beforeActivateEvent = eventUtils.addNamespace("beforeactivate", namespace);
            eventsEngine.on(this._focusTarget(), beforeActivateEvent, function(e) {
                if (!$(e.target).is(selectors.focusable)) {
                    e.preventDefault()
                }
            })
        }
    },
    _refreshFocusEvent: function() {
        this._detachFocusEvents();
        this._attachFocusEvents()
    },
    _focusInHandler: function(e) {
        var that = this;
        that._createActionByOption("onFocusIn", {
            beforeExecute: function() {
                that._updateFocusState(e, true)
            },
            excludeValidators: ["readOnly"]
        })({
            event: e
        })
    },
    _focusOutHandler: function(e) {
        var that = this;
        that._createActionByOption("onFocusOut", {
            beforeExecute: function() {
                that._updateFocusState(e, false)
            },
            excludeValidators: ["readOnly", "disabled"]
        })({
            event: e
        })
    },
    _updateFocusState: function(e, isFocused) {
        var target = e.target;
        if (inArray(target, this._focusTarget()) !== -1) {
            this._toggleFocusClass(isFocused, $(target))
        }
    },
    _toggleFocusClass: function(isFocused, $element) {
        var $focusTarget = $element && $element.length ? $element : this._focusTarget();
        $focusTarget.toggleClass(FOCUSED_STATE_CLASS, isFocused)
    },
    _hasFocusClass: function(element) {
        var $focusTarget = $(element || this._focusTarget());
        return $focusTarget.hasClass(FOCUSED_STATE_CLASS)
    },
    _isFocused: function() {
        return this._hasFocusClass()
    },
    _attachKeyboardEvents: function() {
        var processor = this.option("_keyboardProcessor");
        if (processor) {
            this._keyboardProcessor = processor.reinitialize(this._keyboardHandler, this)
        } else {
            if (this.option("focusStateEnabled")) {
                this._disposeKeyboardProcessor();
                this._keyboardProcessor = new KeyboardProcessor({
                    element: this._keyboardEventBindingTarget(),
                    handler: this._keyboardHandler,
                    focusTarget: this._focusTarget(),
                    context: this
                })
            }
        }
    },
    _keyboardHandler: function(options) {
        var e = options.originalEvent;
        var keyName = options.keyName;
        var keyCode = options.which;
        var keys = this._supportedKeys(e),
            func = keys[keyName] || keys[keyCode];
        if (void 0 !== func) {
            var handler = func.bind(this);
            return handler(e) || false
        } else {
            return true
        }
    },
    _refreshFocusState: function() {
        this._cleanFocusState();
        this._renderFocusState()
    },
    _cleanFocusState: function() {
        var $element = this._focusTarget();
        this._detachFocusEvents();
        this._toggleFocusClass(false);
        $element.removeAttr("tabIndex");
        this._disposeKeyboardProcessor()
    },
    _disposeKeyboardProcessor: function() {
        if (this._keyboardProcessor) {
            this._keyboardProcessor.dispose();
            delete this._keyboardProcessor
        }
    },
    _attachHoverEvents: function() {
        var that = this,
            hoverableSelector = that._activeStateUnit,
            nameStart = eventUtils.addNamespace(hoverEvents.start, UI_FEEDBACK),
            nameEnd = eventUtils.addNamespace(hoverEvents.end, UI_FEEDBACK);
        eventsEngine.off(that._eventBindingTarget(), nameStart, hoverableSelector);
        eventsEngine.off(that._eventBindingTarget(), nameEnd, hoverableSelector);
        if (that.option("hoverStateEnabled")) {
            var startAction = new Action(function(args) {
                that._hoverStartHandler(args.event);
                that._refreshHoveredElement($(args.element))
            }, {
                excludeValidators: ["readOnly"]
            });
            var $eventBindingTarget = that._eventBindingTarget();
            eventsEngine.on($eventBindingTarget, nameStart, hoverableSelector, function(e) {
                startAction.execute({
                    element: $(e.target),
                    event: e
                })
            });
            eventsEngine.on($eventBindingTarget, nameEnd, hoverableSelector, function(e) {
                that._hoverEndHandler(e);
                that._forgetHoveredElement()
            })
        } else {
            that._toggleHoverClass(false)
        }
    },
    _hoverStartHandler: commonUtils.noop,
    _hoverEndHandler: commonUtils.noop,
    _attachFeedbackEvents: function() {
        var feedbackAction, feedbackActionDisabled, that = this,
            feedbackSelector = that._activeStateUnit,
            activeEventName = eventUtils.addNamespace(feedbackEvents.active, UI_FEEDBACK),
            inactiveEventName = eventUtils.addNamespace(feedbackEvents.inactive, UI_FEEDBACK);
        eventsEngine.off(that._eventBindingTarget(), activeEventName, feedbackSelector);
        eventsEngine.off(that._eventBindingTarget(), inactiveEventName, feedbackSelector);
        if (that.option("activeStateEnabled")) {
            var feedbackActionHandler = function(args) {
                var $element = $(args.element),
                    value = args.value,
                    dxEvent = args.event;
                that._toggleActiveState($element, value, dxEvent)
            };
            eventsEngine.on(that._eventBindingTarget(), activeEventName, feedbackSelector, {
                timeout: that._feedbackShowTimeout
            }, function(e) {
                feedbackAction = feedbackAction || new Action(feedbackActionHandler);
                feedbackAction.execute({
                    element: $(e.currentTarget),
                    value: true,
                    event: e
                })
            });
            eventsEngine.on(that._eventBindingTarget(), inactiveEventName, feedbackSelector, {
                timeout: that._feedbackHideTimeout
            }, function(e) {
                feedbackActionDisabled = feedbackActionDisabled || new Action(feedbackActionHandler, {
                    excludeValidators: ["disabled", "readOnly"]
                });
                feedbackActionDisabled.execute({
                    element: $(e.currentTarget),
                    value: false,
                    event: e
                })
            })
        }
    },
    _toggleActiveState: function($element, value) {
        this._toggleHoverClass(!value);
        $element.toggleClass(ACTIVE_STATE_CLASS, value)
    },
    _refreshHoveredElement: function(hoveredElement) {
        var selector = this._activeStateUnit || this._eventBindingTarget();
        this._forgetHoveredElement();
        this._hoveredElement = hoveredElement.closest(selector);
        this._toggleHoverClass(true)
    },
    _forgetHoveredElement: function() {
        this._toggleHoverClass(false);
        delete this._hoveredElement
    },
    _toggleHoverClass: function(value) {
        if (this._hoveredElement) {
            this._hoveredElement.toggleClass(HOVER_STATE_CLASS, value && this.option("hoverStateEnabled"))
        }
    },
    _toggleDisabledState: function(value) {
        this.$element().toggleClass(DISABLED_STATE_CLASS, Boolean(value));
        this._toggleHoverClass(!value);
        this.setAria("disabled", value || void 0)
    },
    _setWidgetOption: function(widgetName, args) {
        if (!this[widgetName]) {
            return
        }
        if (typeUtils.isPlainObject(args[0])) {
            each(args[0], function(option, value) {
                this._setWidgetOption(widgetName, [option, value])
            }.bind(this));
            return
        }
        var optionName = args[0];
        var value = args[1];
        if (1 === args.length) {
            value = this.option(optionName)
        }
        var widgetOptionMap = this[widgetName + "OptionMap"];
        this[widgetName].option(widgetOptionMap ? widgetOptionMap(optionName) : optionName, value)
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "disabled":
                this._toggleDisabledState(args.value);
                this._refreshFocusState();
                break;
            case "hint":
                this._renderHint();
                break;
            case "activeStateEnabled":
                this._attachFeedbackEvents();
                break;
            case "hoverStateEnabled":
                this._attachHoverEvents();
                break;
            case "tabIndex":
            case "_keyboardProcessor":
            case "focusStateEnabled":
                this._refreshFocusState();
                break;
            case "onFocusIn":
            case "onFocusOut":
                break;
            case "accessKey":
                this._renderAccessKey();
                break;
            case "visible":
                var visible = args.value;
                this._toggleVisibility(visible);
                if (this._isVisibilityChangeSupported()) {
                    this._checkVisibilityChanged(args.value ? "shown" : "hiding")
                }
                break;
            case "onContentReady":
                this._initContentReadyAction();
                break;
            default:
                this.callBase(args)
        }
    },
    _isVisible: function() {
        return this.callBase() && this.option("visible")
    },
    beginUpdate: function() {
        this._ready(false);
        this.callBase()
    },
    endUpdate: function() {
        this.callBase();
        if (this._initialized) {
            this._ready(true)
        }
    },
    _ready: function(value) {
        if (0 === arguments.length) {
            return this._isReady
        }
        this._isReady = value
    },
    setAria: function() {
        var setAttribute = function(option) {
            var attrName = "role" === option.name || "id" === option.name ? option.name : "aria-" + option.name,
                attrValue = option.value;
            if (null === attrValue || void 0 === attrValue) {
                attrValue = void 0
            } else {
                attrValue = attrValue.toString()
            }
            domUtils.toggleAttr(option.target, attrName, attrValue)
        };
        if (!typeUtils.isPlainObject(arguments[0])) {
            setAttribute({
                name: arguments[0],
                value: arguments[1],
                target: arguments[2] || this._getAriaTarget()
            })
        } else {
            var $target = arguments[1] || this._getAriaTarget();
            each(arguments[0], function(key, value) {
                setAttribute({
                    name: key,
                    value: value,
                    target: $target
                })
            })
        }
    },
    isReady: function() {
        return this._ready()
    },
    repaint: function() {
        this._refresh()
    },
    focus: function() {
        eventsEngine.trigger(this._focusTarget(), "focus")
    },
    registerKeyHandler: function(key, handler) {
        var currentKeys = this._supportedKeys(),
            addingKeys = {};
        addingKeys[key] = handler;
        this._supportedKeys = function() {
            return extend(currentKeys, addingKeys)
        }
    }
});
module.exports = Widget;
