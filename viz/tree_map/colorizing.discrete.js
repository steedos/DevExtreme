/**
 * DevExtreme (viz/tree_map/colorizing.discrete.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";

function discreteColorizer(options, themeManager, root) {
    var palette = themeManager.createPalette(options.palette, {
        useHighlight: true,
        extensionMode: options.paletteExtensionMode
    });
    return (options.colorizeGroups ? discreteGroupColorizer : discreteLeafColorizer)(palette, root)
}

function getLeafsCount(root) {
    var i, node, allNodes = root.nodes.slice(),
        ii = allNodes.length,
        count = 0;
    for (i = 0; i < ii; ++i) {
        node = allNodes[i];
        if (node.isNode()) {
            count = Math.max(count, getLeafsCount(node))
        } else {
            count += 1
        }
    }
    return count
}

function discreteLeafColorizer(palette, root) {
    var i, colors = [],
        count = getLeafsCount(root);
    for (i = 0; i < count; ++i) {
        colors.push(palette.getNextColor(count))
    }
    return function(node) {
        return colors[node.index]
    }
}

function getNodesCount(root) {
    var i, node, allNodes = root.nodes.slice(),
        ii = allNodes.length,
        count = 0;
    for (i = 0; i < ii; ++i) {
        node = allNodes[i];
        if (node.isNode()) {
            count += getNodesCount(node) + 1
        }
    }
    return count
}

function prepareDiscreteGroupColors(palette, root) {
    var i, node, colors = {},
        allNodes = root.nodes.slice(),
        ii = allNodes.length,
        count = getNodesCount(root);
    for (i = 0; i < ii; ++i) {
        node = allNodes[i];
        if (node.isNode()) {
            allNodes = allNodes.concat(node.nodes);
            ii = allNodes.length
        } else {
            if (!colors[node.parent._id]) {
                colors[node.parent._id] = palette.getNextColor(count)
            }
        }
    }
    return colors
}

function discreteGroupColorizer(palette, root) {
    var colors = prepareDiscreteGroupColors(palette, root);
    return function(node) {
        return colors[node._id]
    }
}
require("./colorizing").addColorizer("discrete", discreteColorizer);
module.exports = discreteColorizer;
