"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var productsRouter = express.Router();
var DB = require('../db');
var product_repository_1 = require("./product_repository");
var util_func_1 = require("../util/util_func");
productsRouter.get('/:id', function (req, res) {
    var id = req.params.id;
    DB.query(product_repository_1.get_by_id(id), function (err, product, fields) {
        if (err)
            return res.end("Error product not found for id " + id);
        return res.json(product);
    });
});
productsRouter.post('', function (req, res) {
    var _a = req.body, product_name = _a.product_name, product_unit_price = _a.product_unit_price, product_stock_level = _a.product_stock_level;
    var notDefined = util_func_1.noneAreUndefined({ product_unit_price: product_unit_price, product_name: product_name, product_stock_level: product_stock_level });
    if (notDefined.length > 0) {
        return res.end(notDefined + " are missing from request body");
    }
    var query = product_repository_1.post(product_name, product_unit_price, product_stock_level);
    console.log(query);
    DB.query(query, function (err, product, fields) {
        if (err)
            return res.end("Error Inserting product ");
        return res.json({ success: true, id: product.insertId });
    });
});
productsRouter.put('/:id', function (req, res) {
    // Update product
    var _a = req.body, product_name = _a.product_name, product_unit_price = _a.product_unit_price, product_stock_level = _a.product_stock_level;
    var product_id = req.params.id;
    var notDefined = util_func_1.noneAreUndefined([product_name, product_unit_price, product_stock_level, product_id]);
    if (notDefined.length > 0) {
        return res.end(notDefined + " are missing from request");
    }
    var query = product_repository_1.put(product_name, product_unit_price, product_stock_level, product_id);
    console.log(query);
    DB.query(query, function (err, product, fields) {
        if (err)
            return res.end("Error Updating Product id " + product_id);
        return res.json({ success: true });
    });
});
// Insert authorize middleware
productsRouter.get("", function (req, res) {
    DB.query(product_repository_1.get_all(), function (err, products, fields) {
        if (err)
            return res.end("Error");
        return res.json(products);
    });
});
productsRouter.delete('/:id', function (req, res) {
    var product_id = req.params.id;
    if (product_id == undefined) {
        return res.end("ID missing from request");
    }
    var query = product_repository_1.remove(product_id);
    DB.query(query, function (err, product, fields) {
        if (err)
            return res.end("Error deleting product id " + product_id);
        return res.json({ success: true });
    });
});
module.exports = productsRouter;
