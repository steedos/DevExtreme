/**
 * DevExtreme (data/data_source/data_source.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var Class = require("../../core/class"),
    extend = require("../../core/utils/extend").extend,
    commonUtils = require("../../core/utils/common"),
    iteratorUtils = require("../../core/utils/iterator"),
    ajax = require("../../core/utils/ajax"),
    typeUtils = require("../../core/utils/type"),
    dataUtils = require("../utils"),
    arrayUtils = require("../array_utils"),
    Store = require("../abstract_store"),
    ArrayStore = require("../array_store"),
    CustomStore = require("../custom_store"),
    EventsMixin = require("../../core/events_mixin"),
    errors = require("../errors").errors,
    array = require("../../core/utils/array"),
    queue = require("../../core/utils/queue"),
    deferredUtils = require("../../core/utils/deferred"),
    when = deferredUtils.when,
    Deferred = deferredUtils.Deferred,
    __isString = typeUtils.isString,
    __isNumber = typeUtils.isNumeric,
    __isBoolean = typeUtils.isBoolean,
    __isDefined = typeUtils.isDefined;
var CANCELED_TOKEN = "canceled";

function OperationManager() {
    this._counter = -1;
    this._deferreds = {}
}
OperationManager.prototype.constructor = OperationManager;
OperationManager.prototype.add = function(deferred) {
    this._counter += 1;
    this._deferreds[this._counter] = deferred;
    return this._counter
};
OperationManager.prototype.remove = function(operationId) {
    return delete this._deferreds[operationId]
};
OperationManager.prototype.cancel = function(operationId) {
    if (operationId in this._deferreds) {
        this._deferreds[operationId].reject(CANCELED_TOKEN);
        return true
    }
    return false
};
OperationManager.prototype.cancelAll = function() {
    while (this._counter > -1) {
        this.cancel(this._counter);
        this._counter--
    }
};

function isPending(deferred) {
    return "pending" === deferred.state()
}

function normalizeDataSourceOptions(options, normalizationOptions) {
    var store;

    function createCustomStoreFromLoadFunc() {
        var storeConfig = {};
        iteratorUtils.each(["useDefaultSearch", "key", "load", "loadMode", "cacheRawData", "byKey", "lookup", "totalCount", "insert", "update", "remove"], function() {
            storeConfig[this] = options[this];
            delete options[this]
        });
        return new CustomStore(storeConfig)
    }

    function createStoreFromConfig(storeConfig) {
        var alias = storeConfig.type;
        delete storeConfig.type;
        return Store.create(alias, storeConfig)
    }

    function createCustomStoreFromUrl(url) {
        return new CustomStore({
            load: function() {
                return ajax.sendRequest({
                    url: url,
                    dataType: "json"
                })
            },
            loadMode: normalizationOptions && normalizationOptions.fromUrlLoadMode
        })
    }
    if ("string" === typeof options) {
        options = {
            paginate: false,
            store: createCustomStoreFromUrl(options)
        }
    }
    if (void 0 === options) {
        options = []
    }
    if (Array.isArray(options) || options instanceof Store) {
        options = {
            store: options
        }
    } else {
        options = extend({}, options)
    }
    if (void 0 === options.store) {
        options.store = []
    }
    store = options.store;
    if ("load" in options) {
        store = createCustomStoreFromLoadFunc()
    } else {
        if (Array.isArray(store)) {
            store = new ArrayStore(store)
        } else {
            if (typeUtils.isPlainObject(store)) {
                store = createStoreFromConfig(extend({}, store))
            }
        }
    }
    options.store = store;
    return options
}

function normalizeStoreLoadOptionAccessorArguments(originalArguments) {
    switch (originalArguments.length) {
        case 0:
            return;
        case 1:
            return originalArguments[0]
    }
    return [].slice.call(originalArguments)
}

function generateStoreLoadOptionAccessor(optionName) {
    return function() {
        var args = normalizeStoreLoadOptionAccessorArguments(arguments);
        if (void 0 === args) {
            return this._storeLoadOptions[optionName]
        }
        this._storeLoadOptions[optionName] = args
    }
}

function mapDataRespectingGrouping(items, mapper, groupInfo) {
    function mapRecursive(items, level) {
        if (!Array.isArray(items)) {
            return items
        }
        return level ? mapGroup(items, level) : iteratorUtils.map(items, mapper)
    }

    function mapGroup(group, level) {
        return iteratorUtils.map(group, function(item) {
            var result = {
                key: item.key,
                items: mapRecursive(item.items, level - 1)
            };
            if ("aggregates" in item) {
                result.aggregates = item.aggregates
            }
            return result
        })
    }
    return mapRecursive(items, groupInfo ? dataUtils.normalizeSortingInfo(groupInfo).length : 0)
}

function normalizeLoadResult(data, extra) {
    if (data && !Array.isArray(data) && data.data) {
        extra = data;
        data = data.data
    }
    if (!Array.isArray(data)) {
        data = [data]
    }
    return {
        data: data,
        extra: extra
    }
}
var DataSource = Class.inherit({
    ctor: function(options) {
        var _this = this;
        var that = this;
        options = normalizeDataSourceOptions(options);
        var onPushHandler = 0 !== options.pushAggregationTimeout ? dataUtils.throttleChanges(this._onPush, function() {
            if (void 0 === options.pushAggregationTimeout) {
                return 5 * that._changedTime
            }
            return options.pushAggregationTimeout
        }) : this._onPush;
        this._changedTime = 0;
        this._onPushHandler = function(changes) {
            _this._aggregationTimeoutId = onPushHandler.call(_this, changes)
        };
        this._store = options.store;
        this._store.on("push", this._onPushHandler);
        this._storeLoadOptions = this._extractLoadOptions(options);
        this._mapFunc = options.map;
        this._postProcessFunc = options.postProcess;
        this._pageIndex = void 0 !== options.pageIndex ? options.pageIndex : 0;
        this._pageSize = void 0 !== options.pageSize ? options.pageSize : 20;
        this._loadingCount = 0;
        this._loadQueue = this._createLoadQueue();
        this._searchValue = "searchValue" in options ? options.searchValue : null;
        this._searchOperation = options.searchOperation || "contains";
        this._searchExpr = options.searchExpr;
        this._paginate = options.paginate;
        this._reshapeOnPush = __isDefined(options.reshapeOnPush) ? options.reshapeOnPush : false;
        iteratorUtils.each(["onChanged", "onLoadError", "onLoadingChanged", "onCustomizeLoadResult", "onCustomizeStoreLoadOptions"], function(_, optionName) {
            if (optionName in options) {
                that.on(optionName.substr(2, 1).toLowerCase() + optionName.substr(3), options[optionName])
            }
        });
        this._operationManager = new OperationManager;
        this._init()
    },
    _init: function() {
        this._items = [];
        this._userData = {};
        this._totalCount = -1;
        this._isLoaded = false;
        if (!__isDefined(this._paginate)) {
            this._paginate = !this.group()
        }
        this._isLastPage = !this._paginate
    },
    dispose: function() {
        this._store.off("push", this._onPushHandler);
        this._disposeEvents();
        clearTimeout(this._aggregationTimeoutId);
        delete this._store;
        if (this._delayedLoadTask) {
            this._delayedLoadTask.abort()
        }
        this._operationManager.cancelAll();
        this._disposed = true
    },
    _extractLoadOptions: function(options) {
        var result = {},
            names = ["sort", "filter", "select", "group", "requireTotalCount"],
            customNames = this._store._customLoadOptions();
        if (customNames) {
            names = names.concat(customNames)
        }
        iteratorUtils.each(names, function() {
            result[this] = options[this]
        });
        return result
    },
    loadOptions: function() {
        return this._storeLoadOptions
    },
    items: function() {
        return this._items
    },
    pageIndex: function(newIndex) {
        if (!__isNumber(newIndex)) {
            return this._pageIndex
        }
        this._pageIndex = newIndex;
        this._isLastPage = !this._paginate
    },
    paginate: function(value) {
        if (!__isBoolean(value)) {
            return this._paginate
        }
        if (this._paginate !== value) {
            this._paginate = value;
            this.pageIndex(0)
        }
    },
    pageSize: function(value) {
        if (!__isNumber(value)) {
            return this._pageSize
        }
        this._pageSize = value
    },
    isLastPage: function() {
        return this._isLastPage
    },
    sort: generateStoreLoadOptionAccessor("sort"),
    filter: function() {
        var newFilter = normalizeStoreLoadOptionAccessorArguments(arguments);
        if (void 0 === newFilter) {
            return this._storeLoadOptions.filter
        }
        this._storeLoadOptions.filter = newFilter;
        this.pageIndex(0)
    },
    group: generateStoreLoadOptionAccessor("group"),
    select: generateStoreLoadOptionAccessor("select"),
    requireTotalCount: function(value) {
        if (!__isBoolean(value)) {
            return this._storeLoadOptions.requireTotalCount
        }
        this._storeLoadOptions.requireTotalCount = value
    },
    searchValue: function(value) {
        if (arguments.length < 1) {
            return this._searchValue
        }
        this._searchValue = value;
        this.pageIndex(0)
    },
    searchOperation: function(op) {
        if (!__isString(op)) {
            return this._searchOperation
        }
        this._searchOperation = op;
        this.pageIndex(0)
    },
    searchExpr: function(expr) {
        var argc = arguments.length;
        if (0 === argc) {
            return this._searchExpr
        }
        if (argc > 1) {
            expr = [].slice.call(arguments)
        }
        this._searchExpr = expr;
        this.pageIndex(0)
    },
    store: function() {
        return this._store
    },
    key: function() {
        return this._store && this._store.key()
    },
    totalCount: function() {
        return this._totalCount
    },
    isLoaded: function() {
        return this._isLoaded
    },
    isLoading: function() {
        return this._loadingCount > 0
    },
    beginLoading: function() {
        this._changeLoadingCount(1)
    },
    endLoading: function() {
        this._changeLoadingCount(-1)
    },
    _createLoadQueue: function() {
        return queue.create()
    },
    _changeLoadingCount: function(increment) {
        var newLoading, oldLoading = this.isLoading();
        this._loadingCount += increment;
        newLoading = this.isLoading();
        if (oldLoading ^ newLoading) {
            this.fireEvent("loadingChanged", [newLoading])
        }
    },
    _scheduleLoadCallbacks: function(deferred) {
        var that = this;
        that.beginLoading();
        deferred.always(function() {
            that.endLoading()
        })
    },
    _scheduleFailCallbacks: function(deferred) {
        var that = this;
        deferred.fail(function() {
            if (arguments[0] === CANCELED_TOKEN) {
                return
            }
            that.fireEvent("loadError", arguments)
        })
    },
    _fireChanged: function(args) {
        var date = new Date;
        this.fireEvent("changed", args);
        this._changedTime = new Date - date
    },
    _scheduleChangedCallbacks: function(deferred) {
        var _this2 = this;
        deferred.done(function() {
            _this2._fireChanged()
        })
    },
    loadSingle: function(propName, propValue) {
        var that = this;
        var d = new Deferred,
            key = this.key(),
            store = this._store,
            options = this._createStoreLoadOptions(),
            handleDone = function(data) {
                if (!__isDefined(data) || array.isEmpty(data)) {
                    d.reject(new errors.Error("E4009"))
                } else {
                    if (!Array.isArray(data)) {
                        data = [data]
                    }
                    d.resolve(that._applyMapFunction(data)[0])
                }
            };
        this._scheduleFailCallbacks(d);
        if (arguments.length < 2) {
            propValue = propName;
            propName = key
        }
        delete options.skip;
        delete options.group;
        delete options.refresh;
        delete options.pageIndex;
        delete options.searchString;

        function shouldForceByKey() {
            return store instanceof CustomStore && !store._byKeyViaLoad()
        }(function() {
            if (propName === key || shouldForceByKey()) {
                return store.byKey(propValue, options)
            }
            options.take = 1;
            options.filter = options.filter ? [options.filter, [propName, propValue]] : [propName, propValue];
            return store.load(options)
        })().fail(d.reject).done(handleDone);
        return d.promise()
    },
    load: function() {
        var loadOperation, that = this,
            d = new Deferred;

        function loadTask() {
            if (that._disposed) {
                return
            }
            if (!isPending(d)) {
                return
            }
            return that._loadFromStore(loadOperation, d)
        }
        this._scheduleLoadCallbacks(d);
        this._scheduleFailCallbacks(d);
        this._scheduleChangedCallbacks(d);
        loadOperation = this._createLoadOperation(d);
        this.fireEvent("customizeStoreLoadOptions", [loadOperation]);
        this._loadQueue.add(function() {
            if ("number" === typeof loadOperation.delay) {
                that._delayedLoadTask = commonUtils.executeAsync(loadTask, loadOperation.delay)
            } else {
                loadTask()
            }
            return d.promise()
        });
        return d.promise({
            operationId: loadOperation.operationId
        })
    },
    _onPush: function(changes) {
        if (this._reshapeOnPush) {
            this.load()
        } else {
            this.fireEvent("changing", [{
                changes: changes
            }]);
            var group = this.group(),
                items = this.items(),
                groupLevel = 0,
                dataSourceChanges = this.paginate() || group ? changes.filter(function(item) {
                    return "update" === item.type
                }) : changes;
            if (group) {
                groupLevel = Array.isArray(group) ? group.length : 1
            }
            arrayUtils.applyBatch(this.store(), items, dataSourceChanges, groupLevel, true);
            this._fireChanged([{
                changes: changes
            }])
        }
    },
    _createLoadOperation: function(deferred) {
        var id = this._operationManager.add(deferred),
            options = this._createStoreLoadOptions();
        deferred.always(function() {
            this._operationManager.remove(id)
        }.bind(this));
        return {
            operationId: id,
            storeLoadOptions: options
        }
    },
    reload: function() {
        var store = this.store();
        if (store instanceof CustomStore) {
            store.clearRawDataCache()
        }
        this._init();
        return this.load()
    },
    cancel: function(operationId) {
        return this._operationManager.cancel(operationId)
    },
    cancelAll: function() {
        return this._operationManager.cancelAll()
    },
    _addSearchOptions: function(storeLoadOptions) {
        if (this._disposed) {
            return
        }
        if (this.store()._useDefaultSearch) {
            this._addSearchFilter(storeLoadOptions)
        } else {
            storeLoadOptions.searchOperation = this._searchOperation;
            storeLoadOptions.searchValue = this._searchValue;
            storeLoadOptions.searchExpr = this._searchExpr
        }
    },
    _createStoreLoadOptions: function() {
        var result = extend({}, this._storeLoadOptions);
        this._addSearchOptions(result);
        if (this._paginate) {
            if (this._pageSize) {
                result.skip = this._pageIndex * this._pageSize;
                result.take = this._pageSize
            }
        }
        result.userData = this._userData;
        return result
    },
    _addSearchFilter: function(storeLoadOptions) {
        var value = this._searchValue,
            op = this._searchOperation,
            selector = this._searchExpr,
            searchFilter = [];
        if (!value) {
            return
        }
        if (!selector) {
            selector = "this"
        }
        if (!Array.isArray(selector)) {
            selector = [selector]
        }
        iteratorUtils.each(selector, function(i, item) {
            if (searchFilter.length) {
                searchFilter.push("or")
            }
            searchFilter.push([item, op, value])
        });
        if (storeLoadOptions.filter) {
            storeLoadOptions.filter = [searchFilter, storeLoadOptions.filter]
        } else {
            storeLoadOptions.filter = searchFilter
        }
    },
    _loadFromStore: function(loadOptions, pendingDeferred) {
        var that = this;

        function handleSuccess(data, extra) {
            function processResult() {
                var loadResult = extend(normalizeLoadResult(data, extra), loadOptions);
                that.fireEvent("customizeLoadResult", [loadResult]);
                when(loadResult.data).done(function(data) {
                    loadResult.data = data;
                    that._processStoreLoadResult(loadResult, pendingDeferred)
                }).fail(pendingDeferred.reject)
            }
            if (that._disposed) {
                return
            }
            if (!isPending(pendingDeferred)) {
                return
            }
            processResult()
        }
        if (loadOptions.data) {
            return (new Deferred).resolve(loadOptions.data).done(handleSuccess)
        }
        return this.store().load(loadOptions.storeLoadOptions).done(handleSuccess).fail(pendingDeferred.reject)
    },
    _processStoreLoadResult: function(loadResult, pendingDeferred) {
        var that = this,
            data = loadResult.data,
            extra = loadResult.extra,
            storeLoadOptions = loadResult.storeLoadOptions;

        function resolvePendingDeferred() {
            that._isLoaded = true;
            that._totalCount = isFinite(extra.totalCount) ? extra.totalCount : -1;
            return pendingDeferred.resolve(data, extra)
        }

        function proceedLoadingTotalCount() {
            that.store().totalCount(storeLoadOptions).done(function(count) {
                extra.totalCount = count;
                resolvePendingDeferred()
            }).fail(pendingDeferred.reject)
        }
        if (that._disposed) {
            return
        }
        data = that._applyPostProcessFunction(that._applyMapFunction(data));
        if (!typeUtils.isPlainObject(extra)) {
            extra = {}
        }
        that._items = data;
        if (!data.length || !that._paginate || that._pageSize && data.length < that._pageSize) {
            that._isLastPage = true
        }
        if (storeLoadOptions.requireTotalCount && !isFinite(extra.totalCount)) {
            proceedLoadingTotalCount()
        } else {
            resolvePendingDeferred()
        }
    },
    _applyMapFunction: function(data) {
        if (this._mapFunc) {
            return mapDataRespectingGrouping(data, this._mapFunc, this.group())
        }
        return data
    },
    _applyPostProcessFunction: function(data) {
        if (this._postProcessFunc) {
            return this._postProcessFunc(data)
        }
        return data
    }
}).include(EventsMixin);
exports.DataSource = DataSource;
exports.normalizeDataSourceOptions = normalizeDataSourceOptions;
exports.normalizeLoadResult = normalizeLoadResult;
