export {}
const DB = require('../db') 

export const get_user_exec = async (user_email) => {

    const conn = await DB.connection();

    try{
        const result = await DB.query(`SELECT * FROM _user WHERE user_email = "${user_email}"`)
        return result
    }catch(err){
        throw err;
    }finally{
        await conn.release();
    }
}

export const get_user_by_id_exec = async (user_id) => {

    const conn = await DB.connection();

    try{
        const result = await DB.query(`SELECT * FROM _user WHERE user_id = "${user_id}"`)
        return result
    }catch(err){
        throw err;
    }finally{
        await conn.release();
    }
}

export const post_user_exec = async (user_name, user_email, user_password, user_role) => {

    const conn = await DB.connection();

    try{
        await DB.query('Start Transaction');

        let result = await DB.query(`INSERT INTO _user(user_name, user_email, user_password, user_role) values ("${user_name}",
        "${user_email}", "${user_password}", "${user_role}")`);

        await DB.query("commit");
        return result.insertId
    }catch(err){
        await DB.query('Rollback');
        throw err;
    }finally{
        await conn.release();
    }
}