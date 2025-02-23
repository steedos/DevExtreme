/**
 * DevExtreme (ui/html_editor/ui.html_editor.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _extend = require("../../core/utils/extend");
var _type = require("../../core/utils/type");
var _dom = require("../../core/utils/dom");
var _common = require("../../core/utils/common");
var _component_registrator = require("../../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _empty_template = require("../widget/empty_template");
var _empty_template2 = _interopRequireDefault(_empty_template);
var _editor = require("../editor/editor");
var _editor2 = _interopRequireDefault(_editor);
var _ui = require("../widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);
var _callbacks = require("../../core/utils/callbacks");
var _callbacks2 = _interopRequireDefault(_callbacks);
var _deferred = require("../../core/utils/deferred");
var _quill_registrator = require("./quill_registrator");
var _quill_registrator2 = _interopRequireDefault(_quill_registrator);
require("./converters/delta");
var _converterController = require("./converterController");
var _converterController2 = _interopRequireDefault(_converterController);
var _wordLists = require("./matchers/wordLists");
var _wordLists2 = _interopRequireDefault(_wordLists);
var _formDialog = require("./ui/formDialog");
var _formDialog2 = _interopRequireDefault(_formDialog);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var HTML_EDITOR_CLASS = "dx-htmleditor";
var QUILL_CONTAINER_CLASS = "dx-quill-container";
var HTML_EDITOR_SUBMIT_ELEMENT_CLASS = "dx-htmleditor-submit-element";
var HTML_EDITOR_CONTENT_CLASS = "dx-htmleditor-content";
var MARKDOWN_VALUE_TYPE = "markdown";
var ANONYMOUS_TEMPLATE_NAME = "htmlContent";
var HtmlEditor = _editor2.default.inherit({
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            focusStateEnabled: true,
            valueType: "html",
            placeholder: "",
            toolbar: null,
            variables: null,
            formDialogOptions: null
        })
    },
    _init: function() {
        this.callBase();
        this._cleanCallback = (0, _callbacks2.default)();
        this._contentInitializedCallback = (0, _callbacks2.default)()
    },
    _getAnonymousTemplateName: function() {
        return ANONYMOUS_TEMPLATE_NAME
    },
    _initTemplates: function() {
        this.callBase();
        this._defaultTemplates[ANONYMOUS_TEMPLATE_NAME] = new _empty_template2.default(this)
    },
    _focusTarget: function() {
        return this.$element().find("." + HTML_EDITOR_CONTENT_CLASS)
    },
    _focusInHandler: function() {
        this._toggleFocusClass(true, this.$element());
        this.callBase.apply(this, arguments)
    },
    _focusOutHandler: function() {
        this._toggleFocusClass(false, this.$element());
        this.callBase.apply(this, arguments)
    },
    _initMarkup: function() {
        this._$htmlContainer = (0, _renderer2.default)("<div>").addClass(QUILL_CONTAINER_CLASS);
        this.$element().addClass(HTML_EDITOR_CLASS).wrapInner(this._$htmlContainer);
        var template = this._getTemplate(ANONYMOUS_TEMPLATE_NAME);
        var transclude = true;
        this._$templateResult = template && template.render({
            container: (0, _dom.getPublicElement)(this._$htmlContainer),
            noModel: true,
            transclude: transclude
        });
        this._renderSubmitElement();
        this.callBase();
        this._updateContainerMarkup()
    },
    _renderSubmitElement: function() {
        this._$submitElement = (0, _renderer2.default)("<textarea>").addClass(HTML_EDITOR_SUBMIT_ELEMENT_CLASS).attr("hidden", true).appendTo(this.$element());
        this._setSubmitValue(this.option("value"))
    },
    _setSubmitValue: function(value) {
        this._getSubmitElement().val(value)
    },
    _getSubmitElement: function() {
        return this._$submitElement
    },
    _updateContainerMarkup: function() {
        var markup = this.option("value");
        if (this._isMarkdownValue()) {
            this._prepareMarkdownConverter();
            markup = this._markdownConverter.toHtml(markup)
        }
        if (markup) {
            this._$htmlContainer.html(markup)
        }
    },
    _prepareMarkdownConverter: function() {
        var MarkdownConverter = _converterController2.default.getConverter("markdown");
        if (MarkdownConverter) {
            this._markdownConverter = new MarkdownConverter
        } else {
            throw _ui2.default.Error("E1051", "markdown")
        }
    },
    _render: function() {
        this._prepareConverters();
        this.callBase()
    },
    _prepareQuillRegistrator: function() {
        if (!this._quillRegistrator) {
            this._quillRegistrator = new _quill_registrator2.default
        }
    },
    _getRegistrator: function() {
        this._prepareQuillRegistrator();
        return this._quillRegistrator
    },
    _prepareConverters: function() {
        if (!this._deltaConverter) {
            var DeltaConverter = _converterController2.default.getConverter("delta");
            if (DeltaConverter) {
                this._deltaConverter = new DeltaConverter
            }
        }
        if (this.option("valueType") === MARKDOWN_VALUE_TYPE && !this._markdownConverter) {
            this._prepareMarkdownConverter()
        }
    },
    _renderContentImpl: function() {
        this._contentRenderedDeferred = new _deferred.Deferred;
        var renderContentPromise = this._contentRenderedDeferred.promise();
        this.callBase();
        this._renderHtmlEditor();
        this._renderFormDialog();
        return renderContentPromise
    },
    _renderHtmlEditor: function() {
        var _this = this;
        var modulesConfig = this._getModulesConfig();
        this._quillInstance = this._getRegistrator().createEditor(this._$htmlContainer[0], {
            placeholder: this.option("placeholder"),
            readOnly: this.option("readOnly") || this.option("disabled"),
            modules: modulesConfig,
            theme: "basic"
        });
        this._deltaConverter.setQuillInstance(this._quillInstance);
        this._textChangeHandlerWithContext = this._textChangeHandler.bind(this);
        this._quillInstance.on("text-change", this._textChangeHandlerWithContext);
        if (this._hasTranscludedContent()) {
            this._updateContentTask = (0, _common.executeAsync)(function() {
                _this._applyTranscludedContent()
            })
        } else {
            this._finalizeContentRendering()
        }
    },
    _applyTranscludedContent: function() {
        var markup = this._deltaConverter.toHtml();
        var newDelta = this._quillInstance.clipboard.convert(markup);
        if (newDelta.ops.length) {
            this._quillInstance.setContents(newDelta)
        } else {
            this._finalizeContentRendering()
        }
    },
    _hasTranscludedContent: function() {
        return this._$templateResult && this._$templateResult.length
    },
    _getModulesConfig: function() {
        var wordListMatcher = (0, _wordLists2.default)(this._getRegistrator().getQuill());
        var modulesConfig = (0, _extend.extend)({
            toolbar: this._getModuleConfigByOption("toolbar"),
            variables: this._getModuleConfigByOption("variables"),
            dropImage: this._getBaseModuleConfig(),
            clipboard: {
                matchVisual: false,
                matchers: [
                    ["p.MsoListParagraphCxSpFirst", wordListMatcher],
                    ["p.MsoListParagraphCxSpMiddle", wordListMatcher],
                    ["p.MsoListParagraphCxSpLast", wordListMatcher]
                ]
            }
        }, this._getCustomModules());
        return modulesConfig
    },
    _getModuleConfigByOption: function(userOptionName) {
        var userConfig = this.option(userOptionName);
        if (!(0, _type.isDefined)(userConfig)) {
            return
        }
        return (0, _extend.extend)(this._getBaseModuleConfig(), userConfig)
    },
    _getBaseModuleConfig: function() {
        return {
            editorInstance: this
        }
    },
    _getCustomModules: function() {
        var _this2 = this;
        var modules = {};
        var moduleNames = this._getRegistrator().getRegisteredModuleNames();
        moduleNames.forEach(function(modulePath) {
            modules[modulePath] = _this2._getBaseModuleConfig()
        });
        return modules
    },
    _textChangeHandler: function(newDelta, oldDelta, source) {
        var htmlMarkup = this._deltaConverter.toHtml();
        var value = this._isMarkdownValue() ? this._updateValueByType(MARKDOWN_VALUE_TYPE, htmlMarkup) : htmlMarkup;
        if (this.option("value") !== value) {
            this._isEditorUpdating = true;
            this.option("value", value)
        }
        this._finalizeContentRendering()
    },
    _finalizeContentRendering: function() {
        if (this._contentRenderedDeferred) {
            this.clearHistory();
            this._contentInitializedCallback.fire();
            this._contentRenderedDeferred.resolve();
            this._contentRenderedDeferred = void 0
        }
    },
    _updateValueByType: function(valueType, value) {
        var converter = this._markdownConverter;
        if (!(0, _type.isDefined)(converter)) {
            return
        }
        var currentValue = value || this.option("value");
        return valueType === MARKDOWN_VALUE_TYPE ? converter.toMarkdown(currentValue) : converter.toHtml(currentValue)
    },
    _isMarkdownValue: function() {
        return this.option("valueType") === MARKDOWN_VALUE_TYPE
    },
    _resetEnabledState: function() {
        if (this._quillInstance) {
            var isEnabled = !(this.option("readOnly") || this.option("disabled"));
            this._quillInstance.enable(isEnabled)
        }
    },
    _renderFormDialog: function() {
        var userOptions = (0, _extend.extend)(true, {
            width: "auto",
            height: "auto",
            closeOnOutsideClick: true
        }, this.option("formDialogOptions"));
        this._formDialog = new _formDialog2.default(this, userOptions)
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "value":
                if (this._quillInstance) {
                    if (this._isEditorUpdating) {
                        this._isEditorUpdating = false
                    } else {
                        var updatedValue = this._isMarkdownValue() ? this._updateValueByType("HTML", args.value) : args.value;
                        this._updateHtmlContent(updatedValue)
                    }
                } else {
                    this._$htmlContainer.html(args.value)
                }
                this._setSubmitValue(args.value);
                this.callBase(args);
                break;
            case "placeholder":
            case "variables":
            case "toolbar":
                this._invalidate();
                break;
            case "valueType":
                this._prepareConverters();
                var newValue = this._updateValueByType(args.value);
                if ("html" === args.value && this._quillInstance) {
                    this._updateHtmlContent(newValue)
                } else {
                    this.option("value", newValue)
                }
                break;
            case "readOnly":
            case "disabled":
                this.callBase(args);
                this._resetEnabledState();
                break;
            case "formDialogOptions":
                this._renderFormDialog();
                break;
            default:
                this.callBase(args)
        }
    },
    _updateHtmlContent: function(newMarkup) {
        var newDelta = this._quillInstance.clipboard.convert(newMarkup);
        this._quillInstance.setContents(newDelta)
    },
    _clean: function() {
        if (this._quillInstance) {
            this._quillInstance.off("text-change", this._textChangeHandlerWithContext);
            this._cleanCallback.fire()
        }
        this._abortUpdateContentTask();
        this._cleanCallback.empty();
        this._contentInitializedCallback.empty();
        this.callBase()
    },
    _abortUpdateContentTask: function() {
        if (this._updateContentTask) {
            this._updateContentTask.abort();
            this._updateContentTask = void 0
        }
    },
    _applyQuillMethod: function(methodName, args) {
        if (this._quillInstance) {
            return this._quillInstance[methodName].apply(this._quillInstance, args)
        }
    },
    _applyQuillHistoryMethod: function(methodName) {
        if (this._quillInstance && this._quillInstance.history) {
            this._quillInstance.history[methodName]()
        }
    },
    addCleanCallback: function(callback) {
        this._cleanCallback.add(callback)
    },
    addContentInitializedCallback: function(callback) {
        this._contentInitializedCallback.add(callback)
    },
    registerModules: function(modules) {
        this._getRegistrator().registerModules(modules);
        this.repaint()
    },
    getModule: function(modulePath) {
        return this._getRegistrator().getQuill().import(modulePath)
    },
    getQuillInstance: function() {
        return this._quillInstance
    },
    getSelection: function() {
        return this._applyQuillMethod("getSelection")
    },
    setSelection: function(index, length) {
        this._applyQuillMethod("setSelection", arguments)
    },
    format: function(formatName, formatValue) {
        this._applyQuillMethod("format", arguments)
    },
    formatText: function(index, length, formatName, formatValue) {
        this._applyQuillMethod("formatText", arguments)
    },
    formatLine: function(index, length, formatName, formatValue) {
        this._applyQuillMethod("formatLine", arguments)
    },
    getFormat: function(index, length) {
        return this._applyQuillMethod("getFormat", arguments)
    },
    removeFormat: function(index, length) {
        return this._applyQuillMethod("removeFormat", arguments)
    },
    clearHistory: function() {
        this._applyQuillHistoryMethod("clear")
    },
    undo: function() {
        this._applyQuillHistoryMethod("undo")
    },
    redo: function() {
        this._applyQuillHistoryMethod("redo")
    },
    getLength: function() {
        return this._applyQuillMethod("getLength")
    },
    "delete": function(index, length) {
        this._applyQuillMethod("deleteText", arguments)
    },
    insertText: function(index, text, formats) {
        this._applyQuillMethod("insertText", arguments)
    },
    insertEmbed: function(index, type, config) {
        this._applyQuillMethod("insertEmbed", arguments)
    },
    showFormDialog: function(formConfig) {
        return this._formDialog.show(formConfig)
    },
    formDialogOption: function(optionName, optionValue) {
        return this._formDialog.popupOption.apply(this._formDialog, arguments)
    },
    focus: function() {
        this.callBase();
        this._applyQuillMethod("focus")
    }
});
(0, _component_registrator2.default)("dxHtmlEditor", HtmlEditor);
module.exports = HtmlEditor;
