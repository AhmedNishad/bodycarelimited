
export {}
const express = require('express')
const setRouter = express.Router();

const DB = require('../db');

import {get_all, get_by_id, post, put, remove, get_all_sets, get_by_id_sets, post_sets, post_sets_exec, put_sets_exec, remove_set_exec} from './set_repository';
import { noneAreNull, noneAreUndefined,  aggregate_by_single_root} from '../util/util_func';
import { authorizeForRoles } from '../middleware';
import { userRoles } from '../consts';

setRouter.get('/:id', (req,res)=>{
    let {id} = req.params;

    console.log(req.user)
    DB.query( get_by_id_sets(id), (err, set, fields)=>{
        if(err)
        return res.json({error: "Error set not found for id " + id})

        let aggregate = aggregate_by_single_root(set, "products", "set");
        return res.json(aggregate[0]);
    });
})

setRouter.post('', async (req, res)=>{
    let {set_name, set_description, set_category_id, products} = req.body;

    let notDefined = noneAreUndefined({set_name, set_description, set_category_id})

    if(notDefined.length > 0){
        return res.json({error: notDefined + " are missing from request body"})
    }

    if(products.length == 0){
        return res.json({error: "Set must at least contain a single product"})
    }

    let query = post_sets(set_name, set_description, set_category_id, products);

    let product_tuples: Array<Array<any>> = [];
    products.forEach(p=>{
        product_tuples.push([p.product_id, '@inserted_set_id', p.product_set_quantity]) ;
    })

    try{
        await post_sets_exec(set_name, set_description, set_category_id, products);
        return res.json({success: true});
    }catch(err){
        return res.json({error: "Error posting set"});
    }
})

setRouter.put('/:id', async (req, res)=>{
    // Update product
    let {set_name, set_description, set_category_id, products} = req.body;
    let set_id = req.params.id;

    let notDefined = noneAreUndefined({set_name, set_description, set_category_id})

    if(notDefined.length > 0){
        return res.json({error: notDefined + " are missing from request body"})
    }

    if(products.length == 0){
        return res.json({error: "Set must at least contain a single product"})
    }
    try{
        await put_sets_exec(set_name, set_description, set_category_id, set_id, products);
        return res.json({success: true});
    }catch(err){
        return res.json({error: 'Error updating set'});
    }
})

// Insert authorize middleware

setRouter.get("", /* authorizeForRoles([userRoles.Strategy, userRoles.Salesman]), */ (req, res)=>{
    console.log("geting records")
    DB.query( get_all_sets(), (err, sets, fields)=>{
        if(err)
        return res.json({error:"Error"})

        let aggregate = aggregate_by_single_root(sets, "products","set")
        return res.json(aggregate);
    });
    
})

setRouter.delete('/:id', async (req,res)=>{
    let setId = req.params.id;
    if(setId == undefined){
        return res.json({error:"ID missing from request"})
    }

    try{
        await remove_set_exec(setId);
        res.json({success: true});
    }catch(err){
        return res.json({error: 'Error deleting set'})
    }
})

module.exports = setRouter;