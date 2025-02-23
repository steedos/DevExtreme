/**
 * DevExtreme (ui/shared/grouped_data_converter_mixin.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _type = require("../../core/utils/type");
var isCorrectStructure = function(data) {
    return Array.isArray(data) && data.every(function(item) {
        var hasTwoFields = 2 === Object.keys(item).length;
        var hasCorrectFields = "key" in item && "items" in item;
        return hasTwoFields && hasCorrectFields && Array.isArray(item.items)
    })
};
exports.default = {
    _getSpecificDataSourceOption: function() {
        var groupKey = "key";
        var dataSource = this.option("dataSource");
        var hasSimpleItems = false;
        var data = {};
        if (this._getGroupedOption() && isCorrectStructure(dataSource)) {
            data = dataSource.reduce(function(accumulator, item) {
                var items = item.items.map(function(innerItem) {
                    if (!(0, _type.isObject)(innerItem)) {
                        innerItem = {
                            text: innerItem
                        };
                        hasSimpleItems = true
                    }
                    if (!(groupKey in innerItem)) {
                        innerItem[groupKey] = item.key
                    }
                    return innerItem
                });
                return accumulator.concat(items)
            }, []);
            dataSource = {
                store: {
                    type: "array",
                    data: data
                },
                group: {
                    selector: "key",
                    keepInitialKeyOrder: true
                }
            };
            if (hasSimpleItems) {
                dataSource.searchExpr = "text"
            }
        }
        return dataSource
    }
};
