var mysql = require('mysql');

var con = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = con;

let dbConfig = {
    connectionLimit: 10, // default 10
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  };

  const pool = mysql.createPool(dbConfig);

  const connection = () => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) reject(err);
        //console.log("MySQL pool connected: threadId " + connection.threadId);
        const query = (sql, binding) => {
            return new Promise((resolve, reject) => {
            connection.query(sql, binding, (err, result) => {
                if (err) reject(err);
                resolve(result);
                });
            });
         };
         const release = () => {
           return new Promise((resolve, reject) => {
             if (err) reject(err);
             console.log("MySQL pool released: threadId " + connection.threadId);
             resolve(connection.release());
           });
         };
         resolve({ query, release });
       });
     });
   };

  const query = (sql, binding) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, binding, (err, result, fields) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  };

  module.exports = { pool, connection, query };