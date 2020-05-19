"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = 3000;
var setController = require('./product_set/set_controller');
var productsRouter = require('./product_set/products_controller');
var authMiddleWare = function (req, res) {
};
//app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(authMiddleWare);
app.get('/', function (req, res) { return res.send('bcl v1'); });
app.use('/products', productsRouter);
app.use('/sets', setController);
app.listen(port, function () { return console.log("BCL listening at http://localhost:" + port); });
