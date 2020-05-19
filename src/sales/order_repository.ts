import { Interface } from "readline";

export {};

const DB = require('../db');

const key = "order_id";

const table = "_order";

export const get_all = () => `SELECT * FROM ${table}`

export const get_all_sets = () => `SELECT *, c.customer_contact as order_customer_contact, 
c.customer_name as order_customer_name,
sa.salesman_name as order_salesman_name, c.customer_id as order_customer_id,
sa.sales_target as order_salesman_target, sa.salesman_id as order_salesman_id FROM 
_order as o INNER JOIN orderset as os on o.order_id = os.order_id INNER JOIN 
_set as s on s.set_id = os.set_id INNER JOIN product_set as ps on ps.set_id = s.set_id INNER JOIN
product as p on p.product_id = ps.product_id INNER  JOIN customer as c on c.customer_id = o.customer_id
INNER JOIN salesman as sa on sa.salesman_id = o.salesman_id`

export const get_by_id = (id) => `SELECT * FROM ${table} WHERE ${key} = ${id}`

export const get_by_id_sets = (id) => `SELECT *, c.customer_contact as order_customer_contact, 
c.customer_name as order_customer_name,
sa.salesman_name as order_salesman_name, c.customer_id as order_customer_id,
sa.sales_target as order_salesman_target, sa.salesman_id as order_salesman_id FROM 
_order as o INNER JOIN orderset as os on o.order_id = os.order_id INNER JOIN 
_set as s on s.set_id = os.set_id INNER JOIN product_set as ps on ps.set_id = s.set_id INNER JOIN
product as p on p.product_id = ps.product_id INNER  JOIN customer as c on c.customer_id = o.customer_id
INNER JOIN salesman as sa on sa.salesman_id = o.salesman_id WHERE o.order_id = ${id}`

export const post = (name, description, categoryId) => `INSERT INTO ${table}(set_name, set_description, category_id) values ("${name}", "${description}", ${categoryId})`

export const post_sets = (name, description, categoryId, products) => {
    let product_tuples = "";
    products.forEach(p=>{
        product_tuples += ` (${p.product_id}, @inserted_set_id, ${p.product_set_quantity}),`;
    })
    product_tuples = product_tuples.substring(0, product_tuples.length - 1) + "";
    return `SET autocommit = 0;

    Start Transaction;
    
    INSERT INTO _set(set_name, set_description, set_category_id) values 
    ("${name}", "${description}", ${categoryId});
    
    SET @inserted_set_id = LAST_INSERT_ID();

    INSERT INTO product_set(product_id, set_id, product_quantity) values
    ?;
    
    Commit;
    
    SET autocommit = 1;`
}

// Todo - Update Customer, Salesman
export const post_sets_exec = async (date, status, salesmanId, customer_id, sets)=>{

    const conn = await DB.connection();
    
    try{
        await DB.query('Start Transaction');

        let result = await DB.query(`INSERT INTO _order(order_date, order_status, customer_id, salesman_id) values 
        ("${date}", "${status}", ${customer_id}, ${salesmanId})`);

        let set_tuples: Array<Array<any>> = [];

        // Update product quantity
        let existingSets = await DB.query(`SELECT s.set_id, p.product_id, p.product_stock_level, ps.product_quantity FROM 
        _set as s INNER JOIN product_set as ps on ps.set_id = s.set_id INNER JOIN product as p on 
        p.product_id = ps.product_id WHERE s.set_id in (?)`, [sets.map(s => s.set_id)])

        console.log(existingSets)

        let productQuantities: {product_id?:number, product?: any} = {}
        let setQuantities = {}
        sets.forEach(s=>{
            if(!setQuantities[s.set_id])
                setQuantities[s.set_id] = 0
            // Aggregate set quantities
            setQuantities[s.set_id] += s.set_quantity;
            // For insert bit
            set_tuples.push([result.insertId, s.set_id, s.set_quantity]);
        })

        existingSets.forEach(ex => {
            // Aggregate product quantities
            if(!productQuantities[ex.product_id])
                productQuantities[ex.product_id] = {}

            if(!productQuantities[ex.product_id]['newQuantity'])
                productQuantities[ex.product_id]['newQuantity'] = {}
            // Aggregate set quantities
            productQuantities[ex.product_id]['newQuantity'] = setQuantities[ex.set_id] * ex.product_quantity;
            productQuantities[ex.product_id]['stock'] = ex.product_stock_level
        })

        console.log(productQuantities)
        let productEntries = Object.entries(productQuantities)
        for(let [product_id, product] of productEntries){
            let newStock = product.stock - product.newQuantity;
            await DB.query(`UPDATE product SET product_stock_level = ? WHERE product_id = ?`, [newStock, product_id])
        }

        let orderSetInsert = await DB.query(`INSERT INTO orderset(order_id, set_id, set_quantity) values ?`, [set_tuples])

        await DB.query('Commit');
    }catch(err){
        await DB.query('Rollback');
        throw err;
    }finally{
        await conn.release();
    }
}

export const put = (name, description, categoryId, setId) => `UPDATE ${table} SET set_name = '${name}', set_description = ${description}, category_id = ${categoryId} WHERE ${key} = ${setId}`;

export const put_sets_exec = async (order_id, order_date, order_status, salesman_id, customer_id, sets)=>{
    const conn = await DB.connection();

    try{
        await DB.query('Start Transaction');

        await DB.query(`UPDATE ${table} SET order_date = "${order_date}", salesman_id = ${salesman_id},
        order_status = "${order_status}", customer_id = ${customer_id} WHERE ${key} = ${order_id}`);

        let productAggregate: {product?:any} = {}
        let setAggregate: {set?:any} = {}

        let existingSetIds = await DB.query(`SELECT os.order_id, p.product_id ,os.set_id, os.set_quantity, p.product_stock_level, ps.product_quantity
        FROM orderset as os
        INNER JOIN product_set as ps on ps.set_id = os.set_id INNER JOIN product as p on p.product_id = ps.product_id
        WHERE os.order_id = ? OR ps.set_id in (?)`, [order_id, sets.map(s => s.set_id)])
        
        // Delete missing ID's from DB Add Deleted Quantities to Product Stock
         let deleteList: Array<any> = []
        // Existing sets quantity update
        existingSetIds.filter(ex => ex.order_id == order_id).forEach(s => {
            if(!setAggregate[s.set_id])
            setAggregate[s.set_id] = s.set_quantity
        })

        console.log(setAggregate)
        sets.forEach(s => {
            if(!setAggregate[s.set_id]){
                setAggregate[s.set_id] = s.set_quantity
            }
            if(s.set_quantity == setAggregate[s.set_id])
                return;
            setAggregate[s.set_id] = s.set_quantity - setAggregate[s.set_id]
        })
        console.log(setAggregate)
        
         existingSetIds.forEach(s=>{
            if(!productAggregate[s.product_id])
                productAggregate[s.product_id] = {}
            if(!productAggregate[s.product_id]['stock'])
                productAggregate[s.product_id]['stock'] = s.product_stock_level
            if(!productAggregate[s.product_id]['quantityToBeAdded'])
                productAggregate[s.product_id]['quantityToBeAdded'] = 0

            if(s.order_id == order_id){
                if(sets.filter(se => se.set_id == s.set_id).length == 0 && !deleteList.includes(s.set_id)){
                    deleteList.push(s.set_id);
                }
                productAggregate[s.product_id]['quantityToBeAdded'] += s.product_quantity * s.set_quantity
                return;
            }
            productAggregate[s.product_id]['quantityToBeAdded'] = setAggregate[s.set_id] * s.product_quantity  
        })
        console.log(productAggregate)
        
        let productEntries = Object.entries(productAggregate)
        for(let [product_id, product] of productEntries){
            let newStock = product.stock - product.quantityToBeAdded;
            if(newStock < 0){
                throw new Error(`${product_id} has ${-1 * newStock} too many products in order`)
            }
            await DB.query(`UPDATE product SET product_stock_level = ? WHERE product_id = ?`, [newStock, product_id])
        }

        // New sets quantity update

        for(let i = 0; i < deleteList.length; i++){
            await DB.query('DELETE FROM orderset WHERE set_id = ?', deleteList[i])
        }
        for(let i = 0; i < sets.length; i++){
            let s = sets[i];
            let q = `INSERT INTO orderset (set_id, set_quantity, order_id) values 
            (${s.set_id}, ${s.set_quantity}, ${order_id}) ON DUPLICATE KEY UPDATE set_quantity = 
            ${s.set_quantity}`;
            await DB.query(q)
        }

        await DB.query("commit");
    }catch(err){
        await DB.query('Rollback');
        throw err;
    }finally{
        await conn.release();
    }
}

export const remove = (id) => `DELETE FROM ${table} WHERE ${key} = ${id}`

export const remove_set_exec = async (id) => {
    const conn = await DB.connection();

    try{
        await DB.query('Start Transaction');

        interface ProductUpdate{
            deleted?: number,
            stock?: number,
            newQuantity?: number
        }
        interface QuantitySet{
            productId?: number,
            product?: ProductUpdate
        }

        let products:QuantitySet = {};

        let existingSets = await DB.query(`SELECT p.product_id, p.product_stock_level ,os.set_quantity, ps.product_quantity FROM orderset as os
        INNER JOIN _set as s on s.set_id = os.set_id INNER JOIN product_set as ps
        on ps.set_id = s.set_id INNER JOIN product as p on p.product_id = ps.product_id WHERE os.order_id = ?`, [id])

        console.log(existingSets)

        existingSets.forEach(es => {
            if(!products[es.product_id])
                products[es.product_id] = {}
            if(!products[es.product_id]['deleted'])
                products[es.product_id]['deleted'] = 0
            products[es.product_id]['deleted'] += (es.set_quantity * es.product_quantity)
            products[es.product_id]['stock'] = es.product_stock_level
        })

        console.log(products)

        Object.values(products).forEach((p:any) => {
            p.newQuantity = p.stock + p.deleted
        })

        console.log(products)

        await DB.query(`DELETE FROM orderset WHERE order_id = ${id}`)

        await DB.query(`DELETE FROM _order WHERE order_id = ${id}`)

        let productEntries = Object.entries(products)

        for(let [product_id, newQuantity] of productEntries){
            await DB.query(`UPDATE product SET product_stock_level = ? WHERE product_id = ?`, [newQuantity.newQuantity, product_id])
        }

        await DB.query('Commit')
    }catch(err){
        await DB.query('Rollback')
        throw err;
    }finally{
        await conn.release();
    }
}
