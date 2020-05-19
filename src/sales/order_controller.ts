
export {}
const express = require('express')
const orderRouter = express.Router();

const DB = require('../db');

import {get_all_sets, get_by_id_sets, post_sets_exec, put_sets_exec, remove_set_exec} from './order_repository';
import { noneAreNull, noneAreUndefined,  aggregate_by_single_root, aggregate_by_single_root_ignore_fields} from '../util/util_func';
import { authorizeForRoles } from '../middleware';
import { userRoles } from '../consts';

orderRouter.get('/:id', (req,res)=>{
    let {id} = req.params;

    DB.query( get_by_id_sets(id), (err, order, fields)=>{
        if(err)
        return res.json({error: "Error order not found for id " + id})

        let order_aggregate = aggregate_by_single_root(order, "sets", "order")[0];
        console.log(order_aggregate)
        order_aggregate.sets = aggregate_by_single_root_ignore_fields(order_aggregate.sets, "products","set", 
        ["customer_id", "customer_name", "salesman_id", "salesman_name", "sales_target", "customer_contact"]) 
        return res.json(order_aggregate);
    });
})

orderRouter.post('', async (req, res)=>{
    let {order_date, order_status, customer_id, salesman_id, sets} = req.body;
    
    let notDefined = noneAreUndefined({order_date, order_status, customer_id, salesman_id, sets})

    if(notDefined.length > 0){
        return res.json({error: notDefined + " are missing from request body"})
    }

    if(sets.length == 0){
        return res.json({error: "Order must at least contain a single set"})
    }

    sets.forEach(s => {
        let {set_id, set_quantity} = s;
        let missingInSet = noneAreUndefined({set_id, set_quantity})
        if(missingInSet.length){
            return res.json({error: missingInSet + " are missing from request body"})
        }
    })

    try{
        await post_sets_exec(order_date, order_status, salesman_id, customer_id, sets);
        return res.json({success: true});
    }catch(err){
        console.log(err)
        return res.json({error: "Error posting order"});
    }
})

orderRouter.put('/:id', async (req, res)=>{
    // Update product
    let {order_date, order_status, customer_id, salesman_id, sets} = req.body;
    let order_id = req.params.id;

    let notDefined = noneAreUndefined({order_date, order_status, customer_id, salesman_id, sets})

    if(notDefined.length > 0){
        return res.json({error: notDefined + " are missing from request body"})
    }

    if(sets.length == 0){
        return res.json({error: "Order must at least contain a single set"})
    }

    sets.forEach(s => {
        let {set_id, set_quantity} = s;
        let missingInSet = noneAreUndefined({set_id, set_quantity})
        if(missingInSet.length){
            return res.json({error: missingInSet + " are missing from request body"})
        }
    })

    try{
        // Update product quantity
        await put_sets_exec(order_id, order_date, order_status, salesman_id, customer_id, sets);
        return res.json({success: true});
    }catch(err){
        console.log(err)
        return res.json({error: 'Error updating order'});
    }
})

// Insert authorize middleware

orderRouter.get("", (req, res)=>{
    DB.query( get_all_sets(), (err, orders, fields)=>{
        if(err)
        return res.json({error:"Error"})

        let order_aggregate = aggregate_by_single_root_ignore_fields(orders, "sets","order", 
        ["customer_id", "customer_name", "salesman_id", "salesman_name", "sales_target", "customer_contact"])

        order_aggregate.forEach(o => {
            o.sets = aggregate_by_single_root_ignore_fields(o.sets, "products","set", 
                ["customer_id", "customer_name", "salesman_id", "salesman_name", "sales_target", "customer_contact"])
        }) 

        return res.json(order_aggregate);
    });
    
})

orderRouter.delete('/:id', async (req,res)=>{
    let orderId = req.params.id;
    if(orderId == undefined){
        return res.json({error:"ID missing from request"})
    }

    try{
        await remove_set_exec(orderId);
        res.json({success: true});
    }catch(err){
        console.log(err)
        return res.json({error: 'Error deleting order'})
    }
})

module.exports = orderRouter;