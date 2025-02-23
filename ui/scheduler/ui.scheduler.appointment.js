/**
 * DevExtreme (ui/scheduler/ui.scheduler.appointment.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _translator = require("../../animation/translator");
var _translator2 = _interopRequireDefault(_translator);
var _utils = require("./utils.recurrence");
var _utils2 = _interopRequireDefault(_utils);
var _extend = require("../../core/utils/extend");
var _component_registrator = require("../../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _ui = require("../tooltip/ui.tooltip");
var _ui2 = _interopRequireDefault(_ui);
var _uiScheduler = require("./ui.scheduler.publisher_mixin");
var _uiScheduler2 = _interopRequireDefault(_uiScheduler);
var _utils3 = require("../../events/utils");
var _utils4 = _interopRequireDefault(_utils3);
var _pointer = require("../../events/pointer");
var _pointer2 = _interopRequireDefault(_pointer);
var _dom_component = require("../../core/dom_component");
var _dom_component2 = _interopRequireDefault(_dom_component);
var _resizable = require("../resizable");
var _resizable2 = _interopRequireDefault(_resizable);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _date = require("../../localization/date");
var _date2 = _interopRequireDefault(_date);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var DEFAULT_HORIZONTAL_HANDLES = "left right";
var DEFAULT_VERTICAL_HANDLES = "top bottom";
var REDUCED_APPOINTMENT_POINTERENTER_EVENT_NAME = _utils4.default.addNamespace(_pointer2.default.enter, "dxSchedulerAppointment"),
    REDUCED_APPOINTMENT_POINTERLEAVE_EVENT_NAME = _utils4.default.addNamespace(_pointer2.default.leave, "dxSchedulerAppointment");
var EMPTY_APPOINTMENT_CLASS = "dx-scheduler-appointment-empty",
    APPOINTMENT_ALL_DAY_ITEM_CLASS = "dx-scheduler-all-day-appointment",
    DIRECTION_APPOINTMENT_CLASSES = {
        horizontal: "dx-scheduler-appointment-horizontal",
        vertical: "dx-scheduler-appointment-vertical"
    },
    RECURRENCE_APPOINTMENT_CLASS = "dx-scheduler-appointment-recurrence",
    COMPACT_APPOINTMENT_CLASS = "dx-scheduler-appointment-compact",
    REDUCED_APPOINTMENT_CLASS = "dx-scheduler-appointment-reduced",
    REDUCED_APPOINTMENT_ICON = "dx-scheduler-appointment-reduced-icon",
    REDUCED_APPOINTMENT_PARTS_CLASSES = {
        head: "dx-scheduler-appointment-head",
        body: "dx-scheduler-appointment-body",
        tail: "dx-scheduler-appointment-tail"
    };
var Appointment = _dom_component2.default.inherit({
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            data: {},
            geometry: {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            },
            allowDrag: true,
            allowResize: true,
            reduced: null,
            isCompact: false,
            direction: "vertical",
            resizableConfig: {},
            cellHeight: 0,
            cellWidth: 0
        })
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "data":
            case "geometry":
            case "allowDrag":
            case "allowResize":
            case "reduced":
            case "sortedIndex":
            case "isCompact":
            case "direction":
            case "resizableConfig":
            case "cellHeight":
            case "cellWidth":
                this._invalidate();
                break;
            default:
                this.callBase(args)
        }
    },
    _getHorizontalResizingRule: function() {
        var reducedHandles = {
            head: this.option("rtlEnabled") ? "right" : "left",
            body: "",
            tail: this.option("rtlEnabled") ? "left" : "right"
        };
        return {
            handles: this.option("reduced") ? reducedHandles[this.option("reduced")] : DEFAULT_HORIZONTAL_HANDLES,
            minHeight: 0,
            minWidth: this.invoke("getCellWidth"),
            step: this.invoke("getResizableStep")
        }
    },
    _getVerticalResizingRule: function() {
        var height = this.invoke("getCellHeight");
        return {
            handles: DEFAULT_VERTICAL_HANDLES,
            minWidth: 0,
            minHeight: height,
            step: height
        }
    },
    _render: function() {
        this.callBase();
        this._renderAppointmentGeometry();
        this._renderEmptyClass();
        this._renderCompactClass();
        this._renderReducedAppointment();
        this._renderAllDayClass();
        this._renderDirection();
        this.$element().data("dxAppointmentStartDate", this.option("startDate"));
        this.$element().attr("title", this.invoke("getField", "text", this.option("data")));
        this.$element().attr("role", "button");
        this._renderRecurrenceClass();
        this._renderResizable()
    },
    _renderAppointmentGeometry: function() {
        var geometry = this.option("geometry"),
            $element = this.$element();
        _translator2.default.move($element, {
            top: geometry.top,
            left: geometry.left
        });
        $element.css({
            width: geometry.width < 0 ? 0 : geometry.width,
            height: geometry.height < 0 ? 0 : geometry.height
        })
    },
    _renderEmptyClass: function() {
        var geometry = this.option("geometry");
        if (geometry.empty || this.option("isCompact")) {
            this.$element().addClass(EMPTY_APPOINTMENT_CLASS)
        }
    },
    _renderReducedAppointment: function() {
        var reducedPart = this.option("reduced");
        if (!reducedPart) {
            return
        }
        this.$element().toggleClass(REDUCED_APPOINTMENT_CLASS, true).toggleClass(REDUCED_APPOINTMENT_PARTS_CLASSES[reducedPart], true);
        this._renderAppointmentReducedIcon()
    },
    _renderAppointmentReducedIcon: function() {
        var $icon = (0, _renderer2.default)("<div>").addClass(REDUCED_APPOINTMENT_ICON).appendTo(this.$element()),
            endDate = this._getEndDate();
        var tooltipLabel = _message2.default.format("dxScheduler-editorLabelEndDate"),
            tooltipText = [tooltipLabel, ": ", _date2.default.format(endDate, "monthAndDay"), ", ", _date2.default.format(endDate, "year")].join("");
        _events_engine2.default.off($icon, REDUCED_APPOINTMENT_POINTERENTER_EVENT_NAME);
        _events_engine2.default.on($icon, REDUCED_APPOINTMENT_POINTERENTER_EVENT_NAME, function() {
            _ui2.default.show({
                target: $icon,
                content: tooltipText
            })
        });
        _events_engine2.default.off($icon, REDUCED_APPOINTMENT_POINTERLEAVE_EVENT_NAME);
        _events_engine2.default.on($icon, REDUCED_APPOINTMENT_POINTERLEAVE_EVENT_NAME, function() {
            _ui2.default.hide()
        })
    },
    _getEndDate: function() {
        var result = this.invoke("getField", "endDate", this.option("data"));
        if (result) {
            return new Date(result)
        }
        return result
    },
    _renderAllDayClass: function() {
        this.$element().toggleClass(APPOINTMENT_ALL_DAY_ITEM_CLASS, !!this.option("allDay"))
    },
    _renderRecurrenceClass: function() {
        var rule = this.invoke("getField", "recurrenceRule", this.option("data"));
        if (_utils2.default.getRecurrenceRule(rule).isValid) {
            this.$element().addClass(RECURRENCE_APPOINTMENT_CLASS)
        }
    },
    _renderCompactClass: function() {
        this.$element().toggleClass(COMPACT_APPOINTMENT_CLASS, !!this.option("isCompact"))
    },
    _renderDirection: function() {
        this.$element().addClass(DIRECTION_APPOINTMENT_CLASSES[this.option("direction")])
    },
    _createResizingConfig: function() {
        var config = "vertical" === this.option("direction") ? this._getVerticalResizingRule() : this._getHorizontalResizingRule();
        config.roundStepValue = true;
        if (!this.invoke("isGroupedByDate")) {
            config.stepPrecision = "strict"
        }
        return config
    },
    _renderResizable: function() {
        if (this.option("allowResize") && !this.option("isCompact")) {
            this._createComponent(this.$element(), _resizable2.default, (0, _extend.extend)(this._createResizingConfig(), this.option("resizableConfig")))
        }
    }
}).include(_uiScheduler2.default);
(0, _component_registrator2.default)("dxSchedulerAppointment", Appointment);
module.exports = Appointment;
