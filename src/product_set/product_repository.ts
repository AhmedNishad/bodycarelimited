import { IProduct, IProductVM } from "./product_set_models";
const DB = require('../db');

export {};

const key = "product_id";

const table = "product";

export const get_all = () => `SELECT * FROM ${table}`

export const get_by_id = (id) => `SELECT * FROM ${table} WHERE ${key} = ${id}`

export const post = ({product_name, product_unit_price, product_stock_level}: IProductVM) => `INSERT INTO ${table} (product_name, product_unit_price, product_stock_level) values ('${product_name}', ${product_unit_price},
${product_stock_level})`

export const put = ({product_name, product_unit_price, product_stock_level}: IProductVM, id) => `UPDATE ${table} SET product_name = '${product_name}', product_unit_price = ${product_unit_price}, product_stock_level = ${product_stock_level} WHERE ${key} = ${id}`

export const put_image_url_exec = async (url, id) => {
    const conn = await DB.connection();

    try{
        await DB.query('Start Transaction');

        await DB.query(`UPDATE product SET product_image_url = ? WHERE product_id = ?`, [url, id])

        await DB.query('Commit')
    }catch(err){
        await DB.query('Rollback')
        throw err;
    }finally{
        await conn.release();
    }
}

export const remove = (id) => `DELETE FROM ${table} WHERE ${key} = ${id}`
