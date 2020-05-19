"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var key = "product_id";
var table = "product";
exports.get_all = function () { return "SELECT * FROM " + table; };
exports.get_by_id = function (id) { return "SELECT * FROM " + table + " WHERE " + key + " = " + id; };
exports.post = function (name, price, stock) { return "INSERT INTO " + table + "(product_name, product_unit_price, product_stock_level) values ('" + name + "', " + price + ", " + stock + ")"; };
exports.put = function (name, price, stock, id) { return "UPDATE " + table + " SET product_name = '" + name + "', product_unit_price = " + price + ", product_stock_level = " + stock + " WHERE " + key + " = " + id; };
exports.remove = function (id) { return "DELETE FROM " + table + " WHERE " + key + " = " + id; };
