/**
 * DevExtreme (ui/list/ui.list.base.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    eventsEngine = require("../../events/core/events_engine"),
    commonUtils = require("../../core/utils/common"),
    typeUtils = require("../../core/utils/type"),
    iconUtils = require("../../core/utils/icon"),
    getPublicElement = require("../../core/utils/dom").getPublicElement,
    each = require("../../core/utils/iterator").each,
    compileGetter = require("../../core/utils/data").compileGetter,
    extend = require("../../core/utils/extend").extend,
    fx = require("../../animation/fx"),
    clickEvent = require("../../events/click"),
    swipeEvents = require("../../events/swipe"),
    support = require("../../core/utils/support"),
    messageLocalization = require("../../localization/message"),
    inkRipple = require("../widget/utils.ink_ripple"),
    devices = require("../../core/devices"),
    ListItem = require("./item"),
    Button = require("../button"),
    eventUtils = require("../../events/utils"),
    themes = require("../themes"),
    windowUtils = require("../../core/utils/window"),
    ScrollView = require("../scroll_view"),
    deviceDependentOptions = require("../scroll_view/ui.scrollable").deviceDependentOptions,
    CollectionWidget = require("../collection/ui.collection_widget.live_update").default,
    BindableTemplate = require("../widget/bindable_template"),
    Deferred = require("../../core/utils/deferred").Deferred,
    DataConverterMixin = require("../shared/grouped_data_converter_mixin").default;
var LIST_CLASS = "dx-list",
    LIST_ITEM_CLASS = "dx-list-item",
    LIST_ITEM_SELECTOR = "." + LIST_ITEM_CLASS,
    LIST_ITEM_ICON_CONTAINER_CLASS = "dx-list-item-icon-container",
    LIST_ITEM_ICON_CLASS = "dx-list-item-icon",
    LIST_GROUP_CLASS = "dx-list-group",
    LIST_GROUP_HEADER_CLASS = "dx-list-group-header",
    LIST_GROUP_BODY_CLASS = "dx-list-group-body",
    LIST_COLLAPSIBLE_GROUPS_CLASS = "dx-list-collapsible-groups",
    LIST_GROUP_COLLAPSED_CLASS = "dx-list-group-collapsed",
    LIST_GROUP_HEADER_INDICATOR_CLASS = "dx-list-group-header-indicator",
    LIST_HAS_NEXT_CLASS = "dx-has-next",
    LIST_NEXT_BUTTON_CLASS = "dx-list-next-button",
    SELECT_ALL_SELECTOR = ".dx-list-select-all",
    LIST_ITEM_DATA_KEY = "dxListItemData",
    LIST_FEEDBACK_SHOW_TIMEOUT = 70;
var groupItemsGetter = compileGetter("items");
var ListBase = CollectionWidget.inherit({
    _activeStateUnit: [LIST_ITEM_SELECTOR, SELECT_ALL_SELECTOR].join(","),
    _supportedKeys: function() {
        var that = this;
        var moveFocusPerPage = function(direction) {
            var $item = getEdgeVisibleItem(direction),
                isFocusedItem = $item.is(that.option("focusedElement"));
            if (isFocusedItem) {
                scrollListTo($item, direction);
                $item = getEdgeVisibleItem(direction)
            }
            that.option("focusedElement", getPublicElement($item));
            that.scrollToItem($item)
        };
        var getEdgeVisibleItem = function(direction) {
            var scrollTop = that.scrollTop(),
                containerHeight = that.$element().height();
            var $item = $(that.option("focusedElement")),
                isItemVisible = true;
            if (!$item.length) {
                return $()
            }
            while (isItemVisible) {
                var $nextItem = $item[direction]();
                if (!$nextItem.length) {
                    break
                }
                var nextItemLocation = $nextItem.position().top + $nextItem.outerHeight() / 2;
                isItemVisible = nextItemLocation < containerHeight + scrollTop && nextItemLocation > scrollTop;
                if (isItemVisible) {
                    $item = $nextItem
                }
            }
            return $item
        };
        var scrollListTo = function($item, direction) {
            var resultPosition = $item.position().top;
            if ("prev" === direction) {
                resultPosition = $item.position().top - that.$element().height() + $item.outerHeight()
            }
            that.scrollTo(resultPosition)
        };
        return extend(this.callBase(), {
            leftArrow: commonUtils.noop,
            rightArrow: commonUtils.noop,
            pageUp: function() {
                moveFocusPerPage("prev");
                return false
            },
            pageDown: function() {
                moveFocusPerPage("next");
                return false
            }
        })
    },
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            hoverStateEnabled: true,
            pullRefreshEnabled: false,
            scrollingEnabled: true,
            showScrollbar: "onScroll",
            useNativeScrolling: true,
            bounceEnabled: true,
            scrollByContent: true,
            scrollByThumb: false,
            pullingDownText: messageLocalization.format("dxList-pullingDownText"),
            pulledDownText: messageLocalization.format("dxList-pulledDownText"),
            refreshingText: messageLocalization.format("dxList-refreshingText"),
            pageLoadingText: messageLocalization.format("dxList-pageLoadingText"),
            onScroll: null,
            onPullRefresh: null,
            onPageLoading: null,
            pageLoadMode: "scrollBottom",
            nextButtonText: messageLocalization.format("dxList-nextButtonText"),
            onItemSwipe: null,
            grouped: false,
            onGroupRendered: null,
            collapsibleGroups: false,
            groupTemplate: "group",
            indicateLoading: true,
            activeStateEnabled: true,
            _itemAttributes: {
                role: "option"
            },
            useInkRipple: false,
            showChevronExpr: function(data) {
                return data ? data.showChevron : void 0
            },
            badgeExpr: function(data) {
                return data ? data.badge : void 0
            }
        })
    },
    _defaultOptionsRules: function() {
        var themeName = themes.current();
        return this.callBase().concat(deviceDependentOptions(), [{
            device: function() {
                return !support.nativeScrolling
            },
            options: {
                useNativeScrolling: false
            }
        }, {
            device: function(_device) {
                return !support.nativeScrolling && !devices.isSimulator() && "generic" === devices.real().platform && "generic" === _device.platform
            },
            options: {
                showScrollbar: "onHover",
                pageLoadMode: "nextButton"
            }
        }, {
            device: function() {
                return "desktop" === devices.real().deviceType && !devices.isSimulator()
            },
            options: {
                focusStateEnabled: true
            }
        }, {
            device: function() {
                return themes.isAndroid5(themeName)
            },
            options: {
                useInkRipple: true
            }
        }, {
            device: function() {
                return "win" === devices.current().platform && devices.isSimulator()
            },
            options: {
                bounceEnabled: false
            }
        }, {
            device: function() {
                return themes.isMaterial(themeName)
            },
            options: {
                pullingDownText: "",
                pulledDownText: "",
                refreshingText: "",
                pageLoadingText: "",
                useInkRipple: true
            }
        }])
    },
    _visibilityChanged: function(visible) {
        if (visible) {
            this._updateLoadingState(true)
        }
    },
    _itemClass: function() {
        return LIST_ITEM_CLASS
    },
    _itemDataKey: function() {
        return LIST_ITEM_DATA_KEY
    },
    _itemContainer: function() {
        return this._$container
    },
    _refreshItemElements: function() {
        if (!this.option("grouped")) {
            this._itemElementsCache = this._itemContainer().children(this._itemSelector())
        } else {
            this._itemElementsCache = this._itemContainer().children("." + LIST_GROUP_CLASS).children("." + LIST_GROUP_BODY_CLASS).children(this._itemSelector())
        }
    },
    reorderItem: function(itemElement, toItemElement) {
        var promise = this.callBase(itemElement, toItemElement);
        return promise.done(function() {
            this._refreshItemElements()
        })
    },
    deleteItem: function(itemElement) {
        var promise = this.callBase(itemElement);
        return promise.done(function() {
            this._refreshItemElements()
        })
    },
    _itemElements: function() {
        return this._itemElementsCache
    },
    _itemSelectHandler: function(e) {
        if ("single" === this.option("selectionMode") && this.isItemSelected(e.currentTarget)) {
            return
        }
        this.callBase(e)
    },
    _allowDynamicItemsAppend: function() {
        return true
    },
    _init: function() {
        this.callBase();
        this._$container = this.$element();
        this._initScrollView();
        this._feedbackShowTimeout = LIST_FEEDBACK_SHOW_TIMEOUT;
        this._createGroupRenderAction();
        this.setAria("role", "listbox")
    },
    _scrollBottomMode: function() {
        return "scrollBottom" === this.option("pageLoadMode")
    },
    _nextButtonMode: function() {
        return "nextButton" === this.option("pageLoadMode")
    },
    _dataSourceOptions: function() {
        var scrollBottom = this._scrollBottomMode(),
            nextButton = this._nextButtonMode();
        return extend(this.callBase(), {
            paginate: commonUtils.ensureDefined(scrollBottom || nextButton, true)
        })
    },
    _getGroupedOption: function() {
        return this.option("grouped")
    },
    _dataSourceFromUrlLoadMode: function() {
        return "raw"
    },
    _initScrollView: function() {
        var scrollingEnabled = this.option("scrollingEnabled"),
            pullRefreshEnabled = scrollingEnabled && this.option("pullRefreshEnabled"),
            autoPagingEnabled = scrollingEnabled && this._scrollBottomMode() && !!this._dataSource;
        this._scrollView = this._createComponent(this.$element(), ScrollView, {
            disabled: this.option("disabled") || !scrollingEnabled,
            onScroll: this._scrollHandler.bind(this),
            onPullDown: pullRefreshEnabled ? this._pullDownHandler.bind(this) : null,
            onReachBottom: autoPagingEnabled ? this._scrollBottomHandler.bind(this) : null,
            showScrollbar: this.option("showScrollbar"),
            useNative: this.option("useNativeScrolling"),
            bounceEnabled: this.option("bounceEnabled"),
            scrollByContent: this.option("scrollByContent"),
            scrollByThumb: this.option("scrollByThumb"),
            pullingDownText: this.option("pullingDownText"),
            pulledDownText: this.option("pulledDownText"),
            refreshingText: this.option("refreshingText"),
            reachBottomText: this.option("pageLoadingText"),
            useKeyboard: false
        });
        this._$container = $(this._scrollView.content());
        this._createScrollViewActions()
    },
    _createScrollViewActions: function() {
        this._scrollAction = this._createActionByOption("onScroll");
        this._pullRefreshAction = this._createActionByOption("onPullRefresh");
        this._pageLoadingAction = this._createActionByOption("onPageLoading")
    },
    _scrollHandler: function(e) {
        this._scrollAction && this._scrollAction(e)
    },
    _initTemplates: function() {
        this.callBase();
        this._defaultTemplates.group = new BindableTemplate(function($container, data) {
            if (typeUtils.isPlainObject(data)) {
                if (data.key) {
                    $container.text(data.key)
                }
            } else {
                $container.text(String(data))
            }
        }, ["key"], this.option("integrationOptions.watchMethod"))
    },
    _prepareDefaultItemTemplate: function(data, $container) {
        this.callBase(data, $container);
        if (data.icon) {
            var $icon = iconUtils.getImageContainer(data.icon).addClass(LIST_ITEM_ICON_CLASS),
                $iconContainer = $("<div>").addClass(LIST_ITEM_ICON_CONTAINER_CLASS);
            $iconContainer.append($icon);
            $container.prepend($iconContainer)
        }
    },
    _getBindableFields: function() {
        return ["text", "html", "icon"]
    },
    _updateLoadingState: function(tryLoadMore) {
        var isDataLoaded = !tryLoadMore || this._isLastPage(),
            scrollBottomMode = this._scrollBottomMode(),
            stopLoading = isDataLoaded || !scrollBottomMode,
            hideLoadIndicator = stopLoading && !this._isDataSourceLoading();
        if (stopLoading || this._scrollViewIsFull()) {
            this._scrollView.release(hideLoadIndicator);
            this._toggleNextButton(this._shouldRenderNextButton() && !this._isLastPage());
            this._loadIndicationSuppressed(false)
        } else {
            this._infiniteDataLoading()
        }
    },
    _shouldRenderNextButton: function() {
        return this._nextButtonMode() && this._dataSource && this._dataSource.isLoaded()
    },
    _dataSourceLoadingChangedHandler: function(isLoading) {
        if (this._loadIndicationSuppressed()) {
            return
        }
        if (isLoading && this.option("indicateLoading")) {
            this._showLoadingIndicatorTimer = setTimeout(function() {
                var isEmpty = !this._itemElements().length;
                if (this._scrollView && !isEmpty) {
                    this._scrollView.startLoading()
                }
            }.bind(this))
        } else {
            clearTimeout(this._showLoadingIndicatorTimer);
            this._scrollView && this._scrollView.finishLoading()
        }
    },
    _dataSourceChangedHandler: function(newItems) {
        if (!this._shouldAppendItems() && windowUtils.hasWindow()) {
            this._scrollView && this._scrollView.scrollTo(0)
        }
        this.callBase.apply(this, arguments)
    },
    _refreshContent: function() {
        this._prepareContent();
        this._fireContentReadyAction()
    },
    _hideLoadingIfLoadIndicationOff: function() {
        if (!this.option("indicateLoading")) {
            this._dataSourceLoadingChangedHandler(false)
        }
    },
    _loadIndicationSuppressed: function(value) {
        if (!arguments.length) {
            return this._isLoadIndicationSuppressed
        }
        this._isLoadIndicationSuppressed = value
    },
    _scrollViewIsFull: function() {
        return !this._scrollView || this._scrollView.isFull()
    },
    _pullDownHandler: function(e) {
        this._pullRefreshAction(e);
        if (this._dataSource && !this._isDataSourceLoading()) {
            this._clearSelectedItems();
            this._dataSource.pageIndex(0);
            this._dataSource.reload()
        } else {
            this._updateLoadingState()
        }
    },
    _infiniteDataLoading: function() {
        var isElementVisible = this.$element().is(":visible");
        if (isElementVisible && !this._scrollViewIsFull() && !this._isDataSourceLoading() && !this._isLastPage()) {
            clearTimeout(this._loadNextPageTimer);
            this._loadNextPageTimer = setTimeout(this._loadNextPage.bind(this))
        }
    },
    _scrollBottomHandler: function(e) {
        this._pageLoadingAction(e);
        if (!this._isDataSourceLoading() && !this._isLastPage()) {
            this._loadNextPage()
        } else {
            this._updateLoadingState()
        }
    },
    _renderItems: function(items) {
        if (this.option("grouped")) {
            each(items, this._renderGroup.bind(this));
            this._attachGroupCollapseEvent();
            this._renderEmptyMessage();
            if (themes.isMaterial()) {
                this.attachGroupHeaderInkRippleEvents()
            }
        } else {
            this.callBase.apply(this, arguments)
        }
        this._refreshItemElements();
        this._updateLoadingState(true)
    },
    _attachGroupCollapseEvent: function() {
        var eventName = eventUtils.addNamespace(clickEvent.name, this.NAME),
            selector = "." + LIST_GROUP_HEADER_CLASS,
            $element = this.$element(),
            collapsibleGroups = this.option("collapsibleGroups");
        $element.toggleClass(LIST_COLLAPSIBLE_GROUPS_CLASS, collapsibleGroups);
        eventsEngine.off($element, eventName, selector);
        if (collapsibleGroups) {
            eventsEngine.on($element, eventName, selector, function(e) {
                this._createAction(function(e) {
                    var $group = $(e.event.currentTarget).parent();
                    this._collapseGroupHandler($group);
                    if (this.option("focusStateEnabled")) {
                        this.option("focusedElement", getPublicElement($group.find("." + LIST_ITEM_CLASS).eq(0)))
                    }
                }.bind(this), {
                    validatingTargetName: "element"
                })({
                    event: e
                })
            }.bind(this))
        }
    },
    _collapseGroupHandler: function($group, toggle) {
        var deferred = new Deferred;
        if ($group.hasClass(LIST_GROUP_COLLAPSED_CLASS) === toggle) {
            return deferred.resolve()
        }
        var $groupBody = $group.children("." + LIST_GROUP_BODY_CLASS);
        var startHeight = $groupBody.outerHeight();
        var endHeight = 0 === startHeight ? $groupBody.height("auto").outerHeight() : 0;
        $group.toggleClass(LIST_GROUP_COLLAPSED_CLASS, toggle);
        fx.animate($groupBody, {
            type: "custom",
            from: {
                height: startHeight
            },
            to: {
                height: endHeight
            },
            duration: 200,
            complete: function() {
                this.updateDimensions();
                this._updateLoadingState();
                deferred.resolve()
            }.bind(this)
        });
        return deferred.promise()
    },
    _dataSourceLoadErrorHandler: function() {
        this._forgetNextPageLoading();
        if (this._initialized) {
            this._renderEmptyMessage();
            this._updateLoadingState()
        }
    },
    _initMarkup: function() {
        this._itemElementsCache = $();
        this.$element().addClass(LIST_CLASS);
        this.callBase();
        this.option("useInkRipple") && this._renderInkRipple()
    },
    _renderInkRipple: function() {
        this._inkRipple = inkRipple.render()
    },
    _toggleActiveState: function($element, value, e) {
        this.callBase.apply(this, arguments);
        var that = this;
        if (!this._inkRipple) {
            return
        }
        var config = {
            element: $element,
            event: e
        };
        if (value) {
            if (themes.isMaterial()) {
                this._inkRippleTimer = setTimeout(function() {
                    that._inkRipple.showWave(config)
                }, LIST_FEEDBACK_SHOW_TIMEOUT / 2)
            } else {
                that._inkRipple.showWave(config)
            }
        } else {
            clearTimeout(this._inkRippleTimer);
            this._inkRipple.hideWave(config)
        }
    },
    _postprocessRenderItem: function(args) {
        this._refreshItemElements();
        this.callBase.apply(this, arguments);
        if (this.option("onItemSwipe")) {
            this._attachSwipeEvent($(args.itemElement))
        }
    },
    _attachSwipeEvent: function($itemElement) {
        var endEventName = eventUtils.addNamespace(swipeEvents.end, this.NAME);
        eventsEngine.on($itemElement, endEventName, this._itemSwipeEndHandler.bind(this))
    },
    _itemSwipeEndHandler: function(e) {
        this._itemDXEventHandler(e, "onItemSwipe", {
            direction: e.offset < 0 ? "left" : "right"
        })
    },
    _nextButtonHandler: function() {
        var source = this._dataSource;
        if (source && !source.isLoading()) {
            this._scrollView.toggleLoading(true);
            this._$nextButton.detach();
            this._loadIndicationSuppressed(true);
            this._loadNextPage()
        }
    },
    _renderGroup: function(index, group) {
        var $groupElement = $("<div>").addClass(LIST_GROUP_CLASS).appendTo(this._itemContainer());
        var $groupHeaderElement = $("<div>").addClass(LIST_GROUP_HEADER_CLASS).appendTo($groupElement);
        var groupTemplateName = this.option("groupTemplate"),
            groupTemplate = this._getTemplate(group.template || groupTemplateName, group, index, $groupHeaderElement),
            renderArgs = {
                index: index,
                itemData: group,
                container: getPublicElement($groupHeaderElement)
            };
        this._createItemByTemplate(groupTemplate, renderArgs);
        if (themes.isMaterial()) {
            $("<div>").addClass(LIST_GROUP_HEADER_INDICATOR_CLASS).prependTo($groupHeaderElement)
        }
        this._renderingGroupIndex = index;
        var $groupBody = $("<div>").addClass(LIST_GROUP_BODY_CLASS).appendTo($groupElement);
        each(groupItemsGetter(group) || [], function(index, item) {
            this._renderItem(index, item, $groupBody)
        }.bind(this));
        this._groupRenderAction({
            groupElement: getPublicElement($groupElement),
            groupIndex: index,
            groupData: group
        })
    },
    attachGroupHeaderInkRippleEvents: function() {
        var that = this,
            selector = "." + LIST_GROUP_HEADER_CLASS,
            $element = this.$element();
        eventsEngine.on($element, "dxpointerdown", selector, function(e) {
            that._toggleActiveState($(e.currentTarget), true, e)
        });
        eventsEngine.on($element, "dxpointerup dxhoverend", selector, function(e) {
            that._toggleActiveState($(e.currentTarget), false)
        })
    },
    _createGroupRenderAction: function() {
        this._groupRenderAction = this._createActionByOption("onGroupRendered")
    },
    _clean: function() {
        clearTimeout(this._inkRippleTimer);
        if (this._$nextButton) {
            this._$nextButton.remove();
            this._$nextButton = null
        }
        this.callBase.apply(this, arguments)
    },
    _dispose: function() {
        clearTimeout(this._holdTimer);
        clearTimeout(this._loadNextPageTimer);
        clearTimeout(this._showLoadingIndicatorTimer);
        this.callBase()
    },
    _toggleDisabledState: function(value) {
        this.callBase(value);
        this._scrollView.option("disabled", value || !this.option("scrollingEnabled"))
    },
    _toggleNextButton: function(value) {
        var dataSource = this._dataSource,
            $nextButton = this._getNextButton();
        this.$element().toggleClass(LIST_HAS_NEXT_CLASS, value);
        if (value && dataSource && dataSource.isLoaded()) {
            $nextButton.appendTo(this._itemContainer())
        }
        if (!value) {
            $nextButton.detach()
        }
    },
    _getNextButton: function() {
        if (!this._$nextButton) {
            this._$nextButton = this._createNextButton()
        }
        return this._$nextButton
    },
    _createNextButton: function() {
        var $result = $("<div>").addClass(LIST_NEXT_BUTTON_CLASS);
        var $button = $("<div>").appendTo($result);
        this._createComponent($button, Button, {
            text: this.option("nextButtonText"),
            onClick: this._nextButtonHandler.bind(this),
            type: themes.isMaterial() ? "default" : void 0,
            integrationOptions: {}
        });
        return $result
    },
    _moveFocus: function() {
        this.callBase.apply(this, arguments);
        this.scrollToItem(this.option("focusedElement"))
    },
    _refresh: function() {
        if (!windowUtils.hasWindow()) {
            this.callBase()
        } else {
            var scrollTop = this._scrollView.scrollTop();
            this.callBase();
            scrollTop && this._scrollView.scrollTo(scrollTop)
        }
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "pageLoadMode":
                this._toggleNextButton(args.value);
                this._initScrollView();
                break;
            case "dataSource":
                this.callBase(args);
                this._initScrollView();
                break;
            case "pullingDownText":
            case "pulledDownText":
            case "refreshingText":
            case "pageLoadingText":
            case "useNative":
            case "showScrollbar":
            case "bounceEnabled":
            case "scrollByContent":
            case "scrollByThumb":
            case "scrollingEnabled":
            case "pullRefreshEnabled":
                this._initScrollView();
                this._updateLoadingState();
                break;
            case "nextButtonText":
            case "onItemSwipe":
            case "useInkRipple":
                this._invalidate();
                break;
            case "onScroll":
            case "onPullRefresh":
            case "onPageLoading":
                this._createScrollViewActions();
                this._invalidate();
                break;
            case "grouped":
            case "collapsibleGroups":
            case "groupTemplate":
                this._invalidate();
                break;
            case "onGroupRendered":
                this._createGroupRenderAction();
                break;
            case "width":
            case "height":
                this.callBase(args);
                this._scrollView.update();
                break;
            case "indicateLoading":
                this._hideLoadingIfLoadIndicationOff();
                break;
            case "visible":
                this.callBase(args);
                this._scrollView.update();
                break;
            case "rtlEnabled":
                this._initScrollView();
                this.callBase(args);
                break;
            case "showChevronExpr":
            case "badgeExpr":
                this._invalidate();
                break;
            default:
                this.callBase(args)
        }
    },
    _extendActionArgs: function($itemElement) {
        if (!this.option("grouped")) {
            return this.callBase($itemElement)
        }
        var $group = $itemElement.closest("." + LIST_GROUP_CLASS);
        var $item = $group.find("." + LIST_ITEM_CLASS);
        return extend(this.callBase($itemElement), {
            itemIndex: {
                group: $group.index(),
                item: $item.index($itemElement)
            }
        })
    },
    expandGroup: function(groupIndex) {
        var deferred = new Deferred,
            $group = this._itemContainer().find("." + LIST_GROUP_CLASS).eq(groupIndex);
        this._collapseGroupHandler($group, false).done(function() {
            deferred.resolveWith(this)
        }.bind(this));
        return deferred.promise()
    },
    collapseGroup: function(groupIndex) {
        var deferred = new Deferred,
            $group = this._itemContainer().find("." + LIST_GROUP_CLASS).eq(groupIndex);
        this._collapseGroupHandler($group, true).done(function() {
            deferred.resolveWith(this)
        }.bind(this));
        return deferred
    },
    updateDimensions: function() {
        var that = this,
            deferred = new Deferred;
        if (that._scrollView) {
            that._scrollView.update().done(function() {
                !that._scrollViewIsFull() && that._updateLoadingState(true);
                deferred.resolveWith(that)
            })
        } else {
            deferred.resolveWith(that)
        }
        return deferred.promise()
    },
    reload: function() {
        this.callBase();
        this.scrollTo(0);
        this._pullDownHandler()
    },
    repaint: function() {
        this.scrollTo(0);
        this.callBase()
    },
    scrollTop: function() {
        return this._scrollView.scrollOffset().top
    },
    clientHeight: function() {
        return this._scrollView.clientHeight()
    },
    scrollHeight: function() {
        return this._scrollView.scrollHeight()
    },
    scrollBy: function(distance) {
        this._scrollView.scrollBy(distance)
    },
    scrollTo: function(location) {
        this._scrollView.scrollTo(location)
    },
    scrollToItem: function(itemElement) {
        var $item = this._editStrategy.getItemElement(itemElement);
        this._scrollView.scrollToElement($item)
    }
}).include(DataConverterMixin);
ListBase.ItemClass = ListItem;
module.exports = ListBase;
