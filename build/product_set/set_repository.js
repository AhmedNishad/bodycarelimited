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
var DB = require('../db');
var key = "set_id";
var table = "_set";
exports.get_all = function () { return "SELECT * FROM " + table; };
exports.get_all_sets = function () { return "SELECT product.product_id, product.product_name, product.product_unit_price, product.product_stock_level,\n_set.set_id, _set.set_name, _set.set_description, product_set.product_quantity as product_set_quantity,\ncategory.category_name as set_category_name \nFROM product, _set, product_set, category WHERE product.product_id = product_set.product_id and \n_set.set_id = product_set.set_id and category.category_id = _set.set_category_id "; };
exports.get_by_id = function (id) { return "SELECT * FROM " + table + " WHERE " + key + " = " + id; };
exports.get_by_id_sets = function (id) { return "SELECT product.product_id, product.product_name, product.product_unit_price, product.product_stock_level,\n_set.set_id, _set.set_name, _set.set_description, product_set.product_quantity as product_set_quantity,\ncategory.category_name as set_category_name \nFROM product, _set, product_set, category WHERE product.product_id = product_set.product_id and \n_set.set_id = product_set.set_id and category.category_id = _set.set_category_id and _set.set_id = " + id; };
exports.post = function (name, description, categoryId) { return "INSERT INTO " + table + "(set_name, set_description, category_id) values (\"" + name + "\", \"" + description + "\", " + categoryId + ")"; };
exports.post_sets = function (name, description, categoryId, products) {
    var product_tuples = "";
    products.forEach(function (p) {
        product_tuples += " (" + p.product_id + ", @inserted_set_id, " + p.product_set_quantity + "),";
    });
    product_tuples = product_tuples.substring(0, product_tuples.length - 1) + "";
    return "SET autocommit = 0;\n\n    Start Transaction;\n    \n    INSERT INTO _set(set_name, set_description, set_category_id) values \n    (\"" + name + "\", \"" + description + "\", " + categoryId + ");\n    \n    SET @inserted_set_id = LAST_INSERT_ID();\n\n    INSERT INTO product_set(product_id, set_id, product_quantity) values\n    ?;\n    \n    Commit;\n    \n    SET autocommit = 1;";
};
exports.post_sets_exec = function (name, description, categoryId, products) { return __awaiter(void 0, void 0, void 0, function () {
    var conn, result_1, product_tuples_1, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, DB.connection()];
            case 1:
                conn = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, 9, 11]);
                return [4 /*yield*/, DB.query('Start Transaction')];
            case 3:
                _a.sent();
                return [4 /*yield*/, DB.query("INSERT INTO _set(set_name, set_description, set_category_id) values \n        (\"" + name + "\", \"" + description + "\", " + categoryId + ")")];
            case 4:
                result_1 = _a.sent();
                product_tuples_1 = [];
                products.forEach(function (p) {
                    product_tuples_1.push([p.product_id, result_1.insertId, p.product_set_quantity]);
                });
                console.log(product_tuples_1);
                return [4 /*yield*/, DB.query("INSERT INTO product_set(product_id, set_id, product_quantity) values ?", [product_tuples_1])];
            case 5:
                _a.sent();
                return [4 /*yield*/, DB.query('Commit')];
            case 6:
                _a.sent();
                return [3 /*break*/, 11];
            case 7:
                err_1 = _a.sent();
                return [4 /*yield*/, DB.query('Rollback')];
            case 8:
                _a.sent();
                throw err_1;
            case 9: return [4 /*yield*/, conn.release()];
            case 10:
                _a.sent();
                return [7 /*endfinally*/];
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.put = function (name, description, categoryId, setId) { return "UPDATE " + table + " SET set_name = '" + name + "', set_description = " + description + ", category_id = " + categoryId + " WHERE " + key + " = " + setId; };
exports.put_sets_exec = function (name, description, categoryId, setId, products) { return __awaiter(void 0, void 0, void 0, function () {
    var conn, upsertProducts, err_2, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, DB.connection()];
            case 1:
                conn = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 10, 12, 14]);
                return [4 /*yield*/, DB.query('Start Transaction')];
            case 3:
                _a.sent();
                return [4 /*yield*/, DB.query("UPDATE " + table + " SET set_name = \"" + name + "\", set_description = \"" + description + "\", set_category_id = " + categoryId + " WHERE " + key + " = " + setId)];
            case 4:
                _a.sent();
                upsertProducts = function () { return new Promise(function (resolve, reject) {
                    var queries = [];
                    products.forEach(function (p) {
                        var q = "INSERT INTO product_set (product_id, set_id, product_quantity) values \n                (" + p.product_id + ", " + setId + ", " + p.product_set_quantity + ") ON DUPLICATE KEY UPDATE product_quantity = \n                " + p.product_set_quantity;
                        console.log(q);
                        try {
                            queries.push(DB.query(q));
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                    //console.log(queries)
                    // throw "this isn't happening"
                    Promise.all(queries).then(function (values) {
                        console.log(values);
                        resolve('Completed');
                    });
                }); };
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, upsertProducts()];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                err_2 = _a.sent();
                throw err_2;
            case 8: return [4 /*yield*/, DB.query("commit")];
            case 9:
                _a.sent();
                return [3 /*break*/, 14];
            case 10:
                err_3 = _a.sent();
                return [4 /*yield*/, DB.query('Rollback')];
            case 11:
                _a.sent();
                throw err_3;
            case 12: return [4 /*yield*/, conn.release()];
            case 13:
                _a.sent();
                return [7 /*endfinally*/];
            case 14: return [2 /*return*/];
        }
    });
}); };
exports.remove = function (id) { return "DELETE FROM " + table + " WHERE " + key + " = " + id; };
