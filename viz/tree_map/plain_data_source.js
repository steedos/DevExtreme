/**
 * DevExtreme (viz/tree_map/plain_data_source.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var proto = require("./tree_map.base").prototype;
proto._optionChangesMap.idField = proto._optionChangesMap.parentField = "NODES_CREATE";
proto._processDataSourceItems = function(items) {
    var i, currentItem, parentId, tmpItems, item, struct = {},
        idField = this._getOption("idField", true),
        parentField = this._getOption("parentField", true),
        rootNodes = [];
    if (!idField || !parentField || 0 === items.length) {
        return {
            items: items,
            isPlain: true
        }
    }
    for (i = 0; i < items.length; i++) {
        currentItem = items[i];
        parentId = currentItem[parentField];
        if (parentId) {
            struct[parentId] = struct[parentId] || {
                items: []
            };
            tmpItems = struct[parentId].items
        } else {
            tmpItems = rootNodes
        }
        tmpItems.push(currentItem)
    }
    treeFiller({
        struct: struct,
        idField: idField
    }, rootNodes);
    for (item in struct) {
        struct[item] && rootNodes.push(struct[item])
    }
    return {
        items: rootNodes,
        isPlain: true
    }
};

function treeFiller(context, items) {
    var currentItem, i, id, struct = context.struct;
    for (i = 0; i < items.length; i++) {
        currentItem = items[i];
        id = currentItem[context.idField];
        if (struct[id]) {
            currentItem.items = struct[id].items;
            struct[id] = null;
            treeFiller(context, currentItem.items)
        }
    }
}
