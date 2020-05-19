"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var setRouter = express.Router();
var DB = require('../db');
var set_repository_1 = require("./set_repository");
var util_func_1 = require("../util/util_func");
setRouter.get('/:id', function (req, res) {
    var id = req.params.id;
    DB.query(set_repository_1.get_by_id_sets(id), function (err, set, fields) {
        if (err)
            return res.end("Error set not found for id " + id);
        var aggregate = util_func_1.aggregate_by_single_root(set, "products", "set");
        return res.json(aggregate[0]);
    });
});
setRouter.post('', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, set_name, set_description, set_category_id, products, notDefined, query, product_tuples;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, set_name = _a.set_name, set_description = _a.set_description, set_category_id = _a.set_category_id, products = _a.products;
                console.log(products);
                notDefined = util_func_1.noneAreUndefined({ set_name: set_name, set_description: set_description, set_category_id: set_category_id });
                if (notDefined.length > 0) {
                    return [2 /*return*/, res.end(notDefined + " are missing from request body")];
                }
                if (products.length == 0) {
                    return [2 /*return*/, res.end("Set must at least contain a single product")];
                }
                query = set_repository_1.post_sets(set_name, set_description, set_category_id, products);
                product_tuples = [];
                products.forEach(function (p) {
                    product_tuples.push([p.product_id, '@inserted_set_id', p.product_set_quantity]);
                });
                return [4 /*yield*/, set_repository_1.post_sets_exec(set_name, set_description, set_category_id, products)];
            case 1:
                _b.sent();
                return [2 /*return*/, res.json({ success: true })];
        }
    });
}); });
setRouter.put('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, set_name, set_description, set_category_id, products, set_id, notDefined;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, set_name = _a.set_name, set_description = _a.set_description, set_category_id = _a.set_category_id, products = _a.products;
                set_id = req.params.id;
                console.log(products);
                notDefined = util_func_1.noneAreUndefined({ set_name: set_name, set_description: set_description, set_category_id: set_category_id });
                if (notDefined.length > 0) {
                    return [2 /*return*/, res.end(notDefined + " are missing from request body")];
                }
                if (products.length == 0) {
                    return [2 /*return*/, res.end("Set must at least contain a single product")];
                }
                return [4 /*yield*/, set_repository_1.put_sets_exec(set_name, set_description, set_category_id, set_id, products)];
            case 1:
                _b.sent();
                return [2 /*return*/, res.json({ success: true })];
        }
    });
}); });
// Insert authorize middleware
setRouter.get("", function (req, res) {
    DB.query(set_repository_1.get_all_sets(), function (err, sets, fields) {
        if (err)
            return res.end("Error");
        var aggregate = util_func_1.aggregate_by_single_root(sets, "products", "set");
        return res.json(aggregate);
    });
});
setRouter.delete('/:id', function (req, res) {
    var productId = req.params.id;
    if (productId == undefined) {
        return res.end("ID missing from request");
    }
    var query = set_repository_1.remove(productId);
    DB.query(query, function (err, product, fields) {
        if (err)
            return res.end("Error deleting product");
        return res.json({ success: true });
    });
});
module.exports = setRouter;
