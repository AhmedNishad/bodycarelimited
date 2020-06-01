
export {};

const DB = require('../db')

const key = "customer_id";

const table = "customer";

export const get_all = () => `SELECT * FROM ${table}`

export const get_by_id = (id) => `SELECT * FROM ${table} WHERE ${key} = ${id}`

export const get_customer_by_id = (id) => `SELECT * FROM ${table} WHERE ${key} = ${id}`

export const get_customers_for_salesman = async (salesmanId) => {
    const conn = await DB.connection()
    // Delete all of customers orders from orderset and update quantity
    try{
        let customers = await DB.query(`SELECT * FROM customer WHERE salesman_id = ?`, [salesmanId])
        return customers;
    }catch(err){
        throw err;
    }finally{
        await conn.release()
    }
}

export const post = ({customer_name, customer_contact, customer_email, salesman_id}) => `INSERT INTO ${table} (customer_name, customer_contact, customer_email, salesman_id) values ('${customer_name}', '${customer_contact}',
'${customer_email}', '${salesman_id}')`

export const put = ({customer_name, customer_contact, customer_email}, id) => `UPDATE ${table} SET customer_name = '${customer_name}', customer_contact = '${customer_contact}', customer_email = '${customer_email}' WHERE ${key} = ${id}`

export const remove = (id) => `DELETE FROM ${table} WHERE ${key} = ${id}`

export const removeExec = async (id) => {
    const conn = await DB.connection()
    // Delete all of customers orders from orderset and update quantity
    try{
        await DB.query(`DELETE FROM customer WHERE customer_id = ?`, [id])

        let madeOrders = await DB.query(`SELECT order_id FROM _order WHERE _order.customer_id = ?`, [id])

        await DB.query(`DELETE FROM orderset WHERE orderset.order_id in (?)`, [madeOrders])
    }catch(err){
        throw err;
    }finally{
        await conn.release()
    }
}