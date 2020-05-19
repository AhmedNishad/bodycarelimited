"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noneAreNull = function (arr) { return arr.filter(function (el) { return el == null; }).length == 0 ? [] : arr.filter(function (el) { return el == null; }); };
exports.noneAreUndefined = function (arr) { return Object.values(arr).filter(function (el) { return el == undefined; }).length == 0 ? [] : Object.entries(arr).filter(function (el) { return el[1] == undefined; }).map(function (e) { return e[0]; }); };
exports.aggregate_objects_by_keys = function (arr, aggregate, aggregate_root) {
    var transArray = [];
    arr.forEach(function (agg) {
        var interObj = {};
        interObj[aggregate_root] = [];
        Object.keys(agg).forEach(function (k) {
            if (k.startsWith(aggregate_root)) {
                console.log(k);
                interObj[k] = agg[k];
            }
            else {
                interObj[aggregate_root].push();
            }
        });
    });
};
// Takes in array with aggregate and root fields only, compiles down into single objects of the root
// requires for all aggregate_root columns to have the same prefix 
exports.aggregate_by_single_root = function (arr, aggregate, aggregate_root) {
    var rootArray = [];
    arr.forEach(function (agg) {
        var interObj = {};
        interObj[aggregate] = [{}];
        var ind = rootArray.findIndex(function (r) { return r[aggregate_root + '_id'] == agg[aggregate_root + '_id']; });
        if (ind == -1) {
            // create new object and pass in values
            Object.keys(agg).forEach(function (k) {
                if (k.startsWith(aggregate_root)) {
                    console.log(k);
                    interObj[k] = agg[k];
                }
                else {
                    interObj[aggregate][0][k] = agg[k];
                }
            });
            rootArray.push(interObj);
            return;
        }
        // Loop through keys that aren't in aggregate and push to aggregate
        var existingRoot = rootArray[ind];
        existingRoot[aggregate].push({});
        var lastIndex = existingRoot[aggregate].length - 1;
        Object.keys(agg).forEach(function (k) {
            if (!k.startsWith(aggregate_root)) {
                console.log(k);
                existingRoot[aggregate][lastIndex][k] = agg[k];
            }
        });
    });
    return rootArray;
};
