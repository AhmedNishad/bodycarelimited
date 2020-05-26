
export {}
const express = require('express')
const salesmanRouter = express.Router();

const DB = require('../db');

import {get_all, get_by_id, post, put, remove, removeExec} from './salesman_repository';
import { get_by_salesman_id_sets_exec, get_by_salesman_id_sets} from './order_repository'
import { noneAreNull, noneAreUndefined,  aggregate_by_single_root, aggregate_by_single_root_ignore_fields} from '../util/util_func';
import { authorizeForRoles } from '../middleware';
import { userRoles } from '../consts';

salesmanRouter.get('/:id', (req,res)=>{
    let {id} = req.params;

    DB.query( get_by_id(id), (err, salesman, fields)=>{
        if(err)
            return res.json({error: "Error salesman not found for id " + id})

        return res.json(salesman);
    });
})

salesmanRouter.get('/0/orders/all', async (req,res)=>{

    DB.query( get_all(), async (err, salesmen, fields)=>{
        if(err)
            return res.json({error: "Error"})

        for(let i=0; i < salesmen.length; i++){
            let salesman = salesmen[i]
            let orders = await get_by_salesman_id_sets_exec(salesman.salesman_id);
            let order_aggregate = aggregate_by_single_root(orders, "sets", "order");
            console.log(order_aggregate)
            for(let i = 0; i < order_aggregate.length; i++){
                order_aggregate[i].sets = aggregate_by_single_root_ignore_fields(order_aggregate[i].sets, "products","set", 
                ["customer_id", "customer_name", "salesman_id", "salesman_name", "sales_target", "customer_contact", "customer_email"]) 
            }
            salesman.orders = order_aggregate;
        }
        

        return res.json({salesmen});
    });
})

salesmanRouter.get('/:id/orders', async (req,res)=>{
    let {id} = req.params;

    DB.query( get_by_id(id), async (err, salesman, fields)=>{
        if(err)
            return res.json({error: "Error salesman not found for id " + id})

        let orders = await get_by_salesman_id_sets_exec(id);
        let order_aggregate = aggregate_by_single_root(orders, "sets", "order");
        console.log(order_aggregate)
        for(let i = 0; i < order_aggregate.length; i++){
            order_aggregate[i].sets = aggregate_by_single_root_ignore_fields(order_aggregate[i].sets, "products","set", 
            ["customer_id", "customer_name", "salesman_id", "salesman_name", "sales_target", "customer_contact", "customer_email"]) 
        }
        console.log(order_aggregate);

        return res.json({salesman,orders:order_aggregate});
    });
})

salesmanRouter.post('', async (req, res)=>{
    let {salesman_name, sales_target} = req.body;
    
    let notDefined = noneAreUndefined({salesman_name, sales_target})

    if(notDefined.length > 0){
        return res.json({error: notDefined + " are missing from request body"})
    }

    try{
        DB.query(post({salesman_name, sales_target}), (err, salesman, fields)=>{
            if(err)
                return res.json({error: "Error posting salesman"});

            return res.json({success: true});
        }) 
    }catch(err){
        console.log(err)
        return res.json({error: "Error posting salesman"});
    }
})

salesmanRouter.put('/:id', async (req, res)=>{
    // Update product
    let {salesman_name, sales_target} = req.body;
    let customer_id = req.params.id;

    let notDefined = noneAreUndefined({salesman_name, sales_target, customer_id})

    if(notDefined.length > 0){
        return res.json({error: notDefined + " are missing from request body"})
    }

    try{
        // Update product quantity
        DB.query(put({salesman_name, sales_target}, customer_id), (err, salesman, fields)=>{
            if(err)
                return res.json({error: 'Error updating salesman'});

            return res.json({success: true});
        }) 
    }catch(err){
        console.log(err)
        return res.json({error: 'Error updating salesman'});
    }
})

// Insert authorize middleware

salesmanRouter.get("", (req, res)=>{
    DB.query( get_all(), (err, salesmen, fields)=>{
        if(err)
        return res.json({error:"Error"})

        return res.json(salesmen);
    });
    
})

salesmanRouter.delete('/:id', async (req,res)=>{
    let orderId = req.params.id;
    if(orderId == undefined){
        return res.json({error:"ID missing from request"})
    }

    try{
        await removeExec(orderId);
        res.json({success: true});
    }catch(err){
        console.log(err)
        return res.json({error: 'Error deleting customer'})
    }
})

module.exports = salesmanRouter;