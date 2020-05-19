
export {}
const express = require('express')
const productsRouter = express.Router();

const DB = require('../db');

import {get_all, get_by_id, post, put, remove} from './product_repository';
import { noneAreNull, noneAreUndefined } from '../util/util_func';

productsRouter.get('/:id', (req,res)=>{
    let {id} = req.params;

    DB.query( get_by_id(id), (err, product, fields)=>{
        if(err)
            return res.end("Error product not found for id " + id)

        return res.json(product);
    });
})

productsRouter.post('', (req, res)=>{
    let {product_name, product_unit_price, product_stock_level} = req.body;

    let notDefined = noneAreUndefined({product_unit_price, product_name, product_stock_level})

    if(notDefined.length > 0){
        return res.end(notDefined + " are missing from request body")
    }

    let query = post({product_name, product_unit_price, product_stock_level});
    console.log(query)
    DB.query( query, (err, product, fields)=>{
        if(err)
            return res.end("Error Inserting product ")
        
        return res.json({success: true, id: product.insertId});
    });
})

productsRouter.put('/:id', (req, res)=>{
    // Update product
    let {product_name, product_unit_price, product_stock_level} = req.body;
    let product_id = req.params.id;

    let notDefined = noneAreUndefined([product_name, product_unit_price, product_stock_level, product_id])

    if(notDefined.length > 0){
        return res.end(notDefined + " are missing from request")
    }

    let query = put({product_name, product_unit_price, product_stock_level}, product_id);
    console.log(query)
    DB.query( query, (err, product, fields)=>{
        if(err)
            return res.end("Error Updating Product id " + product_id)
        
        return res.json({success: true});
    });
})

// Insert authorize middleware

productsRouter.get("", (req, res)=>{
    DB.query( get_all(), (err, products, fields)=>{
        if(err)
            return res.end("Error")

        return res.json(products);
    });
    
})

productsRouter.delete('/:id', (req,res)=>{
    let product_id = req.params.id;
    if(product_id == undefined){
        return res.end("ID missing from request")
    }

    let query = remove(product_id);
    DB.query(query, (err, product, fields)=>{
        if(err)
            return res.end("Error deleting product id " + product_id)
        
        return res.json({success: true});
    })
})

module.exports = productsRouter;