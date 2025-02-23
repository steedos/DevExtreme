/**
 * DevExtreme (framework/html/html_application.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
require("../../integration/jquery");
var $ = require("jquery"),
    commonUtils = require("../../core/utils/common"),
    window = require("../../core/utils/window").getWindow(),
    domAdapter = require("../../core/dom_adapter"),
    Component = require("../../core/component"),
    extendUtils = require("../../core/utils/extend"),
    each = require("../../core/utils/iterator").each,
    errors = require("../errors"),
    Application = require("../application").Application,
    ConditionalViewCacheDecorator = require("../view_cache").ConditionalViewCacheDecorator,
    html = require("./presets"),
    CommandManager = require("./command_manager"),
    ViewEngine = require("./view_engine").ViewEngine,
    messageLocalization = require("../../localization/message"),
    viewPort = require("../../core/utils/view_port").value,
    initMobileViewportModule = require("../../mobile/init_mobile_viewport/init_mobile_viewport"),
    devices = require("../../core/devices"),
    feedbackEvents = require("../../events/core/emitter.feedback"),
    TransitionExecutorModule = require("../../animation/transition_executor/transition_executor"),
    animationPresetsModule = require("../../animation/presets/presets"),
    when = require("../../core/utils/deferred").when;
require("./layout_controller");
require("../../ui/themes");
var VIEW_PORT_CLASSNAME = "dx-viewport",
    LAYOUT_CHANGE_ANIMATION_NAME = "layout-change";
var HtmlApplication = Application.inherit({
    ctor: function(options) {
        options = options || {};
        this.callBase(options);
        this._$root = $(options.rootNode || domAdapter.getBody());
        this._initViewport(options.viewPort);
        if ("mobileApp" === this._applicationMode) {
            initMobileViewportModule.initMobileViewport(options.viewPort)
        }
        this.device = options.device || devices.current();
        this.commandManager = options.commandManager || new CommandManager({
            commandMapping: this.commandMapping
        });
        this._initTemplateContext();
        this.viewEngine = options.viewEngine || new ViewEngine({
            $root: this._$root,
            device: this.device,
            templateCacheStorage: options.templateCacheStorage || window.localStorage,
            templatesVersion: options.templatesVersion,
            templateContext: this._templateContext
        });
        this.components.push(this.viewEngine);
        this._initMarkupFilters(this.viewEngine);
        this._layoutSet = options.layoutSet || html.layoutSets.default;
        this._animationSet = options.animationSet || html.animationSets.default;
        this._availableLayoutControllers = [];
        this._activeLayoutControllersStack = [];
        this.transitionExecutor = new TransitionExecutorModule.TransitionExecutor;
        this._initAnimations(this._animationSet)
    },
    _initAnimations: function(animationSet) {
        if (!animationSet) {
            return
        }
        each(animationSet, function(name, configs) {
            each(configs, function(index, config) {
                animationPresetsModule.presets.registerPreset(name, config)
            })
        });
        animationPresetsModule.presets.applyChanges()
    },
    _localizeMarkup: function($markup) {
        messageLocalization.localizeNode($markup)
    },
    _notifyIfBadMarkup: function($markup) {
        $markup.each(function() {
            var html = $(this).html();
            if (/href="#/.test(html)) {
                errors.log("W3005", html)
            }
        })
    },
    _initMarkupFilters: function(viewEngine) {
        var filters = [];
        filters.push(this._localizeMarkup);
        if (viewEngine.markupLoaded) {
            viewEngine.markupLoaded.add(function(args) {
                each(filters, function(_, filter) {
                    filter(args.markup)
                })
            })
        }
    },
    _createViewCache: function(options) {
        var result = this.callBase(options);
        if (!options.viewCache) {
            result = new ConditionalViewCacheDecorator({
                filter: function(key, viewInfo) {
                    return !viewInfo.viewTemplateInfo.disableCache
                },
                viewCache: result
            })
        }
        return result
    },
    _initViewport: function() {
        this._$viewPort = this._getViewPort();
        viewPort(this._$viewPort)
    },
    _getViewPort: function() {
        var $viewPort = $("." + VIEW_PORT_CLASSNAME);
        if (!$viewPort.length) {
            $viewPort = $("<div>").addClass(VIEW_PORT_CLASSNAME).appendTo(this._$root)
        }
        return $viewPort
    },
    _initTemplateContext: function() {
        this._templateContext = new Component({
            orientation: devices.orientation()
        });
        devices.on("orientationChanged", function(args) {
            this._templateContext.option("orientation", args.orientation)
        }.bind(this))
    },
    _showViewImpl: function(viewInfo, direction) {
        var that = this,
            deferred = $.Deferred(),
            result = deferred.promise(),
            layoutController = viewInfo.layoutController;
        that._obtainViewLink(viewInfo);
        layoutController.showView(viewInfo, direction).done(function() {
            that._activateLayoutController(layoutController, that._getTargetNode(viewInfo), direction).done(function() {
                deferred.resolve()
            })
        });
        feedbackEvents.lock(result);
        return result
    },
    _resolveLayoutController: function(viewInfo) {
        var args = {
            viewInfo: viewInfo,
            layoutController: null,
            availableLayoutControllers: this._availableLayoutControllers
        };
        this._processEvent("resolveLayoutController", args, viewInfo.model);
        return args.layoutController || this._resolveLayoutControllerImpl(viewInfo)
    },
    _checkLayoutControllerIsInitialized: function(layoutController) {
        if (layoutController) {
            var isControllerInited = false;
            each(this._layoutSet, function(_, controllerInfo) {
                if (controllerInfo.controller === layoutController) {
                    isControllerInited = true;
                    return false
                }
            });
            if (!isControllerInited) {
                throw errors.Error("E3024")
            }
        }
    },
    _ensureOneLayoutControllerFound: function(target, matches) {
        var toJSONInterceptor = function(key, value) {
            if ("controller" === key) {
                return "[controller]: { name:" + value.name + " }"
            }
            return value
        };
        if (!matches.length) {
            errors.log("W3003", JSON.stringify(target, null, 4), JSON.stringify(this._availableLayoutControllers, toJSONInterceptor, 4));
            throw errors.Error("E3011")
        }
        if (matches.length > 1) {
            errors.log("W3004", JSON.stringify(target, null, 4), JSON.stringify(matches, toJSONInterceptor, 4));
            throw errors.Error("E3012")
        }
    },
    _resolveLayoutControllerImpl: function(viewInfo) {
        var templateInfo = viewInfo.viewTemplateInfo || {},
            navigateOptions = viewInfo.navigateOptions || {},
            target = extendUtils.extend({
                root: !viewInfo.canBack,
                customResolveRequired: false,
                pane: templateInfo.pane,
                modal: void 0 !== navigateOptions.modal ? navigateOptions.modal : templateInfo.modal || false
            }, devices.current());
        var matches = commonUtils.findBestMatches(target, this._availableLayoutControllers);
        this._ensureOneLayoutControllerFound(target, matches);
        return matches[0].controller
    },
    _onNavigatingBack: function(args) {
        this.callBase.apply(this, arguments);
        if (!args.cancel && !this.canBack() && this._activeLayoutControllersStack.length > 1) {
            var previousActiveLayoutController = this._activeLayoutControllersStack[this._activeLayoutControllersStack.length - 2],
                previousViewInfo = previousActiveLayoutController.activeViewInfo();
            args.cancel = true;
            this._activateLayoutController(previousActiveLayoutController, void 0, "backward");
            this.navigationManager.currentItem(previousViewInfo.key)
        }
    },
    _activeLayoutController: function() {
        return this._activeLayoutControllersStack.length ? this._activeLayoutControllersStack[this._activeLayoutControllersStack.length - 1] : void 0
    },
    _getTargetNode: function(viewInfo) {
        var dxEvent = (viewInfo.navigateOptions || {}).event;
        return dxEvent ? $(dxEvent.target) : void 0
    },
    _activateLayoutController: function(layoutController, targetNode, direction) {
        var that = this,
            previousLayoutController = that._activeLayoutController();
        if (previousLayoutController === layoutController) {
            return $.Deferred().resolve().promise()
        }
        var d = $.Deferred();
        layoutController.ensureActive(targetNode).done(function(result) {
            that._deactivatePreviousLayoutControllers(layoutController, direction, result).done(function() {
                that._activeLayoutControllersStack.push(layoutController);
                d.resolve()
            })
        });
        return d.promise()
    },
    _deactivatePreviousLayoutControllers: function(layoutController, direction) {
        var that = this,
            tasks = [],
            controllerToDeactivate = that._activeLayoutControllersStack.pop();
        if (!controllerToDeactivate) {
            return $.Deferred().resolve().promise()
        }
        if (layoutController.isOverlay) {
            that._activeLayoutControllersStack.push(controllerToDeactivate);
            tasks.push(controllerToDeactivate.disable())
        } else {
            var transitionDeferred = $.Deferred(),
                skipAnimation = false;
            var getControllerDeactivator = function(controllerToDeactivate, d) {
                return function() {
                    controllerToDeactivate.deactivate().done(function() {
                        d.resolve()
                    })
                }
            };
            while (controllerToDeactivate && controllerToDeactivate !== layoutController) {
                var d = $.Deferred();
                if (controllerToDeactivate.isOverlay) {
                    skipAnimation = true
                } else {
                    if (!skipAnimation) {
                        that.transitionExecutor.leave(controllerToDeactivate.element(), LAYOUT_CHANGE_ANIMATION_NAME, {
                            direction: direction
                        })
                    }
                }
                transitionDeferred.promise().done(getControllerDeactivator(controllerToDeactivate, d));
                tasks.push(d.promise());
                controllerToDeactivate = that._activeLayoutControllersStack.pop()
            }
            if (skipAnimation) {
                transitionDeferred.resolve()
            } else {
                that.transitionExecutor.enter(layoutController.element(), LAYOUT_CHANGE_ANIMATION_NAME, {
                    direction: direction
                });
                that.transitionExecutor.start().done(function() {
                    transitionDeferred.resolve()
                })
            }
        }
        return when.apply($, tasks)
    },
    init: function() {
        var that = this,
            result = this.callBase();
        result.done(function() {
            that._initLayoutControllers();
            that.renderNavigation()
        });
        return result
    },
    _disposeView: function(viewInfo) {
        if (viewInfo.layoutController.disposeView) {
            viewInfo.layoutController.disposeView(viewInfo)
        }
        this.callBase(viewInfo)
    },
    viewPort: function() {
        return this._$viewPort
    },
    _createViewInfo: function() {
        var viewInfo = this.callBase.apply(this, arguments),
            templateInfo = this.getViewTemplateInfo(viewInfo.viewName);
        if (!templateInfo) {
            throw errors.Error("E3013", "dxView", viewInfo.viewName)
        }
        viewInfo.viewTemplateInfo = templateInfo;
        viewInfo.layoutController = this._resolveLayoutController(viewInfo);
        return viewInfo
    },
    _createViewModel: function(viewInfo) {
        this.callBase(viewInfo);
        extendUtils.extendFromObject(viewInfo.model, viewInfo.viewTemplateInfo)
    },
    _initLayoutControllers: function() {
        var that = this;
        each(that._layoutSet, function(index, controllerInfo) {
            var controller = controllerInfo.controller,
                target = devices.current();
            if (commonUtils.findBestMatches(target, [controllerInfo]).length) {
                that._availableLayoutControllers.push(controllerInfo);
                if (controller.init) {
                    controller.init({
                        app: that,
                        $viewPort: that._$viewPort,
                        navigationManager: that.navigationManager,
                        viewEngine: that.viewEngine,
                        templateContext: that._templateContext,
                        commandManager: that.commandManager
                    })
                }
                if (controller.on) {
                    controller.on("viewReleased", function(viewInfo) {
                        that._onViewReleased(viewInfo)
                    });
                    controller.on("viewHidden", function(viewInfo) {
                        that._onViewHidden(viewInfo)
                    });
                    controller.on("viewRendered", function(viewInfo) {
                        that._processEvent("viewRendered", {
                            viewInfo: viewInfo
                        }, viewInfo.model)
                    });
                    controller.on("viewShowing", function(viewInfo, direction) {
                        that._processEvent("viewShowing", {
                            viewInfo: viewInfo,
                            direction: direction,
                            params: viewInfo.routeData
                        }, viewInfo.model)
                    });
                    controller.on("viewShown", function(viewInfo, direction) {
                        that._processEvent("viewShown", {
                            viewInfo: viewInfo,
                            direction: direction,
                            params: viewInfo.routeData
                        }, viewInfo.model)
                    })
                }
            }
        })
    },
    _onViewReleased: function(viewInfo) {
        this._releaseViewLink(viewInfo)
    },
    renderNavigation: function() {
        var that = this;
        each(that._availableLayoutControllers, function(index, controllerInfo) {
            var controller = controllerInfo.controller;
            if (controller.renderNavigation) {
                controller.renderNavigation(that.navigation)
            }
        })
    },
    getViewTemplate: function(viewName) {
        return this.viewEngine.getViewTemplate(viewName)
    },
    getViewTemplateInfo: function(viewName) {
        var viewComponent = this.viewEngine.getViewTemplateInfo(viewName);
        return viewComponent && viewComponent.option()
    },
    loadTemplates: function(source) {
        return this.viewEngine.loadTemplates(source)
    },
    templateContext: function() {
        return this._templateContext
    }
});
module.exports = HtmlApplication;
module.exports.default = module.exports;
