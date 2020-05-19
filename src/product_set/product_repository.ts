import { IProduct, IProductVM } from "./product_set_models";

export {};

const key = "product_id";

const table = "product";

export const get_all = () => `SELECT * FROM ${table}`

export const get_by_id = (id) => `SELECT * FROM ${table} WHERE ${key} = ${id}`

export const post = ({product_name, product_unit_price, product_stock_level}: IProductVM) => `INSERT INTO ${table} (product_name, product_unit_price, product_stock_level) values ('${product_name}', ${product_unit_price},
${product_stock_level})`

export const put = ({product_name, product_unit_price, product_stock_level}: IProductVM, id) => `UPDATE ${table} SET product_name = '${product_name}', product_unit_price = ${product_unit_price}, product_stock_level = ${product_stock_level} WHERE ${key} = ${id}`

export const remove = (id) => `DELETE FROM ${table} WHERE ${key} = ${id}`
