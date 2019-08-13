/**
 * DevExtreme (ui/scheduler/ui.scheduler.appointments.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _dom_adapter = require("../../core/dom_adapter");
var _dom_adapter2 = _interopRequireDefault(_dom_adapter);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _element_data = require("../../core/element_data");
var _element_data2 = _interopRequireDefault(_element_data);
var _translator = require("../../animation/translator");
var _translator2 = _interopRequireDefault(_translator);
var _date = require("../../core/utils/date");
var _date2 = _interopRequireDefault(_date);
var _common = require("../../core/utils/common");
var _common2 = _interopRequireDefault(_common);
var _type = require("../../core/utils/type");
var _type2 = _interopRequireDefault(_type);
var _iterator = require("../../core/utils/iterator");
var _object = require("../../core/utils/object");
var _object2 = _interopRequireDefault(_object);
var _array = require("../../core/utils/array");
var _array2 = _interopRequireDefault(_array);
var _extend = require("../../core/utils/extend");
var _dom = require("../../core/utils/dom");
var _utils = require("./utils.recurrence");
var _utils2 = _interopRequireDefault(_utils);
var _component_registrator = require("../../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _uiScheduler = require("./ui.scheduler.publisher_mixin");
var _uiScheduler2 = _interopRequireDefault(_uiScheduler);
var _uiScheduler3 = require("./ui.scheduler.appointment");
var _uiScheduler4 = _interopRequireDefault(_uiScheduler3);
var _utils3 = require("../../events/utils");
var _utils4 = _interopRequireDefault(_utils3);
var _double_click = require("../../events/double_click");
var _double_click2 = _interopRequireDefault(_double_click);
var _date3 = require("../../localization/date");
var _date4 = _interopRequireDefault(_date3);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _uiCollection_widget = require("../collection/ui.collection_widget.edit");
var _uiCollection_widget2 = _interopRequireDefault(_uiCollection_widget);
var _draggable = require("../draggable");
var _draggable2 = _interopRequireDefault(_draggable);
var _deferred = require("../../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var APPOINTMENT_SETTINGS_NAME = "dxAppointmentSettings";
var COMPONENT_CLASS = "dx-scheduler-scrollable-appointments",
    APPOINTMENT_ITEM_CLASS = "dx-scheduler-appointment",
    APPOINTMENT_TITLE_CLASS = "dx-scheduler-appointment-title",
    APPOINTMENT_CONTENT_DETAILS_CLASS = "dx-scheduler-appointment-content-details",
    APPOINTMENT_DATE_CLASS = "dx-scheduler-appointment-content-date",
    RECURRING_ICON_CLASS = "dx-scheduler-appointment-recurrence-icon",
    ALL_DAY_CONTENT_CLASS = "dx-scheduler-appointment-content-allday",
    DBLCLICK_EVENT_NAME = _utils4.default.addNamespace(_double_click2.default.name, "dxSchedulerAppointment");
var toMs = _date2.default.dateToMilliseconds;
var SchedulerAppointments = _uiCollection_widget2.default.inherit({
    _supportedKeys: function() {
        var parent = this.callBase();
        var tabHandler = function(e) {
            var appointments = this._getAccessAppointments(),
                focusedAppointment = appointments.filter(".dx-state-focused"),
                index = focusedAppointment.data("dxAppointmentSettings").sortedIndex,
                lastIndex = appointments.length - 1;
            if (index > 0 && e.shiftKey || index < lastIndex && !e.shiftKey) {
                e.preventDefault();
                e.shiftKey ? index-- : index++;
                var $nextAppointment = this._getAppointmentByIndex(index);
                this._resetTabIndex($nextAppointment);
                _events_engine2.default.trigger($nextAppointment, "focus")
            }
        };
        return (0, _extend.extend)(parent, {
            escape: function() {
                this.moveAppointmentBack();
                this._escPressed = true
            }.bind(this),
            del: function(e) {
                if (this.option("allowDelete")) {
                    e.preventDefault();
                    var data = this._getItemData(e.target);
                    this.notifyObserver("deleteAppointment", {
                        data: data,
                        target: e.target
                    });
                    this.notifyObserver("hideAppointmentTooltip")
                }
            }.bind(this),
            tab: tabHandler
        })
    },
    _getAppointmentByIndex: function(sortedIndex) {
        var appointments = this._getAccessAppointments();
        return appointments.filter(function(_, $item) {
            return _element_data2.default.data($item, "dxAppointmentSettings").sortedIndex === sortedIndex
        }).eq(0)
    },
    _getAccessAppointments: function() {
        return this._itemElements().filter(":visible").not(".dx-state-disabled")
    },
    _resetTabIndex: function($appointment) {
        this._focusTarget().attr("tabIndex", -1);
        $appointment.attr("tabIndex", this.option("tabIndex"))
    },
    _moveFocus: _common2.default.noop,
    _focusTarget: function() {
        return this._itemElements()
    },
    _renderFocusTarget: function() {
        var $appointment = this._getAppointmentByIndex(0);
        this._resetTabIndex($appointment)
    },
    _focusInHandler: function(e) {
        if (this._targetIsDisabled(e)) {
            e.stopPropagation();
            return
        }
        clearTimeout(this._appointmentFocusedTimeout);
        this.callBase.apply(this, arguments);
        this._$currentAppointment = (0, _renderer2.default)(e.target);
        this.option("focusedElement", (0, _dom.getPublicElement)((0, _renderer2.default)(e.target)));
        var that = this;
        this._appointmentFocusedTimeout = setTimeout(function() {
            that.notifyObserver("appointmentFocused")
        })
    },
    _targetIsDisabled: function(e) {
        return (0, _renderer2.default)(e.currentTarget).is(".dx-state-disabled, .dx-state-disabled *")
    },
    _focusOutHandler: function() {
        var $appointment = this._getAppointmentByIndex(0);
        this.option("focusedElement", (0, _dom.getPublicElement)($appointment));
        this.callBase.apply(this, arguments)
    },
    _eventBindingTarget: function() {
        return this._itemContainer()
    },
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            noDataText: null,
            activeStateEnabled: true,
            hoverStateEnabled: true,
            tabIndex: 0,
            fixedContainer: null,
            allDayContainer: null,
            allowDrag: true,
            allowResize: true,
            allowAllDayResize: true,
            onAppointmentDblClick: null,
            _appointmentGroupButtonOffset: 0
        })
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "items":
                this._cleanFocusState();
                this._clearDropDownItems();
                this._clearDropDownItemsElements();
                this._repaintAppointments(args.value);
                this._renderDropDownAppointments();
                this._attachAppointmentsEvents();
                break;
            case "fixedContainer":
            case "allDayContainer":
            case "onAppointmentDblClick":
                break;
            case "allowDrag":
            case "allowResize":
            case "allowAllDayResize":
                this._invalidate();
                break;
            case "focusedElement":
                this._resetTabIndex((0, _renderer2.default)(args.value));
                this.callBase(args);
                break;
            case "allowDelete":
                break;
            case "focusStateEnabled":
                this._clearDropDownItemsElements();
                this._renderDropDownAppointments();
                this.callBase(args);
                break;
            default:
                this.callBase(args)
        }
    },
    _isAllDayAppointment: function(appointment) {
        return appointment.settings.length && appointment.settings[0].allDay || false
    },
    _isRepaintAppointment: function(appointment) {
        return !_type2.default.isDefined(appointment.needRepaint) || true === appointment.needRepaint
    },
    _isRepaintAll: function(appointments) {
        if (this.invoke("isCurrentViewAgenda")) {
            return true
        }
        for (var i = 0; i < appointments.length; i++) {
            var appointment = appointments[i];
            if (!this._isRepaintAppointment(appointment)) {
                return false
            }
        }
        return true
    },
    _applyFragment: function(fragment, allDay) {
        if (fragment.children().length > 0) {
            this._getAppointmentContainer(allDay).append(fragment)
        }
    },
    _onEachAppointment: function(appointment, index, container, isRepaintAll) {
        if (appointment && true === appointment.needRemove) {
            this._clearItem(appointment);
            return
        }
        if (false === appointment.needRepaint) {
            this._processRenderedAppointment(appointment)
        }
        if (this._isRepaintAppointment(appointment)) {
            appointment.needRepaint = false;
            !isRepaintAll && this._clearItem(appointment);
            this._renderItem(index, appointment, container)
        }
    },
    _repaintAppointments: function(appointments) {
        var _this = this;
        var isRepaintAll = this._isRepaintAll(appointments);
        var allDayFragment = (0, _renderer2.default)(this._getAppointmentContainer(true));
        var commonFragment = (0, _renderer2.default)(this._getAppointmentContainer(false));
        if (isRepaintAll) {
            this._getAppointmentContainer(true).html("");
            this._getAppointmentContainer(false).html("")
        }!appointments.length && this._cleanItemContainer();
        appointments.forEach(function(appointment, index) {
            var container = _this._isAllDayAppointment(appointment) ? allDayFragment : commonFragment;
            _this._onEachAppointment(appointment, index, container, isRepaintAll)
        });
        this._applyFragment(allDayFragment, true);
        this._applyFragment(commonFragment, false)
    },
    _attachAppointmentsEvents: function() {
        this._attachClickEvent();
        this._attachHoldEvent();
        this._attachContextMenuEvent();
        this._attachAppointmentDblClick();
        this._renderFocusState();
        this._attachFeedbackEvents();
        this._attachHoverEvents()
    },
    _processRenderedAppointment: function(item) {
        var resourceForPainting = this.invoke("getResourceForPainting");
        if (!resourceForPainting) {
            return
        }
        var $items = this._findItemElementByItem(item.itemData);
        if (!$items.length) {
            return
        }(0, _iterator.each)($items, function(index, $item) {
            var deferredColor = this._getAppointmentColor($item, item.settings[index].groupIndex);
            deferredColor.done(function(color) {
                if (color) {
                    $item.css("backgroundColor", color)
                }
            })
        }.bind(this))
    },
    _clearItem: function(item) {
        var $items = this._findItemElementByItem(item.itemData);
        if (!$items.length) {
            return
        }(0, _iterator.each)($items, function(_, $item) {
            $item.detach();
            $item.remove()
        })
    },
    _clearDropDownItems: function() {
        this._virtualAppointments = {}
    },
    _clearDropDownItemsElements: function() {
        var $items = this._getDropDownAppointments();
        if (!$items.length) {
            return
        }(0, _iterator.each)($items, function(_, $item) {
            (0, _renderer2.default)($item).detach();
            (0, _renderer2.default)($item).remove()
        })
    },
    _getDropDownAppointments: function() {
        return this._itemContainer().find(".dx-scheduler-dropdown-appointments")
    },
    _findItemElementByItem: function(item) {
        var result = [],
            that = this;
        this.itemElements().each(function() {
            var $item = (0, _renderer2.default)(this);
            if ($item.data(that._itemDataKey()) === item) {
                result.push($item)
            }
        });
        return result
    },
    _itemClass: function() {
        return APPOINTMENT_ITEM_CLASS
    },
    _itemContainer: function() {
        var $container = this.callBase(),
            $result = $container,
            $allDayContainer = this.option("allDayContainer");
        if ($allDayContainer) {
            $result = $container.add($allDayContainer)
        }
        return $result
    },
    _cleanItemContainer: function() {
        this.callBase();
        var $allDayContainer = this.option("allDayContainer");
        if ($allDayContainer) {
            $allDayContainer.empty()
        }
        this._virtualAppointments = {}
    },
    _clean: function() {
        this.callBase();
        delete this._$currentAppointment;
        delete this._initialSize;
        delete this._initialCoordinates
    },
    _init: function() {
        this.callBase();
        this.$element().addClass(COMPONENT_CLASS);
        this._preventSingleAppointmentClick = false
    },
    _renderAppointmentTemplate: function($container, data, model) {
        var startDate = model.settings ? new Date(this.invoke("getField", "startDate", model.settings)) : data.startDate,
            endDate = model.settings ? new Date(this.invoke("getField", "endDate", model.settings)) : data.endDate;
        if (isNaN(startDate) || isNaN(endDate)) {
            startDate = data.startDate;
            endDate = data.endDate
        }(0, _renderer2.default)("<div>").text(this._createAppointmentTitle(data)).addClass(APPOINTMENT_TITLE_CLASS).appendTo($container);
        if (_type2.default.isPlainObject(data)) {
            if (data.html) {
                $container.html(data.html)
            }
        }
        var recurrenceRule = data.recurrenceRule,
            allDay = data.allDay,
            $contentDetails = (0, _renderer2.default)("<div>").addClass(APPOINTMENT_CONTENT_DETAILS_CLASS);
        var apptStartTz = data.startDateTimeZone,
            apptEndTz = data.endDateTimeZone;
        startDate = this.invoke("convertDateByTimezone", startDate, apptStartTz);
        endDate = this.invoke("convertDateByTimezone", endDate, apptEndTz);
        (0, _renderer2.default)("<div>").addClass(APPOINTMENT_DATE_CLASS).text(_date4.default.format(startDate, "shorttime")).appendTo($contentDetails);
        (0, _renderer2.default)("<div>").addClass(APPOINTMENT_DATE_CLASS).text(" - ").appendTo($contentDetails);
        (0, _renderer2.default)("<div>").addClass(APPOINTMENT_DATE_CLASS).text(_date4.default.format(endDate, "shorttime")).appendTo($contentDetails);
        $contentDetails.appendTo($container);
        if (recurrenceRule) {
            (0, _renderer2.default)("<span>").addClass(RECURRING_ICON_CLASS + " dx-icon-repeat").appendTo($container)
        }
        if (allDay) {
            (0, _renderer2.default)("<div>").text(" " + _message2.default.format("dxScheduler-allDay") + ": ").addClass(ALL_DAY_CONTENT_CLASS).prependTo($contentDetails)
        }
    },
    _createAppointmentTitle: function(data) {
        if (_type2.default.isPlainObject(data)) {
            return data.text
        }
        return String(data)
    },
    _executeItemRenderAction: function(index, itemData, itemElement) {
        var action = this._getItemRenderAction();
        if (action) {
            action({
                appointmentElement: itemElement,
                appointmentData: itemData,
                targetedAppointmentData: this.invoke("getTargetedAppointmentData", itemData, itemElement, index)
            })
        }
        delete this._currentAppointmentSettings
    },
    _itemClickHandler: function(e) {
        this.callBase(e, {}, {
            afterExecute: function(e) {
                this._processItemClick(e.args[0].event)
            }.bind(this)
        })
    },
    _processItemClick: function(e) {
        var $target = (0, _renderer2.default)(e.currentTarget),
            data = this._getItemData($target);
        if (this._targetIsDisabled(e)) {
            e.stopPropagation();
            return
        }
        if ("keydown" === e.type || _utils4.default.isFakeClickEvent(e)) {
            this.notifyObserver("showEditAppointmentPopup", {
                data: data,
                target: $target
            });
            return
        }
        this._appointmentClickTimeout = setTimeout(function() {
            if (!this._preventSingleAppointmentClick && _dom_adapter2.default.getBody().contains($target[0])) {
                this.notifyObserver("showAppointmentTooltip", {
                    data: data,
                    target: $target
                })
            }
            this._preventSingleAppointmentClick = false
        }.bind(this), 300)
    },
    _extendActionArgs: function() {
        var args = this.callBase.apply(this, arguments);
        return this.invoke("mapAppointmentFields", args)
    },
    _render: function() {
        this.callBase.apply(this, arguments);
        this._attachAppointmentDblClick()
    },
    _attachAppointmentDblClick: function() {
        var that = this;
        var itemSelector = that._itemSelector();
        var itemContainer = this._itemContainer();
        _events_engine2.default.off(itemContainer, DBLCLICK_EVENT_NAME, itemSelector);
        _events_engine2.default.on(itemContainer, DBLCLICK_EVENT_NAME, itemSelector, function(e) {
            that._itemDXEventHandler(e, "onAppointmentDblClick", {}, {
                afterExecute: function(e) {
                    that._dblClickHandler(e.args[0].event)
                }
            })
        })
    },
    _dblClickHandler: function(e) {
        var $targetAppointment = (0, _renderer2.default)(e.currentTarget),
            appointmentData = this._getItemData($targetAppointment);
        clearTimeout(this._appointmentClickTimeout);
        this._preventSingleAppointmentClick = true;
        this.notifyObserver("showEditAppointmentPopup", {
            data: appointmentData,
            target: $targetAppointment
        })
    },
    _renderItem: function(index, item, container) {
        var itemData = item.itemData;
        for (var i = 0; i < item.settings.length; i++) {
            var setting = item.settings[i];
            this._currentAppointmentSettings = setting;
            var $item = this.callBase(index, itemData, container);
            $item.data(APPOINTMENT_SETTINGS_NAME, setting)
        }
    },
    _getItemContent: function($itemFrame) {
        $itemFrame.data(APPOINTMENT_SETTINGS_NAME, this._currentAppointmentSettings);
        var $itemContent = this.callBase($itemFrame);
        return $itemContent
    },
    _createItemByTemplate: function(itemTemplate, renderArgs) {
        return itemTemplate.render({
            model: renderArgs.itemData,
            container: renderArgs.container,
            index: renderArgs.index
        })
    },
    _getAppointmentContainer: function(allDay) {
        var $allDayContainer = this.option("allDayContainer"),
            $container = this.itemsContainer().not($allDayContainer);
        if (allDay && $allDayContainer) {
            $container = $allDayContainer
        }
        return $container
    },
    _postprocessRenderItem: function(args) {
        this._renderAppointment(args.itemElement, this._currentAppointmentSettings)
    },
    _renderAppointment: function($appointment, settings) {
        $appointment.data(APPOINTMENT_SETTINGS_NAME, settings);
        this._applyResourceDataAttr($appointment);
        var data = this._getItemData($appointment),
            geometry = this.invoke("getAppointmentGeometry", settings),
            allowResize = !settings.isCompact && this.option("allowResize") && (!_type2.default.isDefined(settings.skipResizing) || _type2.default.isString(settings.skipResizing)),
            allowDrag = this.option("allowDrag"),
            allDay = settings.allDay;
        this.invoke("setCellDataCacheAlias", this._currentAppointmentSettings, geometry);
        var deferredColor = this._getAppointmentColor($appointment, settings.groupIndex);
        if (settings.virtual) {
            this._processVirtualAppointment(settings, $appointment, data, deferredColor)
        } else {
            this._createComponent($appointment, _uiScheduler4.default, {
                observer: this.option("observer"),
                data: data,
                geometry: geometry,
                direction: settings.direction || "vertical",
                allowResize: allowResize,
                allowDrag: allowDrag,
                allDay: allDay,
                reduced: settings.appointmentReduced,
                isCompact: settings.isCompact,
                startDate: new Date(settings.startDate),
                cellWidth: this.invoke("getCellWidth"),
                cellHeight: this.invoke("getCellHeight"),
                resizableConfig: this._resizableConfig(data, settings)
            });
            deferredColor.done(function(color) {
                if (color) {
                    $appointment.css("backgroundColor", color)
                }
            });
            this._renderDraggable($appointment, allDay)
        }
    },
    _applyResourceDataAttr: function($appointment) {
        this.notifyObserver("getResourcesFromItem", {
            itemData: this._getItemData($appointment),
            callback: function(resources) {
                if (resources) {
                    (0, _iterator.each)(resources, function(name, values) {
                        var attr = "data-" + _common2.default.normalizeKey(name.toLowerCase()) + "-";
                        for (var i = 0; i < values.length; i++) {
                            $appointment.attr(attr + _common2.default.normalizeKey(values[i]), true)
                        }
                    })
                }
            }
        })
    },
    _resizableConfig: function(appointmentData, itemSetting) {
        return {
            area: this._calculateResizableArea(itemSetting, appointmentData),
            onResizeStart: function(e) {
                this._$currentAppointment = (0, _renderer2.default)(e.element);
                if (this.invoke("needRecalculateResizableArea")) {
                    var updatedArea = this._calculateResizableArea(this._$currentAppointment.data("dxAppointmentSettings"), this._$currentAppointment.data("dxItemData"));
                    e.component.option("area", updatedArea);
                    e.component._renderDragOffsets(e.event)
                }
                this._initialSize = {
                    width: e.width,
                    height: e.height
                };
                this._initialCoordinates = _translator2.default.locate(this._$currentAppointment)
            }.bind(this),
            onResizeEnd: function(e) {
                if (this._escPressed) {
                    e.event.cancel = true;
                    return
                }
                this._resizeEndHandler(e)
            }.bind(this)
        }
    },
    _calculateResizableArea: function(itemSetting, appointmentData) {
        var area = this.$element().closest(".dx-scrollable-content");
        this.notifyObserver("getResizableAppointmentArea", {
            coordinates: {
                left: itemSetting.left,
                top: 0,
                groupIndex: itemSetting.groupIndex
            },
            allDay: itemSetting.allDay,
            callback: function(result) {
                if (result) {
                    area = result
                }
            }
        });
        return area
    },
    _resizeEndHandler: function(e) {
        var $element = (0, _renderer2.default)(e.element),
            itemData = this._getItemData($element),
            startDate = this.invoke("getStartDate", itemData, true),
            endDate = this.invoke("getEndDate", itemData, true);
        var dateRange = this._getDateRange(e, startDate, endDate);
        var updatedDates = {};
        this.invoke("setField", "startDate", updatedDates, new Date(dateRange[0]));
        this.invoke("setField", "endDate", updatedDates, new Date(dateRange[1]));
        var data = (0, _extend.extend)({}, itemData, updatedDates);
        this.notifyObserver("updateAppointmentAfterResize", {
            target: itemData,
            data: data,
            $appointment: $element
        })
    },
    _getDateRange: function(e, startDate, endDate) {
        var startTime, endTime, itemData = this._getItemData(e.element),
            deltaTime = this.invoke("getDeltaTime", e, this._initialSize, itemData),
            renderingStrategyDirection = this.invoke("getRenderingStrategyDirection"),
            cond = false,
            isAllDay = this.invoke("isAllDay", itemData),
            needCorrectDates = this.invoke("needCorrectAppointmentDates") && !isAllDay;
        if ("vertical" !== renderingStrategyDirection || isAllDay) {
            cond = this.option("rtlEnabled") ? e.handles.right : e.handles.left
        } else {
            cond = e.handles.top
        }
        if (cond) {
            startTime = needCorrectDates ? this._correctStartDateByDelta(startDate, deltaTime) : startDate.getTime() - deltaTime;
            endTime = endDate.getTime()
        } else {
            startTime = startDate.getTime();
            endTime = needCorrectDates ? this._correctEndDateByDelta(endDate, deltaTime) : endDate.getTime() + deltaTime
        }
        return [startTime, endTime]
    },
    _correctEndDateByDelta: function(endDate, deltaTime) {
        var endDayHour = this.invoke("getEndDayHour"),
            startDayHour = this.invoke("getStartDayHour"),
            result = endDate.getTime() + deltaTime,
            visibleDayDuration = (endDayHour - startDayHour) * toMs("hour");
        var daysCount = Math.ceil(deltaTime / visibleDayDuration),
            maxDate = new Date(endDate);
        maxDate.setHours(endDayHour, 0, 0, 0);
        if (result > maxDate.getTime()) {
            var tailOfCurrentDay = maxDate.getTime() - endDate.getTime(),
                tailOfPrevDays = deltaTime - tailOfCurrentDay;
            var lastDay = new Date(endDate.setDate(endDate.getDate() + daysCount));
            lastDay.setHours(startDayHour);
            result = lastDay.getTime() + tailOfPrevDays - visibleDayDuration * (daysCount - 1)
        }
        return result
    },
    _correctStartDateByDelta: function(startDate, deltaTime) {
        var endDayHour = this.invoke("getEndDayHour"),
            startDayHour = this.invoke("getStartDayHour"),
            result = startDate.getTime() - deltaTime,
            visibleDayDuration = (endDayHour - startDayHour) * toMs("hour");
        var daysCount = Math.ceil(deltaTime / visibleDayDuration),
            minDate = new Date(startDate);
        minDate.setHours(startDayHour, 0, 0, 0);
        if (result < minDate.getTime()) {
            var tailOfCurrentDay = startDate.getTime() - minDate.getTime(),
                tailOfPrevDays = deltaTime - tailOfCurrentDay;
            var firstDay = new Date(startDate.setDate(startDate.getDate() - daysCount));
            firstDay.setHours(endDayHour);
            result = firstDay.getTime() - tailOfPrevDays + visibleDayDuration * (daysCount - 1)
        }
        return result
    },
    _getAppointmentColor: function($appointment, groupIndex) {
        var res = new _deferred.Deferred;
        this.notifyObserver("getAppointmentColor", {
            itemData: this._getItemData($appointment),
            groupIndex: groupIndex,
            callback: function(d) {
                d.done(function(color) {
                    res.resolve(color)
                })
            }
        });
        return res.promise()
    },
    _renderDraggable: function($appointment, allDay) {
        if (!this.option("allowDrag")) {
            return
        }
        var draggableArea, that = this,
            $fixedContainer = this.option("fixedContainer"),
            correctCoordinates = function(element, isFixedContainer) {
                var coordinates = _translator2.default.locate((0, _renderer2.default)(element));
                that.notifyObserver("correctAppointmentCoordinates", {
                    coordinates: coordinates,
                    allDay: allDay,
                    isFixedContainer: isFixedContainer,
                    callback: function(result) {
                        if (result) {
                            coordinates = result
                        }
                    }
                });
                _translator2.default.move($appointment, coordinates)
            };
        this.notifyObserver("getDraggableAppointmentArea", {
            callback: function(result) {
                if (result) {
                    draggableArea = result
                }
            }
        });
        this._createComponent($appointment, _draggable2.default, {
            area: draggableArea,
            boundOffset: that._calculateBoundOffset(),
            immediate: false,
            onDragStart: function(args) {
                var e = args.event;
                that._skipDraggableRestriction(e);
                that.notifyObserver("hideAppointmentTooltip");
                $fixedContainer.append($appointment);
                that._$currentAppointment = (0, _renderer2.default)(args.element);
                that._initialSize = {
                    width: args.width,
                    height: args.height
                };
                that._initialCoordinates = _translator2.default.locate(that._$currentAppointment)
            },
            onDrag: function(args) {
                correctCoordinates(args.element)
            },
            onDragEnd: function(args) {
                correctCoordinates(args.element, true);
                var $container = that._getAppointmentContainer(allDay);
                $container.append($appointment);
                if (this._escPressed) {
                    args.event.cancel = true;
                    return
                }
                that._dragEndHandler(args)
            }
        })
    },
    _calculateBoundOffset: function() {
        var result = {
            top: 0
        };
        this.notifyObserver("getBoundOffset", {
            callback: function(offset) {
                result = offset
            }
        });
        return result
    },
    _skipDraggableRestriction: function(e) {
        if (this.option("rtlEnabled")) {
            e.maxLeftOffset = null
        } else {
            e.maxRightOffset = null
        }
        e.maxBottomOffset = null
    },
    _dragEndHandler: function(e) {
        var $element = (0, _renderer2.default)(e.element),
            itemData = this._getItemData($element),
            coordinates = this._initialCoordinates;
        this.notifyObserver("updateAppointmentAfterDrag", {
            data: itemData,
            $appointment: $element,
            coordinates: coordinates
        })
    },
    _virtualAppointments: {},
    _processVirtualAppointment: function(appointmentSetting, $appointment, appointmentData, color) {
        var virtualAppointment = appointmentSetting.virtual,
            virtualGroupIndex = virtualAppointment.index;
        if (!_type2.default.isDefined(this._virtualAppointments[virtualGroupIndex])) {
            this._virtualAppointments[virtualGroupIndex] = {
                coordinates: {
                    top: virtualAppointment.top,
                    left: virtualAppointment.left
                },
                items: {
                    data: [],
                    colors: []
                },
                isAllDay: virtualAppointment.isAllDay ? true : false,
                buttonColor: color
            }
        }
        appointmentData.settings = [appointmentSetting];
        this._virtualAppointments[virtualGroupIndex].items.data.push(appointmentData);
        this._virtualAppointments[virtualGroupIndex].items.colors.push(color);
        $appointment.remove()
    },
    _renderContentImpl: function() {
        this.callBase();
        this._renderDropDownAppointments()
    },
    _renderDropDownAppointments: function() {
        (0, _iterator.each)(this._virtualAppointments, function(groupIndex) {
            var virtualGroup = this._virtualAppointments[groupIndex],
                virtualItems = virtualGroup.items,
                virtualCoordinates = virtualGroup.coordinates,
                $container = virtualGroup.isAllDay ? this.option("allDayContainer") : this.$element(),
                left = virtualCoordinates.left;
            var buttonWidth = this.invoke("getCompactAppointmentGroupMaxWidth", virtualGroup.isAllDay),
                rtlOffset = 0;
            if (this.option("rtlEnabled")) {
                rtlOffset = buttonWidth
            }
            this.notifyObserver("renderDropDownAppointments", {
                $container: $container,
                coordinates: {
                    top: virtualCoordinates.top,
                    left: left + rtlOffset
                },
                items: virtualItems,
                buttonColor: virtualGroup.buttonColor,
                itemTemplate: this.option("itemTemplate"),
                buttonWidth: buttonWidth - this.option("_appointmentGroupButtonOffset"),
                onAppointmentClick: this.option("onItemClick"),
                isCompact: !virtualGroup.isAllDay && this.invoke("supportCompactDropDownAppointments")
            })
        }.bind(this))
    },
    _sortAppointmentsByStartDate: function(appointments) {
        appointments.sort(function(a, b) {
            var result = 0,
                firstDate = new Date(this.invoke("getField", "startDate", a.settings || a)).getTime(),
                secondDate = new Date(this.invoke("getField", "startDate", b.settings || b)).getTime();
            if (firstDate < secondDate) {
                result = -1
            }
            if (firstDate > secondDate) {
                result = 1
            }
            return result
        }.bind(this))
    },
    _processRecurrenceAppointment: function(appointment, index, skipLongAppointments) {
        var recurrenceRule = this.invoke("getField", "recurrenceRule", appointment),
            result = {
                parts: [],
                indexes: []
            };
        if (recurrenceRule) {
            var dates = appointment.settings || appointment;
            var startDate = new Date(this.invoke("getField", "startDate", dates)),
                endDate = new Date(this.invoke("getField", "endDate", dates)),
                appointmentDuration = endDate.getTime() - startDate.getTime(),
                recurrenceException = this.invoke("getField", "recurrenceException", appointment),
                startViewDate = this.invoke("getStartViewDate"),
                endViewDate = this.invoke("getEndViewDate"),
                recurrentDates = _utils2.default.getDatesByRecurrence({
                    rule: recurrenceRule,
                    exception: recurrenceException,
                    start: startDate,
                    end: endDate,
                    min: startViewDate,
                    max: endViewDate
                }),
                recurrentDateCount = appointment.settings ? 1 : recurrentDates.length;
            for (var i = 0; i < recurrentDateCount; i++) {
                var appointmentPart = (0, _extend.extend)({}, appointment, true);
                if (recurrentDates[i]) {
                    var appointmentSettings = this._applyStartDateToObj(recurrentDates[i], {});
                    this._applyEndDateToObj(new Date(recurrentDates[i].getTime() + appointmentDuration), appointmentSettings);
                    appointmentPart.settings = appointmentSettings
                } else {
                    appointmentPart.settings = dates
                }
                result.parts.push(appointmentPart);
                if (!skipLongAppointments) {
                    this._processLongAppointment(appointmentPart, result)
                }
            }
            result.indexes.push(index)
        }
        return result
    },
    _processLongAppointment: function(appointment, result) {
        var parts = this.splitAppointmentByDay(appointment),
            partCount = parts.length,
            endViewDate = this.invoke("getEndViewDate").getTime(),
            startViewDate = this.invoke("getStartViewDate").getTime(),
            startDateTimeZone = this.invoke("getField", "startDateTimeZone", appointment);
        result = result || {
            parts: []
        };
        if (partCount > 1) {
            (0, _extend.extend)(appointment, parts[0]);
            for (var i = 1; i < partCount; i++) {
                var startDate = this.invoke("getField", "startDate", parts[i].settings).getTime();
                startDate = this.invoke("convertDateByTimezone", startDate, startDateTimeZone);
                if (startDate < endViewDate && startDate > startViewDate) {
                    result.parts.push(parts[i])
                }
            }
        }
        return result
    },
    _reduceRecurrenceAppointments: function(recurrenceIndexes, appointments) {
        (0, _iterator.each)(recurrenceIndexes, function(i, index) {
            appointments.splice(index - i, 1)
        })
    },
    _combineAppointments: function(appointments, additionalAppointments) {
        if (additionalAppointments.length) {
            _array2.default.merge(appointments, additionalAppointments)
        }
        this._sortAppointmentsByStartDate(appointments)
    },
    _applyStartDateToObj: function(startDate, obj) {
        this.invoke("setField", "startDate", obj, startDate);
        return obj
    },
    _applyEndDateToObj: function(endDate, obj) {
        this.invoke("setField", "endDate", obj, endDate);
        return obj
    },
    updateDraggablesBoundOffsets: function() {
        if (this.option("allowDrag")) {
            this.$element().find("." + APPOINTMENT_ITEM_CLASS).each(function(_, appointmentElement) {
                var $appointment = (0, _renderer2.default)(appointmentElement),
                    appointmentData = this._getItemData($appointment);
                if (!this.invoke("isAllDay", appointmentData)) {
                    _draggable2.default.getInstance($appointment).option("boundOffset", this._calculateBoundOffset())
                }
            }.bind(this))
        }
    },
    moveAppointmentBack: function() {
        var $appointment = this._$currentAppointment,
            size = this._initialSize,
            coords = this._initialCoordinates;
        if ($appointment) {
            if (coords) {
                _translator2.default.move($appointment, coords);
                delete this._initialSize
            }
            if (size) {
                $appointment.outerWidth(size.width);
                $appointment.outerHeight(size.height);
                delete this._initialCoordinates
            }
        }
    },
    focus: function() {
        var $appointment = this._$currentAppointment;
        if ($appointment) {
            this.option("focusedElement", (0, _dom.getPublicElement)($appointment));
            _events_engine2.default.trigger(this.option("focusedElement"), "focus")
        }
    },
    splitAppointmentByDay: function(appointment) {
        var dates = appointment.settings || appointment;
        var originalStartDate = new Date(this.invoke("getField", "startDate", dates)),
            startDate = _date2.default.makeDate(originalStartDate),
            endDate = _date2.default.makeDate(this.invoke("getField", "endDate", dates)),
            startDateTimeZone = this.invoke("getField", "startDateTimeZone", appointment),
            endDateTimeZone = this.invoke("getField", "endDateTimeZone", appointment),
            maxAllowedDate = this.invoke("getEndViewDate"),
            startDayHour = this.invoke("getStartDayHour"),
            endDayHour = this.invoke("getEndDayHour"),
            appointmentIsLong = this.invoke("appointmentTakesSeveralDays", appointment),
            result = [];
        startDate = this.invoke("convertDateByTimezone", startDate, startDateTimeZone);
        endDate = this.invoke("convertDateByTimezone", endDate, endDateTimeZone);
        if (startDate.getHours() <= endDayHour && startDate.getHours() >= startDayHour && !appointmentIsLong) {
            result.push(this._applyStartDateToObj(new Date(startDate), {
                appointmentData: appointment
            }));
            startDate.setDate(startDate.getDate() + 1)
        }
        while (appointmentIsLong && startDate.getTime() < endDate.getTime() - 1 && startDate < maxAllowedDate) {
            var currentStartDate = new Date(startDate),
                currentEndDate = new Date(startDate);
            this._checkStartDate(currentStartDate, originalStartDate, startDayHour);
            this._checkEndDate(currentEndDate, endDate, endDayHour);
            var appointmentData = _object2.default.deepExtendArraySafe({}, appointment, true),
                appointmentSettings = {};
            this._applyStartDateToObj(currentStartDate, appointmentSettings);
            this._applyEndDateToObj(currentEndDate, appointmentSettings);
            appointmentData.settings = appointmentSettings;
            result.push(appointmentData);
            startDate.setDate(startDate.getDate() + 1);
            startDate.setHours(startDayHour)
        }
        return result
    },
    _checkStartDate: function(currentDate, originalDate, startDayHour) {
        if (!_date2.default.sameDate(currentDate, originalDate) || currentDate.getHours() <= startDayHour) {
            currentDate.setHours(startDayHour, 0, 0, 0)
        } else {
            currentDate.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds(), originalDate.getMilliseconds())
        }
    },
    _checkEndDate: function(currentDate, originalDate, endDayHour) {
        if (!_date2.default.sameDate(currentDate, originalDate) || currentDate.getHours() > endDayHour) {
            currentDate.setHours(endDayHour, 0, 0, 0)
        } else {
            currentDate.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds(), originalDate.getMilliseconds())
        }
    }
}).include(_uiScheduler2.default);
(0, _component_registrator2.default)("dxSchedulerAppointments", SchedulerAppointments);
module.exports = SchedulerAppointments;
