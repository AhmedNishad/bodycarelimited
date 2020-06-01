
export {}
const express = require('express')
const customerRouter = express.Router();
const jwt = require('jsonwebtoken')

const DB = require('../db');

import {get_all, get_by_id, post, put, remove, removeExec} from './customer_repository';
import { get_by_customer_id_sets_exec} from './order_repository'
import { noneAreNull, noneAreUndefined,  aggregate_by_single_root, aggregate_by_single_root_ignore_fields} from '../util/util_func';
import { authorizeForRoles } from '../middleware';
import { userRoles } from '../consts';

customerRouter.get('/:id', (req,res)=>{
    let {id} = req.params;

    DB.query( get_by_id(id), (err, customer, fields)=>{
        if(err)
            return res.json({error: "Error customer not found for id " + id})

        return res.json(customer);
    });
})

customerRouter.get('/orders/access', (req,res)=>{
    let token = req.query.token;
    console.log(token)
    jwt.verify(token, process.env.SECRET, (err, decoded)=>{
        if(err){
            return res.json({success:false, error:"Invalid token"})
        }else{
            console.log(decoded)
            return res.json({success: true, orderPayload: decoded})
        }
    })
})

customerRouter.get('/:id/orders', async (req,res)=>{
    let {id} = req.params;

    DB.query( get_by_id(id), async (err, customer, fields)=>{
        if(err)
            return res.json({error: "Error customer not found for id " + id})

        let orders = await get_by_customer_id_sets_exec(id);
        let order_aggregate = aggregate_by_single_root(orders, "sets", "order");
        console.log(order_aggregate)
        for(let i = 0; i < order_aggregate.length; i++){
            order_aggregate[i].sets = aggregate_by_single_root_ignore_fields(order_aggregate[i].sets, "products","set", 
            ["customer_id", "customer_name", "salesman_id", "salesman_name", "sales_target", "customer_contact", "customer_email"]) 
        }
        customer.testField = "Test"
        console.log(order_aggregate);
        customer.customer_orders = order_aggregate;

        return res.json({customer,orders:order_aggregate});
    });
})

customerRouter.post('', async (req, res)=>{
    let {customer_name, customer_contact, customer_email, salesman_id} = req.body;
    
    let notDefined = noneAreUndefined({customer_name, customer_contact, customer_email, salesman_id})

    if(notDefined.length > 0){
        return res.json({error: notDefined + " are missing from request body"})
    }

    try{

        DB.query(post({customer_name, customer_contact, customer_email, salesman_id}), (err, customer, fields)=>{
            if(err){
                console.log(err)
                return res.json({error: "Error posting customer"});
            }
                
            DB.query(get_by_id(customer.insertId), (error, insertedCustomer, fieldss)=>{
                return res.json({success: true, customer: insertedCustomer[0]});
            })
        }) 
    }catch(err){
        console.log(err)
        return res.json({error: "Error posting customer"});
    }
})

customerRouter.put('/:id', async (req, res)=>{
    // Update product
    let {customer_name, customer_contact, customer_email} = req.body;
    let customer_id = req.params.id;

    let notDefined = noneAreUndefined({customer_name, customer_contact, customer_email, customer_id})

    if(notDefined.length > 0){
        return res.json({error: notDefined + " are missing from request body"})
    }

    try{
        // Update product quantity
        DB.query(put({customer_name, customer_contact, customer_email}, customer_id), (err, customer, fields)=>{
            if(err)
                return res.json({error: "Error updating customer"})
            return res.json({success: true});
        }) 
    }catch(err){
        console.log(err)
        return res.json({error: 'Error updating customer'});
    }
})

// Insert authorize middleware

customerRouter.get("", (req, res)=>{
    DB.query( get_all(), (err, customers, fields)=>{
        if(err)
        return res.json({error:"Error"})

        return res.json(customers);
    });
    
})

customerRouter.delete('/:id', async (req,res)=>{
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

module.exports = customerRouter;