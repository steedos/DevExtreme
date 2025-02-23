/**
 * DevExtreme (viz/vector_map/layout.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var inArray = require("../../core/utils/array").inArray,
    each = require("../../core/utils/iterator").each,
    _round = Math.round,
    _min = Math.min,
    _max = Math.max,
    _each = each,
    _inArray = inArray,
    horizontalAlignmentMap = {
        left: 0,
        center: 1,
        right: 2
    },
    verticalAlignmentMap = {
        top: 0,
        bottom: 1
    };

function getCellIndex(options) {
    return 3 * verticalAlignmentMap[options.verticalAlignment] + horizontalAlignmentMap[options.horizontalAlignment]
}

function createCells(canvas, items) {
    var hStep = (canvas.right - canvas.left) / 3,
        vStep = (canvas.bottom - canvas.top) / 2,
        h1 = canvas.left,
        h2 = _round(h1 + hStep),
        h3 = _round(h1 + hStep + hStep),
        h4 = canvas.right,
        v1 = canvas.top,
        v2 = _round(v1 + vStep),
        v3 = canvas.bottom,
        cells = [{
            rect: [h1, v1, h2, v2]
        }, {
            rect: [h2, v1, h3, v2],
            center: true
        }, {
            rect: [h3, v1, h4, v2],
            horInversion: true
        }, {
            rect: [h1, v2, h2, v3],
            verInversion: true
        }, {
            rect: [h2, v2, h3, v3],
            center: true,
            verInversion: true
        }, {
            rect: [h3, v2, h4, v3],
            horInversion: true,
            verInversion: true
        }],
        itemsList = [
            [],
            [],
            [],
            [],
            [],
            []
        ];
    _each(items, function(_, item) {
        var options = item.getLayoutOptions();
        if (options) {
            itemsList[getCellIndex(options)].push({
                item: item,
                width: options.width,
                height: options.height
            })
        }
    });
    _each(cells, function(i, cell) {
        if (itemsList[i].length) {
            cell.items = itemsList[i]
        } else {
            if (cell.center) {
                cell.rect[0] = cell.rect[2] = (cell.rect[0] + cell.rect[2]) / 2
            } else {
                cell.rect[cell.horInversion ? 0 : 2] = cell.rect[cell.horInversion ? 2 : 0]
            }
            cell.rect[cell.verInversion ? 1 : 3] = cell.rect[cell.verInversion ? 3 : 1]
        }
    });
    return cells
}

function adjustCellSizes(cells) {
    _each([0, 1, 2, 3, 4, 5], function(_, index) {
        var cell = cells[index],
            otherCell = cells[(index + 3) % 6];
        if (cell.items) {
            if (!otherCell.items) {
                cell.rect[1] = _min(cell.rect[1], otherCell.rect[3]);
                cell.rect[3] = _max(cell.rect[3], otherCell.rect[1])
            }
        }
    });
    _each([1, 4], function(_, index) {
        var size1, size2, cell = cells[index],
            otherCell1 = cells[index - 1],
            otherCell2 = cells[index + 1];
        if (cell.items) {
            if (!otherCell1.items && !otherCell2.items) {
                size1 = cell.rect[0] - otherCell1.rect[2];
                size2 = otherCell2.rect[0] - cell.rect[2];
                if (size1 > size2) {
                    if (size1 / size2 >= 2) {
                        cell.rect[0] -= size1;
                        cell.right = true
                    } else {
                        cell.rect[0] -= size2;
                        cell.rect[2] += size2
                    }
                } else {
                    if (size2 / size1 >= 2) {
                        cell.rect[2] += size2;
                        cell.center = null
                    } else {
                        cell.rect[0] -= size1;
                        cell.rect[2] += size1
                    }
                }
            }
        } else {
            if (otherCell1.items) {
                otherCell1.rect[2] = (cell.rect[0] + cell.rect[2]) / 2
            }
            if (otherCell2.items) {
                otherCell2.rect[0] = (cell.rect[0] + cell.rect[2]) / 2
            }
        }
    })
}

function adjustCellsAndApplyLayout(cells, forceMode) {
    var hasHiddenItems = false;
    adjustCellSizes(cells);
    _each(cells, function(_, cell) {
        if (cell.items) {
            hasHiddenItems = applyCellLayout(cell, forceMode) || hasHiddenItems
        }
    });
    return hasHiddenItems
}

function applyCellLayout(cell, forceMode) {
    var cellRect = cell.rect,
        cellWidth = cellRect[2] - cellRect[0],
        cellHeight = cellRect[3] - cellRect[1],
        xOffset = 0,
        yOffset = 0,
        currentHeight = 0,
        totalL = cellRect[2],
        totalT = cellRect[3],
        totalR = cellRect[0],
        totalB = cellRect[1],
        moves = [],
        hasHiddenItems = false;
    _each(cell.items, function(_, item) {
        if (item.width > cellWidth || item.height > cellHeight) {
            moves.push(null);
            hasHiddenItems = true;
            return forceMode || false
        }
        if (xOffset + item.width > cellWidth) {
            yOffset += currentHeight;
            xOffset = currentHeight = 0
        }
        if (yOffset + item.height > cellHeight) {
            moves.push(null);
            hasHiddenItems = true;
            return forceMode || false
        }
        currentHeight = _max(currentHeight, item.height);
        var dx = cell.horInversion ? cellRect[2] - item.width - xOffset : cellRect[0] + xOffset,
            dy = cell.verInversion ? cellRect[3] - item.height - yOffset : cellRect[1] + yOffset;
        xOffset += item.width;
        totalL = _min(totalL, dx);
        totalT = _min(totalT, dy);
        totalR = _max(totalR, dx + item.width);
        totalB = _max(totalB, dy + item.height);
        moves.push([dx, dy])
    });
    if (forceMode || !hasHiddenItems) {
        xOffset = 0;
        if (cell.right) {
            xOffset = cellRect[2] - cellRect[0] - totalR + totalL
        } else {
            if (cell.center) {
                xOffset = _round((cellRect[2] - cellRect[0] - totalR + totalL) / 2)
            }
        }
        _each(cell.items, function(i, item) {
            var move = moves[i];
            if (move) {
                item.item.locate(move[0] + xOffset, move[1])
            } else {
                item.item.resize(null)
            }
        });
        cell.rect = [totalL, totalT, totalR, totalB];
        cell.items = null
    }
    return hasHiddenItems
}

function applyLayout(canvas, items) {
    var cells = createCells(canvas, items);
    if (adjustCellsAndApplyLayout(cells)) {
        adjustCellsAndApplyLayout(cells, true)
    }
}

function LayoutControl() {
    var that = this;
    that._items = [];
    that._suspended = 0;
    that._updateLayout = function() {
        that._update()
    }
}
LayoutControl.prototype = {
    constructor: LayoutControl,
    dispose: function() {
        this._items = this._updateLayout = null
    },
    setSize: function(canvas) {
        this._canvas = canvas;
        this._update()
    },
    suspend: function() {
        ++this._suspended
    },
    resume: function() {
        if (0 === --this._suspended) {
            this._update()
        }
    },
    addItem: function(item) {
        this._items.push(item);
        item.updateLayout = this._updateLayout
    },
    removeItem: function(item) {
        this._items.splice(_inArray(item, this._items), 1);
        item.updateLayout = null
    },
    _update: function() {
        var canvas;
        if (0 === this._suspended) {
            canvas = this._canvas;
            _each(this._items, function(_, item) {
                item.resize(canvas)
            });
            applyLayout({
                left: canvas.left,
                top: canvas.top,
                right: canvas.width + canvas.left,
                bottom: canvas.height + canvas.top
            }, this._items)
        }
    }
};
exports.LayoutControl = LayoutControl;
