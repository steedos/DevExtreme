/**
 * DevExtreme (ui/scheduler/ui.scheduler.appointments.drop_down.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _class = require("../../core/class");
var _class2 = _interopRequireDefault(_class);
var _translator = require("../../animation/translator");
var _translator2 = _interopRequireDefault(_translator);
var _type = require("../../core/utils/type");
var _type2 = _interopRequireDefault(_type);
var _drag = require("../../events/drag");
var _drag2 = _interopRequireDefault(_drag);
var _utils = require("../../events/utils");
var _utils2 = _interopRequireDefault(_utils);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _button = require("../button");
var _button2 = _interopRequireDefault(_button);
var _drop_down_menu = require("../drop_down_menu");
var _drop_down_menu2 = _interopRequireDefault(_drop_down_menu);
var _function_template = require("../widget/function_template");
var _function_template2 = _interopRequireDefault(_function_template);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _extend = require("../../core/utils/extend");
var _deferred = require("../../core/utils/deferred");
var _deferred2 = _interopRequireDefault(_deferred);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var when = _deferred2.default.when;
var OFFSET = 5,
    REMOVE_BUTTON_SIZE = 25;
var DROPDOWN_APPOINTMENTS_CLASS = "dx-scheduler-dropdown-appointments",
    COMPACT_DROPDOWN_APPOINTMENTS_CLASS = DROPDOWN_APPOINTMENTS_CLASS + "-compact",
    DROPDOWN_APPOINTMENTS_CONTENT_CLASS = "dx-scheduler-dropdown-appointments-content",
    DROPDOWN_APPOINTMENT_CLASS = "dx-scheduler-dropdown-appointment",
    DROPDOWN_APPOINTMENT_TITLE_CLASS = "dx-scheduler-dropdown-appointment-title",
    DROPDOWN_APPOINTMENT_DATE_CLASS = "dx-scheduler-dropdown-appointment-date",
    DROPDOWN_APPOINTMENT_REMOVE_BUTTON_CLASS = "dx-scheduler-dropdown-appointment-remove-button",
    DROPDOWN_APPOINTMENT_INFO_BLOCK_CLASS = "dx-scheduler-dropdown-appointment-info-block",
    DROPDOWN_APPOINTMENT_BUTTONS_BLOCK_CLASS = "dx-scheduler-dropdown-appointment-buttons-block",
    ALL_DAY_PANEL_APPOINTMENT_CLASS = "dx-scheduler-all-day-appointment";
var DRAG_START_EVENT_NAME = _utils2.default.addNamespace(_drag2.default.start, "dropDownAppointments"),
    DRAG_UPDATE_EVENT_NAME = _utils2.default.addNamespace(_drag2.default.move, "dropDownAppointments"),
    DRAG_END_EVENT_NAME = _utils2.default.addNamespace(_drag2.default.end, "dropDownAppointments");
var SIDE_BORDER_COLOR_STYLES = {
    left: "borderLeftColor",
    top: "borderTopColor",
    right: "borderRightColor",
    bottom: "borderBottomColor"
};
var dropDownAppointments = _class2.default.inherit({
    render: function(options, instance) {
        this.instance = instance;
        var coordinates = options.coordinates,
            items = options.items,
            buttonWidth = options.buttonWidth,
            offset = 0;
        var $menu = (0, _renderer2.default)("<div>").addClass(DROPDOWN_APPOINTMENTS_CLASS).appendTo(options.$container);
        if (options.isCompact) {
            $menu.addClass(COMPACT_DROPDOWN_APPOINTMENTS_CLASS);
            offset = this.instance.fire("getCellWidth") - buttonWidth - OFFSET
        }
        this._createAppointmentClickAction();
        this._createDropDownMenu({
            $element: $menu,
            items: items,
            itemTemplate: options.itemTemplate,
            buttonWidth: buttonWidth
        }, options.isCompact);
        when.apply(null, options.items.colors).done(function() {
            this._paintMenuButton($menu, options.buttonColor, arguments)
        }.bind(this));
        this._applyInnerShadow($menu, options.buttonWidth);
        _translator2.default.move($menu, {
            top: coordinates.top,
            left: coordinates.left + offset
        });
        return $menu
    },
    repaintExisting: function($container) {
        var appointmentsSelector = ["", DROPDOWN_APPOINTMENTS_CLASS, "dx-dropdownmenu"].join(".");
        $container.find(appointmentsSelector).each(function() {
            _drop_down_menu2.default.getInstance(this).repaint()
        })
    },
    _paintMenuButton: function($menu, color, itemsColors) {
        var paintButton = true,
            currentItemColor = void 0;
        color && color.done(function(color) {
            if (itemsColors.length) {
                currentItemColor = itemsColors[0];
                for (var i = 1; i < itemsColors.length; i++) {
                    if (currentItemColor !== itemsColors[i]) {
                        paintButton = false;
                        break
                    }
                    currentItemColor = color
                }
            }
            color && paintButton && $menu.css("backgroundColor", color)
        }.bind(this))
    },
    _applyInnerShadow: function($element) {
        $element.css("boxShadow", "inset " + $element.get(0).getBoundingClientRect().width + "px 0 0 0 rgba(0, 0, 0, 0.3)")
    },
    _createAppointmentClickAction: function() {
        this._appointmentClickAction = this.instance._createActionByOption("onAppointmentClick", {
            afterExecute: function(e) {
                var config = e.args[0];
                config.event.stopPropagation();
                this.instance.fire("showEditAppointmentPopup", {
                    data: config.appointmentData
                })
            }.bind(this)
        })
    },
    _createDropDownMenu: function(config, isCompact) {
        var $menu = config.$element,
            items = config.items;
        if (!_drop_down_menu2.default.getInstance($menu)) {
            this._initDynamicTemplate(items);
            this._initDynamicButtonTemplate(items.data.length, isCompact);
            var template = this.instance._getAppointmentTemplate("dropDownAppointmentTemplate"),
                buttonTemplate = this.instance._getAppointmentTemplate("appointmentCollectorTemplate");
            this.instance._createComponent($menu, _drop_down_menu2.default, {
                buttonIcon: null,
                usePopover: true,
                popupHeight: "auto",
                popupMaxHeight: 200,
                items: items.data,
                buttonTemplate: this._createListButtonTemplate(buttonTemplate, items, isCompact),
                itemTemplate: this._createListItemTemplate(template),
                buttonWidth: config.buttonWidth,
                closeOnClick: false,
                activeStateEnabled: false,
                focusStateEnabled: this.instance.option("focusStateEnabled"),
                onItemClick: this._onListItemClick.bind(this),
                onItemRendered: function(args) {
                    this._onListItemRenderedCore(args, $menu)
                }.bind(this)
            })
        }
    },
    _createListButtonTemplate: function(template, items, isCompact) {
        return new _function_template2.default(function(options) {
            var model = {
                appointmentCount: items.data.length,
                isCompact: isCompact
            };
            return template.render({
                model: model,
                container: options.container
            })
        })
    },
    _createListItemTemplate: function(template) {
        return new _function_template2.default(function(options) {
            return template.render({
                model: options.model,
                index: options.index,
                container: options.container
            })
        })
    },
    _onListItemClick: function(args) {
        var mappedData = this.instance.fire("mapAppointmentFields", args),
            result = (0, _extend.extendFromObject)(mappedData, args, false);
        this._appointmentClickAction(this._clearExcessFields(result))
    },
    _onListItemRenderedCore: function(args, $menu) {
        var _this = this;
        if (!this.instance._allowDragging()) {
            return
        }
        var $item = args.itemElement,
            itemData = args.itemData,
            settings = itemData.settings;
        _events_engine2.default.on($item, DRAG_START_EVENT_NAME, function(e) {
            _this._onAppointmentDragStart(e, itemData, settings)
        });
        _events_engine2.default.on($item, DRAG_UPDATE_EVENT_NAME, function(e) {
            _drop_down_menu2.default.getInstance($menu).close();
            _this._onAppointmentDragUpdate(e, itemData.allDay)
        });
        _events_engine2.default.on($item, DRAG_END_EVENT_NAME, function() {
            _this._onAppointmentDragEnd(itemData)
        })
    },
    _onAppointmentDragStart: function(eventArgs, itemData, settings) {
        var appointmentInstance = this.instance.getAppointmentsInstance(),
            appointmentIndex = appointmentInstance.option("items").length;
        settings[0].isCompact = false;
        settings[0].virtual = false;
        var appointmentData = {
            itemData: itemData,
            settings: settings
        };
        appointmentInstance._currentAppointmentSettings = settings;
        appointmentInstance._renderItem(appointmentIndex, appointmentData);
        var $items = appointmentInstance._findItemElementByItem(itemData);
        if ($items.length > 0) {
            this._prepareDragItem(eventArgs, $items, appointmentData.settings)
        }
    },
    _onAppointmentDragUpdate: function(e, allDay) {
        var coordinates = {
            left: this._startPosition.left + e.offset.x,
            top: this._startPosition.top + e.offset.y
        };
        this.instance.getAppointmentsInstance().notifyObserver("correctAppointmentCoordinates", {
            coordinates: coordinates,
            allDay: allDay,
            isFixedContainer: false,
            callback: function(result) {
                if (result) {
                    coordinates = result
                }
            }
        });
        _translator2.default.move(this._$draggedItem, coordinates)
    },
    _onAppointmentDragEnd: function(itemData) {
        var appointments = this.instance.getAppointmentsInstance(),
            newCellIndex = this.instance._workSpace.getDroppableCellIndex(),
            oldCellIndex = this.instance._workSpace.getCellIndexByCoordinates(this._startPosition);
        _events_engine2.default.trigger(this._$draggedItem, "dxdragend");
        newCellIndex === oldCellIndex && appointments._clearItem({
            itemData: itemData
        });
        delete this._$draggedItem
    },
    _clearExcessFields: function(data) {
        delete data.itemData;
        delete data.itemIndex;
        delete data.itemElement;
        return data
    },
    _prepareDragItem: function(eventArgs, $items, settings) {
        var scheduler = this.instance;
        var dragContainerOffset = this._getDragContainerOffset();
        this._$draggedItem = $items.length > 1 ? this._getRecurrencePart($items, settings[0].startDate) : $items[0];
        var scrollTop = this._$draggedItem.hasClass(ALL_DAY_PANEL_APPOINTMENT_CLASS) ? scheduler._workSpace.getAllDayHeight() : scheduler._workSpace.getScrollableScrollTop();
        this._startPosition = {
            top: eventArgs.pageY - dragContainerOffset.top - this._$draggedItem.height() / 2 + scrollTop,
            left: eventArgs.pageX - dragContainerOffset.left - this._$draggedItem.width() / 2
        };
        _translator2.default.move(this._$draggedItem, this._startPosition);
        _events_engine2.default.trigger(this._$draggedItem, "dxdragstart")
    },
    _getDragContainerOffset: function() {
        return this.instance._$element.find(".dx-scheduler-date-table-scrollable .dx-scrollable-wrapper").offset()
    },
    _getRecurrencePart: function(appointments, startDate) {
        var result;
        for (var i = 0; i < appointments.length; i++) {
            var $appointment = appointments[i],
                appointmentStartDate = $appointment.data("dxAppointmentStartDate");
            if (appointmentStartDate.getTime() === startDate.getTime()) {
                result = $appointment
            }
        }
        return result
    },
    _initDynamicTemplate: function(items) {
        var _this2 = this;
        this.instance._defaultTemplates.dropDownAppointment = new _function_template2.default(function(options) {
            return _this2._createDropDownAppointmentTemplate(options.model, (0, _renderer2.default)(options.container), items.colors[options.index])
        })
    },
    _initDynamicButtonTemplate: function(count, isCompact) {
        var _this3 = this;
        this.instance._defaultTemplates.appointmentCollector = new _function_template2.default(function(options) {
            return _this3._createButtonTemplate(count, (0, _renderer2.default)(options.container), isCompact)
        })
    },
    _createButtonTemplate: function(appointmentCount, element, isCompact) {
        var text = isCompact ? appointmentCount : _message2.default.getFormatter("dxScheduler-moreAppointments")(appointmentCount);
        return element.append([(0, _renderer2.default)("<span>").text(text)]).addClass(DROPDOWN_APPOINTMENTS_CONTENT_CLASS)
    },
    _createDropDownAppointmentTemplate: function(appointmentData, appointmentElement, color) {
        var $title, $date, $infoBlock, dateString = "",
            appointmentMarkup = [],
            borderSide = "left",
            text = this.instance.fire("getField", "text", appointmentData);
        appointmentElement.addClass(DROPDOWN_APPOINTMENT_CLASS);
        if (this.instance.option("rtlEnabled")) {
            borderSide = "right"
        }
        color && color.done(function(color) {
            appointmentElement.css(SIDE_BORDER_COLOR_STYLES[borderSide], color)
        });
        var startDate = this.instance.fire("getField", "startDate", appointmentData),
            endDate = this.instance.fire("getField", "endDate", appointmentData),
            startDateTimeZone = this.instance.fire("getField", "startDateTimeZone", appointmentData),
            endDateTimeZone = this.instance.fire("getField", "endDateTimeZone", appointmentData);
        startDate = this.instance.fire("convertDateByTimezone", startDate, startDateTimeZone);
        endDate = this.instance.fire("convertDateByTimezone", endDate, endDateTimeZone);
        this.instance.fire("formatDates", {
            startDate: startDate,
            endDate: endDate,
            formatType: "DATETIME",
            callback: function(result) {
                dateString = result
            }
        });
        $infoBlock = (0, _renderer2.default)("<div>").addClass(DROPDOWN_APPOINTMENT_INFO_BLOCK_CLASS);
        $title = (0, _renderer2.default)("<div>").addClass(DROPDOWN_APPOINTMENT_TITLE_CLASS).text(text);
        $date = (0, _renderer2.default)("<div>").addClass(DROPDOWN_APPOINTMENT_DATE_CLASS).text(dateString);
        $infoBlock.append([$title, $date]);
        appointmentMarkup.push($infoBlock);
        appointmentMarkup.push(this._createButtons(appointmentData));
        appointmentElement.append(appointmentMarkup);
        return appointmentElement
    },
    _createButtons: function(appointmentData) {
        var _this4 = this;
        var editing = this.instance.option("editing"),
            allowDeleting = false;
        if (!editing) {
            return ""
        }
        if (true === editing) {
            allowDeleting = true
        }
        if (_type2.default.isObject(editing)) {
            allowDeleting = editing.allowDeleting
        }
        var $container = (0, _renderer2.default)("<div>").addClass(DROPDOWN_APPOINTMENT_BUTTONS_BLOCK_CLASS),
            $removeButton = (0, _renderer2.default)("<div>").addClass(DROPDOWN_APPOINTMENT_REMOVE_BUTTON_CLASS);
        if (allowDeleting) {
            $container.append($removeButton);
            this.instance._createComponent($removeButton, _button2.default, {
                icon: "trash",
                height: REMOVE_BUTTON_SIZE,
                width: REMOVE_BUTTON_SIZE,
                onClick: function(e) {
                    e.event.stopPropagation();
                    _this4.instance.deleteAppointment(appointmentData)
                }
            })
        }
        return $container
    }
});
module.exports = dropDownAppointments;
