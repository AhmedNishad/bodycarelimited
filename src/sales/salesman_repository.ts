
export {};

const DB = require('../db')

const key = "salesman_id";

const table = "salesman";

export const get_all = () => `SELECT * FROM ${table}`

export const get_by_id = (id) => `SELECT * FROM ${table} WHERE ${key} = ${id}`

export const post = ({salesman_name, sales_target}) => `INSERT INTO ${table} (salesman_name, sales_target) values ('${salesman_name}', '${sales_target}')`

export const post_sales_user_exec = async ({salesman_name, user_id}) => {
    const conn = await DB.connection()
    // Delete all of customers orders from orderset and update quantity
    try{
        await DB.query(`INSERT INTO salesman (salesman_name, user_id) values ('?', '?')`, [salesman_name, user_id])
    }catch(err){
        throw err;
    }finally{
        await conn.release()
    }
}

export const put = ({salesman_name, sales_target}, id) => `UPDATE ${table} SET salesman_name = '${salesman_name}', sales_target = '${sales_target}' WHERE ${key} = ${id}`

export const remove = (id) => `DELETE FROM ${table} WHERE ${key} = ${id}`

export const removeExec = async (id) => {
    const conn = await DB.connection()
    // Delete all of customers orders from orderset and update quantity
    try{
        await DB.query(`DELETE FROM salesman WHERE salesman_id = ?`, [id])

        let madeOrders = await DB.query(`SELECT order_id FROM _order WHERE _order.salesman_id = ?`, [id])

        await DB.query(`DELETE FROM orderset WHERE orderset.order_id in (?)`, [madeOrders])
    }catch(err){
        throw err;
    }finally{
        await conn.release()
    }
}