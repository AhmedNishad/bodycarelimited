export {};

const DB = require('../db');

const key = "set_id";

const table = "_set";

export const get_all = () => `SELECT * FROM ${table}`

export const get_all_sets = () => `SELECT product.product_id, product.product_name, product.product_unit_price, product.product_stock_level,
_set.set_id, _set.set_name, _set.set_description, product_set.product_quantity as product_set_quantity,
category.category_name as set_category_name 
FROM product, _set, product_set, category WHERE product.product_id = product_set.product_id and 
_set.set_id = product_set.set_id and category.category_id = _set.set_category_id `

export const get_by_id = (id) => `SELECT * FROM ${table} WHERE ${key} = ${id}`

export const get_by_id_sets = (id) => `SELECT product.product_id, product.product_name, product.product_unit_price, product.product_stock_level,
_set.set_id, _set.set_name, _set.set_description, product_set.product_quantity as product_set_quantity,
category.category_name as set_category_name 
FROM product, _set, product_set, category WHERE product.product_id = product_set.product_id and 
_set.set_id = product_set.set_id and category.category_id = _set.set_category_id and _set.set_id = ${id}`

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

export const post_sets_exec = async (name, description, categoryId, products)=>{

    const conn = await DB.connection();
    
    try{
        await DB.query('Start Transaction');

        let result = await DB.query(`INSERT INTO _set(set_name, set_description, set_category_id) values 
        ("${name}", "${description}", ${categoryId})`);

        let product_tuples: Array<Array<any>> = [];
        products.forEach(p=>{
            product_tuples.push([p.product_id, result.insertId, p.product_set_quantity]);
        })
        await DB.query(`INSERT INTO product_set(product_id, set_id, product_quantity) values ?`, [product_tuples])

        await DB.query('Commit');
    }catch(err){
        await DB.query('Rollback');
        throw err;
    }finally{
        await conn.release();
    }
}

export const put = (name, description, categoryId, setId) => `UPDATE ${table} SET set_name = '${name}', set_description = ${description}, category_id = ${categoryId} WHERE ${key} = ${setId}`;

export const put_sets_exec = async (name, description, categoryId, setId, products)=>{
    const conn = await DB.connection();

    try{
        await DB.query('Start Transaction');

        await DB.query(`UPDATE ${table} SET set_name = "${name}", set_description = "${description}", set_category_id = ${categoryId} WHERE ${key} = ${setId}`);

        // Delete missing ID's from DB

        let existingProductsIds = await DB.query('SELECT product_id FROM product_set WHERE set_id = ?', setId)
        let deleteList: Array<any> = []
        existingProductsIds.forEach(p=>{
            if(products.filter(pr => pr.product_id == p.product_id).length == 0)
                deleteList.push(p.product_id);
        })
        for(let i = 0; i < deleteList.length; i++){
            await DB.query('DELETE FROM product_set WHERE product_id = ?', deleteList[i])
        }
        for(let i = 0; i < products.length; i++){
            let p = products[i];
            let q = `INSERT INTO product_set (product_id, set_id, product_quantity) values 
            (${p.product_id}, ${setId}, ${p.product_set_quantity}) ON DUPLICATE KEY UPDATE product_quantity = 
            ${p.product_set_quantity}`;
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

        await DB.query(`DELETE FROM product_set WHERE set_id = ${id}`)

        await DB.query(`DELETE FROM _set WHERE set_id = ${id}`)

        await DB.query('Commit')
    }catch(err){
        await DB.query('Rollback')
        throw err;
    }finally{
        await conn.release();
    }
}
